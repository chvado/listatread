/* ============================================================
   TREAD STUDIO v3 — камера / редактор / публикация
   Всё белое, плавные анимации, меню через ts-sheet-modal
============================================================ */
import { supabase } from './supabase.js'

/* ============================================================
   SVG ИКОНКИ
============================================================ */
const SVG_TS = {
    flip:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.5"/><path d="M17 12h.01"/></svg>',
    flashOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>',
    flashOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z" opacity=".4"/><path d="M2 2l20 20"/></svg>',
    text:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14M12 5v15M8 20h8"/></svg>',
    photo:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M3 18l5-5 4 4 3-3 6 6"/></svg>',
    track:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    album:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
    poll:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/></svg>',
    sticker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8l7-7V6a3 3 0 0 0-3-3z"/><path d="M14 21v-4a3 3 0 0 1 3-3h4"/></svg>',
    quote:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="16" rx="3"/><path d="M7 9v3M7 9h2M10.5 9v3M10.5 9h2"/></svg>',
    chevDown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    musicNote:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    effects:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12s1.5-2 4-2 4 2 4 2"/><circle cx="9" cy="9" r=".8" fill="currentColor"/><circle cx="15" cy="9" r=".8" fill="currentColor"/></svg>',
    back:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    check:  '<svg viewBox="0 0 24 24" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
    textE:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14M12 5v15M8 20h8"/></svg>',
    stickerE:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8l7-7V6a3 3 0 0 0-3-3z"/><path d="M14 21v-4a3 3 0 0 1 3-3h4"/></svg>',
    soundE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
    editE:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    wmE:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="4"/><path d="M7 17l10-10"/></svg>',
    subsE:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h3M13 12h4M7 16h7M16 16h1"/></svg>',
    dlE:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M6 11l6 6 6-6M5 21h14"/></svg>'
}

/* ============================================================
   STATE
============================================================ */
const TS = {
    root: null,
    videoEl: null,
    stream: null,
    facing: 'environment',
    flashOn: false,
    selectedChannel: null,
    selectedTime: 15,
    recorder: null,
    chunks: [],
    recordStart: 0,
    timerInt: null,
    progressInt: null,
    recordedBlob: null,
    selectedTrack: null,
    selectedEffect: 'none',
    overlays: [],
    activeTab: 'record',
    audio: null,
    _trackOffset: 0,
    _pubDesc: '',
    _pubLabels: null,
    _pubAudience: null,
}

/* ============================================================
   ОТКРЫТИЕ / ЗАКРЫТИЕ
============================================================ */
export async function openTreadStudio(){
    if(!TS.root){
        TS.root = document.createElement('div')
        TS.root.id = 'tread-studio'
        TS.root.className = 'tstudio hidden'
        document.body.appendChild(TS.root)
    }
    TS.root.classList.remove('hidden')
    document.body.style.overflow = 'hidden'
    await renderCameraScreen()
}

export function closeTreadStudio(){
    try { TS.stream?.getTracks().forEach(t => t.stop()) } catch {}
    try { TS.audio?.pause() } catch {}
    if(TS.timerInt){ clearInterval(TS.timerInt); TS.timerInt = null }
    if(TS.progressInt){ clearInterval(TS.progressInt); TS.progressInt = null }
    document.body.classList.remove('ts-recording')
    document.body.style.overflow = ''
    TS.stream = null
    TS.audio = null
    TS.recordedBlob = null
    TS.selectedTrack = null
    TS.overlays = []
    TS.selectedEffect = 'none'
    // ⚡ СБРОС 3 ЭТАПА
    TS._pubDesc = ''
    TS._pubLabels = null
    TS._pubAudience = null
    if(TS.root){ TS.root.classList.add('hidden'); TS.root.innerHTML = '' }
}

/* ============================================================
   ЭКРАН КАМЕРЫ
============================================================ */
async function renderCameraScreen(){
    const root = TS.root
    root.innerHTML = `
        <div class="ts-rec-bar" id="ts-rec-bar"><div class="ts-rec-bar-fill" id="ts-rec-bar-fill"></div></div>
        <div class="ts-rec-timer" id="ts-rec-timer">0:00</div>

        <div class="ts-topbar">
            <button class="ts-back" id="ts-back">${SVG_TS.back}</button>
            <button class="ts-channel-pill ${TS.selectedChannel ? '' : 'empty'}" id="ts-channel-pill">
                <span class="ts-channel-ava" id="ts-channel-ava">
                    ${TS.selectedChannel?.avatar_url ? `<img src="${TS.selectedChannel.avatar_url}">` : '?'}
                </span>
                <span class="ts-channel-name" id="ts-channel-name">
                    ${TS.selectedChannel ? escapeHtml(TS.selectedChannel.name) : 'выберите канал'}
                </span>
                <span class="ts-channel-chev">${SVG_TS.chevDown}</span>
            </button>
        </div>

                <div class="ts-side" id="ts-side">
            ${renderSideBtnWithLabel('flip',  SVG_TS.flip,     'Повернуть камеру')}
            ${renderSideBtnWithLabel('flash', SVG_TS.flashOff, 'Вспышка')}
            ${renderSideBtnWithLabel('text',  SVG_TS.text,     'Тред',  true)}
            ${renderSideBtnWithLabel('photo', SVG_TS.photo,    'Фото',   true)}
            ${renderSideBtnWithLabel('track', SVG_TS.track,    'Треки',   true)}
                        <div id="ts-side-more">
                ${renderSideBtnWithLabel('album',   SVG_TS.album,   'Альбомы', true)}
                ${renderSideBtnWithLabel('poll',    SVG_TS.poll,    'Опросы',  true)}
                ${renderSideBtnWithLabel('sticker', SVG_TS.sticker, 'Стикеры', true)}
                ${renderSideBtnWithLabel('quote',   SVG_TS.quote,   'Цитаты',  true)}
            </div>
            <button class="ts-side-expand" id="ts-side-expand">${SVG_TS.chevDown}</button>
        </div>

        <div class="ts-preview-wrap">
            <video class="ts-preview" id="ts-preview" autoplay muted playsinline></video>
            <div class="ts-effects-overlay" id="ts-effects-overlay"></div>
        </div>

        <div class="ts-controls" id="ts-controls">
            <div class="ts-time-row" id="ts-time-row">
                ${[10,15,30,60,180].map(s =>
        `<button class="ts-time-btn ${TS.selectedTime===s?'active':''}" data-t="${s}">${formatDur(s)}</button>`
    ).join('')}
            </div>
            <div class="ts-record-row">
                <button class="ts-gallery" id="ts-gallery" disabled>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="16" rx="3"/>
                        <circle cx="9" cy="10" r="2"/>
                        <path d="M3 18l5-5 4 4 3-3 6 6"/>
                    </svg>
                </button>
                <button class="ts-record-btn" id="ts-record" disabled>
                    <div class="ts-record-inner"></div>
                </button>
                <button class="ts-effects-btn" id="ts-effects" disabled>
                    ${SVG_TS.effects}
                </button>
            </div>
            <button class="ts-track-strip" id="ts-track-strip" disabled>
                ${SVG_TS.musicNote}
                <span>добавить трек</span>
            </button>
            <input type="file" id="ts-gallery-input" accept="video/*" hidden>
        </div>
    `

    TS.videoEl = root.querySelector('#ts-preview')

    try { await startCamera() } catch(e){
        console.warn('[tstudio camera]', e)
        showToastLocal('Камера недоступна: ' + (e.message || ''), 'error')
    }

    refreshChannelDependentState()

    root.querySelector('#ts-back').addEventListener('click', closeTreadStudio)
    root.querySelector('#ts-channel-pill').addEventListener('click', openChannelPicker)

    root.querySelector('#ts-side-expand').addEventListener('click', () => {
        const more = root.querySelector('#ts-side-more')
        const exp  = root.querySelector('#ts-side-expand')
        const side = root.querySelector('#ts-side')
        const isOpen = more.classList.contains('open')
        more.classList.toggle('open', !isOpen)
        exp.classList.toggle('open', !isOpen)
        side.classList.toggle('expanded', !isOpen)   // ⚡ подписи у ВСЕХ кнопок
    })

    root.querySelectorAll('.ts-side-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSideAction(btn.dataset.k))
    })

    root.querySelectorAll('.ts-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(TS.recorder?.state === 'recording') return
            TS.selectedTime = +btn.dataset.t
            root.querySelectorAll('.ts-time-btn').forEach(b => b.classList.toggle('active', b === btn))
        })
    })

    root.querySelector('#ts-record').addEventListener('click', () => {
        if(TS.recorder?.state === 'recording') stopRecording()
        else startRecording()
    })

    root.querySelector('#ts-gallery').addEventListener('click', () => {
        root.querySelector('#ts-gallery-input').click()
    })
    root.querySelector('#ts-gallery-input').addEventListener('change', e => {
        const f = e.target.files?.[0]
        if(f) handleGalleryFile(f)
    })

    root.querySelector('#ts-effects').addEventListener('click', openEffectsSheet)

    root.querySelector('#ts-track-strip').addEventListener('click', () => {
        if(!TS.selectedChannel) return
        if(TS.selectedTrack) return
        openTrackPicker()
    })
}

function renderSideBtn(key, icon, label, withLabel, extraClass, disabled){
    const cls = 'ts-side-btn' + (extraClass ? ' ' + extraClass : '')
    const dis = disabled ? 'disabled' : ''
    return `<button class="${cls}" data-k="${key}" ${dis} title="${label}">${icon}</button>`
}
function renderSideBtnWithLabel(key, icon, label, disabled){
    const dis = disabled ? 'disabled' : ''
    return `<div class="ts-side-row">
        <span class="ts-side-row-label">${label}</span>
        <button class="ts-side-btn" data-k="${key}" ${dis} title="${label}">${icon}</button>
    </div>`
}
/* ============================================================
   КАМЕРА
============================================================ */
async function startCamera(){
    if(TS.stream) return

    // Сначала пробуем максимальное разрешение — это снижает цифровой зум
    const highRes = {
        video: {
            facingMode: TS.facing,
            width:  { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 }
        },
        audio: true
    }
    const fallback = {
        video: { facingMode: TS.facing },
        audio: true
    }

    try {
        TS.stream = await navigator.mediaDevices.getUserMedia(highRes)
    } catch(e){
        console.warn('[camera] high-res failed, fallback:', e.message)
        TS.stream = await navigator.mediaDevices.getUserMedia(fallback)
    }

    if(TS.videoEl){
        TS.videoEl.srcObject = TS.stream
        await TS.videoEl.play().catch(()=>{})
    }

    // ⚡ Устанавливаем минимальный (обычно 1x) зум, чтобы не было кропа
    await applyMinZoom()
    attachPinchZoom()
}

