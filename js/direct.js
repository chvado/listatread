/* ============================================================
   listatread — direct.js (v4, Telegram-style, final)
   — Одна/двойная галочка, онлайн-статус, typing
   — Скелетоны + «Соединение…» в шапке
   — Свой sidebar, темы, стикеры, эмодзи
   — Режим редактирования, pin, контекст-меню
============================================================ */
import { supabase } from './supabase.js'

const $ = id => document.getElementById(id)
const esc = t => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML }
const av  = (url, name) => url ? `<img src="${url}" alt="">` : (name || '?').charAt(0).toUpperCase()

/* ============================================================
   SVG-ИКОНКИ
============================================================ */
const I = {
    menu:   '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>',
    x:      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    back:   '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    user:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
    star:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-.1z"/></svg>',
    users:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><circle cx="17" cy="9" r="2.5"/><path d="M14.5 14.5c2.5 0 4.5 2 4.5 4.5"/></svg>',
    bell:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
    lock:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    db:     '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
    palette:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 0 20c1.5 0 2-1 2-2 0-.5-.2-.9-.5-1.3-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a6 6 0 0 0 6-6c0-4-4.5-7.7-10-7.7z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="14" cy="7" r="1.2"/><circle cx="17" cy="10.5" r="1.2"/></svg>',
    globe:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    crown:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
    gift:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8s-2-5-5-5-1 5 5 5zM12 8s2-5 5-5 1 5-5 5z"/></svg>',
    rules:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v5h5M8 13h8M8 17h5"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>',
    check:  '<svg viewBox="0 0 18 12" width="16" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6l3.5 3.5L13 2"/></svg>',
    checkD: '<svg viewBox="0 0 22 12" width="20" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 6l3.2 3.2L11 2.2"/><path d="M8.5 6l3.2 3.2L18.5 2.2"/></svg>',
    smile:  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none"/><path d="M8 14.5s1.5 2 4 2 4-2 4-2"/></svg>',
    sticker:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M14 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8l7-7V6a3 3 0 0 0-3-3z"/><path d="M14 21v-4a3 3 0 0 1 3-3h4"/><circle cx="9" cy="10" r="0.9" fill="currentColor"/><circle cx="14" cy="10" r="0.9" fill="currentColor"/></svg>',
    send:   '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
    dots:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>',
    playS:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pauseS: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>',
    arrowUp:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    bookmark:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>',
    pin:    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 17v5M9 3h6l-1 8 4 3v2H6v-2l4-3z"/></svg>',
    plus:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    image:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 18l5-5 4 4 3-3 6 6"/></svg>',
    reply:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 17l-5-5 5-5M4 12h11a5 5 0 0 1 5 5v2"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    forward:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M15 17l5-5-5-5M20 12H9a5 5 0 0 0-5 5v2"/></svg>',
    info:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round"/></svg>',
}

/* ============================================================
   ТЕМЫ (15) и размеры
============================================================ */
const CHAT_THEMES = [
    { id:'t01', name:'Ночной',    light:false, bg:'#0e1621', own:'#2b5278', ownText:'#fff', peer:'#182533', peerText:'#fff' },
    { id:'t02', name:'Графит',    light:false, bg:'#1a1a1a', own:'#4a4a4a', ownText:'#fff', peer:'#2a2a2a', peerText:'#fff' },
    { id:'t03', name:'Океан',     light:false, bg:'#0d1b2a', own:'#1b6ca8', ownText:'#fff', peer:'#1b263b', peerText:'#fff' },
    { id:'t04', name:'Лес',       light:false, bg:'#0f2417', own:'#2d6a4f', ownText:'#fff', peer:'#1b3a2a', peerText:'#fff' },
    { id:'t05', name:'Виноград',  light:false, bg:'#1e1b2e', own:'#6a4c93', ownText:'#fff', peer:'#2d2745', peerText:'#fff' },
    { id:'t06', name:'Закат',     light:false, bg:'#2b1a1a', own:'#b23a48', ownText:'#fff', peer:'#3d2828', peerText:'#fff' },
    { id:'t07', name:'Пудра',     light:true,  bg:'#fdf2f8', own:'#ec4899', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t08', name:'Мята',      light:true,  bg:'#ecfdf5', own:'#10b981', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t09', name:'Небо',      light:true,  bg:'#eff6ff', own:'#3b82f6', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t10', name:'Песок',     light:true,  bg:'#fef9ec', own:'#d97706', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t11', name:'Лаванда',   light:true,  bg:'#f5f3ff', own:'#8b5cf6', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t12', name:'Роза',      light:true,  bg:'#fff1f2', own:'#e11d48', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t13', name:'Классика',  light:true,  bg:'#f2f2f7', own:'#0a84ff', ownText:'#fff', peer:'#ffffff', peerText:'#000' },
    { id:'t14', name:'Терракота', light:true,  bg:'#fef2ee', own:'#ea580c', ownText:'#fff', peer:'#ffffff', peerText:'#1f2937' },
    { id:'t15', name:'Изумруд',   light:false, bg:'#052e2b', own:'#059669', ownText:'#fff', peer:'#0a3d38', peerText:'#fff' },

]
const MSG_SIZES = [
    { id:'sm', label:'Мелкий',  fontSize:'13px', lineHeight:'1.35', pad:'7px 10px' },
    { id:'md', label:'Обычный', fontSize:'14px', lineHeight:'1.45', pad:'8px 12px' },
    { id:'lg', label:'Крупный', fontSize:'16px', lineHeight:'1.5',  pad:'10px 14px' },
]
const EMOJI = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🧠','👀','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','💞','💓','💗','💖','💘','💝','🔥','⭐','🌟','✨','⚡','💥','💫','💦','🎉','🎊','🎈','🎁','🎀','🏆','🥇','🎯','🎲','🎮','🎰','🌸','🌹','🌻','🌷','🍀','🍁','🍇','🍉','🍊','🍋','🍌','🍎','🍓','🍒','🍑','🥝','🍔','🍟','🍕','🌭','🍿','🍣','⚽','🏀','🏈','🎾','🎱','🏓','🥊','🎽','🚗','🚕','🚌','🚓','🚑','🚒','🚲','🛵','✈️','🚀','🛸','⌚','📱','💻','🎧','📷','💡','🔦','💸','💰','💎','🔧','🔨','🔮','📿','🧸','🛍️','🛒']

/* ============================================================
   Локальные настройки (prefs)
============================================================ */
const PREFS_KEY = 'lt_direct_prefs_v4'
function loadLocalPrefs(){ try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } catch { return {} } }
function saveLocalPrefs(p){ try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {} }

const D = {
        chats: [], requests: [], currentChat: null,
        refreshTimer: null, typingTimer: null, typingChannel: null,
        editMode: false, selectedChats: new Set(),
        currentUser: null, isAdmin: false, prefs: {},
        unreadTotal: 0,
        panelTab: 'emoji',
        stickerPacks: [],
        currentStickerPack: null,
        stickerSendTimes: [],
        mutedUntil: 0,
    }
;(function initPrefs(){
    const lp = loadLocalPrefs()
    if(lp.chatTheme) D.chatThemeId = lp.chatTheme
    if(lp.pinColor) D.pinColor = lp.pinColor
    if(lp.msgSize) D.msgSize = lp.msgSize
    if(lp.mutedUntil) D.mutedUntil = lp.mutedUntil || 0
})()
function getTheme(){ return CHAT_THEMES.find(t => t.id === (D.chatThemeId || 't13')) || CHAT_THEMES[12] }
function getSize(){ return MSG_SIZES.find(s => s.id === (D.msgSize || 'md')) || MSG_SIZES[1] }

