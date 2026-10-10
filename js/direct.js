/* ============================================================
   listatread — direct.js (v3)
   Полноценный директ: запросы, обои, даты, профиль в чате,
   админ-режим, пины, уведомления.
============================================================ */
import { supabase } from './supabase.js'

const $ = id => document.getElementById(id)
const esc = t => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML }
const av = (url, name) => url ? `<img src="${url}" alt="">` : (name||'?').charAt(0).toUpperCase()

const STATUS_MAP = {
    default:'👋', kiss:'💋', watch:'👀', cat:'😻', ghost:'👻', love:'🥰', laugh:'😀',
    lol:'😂', party:'🥳', pumpkin:'🎃', alien:'👾', wedding:'💍', dog:'🐶', cat2:'🐱',
    bow:'🎀', bear:'🧸', plane:'✈️', clown:'🤡', angel:'😇', sick:'🤒', friends:'👥',
    cop:'👮', ninja:'🥷', zombie:'🧟‍♂️', business:'💼', pig:'🐽', tree:'🎄',
    mushroom:'🍄', rose:'🌹', wilted:'🥀', snow:'❄️', apple:'🍎', strawberry:'🍓',
    cake:'🎂', soccer:'⚽️', car:'🚗', camera:'📸', magnet:'🧲', bath:'🛁',
    note:'📝', done:'✅', male:'🚹', female:'🚺', baby:'🚼'
}
const statusEmoji = code => STATUS_MAP[code] || (code && code.length <= 2 ? code : '👋')

const WALLPAPERS = ['default','rose','ocean','sunset','forest','night','purple']