async function applyMinZoom(){
    try {
        const track = TS.stream?.getVideoTracks()[0]
        if(!track) return
        const caps = track.getCapabilities?.()
        if(caps?.zoom){
            const min = caps.zoom.min ?? 1
            await track.applyConstraints({ advanced: [{ zoom: min }] })
            TS._zoom = min
            TS._zoomMin = caps.zoom.min ?? 1
            TS._zoomMax = caps.zoom.max ?? 1
        }
    } catch(e){ console.warn('[zoom init]', e.message) }
}

let _pinch = null

function attachPinchZoom(){
    const el = TS.videoEl
    if(!el || el.dataset.pinchBound === '1') return
    el.dataset.pinchBound = '1'

    el.addEventListener('touchstart', e => {
        if(e.touches.length === 2){
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            _pinch = {
                dist: Math.hypot(dx, dy),
                zoom: TS._zoom ?? TS._zoomMin ?? 1
            }
        }
    }, { passive: true })

    el.addEventListener('touchmove', async e => {
        if(e.touches.length !== 2 || !_pinch) return
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        const ratio = dist / (_pinch.dist || 1)

        const track = TS.stream?.getVideoTracks()[0]
        if(!track) return
        const caps = track.getCapabilities?.()
        if(!caps?.zoom) return

        const min = caps.zoom.min ?? 1
        const max = caps.zoom.max ?? 1
        let z = _pinch.zoom * ratio
        z = Math.max(min, Math.min(max, z))
        TS._zoom = z
        try {
            await track.applyConstraints({ advanced: [{ zoom: z }] })
        } catch(_) {}
    }, { passive: true })

    el.addEventListener('touchend', e => {
        if(e.touches.length < 2) _pinch = null
    })
}

function stopCameraStream(){
    try { TS.stream?.getTracks().forEach(t => t.stop()) } catch {}
    TS.stream = null
    if(TS.videoEl) TS.videoEl.srcObject = null
}

function refreshChannelDependentState(){
    const has = !!TS.selectedChannel
    const root = TS.root; if(!root) return

    const pill = root.querySelector('#ts-channel-pill')
    const ava  = root.querySelector('#ts-channel-ava')
    const name = root.querySelector('#ts-channel-name')
    if(pill) pill.classList.toggle('empty', !has)
    if(ava)  ava.innerHTML = TS.selectedChannel?.avatar_url
        ? `<img src="${TS.selectedChannel.avatar_url}">`
        : '?'
    if(name) name.textContent = TS.selectedChannel ? TS.selectedChannel.name : 'выберите канал'

    const rec = root.querySelector('#ts-record')
    const gal = root.querySelector('#ts-gallery')
    const eff = root.querySelector('#ts-effects')
    const trk = root.querySelector('#ts-track-strip')
    if(rec) rec.disabled = !has
    if(gal) gal.disabled = !has
    if(eff) eff.disabled = !has
    if(trk) trk.disabled = !has

    root.querySelectorAll('.ts-side-btn[data-k="text"],.ts-side-btn[data-k="photo"],.ts-side-btn[data-k="track"],.ts-side-btn[data-k="album"],.ts-side-btn[data-k="poll"],.ts-side-btn[data-k="sticker"],.ts-side-btn[data-k="quote"]')
        .forEach(b => b.disabled = !has)
}

/* ============================================================
   ВЫБОР КАНАЛА — только общественные, в которых подписан
============================================================ */
async function openChannelPicker(){
    const { data:{ user }, error } = await supabase.auth.getUser()
    if(error || !user){ showToastLocal('Войдите в аккаунт', 'error'); return }

    const [{ data:owned }, { data:subs }] = await Promise.all([
        supabase.from('channels')
            .select('id, name, avatar_url, channel_type')
            .eq('owner_id', user.id),
        supabase.from('subscriptions')
            .select('channels ( id, name, avatar_url, channel_type )')
            .eq('follower_id', user.id)
    ])

    const ownedChannels = (owned || []).filter(c => c && c.id)
    const ownedIds = new Set(ownedChannels.map(c => c.id))

    // Показываем только общественные (community), в которых юзер может постить
    const subscribedCommunity = (subs || [])
        .map(s => s.channels)
        .filter(c => c && c.id && !ownedIds.has(c.id))
        .filter(c => c.channel_type === 'community')

    document.getElementById('ts-channel-sheet')?.remove()

    const renderItem = (c, isOwned) => {
        const ava = c.avatar_url
            ? `<img src="${c.avatar_url}" alt="">`
            : (c.name || 'K').charAt(0).toUpperCase()
        const subtitle = isOwned ? 'Личный канал' : 'Общественный канал'
        return `<button class="ts-channel-item"
            data-id="${c.id}"
            data-name="${escapeHtml(c.name || 'Канал')}"
            data-ava="${c.avatar_url || ''}"
            data-type="${isOwned ? 'owned' : 'community'}">
            <span class="ts-channel-item-ava">${ava}</span>
            <span class="ts-channel-item-info">
                <div class="ts-channel-item-name">${escapeHtml(c.name || 'Канал')}</div>
                <div class="ts-channel-item-sub">${subtitle}</div>
            </span>
        </button>`
    }

    const sectionsHtml = `
        ${ownedChannels.length ? `
            <div class="ts-channel-section-title">Мои каналы</div>
            ${ownedChannels.map(c => renderItem(c, true)).join('')}
        ` : ''}
        ${subscribedCommunity.length ? `
            <div class="ts-channel-section-title">Общественные каналы</div>
            ${subscribedCommunity.map(c => renderItem(c, false)).join('')}
        ` : ''}
        ${!ownedChannels.length && !subscribedCommunity.length ? `
            <p style="text-align:center;padding:40px 16px;color:var(--text-secondary);font-size:14px;line-height:1.5">
                Нет доступных каналов.<br>
                Создайте свой канал или подпишитесь на общественный
            </p>
        ` : ''}
    `

    const sheet = document.createElement('div')
    sheet.id = 'ts-channel-sheet'
    sheet.className = 'ts-sheet-modal'
    sheet.innerHTML = `
        <div class="ts-sheet-backdrop"></div>
        <div class="ts-sheet-body">
            <div class="ts-sheet-handle"></div>
            <div class="ts-sheet-title">Выберите канал</div>
            <div class="ts-channel-list">${sectionsHtml}</div>
        </div>`
    document.body.appendChild(sheet)

    sheet.addEventListener('click', e => {
        const item = e.target.closest('.ts-channel-item')
        if(item){
            TS.selectedChannel = {
                id: item.dataset.id,
                name: item.dataset.name,
                avatar_url: item.dataset.ava,
                type: item.dataset.type
            }
            sheet.remove()
            refreshChannelDependentState()
            return
        }
        if(e.target.closest('.ts-sheet-backdrop')) sheet.remove()
    })
}

/* ============================================================
   ДЕЙСТВИЯ БОКОВЫХ КНОПОК
============================================================ */
async function handleSideAction(key){
    if(!TS.selectedChannel && ['text','photo','track','album','poll','sticker','quote'].includes(key)){
        showToastLocal('Сначала выберите канал', 'info')
        return
    }
    switch(key){
        case 'flip': await flipCamera(); return
        case 'flash': await toggleFlash(); return
        case 'text':
        case 'photo':
        case 'poll':
        case 'sticker':
        case 'quote':
            await openChannelQuickComposer(key)
            return
        case 'track':
            showToastLocal('Выложить трек — в канал, пока в разработке', 'info')
            return
        case 'album':
            showToastLocal('Альбомы — скоро', 'info')
            return
    }
}

async function flipCamera(){
    TS.facing = TS.facing === 'environment' ? 'user' : 'environment'
    stopCameraStream()
    try { await startCamera() } catch(e){ console.warn(e) }
}

async function toggleFlash(){
    TS.flashOn = !TS.flashOn
    try {
        const track = TS.stream?.getVideoTracks()[0]
        if(track){
            const caps = track.getCapabilities?.()
            if(caps?.torch){
                await track.applyConstraints({ advanced: [{ torch: TS.flashOn }] })
            }
        }
    } catch(e){ console.warn('[flash]', e) }
    const btn = TS.root?.querySelector('.ts-side-btn[data-k="flash"]')
    if(btn){
        btn.classList.toggle('active', TS.flashOn)
        btn.innerHTML = TS.flashOn ? SVG_TS.flashOn : SVG_TS.flashOff
    }
}

/* ============================================================
   БЫСТРЫЙ КОМПОЗЕР — открывает канал и кликает по нужной кнопке
============================================================ */
async function openChannelQuickComposer(kind){
    if(!TS.selectedChannel) return
    const chId   = TS.selectedChannel.id
    const chName = TS.selectedChannel.name || 'канал'
    closeTreadStudio()

    // 1. Открываем канал
    let opened = false
    if(typeof window.__ltOpenChannel === 'function'){
        try { await window.__ltOpenChannel(chId); opened = true }
        catch(e){ console.warn('[openChannel]', e) }
    }
    if(!opened){
        document.dispatchEvent(new CustomEvent('lt:openChannel', { detail: { id: chId } }))
    }

    // 2. Ждём появления композера до 3 секунд
    const composer = await new Promise(resolve => {
        const start = Date.now()
        const tick = () => {
            const el = document.getElementById('ch-new-post')
            if(el) return resolve(el)
            if(Date.now() - start > 3000) return resolve(null)
            setTimeout(tick, 120)
        }
        tick()
    })

    if(!composer){
        showToastLocal(
            `Не удалось открыть канал «${chName}». Возможно, у вас нет прав на публикацию.`,
            'error',
            4500
        )
        return
    }

    // 3. Подсветка + скролл
    composer.scrollIntoView({ behavior: 'smooth', block: 'center' })
    composer.style.transition = 'box-shadow .4s ease'
    composer.style.boxShadow = '0 0 0 3px var(--blue), 0 8px 32px rgba(10,132,255,.35)'

    const publishBtn = composer.querySelector('#ch-new-publish')
    if(publishBtn){
        let blinks = 0
        const blinkInt = setInterval(() => {
            publishBtn.style.opacity = publishBtn.style.opacity === '0.3' ? '1' : '0.3'
            if(++blinks >= 10){
                clearInterval(blinkInt)
                publishBtn.style.opacity = '1'
            }
        }, 500)
    }
    setTimeout(() => { composer.style.boxShadow = '' }, 5000)

    // 4. Активируем нужный инструмент
    if(kind === 'text'){ composer.querySelector('#ch-new-text')?.focus() }
    if(kind === 'sticker'){ composer.querySelector('#ch-new-sticker')?.click() }
    if(kind === 'photo'){ composer.querySelector('#ch-new-photo')?.click() }
    if(kind === 'poll'){ composer.querySelector('#ch-new-poll')?.click() }
    if(kind === 'quote'){ composer.querySelector('#ch-new-quote')?.click() }
}

