// js/feed.js
import { supabase } from './supabase.js'

const DAY = 864e5
const K_PROF = 'lt_rec_profile_v2'
const K_SEEN = 'lt_rec_seen_v2'
const SERVER_TTL = 10 * 60 * 1000
const STOP = new Set(('это как что так для или при про его она они были быть есть нет еще ещё уже тоже очень только после перед между чтобы тебя меня мне вас вам себя этот этой этих all the and for you with that this have from').split(' '))

const ls = {
    get(k, d){ try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d } catch { return d } },
    set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
}

let _user = null, _prof = null, _seen = null, _server = null, _serverAt = 0, _saveT = null

/* ============================================================
   ЛОКАЛЬНЫЙ ПРОФИЛЬ ИНТЕРЕСОВ (a=авторы, c=каналы, t=типы, w=слова)
============================================================ */
function ensure(uid){
    uid = uid || 'anon'
    if(_user === uid && _prof) return
    _user = uid
    _prof = ls.get(K_PROF + ':' + uid, null) || { ts: Date.now(), a: {}, c: {}, t: {}, w: {} }
    const days = (Date.now() - (_prof.ts || Date.now())) / DAY
    if(days > 0.05){
        const f = Math.pow(0.97, days)                    // забывание ~3% в сутки
        for(const m of ['a', 'c', 't', 'w']) for(const k in _prof[m]){
            _prof[m][k] *= f
            if(Math.abs(_prof[m][k]) < 0.05) delete _prof[m][k]
        }
        _prof.ts = Date.now()
    }
    _seen = ls.get(K_SEEN + ':' + uid, {})
}
function bump(map, key, w){
    if(!key) return
    map[key] = Math.max(-20, Math.min(40, (map[key] || 0) + w))
}
function save(){
    clearTimeout(_saveT)
    _saveT = setTimeout(() => {
        const keys = Object.keys(_prof.w)
        if(keys.length > 300){
            keys.sort((a, b) => Math.abs(_prof.w[b]) - Math.abs(_prof.w[a]))
            const keep = {}; keys.slice(0, 250).forEach(k => keep[k] = _prof.w[k]); _prof.w = keep
        }
        ls.set(K_PROF + ':' + _user, _prof)
        const ids = Object.keys(_seen)
        if(ids.length > 700){
            ids.sort((a, b) => Math.abs(_seen[a]) - Math.abs(_seen[b]))
            ids.slice(0, ids.length - 600).forEach(id => delete _seen[id])
        }
        ls.set(K_SEEN + ':' + _user, _seen)
    }, 400)
}