const D = {
    tab: 'chats',
    chats: [],
    requests: [],
    currentChat: null,
    refreshTimer: null,
    editMode: false,
    currentUser: null,
    isAdmin: false,
    prefs: {},           // peerId -> { pinned, muted, wallpaper }
    unreadTotal: 0,
    slideTimer: null,
    lastSlideAt: 0
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
    <button class="new-chat-btn" id="direct-new-chat-btn">
      <span class="nc-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </span>
      <span class="nc-texts">
        <span class="nc-title">Добавить новый чат</span>
        <span class="nc-sub">Начните общение</span>
      </span>
    </button>
    <div id="direct-requests-block"></div>
    <div class="direct-list" id="direct-list"></div>
  `
    document.getElementById('main-app').appendChild(s)

    s.querySelector('#direct-menu-btn').addEventListener('click', openDirectMenu)
    s.querySelector('#direct-edit-btn').addEventListener('click', toggleDirectEdit)
    s.querySelector('#direct-new-chat-btn').addEventListener('click', openNewChatScreen)
    return s
}

export function openDirectTab(){
    buildDirectScreen()
    document.querySelectorAll('.app-screen').forEach(x => x.classList.remove('active'))
    $('screen-direct').classList.add('active')
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => {
        if($('screen-direct')?.classList.contains('active') && !D.currentChat) loadDirectChats(true)
    }, 5000)
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
   МЕНЮ
============================================================ */
function openDirectMenu(){
    window.showActionSheet('Меню директа', [
        { label:'Найти пользователя', icon:'🔎', onClick: openNewChatScreen },
        { label:'Настройки личного профиля', icon:'👤', onClick: () => window.switchScreen?.('settings') },
        { label:'Приватность', icon:'🔒', onClick: () => { window.switchScreen?.('settings'); window.switchSettingsTab?.('privacy') } },
        { label:'Правила сообщества', icon:'📖', onClick: () => window.open('/rules','_blank') }
    ])
}

/* ============================================================
   ЭКРАН «НОВЫЙ ЧАТ»
============================================================ */
function openNewChatScreen(){
    let s = $('direct-new-chat')
    if(!s){
        s = document.createElement('div')
        s.id = 'direct-new-chat'
        s.className = 'direct-room hidden'
        s.style.zIndex = '160'
        document.getElementById('main-app').appendChild(s)
    }
    s.classList.remove('hidden')
    s.innerHTML = `
<header class="dnc-topbar">
  <button class="dnc-back" id="dnc-back" aria-label="Назад">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
  </button>

  <div class="dnc-search">
    <input type="text" id="dnc-input"
           placeholder="Поиск по ID или @username"
           autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text">
    <button class="dnc-clear hidden" id="dnc-clear" aria-label="Очистить" type="button">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
</header>

<div class="dnc-body">
  <h2 class="dnc-title">Начните новый чат</h2>
  <div class="dnc-note">
    Вы можете отправить сообщение своим подписчикам в безлимитном количестве, но пользователь не сможет вам ответить пока не подпишется на вас.
    Или отправьте запрос на переписку, отправив <b>от 1 сообщения</b> — если вы и пользователь взаимно подпишитесь и пользователь примет ваш запрос на переписку, чат автоматически начнётся и появится в списке чатов
    <br><br>
    Перед отправкой сообщений другим ознакомьтесь с <a href="/rules" target="_blank">правилами сообщества</a>.
    Если человек странно себя ведёт, нарушает правила, скидывает запрещенный контент или просит перейти по ссылке, отправить свои персональные данные, адресс и другие личные данные, оскорбляет, манипулирует или шантажирует, отправляет ваши личные данные с угрозами, просит о любых услугах, скидывает ссылки на сторонние чаты/приложения/сайты которые вы не знаете — немедленно заблокируйте собеседника и отправьте жалобу!
    Администрация <b>никогда</b> не попросит вас скинуть пароль, данные для входа или личные данные. Администрация listatread не несет ответственность за ваши переписки.
    <b>НИКОГДА</b> не отправляйте свои личные данные и ссылки на соцсети в чатах, а также не переходите по подозрительным ссылкам от незнакомцев и не выполняйте их требования даже под предлогом докса, вознаграждения, угроз и другого.
    <br><br>
    Читайте дальше на <a href="/rules" target="_blank">listatread.online/rules</a>.
  </div>

  <div id="dnc-results"></div>
</div>
`

    $('dnc-back').addEventListener('click', () => s.classList.add('hidden'))

    const input = $('dnc-input')
    const clear = $('dnc-clear')
    let debounce = null

    const updateClear = () => clear.classList.toggle('hidden', !input.value)
    input.addEventListener('input', () => {
        updateClear()
        clearTimeout(debounce)
        debounce = setTimeout(() => searchNewChat(input.value.trim()), 200)
    })
    clear.addEventListener('click', () => {
        input.value = ''
        updateClear()
        searchNewChat('')
        input.focus()
    })

// Enter — как сабмит
    input.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
            e.preventDefault()
            searchNewChat(input.value.trim())
        }
    })

    input.focus()
}

async function searchNewChat(term){
    const box = $('dnc-results'); if(!box) return
    if(!term){ box.innerHTML = ''; return }
    box.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span></div>'
    const clean = term.replace(/^@/, '')
    const { data:me } = await supabase.auth.getUser()
    const myId = me?.user?.id
    const { data } = await supabase.from('profiles')
        .select('id, username, full_name, avatar_url, status, status_emoji, bio')
        .or(`username.ilike.%${clean}%,full_name.ilike.%${clean}%,public_id.eq.${clean.toUpperCase()}`)
        .neq('id', myId)
        .limit(20)
    if(!data?.length){ box.innerHTML = '<p class="empty small">Ничего не найдено</p>'; return }
    box.innerHTML = data.map(p => {
        const name = p.full_name || p.username || 'user'
        return `<button class="search-person" data-uid="${p.id}" style="width:100%;border:none;font-family:inherit;text-align:left;cursor:pointer;margin-bottom:8px">
      <div class="search-person-avatar">${av(p.avatar_url, name)}</div>
      <div class="search-person-info">
        <div class="search-person-name">${esc(name)}</div>
        <div class="search-person-sub">@${esc(p.username || 'user')}</div>
      </div>
    </button>`
    }).join('')
    box.querySelectorAll('.search-person').forEach(el => {
        el.addEventListener('click', () => {
            $('direct-new-chat')?.classList.add('hidden')
            openDirectChat(el.dataset.uid, null)
        })
    })
}

/* ============================================================
   ЗАГРУЗКА СПИСКА
============================================================ */
async function loadDirectChats(silent = false){
    const box = $('direct-list')
    if(!box) return
    if(!silent) box.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span></div>'

    const { data:{ user } } = await supabase.auth.getUser()
    if(!user){ box.innerHTML = '<p class="empty">Войдите</p>'; return }
    D.currentUser = user

    // Профиль для isAdmin
    try {
        const { data:prof } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
        D.isAdmin = !!prof?.is_admin
    } catch {}

    // Мои prefs
    try {
        const { data:prefs } = await supabase.from('direct_chat_prefs').select('peer_id, pinned, pinned_at, muted, wallpaper').eq('user_id', user.id)
        D.prefs = {}
        ;(prefs||[]).forEach(p => { D.prefs[p.peer_id] = p })
    } catch { D.prefs = {} }

    // Сообщения
    const { data: msgs, error } = await supabase.from('direct_messages')
        .select('id, from_id, to_id, content, media_url, media_type, is_read, created_at')
        .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
        .order('created_at', { ascending:false }).limit(500)

    if(error){
        box.innerHTML = `<p class="empty">Ошибка загрузки: ${esc(error.message)}</p>`
        return
    }

    const byPeer = new Map()
    for(const m of (msgs || [])){
        const peerId = m.from_id === user.id ? m.to_id : m.from_id
        if(!byPeer.has(peerId)) byPeer.set(peerId, { peerId, lastMsg: m, unread: 0 })
        if(m.to_id === user.id && !m.is_read) byPeer.get(peerId).unread++
    }

    // Запросы на чат
    let reqs = []
    try {
        const { data:cr } = await supabase.from('chat_requests')
            .select('id, from_user, first_message, created_at')
            .eq('to_user', user.id).eq('status', 'pending')
            .order('created_at', { ascending:false }).limit(30)
        reqs = cr || []
        // Профили запросов
        const ids = reqs.map(r => r.from_user)
        if(ids.length){
            const { data:profs } = await supabase.from('profiles')
                .select('id, username, full_name, avatar_url, status, status_emoji').in('id', ids)
            const pm = Object.fromEntries((profs||[]).map(p => [p.id, p]))
            reqs = reqs.map(r => ({ ...r, profile: pm[r.from_user] || {} }))
        }
    } catch {}

    // Профили чатов
    const ids = [...byPeer.keys()]
    let pm = {}
    if(ids.length){
        const { data: profs } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji, is_admin')
            .in('id', ids)
        pm = Object.fromEntries((profs||[]).map(p => [p.id, p]))
    }

    D.chats = ids.map(id => ({ ...byPeer.get(id), profile: pm[id] || {} }))

    // Учитываем запросы как «чаты с непрочитанными»
    let unreadTotal = D.chats.reduce((sum, c) => sum + (c.unread || 0), 0) + reqs.length
    D.unreadTotal = unreadTotal
    updateHomeBadge(unreadTotal)

    // Запросы
    D.requests = reqs
    renderRequests()

    // Сортировка: pinned первыми, затем по дате
    D.chats.sort((a,b) => {
        const pa = D.prefs[a.peerId]?.pinned ? 1 : 0
        const pb = D.prefs[b.peerId]?.pinned ? 1 : 0
        if(pa !== pb) return pb - pa
        if(pa && pb){
            const ta = new Date(D.prefs[a.peerId]?.pinned_at || 0).getTime()
            const tb = new Date(D.prefs[b.peerId]?.pinned_at || 0).getTime()
            if(ta !== tb) return tb - ta
        }
        return new Date(b.lastMsg.created_at) - new Date(a.lastMsg.created_at)
    })

    renderChats()
}

function updateHomeBadge(n){
    const btn = $('home-chats-btn'); if(!btn) return
    btn.querySelector('.btn-badge')?.remove()
    if(n > 0){
        const b = document.createElement('span')
        b.className = 'btn-badge'
        b.textContent = n > 99 ? '99+' : n
        btn.appendChild(b)
    }
}

function renderRequests(){
    const box = $('direct-requests-block'); if(!box) return
    if(!D.requests.length){ box.innerHTML = ''; return }
    box.innerHTML = `<div class="chat-requests-title">Запросы на чат · ${D.requests.length}</div>` +
        D.requests.map(r => {
            const p = r.profile || {}
            const name = p.full_name || p.username || 'user'
            return `<div class="chat-request-item" data-req="${r.id}" data-peer="${r.from_user}">
        <div class="chat-request-ava">${av(p.avatar_url, name)}</div>
        <div class="chat-request-body">
          <div class="chat-request-name">${esc(name)}</div>
          <div class="chat-request-msg">${esc(r.first_message || 'Хочет начать с вами чат')}</div>
        </div>
        <div class="chat-request-actions">
          <button class="chat-request-btn accept" data-accept-req="${r.id}" data-peer="${r.from_user}">Принять</button>
          <button class="chat-request-btn decline" data-decline-req="${r.id}">✕</button>
        </div>
      </div>`
        }).join('')
    box.querySelectorAll('[data-accept-req]').forEach(btn => btn.addEventListener('click', async e => {
        e.stopPropagation()
        await acceptRequest(btn.dataset.acceptReq, btn.dataset.peer)
    }))
    box.querySelectorAll('[data-decline-req]').forEach(btn => btn.addEventListener('click', async e => {
        e.stopPropagation()
        await supabase.from('chat_requests').update({ status:'declined' }).eq('id', btn.dataset.declineReq)
        loadDirectChats()
    }))
}

async function acceptRequest(reqId, peerId){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    // Автоматически подписываемся на отправителя
    try {
        const { data:existing } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', peerId).maybeSingle()
        if(!existing) await supabase.from('follows').insert({ follower_id: user.id, following_id: peerId })
    } catch {}
    await supabase.from('chat_requests').update({ status:'accepted' }).eq('id', reqId)
    window.showToast?.('success', 'Запрос принят', { icon:'✓' })
    await loadDirectChats()
    setTimeout(() => openDirectChat(peerId), 250)
}

function renderChats(){
    const box = $('direct-list'); if(!box) return
    if(!D.chats.length){ box.innerHTML = '<p class="empty">Нет чатов. Начните общение.</p>'; return }

    box.innerHTML = D.chats.map(c => {
        const p = c.profile || {}
        const name = p.full_name || p.username || 'Пользователь'
        const emoji = statusEmoji(p.status_emoji || p.status)
        const last = c.lastMsg
        let preview = ''
        if(last.media_type === 'video') preview = '🎬 Видео'
        else if(last.media_type === 'audio') preview = '🎵 Аудио'
        else if(last.media_type === 'image') preview = '📷 Фото'
        else preview = last.content || ''
        if(preview.length > 30) preview = preview.slice(0, 30) + '…'
        const dt = new Date(last.created_at)
        const dateStr = dt.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' })
        const pref = D.prefs[c.peerId] || {}
        return `<div class="direct-item ${pref.pinned ? 'pinned' : ''}" data-peer="${c.peerId}">
      ${pref.pinned ? '<div class="direct-item-pin">📌</div>' : ''}
      <div class="direct-item-avatar">${av(p.avatar_url, name)}<span class="direct-item-status">${emoji}</span></div>
      <div class="direct-item-info">
        <div class="direct-item-name">${esc(name)}${p.is_admin ? ' 🦝' : ''}</div>
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
    const pref = D.prefs[peerId] || {}
    const items = [
        { label: pref.pinned ? 'Открепить' : 'Закрепить', icon:'📌', onClick: () => togglePin(peerId) },
        { label:'Удалить переписку', icon:'🧹', danger:true, onClick: () => clearChat(peerId) },
        { label:'Удалить чат', icon:'🗑', danger:true, onClick: () => deleteChat(peerId) }
    ]
    window.showActionSheet('Чат', items)
}