/* ============================================================
   ЗАПИСЬ
============================================================ */
async function startRecording(){
    if(!TS.selectedChannel){ showToastLocal('Сначала выберите канал', 'info'); return }
    if(!TS.stream){ showToastLocal('Камера недоступна', 'error'); return }
    if(TS.recorder?.state === 'recording') return

    try {
        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4'

        // ═══════════════════════════════════════════════════════════
        // ⚡ СТАБИЛЬНАЯ ЗАПИСЬ: микшируем трек через AudioContext
        //    → нет 2-сек. задержки, нет «подводного» звука,
        //    → звук не пропадает в начале, камера не чернеет.
        // ═══════════════════════════════════════════════════════════
        let recordStream = TS.stream
        let audioCtx = null

        if(TS.selectedTrack?.src){
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
                if(audioCtx.state === 'suspended') await audioCtx.resume();

                const audioEl = new Audio();
                audioEl.crossOrigin = 'anonymous';
                audioEl.preload = 'auto';
                audioEl.loop = true;
                audioEl.src = TS.selectedTrack.src;

                await new Promise(resolve => {
                    if(audioEl.readyState >= 3) return resolve();
                    let done = false;
                    const finish = () => { if(!done){ done = true; resolve() } };
                    audioEl.addEventListener('canplaythrough', finish, { once: true });
                    audioEl.addEventListener('error', finish, { once: true });
                    audioEl.load();
                    setTimeout(finish, 2000);
                });

                audioEl.currentTime = TS.selectedTrack.startAt || 0;

                const trackSrc = audioCtx.createMediaElementSource(audioEl);
                const dest     = audioCtx.createMediaStreamDestination();

                // ⚡ Только трек — без микрофона (чтобы не было «подводного» эха)
                const trackGain = audioCtx.createGain();
                trackGain.gain.value = 1.0;
                trackSrc.connect(trackGain).connect(dest);

                // Трек → в динамик (чтоб юзер слышал)
                const speakerGain = audioCtx.createGain();
                speakerGain.gain.value = 0.7;
                trackSrc.connect(speakerGain).connect(audioCtx.destination);

                // Компрессор — убирает клиппинг
                const compressor = audioCtx.createDynamicsCompressor();
                compressor.threshold.value = -12;
                compressor.knee.value = 12;
                compressor.ratio.value = 4;
                compressor.attack.value = 0.003;
                compressor.release.value = 0.25;

                // реконнект через компрессор
                trackSrc.disconnect();
                trackSrc.connect(compressor).connect(dest);
                compressor.connect(speakerGain).connect(audioCtx.destination);

                recordStream = new MediaStream([
                    ...TS.stream.getVideoTracks(),
                    ...dest.stream.getAudioTracks()
                ]);

                TS._audioEl  = audioEl;
                TS._audioCtx = audioCtx;

                try { await audioEl.play() } catch(e){ console.warn('[audio play]', e) }
            } catch(e){
                console.warn('[audio mix fail → speaker fallback]', e);
                recordStream = TS.stream;
                try {
                    TS._audioEl = new Audio(TS.selectedTrack.src);
                    TS._audioEl.currentTime = TS.selectedTrack.startAt || 0;
                    TS._audioEl.volume = 0.85;
                    await new Promise(r => {
                        TS._audioEl.addEventListener('canplay', r, { once: true });
                        setTimeout(r, 1500);
                    });
                    TS._audioEl.play().catch(()=>{});
                } catch(_){}
            }
        }

        TS.recorder = new MediaRecorder(recordStream, {
            mimeType: mime,
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000
        });
        TS.chunks = []
        TS.recorder.ondataavailable = e => { if(e.data?.size) TS.chunks.push(e.data) }
        TS.recorder.onstop = async () => {
            TS.recordedBlob = new Blob(TS.chunks, { type: 'video/webm' })
            TS.chunks = []
            try { TS._audioEl?.pause() } catch {}
            try { await TS._audioCtx?.close() } catch {}
            TS._audioEl  = null
            TS._audioCtx = null
            if(TS.timerInt){ clearInterval(TS.timerInt); TS.timerInt = null }
            if(TS.progressInt){ clearInterval(TS.progressInt); TS.progressInt = null }
            showRecordingUI(false)
            await openEditor(TS.recordedBlob)
        }

        TS.recorder.start(120)
        TS.recordStart = Date.now()
        showRecordingUI(true)
        startRecordTimer()
    } catch(e){
        showToastLocal('Не удалось начать запись: ' + (e.message || ''), 'error')
    }
}

function stopRecording(){
    if(TS.recorder?.state === 'recording') TS.recorder.stop()
    try { TS._audioEl?.pause() } catch {}
}



function showRecordingUI(on){
    const root = TS.root; if(!root) return
    const bar   = root.querySelector('#ts-rec-bar')
    const timer = root.querySelector('#ts-rec-timer')
    const recBtn= root.querySelector('#ts-record')

    if(on){
        document.body.classList.add('ts-recording')
        bar?.classList.add('active')
        timer?.classList.add('active')
        recBtn?.classList.add('recording')
    } else {
        document.body.classList.remove('ts-recording')
        bar?.classList.remove('active')
        timer?.classList.remove('active')
        recBtn?.classList.remove('recording')
        const fill = root.querySelector('#ts-rec-bar-fill')
        if(fill) fill.style.width = '0%'
        if(timer) timer.textContent = '0:00'
    }
}

function startRecordTimer(){
    const totalMs = TS.selectedTime * 1000
    const bar = TS.root?.querySelector('#ts-rec-bar-fill')
    const timer = TS.root?.querySelector('#ts-rec-timer')
    TS.progressInt = setInterval(() => {
        const elapsed = Date.now() - TS.recordStart
        const pct = Math.min(100, elapsed / totalMs * 100)
        if(bar) bar.style.width = pct + '%'
        if(timer){
            const remain = Math.max(0, Math.ceil((totalMs - elapsed) / 1000))
            timer.textContent = formatDur(remain)
        }
        if(elapsed >= totalMs){
            clearInterval(TS.progressInt); TS.progressInt = null
            stopRecording()
        }
    }, 100)
}



/* ============================================================
   ГАЛЕРЕЯ
============================================================ */
async function handleGalleryFile(file){
    if(!TS.selectedChannel){ showToastLocal('Сначала выберите канал', 'info'); return }
    if(!file.type.startsWith('video/')){ showToastLocal('Выберите видео', 'error'); return }
    TS.recordedBlob = file
    await openEditor(file)
}

/* ============================================================
   ЭФФЕКТЫ
============================================================ */
function openEffectsSheet(){
    document.getElementById('ts-effects-sheet')?.remove()

    const sheet = document.createElement('div')
    sheet.id = 'ts-effects-sheet'
    sheet.className = 'ts-sheet-modal'
    sheet.innerHTML = `
        <div class="ts-sheet-backdrop"></div>
        <div class="ts-sheet-body">
            <div class="ts-sheet-handle"></div>
            <div class="ts-sheet-title">Эффекты</div>
            <div class="ts-effects-grid">
                ${renderEffectCard('none',  'Оригинал', SVG_TS.effects)}
                ${renderEffectCard('warm',  'Тёплый',   SVG_TS.effects)}
                ${renderEffectCard('cool',  'Холодный', SVG_TS.effects)}
                ${renderEffectCard('vintage','Винтаж',  SVG_TS.effects)}
                ${renderEffectCard('ov-hearts', 'Сердечки', SVG_TS.effects)}
                ${renderEffectCard('ov-stars',  'Звёзды',   SVG_TS.effects)}
                ${renderEffectCard('ov-neon',   'Неон',     SVG_TS.effects)}
            </div>
        </div>`
    document.body.appendChild(sheet)

    sheet.addEventListener('click', e => {
        const card = e.target.closest('.ts-effect-card')
        if(card){
            applyEffect(card.dataset.e)
            sheet.remove()
            return
        }
        if(e.target.closest('.ts-sheet-backdrop')) sheet.remove()
    })
}

function renderEffectCard(key, label, icon){
    const active = TS.selectedEffect === key ? 'active' : ''
    return `<button class="ts-effect-card ${active}" data-e="${key}">
        <span class="ts-effect-card-icon">${icon}</span>
        <span class="ts-effect-card-label">${label}</span>
    </button>`
}

function applyEffect(key){
    TS.selectedEffect = key
    const video = TS.videoEl
    const ov    = TS.root?.querySelector('#ts-effects-overlay')
    if(video){
        video.classList.remove('filter-warm','filter-cool','filter-vintage')
        if(key === 'warm')    video.classList.add('filter-warm')
        if(key === 'cool')    video.classList.add('filter-cool')
        if(key === 'vintage') video.classList.add('filter-vintage')
    }
    if(ov){
        ov.className = 'ts-effects-overlay'
        if(key.startsWith('ov-')) ov.classList.add('active', key)
    }
}



let _cameraPausedForSheet = false

function pauseCameraForSheet(){
    if(_cameraPausedForSheet) return
    _cameraPausedForSheet = true
    try {
        TS.stream?.getVideoTracks().forEach(t => { t.enabled = false })
        if(TS.videoEl) try { TS.videoEl.pause() } catch {}
    } catch(e){ console.warn('[pause camera]', e) }
}

async function resumeCameraAfterSheet(){
    if(!_cameraPausedForSheet) return
    _cameraPausedForSheet = false
    try {
        TS.stream?.getVideoTracks().forEach(t => { t.enabled = true })
        if(TS.videoEl && TS.videoEl.srcObject){
            try { await TS.videoEl.play() } catch {}
        }
    } catch(e){ console.warn('[resume camera]', e) }
}

function checkCameraState(){
    const trackSheet = document.getElementById('ts-track-sheet')
    const trimSheet = document.getElementById('ts-trim-sheet')
    if(!trackSheet && !trimSheet){
        resumeCameraAfterSheet()
    } else {
        pauseCameraForSheet()
    }
}

