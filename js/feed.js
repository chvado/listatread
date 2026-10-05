// js/feed.js
import { supabase } from './supabase.js'

/* ============================================================
   РЕКОМЕНДАТЕЛЬНАЯ СИСТЕМА
   - Загружает посты через серверный RPC get_recommended_posts
   - Тасует внутри бакетов по 25 — порядок каждый раз новый
   - Убирает "3 подряд от одного автора" (diversity)
   - Отсеивает посты без канала (live-chat в рекомендации не идут)
   - Fallback на клиентский скоринг, если RPC недоступен
============================================================ */

const MAX_AUTHOR_STREAK = 2        // не более N подряд от одного автора
const BUCKET_SIZE       = 25       // размер бакета для перемешивания
const PROFILE_TTL       = 10 * 60 * 1000   // кэш профиля интересов 10 мин

let _profileCache = null
let _profileCachedAt = 0

/* ============================================================
   ПУБЛИЧНОЕ API
============================================================ */

export async function loadPosts(userId){
    let list = []

    if(userId){
        try {
            const { data, error } = await supabase
                .rpc('get_recommended_posts', { p_user_id: userId, p_limit: 500 })
            if(error) throw error
            // Только посты каналов (не live-chat)
            list = (data || []).filter(p => p.channel_id)
        } catch(e){
            console.warn('[recommendations] RPC fallback:', e.message)
            list = await loadPostsClientSide(userId)
            return finalize(list)
        }
    } else {
        list = await loadPostsClientSide(userId)
    }

    return finalize(list)
}

/* Финальная обработка: bucket-shuffle + diversity */
function finalize(list){
    if(!list?.length) return []
    const shuffled = bucketShuffle(list, BUCKET_SIZE)
    return diversify(shuffled, MAX_AUTHOR_STREAK)
}

/* ============================================================
   ПЕРЕМЕШИВАНИЕ ВНУТРИ БАКЕТОВ
   SQL отдаёт список, отсортированный по качеству (score).
   Мы сохраняем эту сортировку, но внутри каждых 25 элементов
   делаем случайную перестановку (Fisher-Yates). Так:
   - Топ-25 всегда лучше, чем всё остальное
   - Внутри топ-25 порядок разный при каждом вызове
============================================================ */
function bucketShuffle(posts, size){
    if(!posts?.length) return posts || []
    const out = []
    for(let i = 0; i < posts.length; i += size){
        const chunk = posts.slice(i, i + size)
        for(let j = chunk.length - 1; j > 0; j--){
            const k = Math.floor(Math.random() * (j + 1))
            const tmp = chunk[j]; chunk[j] = chunk[k]; chunk[k] = tmp
        }
        out.push(...chunk)
    }
    return out
}

/* Diversity: не более maxStreak подряд от одного автора */
export function diversify(posts, maxStreak = 2){
    const pool = [...posts]
    const result = []
    let lastAuthor = null, streak = 0
    while (pool.length){
        let idx = pool.findIndex(p => (p.author_id !== lastAuthor) || streak < maxStreak)
        if (idx < 0) idx = 0
        const [p] = pool.splice(idx, 1)
        result.push(p)
        if (p.author_id === lastAuthor) streak++
        else { lastAuthor = p.author_id; streak = 1 }
    }
    return result
}