async function togglePin(peerId){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    const pref = D.prefs[peerId] || { pinned:false }
    if(!pref.pinned){
        const pinnedCount = Object.values(D.prefs).filter(p => p.pinned).length
        if(pinnedCount >= 3){ window.showToast('error','Максимум 3 закреплённых чата, но с listatread chvad -> 10', { icon:'⚠️' }); return }
    }
    try {
        const { data:existing } = await supabase.from('direct_chat_prefs').select('id').eq('user_id', user.id).eq('peer_id', peerId).maybeSingle()
        if(existing){
            await supabase.from('direct_chat_prefs').update({ pinned: !pref.pinned, pinned_at: pref.pinned ? null : new Date().toISOString() }).eq('id', existing.id)
        } else {
            await supabase.from('direct_chat_prefs').insert({ user_id: user.id, peer_id: peerId, pinned: true, pinned_at: new Date().toISOString() })
        }
        await loadDirectChats(true)
        window.showToast('success', pref.pinned ? 'Откреплён' : 'Закреплён', { icon:'📌' })
    } catch(e){ window.showToast('error', e.message) }
}

async function clearChat(peerId){
    if(!confirm('Очистить все сообщения? Это действие удалит чат у обоих пользователей без сохранения истории. Это действие нельзя будет отменить после вашего подтверждения.')) return
    const { data:{ user } } = await supabase.auth.getUser()
    await supabase.from('direct_messages').delete().or(
        `and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`
    )
    loadDirectChats()
    window.showToast('success','Чат очищен',{icon:'✓'})
}

