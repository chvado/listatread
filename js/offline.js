/* ============================================================
   listatread — offline.js (v2, lightweight)
   Автопоказ выключен. Экран доступен только через API.
============================================================ */

const AUTO_SHOW      = false   // ← ВЫКЛЮЧЕНО
const AUTO_HIDE_PING = true
const HIDE_DELAY_MS  = 3000
const PING_URL       = '/favicon.ico'

;(function injectCSS(){
    if (typeof document === 'undefined') return
    if (document.getElementById('offline-css')) return
    const st = document.createElement('style')
    st.id = 'offline-css'
    st.textContent = `
    #offline-screen{
        position:fixed; inset:0; z-index:2147483647;
        background:#0a0a0a; color:#fff;
        display:flex; align-items:center; justify-content:center;
        overflow:hidden;
        font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',sans-serif;
        opacity:0; pointer-events:none;
        transition:opacity .35s ease;
        isolation:isolate;
    }
    #offline-screen.show{ opacity:1; pointer-events:auto }
    #offline-screen.hidden{ display:none !important }

    .offline-bg{
        position:absolute; inset:-12%;
        display:flex; gap:14px; padding:20px;
        transform:rotate(-6deg) scale(1.15) translate3d(0,0,0);
        opacity:.5;
        pointer-events:none;
        will-change:transform;
        -webkit-mask-image:radial-gradient(ellipse at center,transparent 20%,#000 75%);
        mask-image:radial-gradient(ellipse at center,transparent 20%,#000 75%);
        contain:strict;
    }
    .offline-col{ display:flex; flex-direction:column; gap:14px; flex-shrink:0 }
    .offline-col-inner{
        display:flex; flex-direction:column; gap:14px;
        animation: offlineScroll linear infinite;
        transform: translate3d(0,0,0);
        will-change: transform;
    }
    @keyframes offlineScroll{
        from{ transform:translate3d(0,0,0) }
        to  { transform:translate3d(0,-50%,0) }
    }
    .offline-post{
        background:#161618;
        border:1px solid rgba(255,255,255,.06);
        border-radius:16px; padding:12px;
        display:flex; flex-direction:column; gap:10px;
        contain: layout style paint;
    }
    .offline-post-head{ display:flex; align-items:center; gap:10px }
    .offline-post-ava{
        width:34px; height:34px; border-radius:50%;
        background:linear-gradient(135deg,#2c2c2e,#1c1c1e);
        flex-shrink:0;
    }
    .offline-post-meta{ flex:1; display:flex; flex-direction:column; gap:6px; min-width:0 }
    .offline-line{
        height:10px; border-radius:6px; background:#232326; width:100%;
    }
    .offline-line.tall{ height:14px }
    .offline-line.thin{ height:8px }
    .offline-line.w-30{ width:30% } .offline-line.w-45{ width:45% }
    .offline-line.w-60{ width:60% } .offline-line.w-80{ width:80% }
    .offline-line.w-90{ width:90% }
    .offline-img{ width:100%; border-radius:12px; background:#232326 }
    .offline-img.h-90 { height:90px }  .offline-img.h-120{ height:120px }
    .offline-img.h-160{ height:160px } .offline-img.h-200{ height:200px }
    .offline-post-actions{
        display:flex; gap:14px; align-items:center;
        padding-top:8px;
        border-top:1px solid rgba(255,255,255,.05);
        font-size:11px; font-weight:600;
        color:rgba(255,255,255,.55);
    }
    .offline-action{ display:flex; align-items:center; gap:5px }
    .offline-action svg{ width:14px; height:14px }
    .offline-action.like svg  { color:#ff375f }
    .offline-action.comment svg{ color:#0a84ff }
    .offline-action.repost svg{ color:#30d158 }

    .offline-overlay{
        position:relative; z-index:2;
        display:flex; flex-direction:column; align-items:center;
        text-align:center;
        padding:32px 24px; max-width:420px;
        background:radial-gradient(ellipse at center,rgba(0,0,0,.78) 0%,rgba(0,0,0,.55) 55%,rgba(0,0,0,0) 100%);
        border-radius:32px;
    }
    .offline-logo{
        width:84px; height:84px; border-radius:50%;
        background:#fff; color:#000;
        display:flex; align-items:center; justify-content:center;
        font-family:Georgia,'Times New Roman',serif;
        font-size:56px; line-height:1;
        padding-bottom:6px; box-sizing:border-box;
        margin-bottom:16px;
    }
    .offline-brand{ font-size:26px; font-weight:900; letter-spacing:-.04em; margin-bottom:14px }
    .offline-title{ font-size:20px; font-weight:800; margin-bottom:10px; color:#ff453a }
    .offline-desc{ font-size:14px; line-height:1.55; color:rgba(255,255,255,.6); margin-bottom:22px; max-width:320px }
    .offline-desc b{ color:#fff; font-weight:600 }
    .offline-retry{
        padding:12px 26px; border:none; border-radius:100px;
        background:#fff; color:#000;
        font-family:inherit; font-size:14px; font-weight:700;
        cursor:pointer; display:flex; align-items:center; gap:8px;
    }
    .offline-retry svg{ width:16px; height:16px }
    .offline-status{
        margin-top:14px; font-size:11.5px; color:rgba(255,255,255,.35);
        display:flex; align-items:center; gap:6px;
    }
    .offline-status-dot{
        width:6px; height:6px; border-radius:50%; background:#ff453a;
        animation: offlineBlink 1.4s ease-in-out infinite;
    }
    @keyframes offlineBlink{ 0%,100%{ opacity:1 } 50%{ opacity:.3 } }

    /* Пауза анимаций, когда вкладка скрыта — экономит батарею */
    html.feed-bg-paused .offline-col-inner{ animation-play-state: paused !important }
    `
    document.head.appendChild(st)
})()