function mediaType(url){
    if(!url) return 'text'
    const u = url.split('?')[0].toLowerCase()
    if(/\.(mp4|webm|mov|m4v)$/.test(u)) return 'video'
    if(/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(u)) return 'audio'
    return 'image'
}
function tokenize(text){
    if(!text) return []
    const s = text.toLowerCase(), out = []
    ;(s.match(/#[\p{L}\p{N}_]{2,}/gu) || []).forEach(h => out.push(h, h))
    ;(s.match(/[\p{L}]{4,}/gu) || []).forEach(w => { if(!STOP.has(w)) out.push(w) })
    return [...new Set(out)].slice(0, 14)
}

/* ============================================================
   ПУБЛИЧНЫЕ СИГНАЛЫ (вызываются из main.js)
============================================================ */
export function recordSignal({ authorId, channelId, type, text }, weight){
    ensure(_user)
    bump(_prof.a, authorId, weight)
    bump(_prof.c, channelId, weight * 0.8)
    bump(_prof.t, type, weight * 0.5)
    tokenize(text).forEach(t => bump(_prof.w, t, weight * 0.3))
    save()
}
export function recordWatch({ postId, authorId, channelId, type, text, ms, dur }){
    let w = 0
    if(type === 'video' && dur > 0){
        const r = ms / dur
        w = r >= 1.5 ? 2.5 : r >= 0.8 ? 2 : r >= 0.4 ? 1 : r < 0.12 ? -1.2 : 0
    } else {
        w = ms > 6000 ? 1 : ms > 2500 ? 0.4 : ms < 700 ? -0.4 : 0
    }
    if(w) recordSignal({ authorId, channelId, type, text }, w)
}
export function markSeen(ids){
    ensure(_user)
    const now = Date.now()
    ;(ids || []).forEach(id => { if(_seen[id] === undefined || _seen[id] > 0) _seen[id] = now })
    save()
}
export function markNotInterested(meta){
    ensure(_user)
    recordSignal(meta, -4)
    if(meta.postId) _seen[meta.postId] = -Date.now()       // отрицательное = исключён навсегда
    save()
}
export function invalidateProfileCache(){ _server = null; _serverAt = 0 }

/* ============================================================
   СЕРВЕРНЫЕ (явные) СИГНАЛЫ
============================================================ */
async function serverProfile(userId){
    if(_server && Date.now() - _serverAt < SERVER_TTL) return _server
    const q = tbl => supabase.from(tbl).select('post_id, posts:post_id(author_id, channel_id, media_url, content)').eq('user_id', userId).limit(300)
    const safe = p => p.then(r => r.data || []).catch(() => [])
    const [likes, reposts, comments, saved, follows, subs] = await Promise.all([
        safe(q('likes')), safe(q('reposts')), safe(q('comments')), safe(q('saved_tracks')),
        safe(supabase.from('follows').select('following_id').eq('follower_id', userId).limit(500)),
        safe(supabase.from('subscriptions').select('channel_id').eq('follower_id', userId).limit(500))
    ])
    const s = { a: {}, c: {}, t: {}, w: {}, followed: new Set(follows.map(f => f.following_id)), subs: new Set(subs.map(x => x.channel_id)), n: 0 }
    const add = (rows, wt) => rows.forEach(r => {
        const p = r.posts; if(!p) return
        s.n++
        bump(s.a, p.author_id, wt); bump(s.c, p.channel_id, wt * 0.8); bump(s.t, mediaType(p.media_url), wt * 0.5)
        tokenize(p.content).forEach(t => bump(s.w, t, wt * 0.3))
    })
    add(likes, 1); add(reposts, 2); add(comments, 2); add(saved, 3)
    _server = s; _serverAt = Date.now()
    return s
}
async function exclusions(userId){
    const out = { channels: new Set(), authors: new Set() }
    const safe = p => p.then(r => r.data || []).catch(() => [])
    const [hc, ha, b1, b2] = await Promise.all([
        safe(supabase.from('hidden_channels').select('channel_id').eq('user_id', userId)),
        safe(supabase.from('hidden_authors').select('author_id').eq('user_id', userId)),
        safe(supabase.from('blocks').select('blocked_id').eq('blocker_id', userId)),
        safe(supabase.from('blocks').select('blocker_id').eq('blocked_id', userId))
    ])
    hc.forEach(x => out.channels.add(x.channel_id)); ha.forEach(x => out.authors.add(x.author_id))
    b1.forEach(x => out.authors.add(x.blocked_id)); b2.forEach(x => out.authors.add(x.blocker_id))
    return out
}

/* ============================================================
   КАНДИДАТЫ
============================================================ */
const COLS = 'id, content, media_url, media_title, created_at, author_id, channel_id, poll'

async function fetchCandidates(srv){
    const top = (m, n) => Object.entries(m).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k)
    const favCh = top({ ...srv.c, ..._prof.c }, 10)
    const subs = [...srv.subs].slice(0, 60), fol = [...srv.followed].slice(0, 60)
    const base = () => supabase.from('posts').select(COLS).not('channel_id', 'is', null)
    const run = p => p.then(r => r.data || []).catch(() => [])
    const weekAgo = new Date(Date.now() - 7 * DAY).toISOString()
    const jobs = [
        run(base().order('created_at', { ascending: false }).limit(250)),
        run(base().lt('created_at', weekAgo).order('created_at', { ascending: false }).limit(100))
    ]
    if(subs.length) jobs.push(run(base().in('channel_id', subs).order('created_at', { ascending: false }).limit(150)))
    if(fol.length)  jobs.push(run(base().in('author_id', fol).order('created_at', { ascending: false }).limit(100)))
    if(favCh.length) jobs.push(run(base().in('channel_id', favCh).order('created_at', { ascending: false }).limit(100)))
    const lists = await Promise.all(jobs)
    const map = new Map()
    lists.flat().forEach(p => { if(p.channel_id && !map.has(p.id)) map.set(p.id, p) })
    return [...map.values()]
}

async function fetchStats(ids){
    const stats = {}; ids.forEach(id => stats[id] = { likes: 0, comments: 0, reposts: 0 })
    const chunks = []; for(let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100))
    const jobs = []
    chunks.forEach(ch => ['likes', 'comments', 'reposts'].forEach(t =>
        jobs.push(supabase.from(t).select('post_id').in('post_id', ch)
            .then(r => (r.data || []).forEach(x => { if(stats[x.post_id]) stats[x.post_id][t]++ }))
            .catch(() => {}))))
    await Promise.all(jobs)
    return stats
}

/* ============================================================
   СКОРИНГ
============================================================ */
const sq = x => Math.tanh(x / 8)

export function scorePost(post, st, ctx){
    const ageH = Math.max(0, (ctx.now - new Date(post.created_at).getTime()) / 3.6e6)
    const eng = st.likes + 2.5 * st.comments + 4 * st.reposts
    const vel = eng / Math.pow(ageH + 2, 0.7)
    const velN = Math.min(vel / ctx.p95, 1.5) * 8
    const fresh = 6 * Math.exp(-ageH / 48)
    const quality = Math.log1p(eng) * 0.8

    const type = mediaType(post.media_url)
    const A = ctx.p.a[post.author_id] || 0, C = ctx.p.c[post.channel_id] || 0, T = ctx.p.t[type] || 0
    const toks = tokenize(post.content)
    const W = toks.length ? toks.reduce((s, t) => s + (ctx.p.w[t] || 0), 0) / Math.sqrt(toks.length) : 0
    const aff = 7 * sq(A) + 6 * sq(C) + 3 * sq(T) + 4 * sq(W)

    let social = 0
    if(ctx.srv.followed.has(post.author_id)) social += 5
    if(ctx.srv.subs.has(post.channel_id)) social += 6

    let score = velN + fresh + quality + aff + social + Math.random() * 2.5

    const t = ctx.seen[post.id]
    if(t){
        const h = (ctx.now - Math.abs(t)) / 3.6e6
        score *= h < 6 ? 0.03 : h < 24 ? 0.12 : h < 72 ? 0.35 : 0.7
    }
    if(post.author_id === ctx.me) score *= 0.4
    return { score: Math.max(score, 0.01), vel: velN, aff: A ? sq(A) + sq(C) : sq(C), age: ageH }
}