async function deleteChat(peerId){
    if(!confirm('Удалить чат? Сообщения в них и таб для чата будут удалены. Это действие нельзя будет отменить после вашего подтверждения.')) return
    const { data:{ user } } = await supabase.auth.getUser()
    await supabase.from('direct_messages').delete().or(
        `and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`
    )
    await supabase.from('direct_chat_prefs').delete().eq('user_id', user.id).eq('peer_id', peerId)
    loadDirectChats()
    window.showToast('success','Чат удалён',{icon:'✓'})
}

/* ============================================================
   ОТКРЫТИЕ ЧАТА
============================================================ */
export async function openDirectChat(peerId, peerProfile = null){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    if(peerId === user.id){ window.showToast('error','Нельзя писать себе',{icon:'⚠️'}); return }
    if(!peerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(peerId)){
        window.showToast?.('error', 'Некорректный пользователь', { icon:'⚠️' }); return
    }

    const [{ data:blockRow }, { data:blockedBy }] = await Promise.all([
        supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', peerId).maybeSingle(),
        supabase.from('blocks').select('id').eq('blocker_id', peerId).eq('blocked_id', user.id).maybeSingle()
    ])
    if(blockRow || blockedBy){ window.showToast('error', 'Переписка недоступна', { icon:'🔒' }); return }

    if(!peerProfile){
        const { data } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji, bio, birthday, is_admin').eq('id', peerId).maybeSingle()
        peerProfile = data || {}
    } else if(peerProfile.bio === undefined){
        // догружаем полный профиль
        const { data } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji, bio, birthday, is_admin').eq('id', peerId).maybeSingle()
        peerProfile = { ...peerProfile, ...(data||{}) }
    }

    // Проверяем: могу ли я писать
    const peerIsAdmin = !!peerProfile.is_admin
    let canWrite = D.isAdmin || peerIsAdmin

    if(!canWrite){
        const [{ data:meFollows }, { data:peerFollows }] = await Promise.all([
            supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', peerId).maybeSingle(),
            supabase.from('follows').select('id').eq('follower_id', peerId).eq('following_id', user.id).maybeSingle()
        ])
        canWrite = !!(meFollows || peerFollows)
        D.currentChat = { peerId, peerProfile, canWrite, isMutual: !!(meFollows && peerFollows), requestMode: !meFollows }
    } else {
        D.currentChat = { peerId, peerProfile, canWrite: true, isMutual: true, requestMode: false }
    }

    if(!canWrite){
        window.showToast('error', 'Чтобы начать чат подпишитесь на собеседника', { icon:'🔒', duration:4000 })
        return
    }

    buildDirectScreen()
    document.querySelectorAll('.app-screen').forEach(x => x.classList.remove('active'))
    $('screen-direct')?.classList.add('active')
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))

    renderChatRoom()
}