const ICONS = {
    heart:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    repost:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>'
}

function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min }

export function buildSkeletonPost(){
    const v = randInt(0, 4)
    const likes = randInt(12, 3200)
    const cmts  = randInt(0, 340)
    const reps  = randInt(0, 120)
    let media = ''
    if (v === 0) media = '<div class="offline-img h-120"></div>'
    else if (v === 1) media = '<div class="offline-img h-200"></div>'
    else if (v === 2) media = '<div class="offline-img h-90"></div>'
    else if (v === 3) media = '<div class="offline-img h-160"></div>'
    const lineClass = ['w-60','w-80','w-45','w-90','w-30'][randInt(0, 4)]
    return `
    <div class="offline-post">
        <div class="offline-post-head">
            <div class="offline-post-ava"></div>
            <div class="offline-post-meta">
                <div class="offline-line tall ${lineClass}"></div>
                <div class="offline-line thin w-30"></div>
            </div>
        </div>
        <div class="offline-line w-90"></div>
        <div class="offline-line w-60"></div>
        ${media}
        <div class="offline-post-actions">
            <div class="offline-action like">${ICONS.heart}<span>${likes}</span></div>
            <div class="offline-action comment">${ICONS.comment}<span>${cmts}</span></div>
            <div class="offline-action repost">${ICONS.repost}<span>${reps}</span></div>
        </div>
    </div>`
}

export function buildColumn(widthPx, speedSec, postsPerSet){
    let set = ''
    for (let i = 0; i < postsPerSet; i++) set += buildSkeletonPost()
    return `
    <div class="offline-col" style="width:${widthPx}px">
        <div class="offline-col-inner" style="animation-duration:${speedSec}s">
            ${set}
            ${set}
        </div>
    </div>`
}

/* 3 колонки — меньше DOM, меньше GPU */
export const OFFLINE_COLS = [
    { w: 170, s: 60, n: 3 },
    { w: 210, s: 78, n: 3 },
    { w: 180, s: 68, n: 3 }
]

export function mountFeedBg(container){
    if (!container) return
    container.innerHTML = OFFLINE_COLS.map(c => buildColumn(c.w, c.s, c.n)).join('')
}