/* ============================================================
   Инжектируемые оверрайды CSS (для фиксов поверх root.txt)
============================================================ */
;(function injectCSS(){
    if(document.getElementById('direct-v4-overrides')) return
    const st = document.createElement('style')
    st.id = 'direct-v4-overrides'
    st.textContent = `
        /* Шапка директа не должна уезжать */
        #screen-direct .topbar.topbar-hidden{
            transform: translateX(-50%) !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        #screen-direct .topbar{
            position: fixed !important;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 420px;
            padding: calc(env(safe-area-inset-top,0) + 14px) 16px 12px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,.88);
            backdrop-filter: saturate(180%) blur(20px);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            z-index: 100;
            margin: 0;
        }
        html[data-theme="dark"] #screen-direct .topbar{ background: rgba(0,0,0,.72) }
        #screen-direct .topbar-title{
            flex: 1; min-width: 0;
            text-align: center;
            font-size: 16px; font-weight: 600; color: var(--text);
            display: flex; align-items: center; justify-content: center;
            gap: 2px; padding: 0 8px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .direct-topbar-right{
            display: flex; align-items: center; gap: 2px;
            min-width: 40px; justify-content: flex-end;
        }
        .direct-trash-btn{
            background: transparent; border: none; color: var(--red);
            cursor: pointer; padding: 8px; display: flex; align-items: center;
        }
        .direct-title-dots{ display:inline-flex; gap:3px; margin-left:4px; vertical-align:middle }
        .direct-title-dots i{
            width:4px; height:4px; border-radius:50%;
            background: currentColor; display:inline-block;
            animation: dbounce 1.2s ease-in-out infinite;
        }
        .direct-title-dots i:nth-child(2){ animation-delay:.15s }
        .direct-title-dots i:nth-child(3){ animation-delay:.3s }
        @keyframes dbounce{
            0%,80%,100%{ transform: translateY(0); opacity:.4 }
            40%{ transform: translateY(-6px); opacity:1 }
        }
        #screen-direct #direct-body{ padding-top: 68px }
        /* Кнопка «Добавить новый чат» — своя копия класса, на случай если .new-chat-btn переопределят */
        #screen-direct .new-chat-btn{
            margin: 8px 12px 4px;
            padding: 14px 16px;
            display: flex; align-items: center; gap: 12px;
            background: var(--surface-2); border: none; border-radius: 16px;
            font-family: inherit; font-size: 15px; font-weight: 700;
            color: var(--text); cursor: pointer;
            width: calc(100% - 24px);
        }
        #screen-direct .new-chat-btn:hover{ background: var(--surface-3) }
        #screen-direct .new-chat-btn .nc-icon{
            width: 36px; height: 36px; border-radius: 50%;
            background: var(--blue); color: #fff;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        #screen-direct .new-chat-btn .nc-texts{
            display:flex; flex-direction:column; gap:2px; text-align:left; flex:1;
        }
        #screen-direct .new-chat-btn .nc-title{ font-size:15px; font-weight:700 }
        #screen-direct .new-chat-btn .nc-sub{ font-size:12px; font-weight:500; color:var(--text-secondary) }
        /* Скелетоны */
        @keyframes dskel { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .dr-skel{ display:flex; gap:12px; align-items:center; padding:12px; border-radius:16px }
        .dr-skel-ava{
            width:56px; height:56px; border-radius:50%; flex-shrink:0;
            background:linear-gradient(90deg, rgba(120,120,128,.12) 25%, rgba(120,120,128,.22) 50%, rgba(120,120,128,.12) 75%);
            background-size:200% 100%; animation:dskel 1.4s linear infinite;
        }
        .dr-skel-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
        .dr-skel-line{
            height:12px; border-radius:6px;
            background:linear-gradient(90deg, rgba(120,120,128,.12) 25%, rgba(120,120,128,.22) 50%, rgba(120,120,128,.12) 75%);
            background-size:200% 100%; animation:dskel 1.4s linear infinite;
        }
        .dr-skel-line.short{width:40%}
        .dr-skel-line.mid{width:70%}
        /* Сайдбар директа */
        .ds-backdrop{
            position:fixed; inset:0; background:rgba(0,0,0,.4);
            backdrop-filter:blur(4px); z-index:250;
            opacity:0; pointer-events:none; transition:opacity .28s ease;
        }
        .ds-backdrop.show{ opacity:1; pointer-events:auto }
        .ds-sidebar{
            position:fixed; top:0; left:0; bottom:0;
            width:84%; max-width:360px; background:var(--bg);
            z-index:251; transform:translateX(-100%);
            transition:transform .32s cubic-bezier(.32,.72,.24,1);
            display:flex; flex-direction:column;
            box-shadow:4px 0 32px rgba(0,0,0,.18);
            will-change:transform;
        }
        .ds-sidebar.open{ transform:translateX(0) }
        .ds-header{
            padding: calc(env(safe-area-inset-top,0) + 18px) 20px 14px;
            display:flex; align-items:center; gap:12px;
            border-bottom:1px solid var(--border);
        }
        .ds-brand{
            font-size:22px; font-weight:800; letter-spacing:-.03em;
            color:var(--text); display:flex; align-items:center; gap:8px;
        }
        .ds-brand-mark{
            width:32px; height:32px; border-radius:50%;
            background:#000; color:#fff;
            display:flex; align-items:center; justify-content:center;
            font-family:serif; font-size:22px; line-height:1; padding-bottom:4px; box-sizing:border-box;
        }
        html[data-theme="dark"] .ds-brand-mark{ background:#fff; color:#000 }
        .ds-scroll{ flex:1; overflow-y:auto; padding:8px 0 24px }
        .ds-section{ padding:4px 0 }
        .ds-section-title{
            padding:12px 20px 6px;
            font-size:11px; font-weight:700; letter-spacing:.08em;
            text-transform:uppercase; color:var(--text-tertiary);
        }
        .ds-item{
            display:flex; align-items:center; gap:14px;
            padding:12px 20px;
            background:transparent; border:none; width:100%;
            font-family:inherit; font-size:15px; font-weight:500;
            color:var(--text); cursor:pointer; text-align:left;
            transition:background .15s;
        }
        .ds-item:hover{ background:var(--surface-2) }
        .ds-item:active{ background:var(--surface-3) }
        .ds-item-icon{
            width:22px; height:22px; display:flex; align-items:center; justify-content:center;
            color:var(--text-secondary); flex-shrink:0;
        }
        .ds-item-chev{ margin-left:auto; color:var(--text-tertiary); font-size:14px; opacity:.6 }
        /* Пикеры/шиты для тем */
        .dr-sheet-backdrop{
            position:fixed; inset:0; background:rgba(0,0,0,.5);
            backdrop-filter: blur(8px); z-index:900; animation: fadeIn .2s ease both;
        }
        .dr-sheet{
            position:fixed; left:50%; bottom:0; transform:translateX(-50%);
            width:100%; max-width:480px; background:var(--bg);
            border-radius:24px 24px 0 0;
            padding:12px 18px calc(24px + env(safe-area-inset-bottom,0));
            z-index:901;
            animation: drSheetUp .3s cubic-bezier(.32,.72,.24,1) both;
            max-height:90dvh; display:flex; flex-direction:column;
        }
        @keyframes drSheetUp{ from{ transform:translate(-50%,100%) } to{ transform:translate(-50%,0) } }
        .dr-sheet-handle{
            width:44px; height:5px; border-radius:100px;
            background:var(--border-strong); margin:6px auto 14px; flex-shrink:0;
        }
        .dr-sheet-title{ font-size:18px; font-weight:700; margin-bottom:12px; text-align:center }
        .dr-sheet-scroll{ overflow-y:auto; flex:1; min-height:0 }
        .dr-theme-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:4px 0 8px }
        .dr-theme-cell{
            aspect-ratio:1/1.15; border-radius:14px; border:2px solid transparent;
            background:transparent; cursor:pointer; padding:0; overflow:hidden;
            display:flex; flex-direction:column; transition:border-color .15s, transform .15s;
        }
        .dr-theme-cell:active{ transform:scale(.96) }
        .dr-theme-cell.active{ border-color:var(--blue) }
        .dr-theme-preview{ flex:1; display:flex; flex-direction:column; justify-content:flex-end; padding:6px; gap:4px }
        .dr-theme-bubble{ height:12px; border-radius:7px; max-width:70%; box-shadow:0 1px 2px rgba(0,0,0,.06) }
        .dr-theme-bubble.p{ align-self:flex-start }
        .dr-theme-bubble.o{ align-self:flex-end }
        .dr-theme-name{
            font-size:10.5px; font-weight:600; text-align:center; padding:4px 0;
            background:var(--surface-2); color:var(--text);
        }
        .dr-theme-cell.active .dr-theme-name{ color:var(--blue) }
        .dr-section-label{
            font-size:12px; font-weight:700; text-transform:uppercase;
            letter-spacing:.06em; color:var(--text-tertiary); padding:14px 2px 8px;
        }
        .dr-color-row{ display:flex; gap:8px; flex-wrap:wrap; padding-bottom:6px }
        .dr-color-dot{
            width:38px; height:38px; border-radius:50%; border:2px solid transparent;
            cursor:pointer; padding:0; transition:transform .15s, border-color .15s;
        }
        .dr-color-dot:active{ transform:scale(.9) }
        .dr-color-dot.active{ border-color:var(--text); box-shadow:0 0 0 2px var(--bg), 0 0 0 4px var(--text) }
        .dr-size-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px }
        .dr-size-btn{
            padding:12px 6px; border-radius:12px; border:2px solid transparent;
            background:var(--surface-2); color:var(--text); font-family:inherit;
            font-size:13px; font-weight:600; cursor:pointer;
            transition:border-color .15s, background .15s;
        }
        .dr-size-btn.active{ border-color:var(--blue); background:rgba(10,132,255,.08); color:var(--blue) }
        .dr-size-btn small{ display:block; opacity:.65; font-size:11px; margin-top:2px }
        /* Панель эмодзи/стикеров */
        .dr-panel{
            max-height:0; overflow:hidden; background:var(--bg);
            border-top:1px solid var(--border);
            transition:max-height .3s cubic-bezier(.32,.72,.24,1);
            flex-shrink:0;
        }
        .dr-panel.open{ max-height:45vh; overflow-y:auto }
        .dr-panel-tabs{
            display:flex; gap:6px; padding:10px 12px 6px;
            border-bottom:1px solid var(--border);
            position:sticky; top:0; background:var(--bg); z-index:2;
        }
        .dr-panel-tab{
            padding:8px 14px; border-radius:100px; border:none; background:transparent;
            color:var(--text-secondary); font-family:inherit; font-size:13px; font-weight:600;
            cursor:pointer; display:flex; align-items:center; gap:6px;
        }
        .dr-panel-tab.active{ background:var(--surface-2); color:var(--text) }
        .dr-panel-body{ padding:8px 6px 14px }
        .dr-emoji-grid{ display:grid; grid-template-columns:repeat(8,1fr); gap:2px; padding:6px }
        .dr-emoji-grid button{
            aspect-ratio:1; background:transparent; border:none;
            font-size:24px; cursor:pointer; border-radius:8px;
            transition:background .12s, transform .12s;
        }
        .dr-emoji-grid button:hover{ background:var(--surface-2) }
        .dr-emoji-grid button:active{ transform:scale(.9) }
        .dr-sticker-packs{ display:flex; gap:8px; padding:6px 10px 10px; overflow-x:auto; scrollbar-width:none }
        .dr-sticker-packs::-webkit-scrollbar{ display:none }
        .dr-sticker-pack{
            width:52px; height:52px; border-radius:14px; background:var(--surface-2);
            border:2px solid transparent; cursor:pointer; flex-shrink:0;
            display:flex; align-items:center; justify-content:center; overflow:hidden;
            transition:border-color .15s, transform .15s;
        }
        .dr-sticker-pack.active{ border-color:var(--blue) }
        .dr-sticker-pack:active{ transform:scale(.94) }
        .dr-sticker-pack img{ width:100%; height:100%; object-fit:cover }
        .dr-sticker-pack-add{ color:var(--text-secondary); font-size:24px; font-weight:300 }
        .dr-stickers-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:10px 12px }
        .dr-sticker-item{ aspect-ratio:1; background:transparent; border:none; cursor:pointer; padding:4px; transition:transform .12s }
        .dr-sticker-item:active{ transform:scale(.9) }
        .dr-sticker-item img{ width:100%; height:100%; object-fit:contain }
        .dr-sticker-empty{ text-align:center; padding:30px 20px; color:var(--text-secondary); font-size:13.5px }
        .dr-sticker-empty-btn{
            margin-top:14px; padding:10px 18px; background:var(--blue); color:#fff;
            border:none; border-radius:12px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer;
        }
        /* Компоузер */
        .dr-composer{
            display:flex; gap:6px; align-items:flex-end;
            padding:8px 10px;
            padding-bottom:calc(8px + env(safe-area-inset-bottom,0));
            background:var(--bg); border-top:1px solid var(--border);
        }
        .dr-composer-btn{
            width:38px; height:38px; border-radius:50%;
            background:transparent; border:none; color:var(--text-secondary);
            display:flex; align-items:center; justify-content:center;
            cursor:pointer; flex-shrink:0;
            transition:background .15s, color .15s;
        }
        .dr-composer-btn:hover{ background:var(--surface-2); color:var(--text) }
        .dr-input-wrap{
            flex:1; position:relative; display:flex; align-items:center;
            background:var(--surface-2); border-radius:22px;
            min-height:38px; padding:0 6px 0 4px;
        }
        .dr-input-wrap input{
            flex:1; background:transparent !important; border:none !important;
            box-shadow:none !important; padding:9px 6px !important;
            font-size:15px; color:var(--text); outline:none;
        }
        .dr-input-wrap input::placeholder{ color:var(--text-tertiary) }
        .dr-input-emoji{
            width:32px; height:32px; border-radius:50%;
            background:transparent; border:none; color:var(--text-secondary);
            display:flex; align-items:center; justify-content:center;
            cursor:pointer; flex-shrink:0;
        }
        .dr-input-emoji:hover{ color:var(--text) }
        .dr-send-btn{
            width:40px; height:40px; border-radius:50%;
            background:var(--blue); color:#fff; border:none; cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            flex-shrink:0; transition:transform .15s, background .15s;
        }
        .dr-send-btn:active{ transform:scale(.93) }
        /* Пузыри */
        .direct-bubble{
            padding: var(--bubble-pad, 8px 12px);
            border-radius: 18px;
            font-size: var(--bubble-size, 14px);
            line-height: var(--bubble-lh, 1.45);
            word-break: break-word;
            position: relative;
            max-width: 100%;
            box-shadow: 0 1px 2px rgba(0,0,0,.06);
            border-top-left-radius: 6px;
        }
        .dr-row.mine .direct-bubble{ border-top-left-radius:18px; border-top-right-radius:6px }
        .direct-bubble-foot{
            display:flex; align-items:center; justify-content:flex-end; gap:4px;
            font-size:10.5px; opacity:.75; margin-top:3px; min-height:12px;
        }
        .direct-bubble-foot .dr-check{ display:inline-flex; margin-left:2px }
        .direct-bubble-foot .dr-check.read{ color:#5fdfff }
        .dr-sticker{ background:transparent !important; box-shadow:none !important; padding:0 !important; border-radius:0 !important }
        .dr-sticker img{ width:140px; height:140px; object-fit:contain; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,.15)) }
        /* Профиль в чате (оверрайд) */
        .dr-profile-overlay{
            position:fixed; inset:0; z-index:200; background:var(--bg);
            display:flex; flex-direction:column; overflow-y:auto;
            animation: drProfIn .32s cubic-bezier(.32,.72,.24,1) both;
        }
        @keyframes drProfIn{ from{ opacity:0; transform:translateY(28px) } to{ opacity:1; transform:translateY(0) } }
        .dr-prof-hero{
            position:relative; width:calc(100% - 24px); margin:0 12px;
            aspect-ratio:1/1; max-height:50vh; border-radius:24px; overflow:hidden;
            background:linear-gradient(135deg,#ffd60a,#ff375f);
            display:flex; align-items:flex-end; padding:20px; color:#fff;
        }
        .dr-prof-hero-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover }
        .dr-prof-hero-fallback{
            position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
            font-size:96px; font-weight:900; color:#fff;
            background:linear-gradient(135deg,#ff9f0a,#ff375f,#bf5af2);
        }
        .dr-prof-hero-info{
            position:relative; z-index:2; width:100%;
            text-shadow:0 2px 8px rgba(0,0,0,.6);
            background:linear-gradient(180deg,transparent,rgba(0,0,0,.4));
            margin:-20px; padding:20px;
        }
        .dr-prof-name{ font-size:24px; font-weight:800 }
        .dr-prof-username{ font-size:14px; opacity:.9; margin-top:2px }
        /* Пины */
        .dr-pinned-bar{
            display:flex; align-items:center; gap:10px; padding:8px 14px;
            background:var(--surface-2); border-bottom:1px solid var(--border);
            cursor:pointer; flex-shrink:0;
            animation: drSlideDown .28s ease both;
        }
        @keyframes drSlideDown{ from{ opacity:0; transform:translateY(-8px) } to{ opacity:1; transform:translateY(0) } }
        .dr-pinned-bar.hidden{ display:none }
        .dr-pinned-icon{
            width:26px; height:26px; border-radius:50%;
            background:var(--pin-color, var(--blue)); color:#fff;
            display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .dr-pinned-body{ flex:1; min-width:0 }
        .dr-pinned-title{
            font-size:11px; font-weight:700; color:var(--pin-color, var(--blue));
            text-transform:uppercase; letter-spacing:.05em;
        }
        .dr-pinned-text{
            font-size:13px; color:var(--text-secondary);
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;
        }
        .dr-pinned-unpin{
            background:transparent; border:none; color:var(--text-secondary);
            cursor:pointer; padding:4px 6px; flex-shrink:0; display:flex; align-items:center;
        }
        .dr-pinned-count{
            background:var(--pin-color, var(--blue)); color:#fff;
            font-size:10px; font-weight:700; padding:2px 7px; border-radius:100px; flex-shrink:0;
        }
        /* Контекст-меню сообщения */
        .dr-msg-menu{
            position:fixed; z-index:1500; background:var(--bg);
            border-radius:14px;
            box-shadow:0 12px 40px rgba(0,0,0,.35), 0 0 0 1px var(--border);
            overflow:hidden; min-width:200px; padding:4px 0;
            animation: drMenuIn .18s cubic-bezier(.34,1.4,.64,1) both;
        }
        @keyframes drMenuIn{ from{ opacity:0; transform:scale(.92) translateY(-6px) } to{ opacity:1; transform:scale(1) translateY(0) } }
        .dr-msg-menu-item{
            display:flex; align-items:center; gap:14px;
            padding:11px 16px; background:transparent; border:none; width:100%;
            font-family:inherit; font-size:14.5px; font-weight:500;
            color:var(--text); cursor:pointer; text-align:left;
            transition:background .12s;
        }
        .dr-msg-menu-item:hover{ background:var(--surface-2) }
        .dr-msg-menu-item.danger{ color:var(--red) }
        .dr-msg-menu-item svg{ flex-shrink:0; opacity:.9 }
        /* Дополнительно: dr-row анимации */
        @keyframes drMsgIn{ from{ opacity:0; transform: translateY(8px) scale(.96) } to{ opacity:1; transform: translateY(0) scale(1) } }
        @keyframes drMsgInMine{ from{ opacity:0; transform: translateY(8px) translateX(16px) scale(.96) } to{ opacity:1; transform: translateY(0) translateX(0) scale(1) } }
        .dr-row{ animation: drMsgIn .3s cubic-bezier(.34,1.4,.64,1) both }
        .dr-row.mine{ animation: drMsgInMine .3s cubic-bezier(.34,1.4,.64,1) both }
        .dr-row.pressing .direct-bubble{ transform: scale(.96); transition: transform .12s var(--ease) }
        .dr-row.highlight .direct-bubble{
            animation: drHighlight 1.8s var(--ease);
        }
        @keyframes drHighlight{
            0%,100% { box-shadow: 0 1px 2px rgba(0,0,0,.06) }
            20%,80% { box-shadow: 0 0 0 3px var(--blue), 0 4px 16px rgba(10,132,255,.35) }
        }
    `
    document.head.appendChild(st)
})()
const REACTIONS = ['❤️','👍','👎','🔥','😂','😮','😢','🙏','👏','🎉','🤔','😍','💯','😡','🤝']
const shareOf = c => { const m = (c || '').match(/^\[share:(.+)\]$/); if(!m) return null; try { return JSON.parse(decodeURIComponent(m[1])) } catch { return null } }
const contentLabel = c => c?.startsWith('[sticker:') ? 'Стикер' : c?.startsWith('[share:') ? 'Вложение' : (c || '')
const sAva = (url, name) => url ? `<img src="${esc(url)}" alt="">` : esc((name || '?').charAt(0).toUpperCase())