async function loadAllAudioTracks(){
    try {
        const { data, error } = await supabase.from('posts')
            .select('id, content, media_url, media_title, created_at, author_id, channel_id, profiles:author_id ( username, full_name, avatar_url ), channels:channel_id ( id, name, avatar_url )')
            .not('media_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(500)

        if(error){ console.warn('[loadAllAudioTracks]', error.message); return [] }

        const tracks = (data || []).filter(p => isAudioUrl(p.media_url))

        // 🔀 перемешиваем
        for(let i = tracks.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [tracks[i], tracks[j]] = [tracks[j], tracks[i]]
        }
        return tracks
    } catch(e){ console.warn('[loadAllAudioTracks]', e); return [] }
}

function renderTrackRow(t){
    const prof = t.profiles || {}
    const ch   = t.channels || {}
    const trackName   = t.media_title || (t.content ? t.content.slice(0, 40) : 'Трек')
    const authorName  = prof.full_name || prof.username || 'user'
    const channelName = ch.name || 'Канал'
    const channelAva  = ch.avatar_url
    const authorAva   = prof.avatar_url

    const chAvaHtml = channelAva
        ? `<img src="${channelAva}" alt="">`
        : escapeHtml(channelName.charAt(0).toUpperCase())
    const authAvaHtml = authorAva
        ? `<img src="${authorAva}" alt="">`
        : escapeHtml(authorName.charAt(0).toUpperCase())

    return `<div class="ts-track-row"
        data-id="${t.id}"
        data-name="${escapeHtml(trackName)}"
        data-author="${escapeHtml(authorName)}"
        data-cover="${escapeHtml(authorAva || '')}"
        data-channel="${escapeHtml(channelName)}"
        data-channel-cover="${escapeHtml(channelAva || '')}"
        data-src="${t.media_url}">
        <div class="ts-track-row-ava">${chAvaHtml}</div>
        <div class="ts-track-row-info">
            <div class="ts-track-row-title">${escapeHtml(trackName)}</div>
            <div class="ts-track-row-meta">
                <span class="ts-track-row-author-ava">${authAvaHtml}</span>
                <span class="ts-track-row-author-name">@${escapeHtml((prof.username||'user').replace(/^@/,''))}</span>
                <span class="ts-track-row-from">from</span>
                <span class="ts-track-row-channel">${escapeHtml(channelName)}</span>
            </div>
        </div>
        <button type="button" class="ts-track-row-play" aria-label="Включить">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path class="icon-play" d="M8 5v14l11-7z"/>
                <g class="icon-pause" style="display:none"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></g>
            </svg>
        </button>
        <button type="button" class="ts-track-row-listen" aria-label="Прослушать">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 6l6 6-6 6"/>
            </svg>
        </button>
    </div>`
}

function renderTrackPickerList(){
    const list = document.getElementById('ts-track-list')
    const more = document.getElementById('ts-track-more')
    if(!list) return

    const all = TS._allTracks || []
    const shown = all.slice(0, TS._shownCount)

    if(!shown.length){
        list.innerHTML = '<p class="empty small" style="padding:24px 16px;text-align:center;color:var(--text-tertiary)">Нет доступных треков</p>'
        if(more) more.style.display = 'none'
        return
    }

    list.innerHTML = shown.map(renderTrackRow).join('')

    if(more){
        if(TS._shownCount >= all.length){
            more.style.display = 'none'
        } else {
            more.style.display = ''
            more.textContent = 'Загрузить ещё'
        }
    }
}

async function openTrackPicker(){
    document.getElementById('ts-track-sheet')?.remove()

    // ⚡ Выключаем камеру — экономим ресурсы
    pauseCameraForSheet()

    const sheet = document.createElement('div')
    sheet.id = 'ts-track-sheet'
    sheet.className = 'ts-sheet-modal'
    sheet.innerHTML = `
        <div class="ts-sheet-backdrop"></div>
        <div class="ts-sheet-body">
            <div class="ts-sheet-handle"></div>
            <div class="ts-sheet-title">добавить трек</div>
            <div class="ts-track-list" id="ts-track-list">
                <div style="text-align:center;padding:30px 0;color:var(--text-secondary);font-size:14px">Загрузка…</div>
            </div>
            <button class="ts-track-more" id="ts-track-more" style="display:none">Загрузить ещё</button>
        </div>`
    document.body.appendChild(sheet)

    TS._allTracks    = await loadAllAudioTracks()
    TS._shownCount   = 10
    TS._previewAudio = null
    TS._previewSrc   = null
    renderTrackPickerList()

    sheet.addEventListener('click', e => {
        if(e.target.closest('.ts-sheet-backdrop')){ closeTrackSheet(); return }

        const playBtn = e.target.closest('.ts-track-row-play')
        if(playBtn){ e.stopPropagation(); handleTrackRowPlay(playBtn); return }

        const listenBtn = e.target.closest('.ts-track-row-listen')
        if(listenBtn){ e.stopPropagation(); handleTrackRowListen(listenBtn); return }

        if(e.target.closest('#ts-track-more')){
            TS._shownCount += 5
            renderTrackPickerList()
        }
    })

    function closeTrackSheet(){
        if(TS._previewAudio){
            try { TS._previewAudio.pause() } catch {}
            TS._previewAudio = null
            TS._previewSrc   = null
        }
        sheet.remove()
        checkCameraState()
    }
}

function handleTrackRowPlay(btn){
    const row = btn.closest('.ts-track-row')
    if(!row) return
    const src = row.dataset.src

    if(!TS._previewAudio){
        TS._previewAudio = new Audio()
        TS._previewAudio.crossOrigin = 'anonymous'
        TS._previewAudio.addEventListener('ended', () => {
            document.querySelectorAll('.ts-track-row-play.playing').forEach(b => {
                b.classList.remove('playing')
                const ip = b.querySelector('.icon-play')
                const iz = b.querySelector('.icon-pause')
                if(ip) ip.style.display = ''
                if(iz) iz.style.display = 'none'
            })
        })
    }

    const playIcon  = btn.querySelector('.icon-play')
    const pauseIcon = btn.querySelector('.icon-pause')

    if(TS._previewAudio.src === src && !TS._previewAudio.paused){
        TS._previewAudio.pause()
        btn.classList.remove('playing')
        if(playIcon)  playIcon.style.display  = ''
        if(pauseIcon) pauseIcon.style.display = 'none'
        return
    }

    document.querySelectorAll('.ts-track-row-play.playing').forEach(b => {
        b.classList.remove('playing')
        const ip = b.querySelector('.icon-play')
        const iz = b.querySelector('.icon-pause')
        if(ip) ip.style.display = ''
        if(iz) iz.style.display = 'none'
    })

    TS._previewAudio.pause()
    TS._previewAudio.src = src
    TS._previewAudio.currentTime = 0
    TS._previewAudio.play().catch(()=>{})
    btn.classList.add('playing')
    if(playIcon)  playIcon.style.display  = 'none'
    if(pauseIcon) pauseIcon.style.display = ''
}

function handleTrackRowListen(btn){
    const row = btn.closest('.ts-track-row')
    if(!row) return

    if(TS._previewAudio){ try { TS._previewAudio.pause() } catch {} }
    document.querySelectorAll('.ts-track-row-play.playing').forEach(b => {
        b.classList.remove('playing')
        const ip = b.querySelector('.icon-play')
        const iz = b.querySelector('.icon-pause')
        if(ip) ip.style.display = ''
        if(iz) iz.style.display = 'none'
    })

    // Закрываем трек-пикер БЕЗ возобновления камеры — её возобновит trim-picker при закрытии
    const sheet = document.getElementById('ts-track-sheet')
    if(sheet) sheet.remove()

    const track = {
        id:       row.dataset.id,
        name:     row.dataset.name,
        author:   row.dataset.author,
        cover:    row.dataset.cover || row.dataset.channelCover,
        channel:  row.dataset.channel,
        src:      row.dataset.src,
        duration: 0
    }

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.preload = 'metadata'
    audio.src = track.src

    const openTrim = () => openTrimPicker(track)

    audio.addEventListener('loadedmetadata', () => {
        track.duration = audio.duration || 30
        openTrim()
    }, { once: true })
    audio.addEventListener('error', () => {
        track.duration = 30
        openTrim()
    }, { once: true })
}

/* ============================================================
   TRIM PICKER v2 — с -1s/+1s и play выбранного фрагмента
============================================================ */
function openTrimPicker(track){
    document.getElementById('ts-trim-sheet')?.remove()
    pauseCameraForSheet()

    const totalDur = track.duration || 30
    const needDur  = TS.selectedTime
    const pctWidth = Math.min(100, (needDur / totalDur) * 100)
    let startAt = 0
    let trimAudio = null
    let trimPlaying = false
    let trimStopTimer = null

    const sheet = document.createElement('div')
    sheet.id = 'ts-trim-sheet'
    sheet.className = 'ts-sheet-modal'
    sheet.innerHTML = `
        <div class="ts-sheet-backdrop"></div>
        <div class="ts-sheet-body">
            <div class="ts-sheet-handle"></div>
            <div class="ts-sheet-title">${escapeHtml(track.name)} · ${escapeHtml(track.author)}</div>
            <div class="ts-trim-wave" id="ts-trim-wave">
                <div class="ts-trim-wave-inner"></div>
                <div class="ts-trim-sel" id="ts-trim-sel" style="left:0;width:${pctWidth}%"></div>
            </div>
            <div class="ts-trim-time">
                <span id="ts-trim-start">0:00</span>
                <span id="ts-trim-end">${formatDur(needDur)}</span>
            </div>
            <div class="ts-trim-controls">
                <button type="button" class="ts-trim-ctrl-btn" id="ts-trim-back">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                    <span>-1с</span>
                </button>
                <button type="button" class="ts-trim-play-btn" id="ts-trim-play">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" id="ts-trim-play-icon"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button type="button" class="ts-trim-ctrl-btn" id="ts-trim-fwd">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z"/></svg>
                    <span>+1с</span>
                </button>
            </div>
            <button type="button" class="ts-trim-use" id="ts-trim-use">Выбрать</button>
        </div>
    `
    document.body.appendChild(sheet)

    const wave   = sheet.querySelector('#ts-trim-wave')
    const selEl  = sheet.querySelector('#ts-trim-sel')
    const tStart = sheet.querySelector('#ts-trim-start')
    const tEnd   = sheet.querySelector('#ts-trim-end')
    const playBtn= sheet.querySelector('#ts-trim-play')
    const playIcon = sheet.querySelector('#ts-trim-play-icon')

    function updateUI(){
        const pct = (startAt / totalDur) * 100
        selEl.style.left  = pct + '%'
        selEl.style.width = pctWidth + '%'
        tStart.textContent = formatDur(Math.floor(startAt))
        tEnd.textContent   = formatDur(Math.floor(startAt + needDur))
    }

    function stopTrimPreview(){
        if(trimAudio){ try { trimAudio.pause() } catch {} }
        if(trimStopTimer){ clearTimeout(trimStopTimer); trimStopTimer = null }
        trimPlaying = false
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'
    }

    function startTrimPreview(){
        if(!trimAudio){
            trimAudio = new Audio(track.src)
            trimAudio.crossOrigin = 'anonymous'
        }
        trimAudio.currentTime = startAt
        trimAudio.play().then(() => {
            trimPlaying = true
            playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/>'
            trimStopTimer = setTimeout(stopTrimPreview, needDur * 1000)
        }).catch(e => console.warn('[trim play]', e))
    }

    // Клик по play
    playBtn.addEventListener('click', () => {
        if(trimPlaying) stopTrimPreview()
        else startTrimPreview()
    })

    // -1s / +1s
    sheet.querySelector('#ts-trim-back').addEventListener('click', () => {
        startAt = Math.max(0, startAt - 1)
        updateUI()
        if(trimPlaying && trimAudio) trimAudio.currentTime = startAt
    })
    sheet.querySelector('#ts-trim-fwd').addEventListener('click', () => {
        startAt = Math.min(Math.max(0, totalDur - needDur), startAt + 1)
        updateUI()
        if(trimPlaying && trimAudio) trimAudio.currentTime = startAt
    })

    // Свайп по волне
    let drag = false
    const setFromX = clientX => {
        const rect = wave.getBoundingClientRect()
        const maxPct = Math.max(0, 1 - needDur / totalDur)
        const pct = Math.max(0, Math.min(maxPct, (clientX - rect.left) / rect.width))
        startAt = pct * totalDur
        updateUI()
        if(trimPlaying && trimAudio) trimAudio.currentTime = startAt
    }
    wave.addEventListener('pointerdown', e => { drag = true; setFromX(e.clientX); wave.setPointerCapture(e.pointerId) })
    wave.addEventListener('pointermove', e => { if(drag) setFromX(e.clientX) })
    wave.addEventListener('pointerup', () => { drag = false })

    // Закрытие
    function closeTrim(){
        stopTrimPreview()
        trimAudio = null
        sheet.remove()
        checkCameraState()
    }

    sheet.addEventListener('click', e => {
        if(e.target.closest('.ts-sheet-backdrop')){ closeTrim(); return }
        if(e.target.closest('#ts-trim-use')){
            TS.selectedTrack = { ...track, startAt }
            closeTrim()
            renderSelectedTrackStrip()
            showToastLocal('Трек выбран', 'success')
            return
        }
    })

    updateUI()
}

function renderSelectedTrackStrip(){
    const btn = TS.root?.querySelector('#ts-track-strip')
    if(!btn || !TS.selectedTrack) return
    const t = TS.selectedTrack
    const ava = t.cover ? `<img src="${t.cover}" alt="">` : t.author.charAt(0).toUpperCase()
    btn.classList.add('selected')
    btn.innerHTML = `
        <span class="ts-track-ava">${ava}</span>
        <span class="ts-track-title">${escapeHtml(t.name)}</span>
        <span class="ts-track-sep">·</span>
        <span class="ts-track-author">${escapeHtml(t.author)}</span>
    `
    btn.onclick = () => {
        if(confirm('Убрать трек?')){
            TS.selectedTrack = null
            btn.classList.remove('selected')
            btn.innerHTML = `${SVG_TS.musicNote}<span>добавить трек</span>`
            btn.onclick = () => { if(TS.selectedChannel) openTrackPicker() }
        }
    }
}

/* ============================================================
   РЕДАКТОР — видео с полями, музыка играет
============================================================ */
async function openEditor(blob){
    TS.activeTab = 'editor'
    stopCameraStream()

    const root = TS.root
    root.innerHTML = `
        <div class="ts-editor" id="ts-editor">
            <div class="ts-editor-video-wrap">
                <video class="ts-editor-video" id="ts-editor-video"
                    playsinline autoplay loop muted></video>
            </div>
            <div id="ts-overlays-layer" class="ts-overlays-layer"></div>
            <div class="ts-editor-side" id="ts-editor-side">
                ${editorSideBtn('sound', SVG_TS.soundE, 'Звук', TS.selectedTrack?.cover)}
                ${editorSideBtn('filter', SVG_TS.filter, 'Фильтры')}
                ${editorSideBtn('text', SVG_TS.textE, 'Текст')}
                ${editorSideBtn('sticker', SVG_TS.stickerE, 'Стикер')}
                ${editorSideBtn('edit', SVG_TS.editE, 'Монтаж')}
                ${editorSideBtn('wm', SVG_TS.wmE, 'Водяной знак')}
                ${editorSideBtn('subs', SVG_TS.subsE, 'Субтитры')}
                ${editorSideBtn('dl', SVG_TS.dlE, 'Скачать')}
            </div>
            <div class="ts-editor-bottom">
                <button class="ts-editor-btn delete" id="ts-editor-delete">Удалить</button>
                <button class="ts-editor-btn continue" id="ts-editor-continue">Продолжить</button>
            </div>
        </div>
    `

    const vid = root.querySelector('#ts-editor-video')
    const url = URL.createObjectURL(blob)
    vid.src = url
    vid.dataset.objectUrl = url

    // ═══════════════════════════════════════════════════════════
    // ⚡ ВИДЕО: полный экран + автоплей со звуком
    // ═══════════════════════════════════════════════════════════
    vid.addEventListener('loadedmetadata', () => {
        const vw = vid.videoWidth, vh = vid.videoHeight;
        if(!vw || !vh) return;
        // Всегда cover как на 1 этапе (кроп как в TikTok)
        vid.style.objectFit = 'cover';
        vid.style.objectPosition = 'center center';
    }, { once: true })

    // muted autoplay → потом снимаем mute (обход автоплей-политики)
    vid.muted = true
    const playPromise = vid.play()
    if(playPromise && playPromise.then){
        playPromise.then(() => {
            setTimeout(() => { vid.muted = false }, 60)
        }).catch(() => {
            // Автоплей заблокирован — ждём тапа
            const overlay = document.createElement('div')
            overlay.className = 'ts-editor-tap-overlay'
            overlay.innerHTML = '<div class="ts-editor-tap-btn">▶</div>'
            overlay.addEventListener('click', () => {
                vid.muted = false
                vid.play().catch(()=>{})
                overlay.remove()
            })
            root.appendChild(overlay)
        })
    }

    // ═══════════════════════════════════════════════════════════
    // ⚡ ТАП по видео → пауза/плей
    // ═══════════════════════════════════════════════════════════
    vid.addEventListener('click', e => {
        // Игнорируем если клик по overlay-элементу
        if(e.target.closest('.ts-overlay-text, .ts-overlay-sticker')) return
        if(vid.paused){ vid.play().catch(()=>{}) }
        else { vid.pause() }
    })

    // ═══════════════════════════════════════════════════════════
    // ⚡ ВОССТАНАВЛИВАЕМ РАНЕЕ ДОБАВЛЕННЫЕ OVERLAYS
    // ═══════════════════════════════════════════════════════════
    const layer = root.querySelector('#ts-overlays-layer')
    TS.overlays.forEach(ov => {
        if(ov.type === 'text') renderTextOverlay(layer, ov)
        else if(ov.type === 'sticker') renderStickerOverlay(layer, ov)
    })

    if(TS.selectedEffect === 'warm')    vid.classList.add('filter-warm')
    if(TS.selectedEffect === 'cool')    vid.classList.add('filter-cool')
    if(TS.selectedEffect === 'vintage') vid.classList.add('filter-vintage')

    root.querySelectorAll('.ts-editor-side-btn').forEach(b => {
        b.addEventListener('click', () => handleEditorAction(b.dataset.k))
    })
    root.querySelector('#ts-editor-delete').addEventListener('click', () => {
        if(!confirm('Удалить видео?')) return
        try { TS.audio?.pause() } catch {}
        TS.overlays = []
        closeTreadStudio()
    })
    root.querySelector('#ts-editor-continue').addEventListener('click', () => {
        try { vid.pause() } catch {}
        openPublishScreen()
    })
}

function editorSideBtn(key, icon, label, avatar){
    const ava = avatar
        ? `<span class="ts-avatar-mini"><img src="${avatar}" alt=""></span>`
        : ''
    return `<button class="ts-editor-side-btn" data-k="${key}" title="${label}">
        ${icon}${ava}
    </button>`
}

async function handleEditorAction(key){
    switch(key){
        case 'sound':
            if(TS.selectedTrack) showToastLocal('Трек: ' + TS.selectedTrack.name, 'info')
            else showToastLocal('Трек не выбран', 'info')
            return
        case 'filter':
            openEditorFilterModal()
            return
        case 'text':
            openTextModal()
            return
        case 'sticker':
            await openStickerPickerForEditor()
            return
        case 'edit':
            showToastLocal('Монтаж — в разработке', 'info')
            return
        case 'wm':
            showToastLocal('Водяной знак — в разработке', 'info')
            return
        case 'subs':
            showToastLocal('Субтитры — в разработке', 'info')
            return
        case 'dl':
            downloadVideo()
            return
    }
}
async function openStickerPickerForEditor(){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user){ showToastLocal('Войдите в аккаунт', 'error'); return }

    const [ownRes, savedRes, pubRes] = await Promise.all([
        supabase.from('sticker_packs').select('*').eq('user_id', user.id).order('created_at', { ascending:false }),
        supabase.from('sticker_pack_saves').select('pack_id, sticker_packs(*)').eq('user_id', user.id),
        supabase.from('sticker_packs').select('*').eq('is_public', true).neq('user_id', user.id).limit(50)
    ])

    const myPacks = ownRes.data || []
    const savedPacks = (savedRes.data || []).map(s => s.sticker_packs).filter(Boolean)
    const ownIds = new Set(myPacks.map(p => p.id))
    const savedIds = new Set(savedPacks.map(p => p.id))
    const allPublic = (pubRes.data || []).filter(p => !ownIds.has(p.id) && !savedIds.has(p.id))
    const shuffled = [...allPublic].sort(() => Math.random() - 0.5)

    const modal = document.createElement('div')
    modal.className = 'sticker-picker-modal'
    modal.innerHTML = `
        <div class="sticker-picker-backdrop"></div>
        <div class="sticker-picker-sheet">
            <div class="lang-sheet-handle"></div>
            <div class="sticker-picker-tabs">
                <button class="sticker-picker-tab active" data-tab="personal">Личные · ${myPacks.length}</button>
                <button class="sticker-picker-tab" data-tab="saved">Сохранённые · ${savedPacks.length}</button>
                <button class="sticker-picker-tab" data-tab="find">Найти</button>
            </div>
            <div class="sticker-picker-packs" id="sp-packs"></div>
            <div class="sticker-picker-grid" id="sp-grid"></div>
        </div>`
    document.body.appendChild(modal)

    let currentTab = 'personal'
    let currentPack = null

    const close = () => modal.remove()
    modal.querySelector('.sticker-picker-backdrop').onclick = close

    function getPacksForTab(){
        if(currentTab === 'personal') return myPacks
        if(currentTab === 'saved') return savedPacks
        return shuffled
    }

    function render(){
        const packs = getPacksForTab()
        if(!currentPack || !packs.find(p => p.id === currentPack.id)) currentPack = packs[0] || null

        const packsBox = modal.querySelector('#sp-packs')
        packsBox.innerHTML = packs.map(p => {
            const cover = p.stickers?.[0]
            return `<button class="sp-pack ${currentPack?.id === p.id ? 'active' : ''}" data-pid="${p.id}">${cover ? `<img src="${cover}">` : '?'}</button>`
        }).join('')
        packsBox.querySelectorAll('.sp-pack').forEach(b => b.onclick = () => {
            currentPack = packs.find(p => p.id === b.dataset.pid)
            render()
        })

        const grid = modal.querySelector('#sp-grid')
        if(!currentPack || !currentPack.stickers?.length){
            grid.innerHTML = '<p class="empty small" style="grid-column:1/-1;padding:20px;text-align:center;color:var(--text-tertiary)">Нет стикеров</p>'
            return
        }
        grid.innerHTML = currentPack.stickers.map(s =>
            `<button class="sp-sticker" data-url="${s}"><img src="${s}" alt=""></button>`
        ).join('')
        grid.querySelectorAll('.sp-sticker').forEach(b => {
            b.addEventListener('click', () => {
                const url = b.dataset.url
                const ov = { type:'sticker', content: url, x: 0.5, y: 0.6, scale: 1 }
                TS.overlays.push(ov)
                const layer = document.getElementById('ts-overlays-layer')
                if(layer) renderStickerOverlay(layer, ov)
                close()
            })
        })
    }

    modal.querySelectorAll('.sticker-picker-tab').forEach(t => t.onclick = () => {
        currentTab = t.dataset.tab
        modal.querySelectorAll('.sticker-picker-tab').forEach(x => x.classList.toggle('active', x === t))
        render()
    })

    render()
}
function openEditorFilterModal(){
    document.getElementById('ts-mini-filter')?.remove()
    const m = document.createElement('div')
    m.id = 'ts-mini-filter'
    m.className = 'ts-sheet-modal'
    m.innerHTML = `
        <div class="ts-sheet-backdrop"></div>
        <div class="ts-sheet-body">
            <div class="ts-sheet-handle"></div>
            <div class="ts-sheet-title">Фильтры</div>
            <div class="ts-effects-grid">
                ${renderEditorFilterCard('none', 'Оригинал')}
                ${renderEditorFilterCard('warm', 'Тёплый')}
                ${renderEditorFilterCard('cool', 'Холодный')}
                ${renderEditorFilterCard('vintage', 'Винтаж')}
            </div>
        </div>
    `
    document.body.appendChild(m)
    m.addEventListener('click', e => {
        const card = e.target.closest('.ts-effect-card')
        if(card){
            const k = card.dataset.e
            TS.selectedEffect = k
            const vid = document.getElementById('ts-editor-video')
            if(vid){
                vid.classList.remove('filter-warm','filter-cool','filter-vintage')
                if(k === 'warm')    vid.classList.add('filter-warm')
                if(k === 'cool')    vid.classList.add('filter-cool')
                if(k === 'vintage') vid.classList.add('filter-vintage')
            }
            m.remove()
        } else if(e.target.closest('.ts-sheet-backdrop')) m.remove()
    })
}