function shuffle(a){
    a = [...a]
    for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
    return a
}

/* Разнообразие: автор не чаще раза в 4, не 3 подряд из одного канала/типа */
export function diversify(posts){
    const pool = [...posts], out = []
    const tp = p => mediaType(p.media_url)
    while(pool.length){
        const last = out.slice(-3), l1 = out[out.length - 1], l2 = out[out.length - 2]
        const strict = p =>
            !last.some(r => r.author_id === p.author_id) &&
            !(l1 && l2 && l1.channel_id === p.channel_id && l2.channel_id === p.channel_id) &&
            !(last.length === 3 && last.every(r => tp(r) === tp(p)))
        let idx = pool.slice(0, 40).findIndex(strict)
        if(idx < 0) idx = pool.slice(0, 40).findIndex(p => !l1 || p.author_id !== l1.author_id)
        if(idx < 0) idx = 0
        out.push(pool.splice(idx, 1)[0])
    }
    return out
}

function assemble(items, cold){
    const byScore = [...items].sort((a, b) => b._score - a._score)
    const trending = items.filter(p => p._age < 168).sort((a, b) => b._vel - a._vel)
    const explore = shuffle(items.filter(p => p._aff <= 0.5))
    const used = new Set(), out = []
    const ptr = { P: 0, T: 0, E: 0 }
    const src = { P: byScore, T: trending, E: explore }
    const pull = k => {
        const arr = src[k]
        while(ptr[k] < arr.length){ const p = arr[ptr[k]++]; if(!used.has(p.id)){ used.add(p.id); return p } }
        return null
    }
    const pat = cold ? 'TPTEPTPETP' : 'PPPPTPPEPT'
    let guard = items.length * 3
    while(out.length < items.length && guard-- > 0){
        const k = pat[out.length % 10]
        const p = pull(k) || pull('P') || pull('T') || pull('E')
        if(!p) break
        out.push(p)
    }
    return diversify(out)
}

/* ============================================================
   ГЛАВНАЯ ФУНКЦИЯ
============================================================ */
export async function loadPosts(userId){
    ensure(userId || 'anon')
    const emptySrv = { a: {}, c: {}, t: {}, w: {}, followed: new Set(), subs: new Set(), n: 0 }
    const [srv, ex] = await Promise.all([
        userId ? serverProfile(userId) : Promise.resolve(emptySrv),
        userId ? exclusions(userId) : Promise.resolve({ channels: new Set(), authors: new Set() })
    ])
    let cands = await fetchCandidates(srv)
    cands = cands.filter(p => !ex.channels.has(p.channel_id) && !ex.authors.has(p.author_id) && !(_seen[p.id] < 0))
    if(!cands.length) return []

    const stats = await fetchStats(cands.map(p => p.id))
    const vels = cands.map(p => {
        const s = stats[p.id], age = (Date.now() - new Date(p.created_at).getTime()) / 3.6e6
        return (s.likes + 2.5 * s.comments + 4 * s.reposts) / Math.pow(age + 2, 0.7)
    }).sort((a, b) => a - b)
    const p95 = Math.max(vels[Math.floor(vels.length * 0.95)] || 0, 0.5)

    // объединённый профиль: локальный + 0.5 * серверный
    const merged = { a: { ..._prof.a }, c: { ..._prof.c }, t: { ..._prof.t }, w: { ..._prof.w } }
    for(const m of ['a', 'c', 't', 'w']) for(const k in srv[m]) merged[m][k] = (merged[m][k] || 0) + srv[m][k] * 0.5

    const ctx = { now: Date.now(), p95, p: merged, srv, seen: _seen, me: userId }
    const scored = cands.map(p => {
        const r = scorePost(p, stats[p.id], ctx)
        return { ...p, _score: r.score, _vel: r.vel, _aff: r.aff, _age: r.age }
    })
    const signalMass = Object.values(_prof.a).reduce((s, v) => s + Math.abs(v), 0) + srv.n
    return assemble(scored, signalMass < 6)
}

/* ============================================================
   СОЗДАНИЕ ПОСТА
============================================================ */
export async function createPost(content){
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error('Не авторизован')
    const { data, error } = await supabase.from('posts').insert({ content, author_id: user.id }).select().single()
    if(error) throw error
    invalidateProfileCache()
    return data
}