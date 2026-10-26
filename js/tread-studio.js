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
                ${renderSideBtnWithLabel('sticker', SVG_TS.sticker, 'Стикеры',  true)}
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

    root.querySelectorAll('.ts-side-btn[data-k="text"],.ts-side-btn[data-k="photo"],.ts-side-btn[data-k="track"],.ts-side-btn[data-k="album"],.ts-side-btn[data-k="poll"],.ts-side-btn[data-k="sticker"]')
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
    if(!TS.selectedChannel && ['text','photo','track','album','poll','sticker'].includes(key)){
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
}

/* ============================================================
   ЗАПИСЬ
============================================================ */
async function startRecording(){
    if(!TS.selectedChannel){ showToastLocal('Сначала выберите канал', 'info'); return }
    if(!TS.stream){ showToastLocal('Камера недоступна', 'error'); return }
    try {
        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm'
                : 'video/mp4'
        TS.recorder = new MediaRecorder(TS.stream, { mimeType: mime })
        TS.chunks = []
        TS.recorder.ondataavailable = e => { if(e.data?.size) TS.chunks.push(e.data) }
        TS.recorder.onstop = async () => {
            TS.recordedBlob = new Blob(TS.chunks, { type: 'video/webm' })
            TS.chunks = []
            try { TS.audio?.pause() } catch {}
            if(TS.timerInt){ clearInterval(TS.timerInt); TS.timerInt = null }
            if(TS.progressInt){ clearInterval(TS.progressInt); TS.progressInt = null }
            showRecordingUI(false)
            await openEditor(TS.recordedBlob)
        }
        TS.recorder.start(120)
        TS.recordStart = Date.now()
        showRecordingUI(true)
        startRecordTimer()
        playSelectedTrackIfAny()
    } catch(e){
        showToastLocal('Не удалось начать запись: ' + (e.message || ''), 'error')
    }
}