/* ============================================================
   CLIENT-SIDE FALLBACK (если RPC недоступен)
============================================================ */
async function loadPostsClientSide(userId){
    const profile = userId ? await buildInterestProfile(userId) : emptyProfile()

    const { data, error } = await supabase
        .from('posts')
        .select(`id, content, media_url, media_title, created_at, author_id, channel_id,
                 profiles ( username, full_name, avatar_url )`)
        .not('channel_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(500)
    if (error) throw error
    if (!data?.length) return []

    const ids = data.map(p => p.id)
    const [{ data: likes }, { data: comments }, { data: reposts }] = await Promise.all([
        supabase.from('likes').select('post_id').in('post_id', ids),
        supabase.from('comments').select('post_id').in('post_id', ids),
        supabase.from('reposts').select('post_id').in('post_id', ids)
    ])

    const stats = {}
    ids.forEach(id => stats[id] = { likes: 0, comments: 0, reposts: 0 })
    ;(likes    || []).forEach(l => stats[l.post_id] && stats[l.post_id].likes++)
    ;(comments || []).forEach(c => stats[c.post_id] && stats[c.post_id].comments++)
    ;(reposts  || []).forEach(r => stats[r.post_id] && stats[r.post_id].reposts++)

    const scored = data.map(p => ({ ...p, _score: scorePost(p, stats[p.id] || {}, profile) }))
    scored.sort((a, b) => b._score - a._score)
    return scored
}

/* ============================================================
   ПРОФИЛЬ ИНТЕРЕСОВ ПОЛЬЗОВАТЕЛЯ
   Кэшируется на PROFILE_TTL, чтобы не грузить БД при каждом скролле
============================================================ */
function emptyProfile(){
    return {
        authorAffinity:    new Map(),
        channelAffinity:   new Map(),
        followedAuthors:   new Set(),
        subscribedChannels:new Set()
    }
}

async function buildInterestProfile(userId){
    if(_profileCache && Date.now() - _profileCachedAt < PROFILE_TTL) return _profileCache

    const [likes, reposts, comments, follows, subs] = await Promise.all([
        supabase.from('likes').select('post_id, posts:post_id(author_id, channel_id)').eq('user_id', userId).limit(500),
        supabase.from('reposts').select('post_id, posts:post_id(author_id, channel_id)').eq('user_id', userId).limit(500),
        supabase.from('comments').select('post_id, posts:post_id(author_id, channel_id)').eq('user_id', userId).limit(500),
        supabase.from('follows').select('following_id').eq('follower_id', userId).limit(500),
        supabase.from('subscriptions').select('channel_id').eq('follower_id', userId).limit(500)
    ])

    const authorAffinity  = new Map()
    const channelAffinity = new Map()

    const bump = (map, key, w = 1) => {
        if (!key) return
        map.set(key, (map.get(key) || 0) + w)
    }

    const addFrom = (rows, weight) => {
        (rows || []).forEach(r => {
            const p = r.posts
            if (!p) return
            bump(authorAffinity,  p.author_id,  weight)
            if (p.channel_id) bump(channelAffinity, p.channel_id, weight)
        })
    }

    addFrom(likes,    1)
    addFrom(reposts,  2)
    addFrom(comments, 2)

    _profileCache = {
        authorAffinity,
        channelAffinity,
        followedAuthors:    new Set((follows || []).map(f => f.following_id)),
        subscribedChannels: new Set((subs    || []).map(s => s.channel_id))
    }
    _profileCachedAt = Date.now()
    return _profileCache
}

/* ============================================================
   СКОРИНГ ОДНОГО ПОСТА (используется только в fallback-ветке)
============================================================ */
export function scorePost(post, stats, profile){
    const W = {
        like: 1, comment: 2, repost: 3,
        followAuthor:     30,
        subscribeChannel: 50,
        affinityAuthor:   3,
        affinityChannel:  5,
        halfLifeHours:    168,   // неделя
        randomBoost:      5
    }

    const ageHours = (Date.now() - new Date(post.created_at).getTime()) / 3.6e6
    const baseEngagement =
        (stats.likes    || 0) * W.like +
        (stats.comments || 0) * W.comment +
        (stats.reposts  || 0) * W.repost

    const decay = Math.exp(-ageHours / W.halfLifeHours)
    let score = baseEngagement * decay

    if (profile.followedAuthors.has(post.author_id))            score += W.followAuthor
    if (post.channel_id && profile.subscribedChannels.has(post.channel_id)) score += W.subscribeChannel

    score += (profile.authorAffinity.get(post.author_id)  || 0) * W.affinityAuthor
    if (post.channel_id) {
        score += (profile.channelAffinity.get(post.channel_id) || 0) * W.affinityChannel
    }

    score += Math.random() * W.randomBoost
    return score
}

/* ============================================================
   СОЗДАНИЕ ПОСТА
============================================================ */
export async function createPost(content){
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Не авторизован')

    const { data, error } = await supabase
        .from('posts')
        .insert({ content, author_id: user.id })
        .select()
        .single()

    if (error) throw error
    invalidateProfileCache()
    return data
}

/* ============================================================
   УТИЛИТЫ
============================================================ */
export function invalidateProfileCache(){
    _profileCache = null
    _profileCachedAt = 0
}