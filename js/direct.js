/* ============================================================
   listatread — direct.js
   Директ (личные сообщения) — стиль Telegram
============================================================ */
import { supabase } from './supabase.js'

const $ = id => document.getElementById(id)
const esc = t => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML }
const av = (url, name) => url ? `<img src="${url}" alt="">` : (name||'?').charAt(0).toUpperCase()

const D = {
    tab: 'direct',
    editMode: false,
    chats: [],
    currentChat: null,        // { peerId, peerProfile }
    refreshTimer: null,
    allUsersCache: null
}

/* ============================================================
   ПОСТРОЕНИЕ ЭКРАНА
============================================================ */
export function buildDirectScreen(){
    if($('screen-direct')) return $('screen-direct')
    const s = document.createElement('section')
    s.id = 'screen-direct'
    s.className = 'app-screen'
    s.innerHTML = `
        <header class="topbar">
            <button class="topbar-btn" id="direct-menu-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
            <div class="topbar-logo-static">listadirect</div>
            <button class="topbar-btn" id="direct-edit-btn" aria-label="Изменить">
                <svg class="icon-pencil" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>
                <svg class="icon-x hidden" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </header>
        <div class="direct-tabs">
            <button class="direct-tab active" data-dtab="direct">Директ</button>
            <button class="direct-tab" data-dtab="groups">Группы</button>
        </div>
        <div class="direct-list" id="direct-list"></div>
    `
    document.getElementById('main-app').appendChild(s)

    s.querySelector('#direct-menu-btn').addEventListener('click', openDirectMenu)
    s.querySelector('#direct-edit-btn').addEventListener('click', toggleDirectEdit)
    s.querySelectorAll('.direct-tab').forEach(t => t.addEventListener('click', () => {
        s.querySelectorAll('.direct-tab').forEach(x => x.classList.remove('active'))
        t.classList.add('active')
        D.tab = t.dataset.dtab
        loadDirectChats()
    }))
    return s
}

export function openDirectTab(){
    buildDirectScreen()
    // закрыть всё, активировать
    document.querySelectorAll('.app-screen').forEach(x => x.classList.remove('active'))
    $('screen-direct').classList.add('active')
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    if (D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => { if ($('screen-direct')?.classList.contains('active')) loadDirectChats(true) }, 5000)
    loadDirectChats()
    window.scrollTo(0,0)
}

/* ============================================================
   РЕЖИМ РЕДАКТИРОВАНИЯ
============================================================ */
function toggleDirectEdit(){
    D.editMode = !D.editMode
    const btn = $('direct-edit-btn')
    btn.querySelector('.icon-pencil').classList.toggle('hidden', D.editMode)
    btn.querySelector('.icon-x').classList.toggle('hidden', !D.editMode)
    document.querySelectorAll('.direct-item-dots').forEach(d => d.classList.toggle('hidden', !D.editMode))
}

/* ============================================================
   МЕНЮ (гамбургер)
============================================================ */
function openDirectMenu(){
    window.showActionSheet('Меню директа', [
        { label:'Настройки чатов', icon:'⚙️', onClick: () => window.showToast('info','Скоро',{icon:'⚙️'}) },
        { label:'Найти пользователя', icon:'🔎', onClick: findUserPrompt },
        { label:'Данные и память', icon:'💾', onClick: () => window.showToast('info','Скоро',{icon:'💾'}) },
        { label:'Настройки профиля', icon:'👤', onClick: () => window.switchScreen('settings') },
        { label:'Приватность', icon:'🔒', onClick: () => { window.switchScreen('settings'); window.switchSettingsTab('privacy') } },
        { label:'Приложения', icon:'📱', onClick: () => window.showToast('info','Скоро',{icon:'📱'}) }
    ])
}