function stopRecording(){
    if(TS.recorder?.state === 'recording') TS.recorder.stop()
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

function playSelectedTrackIfAny(){
    if(!TS.selectedTrack?.src) return
    try {
        TS.audio = new Audio(TS.selectedTrack.src)
        TS.audio.currentTime = TS.selectedTrack.startAt || 0
        TS.audio.volume = 0.9
        TS.audio.play().catch(()=>{})
        setTimeout(() => { try { TS.audio?.pause() } catch {} }, TS.selectedTime * 1000 + 100)
    } catch(e){ console.warn('[track play]', e) }
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

/* ============================================================
   ВЫБОР ТРЕКА — 2 колонки
============================================================ */
async function openTrackPicker(){
    document.getElementById('ts-track-sheet')?.remove()
    TS._trackOffset = 0

    const sheet = document.createElement('div')
    sheet.id = 'ts-track-sheet'
    sheet.className = 'ts-sheet-modal'
    sheet.innerHTML = `
        <div class="ts-sheet-backdrop"></div>
        <div class="ts-sheet-body">
            <div class="ts-sheet-handle"></div>
            <div class="ts-sheet-title">Добавить трек</div>
            <div class="ts-track-grid" id="ts-track-grid"></div>
            <button class="ts-track-more" id="ts-track-more">Показать ещё</button>
        </div>`
    document.body.appendChild(sheet)

    sheet.addEventListener('click', e => {
        if(e.target.closest('.ts-sheet-backdrop')){ sheet.remove(); return }
        const card = e.target.closest('.ts-track-card')
        if(card){
            sheet.remove()
            openTrimPicker({
                id: card.dataset.id,
                name: card.dataset.name,
                author: card.dataset.author,
                cover: card.dataset.cover,
                src:   card.dataset.src,
                duration: parseFloat(card.dataset.dur) || 0
            })
            return
        }
        if(e.target.closest('#ts-track-more')) loadTracks(true)
    })

    loadTracks(false)
}

async function loadTracks(more){
    const grid = document.getElementById('ts-track-grid')
    const btn  = document.getElementById('ts-track-more')
    if(!grid) return
    if(more){
        if(!btn) return
        btn.disabled = true; btn.textContent = 'Загрузка…'
        TS._trackOffset += 5
    }

    const { data, error } = await supabase.from('posts')
        .select('id, content, media_url, media_title, created_at, author_id, profiles:author_id ( username, full_name, avatar_url )')
        .not('media_url', 'is', null)
        .order('created_at', { ascending: false })
        .range(TS._trackOffset, TS._trackOffset + (more ? 4 : 9))

    if(error){ console.warn('[tracks]', error.message) }

    const tracks = (data || []).filter(p => isAudioUrl(p.media_url))

    const html = tracks.map(p => {
        const prof = p.profiles || {}
        const name = p.media_title || p.content?.slice(0, 30) || 'Трек'
        const author = prof.full_name || prof.username || 'user'
        const cover = prof.avatar_url
            ? `<img src="${prof.avatar_url}" alt="">`
            : name.charAt(0).toUpperCase()
        return `<button class="ts-track-card"
            data-id="${p.id}"
            data-name="${escapeHtml(name)}"
            data-author="${escapeHtml(author)}"
            data-cover="${prof.avatar_url || ''}"
            data-src="${p.media_url}"
            data-dur="0">
            <span class="ts-track-card-ava">${cover}</span>
            <div class="ts-track-card-name">${escapeHtml(name)}</div>
            <div class="ts-track-card-author">@${escapeHtml((prof.username||'user').replace(/^@/,''))}</div>
            <div class="ts-track-card-dur">0:00</div>
        </button>`
    }).join('')

    if(more){ grid.insertAdjacentHTML('beforeend', html) }
    else    { grid.innerHTML = html }

    grid.querySelectorAll('.ts-track-card').forEach(card => {
        if(card.dataset.durLoaded === '1') return
        const src = card.dataset.src
        const a = document.createElement('audio')
        a.preload = 'metadata'; a.muted = true; a.src = src
        a.addEventListener('loadedmetadata', () => {
            const dur = a.duration || 0
            card.dataset.dur = dur
            const durEl = card.querySelector('.ts-track-card-dur')
            if(durEl) durEl.textContent = formatDur(Math.floor(dur))
            card.dataset.durLoaded = '1'
        })
    })

    if(btn){ btn.disabled = false; btn.textContent = 'Показать ещё' }
}

/* ============================================================
   ТРИМ-ПИКЕР
============================================================ */
function openTrimPicker(track){
    document.getElementById('ts-trim-sheet')?.remove()

    const totalDur = track.duration || 30
    const needDur  = TS.selectedTime
    const pctWidth = Math.min(100, needDur / totalDur * 100)
    let startAt = 0

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
            <button class="ts-trim-use" id="ts-trim-use">Использовать трек</button>
        </div>
    `
    document.body.appendChild(sheet)

    const wave = sheet.querySelector('#ts-trim-wave')
    const sel  = sheet.querySelector('#ts-trim-sel')
    const tStart = sheet.querySelector('#ts-trim-start')
    const tEnd   = sheet.querySelector('#ts-trim-end')

    let drag = false
    const setFromX = clientX => {
        const rect = wave.getBoundingClientRect()
        const pct  = Math.max(0, Math.min(1 - needDur / totalDur, (clientX - rect.left) / rect.width))
        startAt = pct * totalDur
        sel.style.left  = (pct * 100) + '%'
        sel.style.width = Math.min(100 - pct*100, pctWidth) + '%'
        tStart.textContent = formatDur(Math.floor(startAt))
        tEnd.textContent   = formatDur(Math.floor(startAt + needDur))
    }
    wave.addEventListener('pointerdown', e => { drag = true; setFromX(e.clientX); wave.setPointerCapture(e.pointerId) })
    wave.addEventListener('pointermove', e => { if(drag) setFromX(e.clientX) })
    wave.addEventListener('pointerup',   () => { drag = false })

    sheet.addEventListener('click', e => {
        if(e.target.closest('.ts-sheet-backdrop')){ sheet.remove(); return }
        if(e.target.closest('#ts-trim-use')){
            TS.selectedTrack = { ...track, startAt }
            sheet.remove()
            renderSelectedTrackStrip()
            showToastLocal('Трек выбран', 'success')
            return
        }
    })
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

    const hasTrack = !!TS.selectedTrack?.src

    const root = TS.root
    root.innerHTML = `
        <div class="ts-editor" id="ts-editor">
            <div class="ts-editor-video-wrap">
                <video class="ts-editor-video" id="ts-editor-video" playsinline ${hasTrack ? 'muted' : ''} autoplay loop></video>
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
    vid.play().catch(()=>{})

    if(TS.selectedEffect === 'warm')    vid.classList.add('filter-warm')
    if(TS.selectedEffect === 'cool')    vid.classList.add('filter-cool')
    if(TS.selectedEffect === 'vintage') vid.classList.add('filter-vintage')

    // ⚡ МУЗЫКА НА 2 ЭТАПЕ
    if(hasTrack){
        try {
            TS.audio?.pause()
            TS.audio = new Audio(TS.selectedTrack.src)
            TS.audio.currentTime = TS.selectedTrack.startAt || 0
            TS.audio.volume = 1
            TS.audio.loop = true
            TS.audio.play().catch(()=>{})
        } catch(e){ console.warn('[editor audio]', e) }
    }

    root.querySelectorAll('.ts-editor-side-btn').forEach(b => {
        b.addEventListener('click', () => handleEditorAction(b.dataset.k))
    })
    root.querySelector('#ts-editor-delete').addEventListener('click', () => {
        if(!confirm('Удалить видео?')) return
        try { TS.audio?.pause() } catch {}
        closeTreadStudio()
    })
    root.querySelector('#ts-editor-continue').addEventListener('click', () => {
        try { TS.audio?.pause() } catch {}
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
            openStickerEditorModal()
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
    m.className = 'ts-mini-modal'
    m.innerHTML = `
        <div class="ts-mini-sheet">
            <div class="ts-mini-title">Добавить текст</div>
            <textarea class="ts-mini-input" id="ts-text-input" placeholder="Ваш текст..." maxlength="120"></textarea>
            <div class="ts-mini-actions">
                <button class="ts-mini-btn cancel" id="ts-text-cancel">Отмена</button>
                <button class="ts-mini-btn confirm" id="ts-text-ok">Добавить</button>
            </div>
        </div>
    `
    document.body.appendChild(m)
    const input = m.querySelector('#ts-text-input')
    input.focus()
    m.querySelector('#ts-text-cancel').onclick = () => m.remove()
    m.querySelector('#ts-text-ok').onclick = () => {
        const text = input.value.trim()
        if(!text){ m.remove(); return }
        addTextOverlay(text)
        m.remove()
    }
}

function addTextOverlay(text){
    const layer = document.getElementById('ts-overlays-layer')
    if(!layer) return
    const el = document.createElement('div')
    el.className = 'ts-overlay-text'
    el.textContent = text
    el.style.left = '50%'
    el.style.top  = '40%'
    el.style.transform = 'translate(-50%,-50%)'
    el.style.pointerEvents = 'auto'
    makeDraggable(el)
    layer.appendChild(el)
    TS.overlays.push({ type:'text', content: text })
}

async function openStickerEditorModal(){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    const { data:packs } = await supabase.from('sticker_packs').select('stickers').eq('user_id', user.id)
    const stickers = []
    ;(packs || []).forEach(p => (p.stickers || []).forEach(s => stickers.push(s)))
    if(!stickers.length){ showToastLocal('Нет стикеров — создайте их в директе', 'info'); return }

    document.getElementById('ts-mini-sticker')?.remove()
    const m = document.createElement('div')
    m.id = 'ts-mini-sticker'
    m.className = 'ts-mini-modal'
    m.innerHTML = `
        <div class="ts-mini-sheet">
            <div class="ts-mini-title">Выберите стикер</div>
            <div class="ts-sticker-picker">
                ${stickers.map(s => `<button class="ts-sticker-pick" data-s="${escapeHtml(s)}"><img src="${escapeHtml(s)}" alt=""></button>`).join('')}
            </div>
        </div>
    `
    document.body.appendChild(m)
    m.addEventListener('click', e => {
        const btn = e.target.closest('.ts-sticker-pick')
        if(btn){
            addStickerOverlay(btn.dataset.s)
            m.remove()
        } else if(e.target === m) m.remove()
    })
}

function addStickerOverlay(url){
    const layer = document.getElementById('ts-overlays-layer')
    if(!layer) return
    const el = document.createElement('img')
    el.className = 'ts-overlay-sticker'
    el.src = url
    el.style.left = '50%'
    el.style.top  = '60%'
    el.style.transform = 'translate(-50%,-50%)'
    el.style.pointerEvents = 'auto'
    makeDraggable(el)
    layer.appendChild(el)
    TS.overlays.push({ type:'sticker', content: url })
}

function makeDraggable(el){
    let sx = 0, sy = 0, ox = 0, oy = 0, drag = false
    el.addEventListener('pointerdown', e => {
        e.stopPropagation()
        drag = true
        sx = e.clientX; sy = e.clientY
        const r = el.getBoundingClientRect()
        ox = r.left; oy = r.top
        el.classList.add('dragging')
        el.setPointerCapture(e.pointerId)
    })
    el.addEventListener('pointermove', e => {
        if(!drag) return
        const nx = ox + (e.clientX - sx)
        const ny = oy + (e.clientY - sy)
        el.style.left = nx + 'px'
        el.style.top  = ny + 'px'
        el.style.transform = 'none'
    })
    el.addEventListener('pointerup', () => {
        drag = false
        el.classList.remove('dragging')
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
                        <video id="ts-pub-video" playsinline muted autoplay loop></video>
                    </div>
                    <div class="ts-publish-desc">
                        <textarea id="ts-pub-desc" placeholder="Добавьте описание..." maxlength="500"></textarea>
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
            </div>
        </div>
    `

    const pv = root.querySelector('#ts-pub-video')
    if(TS.recordedBlob){
        pv.src = URL.createObjectURL(TS.recordedBlob)
        pv.play().catch(()=>{})
    }

    root.querySelector('#ts-pub-back').addEventListener('click', () => {
        openEditor(TS.recordedBlob)
    })
    root.querySelector('#ts-pub-btn').addEventListener('click', publishVideo)
    root.querySelector('#ts-pub-channel').addEventListener('click', openChannelPickerForPublish)
    root.querySelector('#ts-pub-dl').addEventListener('click', () => { downloadVideo() })
    root.querySelector('#ts-pub-draft').addEventListener('click', () => {
        showToastLocal('Черновик — скоро', 'info')
    })
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
            <div class="ts-pub-status" id="ts-pub-status">публикация...</div>
        </div>
    `
    document.body.appendChild(overlay)

    const barEl = overlay.querySelector('#ts-pub-bar')
    const pctEl = overlay.querySelector('#ts-pub-pct')

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) throw new Error('Не авторизован')

        const path = `${user.id}/tread-${Date.now()}.webm`
        const { error: upErr } = await supabase.storage
            .from('posts')
            .upload(path, TS.recordedBlob, {
                contentType: 'video/webm',
                onUploadProgress: (evt) => {
                    const real = Math.round((evt.loaded / evt.total) * 100)
                    barEl.style.width = real + '%'
                    pctEl.textContent = real + '%'
                }
            })
        if(upErr) throw upErr

        const { data:pub } = supabase.storage.from('posts').getPublicUrl(path)
        const mediaUrl = pub.publicUrl

        const { data:post, error } = await supabase.from('posts').insert({
            author_id: user.id,
            channel_id: TS.selectedChannel.id,
            content: desc,
            media_url: mediaUrl
        }).select().single()
        if(error) throw error

        barEl.style.width = '100%'
        pctEl.textContent = '100%'

        setTimeout(() => {
            overlay.querySelector('#ts-pub-spin')?.remove()
            overlay.querySelector('.ts-pub-progress-wrap')?.remove()
            overlay.querySelector('#ts-pub-success')?.classList.add('show')

            setTimeout(() => {
                overlay.remove()
                closeTreadStudio()
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('lt:goProfilePosts', { detail: { postId: post.id } }))
                }, 200)
            }, 1400)
        }, 200)
    } catch(e){
        overlay.remove()
        if(publishBtn){ publishBtn.disabled = false; publishBtn.textContent = 'Опубликовать' }
        showToastLocal('Ошибка: ' + (e.message || ''), 'error')
    }
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

