/* ============================================================
   listatread — offline.js (полный, автономный)
   Экран «Сервис недоступен» с анимированной лентой.
   Показывается САМ при загрузке — ни от чего не зависит.

   Подключение в js/main.js (в самом верху):
       import './offline.js'

   Отключить: удалить импорт или закомментировать AUTO_SHOW ниже.
============================================================ */

/* ============================================================
   НАСТРОЙКА
============================================================ */
const AUTO_SHOW      = true   // true — показывать экран сразу при загрузке
const AUTO_HIDE_PING = true   // true — проверить сервер и скрыть если живой
const HIDE_DELAY_MS  = 3000   // через сколько мс делать проверку (если AUTO_HIDE_PING)
const PING_URL       = '/favicon.ico'

    /* ============================================================
       CSS — инжектим один раз
    ============================================================ */
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
        transition:opacity .4s cubic-bezier(.4,0,.2,1);
    }
    #offline-screen.show{ opacity:1; pointer-events:auto }
    #offline-screen.hidden{ display:none !important }

    .offline-bg{
        position:absolute; inset:-10%;
        display:flex; gap:14px; padding:20px;
        transform:rotate(-6deg) scale(1.15);
        filter:blur(1.2px) saturate(.55);
        opacity:.55;
        pointer-events:none;
        -webkit-mask-image:radial-gradient(ellipse at center,transparent 20%,#000 75%);
        mask-image:radial-gradient(ellipse at center,transparent 20%,#000 75%);
    }
    .offline-col{
        display:flex; flex-direction:column; gap:14px;
        flex-shrink:0;
    }
    .offline-col-inner{
        display:flex; flex-direction:column; gap:14px;
        animation: offlineScroll linear infinite;
        will-change:transform;
    }
    @keyframes offlineScroll{
        from{ transform:translateY(0) }
        to  { transform:translateY(-50%) }
    }

    .offline-post{
        background:#161618;
        border:1px solid rgba(255,255,255,.06);
        border-radius:16px; padding:12px;
        display:flex; flex-direction:column; gap:10px;
        box-shadow:0 8px 22px rgba(0,0,0,.3);
    }
    .offline-post-head{
        display:flex; align-items:center; gap:10px;
    }
    .offline-post-ava{
        width:34px; height:34px; border-radius:50%;
        background:linear-gradient(135deg,#2c2c2e,#1c1c1e);
        flex-shrink:0; position:relative; overflow:hidden;
    }
    .offline-post-meta{
        flex:1; display:flex; flex-direction:column; gap:6px;
        min-width:0;
    }
    .offline-line{
        height:10px; border-radius:6px;
        background:#232326;
        position:relative; overflow:hidden;
        width:100%;
    }
    .offline-line.tall{ height:14px }
    .offline-line.thin{ height:8px }
    .offline-line.w-30{ width:30% }
    .offline-line.w-45{ width:45% }
    .offline-line.w-60{ width:60% }
    .offline-line.w-80{ width:80% }
    .offline-line.w-90{ width:90% }

    .offline-img{
        width:100%; border-radius:12px;
        background:#232326;
        position:relative; overflow:hidden;
    }
    .offline-img.h-90 { height:90px }
    .offline-img.h-120{ height:120px }
    .offline-img.h-160{ height:160px }
    .offline-img.h-200{ height:200px }

    .offline-post-ava::after,
    .offline-line::after,
    .offline-img::after{
        content:''; position:absolute; inset:0;
        background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.06) 50%,rgba(255,255,255,0) 100%);
        background-size:200% 100%;
        animation: offlineShimmer 1.8s linear infinite;
    }
    @keyframes offlineShimmer{
        0%  { background-position: 200% 0 }
        100%{ background-position:-200% 0 }
    }

    .offline-post-actions{
        display:flex; gap:14px; align-items:center;
        padding-top:8px;
        border-top:1px solid rgba(255,255,255,.05);
        font-size:11px; font-weight:600;
        color:rgba(255,255,255,.55);
    }
    .offline-action{
        display:flex; align-items:center; gap:5px;
    }
    .offline-action svg{ width:14px; height:14px }
    .offline-action.like svg  { color:#ff375f }
    .offline-action.comment svg{ color:#0a84ff }
    .offline-action.repost svg{ color:#30d158 }

    .offline-overlay{
        position:relative; z-index:2;
        display:flex; flex-direction:column; align-items:center;
        text-align:center;
        padding:32px 24px;
        max-width:420px;
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
        box-shadow:0 0 0 1px rgba(255,255,255,.15),0 12px 40px rgba(255,255,255,.08);
        animation: offlineLogoPulse 3s ease-in-out infinite;
    }
    @keyframes offlineLogoPulse{
        0%,100%{ transform:scale(1) }
        50%    { transform:scale(1.04) }
    }
    .offline-brand{
        font-size:26px; font-weight:900; letter-spacing:-.04em;
        margin-bottom:14px;
        background:linear-gradient(135deg,#fff 0%,#b8b8b8 100%);
        -webkit-background-clip:text; background-clip:text;
        -webkit-text-fill-color:transparent;
    }
    .offline-title{
        font-size:20px; font-weight:800;
        margin-bottom:10px;
        color:#ff453a;
    }
    .offline-desc{
        font-size:14px; line-height:1.55;
        color:rgba(255,255,255,.6);
        margin-bottom:22px;
        max-width:320px;
    }
    .offline-desc b{ color:#fff; font-weight:600 }
    .offline-retry{
        padding:12px 26px; border:none; border-radius:100px;
        background:#fff; color:#000;
        font-family:inherit; font-size:14px; font-weight:700;
        cursor:pointer;
        display:flex; align-items:center; gap:8px;
        transition: transform .15s, background .2s;
    }
    .offline-retry:active{ transform:scale(.95) }
    .offline-retry:hover{ background:#e5e5e5 }
    .offline-retry svg{
        width:16px; height:16px;
        animation: offlineSpin 2.4s linear infinite;
    }
    @keyframes offlineSpin{ to{ transform:rotate(360deg) } }

    .offline-status{
        margin-top:14px; font-size:11.5px;
        color:rgba(255,255,255,.35);
        display:flex; align-items:center; gap:6px;
    }
    .offline-status-dot{
        width:6px; height:6px; border-radius:50%;
        background:#ff453a;
        box-shadow:0 0 8px #ff453a;
        animation: offlineBlink 1.4s ease-in-out infinite;
    }
    @keyframes offlineBlink{ 0%,100%{ opacity:1 } 50%{ opacity:.3 } }
    `
    document.head.appendChild(st)
})()

/* ============================================================
   SVG-иконки для скелетонов
============================================================ */
const ICONS = {
    heart:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    repost:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>'
}

/* ============================================================
   Генерация скелетон-поста
============================================================ */
function randInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildSkeletonPost(){
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

/* ============================================================
   Колонка — два одинаковых набора → бесконечный скролл
============================================================ */
function buildColumn(widthPx, speedSec, postsPerSet){
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

/* ============================================================
   Сборка DOM экрана
============================================================ */
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
                Кажется, у нас технические работы. Мы <b>уже чиним</b> сервера, это может занять неопределенное количество времени
                Следите за статусом на listatread.online/rules поддержка - chvadoorigins@gmail.com
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

    const bg = el.querySelector('#offline-bg')
    const cols = [
        { w:150, s:42, n:4 },
        { w:190, s:55, n:5 },
        { w:130, s:38, n:3 },
        { w:210, s:62, n:5 },
        { w:170, s:48, n:4 }
    ]
    bg.innerHTML = cols.map(c => buildColumn(c.w, c.s, c.n)).join('')

    const btn = el.querySelector('#offline-retry')
    btn.addEventListener('click', () => {
        btn.style.transform = 'scale(.95)'
        setTimeout(() => { btn.style.transform = '' }, 120)
        location.reload()
    })

    return el
}

/* ============================================================
   Публичное API
============================================================ */
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
        if (!el.classList.contains('show')) el.classList.add('hidden')
    }, 420)
}

/* ============================================================
   Проверка сервера
============================================================ */
async function pingBackend(url = PING_URL){
    try {
        const ctrl = new AbortController()
        const t = setTimeout(() => ctrl.abort(), 4000)
        const r = await fetch(url + '?t=' + Date.now(), {
            method: 'HEAD',
            cache: 'no-store',
            signal: ctrl.signal
        })
        clearTimeout(t)
        return r.ok || r.status === 304
    } catch { return false }
}

/* ============================================================
   Наблюдатель: слушает offline/online и пингует сервер
============================================================ */
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

/* ============================================================
   Обёртка для запросов — если упало по сети, показать экран
============================================================ */
export async function withOfflineGuard(promise, opts = {}){
    try {
        const res = await promise
        if (res && res.error && !opts.ignoreSupabaseError){
            const code = res.error.code || ''
            const msg  = (res.error.message || '').toLowerCase()
            const isNetwork = msg.includes('failed to fetch') ||
                msg.includes('network') ||
                msg.includes('timeout') ||
                code === 'PGRST301' ||
                code === 'NETWORK_ERROR'
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

/* ============================================================
   АВТОСТАРТ — показываем экран сразу при загрузке страницы
   Ни от чего не зависит. Работает безусловно.
============================================================ */
function autoStart(){
    if (!AUTO_SHOW) return

    showOfflineScreen('force')

    if (AUTO_HIDE_PING){
        setTimeout(async () => {
            const ok = await pingBackend()
            if (ok){
                const el = document.getElementById('offline-screen')
                const txt = el?.querySelector('#offline-status-text')
                if (txt) txt.textContent = 'Сервер отвечает. Обновляем…'
                setTimeout(() => location.reload(), 700)
            }
        }, HIDE_DELAY_MS)
    }

    // Страховка: если что-то удалит экран, вернём через 500 мс
    setTimeout(() => {
        const el = document.getElementById('offline-screen')
        if (!el || el.classList.contains('hidden')){
            showOfflineScreen('force')
        }
    }, 500)
}

if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', autoStart, { once: true })
    } else {
        autoStart()
    }
}

/* ============================================================
   Глобальные хелперы (чтобы можно было вызвать из консоли)
============================================================ */
if (typeof window !== 'undefined'){
    window.showOfflineScreen = showOfflineScreen
    window.hideOfflineScreen = hideOfflineScreen
    window.installOfflineWatcher = installOfflineWatcher
    window.withOfflineGuard = withOfflineGuard
}