function renderShareCard(d){
    const k = d.k
    const go = `<button class="sh-go" data-sh-go aria-label="Перейти">${I.arrowUp}</button>`
    const authorLine = `<div class="sh-line"><span>${esc(d.uname || 'user')}</span><div class="sh-ava">${sAva(d.uava, d.uname)}</div></div>`
    const chLine = d.ch ? `<div class="sh-line"><span>${esc(d.ch)}</span><div class="sh-ava">${sAva(d.chava, d.ch)}</div></div>` : ''
    const at = `data-k="${k}" data-pid="${esc(d.pid || '')}" data-src="${esc(d.src || '')}" data-uid="${esc(d.uid || '')}" data-title="${esc(d.title || '')}"`
    if(k === 'video') return `<div class="sh-card sh-video" ${at}>
        <video src="${esc(d.src)}#t=0.1" preload="metadata" muted playsinline></video><div class="sh-shade"></div>
        <button class="sh-play" aria-label="Смотреть">${I.playS}</button></div>`
    if(k === 'photo') return `<div class="sh-card sh-square" ${at}>
        <div class="sh-bg" style="background-image:url('${esc(d.src)}')"></div><div class="sh-shade"></div>${go}
        <div class="sh-info">${chLine}${authorLine}<div class="sh-desc">${esc((d.desc || '').slice(0, 30))}</div></div></div>`
    if(k === 'track') return `<div class="sh-card sh-square" ${at}>
        <div class="sh-bg" style="background-image:url('${esc(d.chava || '')}')"></div><div class="sh-shade"></div>
        <button class="sh-save" data-sh-save aria-label="Сохранить">${I.bookmark}</button>
        <button class="sh-pp" data-sh-pp data-src="${esc(d.src)}" aria-label="Пауза/играть">${I.playS}</button>
        <div class="sh-info"><div class="sh-title">${esc(d.title || 'Трек')}</div>${authorLine}${chLine}<div class="sh-sub">прослушайте трек</div></div></div>`
    if(k === 'profile') return `<div class="sh-card sh-profile" ${at}>${go}
        <div class="sh-ava">${sAva(d.ava, d.name)}</div><div class="sh-pname">${esc(d.name || 'Пользователь')}</div>
        <div class="sh-puser">@${esc(d.un || 'user')}</div></div>`
    return `<div class="sh-card sh-text" ${at}>${go}
        <div class="sh-head"><div class="sh-ava">${sAva(d.uava, d.uname)}</div><span>${esc(d.uname || 'user')}${d.ch ? ' · ' + esc(d.ch) : ''}</span></div>
        <div class="sh-body">${esc((d.desc || '').slice(0, 60))}${(d.desc || '').length > 60 ? '…' : ''}</div></div>`
}

function bindShareCards(box){
    const L = () => window.__lt
    box.querySelectorAll('.sh-card').forEach(card => {
        const k = card.dataset.k, pid = card.dataset.pid
        card.addEventListener('click', async e => {
            e.stopPropagation()
            if(e.target.closest('[data-sh-save]')){ L()?.saveTrack(pid); return }
            if(e.target.closest('[data-sh-pp]')){ L()?.playTrack(pid, card.dataset.src, card.dataset.title); return }
            if(e.target.closest('[data-sh-go]')){
                leaveChat()
                if(k === 'profile') L()?.openProfile(card.dataset.uid); else L()?.openPost(pid)
                return
            }
            if(k === 'video') L()?.openFs(card.dataset.src, pid)
        })
    })
    syncShareTrackBtns()
}
function syncShareTrackBtns(){
    const m = window.__lt?.music; if(!m) return
    document.querySelectorAll('.sh-pp').forEach(b => { b.innerHTML = (m.src === b.dataset.src && m.isPlaying) ? I.pauseS : I.playS })
}
document.addEventListener('lt-player-state', syncShareTrackBtns)

function leaveChat(){
    const r = $('direct-room'); if(r) r.classList.add('hidden')
    D.currentChat = null
    if(D.refreshTimer){ clearInterval(D.refreshTimer); D.refreshTimer = null }
    unsubscribeTyping()
    document.body.classList.remove('in-direct')
}
/* ============================================================
   ЭКРАН ДИРЕКТА
============================================================ */
export function buildDirectScreen(){
    if($('screen-direct')) return $('screen-direct')
    const s = document.createElement('section')
    s.id = 'screen-direct'
    s.className = 'app-screen'
    s.innerHTML = `
    <header class="topbar">
      <button class="topbar-btn" id="direct-menu-btn" title="Меню">${I.menu}</button>
      <div class="topbar-title" id="direct-title">listadirect</div>
      <div class="direct-topbar-right">
        <button class="topbar-btn direct-trash-btn hidden" id="direct-trash-btn" title="Удалить выбранные">${I.trash}</button>
        <button class="topbar-btn" id="direct-edit-btn" title="Изменить">
          <span class="icon-pencil">${I.pencil}</span>
          <span class="icon-x hidden">${I.x}</span>
        </button>
      </div>
    </header>
    <div id="direct-body" style="position:relative">
      <button class="new-chat-btn" id="direct-new-chat-btn">
        <span class="nc-icon">${I.pencil}</span>
        <span class="nc-texts">
          <span class="nc-title">Добавить новый чат</span>
          <span class="nc-sub">Начните общение</span>
        </span>
        <span style="color:var(--text-tertiary); display:flex; align-items:center; flex-shrink:0">${I.arrowR}</span>
      </button>
      <div id="direct-requests-block"></div>
      <div class="direct-list" id="direct-list"></div>
    </div>
    `
    document.getElementById('main-app').appendChild(s)

    s.querySelector('#direct-menu-btn').addEventListener('click', openDirectSidebar)
    s.querySelector('#direct-edit-btn').addEventListener('click', toggleDirectEdit)
    s.querySelector('#direct-trash-btn').addEventListener('click', deleteSelectedChats)
    s.querySelector('#direct-new-chat-btn').addEventListener('click', openNewChatScreen)
    return s
}

export function openDirectTab(){
    buildDirectScreen()
    document.querySelectorAll('.app-screen').forEach(x => x.classList.remove('active'))
    $('screen-direct')?.classList.add('active')
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => {
        if($('screen-direct')?.classList.contains('active') && !D.currentChat) loadDirectChats(true)
    }, 5000)
    loadDirectChats()
    window.scrollTo(0,0)
}

/* ============================================================
   ШАПКА: «Соединение…» и «listadirect»
============================================================ */
function setHeaderLoading(){
    const t = $('direct-title')
    if(t) t.innerHTML = `Соединение<span class="direct-title-dots"><i></i><i></i><i></i></span>`
}
function setHeaderReady(){
    const t = $('direct-title')
    if(t) t.textContent = 'listadirect'
}

function renderSkeletons(){
    const box = $('direct-list'); if(!box) return
    box.innerHTML = Array.from({length:7}).map(() => `
      <div class="dr-skel">
        <div class="dr-skel-ava"></div>
        <div class="dr-skel-body">
          <div class="dr-skel-line short"></div>
          <div class="dr-skel-line mid"></div>
        </div>
      </div>`).join('')
    setHeaderLoading()
}

/* ============================================================
   РЕЖИМ РЕДАКТИРОВАНИЯ
============================================================ */
function toggleDirectEdit(){
    D.editMode = !D.editMode
    if(!D.editMode) D.selectedChats.clear()
    const pencil = document.querySelector('#direct-edit-btn .icon-pencil')
    const xIcon = document.querySelector('#direct-edit-btn .icon-x')
    if(pencil) pencil.classList.toggle('hidden', D.editMode)
    if(xIcon) xIcon.classList.toggle('hidden', !D.editMode)
    updateTrashBtn()
    renderChats()
}
function updateTrashBtn(){
    const btn = $('direct-trash-btn'); if(!btn) return
    btn.classList.toggle('hidden', !(D.editMode && D.selectedChats.size > 0))
}
async function deleteSelectedChats(){
    if(!D.selectedChats.size) return
    if(!confirm(`Удалить ${D.selectedChats.size} чат(ов)? Сообщения будут удалены у вас.`)) return
    const { data:{ user } } = await supabase.auth.getUser()
    for(const peerId of D.selectedChats){
        try {
            await supabase.from('direct_messages').delete().or(
                `and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`
            )
            await supabase.from('direct_chat_prefs').delete().eq('user_id', user.id).eq('peer_id', peerId)
        } catch {}
    }
    D.selectedChats.clear()
    updateTrashBtn()
    loadDirectChats()
    window.showToast?.('success', 'Чаты удалены', { icon: I.check })
}