function renderEditorFilterCard(key, label){
    const a = TS.selectedEffect === key ? 'active' : ''
    return `<button class="ts-effect-card ${a}" data-e="${key}">
        <span class="ts-effect-card-icon" style="background:linear-gradient(135deg,#ff9f0a,#ff375f)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12s1.5-2 4-2 4 2 4 2"/></svg>
        </span>
        <span class="ts-effect-card-label">${label}</span>
    </button>`
}

function openTextModal(){
    document.getElementById('ts-mini-text')?.remove()
    const m = document.createElement('div')
    m.id = 'ts-mini-text'
    m.className = 'ts-text-editor-modal'
    m.innerHTML = `
        <div class="ts-text-editor">
            <div class="ts-text-editor-preview" id="ts-text-preview">
                <span id="ts-text-preview-span"></span>
            </div>
            <textarea class="ts-text-editor-input" id="ts-text-input"
                placeholder="Ваш текст..." maxlength="30" rows="2"></textarea>
            <div class="ts-text-editor-counter"><span id="ts-text-counter">0</span>/30</div>
            <div class="ts-text-editor-row">
                <label>Шрифт:</label>
                <select id="ts-text-font">
                    <option value="-apple-system, sans-serif">Системный</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', serif">Times</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Impact, sans-serif">Impact</option>
                    <option value="'Comic Sans MS', cursive">Comic</option>
                </select>
            </div>
            <div class="ts-text-editor-row">
                <label>Стиль:</label>
                <div class="ts-text-editor-toggles">
                    <button type="button" data-style="bold"><b>Ж</b></button>
                    <button type="button" data-style="italic"><i>К</i></button>
                    <button type="button" data-style="strike"><s>З</s></button>
                </div>
            </div>
            <div class="ts-text-editor-row">
                <label>Цвет текста:</label>
                <input type="color" id="ts-text-color" value="#ffffff">
            </div>
            <div class="ts-text-editor-row">
                <label>Обводка:</label>
                <input type="color" id="ts-text-stroke" value="#000000">
                <label style="margin-left:12px">Толщина:</label>
                <input type="range" id="ts-text-stroke-w" min="0" max="6" value="2" style="flex:1">
            </div>
            <div class="ts-text-editor-row">
                <label>Фон:</label>
                <input type="color" id="ts-text-bg" value="#000000">
                <button type="button" id="ts-text-bg-none" style="margin-left:6px">✕ Убрать</button>
            </div>
            <div class="ts-text-editor-actions">
                <button class="ts-mini-btn cancel" id="ts-text-cancel">Отмена</button>
                <button class="ts-mini-btn confirm" id="ts-text-ok">Добавить</button>
            </div>
        </div>
    `
    document.body.appendChild(m)

    const input = m.querySelector('#ts-text-input')
    const preview = m.querySelector('#ts-text-preview-span')
    const counter = m.querySelector('#ts-text-counter')

    const state = {
        font: '-apple-system, sans-serif',
        bold: false, italic: false, strike: false,
        color: '#ffffff', stroke: '#000000', strokeW: 2,
        bg: null,
        text: ''
    }

    const applyPreview = () => {
        preview.textContent = state.text || 'Текст'
        preview.style.fontFamily = state.font
        preview.style.fontWeight = state.bold ? '900' : '500'
        preview.style.fontStyle = state.italic ? 'italic' : 'normal'
        preview.style.textDecoration = state.strike ? 'line-through' : 'none'
        preview.style.color = state.color
        preview.style.webkitTextStroke = state.strokeW > 0 ? `${state.strokeW}px ${state.stroke}` : 'none'
        preview.style.background = state.bg || 'transparent'
        preview.style.padding = state.bg ? '4px 10px' : '0'
        preview.style.borderRadius = state.bg ? '6px' : '0'
        counter.textContent = state.text.length
    }
    applyPreview()

    input.addEventListener('input', () => { state.text = input.value; applyPreview() })
    m.querySelector('#ts-text-font').addEventListener('change', e => { state.font = e.target.value; applyPreview() })
    m.querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.style
        state[k] = !state[k]
        b.classList.toggle('active', state[k])
        applyPreview()
    }))
    m.querySelector('#ts-text-color').addEventListener('input', e => { state.color = e.target.value; applyPreview() })
    m.querySelector('#ts-text-stroke').addEventListener('input', e => { state.stroke = e.target.value; applyPreview() })
    m.querySelector('#ts-text-stroke-w').addEventListener('input', e => { state.strokeW = +e.target.value; applyPreview() })
    m.querySelector('#ts-text-bg').addEventListener('input', e => { state.bg = e.target.value; applyPreview() })
    m.querySelector('#ts-text-bg-none').addEventListener('click', () => { state.bg = null; applyPreview() })

    m.querySelector('#ts-text-cancel').onclick = () => m.remove()
    m.querySelector('#ts-text-ok').onclick = () => {
        if(!state.text.trim()){ m.remove(); return }
        const ov = {
            type: 'text',
            content: state.text.trim(),
            x: 0.5, y: 0.4,   // проценты от 0 до 1
            scale: 1,
            font: state.font,
            bold: state.bold, italic: state.italic, strike: state.strike,
            color: state.color,
            stroke: state.stroke, strokeW: state.strokeW,
            bg: state.bg
        }
        TS.overlays.push(ov)
        const layer = document.getElementById('ts-overlays-layer')
        if(layer) renderTextOverlay(layer, ov)
        m.remove()
    }
    setTimeout(() => input.focus(), 100)
}