/* ============================================================
   КОМНАТА ЧАТА
============================================================ */
function renderChatRoom(){
    if(!D.currentChat) return
    const { peerId, peerProfile } = D.currentChat
    const p = peerProfile || {}
    const name = p.full_name || p.username || 'Пользователь'
    const pref = D.prefs[peerId] || {}
    const wp = pref.wallpaper || 'default'

    let room = $('direct-room')
    if(!room){
        room = document.createElement('div')
        room.id = 'direct-room'
        room.className = 'direct-room hidden'
        document.getElementById('main-app').appendChild(room)
    }
    room.classList.remove('hidden')
    room.innerHTML = `
    <header class="dr-topbar">
      <button class="dr-back-btn" id="dr-back" title="Все чаты">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
        <span class="dr-back-badge hidden" id="dr-back-badge">0</span>
      </button>
      <div class="dr-user-pill">
        <div class="dr-user-ava">${av(p.avatar_url, name)}</div>
        <div class="dr-user-info">
          <div class="dr-user-name">${esc(name)}</div>
          <div class="dr-user-status">личный чат</div>
        </div>
      </div>
      <button class="dr-profile-btn" id="dr-profile-btn" title="Профиль">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
      </button>
    </header>
    <div class="dr-pinned-bar hidden" id="dr-pinned-bar"></div>
    <div class="direct-messages wp-${wp}" id="direct-messages"></div>
    <div class="direct-composer">
      <input type="text" id="dr-input" placeholder="Введите сообщение" autocomplete="off">
      <button class="btn-send-icon btn-primary" id="dr-send" aria-label="Отправить">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `

    $('dr-back').addEventListener('click', closeChatRoom)
    $('dr-profile-btn').addEventListener('click', () => openChatProfile(peerId, p))

    const input = $('dr-input')
    const send = async () => {
        const text = input.value.trim()
        if(!text) return
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        const isMutual = D.currentChat.isMutual
        const myAdmin = D.isAdmin
        const peerAdmin = !!p.is_admin
        try {
            const { error } = await supabase.from('direct_messages').insert({
                from_id: user.id, to_id: peerId, content: text
            })
            if(error) throw error
            input.value = ''
            if(!isMutual && !myAdmin && !peerAdmin){
                const [{ data:meF }, { data:peerF }] = await Promise.all([
                    supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', peerId).maybeSingle(),
                    supabase.from('follows').select('id').eq('follower_id', peerId).eq('following_id', user.id).maybeSingle()
                ])
                if(!peerF){
                    try {
                        await supabase.from('chat_requests').upsert({
                            from_user: user.id, to_user: peerId,
                            first_message: text, status:'pending'
                        }, { onConflict:'from_user,to_user' })
                    } catch {}
                }
            }
            loadMessages()
            loadDirectChats(true)
        } catch(e){
            console.error('[direct send]', e)
            window.showToast?.('error', 'Не удалось отправить', { icon:'⚠️' })
        }
    }
    $('dr-send').addEventListener('click', send)
    input.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); send() } })

    loadMessages()

    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => {
        if($('direct-room') && !$('direct-room').classList.contains('hidden')) loadMessages(true)
    }, 3000)

    updateBackBadge()
}

function updateBackBadge(){
    const badge = $('dr-back-badge'); if(!badge) return
    const total = D.chats.reduce((s,c) => s + (c.unread||0), 0) + D.requests.length
    if(total > 0){ badge.textContent = total > 99 ? '99+' : total; badge.classList.remove('hidden') }
    else badge.classList.add('hidden')
}

async function closeChatRoom(){
    const r = $('direct-room')
    if(r) r.classList.add('hidden')
    D.currentChat = null
    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => {
        if($('screen-direct')?.classList.contains('active') && !D.currentChat) loadDirectChats(true)
    }, 5000)
    loadDirectChats()
}

let _lastMsgSig = ''
async function loadMessages(silent = false){
    const room = $('direct-room'); if(!room) return
    if(!D.currentChat) return
    const { peerId, peerProfile } = D.currentChat
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return

    const { data:msgs, error } = await supabase.from('direct_messages')
        .select('*')
        .or(`and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`)
        .order('created_at', { ascending:true }).limit(300)

    if(error) console.warn('[direct loadMessages]', error.message)

    // Убираем скрытые для меня
    const visible = (msgs || []).filter(m => !(m.hidden_for || []).includes(user.id))

    // Помечаем прочитанными
    if(visible.length){
        const unread = visible.filter(m => m.to_id === user.id && !m.is_read).map(m => m.id)
        if(unread.length){
            await supabase.from('direct_messages').update({ is_read:true }).in('id', unread)
            loadDirectChats(true)
        }
    }

    // Обновляем плашку закреплённых
    const pinned = visible.filter(m => m.pinned_at)
    renderPinnedBar(pinned)

    const box = $('direct-messages')
    if(!box) return

    // Не перерисовываем если ничего не изменилось и включён silent
    const sig = visible.map(m => m.id).join(',')
    if(silent && sig === _lastMsgSig) return
    _lastMsgSig = sig

    const pname = peerProfile.full_name || peerProfile.username || 'user'
    const myProfile = await supabase.from('profiles')
        .select('full_name, username, avatar_url').eq('id', user.id).maybeSingle()
    const mp = myProfile?.data || {}
    const myName = mp.full_name || mp.username || 'me'

    if(!visible.length){
        box.innerHTML = `
      <div class="direct-welcome">
        <div class="direct-welcome-avatar">${av(peerProfile.avatar_url, pname)}</div>
        <h2>welcome to listatread direct</h2>
        <p>обменивайтесь сообщениями и отправляйте видео, музыку, посты и профили друг другу</p>
      </div>`
        return
    }

    let html = ''
    let lastDay = ''
    visible.forEach((m, i) => {
        const day = new Date(m.created_at).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })
        if(day !== lastDay){
            html += `<div class="dr-date-sep">${day}</div>`
            lastDay = day
        }
        const mine = m.from_id === user.id
        const time = new Date(m.created_at).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })
        const prev = visible[i-1]
        const showAva = !prev || prev.from_id !== m.from_id || day !== new Date(prev.created_at).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })

        let body = ''
        if(m.media_url){
            const clean = m.media_url.split('?')[0].toLowerCase()
            if(/\.(mp4|webm|mov)$/.test(clean)) body = `<video src="${m.media_url}" controls playsinline style="max-width:100%;border-radius:12px;margin-top:4px"></video>`
            else if(/\.(mp3|wav|m4a|ogg)$/.test(clean)) body = `<audio src="${m.media_url}" controls style="max-width:100%;margin-top:4px"></audio>`
            else body = `<img src="${m.media_url}" style="max-width:100%;border-radius:12px;margin-top:4px">`
        }
        if(m.content) body += `<div>${esc(m.content)}</div>`

        const avaSrc = mine ? mp.avatar_url : peerProfile.avatar_url
        const avaName = mine ? myName : pname
        const pinnedMark = m.pinned_at ? '<span class="dr-msg-pin">📌</span>' : ''

        html += `<div class="dr-row ${mine?'mine':''}" data-mid="${m.id}" data-mine="${mine?1:0}">
      <div class="dr-row-ava ${showAva?'':'ghost'}">${av(avaSrc, avaName)}</div>
      <div class="direct-bubble">
        <div class="direct-bubble-content">${pinnedMark}${body}</div>
        <div class="direct-bubble-time">${time}${mine && m.is_read ? ' ✓✓' : ''}</div>
      </div>
    </div>`
    })
    box.innerHTML = html

    // Long-press / right-click на сообщениях
    box.querySelectorAll('.dr-row').forEach(row => attachMsgMenu(row))

    // Плавно вниз
    box.scrollTop = box.scrollHeight
}