/* ============================================================
   ЗАГРУЗКА СПИСКА
============================================================ */
async function loadDirectChats(silent = false){
    const box = $('direct-list'); if(!box) return
    if(!silent){ renderSkeletons() }

    const { data:{ user } } = await supabase.auth.getUser()
    if(!user){ box.innerHTML = '<p class="empty">Не удалось подключиться</p>'; setHeaderReady(); return }
    D.currentUser = user

    try {
        const { data:prof } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
        D.isAdmin = !!prof?.is_admin
    } catch {}

    try {
        const { data:prefs } = await supabase.from('direct_chat_prefs')
            .select('peer_id, pinned, pinned_at, muted, wallpaper').eq('user_id', user.id)
        D.prefs = {}
        ;(prefs||[]).forEach(p => { D.prefs[p.peer_id] = p })
    } catch { D.prefs = {} }

    const { data: msgs, error } = await supabase.from('direct_messages')
        .select('id, from_id, to_id, content, media_url, media_type, is_read, created_at')
        .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
        .order('created_at', { ascending:false }).limit(500)

    if(error){
        box.innerHTML = `<p class="empty">Ошибка: ${esc(error.message)}</p>`
        setHeaderReady(); return
    }

    const byPeer = new Map()
    for(const m of (msgs || [])){
        const peerId = m.from_id === user.id ? m.to_id : m.from_id
        if(!byPeer.has(peerId)) byPeer.set(peerId, { peerId, lastMsg: m, unread: 0 })
        if(m.to_id === user.id && !m.is_read) byPeer.get(peerId).unread++
    }

    let reqs = []
    try {
        const { data:cr } = await supabase.from('chat_requests')
            .select('id, from_user, first_message, created_at')
            .eq('to_user', user.id).eq('status', 'pending')
            .order('created_at', { ascending:false }).limit(30)
        reqs = cr || []
        const ids = reqs.map(r => r.from_user)
        if(ids.length){
            const { data:profs } = await supabase.from('profiles')
                .select('id, username, full_name, avatar_url, status, status_emoji, last_seen').in('id', ids)
            const pm = Object.fromEntries((profs||[]).map(p => [p.id, p]))
            reqs = reqs.map(r => ({ ...r, profile: pm[r.from_user] || {} }))
        }
    } catch {}

    const ids = [...byPeer.keys()]
    let pm = {}
    if(ids.length){
        const { data: profs } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji, is_admin, last_seen')
            .in('id', ids)
        pm = Object.fromEntries((profs||[]).map(p => [p.id, p]))
    }

    D.chats = ids.map(id => ({ ...byPeer.get(id), profile: pm[id] || {} }))

    const unreadTotal = D.chats.reduce((s, c) => s + (c.unread || 0), 0) + reqs.length
    D.unreadTotal = unreadTotal
    updateHomeBadge(unreadTotal)

    D.requests = reqs
    renderRequests()

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

    setHeaderReady()
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

/* ============================================================
   ФОРМАТ ВРЕМЕНИ
============================================================ */
function formatListTime(iso){
    const d = new Date(iso)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yest  = new Date(today); yest.setDate(yest.getDate() - 1)
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if(dd.getTime() === today.getTime()) return d.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })
    if(dd.getTime() === yest.getTime())  return 'Вчера'
    if(dd.getFullYear() === now.getFullYear()) return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' })
    return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'2-digit' })
}
function timeOnly(iso){ return new Date(iso).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' }) }

/* ============================================================
   ОНЛАЙН-СТАТУС
============================================================ */
function getOnlineStatus(profile){
    const lastSeen = profile?.last_seen
    if(!lastSeen) return { text:'Был(а) в сети', cls:'' }
    const last = new Date(lastSeen).getTime()
    const now = Date.now()
    const diffMin = (now - last) / 60000
    if(diffMin < 5) return { text:'В сети', cls:'online' }
    const d = new Date(lastSeen)
    const nowD = new Date()
    const today = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate())
    const yest  = new Date(today); yest.setDate(yest.getDate() - 1)
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if(dd.getTime() === today.getTime()) return { text:`Был(а) в сети в ${timeOnly(lastSeen)}`, cls:'' }
    if(dd.getTime() === yest.getTime())  return { text:`Был(а) в сети вчера в ${timeOnly(lastSeen)}`, cls:'' }
    return { text:`был(а) в сети ${d.toLocaleDateString('ru-RU', { day:'2-digit', month:'long' })}`, cls:'' }
}

/* ============================================================
   СПИСОК ЧАТОВ
============================================================ */
function renderChats(){
    const box = $('direct-list'); if(!box) return
    if(!D.chats.length){ box.innerHTML = '<p class="empty">Нет чатов. Начните общение.</p>'; return }

    const pinColor = D.pinColor || '#0a84ff'

    const html = D.chats.map((c, idx) => {
        const p = c.profile || {}
        const name = p.full_name || p.username || 'Пользователь'
        const last = c.lastMsg
        let preview = ''
        if(last.media_type === 'video') preview = 'Видео'
        else if(last.media_type === 'audio') preview = 'Аудио'
        else if(last.media_type === 'image') preview = 'Фото'
        else preview = contentLabel(last.content)

        const isMine = last.from_id === D.currentUser?.id
        const previewHtml = isMine ? `<b>Вы:</b> ${esc(preview)}` : esc(preview)

        const pref = D.prefs[c.peerId] || {}
        const time = formatListTime(last.created_at)
        const selected = D.selectedChats.has(c.peerId)
        const pinned = !!pref.pinned

        // Еле заметная заливка для закреплённых (цвет берётся из --pin-color в настройках оформления)
        const pinnedStyle = pinned
            ? `style="background: color-mix(in srgb, ${pinColor} 14%, transparent)"`
            : ''

        return `
          ${idx > 0 ? '<div class="direct-item-sep"></div>' : ''}
          <div class="direct-item ${selected ? 'selected' : ''} ${pinned ? 'is-pinned' : ''}" data-peer="${c.peerId}" ${pinnedStyle}>
            ${D.editMode ? `<button class="direct-item-check ${selected ? 'on' : ''}" data-check="${c.peerId}"></button>` : ''}
            <div class="direct-item-avatar">
              ${av(p.avatar_url, name)}
              ${pinned ? `<span class="direct-item-pin-badge">${I.pin}</span>` : ''}
            </div>
            <div class="direct-item-info">
              <div class="direct-item-row1">
                <div class="direct-item-name">${esc(name)}</div>
              </div>
              <div class="direct-item-row2">
                <div class="direct-item-preview">${previewHtml}</div>
                <div class="direct-item-meta">
                  ${c.unread ? `<div class="direct-item-badge">${c.unread > 99 ? '99+' : c.unread}</div>` : ''}
                  <div class="direct-item-time">${time}</div>
                </div>
              </div>
            </div>
          </div>`
    }).join('')

    box.innerHTML = html

    box.querySelectorAll('.direct-item').forEach(el => {
        el.addEventListener('click', () => {
            const peerId = el.dataset.peer
            if(D.editMode){
                if(D.selectedChats.has(peerId)) D.selectedChats.delete(peerId)
                else D.selectedChats.add(peerId)
                updateTrashBtn()
                renderChats()
                return
            }
            const c = D.chats.find(x => x.peerId === peerId)
            if(c) openDirectChat(peerId, c.profile)
        })
    })
}

/* ============================================================
   ЗАПРОСЫ НА ЧАТ
============================================================ */
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
    try {
        const { data:ex } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', peerId).maybeSingle()
        if(!ex) await supabase.from('follows').insert({ follower_id: user.id, following_id: peerId })
    } catch {}
    await supabase.from('chat_requests').update({ status:'accepted' }).eq('id', reqId)
    window.showToast?.('success', 'Запрос принят', { icon: I.check })
    await loadDirectChats()
    setTimeout(() => openDirectChat(peerId), 250)
}