function renderTextOverlay(layer, ov){
    const el = document.createElement('div')
    el.className = 'ts-overlay-text'
    el.style.left = (ov.x * 100) + '%'
    el.style.top  = (ov.y * 100) + '%'
    el.style.transform = `translate(-50%,-50%) scale(${ov.scale || 1})`
    el.style.fontFamily = ov.font
    el.style.fontSize = '28px'
    el.style.fontWeight = ov.bold ? '900' : '500'
    el.style.fontStyle = ov.italic ? 'italic' : 'normal'
    el.style.textDecoration = ov.strike ? 'line-through' : 'none'
    el.style.color = ov.color
    el.style.webkitTextStroke = ov.strokeW > 0 ? `${ov.strokeW}px ${ov.stroke}` : 'none'
    el.style.background = ov.bg || 'transparent'
    el.style.padding = ov.bg ? '4px 10px' : '0'
    el.style.borderRadius = ov.bg ? '6px' : '0'
    el.style.pointerEvents = 'auto'
    el.textContent = ov.content
    el._ov = ov
    attachOverlayGestures(el, ov)
    layer.appendChild(el)
}

function renderStickerOverlay(layer, ov){
    const el = document.createElement('img')
    el.className = 'ts-overlay-sticker'
    el.src = ov.content
    el.style.left = (ov.x * 100) + '%'
    el.style.top  = (ov.y * 100) + '%'
    el.style.transform = `translate(-50%,-50%) scale(${ov.scale || 1})`
    el.style.pointerEvents = 'auto'
    el._ov = ov
    attachOverlayGestures(el, ov)
    layer.appendChild(el)
}

/* Общий drag + pinch-to-zoom для оверлеев */
function attachOverlayGestures(el, ov){
    let dragging = false
    let sx = 0, sy = 0, ox = 0, oy = 0
    let pinchDist = 0
    let pinchScale = 1

    const parentRect = () => el.closest('.ts-editor')?.getBoundingClientRect() ||
        { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }

    el.addEventListener('pointerdown', e => {
        if(e.pointerType === 'touch' && e.touches && e.touches.length === 2) return
        e.stopPropagation()
        dragging = true
        sx = e.clientX; sy = e.clientY
        const r = el.getBoundingClientRect()
        ox = r.left; oy = r.top
        el.classList.add('dragging')
    })
    el.addEventListener('pointermove', e => {
        if(!dragging) return
        const pr = parentRect()
        const nx = ox + (e.clientX - sx)
        const ny = oy + (e.clientY - sy)
        ov.x = Math.max(0.05, Math.min(0.95, (nx + el.offsetWidth/2 - pr.left) / pr.width))
        ov.y = Math.max(0.05, Math.min(0.95, (ny + el.offsetHeight/2 - pr.top) / pr.height))
        el.style.left = (ov.x * 100) + '%'
        el.style.top  = (ov.y * 100) + '%'
        el.style.transform = `translate(-50%,-50%) scale(${ov.scale || 1})`
    })
    el.addEventListener('pointerup', () => {
        dragging = false
        el.classList.remove('dragging')
    })

    // Pinch-to-zoom (2 пальца)
    el.addEventListener('touchstart', e => {
        if(e.touches.length === 2){
            e.preventDefault()
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            pinchDist = Math.hypot(dx, dy)
            pinchScale = ov.scale || 1
        }
    }, { passive: false })

    el.addEventListener('touchmove', e => {
        if(e.touches.length === 2 && pinchDist > 0){
            e.preventDefault()
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            const dist = Math.hypot(dx, dy)
            ov.scale = Math.max(0.3, Math.min(5, pinchScale * (dist / pinchDist)))
            el.style.transform = `translate(-50%,-50%) scale(${ov.scale})`
        }
    }, { passive: false })

    el.addEventListener('touchend', e => {
        if(e.touches.length < 2) pinchDist = 0
    })
}