/* ============================================================
   ЗАКРЕПЛЁННАЯ ПЛАШКА
============================================================ */
function renderPinnedBar(pinned){
    const bar = $('dr-pinned-bar'); if(!bar) return
    if(!pinned.length){ bar.classList.add('hidden'); bar.innerHTML = ''; return }

    const last = pinned[pinned.length - 1]
    const text = (last.content || '📎 Медиа').slice(0, 60)
    const countBadge = pinned.length > 1 ? `<span class="dr-pinned-count">${pinned.length}</span>` : ''

    bar.classList.remove('hidden')
    bar.innerHTML = `
    <div class="dr-pinned-icon">📌</div>
    <div class="dr-pinned-body">
      <div class="dr-pinned-title">Закреплённое сообщение</div>
      <div class="dr-pinned-text">${esc(text)}</div>
    </div>
    ${countBadge}
    <button class="dr-pinned-unpin" id="dr-pin-unpin" title="Открепить">✕</button>
  `
    bar.onclick = e => {
        if(e.target.id === 'dr-pin-unpin') return
        if(pinned.length === 1){
            scrollToMessage(pinned[0].id)
        } else {
            openPinnedList(pinned)
        }
    }
    $('dr-pin-unpin').addEventListener('click', async e => {
        e.stopPropagation()
        const latest = pinned[pinned.length - 1]
        await unpinMessage(latest.id)
    })
}

function openPinnedList(pinned){
    const items = pinned.map((m, i) => ({
        label: ((m.content || '📎 Медиа').slice(0, 40)),
        icon: '📌',
        onClick: () => scrollToMessage(m.id)
    }))
    window.showActionSheet(`Закреплённые · ${pinned.length}`, items)
}

function scrollToMessage(msgId){
    const box = $('direct-messages'); if(!box) return
    const row = box.querySelector(`.dr-row[data-mid="${msgId}"]`)
    if(!row){ window.showToast?.('info', 'Сообщение не загружено', { icon:'ℹ️' }); return }
    box.scrollTo({ top: row.offsetTop - 80, behavior: 'smooth' })
    row.classList.add('highlight')
    setTimeout(() => row.classList.remove('highlight'), 2000)
}

/* ============================================================
   КОНТЕКСТ-МЕНЮ СООБЩЕНИЯ (long-press / right-click)
============================================================ */
function attachMsgMenu(row){
    let pressTimer = null
    let longPressed = false

    const startPress = e => {
        longPressed = false
        row.classList.add('pressing')
        pressTimer = setTimeout(() => {
            longPressed = true
            row.classList.remove('pressing')
            showMsgMenu(row, e)
        }, 420)
    }
    const cancelPress = () => {
        if(pressTimer){ clearTimeout(pressTimer); pressTimer = null }
        row.classList.remove('pressing')
    }

    row.addEventListener('touchstart', startPress, { passive:true })
    row.addEventListener('touchend', e => {
        if(longPressed){ e.preventDefault() }
        cancelPress()
    })
    row.addEventListener('touchmove', cancelPress, { passive:true })
    row.addEventListener('touchcancel', cancelPress)

    row.addEventListener('mousedown', e => {
        if(e.button !== 0) return
        startPress(e)
    })
    row.addEventListener('mouseup', cancelPress)
    row.addEventListener('mouseleave', cancelPress)

    row.addEventListener('contextmenu', e => {
        e.preventDefault()
        showMsgMenu(row, e)
    })
}