/* ============================================================
   САЙДБАР
============================================================ */
function ensureSidebar(){
    if($('ds-sidebar')) return
    const back = document.createElement('div')
    back.className = 'ds-backdrop'
    back.id = 'ds-backdrop'
    back.addEventListener('click', closeDirectSidebar)

    const sb = document.createElement('aside')
    sb.className = 'ds-sidebar'
    sb.id = 'ds-sidebar'
    sb.innerHTML = `
      <div class="ds-header">
        <div class="ds-brand"><span class="ds-brand-mark">ℓ</span><span>listadirect</span></div>
      </div>
      <div class="ds-scroll">
        <div class="ds-section">
          <button class="ds-item" data-ds="profile"><span class="ds-item-icon">${I.user}</span>Мой профиль<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="favorites"><span class="ds-item-icon">${I.star}</span>Избранное<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="groups"><span class="ds-item-icon">${I.users}</span>Группы<span class="ds-item-chev">›</span></button>
        </div>
        <div class="ds-section-title">Настройки</div>
        <div class="ds-section">
          <button class="ds-item" data-ds="notifications"><span class="ds-item-icon">${I.bell}</span>Уведомления<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="privacy"><span class="ds-item-icon">${I.lock}</span>Конфиденциальность<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="storage"><span class="ds-item-icon">${I.db}</span>Загрузка и память<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="theme"><span class="ds-item-icon">${I.palette}</span>Оформление<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="lang"><span class="ds-item-icon">${I.globe}</span>Язык<span class="ds-item-chev">›</span></button>
        </div>
        <div class="ds-section-title">Сервисы</div>
        <div class="ds-section">
          <button class="ds-item" data-ds="chvad"><span class="ds-item-icon">${I.crown}</span>listatread chvad<span class="ds-item-chev">›</span></button>
          <button class="ds-item" data-ds="gifts"><span class="ds-item-icon">${I.gift}</span>Подарки<span class="ds-item-chev">›</span></button>
        </div>
        <div class="ds-section-title">Помощь</div>
        <div class="ds-section">
          <button class="ds-item" data-ds="rules"><span class="ds-item-icon">${I.rules}</span>Правила сообщества<span class="ds-item-chev">›</span></button>
        </div>
      </div>`
    document.body.appendChild(back)
    document.body.appendChild(sb)

    sb.querySelectorAll('[data-ds]').forEach(btn => btn.addEventListener('click', async () => {
        const k = btn.dataset.ds
        closeDirectSidebar()
        // Закрываем директ перед переходом
        const directScreen = $('screen-direct')
        if(directScreen) directScreen.classList.remove('active')
        const room = $('direct-room'); if(room) room.classList.add('hidden')
        document.body.classList.remove('in-direct')
        D.currentChat = null
        if(D.refreshTimer){ clearInterval(D.refreshTimer); D.refreshTimer = null }
        await new Promise(r => setTimeout(r, 180))

        const goScreen = (name) => {
            const nav = document.querySelector(`.nav-btn[data-screen="${name}"]`)
            if(nav) nav.click()
        }
        switch(k){
            case 'profile': goScreen('profile'); break
            case 'favorites': window.showToast?.('info','Избранное — скоро'); openDirectTab(); break
            case 'groups': window.showToast?.('info','Группы — скоро'); openDirectTab(); break
            case 'notifications': goScreen('settings'); break
            case 'privacy': goScreen('settings'); break
            case 'storage': window.showToast?.('info','Загрузка и память — скоро'); openDirectTab(); break
            case 'theme': openDirectTab(); setTimeout(openThemePicker, 220); break
            case 'lang': openDirectTab(); setTimeout(() => document.getElementById('lang-selector')?.click(), 220); break
            case 'chvad': window.showToast?.('info','listatread chvad'); openDirectTab(); break
            case 'gifts': openDirectTab(); setTimeout(() => document.querySelector('[data-prioriti="open"]')?.click(), 220); break
            case 'rules': window.open('/rules','_blank'); openDirectTab(); break
        }
    }))
}
function openDirectSidebar(){
    ensureSidebar()
    requestAnimationFrame(() => {
        $('ds-backdrop')?.classList.add('show')
        $('ds-sidebar')?.classList.add('open')
    })
}
function closeDirectSidebar(){
    $('ds-backdrop')?.classList.remove('show')
    $('ds-sidebar')?.classList.remove('open')
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
        <button class="dnc-back" id="dnc-back" aria-label="Назад">${I.back}</button>
        <div class="dnc-search">
          <input type="text" id="dnc-input" placeholder="Поиск по ID или @username" autocomplete="off" autocapitalize="off" spellcheck="false">
          <button class="dnc-clear hidden" id="dnc-clear" aria-label="Очистить">${I.x}</button>
        </div>
      </header>
      <div class="dnc-body">
        <h2 class="dnc-title">Начните новый чат</h2>
        <div class="dnc-note">
          Вы можете отправить сообщение своим подписчикам в безлимитном количестве, но пользователь не сможет вам ответить пока не подпишется на вас.
          Или отправьте запрос на переписку, отправив <b>от 1 сообщения</b> — если вы и пользователь взаимно подпишитесь и пользователь примет ваш запрос, чат автоматически начнётся.
          <br><br>
          Перед отправкой сообщений ознакомьтесь с <a href="/rules" target="_blank">правилами сообщества</a>.
        </div>
        <div id="dnc-results"></div>
      </div>`
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
    input.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); searchNewChat(input.value.trim()) } })
    input.focus()
}

async function searchNewChat(term){
    const box = $('dnc-results'); if(!box) return
    if(!term){ box.innerHTML = ''; return }
    box.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-secondary)">Поиск…</div>'
    const clean = term.replace(/^@/, '')
    const { data:me } = await supabase.auth.getUser()
    const myId = me?.user?.id
    const { data } = await supabase.from('profiles')
        .select('id, username, full_name, avatar_url, status, status_emoji, bio')
        .or(`username.ilike.%${clean}%,full_name.ilike.%${clean}%,public_id.eq.${clean.toUpperCase()}`)
        .neq('id', myId).limit(20)
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
   ОТКРЫТИЕ ЧАТА
============================================================ */
export async function openDirectChat(peerId, peerProfile = null){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    if(peerId === user.id){ window.showToast?.('error','Нельзя писать себе'); return }
    if(!peerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(peerId)){
        window.showToast?.('error','Некорректный пользователь'); return
    }

    const [{ data:blockRow }, { data:blockedBy }] = await Promise.all([
        supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', peerId).maybeSingle(),
        supabase.from('blocks').select('id').eq('blocker_id', peerId).eq('blocked_id', user.id).maybeSingle()
    ])
    if(blockRow || blockedBy){ window.showToast?.('error','Переписка недоступна'); return }

    if(!peerProfile){
        const { data } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji, bio, birthday, is_admin, last_seen').eq('id', peerId).maybeSingle()
        peerProfile = data || {}
    } else if(peerProfile.last_seen === undefined){
        const { data } = await supabase.from('profiles')
            .select('id, username, full_name, avatar_url, status, status_emoji, bio, birthday, is_admin, last_seen').eq('id', peerId).maybeSingle()
        peerProfile = { ...peerProfile, ...(data||{}) }
    }

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
        window.showToast?.('error','Чтобы начать чат подпишитесь на собеседника', { duration:4000 })
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
let _lastMsgSig = ''
function renderChatRoom(){
    if(!D.currentChat) return
    const { peerId, peerProfile } = D.currentChat
    const p = peerProfile || {}
    const name = p.full_name || p.username || 'Пользователь'
    const theme = getTheme()
    const size = getSize()

    let room = $('direct-room')
    if(!room){
        room = document.createElement('div')
        room.id = 'direct-room'
        room.className = 'direct-room hidden'
        document.getElementById('main-app').appendChild(room)
    }
    room.classList.remove('hidden')
    document.body.classList.add('in-direct')
    room.style.setProperty('--bubble-size', size.fontSize)
    room.style.setProperty('--bubble-lh', size.lineHeight)
    room.style.setProperty('--bubble-pad', size.pad)
    room.style.setProperty('--pin-color', D.pinColor || 'var(--blue)')

    const status = getOnlineStatus(p)

    room.innerHTML = `
    <header class="dr-topbar">
      <button class="dr-back-btn" id="dr-back" title="Все чаты">${I.back}</button>
      <div class="dr-user-pill" id="dr-user-pill">
        <div class="dr-user-ava">${av(p.avatar_url, name)}</div>
        <div class="dr-user-info">
          <div class="dr-user-name">${esc(name)}</div>
          <div class="dr-user-status ${status.cls}" id="dr-user-status">${esc(status.text)}</div>
        </div>
      </div>
      <button class="dr-back-btn" id="dr-profile-btn" title="Профиль">${I.user}</button>
    </header>
    <div class="dr-pinned-bar hidden" id="dr-pinned-bar"></div>
    <div class="direct-messages" id="direct-messages" style="background:${theme.bg}"></div>
    <div class="dr-panel" id="dr-panel">
      <div class="dr-panel-tabs">
        <button class="dr-panel-tab active" data-ptab="emoji">${I.smile} Эмодзи</button>
        <button class="dr-panel-tab" data-ptab="stickers">${I.sticker} Стикеры</button>
      </div>
      <div class="dr-panel-body" id="dr-panel-body"></div>
    </div>
    <div class="dr-composer">
      <button class="dr-composer-btn" id="dr-sticker-btn" title="Стикеры">${I.sticker}</button>
      <div class="dr-input-wrap">
        <input type="text" id="dr-input" placeholder="Сообщение" autocomplete="off">
        <button class="dr-input-emoji" id="dr-emoji-btn" title="Эмодзи">${I.smile}</button>
      </div>
      <button class="dr-send-btn" id="dr-send" aria-label="Отправить">${I.send}</button>
    </div>`

    $('dr-back').addEventListener('click', closeChatRoom)
    $('dr-user-pill').addEventListener('click', () => openChatProfile(peerId, p))
    $('dr-profile-btn').addEventListener('click', () => openChatProfile(peerId, p))

    const input = $('dr-input')
    $('dr-send').addEventListener('click', sendCurrentMessage)
    input.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); sendCurrentMessage() } })

    let typingTimeout = null
    input.addEventListener('input', () => {
        if(typingTimeout) return
        broadcastTyping()
        typingTimeout = setTimeout(() => { typingTimeout = null }, 2500)
    })

    $('dr-emoji-btn').addEventListener('click', () => openPanel('emoji'))
    $('dr-sticker-btn').addEventListener('click', () => openPanel('stickers'))

    room.querySelectorAll('.dr-panel-tab').forEach(tab => tab.addEventListener('click', () => {
        room.querySelectorAll('.dr-panel-tab').forEach(t => t.classList.toggle('active', t === tab))
        D.panelTab = tab.dataset.ptab
        renderPanelBody()
    }))

    subscribeTyping(peerId)
    loadMessages()

    if(D.refreshTimer) clearInterval(D.refreshTimer)
    D.refreshTimer = setInterval(() => {
        if($('direct-room') && !$('direct-room').classList.contains('hidden')) loadMessages(true)
    }, 3000)

    if(D.typingTimer) clearInterval(D.typingTimer)
    D.typingTimer = setInterval(() => {
        const el = $('dr-user-status')
        if(el && !el.classList.contains('typing')){
            const s = getOnlineStatus(D.currentChat?.peerProfile)
            el.textContent = s.text
            el.className = 'dr-user-status ' + s.cls
        }
    }, 30000)
}

function closeChatRoom(){
    document.body.classList.remove('in-direct')
    const r = $('direct-room')
    if(r) r.classList.add('hidden')
    D.currentChat = null
    if(D.refreshTimer) clearInterval(D.refreshTimer)
    if(D.typingTimer) clearInterval(D.typingTimer)
    unsubscribeTyping()
    D.refreshTimer = setInterval(() => {
        if($('screen-direct')?.classList.contains('active') && !D.currentChat) loadDirectChats(true)
    }, 5000)
    loadDirectChats()
}

async function sendCurrentMessage(){
    const input = $('dr-input')
    const text = input.value.trim()
    if(!text) return
    input.value = ''
    await pushMessage({ content: text })
}

async function pushMessage(payload){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user || !D.currentChat) return
    const { peerId } = D.currentChat
    try {
        const { error } = await supabase.from('direct_messages').insert({
            from_id: user.id, to_id: peerId, ...payload
        })
        if(error) throw error

        const { isMutual } = D.currentChat
        const peerAdmin = !!D.currentChat.peerProfile?.is_admin
        if(!isMutual && !D.isAdmin && !peerAdmin && payload.content){
            const [{ data:meF }, { data:peerF }] = await Promise.all([
                supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', peerId).maybeSingle(),
                supabase.from('follows').select('id').eq('follower_id', peerId).eq('following_id', user.id).maybeSingle()
            ])
            if(!peerF){
                try {
                    await supabase.from('chat_requests').upsert({
                        from_user: user.id, to_user: peerId,
                        first_message: payload.content, status:'pending'
                    }, { onConflict:'from_user,to_user' })
                } catch {}
            }
        }
        _lastMsgSig = ''
        loadMessages()
        loadDirectChats(true)
    } catch(e){
        window.showToast?.('error','Не удалось отправить')
    }
}

/* ============================================================
   СООБЩЕНИЯ
============================================================ */
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
    if(error) console.warn('[loadMessages]', error.message)

    const visible = (msgs || []).filter(m => !(m.hidden_for || []).includes(user.id))

    if(visible.length){
        const unread = visible.filter(m => m.to_id === user.id && !m.is_read).map(m => m.id)
        if(unread.length){
            await supabase.from('direct_messages').update({ is_read: true }).in('id', unread)
            loadDirectChats(true)
        }
    }

    const pinned = visible.filter(m => m.pinned_at)
    renderPinnedBar(pinned)

    const box = $('direct-messages')
    if(!box) return

    const sig = visible.map(m => m.id + (m.is_read ? '1' : '0') + JSON.stringify(m.reactions || {})).join(',')
    if(silent && sig === _lastMsgSig) return
    _lastMsgSig = sig

    const pname = peerProfile.full_name || peerProfile.username || 'user'
    const { data:myProf } = await supabase.from('profiles')
        .select('full_name, username, avatar_url').eq('id', user.id).maybeSingle()
    const mp = myProf || {}
    const theme = getTheme()

    if(!visible.length){
        box.innerHTML = `
          <div class="direct-welcome" style="text-align:center;padding:60px 24px;max-width:340px;margin:auto">
            <div class="dr-user-ava" style="width:96px;height:96px;font-size:40px;margin:0 auto 18px">${av(peerProfile.avatar_url, pname)}</div>
            <h2 style="font-size:20px;font-weight:700;margin-bottom:10px;color:var(--text)">${esc(pname)}</h2>
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.5">В этом чате пока нет сообщений. Начните новый чат, написав сообщение или отправьте стикер, музыку, видео или пост</p>
          </div>`
        return
    }

    let html = ''
    let lastDay = ''
    visible.forEach((m, i) => {
        const dayKey = new Date(m.created_at).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })
        if(dayKey !== lastDay){
            html += `<div class="dr-date-sep">${formatDateSep(m.created_at)}</div>`
            lastDay = dayKey
        }
        html += renderMessage(m, visible[i-1], user.id, mp, peerProfile, theme)
    })
    box.innerHTML = html
    bindShareCards(box)
    box.querySelectorAll('[data-react]').forEach(ch => ch.addEventListener('click', e => {
        e.stopPropagation()
        toggleReaction(ch.closest('.dr-row').dataset.mid, ch.dataset.react)
    }))
    box.querySelectorAll('.dr-row').forEach(row => attachMsgMenu(row))
    box.scrollTop = box.scrollHeight
}

function formatDateSep(iso){
    const d = new Date(iso)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yest  = new Date(today); yest.setDate(yest.getDate() - 1)
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if(dd.getTime() === today.getTime()) return 'Сегодня'
    if(dd.getTime() === yest.getTime())  return 'Вчера'
    return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' })
}

function renderMessage(m, prev, myId, myProf, peerProf, theme){
    const mine = m.from_id === myId
    const time = timeOnly(m.created_at)

    const prevDay = prev ? new Date(prev.created_at).toLocaleDateString('ru-RU') : null
    const curDay  = new Date(m.created_at).toLocaleDateString('ru-RU')
    const showAva = !prev || prev.from_id !== m.from_id || prevDay !== curDay

    let body = ''
    let isSticker = false
    const content = m.content || ''
    const stickerMatch = content.match(/^\[sticker:(.+?)\]$/)
    const shareData = shareOf(content)
    let isCard = false

    if(m.media_url){
        const clean = m.media_url.split('?')[0].toLowerCase()
        if(/\.(mp4|webm|mov)$/.test(clean)) body = `<video src="${m.media_url}" controls playsinline style="max-width:100%;border-radius:12px;margin-top:4px"></video>`
        else if(/\.(mp3|wav|m4a|ogg)$/.test(clean)) body = `<audio src="${m.media_url}" controls style="max-width:100%;margin-top:4px"></audio>`
        else body = `<img src="${m.media_url}" style="max-width:100%;border-radius:12px;margin-top:4px">`
    }
    if(shareData){
        isSticker = true; isCard = true
        body = renderShareCard(shareData)
    } else if(stickerMatch){
        isSticker = true
        body = `<img src="${esc(stickerMatch[1])}" alt="sticker">`
    } else if(content){
        body = `<div>${esc(content)}</div>`
    }

    const pinnedMark = m.pinned_at
        ? `<span style="display:inline-block;margin-right:4px;opacity:.7;vertical-align:middle">${I.pin}</span>`
        : ''

    let checkHtml = ''
    if(mine){
        checkHtml = m.is_read
            ? `<span class="dr-check read" title="Прочитано">${I.checkD}</span>`
            : `<span class="dr-check" title="Отправлено">${I.check}</span>`
    }

    const avaSrc = mine ? myProf?.avatar_url : peerProf?.avatar_url
    const avaName = mine ? (myProf?.full_name || myProf?.username || 'me') : (peerProf?.full_name || peerProf?.username || 'user')

    // Цвет времени и пустой галочки:
    // - свои пузыри всегда цветные (синие) → светло-серый
    // - чужие в светлой теме (белый пузырь) → тёмно-серый
    // - чужие в тёмной теме (тёмный пузырь) → светло-серый
    const footColor = mine
        ? 'rgba(255,255,255,.75)'
        : (theme.light ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.55)')

    const bubbleStyle = `background:${mine ? theme.own : theme.peer};color:${mine ? theme.ownText : theme.peerText};`

    const rx = m.reactions || {}
    const rxCount = {}
    Object.values(rx).forEach(e => rxCount[e] = (rxCount[e] || 0) + 1)
    const myRx = rx[myId]
    const reactsHtml = Object.keys(rxCount).length
        ? `<div class="dr-reacts">${Object.entries(rxCount).map(([e, n]) =>
            `<button class="dr-react-chip ${myRx === e ? 'mine' : ''}" data-react="${e}">${e}${n > 1 ? ' ' + n : ''}</button>`).join('')}</div>` : ''

    if(isSticker){
        const stickFoot = theme.light ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.8)'
        return `<div class="dr-row ${mine ? 'mine' : ''}" data-mid="${m.id}" data-mine="${mine?1:0}">
      <div class="dr-row-ava ${showAva ? '' : 'ghost'}">${av(avaSrc, avaName)}</div>
      <div class="direct-bubble dr-sticker">
        ${body}
        <div class="direct-bubble-foot" style="color:${stickFoot}">
          <span>${time}</span>${checkHtml}
        </div>
        ${reactsHtml}
      </div>
    </div>`
    }

    return `<div class="dr-row ${mine ? 'mine' : ''}" data-mid="${m.id}" data-mine="${mine?1:0}">
      <div class="dr-row-ava ${showAva ? '' : 'ghost'}">${av(avaSrc, avaName)}</div>
      <div class="direct-bubble" style="${bubbleStyle}">
        ${pinnedMark}${body}
        <div class="direct-bubble-foot" style="color:${footColor}">
          <span>${time}</span>${checkHtml}
        </div>
        ${reactsHtml}
      </div>
    </div>`
}

/* ============================================================
   ЗАКРЕПЛЕНИЕ
============================================================ */
function renderPinnedBar(pinned){
    const bar = $('dr-pinned-bar'); if(!bar) return
    if(!pinned.length){ bar.classList.add('hidden'); bar.innerHTML = ''; return }

    const last = pinned[pinned.length - 1]
    const text = contentLabel(last.content).slice(0, 60) || 'Медиа'
    const countBadge = pinned.length > 1 ? `<span class="dr-pinned-count">${pinned.length}</span>` : ''

    bar.classList.remove('hidden')
    bar.innerHTML = `
      <div class="dr-pinned-icon">${I.pin}</div>
      <div class="dr-pinned-body">
        <div class="dr-pinned-title">Закреплённое сообщение</div>
        <div class="dr-pinned-text">${esc(text)}</div>
      </div>
      ${countBadge}
      <button class="dr-pinned-unpin" title="Открепить">${I.x}</button>`
    bar.onclick = e => {
        if(e.target.closest('.dr-pinned-unpin')) return
        if(pinned.length === 1) scrollToMessage(pinned[0].id)
        else openPinnedList(pinned)
    }
    bar.querySelector('.dr-pinned-unpin')?.addEventListener('click', async e => {
        e.stopPropagation()
        await unpinMessage(pinned[pinned.length - 1].id)
    })
}
function openPinnedList(pinned){
    window.showActionSheet?.(`Закреплённые · ${pinned.length}`, pinned.map(m => ({
        label: contentLabel(m.content).slice(0, 40) || 'Медиа',
        icon: I.pin,
        onClick: () => scrollToMessage(m.id)
    })))
}
function scrollToMessage(msgId){
    const box = $('direct-messages'); if(!box) return
    const row = box.querySelector(`.dr-row[data-mid="${msgId}"]`)
    if(!row){ window.showToast?.('info','Сообщение не загружено'); return }
    box.scrollTo({ top: row.offsetTop - 80, behavior:'smooth' })
    row.classList.add('highlight')
    setTimeout(() => row.classList.remove('highlight'), 2000)
}
async function togglePinMsg(msgId){
    const { data:msg } = await supabase.from('direct_messages').select('pinned_at').eq('id', msgId).maybeSingle()
    if(!msg) return
    const isPinned = !!msg.pinned_at
    await supabase.from('direct_messages').update({
        pinned_at: isPinned ? null : new Date().toISOString()
    }).eq('id', msgId)
    window.showToast?.('success', isPinned ? 'Откреплено' : 'Закреплено', { icon: I.pin })
    _lastMsgSig = ''
    loadMessages()
}
async function unpinMessage(msgId){
    await supabase.from('direct_messages').update({ pinned_at: null }).eq('id', msgId)
    window.showToast?.('success','Откреплено', { icon: I.pin })
    _lastMsgSig = ''
    loadMessages()
}

/* ============================================================
   КОНТЕКСТ-МЕНЮ СООБЩЕНИЯ
============================================================ */
async function toggleReaction(msgId, emoji){
    const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
    const { data:msg } = await supabase.from('direct_messages').select('reactions').eq('id', msgId).maybeSingle()
    const r = { ...(msg?.reactions || {}) }
    if(r[user.id] === emoji) delete r[user.id]; else r[user.id] = emoji
    await supabase.from('direct_messages').update({ reactions: r }).eq('id', msgId)
    _lastMsgSig = ''; loadMessages()
}
function reactBurst(row, emoji){
    const b = document.createElement('div'); b.className = 'dr-react-burst'; b.textContent = emoji
    row.appendChild(b); setTimeout(() => b.remove(), 1000)
}

function attachMsgMenu(row){
    let pressTimer = null, longPressed = false, lastTap = 0
    const startPress = () => {
        longPressed = false
        row.classList.add('pressing')
        pressTimer = setTimeout(() => { longPressed = true; row.classList.remove('pressing'); showMsgMenu(row) }, 420)
    }
    const cancelPress = () => { if(pressTimer){ clearTimeout(pressTimer); pressTimer = null } row.classList.remove('pressing') }
    const doubleTap = () => { reactBurst(row, '❤️'); toggleReaction(row.dataset.mid, '❤️') }
    row.addEventListener('touchstart', startPress, { passive:true })
    row.addEventListener('touchend', e => {
        cancelPress()
        if(longPressed){ e.preventDefault(); return }
        if(e.target.closest('button,video,audio,.sh-card')) return
        const now = Date.now()
        if(now - lastTap < 300){ lastTap = 0; e.preventDefault(); doubleTap() } else lastTap = now
    })
    row.addEventListener('touchmove', cancelPress, { passive:true })
    row.addEventListener('touchcancel', cancelPress)
    row.addEventListener('mousedown', e => { if(e.button !== 0) return; startPress() })
    row.addEventListener('mouseup', cancelPress)
    row.addEventListener('mouseleave', cancelPress)
    row.addEventListener('dblclick', e => { if(!e.target.closest('button,video,audio,.sh-card')) doubleTap() })
    row.addEventListener('contextmenu', e => { e.preventDefault(); showMsgMenu(row) })
}

function showMsgMenu(row){
    document.querySelectorAll('.dr-msg-menu').forEach(m => m.remove())
    const msgId = row.dataset.mid
    const isMine = row.dataset.mine === '1'
    const menu = document.createElement('div')
    menu.className = 'dr-msg-menu'
    const items = [
        { label:'Скопировать', icon: I.copy,    onClick: () => copyMsg(msgId) },
        { label:'Ответить',   icon: I.reply,   onClick: () => replyMsg(msgId) },
        { label:'Переслать',  icon: I.forward, onClick: () => window.showToast?.('info','Пересылка — скоро') },
        { label:'Закрепить',  icon: I.pin,     onClick: () => togglePinMsg(msgId) },
        { label: isMine ? 'Удалить' : 'Удалить у себя', icon: I.trash, danger:true, onClick: () => deleteMsg(msgId, isMine, row) }
    ]
    menu.innerHTML = `<div class="dr-react-bar">${REACTIONS.map(e => `<button data-emo="${e}">${e}</button>`).join('')}</div>` +
        items.map((it, i) => `<button class="dr-msg-menu-item ${it.danger ? 'danger' : ''}" data-mi="${i}">${it.icon}<span>${it.label}</span></button>`).join('')
    document.body.appendChild(menu)

    const rect = row.getBoundingClientRect()
    const mw = menu.offsetWidth || 260, mh = menu.offsetHeight || 300
    let left = Math.min(Math.max(10, rect.left), window.innerWidth - mw - 10)
    let top = rect.top - mh - 8
    if(top < 10) top = Math.min(rect.bottom + 8, window.innerHeight - mh - 10)
    menu.style.left = left + 'px'; menu.style.top = Math.max(10, top) + 'px'

    menu.querySelectorAll('[data-emo]').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation(); menu.remove()
        reactBurst(row, b.dataset.emo); toggleReaction(msgId, b.dataset.emo)
    }))
    menu.querySelectorAll('.dr-msg-menu-item').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation()
        const it = items[+btn.dataset.mi]; menu.remove()
        if(it.onClick) setTimeout(it.onClick, 40)
    }))
    setTimeout(() => {
        const close = ev => { if(!menu.contains(ev.target)){ menu.remove(); document.removeEventListener('click', close) } }
        document.addEventListener('click', close)
    }, 50)
    try { navigator.vibrate?.(15) } catch {}
}

async function copyMsg(msgId){
    const { data:msg } = await supabase.from('direct_messages').select('content').eq('id', msgId).maybeSingle()
    const text = contentLabel(msg?.content)
    if(text){
        try { await navigator.clipboard.writeText(text) } catch {}
        window.showToast?.('success','Скопировано', { icon: I.check })
    }
}
async function replyMsg(msgId){
    const { data:msg } = await supabase.from('direct_messages').select('content').eq('id', msgId).maybeSingle()
    if(!msg) return
    const input = $('dr-input'); if(!input) return
    input.value = `> ${(msg.content || '').slice(0, 40)}\n`
    input.focus()
}
async function deleteMsg(msgId, isMine, row){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    row.style.transition = 'opacity .22s, transform .22s'
    row.style.opacity = '0'
    row.style.transform = 'scale(.9)'
    setTimeout(async () => {
        try {
            if(isMine){
                await supabase.from('direct_messages').delete().eq('id', msgId)
            } else {
                const { data:msg } = await supabase.from('direct_messages').select('hidden_for').eq('id', msgId).maybeSingle()
                const cur = msg?.hidden_for || []
                if(!cur.includes(user.id)) await supabase.from('direct_messages').update({ hidden_for: [...cur, user.id] }).eq('id', msgId)
            }
            row.remove()
            _lastMsgSig = ''
            loadMessages(true)
        } catch(e){
            row.style.opacity = '1'; row.style.transform = ''
            window.showToast?.('error','Не удалось удалить')
        }
    }, 220)
}

/* ============================================================
   ПАНЕЛЬ ЭМОДЗИ / СТИКЕРОВ
============================================================ */
function openPanel(tab){
    const panel = $('dr-panel'); if(!panel) return
    const isOpen = panel.classList.contains('open') && D.panelTab === tab
    if(isOpen){ panel.classList.remove('open'); return }
    panel.classList.add('open')
    D.panelTab = tab
    document.querySelectorAll('#dr-panel .dr-panel-tab').forEach(t => t.classList.toggle('active', t.dataset.ptab === tab))
    renderPanelBody()
}
function renderPanelBody(){
    const body = $('dr-panel-body'); if(!body) return
    if(D.panelTab === 'emoji'){
        body.innerHTML = `<div class="dr-emoji-grid">${EMOJI.map(e => `<button data-emj="${e}">${e}</button>`).join('')}</div>`
        body.querySelectorAll('[data-emj]').forEach(b => b.addEventListener('click', () => {
            const input = $('dr-input'); if(!input) return
            input.value += b.dataset.emj
            input.focus()
        }))
    } else renderStickersPanel()
}

/* ============================================================
   СТИКЕРЫ — с сохранением в БД
============================================================ */
D.ownPacks = []
D.savedPacks = []
D.publicPacks = []
D._stickerPacksLoaded = false

function normalizePack(p){
    return {
        id: p.id,
        name: p.name || 'Без названия',
        stickers: Array.isArray(p.stickers) ? p.stickers : [],
        is_public: !!p.is_public,
        user_id: p.user_id,
        created_at: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    }
}

async function loadStickerPacks(force = false){
    if(D._stickerPacksLoaded && !force) return
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    D._stickerPacksLoaded = true

    const { data: own } = await supabase.from('sticker_packs')
        .select('id, user_id, name, stickers, is_public, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const { data: savedRows } = await supabase.from('sticker_pack_saves')
        .select('pack_id, sticker_packs:pack_id (id, user_id, name, stickers, is_public, created_at)')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

    D.ownPacks = (own || []).map(normalizePack)
    D.savedPacks = (savedRows || []).map(r => r.sticker_packs).filter(Boolean).map(normalizePack)

    const excludeIds = new Set([...D.ownPacks.map(p => p.id), ...D.savedPacks.map(p => p.id)])
    const { data: pub } = await supabase.from('sticker_packs')
        .select('id, user_id, name, stickers, is_public, created_at')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(40)

    D.publicPacks = (pub || []).filter(p => !excludeIds.has(p.id)).map(normalizePack)
}

function getMyPacks(){ return [...D.ownPacks, ...D.savedPacks] }
function isOwnPack(id){ return D.ownPacks.some(p => p.id === id) }
function isSavedPack(id){ return D.savedPacks.some(p => p.id === id) }

function saveMutedUntil(){
    const lp = loadLocalPrefs()
    lp.mutedUntil = D.mutedUntil
    saveLocalPrefs(lp)
}

function checkMute(){
    if(D.mutedUntil && Date.now() < D.mutedUntil){
        const left = Math.ceil((D.mutedUntil - Date.now()) / 1000)
        window.showToast?.('error', `Вы в муте ещё ${left} с`, { duration:3000 })
        return true
    }
    if(D.mutedUntil && Date.now() >= D.mutedUntil){ D.mutedUntil = 0; saveMutedUntil() }
    return false
}
function registerStickerSend(){
    const now = Date.now()
    D.stickerSendTimes = D.stickerSendTimes.filter(t => now - t < 60000)
    D.stickerSendTimes.push(now)
    if(D.stickerSendTimes.length > 10){
        D.mutedUntil = now + 3 * 60 * 1000
        saveMutedUntil()
        window.showToast?.('error','Слишком много стикеров — мут на 3 минуты во всех чатах', { duration: 4000 })
        return true
    }
    return false
}

async function sendSticker(url){
    if(checkMute()) return
    await pushMessage({ content: `[sticker:${url}]` })
    registerStickerSend()
}

function renderStickersPanel(){
    const body = $('dr-panel-body'); if(!body) return

    if(!D._stickerPacksLoaded){
        body.innerHTML = '<div class="dr-sticker-empty"><p>Загрузка…</p></div>'
        loadStickerPacks().then(() => renderStickersPanel())
        return
    }

    const myPacks  = getMyPacks()
    const pubPacks = D.publicPacks

    if(!myPacks.length && !pubPacks.length){
        body.innerHTML = `
          <div class="dr-sticker-empty">
            <p>У вас пока нет стикеров</p>
            <button class="dr-sticker-empty-btn" id="dr-new-pack">Создать стикерпак</button>
          </div>`
        body.querySelector('#dr-new-pack').addEventListener('click', openCreateStickerPack)
        return
    }

    const allVisible = [...myPacks, ...pubPacks]
    let activePack = allVisible.find(p => p.id === D.currentStickerPack)
    if(!activePack){ activePack = myPacks[0] || pubPacks[0]; D.currentStickerPack = activePack?.id }

    const stickers   = activePack?.stickers || []
    const isOwn      = activePack && isOwnPack(activePack.id)
    const isSaved    = activePack && isSavedPack(activePack.id)
    const isPubOther = activePack && D.publicPacks.some(p => p.id === activePack.id)

    body.innerHTML = `
      <div class="dr-sticker-packs">
        ${myPacks.map(p => `
          <button class="dr-sticker-pack ${p.id === activePack.id ? 'active' : ''}" data-pack="${p.id}">
            ${p.stickers[0] ? `<img src="${esc(p.stickers[0])}" alt="">` : ''}
          </button>`).join('')}
        <button class="dr-sticker-pack dr-sticker-pack-add" id="dr-new-pack" title="Создать стикерпак">${I.plus}</button>
        ${pubPacks.length ? `<div class="dr-sticker-pack-sep" aria-hidden="true"></div>` : ''}
        ${pubPacks.map(p => `
          <button class="dr-sticker-pack dr-sticker-pack-pub ${p.id === activePack.id ? 'active' : ''}" data-pack="${p.id}">
            ${p.stickers[0] ? `<img src="${esc(p.stickers[0])}" alt="">` : ''}
          </button>`).join('')}
      </div>

      <div class="dr-sticker-pack-info">
        <div class="dr-sticker-pack-name">${esc(activePack.name)}</div>
        ${isPubOther ? `<button class="dr-sticker-save-btn" id="dr-save-pack" data-pack="${activePack.id}">Сохранить пак</button>` : ''}
        ${isSaved    ? `<button class="dr-sticker-save-btn saved" disabled>Сохранён</button>` : ''}
      </div>

      <div class="dr-stickers-grid">
        ${stickers.map(s => `<button class="dr-sticker-item" data-sticker="${esc(s)}"><img src="${esc(s)}" alt=""></button>`).join('')}
        ${isOwn ? `<button class="dr-sticker-item dr-sticker-add" id="dr-add-sticker" title="Добавить стикер">${I.plus}</button>` : ''}
      </div>

      <input type="file" id="dr-add-sticker-file" accept="image/*" hidden>`

    body.querySelectorAll('.dr-sticker-pack[data-pack]').forEach(b => b.addEventListener('click', () => {
        D.currentStickerPack = b.dataset.pack
        renderStickersPanel()
    }))
    body.querySelector('#dr-new-pack')?.addEventListener('click', openCreateStickerPack)
    body.querySelectorAll('.dr-sticker-item[data-sticker]').forEach(b => b.addEventListener('click', () => sendSticker(b.dataset.sticker)))

    body.querySelector('#dr-save-pack')?.addEventListener('click', e => savePublicPack(e.currentTarget.dataset.pack))

    const addBtn   = body.querySelector('#dr-add-sticker')
    const addInput = body.querySelector('#dr-add-sticker-file')
    addBtn?.addEventListener('click', () => addInput?.click())
    addInput?.addEventListener('change', async e => {
        const f = e.target.files?.[0]; if(!f) return
        await addStickerToPack(activePack.id, f)
        addInput.value = ''
    })
}

async function savePublicPack(packId){
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        const { error } = await supabase.from('sticker_pack_saves').insert({ user_id: user.id, pack_id: packId })
        if(error && error.code !== '23505') throw error

        const idx = D.publicPacks.findIndex(p => p.id === packId)
        if(idx >= 0){
            const [p] = D.publicPacks.splice(idx, 1)
            D.savedPacks.unshift(p)
        }
        D.currentStickerPack = packId
        window.showToast?.('success', 'Пак сохранён', { icon: I.check })
        renderStickersPanel()
    } catch(e){
        window.showToast?.('error', 'Не удалось сохранить: ' + (e.message || ''))
    }
}

async function addStickerToPack(packId, file){
    if(!packId || !file) return
    const pack = D.ownPacks.find(p => p.id === packId)
    if(!pack){ window.showToast?.('error', 'Можно добавлять только в свои паки'); return }

    const grid = $('dr-panel-body')?.querySelector('.dr-stickers-grid')
    let spinner = null
    if(grid){
        spinner = document.createElement('div')
        spinner.className = 'dr-sticker-item dr-sticker-loading'
        spinner.innerHTML = '<div class="dr-sticker-spinner"></div>'
        grid.appendChild(spinner)
    }

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) throw new Error('not authed')
        const ext  = file.name.split('.').pop() || 'png'
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`

        const up = await supabase.storage.from('stickers').upload(path, file, { contentType:file.type })
        if(up.error) throw up.error
        const { data:pub } = supabase.storage.from('stickers').getPublicUrl(path)
        const url = pub.publicUrl

        const next = [...pack.stickers, url]
        const { error } = await supabase.from('sticker_packs').update({ stickers: next }).eq('id', packId)
        if(error) throw error

        pack.stickers = next
        spinner?.remove()
        renderStickersPanel()
        window.showToast?.('success', 'Стикер добавлен', { icon: I.check })
    } catch(e){
        spinner?.remove()
        window.showToast?.('error', e.message || 'Не удалось добавить')
    }
}