function downloadVideo(){
    if(!TS.recordedBlob) return
    const url = URL.createObjectURL(TS.recordedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'listatread-tread-' + Date.now() + '.webm'
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showToastLocal('Видео сохранено', 'success')
}

/* ============================================================
   ПУБЛИКАЦИЯ
============================================================ */
async function openPublishScreen(){
    TS.activeTab = 'publish'

    const ed = document.getElementById('ts-editor')
    const ev = ed?.querySelector('#ts-editor-video')
    try { ev?.pause() } catch {}
    try { TS.audio?.pause() } catch {}

    const root = TS.root

    // ⚡ Восстанавливаем сохранённое состояние при возврате со 2 этапа
    if(!TS._pubLabels) TS._pubLabels = new Set()
    let pubAudience = TS._pubAudience ? TS._pubAudience() : null

    root.innerHTML = `
        <div class="ts-publish" id="ts-publish">
            <div class="ts-publish-top">
                <button class="ts-publish-back" id="ts-pub-back">${SVG_TS.back}</button>
                <div class="ts-publish-title">Публикация</div>
                <button class="ts-publish-btn" id="ts-pub-btn">Опубликовать</button>
            </div>
            <div class="ts-publish-body">
                <div class="ts-publish-row">
                    <div class="ts-publish-prev" id="ts-pub-prev">
                        <video id="ts-pub-video" playsinline autoplay loop muted></video>
                    </div>
                    <div class="ts-publish-desc">
                        <textarea id="ts-pub-desc" placeholder="Добавьте описание..." maxlength="500">${escapeHtml(TS._pubDesc || '')}</textarea>
                    </div>
                </div>
                <button class="ts-publish-setting" id="ts-pub-channel">
                    <span class="ts-publish-setting-left">
                        <span class="ts-publish-setting-ava" id="ts-pub-ch-ava">
                            ${TS.selectedChannel?.avatar_url ? `<img src="${TS.selectedChannel.avatar_url}">` : '?'}
                        </span>
                        <span class="ts-publish-setting-name" id="ts-pub-ch-name">
                            Выложить в канал · ${TS.selectedChannel?.name || ''}
                        </span>
                    </span>
                    <span class="ts-publish-setting-chev">›</span>
                </button>
                <button class="ts-publish-setting" id="ts-pub-dl">
                    <span>Скачать видео в галерею</span>
                    <span class="ts-publish-setting-chev">›</span>
                </button>
                <button class="ts-publish-setting" id="ts-pub-draft">
                    <span>Сохранить как черновик</span>
                    <span class="ts-publish-setting-chev">›</span>
                </button>

                <!-- ═══ ПОМЕТИТЬ КОНТЕНТ КАК ═══ -->
                <div class="ts-publish-section">
                    <div class="ts-publish-section-title">Пометить контент как</div>
                    <div class="ts-publish-labels">
                        <button class="ts-label-btn" data-label="ad">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                            <span>Реклама</span>
                            <span class="ts-label-chev">›</span>
                        </button>
                        <button class="ts-label-btn" data-label="sponsored">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                            <span>Спонсировано брендом</span>
                            <span class="ts-label-chev">›</span>
                        </button>
                        <button class="ts-label-btn" data-label="ai">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/></svg>
                            <span>Сгенерировано AI</span>
                            <span class="ts-label-chev">›</span>
                        </button>
                    </div>
                </div>

                <!-- ═══ ДОСТУП И ВЫБОР АУДИТОРИИ ═══ -->
                <div class="ts-publish-section">
                    <div class="ts-publish-section-title">Доступ и выбор аудитории</div>
                    <div class="ts-publish-audience-hint">Этот контент подойдёт для возрастной категории:</div>
                    <div class="ts-publish-audience">
                        <button class="ts-aud-btn" data-age="13-18">13–18</button>
                        <button class="ts-aud-btn" data-age="19-29">19–29</button>
                        <button class="ts-aud-btn" data-age="30-45">30–45</button>
                        <button class="ts-aud-btn" data-age="45-65">45–65</button>
                        <button class="ts-aud-btn" data-age="65+">65+</button>
                    </div>
                    <p class="ts-publish-warning">
                        Выбор неверной аудитории является нарушением правил сообщества. Если ваш контент подходит для всех — не выбирайте аудиторию. Учтите, что выбор подходящей аудитории может хорошо сказаться на охватах: мы рекомендуем контент исходя из многих факторов, в том числе возраст. Например, если ваш контент подходит для 13–18 лет, а его посмотрел человек категории 45–65 и ему не понравилось, и он пролистнул или поставил отметку «не нравится» — это снизит коэффициент удержания, вследствие чего ваши видео будут реже показываться в рекомендациях до достижения удовлетворительного коэффициента удержания. Подробнее читайте <a href="https://listatread.online/tips" target="_blank">«основы основ ведения блога»</a>.
                    </p>
                </div>
            </div>
        </div>
    `

    // ═══════════════════════════════════════════════════════════
    // ⚡ ВИДЕО-ПРЕВЬЮ
    // ═══════════════════════════════════════════════════════════
    const pv = root.querySelector('#ts-pub-video')
    if(pv && TS.recordedBlob){
        try {
            pv.src = URL.createObjectURL(TS.recordedBlob)
            pv.addEventListener('loadedmetadata', () => {
                pv.style.objectFit = 'cover'
            }, { once: true })
            pv.play().catch(()=>{})
        } catch(e){ console.warn('[pub preview]', e) }
    }

    // ═══════════════════════════════════════════════════════════
    // ⚡ КНОПКА НАЗАД — возврат на 2 этап (редактор)
    // ═══════════════════════════════════════════════════════════
    root.querySelector('#ts-pub-back').addEventListener('click', () => {
        const descEl = root.querySelector('#ts-pub-desc')
        if(descEl) TS._pubDesc = descEl.value
        try { pv?.pause() } catch {}
        openEditor(TS.recordedBlob)
    })

    // ═══════════════════════════════════════════════════════════
    // ⚡ КНОПКА ОПУБЛИКОВАТЬ
    // ═══════════════════════════════════════════════════════════
    root.querySelector('#ts-pub-btn').addEventListener('click', publishVideo)

    // ═══════════════════════════════════════════════════════════
    // ⚡ ОСТАЛЬНЫЕ КНОПКИ
    // ═══════════════════════════════════════════════════════════
    root.querySelector('#ts-pub-channel').addEventListener('click', openChannelPickerForPublish)
    root.querySelector('#ts-pub-dl').addEventListener('click', () => { downloadVideo() })
    root.querySelector('#ts-pub-draft').addEventListener('click', () => {
        showToastLocal('Черновик — скоро', 'info')
    })

    // ═══════════════════════════════════════════════════════════
    // ⚡ МЕТКИ КОНТЕНТА
    // ═══════════════════════════════════════════════════════════
    const labelBtns = root.querySelectorAll('.ts-label-btn')
    labelBtns.forEach(btn => {
        if(TS._pubLabels.has(btn.dataset.label)) btn.classList.add('active')
        btn.addEventListener('click', () => {
            const k = btn.dataset.label
            if(TS._pubLabels.has(k)){ TS._pubLabels.delete(k); btn.classList.remove('active') }
            else { TS._pubLabels.add(k); btn.classList.add('active') }
        })
    })

    // ═══════════════════════════════════════════════════════════
    // ⚡ АУДИТОРИЯ
    // ═══════════════════════════════════════════════════════════
    const audBtns = root.querySelectorAll('.ts-aud-btn')
    audBtns.forEach(btn => {
        if(btn.dataset.age === pubAudience) btn.classList.add('active')
        btn.addEventListener('click', () => {
            const k = btn.dataset.age
            if(pubAudience === k){ pubAudience = null; btn.classList.remove('active') }
            else {
                pubAudience = k
                audBtns.forEach(b => b.classList.toggle('active', b === btn))
            }
        })
    })

    TS._pubAudience = () => pubAudience
}

async function openChannelPickerForPublish(){
    await openChannelPicker()
    const obs = setInterval(() => {
        if(!document.getElementById('ts-channel-sheet')){
            clearInterval(obs)
            const nameEl = document.getElementById('ts-pub-ch-name')
            const avaEl  = document.getElementById('ts-pub-ch-ava')
            if(nameEl && TS.selectedChannel) nameEl.textContent = 'Выложить в канал · ' + TS.selectedChannel.name
            if(avaEl && TS.selectedChannel) avaEl.innerHTML = TS.selectedChannel.avatar_url
                ? `<img src="${TS.selectedChannel.avatar_url}">` : '?'
        }
    }, 120)
}

async function publishVideo(){
    if(!TS.recordedBlob || !TS.selectedChannel){
        showToastLocal('Нет видео или канала', 'error')
        return
    }
    const desc = document.getElementById('ts-pub-desc')?.value.trim() || ''
    const publishBtn = document.getElementById('ts-pub-btn')
    if(publishBtn){ publishBtn.disabled = true; publishBtn.textContent = 'Публикуем…' }

    const overlay = document.createElement('div')
    overlay.className = 'ts-publish-overlay'
    overlay.innerHTML = `
        <div class="ts-pub-spinner" id="ts-pub-spin"></div>
        <div class="ts-pub-success" id="ts-pub-success">
            <div class="ts-pub-success-circle">${SVG_TS.check}</div>
            <div class="ts-pub-success-text">Готово</div>
        </div>
        <div class="ts-pub-progress-wrap">
            <div class="ts-pub-pct" id="ts-pub-pct">0%</div>
            <div class="ts-pub-bar"><div class="ts-pub-bar-fill" id="ts-pub-bar"></div></div>
            <div class="ts-pub-status" id="ts-pub-status">обработка...</div>
        </div>
    `
    document.body.appendChild(overlay)
    const barEl = overlay.querySelector('#ts-pub-bar')
    const pctEl = overlay.querySelector('#ts-pub-pct')
    const statusEl = overlay.querySelector('#ts-pub-status')

    // ⚡ Плавный «фейк-прогресс» до 90% (Supabase v2 не даёт onUploadProgress)
    let fakePct = 0
    const fakeInt = setInterval(() => {
        if(fakePct < 90){
            fakePct = Math.min(90, fakePct + Math.random() * 6)
            barEl.style.width = fakePct + '%'
            pctEl.textContent = Math.round(fakePct) + '%'
        }
    }, 180)

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) throw new Error('Не авторизован')

        // 1. Запекаем оверлеи в видео (если есть)
        let finalBlob = TS.recordedBlob
        if(TS.overlays.length){
            statusEl.textContent = 'накладываем текст и стикеры...'
            finalBlob = await bakeOverlays(TS.recordedBlob, TS.overlays)
        }

        statusEl.textContent = 'загрузка...'

        // 2. Загружаем
        const path = `${user.id}/tread-${Date.now()}.webm`
        const { error: upErr } = await supabase.storage
            .from('posts')
            .upload(path, finalBlob, { contentType: 'video/webm' })
        if(upErr) throw upErr

        const { data:pub } = supabase.storage.from('posts').getPublicUrl(path)
        const mediaUrl = pub.publicUrl

        // 3. Вставляем пост
        const labels = TS._pubLabels ? [...TS._pubLabels] : []
        const audience = TS._pubAudience ? TS._pubAudience() : null
        const track = TS.selectedTrack

        const payload = {
            author_id: user.id,
            channel_id: TS.selectedChannel.id,
            content: desc,
            media_url: mediaUrl
        }
        if(track?.name) payload.media_title = track.name
        if(labels.length) payload.content_labels = labels
        if(audience) payload.target_audience = audience

        const { data: post, error } = await supabase.from('posts').insert(payload).select().single()
        if(error) throw error

        clearInterval(fakeInt)
        barEl.style.width = '100%'
        pctEl.textContent = '100%'
        statusEl.textContent = 'готово'

        setTimeout(() => {
            overlay.querySelector('#ts-pub-spin')?.remove()
            overlay.querySelector('.ts-pub-progress-wrap')?.remove()
            overlay.querySelector('#ts-pub-success')?.classList.add('show')

            setTimeout(() => {
                overlay.remove()
                TS.overlays = []
                TS._pubLabels = new Set()
                TS._pubAudience = null
                closeTreadStudio()
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('lt:goProfilePosts', { detail: { postId: post.id } }))
                }, 200)
            }, 1400)
        }, 200)
    } catch(e){
        clearInterval(fakeInt)
        overlay.remove()
        if(publishBtn){ publishBtn.disabled = false; publishBtn.textContent = 'Опубликовать' }
        showToastLocal('Ошибка: ' + (e.message || ''), 'error')
    }
}