function showMsgMenu(row, event){
    document.querySelectorAll('.dr-msg-menu').forEach(m => m.remove())
    const msgId = row.dataset.mid
    const isMine = row.dataset.mine === '1'

    const menu = document.createElement('div')
    menu.className = 'dr-msg-menu'
    const items = [
        { label: 'Скопировать', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>', onClick: () => copyMsg(msgId) },
        { label: 'Закрепить', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 17v5M9 3h6l-1 8 4 3v2H6v-2l4-3z"/></svg>', onClick: () => togglePinMsg(msgId) },
        { label: isMine ? 'Удалить' : 'Удалить у себя', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>', danger: true, onClick: () => deleteMsg(msgId, isMine, row) }
    ]

    menu.innerHTML = items.map((it, i) => `
    <button class="dr-msg-menu-item ${it.danger ? 'danger' : ''}" data-mi="${i}">
      ${it.icon}
      <span>${it.label}</span>
    </button>
  `).join('')
    document.body.appendChild(menu)

    // Позиционирование
    const rect = row.getBoundingClientRect()
    const mw = menu.offsetWidth || 180
    const mh = menu.offsetHeight || 140
    let left = Math.min(rect.left, window.innerWidth - mw - 10)
    if(left < 10) left = 10
    let top = rect.top - mh - 8
    if(top < 10) top = rect.bottom + 8
    menu.style.left = left + 'px'
    menu.style.top = top + 'px'

    menu.querySelectorAll('.dr-msg-menu-item').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation()
            const it = items[+btn.dataset.mi]
            menu.remove()
            if(it.onClick) setTimeout(it.onClick, 50)
        })
    })

    // Клик вне — закрыть
    setTimeout(() => {
        const close = ev => {
            if(!menu.contains(ev.target)){ menu.remove(); document.removeEventListener('click', close) }
        }
        document.addEventListener('click', close)
    }, 50)

    // Вибро-отклик если поддерживается
    try { navigator.vibrate?.(15) } catch {}
}

async function copyMsg(msgId){
    const { data:msg } = await supabase.from('direct_messages').select('content').eq('id', msgId).maybeSingle()
    if(msg?.content){
        try { await navigator.clipboard.writeText(msg.content) } catch {}
        window.showToast?.('success', 'Скопировано', { icon:'✓' })
    } else {
        window.showToast?.('info', 'Нечего копировать', { icon:'ℹ️' })
    }
}

async function togglePinMsg(msgId){
    const { data:msg } = await supabase.from('direct_messages').select('pinned_at').eq('id', msgId).maybeSingle()
    if(!msg) return
    const isPinned = !!msg.pinned_at
    await supabase.from('direct_messages').update({
        pinned_at: isPinned ? null : new Date().toISOString()
    }).eq('id', msgId)
    window.showToast?.('success', isPinned ? 'Откреплено' : 'Закреплено', { icon:'📌' })
    loadMessages()
}

async function unpinMessage(msgId){
    await supabase.from('direct_messages').update({ pinned_at: null }).eq('id', msgId)
    window.showToast?.('success', 'Откреплено', { icon:'📌' })
    loadMessages()
}