/* Один глобальный наблюдатель: пауза анимаций, когда вкладка скрыта */
if (typeof document !== 'undefined' && !window.__feedBgVisibilityHooked){
    window.__feedBgVisibilityHooked = true
    document.addEventListener('visibilitychange', () => {
        document.documentElement.classList.toggle('feed-bg-paused', document.hidden)
    })
}

function buildScreen(){
    if (typeof document === 'undefined') return null
    if (document.getElementById('offline-screen')) return document.getElementById('offline-screen')

    const el = document.createElement('div')
    el.id = 'offline-screen'
    el.innerHTML = `
        <div class="offline-bg" id="offline-bg"></div>
        <div class="offline-overlay">
            <div class="offline-logo">ℓ</div>
            <div class="offline-brand">listatread</div>
            <h1 class="offline-title">Сервис временно недоступен</h1>
            <p class="offline-desc">
                Кажется, у нас технические работы. Мы <b>уже чиним</b> сервера, это может занять неопределённое время.
                Следите за статусом на listatread.online/rules · поддержка: chvadoorigins@gmail.com
            </p>
            <button class="offline-retry" id="offline-retry">
                ${ICONS.refresh} Обновить
            </button>
            <div class="offline-status">
                <span class="offline-status-dot"></span>
                <span id="offline-status-text">Ожидаем восстановления сервера…</span>
            </div>
        </div>
    `
    document.body.appendChild(el)
    mountFeedBg(el.querySelector('#offline-bg'))
    el.querySelector('#offline-retry').addEventListener('click', () => location.reload())
    return el
}

export function showOfflineScreen(reason = 'network'){
    const el = buildScreen()
    if (!el) return
    el.classList.remove('hidden')
    void el.offsetWidth
    requestAnimationFrame(() => el.classList.add('show'))
    const txt = el.querySelector('#offline-status-text')
    if (txt){
        txt.textContent = reason === 'force'
            ? 'Ожидаем восстановления сервера…'
            : 'Нет соединения с сервером'
    }
}

export function hideOfflineScreen(){
    const el = document.getElementById('offline-screen')
    if (!el) return
    el.classList.remove('show')
    setTimeout(() => {
        if (!el.classList.contains('show')){
            el.classList.add('hidden')
            el.remove()   // освобождаем DOM полностью
        }
    }, 420)
}

async function pingBackend(url = PING_URL){
    try {
        const ctrl = new AbortController()
        const t = setTimeout(() => ctrl.abort(), 4000)
        const r = await fetch(url + '?t=' + Date.now(), { method:'HEAD', cache:'no-store', signal: ctrl.signal })
        clearTimeout(t)
        return r.ok || r.status === 304
    } catch { return false }
}

export function installOfflineWatcher(){
    if (typeof window === 'undefined') return
    window.addEventListener('offline', () => showOfflineScreen('network'))
    setInterval(async () => {
        const el = document.getElementById('offline-screen')
        if (!el || el.classList.contains('hidden')) return
        const ok = await pingBackend()
        if (ok){
            const txt = el.querySelector('#offline-status-text')
            if (txt) txt.textContent = 'Соединение восстановлено. Обновляем…'
            setTimeout(() => location.reload(), 900)
        }
    }, 10 * 1000)
}

export async function withOfflineGuard(promise, opts = {}){
    try {
        const res = await promise
        if (res && res.error && !opts.ignoreSupabaseError){
            const code = res.error.code || ''
            const msg  = (res.error.message || '').toLowerCase()
            const isNetwork = msg.includes('failed to fetch') || msg.includes('network') ||
                msg.includes('timeout') || code === 'PGRST301' || code === 'NETWORK_ERROR'
            if (isNetwork) showOfflineScreen('network')
        }
        return res
    } catch(e){
        const msg = (e?.message || '').toLowerCase()
        if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('timeout')){
            showOfflineScreen('network')
        }
        throw e
    }
}

// AUTO_SHOW = false → автостарт не сработает
if (typeof window !== 'undefined'){
    window.showOfflineScreen = showOfflineScreen
    window.hideOfflineScreen = hideOfflineScreen
    window.installOfflineWatcher = installOfflineWatcher
    window.withOfflineGuard = withOfflineGuard
}