/* ══════════════════════════════════════════════════════════════
   БЭЙКИНГ ОВЕРЛЕЕВ — рендерит видео+текст+стикеры в один blob
══════════════════════════════════════════════════════════════ */
async function bakeOverlays(sourceBlob, overlays){
    // ═══════════════════════════════════════════════════════════
    // 1. Видео — добавляем в DOM, чтобы браузер точно декодировал
    // ═══════════════════════════════════════════════════════════
    const video = document.createElement('video')
    video.src = URL.createObjectURL(sourceBlob)
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'opacity:0;pointer-events:none;z-index:-9999'
    document.body.appendChild(video)

    await new Promise((resolve, reject) => {
        const onMeta = () => { video.removeEventListener('error', onErr); resolve() }
        const onErr  = () => { video.removeEventListener('loadedmetadata', onMeta); reject(new Error('video load failed')) }
        video.addEventListener('loadedmetadata', onMeta, { once: true })
        video.addEventListener('error', onErr, { once: true })
    })

    if(!video.videoWidth || !video.videoHeight){
        try { video.remove() } catch {}
        throw new Error('Не удалось прочитать видео — пустой файл или неподдерживаемый кодек')
    }

    const W = video.videoWidth
    const H = video.videoHeight
    const videoDuration = isFinite(video.duration) && video.duration > 0 ? video.duration : 30

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // ═══════════════════════════════════════════════════════════
    // 2. Аудио — через MediaElementSource + компрессор + silent monitor
    //    (monitor нужен, чтобы граф не «засыпал» в некоторых браузерах)
    // ═══════════════════════════════════════════════════════════
    let audioCtx = null
    let srcNode = null
    let dest = null

    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 })
        if(audioCtx.state === 'suspended') await audioCtx.resume()
        srcNode = audioCtx.createMediaElementSource(video)
        dest = audioCtx.createMediaStreamDestination()

        const compressor = audioCtx.createDynamicsCompressor()
        compressor.threshold.value = -12
        compressor.knee.value = 12
        compressor.ratio.value = 4
        compressor.attack.value = 0.003
        compressor.release.value = 0.25

        // Компрессор → запись
        srcNode.connect(compressor).connect(dest)

        // Компрессор → динамик через gain=0 (граф активен, звука нет)
        const silentMonitor = audioCtx.createGain()
        silentMonitor.gain.value = 0
        compressor.connect(silentMonitor).connect(audioCtx.destination)
    } catch(e){
        console.warn('[bake audio]', e)
        audioCtx = null
    }

    // ═══════════════════════════════════════════════════════════
    // 3. Предзагрузка стикеров
    // ═══════════════════════════════════════════════════════════
    const stickerImgs = {}
    for(const ov of overlays){
        if(ov.type === 'sticker' && ov.content){
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = ov.content
            await new Promise(r => { img.onload = r; img.onerror = r })
            stickerImgs[ov.content] = img
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 4. Стримы
    // ═══════════════════════════════════════════════════════════
    const canvasStream = canvas.captureStream(30)
    const mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...(dest ? dest.stream.getAudioTracks() : [])
    ])

    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
            ? 'video/webm;codecs=vp8,opus'
            : 'video/webm'

    const recorder = new MediaRecorder(mixedStream, {
        mimeType: mime,
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
    })
    const chunks = []
    recorder.ondataavailable = e => { if(e.data.size) chunks.push(e.data) }
    const donePromise = new Promise(r => recorder.onstop = r)

    // ═══════════════════════════════════════════════════════════
    // 5. Флаги и остановка
    // ═══════════════════════════════════════════════════════════
    let drawingStopped = false
    let recorderStopped = false

    const stopAll = () => {
        if(recorderStopped) return
        recorderStopped = true
        setTimeout(() => {
            try { recorder.stop() } catch {}
            try { srcNode?.disconnect() } catch {}
            try { audioCtx?.close() } catch {}
        }, 150)
    }

    // ═══════════════════════════════════════════════════════════
    // 6. ⚡ ГЛАВНЫЙ ФИКС — рисуем СРАЗУ, а не по событию 'playing'
    //    drawFrame крутится в rAF с самого начала и рисует,
    //    как только готовы данные (readyState >= 2).
    // ═══════════════════════════════════════════════════════════
    const drawFrame = () => {
        if(drawingStopped) return
        ctx.clearRect(0, 0, W, H)
        if(video.readyState >= 2 && !video.ended){
            try { ctx.drawImage(video, 0, 0, W, H) } catch(_){}
            drawOverlaysOnCanvas(ctx, overlays, stickerImgs, W, H)
        }
        requestAnimationFrame(drawFrame)
    }

    // ═══════════════════════════════════════════════════════════
    // 7. `ended` — ДО play()
    // ═══════════════════════════════════════════════════════════
    video.addEventListener('ended', () => {
        drawingStopped = true
        stopAll()
    }, { once: true })

    // ═══════════════════════════════════════════════════════════
    // 8. Старт: сначала цикл рисования, потом запись, потом play
    // ═══════════════════════════════════════════════════════════
    drawFrame()
    recorder.start(120)

    // Safety-таймаут — если по какой-то причине `ended` не сработает
    const safetyTimer = setTimeout(() => {
        if(!recorderStopped){
            console.warn('[bake] safety timeout — force stop')
            drawingStopped = true
            stopAll()
        }
    }, (videoDuration + 5) * 1000)

    video.currentTime = 0
    try {
        await video.play()
    } catch(e){
        console.warn('[bake play]', e)
        try {
            video.muted = true
            await video.play()
        } catch(e2){ console.warn('[bake play retry]', e2) }
    }

    await donePromise
    clearTimeout(safetyTimer)

    // ═══════════════════════════════════════════════════════════
    // 9. Чистим
    // ═══════════════════════════════════════════════════════════
    try { video.pause() } catch {}
    try { URL.revokeObjectURL(video.src) } catch {}
    try { video.removeAttribute('src'); video.load() } catch {}
    try { video.remove() } catch {}

    const outBlob = new Blob(chunks, { type: 'video/webm' })
    if(!outBlob.size || outBlob.size < 1000){
        throw new Error('Запечённое видео пустое — попробуйте снова')
    }
    return outBlob
}

/* Рисование оверлеев — вынесено в отдельную функцию */
function drawOverlaysOnCanvas(ctx, overlays, stickerImgs, W, H){
    for(const ov of overlays){
        const sc = ov.scale || 1
        const cx = ov.x * W
        const cy = ov.y * H

        if(ov.type === 'text'){
            const baseFontSize = W * 0.055 * sc
            ctx.save()
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            let fontStyle = ''
            if(ov.italic) fontStyle += 'italic '
            fontStyle += ov.bold ? '900 ' : '500 '
            const fontFam = ov.font || '-apple-system, sans-serif'
            ctx.font = `${fontStyle}${Math.round(baseFontSize)}px ${fontFam}`

            const txt = ov.content || ''
            const m = ctx.measureText(txt)
            const tw = m.width
            const th = baseFontSize * 1.2

            if(ov.bg){
                ctx.fillStyle = ov.bg
                const pad = baseFontSize * 0.2
                const r = baseFontSize * 0.15
                roundRect(ctx, cx - tw/2 - pad, cy - th/2 - pad*0.5,
                    tw + pad*2, th + pad, r)
                ctx.fill()
            }

            if(ov.strokeW > 0){
                ctx.strokeStyle = ov.stroke
                ctx.lineWidth = ov.strokeW * sc * 2
                ctx.lineJoin = 'round'
                ctx.strokeText(txt, cx, cy)
            }

            ctx.fillStyle = ov.color || '#fff'
            ctx.fillText(txt, cx, cy)

            if(ov.strike){
                ctx.strokeStyle = ov.color || '#fff'
                ctx.lineWidth = baseFontSize * 0.06
                ctx.beginPath()
                ctx.moveTo(cx - tw/2, cy)
                ctx.lineTo(cx + tw/2, cy)
                ctx.stroke()
            }
            ctx.restore()
        } else if(ov.type === 'sticker'){
            const img = stickerImgs[ov.content]
            if(img && img.complete && img.naturalWidth){
                const sz = W * 0.22 * sc
                ctx.drawImage(img, cx - sz/2, cy - sz/2, sz, sz)
            }
        }
    }
}

function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath()
    ctx.moveTo(x+r, y)
    ctx.arcTo(x+w, y, x+w, y+h, r)
    ctx.arcTo(x+w, y+h, x, y+h, r)
    ctx.arcTo(x, y+h, x, y, r)
    ctx.arcTo(x, y, x+w, y, r)
    ctx.closePath()
}



/* ============================================================
   ХЕЛПЕРЫ
============================================================ */
function formatDur(sec){
    const s = Math.max(0, Math.floor(sec))
    const m = Math.floor(s / 60)
    const r = s % 60
    return m + ':' + String(r).padStart(2,'0')
}

function escapeHtml(t){
    const d = document.createElement('div')
    d.textContent = t ?? ''
    return d.innerHTML
}

function isAudioUrl(u){
    return /\.(mp3|wav|ogg|m4a|aac|flac|opus)(\?|$)/i.test(u||'')
}

function showToastLocal(msg, type = 'info', duration){
    if(typeof window.showToast === 'function'){
        window.showToast(type, msg, {
            icon: type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️',
            duration: duration || undefined
        })
    } else {
        console.log('[tstudio]', msg)
    }
}