async function deleteMsg(msgId, isMine, row){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return

    // Анимация удаления
    row.classList.add('removing')

    // Ждём завершения анимации, потом удаляем из БД
    setTimeout(async () => {
        try {
            if(isMine){
                // Удаляем для всех
                await supabase.from('direct_messages').delete().eq('id', msgId)
            } else {
                // Скрываем только для меня
                const { data:msg } = await supabase.from('direct_messages').select('hidden_for').eq('id', msgId).maybeSingle()
                const cur = msg?.hidden_for || []
                if(!cur.includes(user.id)){
                    await supabase.from('direct_messages').update({ hidden_for: [...cur, user.id] }).eq('id', msgId)
                }
            }
            row.remove()
            loadMessages(true)
        } catch(e){
            console.warn('[delete msg]', e)
            row.classList.remove('removing')
            window.showToast?.('error', 'Не удалось удалить', { icon:'⚠️' })
        }
    }, 340)
}
/* ============================================================
   ПРОФИЛЬ В ЧАТЕ
============================================================ */
async function openChatProfile(peerId, peerProfile){
    const p = peerProfile || {}
    const name = p.full_name || p.username || 'Пользователь'
    const pref = D.prefs[peerId] || {}
    const pinned = !!pref.pinned
    const muted = !!pref.muted
    const wallpaper = pref.wallpaper || 'default'

    let overlay = $('dr-profile-overlay')
    if(!overlay){
        overlay = document.createElement('div')
        overlay.id = 'dr-profile-overlay'
        overlay.className = 'dr-profile-overlay hidden'
        document.body.appendChild(overlay)
    }
    overlay.classList.remove('hidden')

    const bday = p.birthday ? new Date(p.birthday).toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' }) : 'Не указано'

    overlay.innerHTML = `
    <div class="dr-prof-topbar">
      <button class="dr-prof-back" id="dr-prof-back">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <button class="dr-prof-dots" id="dr-prof-dots">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
      </button>
    </div>

    <div class="dr-prof-hero">
      ${p.avatar_url ? `<img class="dr-prof-hero-img" src="${p.avatar_url}" alt="">` : `<div class="dr-prof-hero-fallback">${(name||'U').charAt(0).toUpperCase()}</div>`}
      <div class="dr-prof-hero-info">
        <div class="dr-prof-name">${esc(name)}</div>
        <div class="dr-prof-username">@${esc(p.username || 'user')}</div>
      </div>
    </div>

    <div class="dr-prof-controls">
      <button class="dr-prof-ctrl ${muted?'':'active'}" data-pctrl="notif">
        <span class="dr-prof-ctrl-icon">${muted?'🔕':'🔔'}</span>
        <span>${muted?'выкл':'вкл'}</span>
      </button>
      <button class="dr-prof-ctrl" data-pctrl="wall">
        <span class="dr-prof-ctrl-icon">🎨</span>
        <span>обои</span>
      </button>
      <button class="dr-prof-ctrl" data-pctrl="search">
        <span class="dr-prof-ctrl-icon">🔍</span>
        <span>поиск</span>
      </button>
      <button class="dr-prof-ctrl ${pinned?'active':''}" data-pctrl="pin">
        <span class="dr-prof-ctrl-icon">📌</span>
        <span>${pinned?'откр':'креп'}</span>
      </button>
      <button class="dr-prof-ctrl" data-pctrl="gift">
        <span class="dr-prof-ctrl-icon">🎁</span>
        <span>подарок</span>
      </button>
    </div>

    <div class="dr-prof-info-block">
      <div class="dr-prof-info-label">Bio</div>
      <div class="dr-prof-info-value">${esc(p.bio || 'Описание отсутствует')}</div>
    </div>

    <div class="dr-prof-info-block">
      <div class="dr-prof-info-label">День рождения</div>
      <div class="dr-prof-info-value">${bday}</div>
    </div>

    <div class="dr-prof-gifts">Этому пользователю ещё не дарили подарки</div>
  `

    $('dr-prof-back').addEventListener('click', () => overlay.classList.add('hidden'))

    $('dr-prof-dots').addEventListener('click', () => {
        const { peerId: pid } = D.currentChat
        window.showActionSheet('Действия', [
            { label:'Пожаловаться', icon:'⚠️', danger:true, onClick: () => {
                    if(window.openReportModal){
                        window.openReportModal({
                            targetType: 'profile',
                            targetId: pid,
                            author: p,
                            text: p.bio || '',
                            media: p.avatar_url || null
                        })
                    }
                }},
            { label:'Заблокировать', icon:'🚫', danger:true, onClick: async () => {
                    const { data:{ user } } = await supabase.auth.getUser()
                    await supabase.from('blocks').insert({ blocker_id:user.id, blocked_id:pid })
                    overlay.classList.add('hidden')
                    closeChatRoom()
                    window.showToast('success','Заблокирован',{icon:'✓'})
                }},
            { label:'Очистить чат', icon:'🧹', danger:true, onClick: () => clearChat(pid) },
            { label:'Скопировать ссылку', icon:'🔗', onClick: () => {
                    navigator.clipboard?.writeText(`${location.origin}/@${p.username||pid}`)
                    window.showToast('success','Ссылка скопирована',{icon:'✓'})
                }}
        ])
    })

    overlay.querySelectorAll('[data-pctrl]').forEach(btn => btn.addEventListener('click', async () => {
        const k = btn.dataset.pctrl
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        if(k === 'notif'){
            const { data:ex } = await supabase.from('direct_chat_prefs').select('id, muted').eq('user_id',user.id).eq('peer_id',peerId).maybeSingle()
            const now = ex ? !ex.muted : true
            if(ex) await supabase.from('direct_chat_prefs').update({ muted: now }).eq('id', ex.id)
            else await supabase.from('direct_chat_prefs').insert({ user_id:user.id, peer_id:peerId, muted: now })
            await loadDirectChats(true)
            openChatProfile(peerId, p)
        }
        if(k === 'wall'){
            window.showActionSheet('Обои чата', WALLPAPERS.map(w => ({
                label: (w === wallpaper ? '✓ ' : '') + (w === 'default' ? 'По умолчанию' : w),
                onClick: async () => {
                    const { data:ex } = await supabase.from('direct_chat_prefs').select('id').eq('user_id',user.id).eq('peer_id',peerId).maybeSingle()
                    if(ex) await supabase.from('direct_chat_prefs').update({ wallpaper:w }).eq('id', ex.id)
                    else await supabase.from('direct_chat_prefs').insert({ user_id:user.id, peer_id:peerId, wallpaper:w })
                    await loadDirectChats(true)
                    const box = $('direct-messages'); if(box){ box.className = 'direct-messages wp-' + w }
                    openChatProfile(peerId, p)
                }
            })))
        }
        if(k === 'search'){ window.showToast('info','Поиск — скоро',{icon:'🔍'}) }
        if(k === 'pin'){
            await togglePin(peerId)
            openChatProfile(peerId, p)
        }
        if(k === 'gift'){ window.showToast('info','Подарки — скоро',{icon:'🎁'}) }
    }))
}

// Глобальные хелперы
window.openDirectChat = openDirectChat
window.openDirectTab = openDirectTab