function openCreateStickerPack(){
    closeAllSheets()
    const back = document.createElement('div')
    back.className = 'dr-sheet-backdrop'
    back.addEventListener('click', closeAllSheets)
    const sheet = document.createElement('div')
    sheet.className = 'dr-sheet'
    sheet.innerHTML = `
      <div class="dr-sheet-handle"></div>
      <h3 class="dr-sheet-title">Новый стикерпак</h3>
      <div class="dr-sheet-scroll">
        <label class="settings-label" style="display:block;margin-bottom:6px">Название</label>
        <input type="text" id="dsp-name" placeholder="Например, Мои котики" maxlength="40">
        <label class="settings-label" style="display:block;margin:14px 0 6px">Первый стикер</label>
        <label class="cc-avatar-upload" for="dsp-file" style="display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer;padding:12px">
          <div class="cc-avatar-preview" id="dsp-preview" style="width:120px;height:120px;border-radius:24px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--text-secondary)">
            ${I.image}
          </div>
          <input type="file" id="dsp-file" accept="image/*" hidden>
          <span style="font-size:13px;color:var(--text-secondary)">Нажмите, чтобы выбрать фото</span>
        </label>
        <label class="dr-sticker-public-row" style="display:flex;align-items:center;gap:10px;margin-top:14px;padding:10px;background:var(--surface-2);border-radius:12px;cursor:pointer">
          <input type="checkbox" id="dsp-public" checked style="width:auto">
          <span style="font-size:13.5px">Показывать другим в стикерах</span>
        </label>
        <button class="btn-primary" id="dsp-create" style="margin-top:16px">Создать стикерпак</button>
        <button class="btn-gray" id="dsp-cancel" style="margin-top:8px">Отмена</button>
      </div>`
    document.body.appendChild(back)
    document.body.appendChild(sheet)
    let file = null
    $('dsp-file').addEventListener('change', e => {
        const f = e.target.files?.[0]; if(!f) return
        file = f
        $('dsp-preview').innerHTML = `<img src="${URL.createObjectURL(f)}" style="width:100%;height:100%;object-fit:contain">`
    })
    $('dsp-cancel').addEventListener('click', closeAllSheets)
    $('dsp-create').addEventListener('click', async () => {
        const name     = $('dsp-name').value.trim()
        const isPublic = $('dsp-public').checked
        if(name.length < 2){ window.showToast?.('error','Введите название'); return }
        if(!file){ window.showToast?.('error','Выберите фото'); return }
        const btn = $('dsp-create'); btn.disabled = true; btn.textContent = 'Загрузка...'
        try {
            const { data:{ user } } = await supabase.auth.getUser()
            if(!user) throw new Error('not authed')

            const ext  = file.name.split('.').pop() || 'png'
            const path = `${user.id}/${Date.now()}.${ext}`
            const up = await supabase.storage.from('stickers').upload(path, file, { contentType:file.type })
            if(up.error) throw up.error
            const { data:pub } = supabase.storage.from('stickers').getPublicUrl(path)
            const url = pub.publicUrl

            const { data:created, error } = await supabase.from('sticker_packs')
                .insert({ user_id: user.id, name, stickers:[url], is_public:isPublic })
                .select().single()
            if(error) throw error

            const pack = normalizePack(created)
            D.ownPacks.unshift(pack)
            D.currentStickerPack = pack.id
            closeAllSheets()
            renderStickersPanel()
            window.showToast?.('success','Стикерпак создан', { icon: I.check })
        } catch(e){
            window.showToast?.('error', e.message)
        } finally {
            btn.disabled = false; btn.textContent = 'Создать стикерпак'
        }
    })
}