async function findUserPrompt(){
    const q = prompt('Введите @ник или имя пользователя')
    if(!q) return
    const term = q.replace(/^@/,'').trim()
    const { data } = await supabase.from('profiles')
        .select('id, username, full_name, avatar_url, status')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`).limit(15)
    if(!data?.length){ window.showToast('error','Никого не нашли',{icon:'⚠️'}); return }
    window.showActionSheet('Пользователи', data.map(p => ({
        label: `${p.full_name || p.username} @${p.username}`,
        icon: `<span class="feed-more-menu-avatar">${av(p.avatar_url, p.full_name||p.username)}</span>`,
        onClick: () => openDirectChat(p.id, p)
    })))
}

/* ============================================================
   ЗАГРУЗКА СПИСКА ЧАТОВ
============================================================ */
async function loadDirectChats(silent = false){
    const box = $('direct-list')
    if(!silent) box.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span></div>'

    const { data:{ user } } = await supabase.auth.getUser()
    if(!user){ box.innerHTML = '<p class="empty">Войдите</p>'; return }

    // получаем всех собеседников (кто мне писал / кому я писал)
    const { data: msgs } = await supabase.from('direct_messages')
        .select('id, from_id, to_id, content, media_url, media_type, is_read, created_at')
        .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
        .order('created_at', { ascending:false })
        .limit(500)

    if(!msgs?.length){ box.innerHTML = `<p class="empty">Нет чатов. Начните общение.</p>`; return }

    // группируем по собеседнику
    const byPeer = new Map()
    for(const m of msgs){
        const peerId = m.from_id === user.id ? m.to_id : m.from_id
        if(!byPeer.has(peerId)){
            byPeer.set(peerId, { peerId, lastMsg: m, unread: 0 })
        }
        if(m.to_id === user.id && !m.is_read) byPeer.get(peerId).unread++
    }

    // подгружаем профили
    const ids = [...byPeer.keys()]
    const { data: profs } = await supabase.from('profiles')
        .select('id, username, full_name, avatar_url, status, status_emoji')
        .in('id', ids)
    const pm = Object.fromEntries((profs||[]).map(p => [p.id, p]))

    D.chats = ids.map(id => ({ ...byPeer.get(id), profile: pm[id] || {} }))
        .sort((a,b) => new Date(b.lastMsg.created_at) - new Date(a.lastMsg.created_at))

    renderChats()
}

function renderChats(){
    const box = $('direct-list')
    if(!D.chats.length){ box.innerHTML = '<p class="empty">Нет чатов</p>'; return }

    box.innerHTML = D.chats.map(c => {
        const p = c.profile || {}
        const name = p.full_name || p.username || 'Пользователь'
        const uname = '@' + (p.username || 'user')
        const emoji = p.status_emoji || p.status || '👋'
        const last = c.lastMsg
        let preview = ''
        if(last.media_type === 'video') preview = '🎬 Видео'
        else if(last.media_type === 'audio') preview = '🎵 Аудио'
        else if(last.media_type === 'image') preview = '📷 Фото'
        else if(last.media_type === 'post') preview = '📎 Пост'
        else if(last.media_type === 'profile') preview = '👤 Профиль'
        else preview = last.content || ''
        if(preview.length > 28) preview = preview.slice(0, 28) + '…'
        const dt = new Date(last.created_at)
        const dateStr = dt.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' })

        return `<div class="direct-item" data-peer="${c.peerId}">
            <div class="direct-item-avatar">${av(p.avatar_url, name)}<span class="direct-item-status">${emoji}</span></div>
            <div class="direct-item-info">
                <div class="direct-item-name">${esc(name)}</div>
                <div class="direct-item-preview">${esc(preview)}</div>
            </div>
            <div class="direct-item-right">
                <div class="direct-item-date">${dateStr}</div>
                ${c.unread ? `<div class="direct-item-badge">${c.unread}</div>` : ''}
            </div>
            <button class="direct-item-dots ${D.editMode?'':'hidden'}" data-dots="${c.peerId}">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
            </button>
        </div>`
    }).join('')

    box.querySelectorAll('.direct-item').forEach(el => {
        el.addEventListener('click', e => {
            if(e.target.closest('[data-dots]')) return
            const peerId = el.dataset.peer
            const c = D.chats.find(x => x.peerId === peerId)
            if(c) openDirectChat(peerId, c.profile)
        })
    })
    box.querySelectorAll('[data-dots]').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation()
        openChatActions(btn.dataset.dots)
    }))
}

/* ============================================================
   ДЕЙСТВИЯ НАД ЧАТОМ (3 точки)
============================================================ */
async function openChatActions(peerId){
    const { data:{ user } } = await supabase.auth.getUser()
    const { data:blockRow } = await supabase.from('blocks')
        .select('id').eq('blocker_id', user.id).eq('blocked_id', peerId).maybeSingle()
    const isBlocked = !!blockRow
    const { data:muteRow } = await supabase.from('direct_mutes')
        .select('id').eq('user_id', user.id).eq('peer_id', peerId).maybeSingle()
    const isMuted = !!muteRow

    window.showActionSheet('Действия', [
        { label:'Удалить чат', icon:'🗑', danger:true, onClick: () => deleteChat(peerId) },
        { label: isBlocked ? 'Разблокировать' : 'Заблокировать', icon:'🚫', danger:!isBlocked, onClick: () => toggleBlock(peerId, isBlocked) },
        { label: isMuted ? 'Размутить' : 'Дать мут', icon: isMuted ? '🔔' : '🔕', onClick: () => toggleMute(peerId, isMuted) }
    ])
}

async function deleteChat(peerId){
    if(!confirm('Удалить чат? Сообщения будут удалены навсегда')) return
    const { data:{ user } } = await supabase.auth.getUser()
    await supabase.from('direct_messages').delete().or(
        `and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`
    )
    loadDirectChats()
    window.showToast('success','Чат удалён',{icon:'✓'})
}
async function toggleBlock(peerId, isBlocked){
    const { data:{ user } } = await supabase.auth.getUser()
    if(isBlocked) await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', peerId)
    else await supabase.from('blocks').insert({ blocker_id:user.id, blocked_id:peerId })
    window.showToast('success', isBlocked ? 'Разблокирован' : 'Заблокирован', {icon:'✓'})
}
async function toggleMute(peerId, isMuted){
    const { data:{ user } } = await supabase.auth.getUser()
    if(isMuted) await supabase.from('direct_mutes').delete().eq('user_id', user.id).eq('peer_id', peerId)
    else await supabase.from('direct_mutes').insert({ user_id:user.id, peer_id:peerId })
    window.showToast('success', isMuted ? 'Размучен' : 'Замучен', {icon:'✓'})
}

/* ============================================================
   ОТКРЫТИЕ ЧАТА
============================================================ */
export async function openDirectChat(peerId, peerProfile = null){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    if(peerId === user.id){ window.showToast('error','Нельзя писать себе',{icon:'⚠️'}); return }

    // проверка взаимной подписки
    const [{ data:f1 }, { data:f2 }] = await Promise.all([
        supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', peerId).maybeSingle(),
        supabase.from('follows').select('id').eq('follower_id', peerId).eq('following_id', user.id).maybeSingle()
    ])
    if(!f1 || !f2){
        window.showToast('error','Переписка только при взаимной подписке', {icon:'🔒', duration:4000})
        return
    }

    if(!peerProfile){
        const { data } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji').eq('id', peerId).maybeSingle()
        peerProfile = data || {}
    }
    D.currentChat = { peerId, peerProfile }
    renderChatRoom()
}

function renderChatRoom(){
    const { peerId, peerProfile } = D.currentChat
    const p = peerProfile || {}
    const name = p.full_name || p.username || 'Пользователь'
    const emoji = p.status_emoji || p.status || '👋'

    let room = $('direct-room')
    if(!room){
        room = document.createElement('div')
        room.id = 'direct-room'
        room.className = 'direct-room hidden'
        document.getElementById('main-app').appendChild(room)
    }
    room.classList.remove('hidden')
    room.innerHTML = `
        <header class="topbar">
            <button class="topbar-btn" id="dr-back">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0 10px">
                <div class="dr-peer-avatar">${av(p.avatar_url, name)}</div>
                <div style="min-width:0">
                    <div class="dr-peer-name">${esc(name)}</div>
                    <div class="dr-peer-status">${emoji} online</div>
                </div>
            </div>
            <button class="topbar-btn" id="dr-dots">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
            </button>
        </header>
        <div class="direct-messages" id="direct-messages"></div>
        <div class="direct-composer">
            <input type="text" id="dr-input" placeholder="Введите сообщение" autocomplete="off">
            <button class="btn-send-icon btn-primary" id="dr-send" aria-label="Отправить">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
        </div>
    `
    $('dr-back').addEventListener('click', closeChatRoom)
    $('dr-dots').addEventListener('click', openPeerMenu)
    const input = $('dr-input')
    const send = async () => {
        const text = input.value.trim()
        if(!text) return
        input.value = ''
        const { data:{ user } } = await supabase.auth.getUser()
        await supabase.from('direct_messages').insert({
            from_id:user.id, to_id:peerId, content:text
        })
        loadMessages()
    }
    $('dr-send').addEventListener('click', send)
    input.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); send() } })

    // отрисовка welcome
    loadMessages()
    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => {
        if($('direct-room') && !$('direct-room').classList.contains('hidden')) loadMessages()
    }, 3000)
}

async function closeChatRoom(){
    const r = $('direct-room')
    if(r) r.classList.add('hidden')
    D.currentChat = null
    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => { if($('screen-direct')?.classList.contains('active')) loadDirectChats(true) }, 5000)
    loadDirectChats()
}

async function loadMessages(){
    const room = $('direct-room'); if(!room) return
    const { peerId } = D.currentChat
    const { data:{ user } } = await supabase.auth.getUser()

    const { data:msgs } = await supabase.from('direct_messages')
        .select('*').or(`and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`)
        .order('created_at', { ascending:true }).limit(200)

    // прочитано
    if(msgs?.length){
        const unread = msgs.filter(m => m.to_id === user.id && !m.is_read).map(m => m.id)
        if(unread.length) await supabase.from('direct_messages').update({ is_read:true }).in('id', unread)
    }

    const box = $('direct-messages')
    if(!msgs?.length){
        box.innerHTML = `
            <div class="direct-welcome">
                <div class="direct-welcome-avatar">${av(D.currentChat.peerProfile.avatar_url, D.currentChat.peerProfile.full_name||D.currentChat.peerProfile.username)}</div>
                <h2>welcome to listatread direct</h2>
                <p>обменивайтесь сообщениями и отправляйте видео, музыку, посты и профили друг другу и растите своего listik</p>
            </div>`
        return
    }

    box.innerHTML = msgs.map(m => {
        const mine = m.from_id === user.id
        const time = new Date(m.created_at).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })
        let body = ''
        if(m.media_url){
            const clean = m.media_url.split('?')[0].toLowerCase()
            if(/\.(mp4|webm|mov)$/.test(clean)) body = `<video src="${m.media_url}" controls playsinline style="max-width:100%;border-radius:12px;margin-top:4px"></video>`
            else if(/\.(mp3|wav|m4a|ogg)$/.test(clean)) body = `<audio src="${m.media_url}" controls style="max-width:100%;margin-top:4px"></audio>`
            else body = `<img src="${m.media_url}" style="max-width:100%;border-radius:12px;margin-top:4px">`
        }
        if(m.content) body += `<div>${esc(m.content)}</div>`
        return `<div class="direct-bubble ${mine?'mine':''}">
            <div class="direct-bubble-content">${body}</div>
            <div class="direct-bubble-time">${time}${mine && m.is_read ? ' ✓✓' : ''}</div>
        </div>`
    }).join('')
    box.scrollTop = box.scrollHeight
}

async function openPeerMenu(){
    const { peerId } = D.currentChat
    const { data:{ user } } = await supabase.auth.getUser()
    const { data:blockRow } = await supabase.from('blocks')
        .select('id').eq('blocker_id', user.id).eq('blocked_id', peerId).maybeSingle()
    const isBlocked = !!blockRow
    window.showActionSheet('Чат', [
        { label:'Пожаловаться', icon:'⚠️', danger:true, onClick: () => {
                if(window.openReportModal) window.openReportModal({
                    targetType:'profile', targetId:peerId,
                    author: D.currentChat.peerProfile
                })
            }},
        { label: isBlocked ? 'Разблокировать' : 'Заблокировать', icon:'🚫', danger:!isBlocked, onClick: () => toggleBlock(peerId, isBlocked) },
        { label:'Удалить чат', icon:'🗑', danger:true, onClick: async () => {
                await deleteChat(peerId); closeChatRoom()
            }}
    ])
}

// глобальный хелпер
window.openDirectChat = openDirectChat