function closeAllSheets(){
    document.querySelectorAll('.dr-sheet, .dr-sheet-backdrop').forEach(el => el.remove())
}

/* ============================================================
   TYPING (broadcast)
============================================================ */
function subscribeTyping(peerId){
    unsubscribeTyping()
    ;(async () => {
        const u = (await supabase.auth.getUser()).data.user
        if(!u) return
        const channel = supabase.channel(`typing_${[u.id, peerId].sort().join('_')}`)
        channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
            if(payload.userId !== u.id) showTypingIndicator()
        })
        channel.subscribe()
        D.typingChannel = channel
    })()
}
function unsubscribeTyping(){
    if(D.typingChannel){
        try { supabase.removeChannel(D.typingChannel) } catch {}
        D.typingChannel = null
    }
    const el = $('dr-user-status')
    if(el && D.currentChat){
        const s = getOnlineStatus(D.currentChat.peerProfile)
        el.textContent = s.text
        el.className = 'dr-user-status ' + s.cls
    }
}
async function broadcastTyping(){
    if(!D.typingChannel) return
    const u = (await supabase.auth.getUser()).data.user
    if(!u) return
    D.typingChannel.send({ type:'broadcast', event:'typing', payload:{ userId: u.id } }).catch(() => {})
}
let _typingHideTimer = null
function showTypingIndicator(){
    const el = $('dr-user-status'); if(!el) return
    el.classList.add('typing')
    el.classList.remove('online')
    el.innerHTML = `печатает<span class="dr-typing-dots"><i></i><i></i><i></i></span>`
    if(_typingHideTimer) clearTimeout(_typingHideTimer)
    _typingHideTimer = setTimeout(() => {
        if(!D.currentChat) return
        const s = getOnlineStatus(D.currentChat.peerProfile)
        el.textContent = s.text
        el.className = 'dr-user-status ' + s.cls
    }, 3000)
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

    let overlay = $('dr-profile-overlay')
    if(!overlay){
        overlay = document.createElement('div')
        overlay.id = 'dr-profile-overlay'
        overlay.className = 'dr-profile-overlay'
        document.body.appendChild(overlay)
    }
    overlay.classList.remove('hidden')

    const bday = p.birthday ? new Date(p.birthday).toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' }) : 'Не указано'
    const status = getOnlineStatus(p)

    overlay.innerHTML = `
      <div class="dr-prof-topbar">
        <button class="dr-prof-back" id="dr-prof-back">${I.back}</button>
        <button class="dr-prof-dots" id="dr-prof-dots">${I.dots}</button>
      </div>
      <div class="dr-prof-hero">
        ${p.avatar_url ? `<img class="dr-prof-hero-img" src="${p.avatar_url}" alt="">` : `<div class="dr-prof-hero-fallback">${(name || 'U').charAt(0).toUpperCase()}</div>`}
        <div class="dr-prof-hero-info">
          <div class="dr-prof-name">${esc(name)}</div>
          <div class="dr-prof-username">@${esc(p.username || 'user')}</div>
          <div class="dr-prof-username" style="opacity:.85;font-size:12.5px;margin-top:4px">${esc(status.text)}</div>
        </div>
      </div>
      <div class="dr-prof-controls">
        <button class="dr-prof-ctrl ${muted ? '' : 'active'}" data-pctrl="notif">${I.bell}<span>${muted ? 'выкл' : 'вкл'}</span></button>
        <button class="dr-prof-ctrl" data-pctrl="wall">${I.palette}<span>тема</span></button>
        <button class="dr-prof-ctrl" data-pctrl="search">${I.search}<span>поиск</span></button>
        <button class="dr-prof-ctrl ${pinned ? 'active' : ''}" data-pctrl="pin">${I.pin}<span>${pinned ? 'откр' : 'креп'}</span></button>
        <button class="dr-prof-ctrl" data-pctrl="gift">${I.gift}<span>подарок</span></button>
      </div>
      <div style="padding:14px 18px;margin:12px 12px 0;background:var(--surface-2);border-radius:16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-tertiary);margin-bottom:6px">О себе</div>
        <div style="font-size:14px;color:var(--text);line-height:1.5">${esc(p.bio || 'Описание отсутствует')}</div>
      </div>
      <div style="padding:14px 18px;margin:12px 12px 0;background:var(--surface-2);border-radius:16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-tertiary);margin-bottom:6px">День рождения</div>
        <div style="font-size:14px;color:var(--text);line-height:1.5">${bday}</div>
      </div>
      <div style="padding:16px 20px;margin:12px 12px 24px;background:var(--surface-2);border-radius:16px;text-align:center;color:var(--text-secondary);font-size:13px">Этому пользователю ещё не дарили подарки</div>`

    $('dr-prof-back').addEventListener('click', () => {
        overlay.style.transition = 'opacity .22s, transform .22s'
        overlay.style.opacity = '0'
        overlay.style.transform = 'translateY(28px)'
        setTimeout(() => overlay.remove(), 220)
    })
    $('dr-prof-dots').addEventListener('click', () => {
        const pid = D.currentChat?.peerId
        window.showActionSheet?.('Действия', [
            { label:'Пожаловаться', icon: I.info, danger:true, onClick: () => {
                    if(window.openReportModal){
                        window.openReportModal({ targetType:'profile', targetId: pid, author: p, text: p.bio || '', media: p.avatar_url || null })
                    }
                }},
            { label:'Заблокировать', icon: I.lock, danger:true, onClick: async () => {
                    const { data:{ user } } = await supabase.auth.getUser()
                    await supabase.from('blocks').insert({ blocker_id:user.id, blocked_id:pid })
                    overlay.remove()
                    closeChatRoom()
                    window.showToast?.('success','Заблокирован', { icon: I.check })
                }},
            { label:'Очистить чат', icon: I.trash, danger:true, onClick: () => clearChat(pid) },
            { label:'Скопировать ссылку', icon: I.copy, onClick: () => {
                    navigator.clipboard?.writeText(`${location.origin}/@${p.username||pid}`)
                    window.showToast?.('success','Скопировано', { icon: I.check })
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
        if(k === 'wall'){ overlay.remove(); openThemePicker() }
        if(k === 'search'){ window.showToast?.('info','Поиск — скоро') }
        if(k === 'pin'){ await togglePinChat(peerId); openChatProfile(peerId, p) }
        if(k === 'gift'){ window.showToast?.('info','Подарки — скоро') }
    }))
}

async function togglePinChat(peerId){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    const pref = D.prefs[peerId] || { pinned:false }
    if(!pref.pinned){
        const pinnedCount = Object.values(D.prefs).filter(p => p.pinned).length
        if(pinnedCount >= 3){
            window.showToast?.('error','Максимум 3 закреплённых чата, но с listatread chvad — 10')
            return
        }
    }
    try {
        const { data:existing } = await supabase.from('direct_chat_prefs').select('id').eq('user_id', user.id).eq('peer_id', peerId).maybeSingle()
        if(existing){
            await supabase.from('direct_chat_prefs').update({
                pinned: !pref.pinned,
                pinned_at: pref.pinned ? null : new Date().toISOString()
            }).eq('id', existing.id)
        } else {
            await supabase.from('direct_chat_prefs').insert({
                user_id: user.id, peer_id: peerId, pinned: true, pinned_at: new Date().toISOString()
            })
        }
        await loadDirectChats(true)
        window.showToast?.('success', pref.pinned ? 'Откреплён' : 'Закреплён', { icon: I.pin })
    } catch(e){ window.showToast?.('error', e.message) }
}

/* ============================================================
   ВЫБОР ТЕМЫ / ОФОРМЛЕНИЕ
============================================================ */
function openThemePicker(){
    closeAllSheets()
    const back = document.createElement('div')
    back.className = 'dr-sheet-backdrop'
    back.addEventListener('click', closeAllSheets)
    const sheet = document.createElement('div')
    sheet.className = 'dr-sheet'
    sheet.innerHTML = `
      <div class="dr-sheet-handle"></div>
      <h3 class="dr-sheet-title">Оформление</h3>
      <div class="dr-sheet-scroll" id="dt-body"></div>`
    document.body.appendChild(back)
    document.body.appendChild(sheet)

    const render = () => {
        const body = $('dt-body')
        const curTheme = D.chatThemeId || 't13'
        const curSize = D.msgSize || 'md'
        body.innerHTML = `
          <div class="dr-section-label">Тема чата</div>
          <div class="dr-theme-grid">
            ${CHAT_THEMES.map(t => `
              <button class="dr-theme-cell ${curTheme === t.id ? 'active' : ''}" data-theme="${t.id}">
                <div class="dr-theme-preview" style="background:${t.bg}">
                  <div class="dr-theme-bubble p" style="background:${t.peer};width:70%"></div>
                  <div class="dr-theme-bubble o" style="background:${t.own};width:60%"></div>
                </div>
                <div class="dr-theme-name">${esc(t.name)}</div>
              </button>`).join('')}
          </div>
          <div class="dr-section-label">Цвет закреплённых</div>
          <div class="dr-color-row">
            ${['#0a84ff','#30d158','#ff9f0a','#ff375f','#bf5af2','#26a5e4','#a56a3a','#8e8e93'].map(c => `
              <button class="dr-color-dot ${D.pinColor === c ? 'active' : ''}" data-pin="${c}" style="background:${c}"></button>`).join('')}
          </div>
          <div class="dr-section-label">Размер сообщений</div>
          <div class="dr-size-row">
            ${MSG_SIZES.map(s => `
              <button class="dr-size-btn ${curSize === s.id ? 'active' : ''}" data-size="${s.id}">
                ${s.label}<small>${s.fontSize}</small>
              </button>`).join('')}
          </div>`
        body.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => {
            D.chatThemeId = b.dataset.theme
            const lp = loadLocalPrefs(); lp.chatTheme = D.chatThemeId; saveLocalPrefs(lp)
            applyChatTheme(); render()
        }))
        body.querySelectorAll('[data-pin]').forEach(b => b.addEventListener('click', () => {
            D.pinColor = b.dataset.pin
            const lp = loadLocalPrefs(); lp.pinColor = D.pinColor; saveLocalPrefs(lp)
            applyChatTheme(); render()
        }))
        body.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
            D.msgSize = b.dataset.size
            const lp = loadLocalPrefs(); lp.msgSize = D.msgSize; saveLocalPrefs(lp)
            applyChatTheme(); render()
        }))
    }
    render()
}
function applyChatTheme(){
    const room = $('direct-room')
    const theme = getTheme()
    const size = getSize()
    if(room){
        room.style.setProperty('--bubble-size', size.fontSize)
        room.style.setProperty('--bubble-lh', size.lineHeight)
        room.style.setProperty('--bubble-pad', size.pad)
        room.style.setProperty('--pin-color', D.pinColor || 'var(--blue)')
        const msgs = $('direct-messages')
        if(msgs) msgs.style.background = theme.bg
        _lastMsgSig = ''
        if(D.currentChat) loadMessages()
    }
}

/* ============================================================
   ОЧИСТКА ЧАТА
============================================================ */
async function clearChat(peerId){
    if(!confirm('Очистить все сообщения? Это действие удалит чат у обоих пользователей.')) return
    const { data:{ user } } = await supabase.auth.getUser()
    await supabase.from('direct_messages').delete().or(
        `and(from_id.eq.${user.id},to_id.eq.${peerId}),and(from_id.eq.${peerId},to_id.eq.${user.id})`
    )
    _lastMsgSig = ''
    loadMessages(true)
    window.showToast?.('success','Чат очищен', { icon: I.check })
}

/* ============================================================
   ЭКСПОРТЫ В WINDOW
============================================================ */
window.openDirectChat = openDirectChat
window.openDirectTab = openDirectTab