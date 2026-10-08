/* ============================================================
   listatread — admin.js (админ-панель, предупреждения, бан, жалобы)
============================================================ */
import { supabase } from './supabase.js'

export const ADMIN_STATE = {
    profile: null,
    isAdmin: false,
    isBanned: false,
    banInfo: null
}

const $ = id => document.getElementById(id)

function escapeHtml(t){ const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML }

export function formatBanUntil(iso){
    if(!iso) return 'бессрочно'
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

/* ============================================================
   ПРОВЕРКА СТАТУСА (вызывается из enterApp)
============================================================ */
export async function checkAdminStatus(){
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return ADMIN_STATE

        const { data:prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if(!prof) return ADMIN_STATE

        ADMIN_STATE.profile = prof
        ADMIN_STATE.isAdmin = !!prof.is_admin

        const now = Date.now()
        const banUntil = prof.ban_until ? new Date(prof.ban_until).getTime() : 0
        const isPermanent = !!prof.ban_permanent
        ADMIN_STATE.isBanned = isPermanent || (banUntil > now)
        ADMIN_STATE.banInfo = {
            until: prof.ban_until,
            permanent: isPermanent,
            reason: prof.ban_reason || 'Нарушение правил',
            comment: prof.ban_comment || '',
            warnings: prof.warnings || 0
        }

        if(ADMIN_STATE.isAdmin) injectAdminMenu()
        if(ADMIN_STATE.isBanned) showBlockedScreen()
    } catch(e){ console.warn('[admin]', e.message) }
    return ADMIN_STATE
}

/* ============================================================
   ПУНКТ МЕНЮ В САЙДБАРЕ
============================================================ */
function injectAdminMenu(){
    const scroll = document.querySelector('.sidebar-scroll')
    if(!scroll || document.getElementById('admin-menu-group')) return

    const group = document.createElement('div')
    group.id = 'admin-menu-group'
    group.className = 'sidebar-group'
    group.innerHTML = `
        <div class="sidebar-group-title">Администрирование</div>
        <button class="sidebar-item" id="open-admin-panel-btn">
            <svg class="sidebar-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/>
            </svg>
            Админ-панель
        </button>
    `
    scroll.appendChild(group)
    document.getElementById('open-admin-panel-btn').addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.remove('open')
        document.getElementById('sidebar-backdrop')?.classList.add('hidden')
        openAdminPanel()
    })
}

/* ============================================================
   ЭКРАН БЛОКИРОВКИ
============================================================ */
export function showBlockedScreen(){
    const bs = $('blocked-screen')
    if(!bs) return
    document.getElementById('main-app')?.classList.add('hidden')
    Object.values({
        auth:$('auth-screen'), karsq:$('karsq-screen'), reset:$('reset-screen'),
        'register-landing':$('register-landing-screen'), register:$('register-screen'),
        loading:$('loading-screen')
    }).forEach(s => s?.classList.add('hidden'))

    bs.classList.remove('hidden')

    const until = ADMIN_STATE.banInfo.permanent
        ? 'бессрочно'
        : formatBanUntil(ADMIN_STATE.banInfo.until)

    $('blocked-until-text').innerHTML = `<b>Срок:</b> ${escapeHtml(until)}`
    $('blocked-reason-text').innerHTML = `<b>Причина:</b> ${escapeHtml(ADMIN_STATE.banInfo.reason)}`
    $('blocked-comment-text').innerHTML = `<b>Комментарий администратора:</b> ${escapeHtml(ADMIN_STATE.banInfo.comment || '—')}`

    $('blocked-more')?.addEventListener('click', () => {
        $('blocked-details')?.classList.toggle('hidden')
    })

    showGreyPush()
}

/* ============================================================
   СЕРАЯ ВСПЛЫВАШКА
============================================================ */
export function showGreyPush(){
    const push = $('grey-push')
    if(!push) return
    push.classList.remove('hidden')
    requestAnimationFrame(() => push.classList.add('show'))

    const open = () => {
        push.classList.remove('show')
        setTimeout(() => push.classList.add('hidden'), 320)
        openSystemNotifications()
    }
    push.addEventListener('click', open, { once:true })
    $('grey-push-close')?.addEventListener('click', e => {
        e.stopPropagation()
        push.classList.remove('show')
        setTimeout(() => push.classList.add('hidden'), 320)
    })
}

/* ============================================================
   ЭКРАН СИСТЕМНЫХ УВЕДОМЛЕНИЙ
============================================================ */
export async function openSystemNotifications(){
    const view = $('system-notifications-view')
    const list = $('sys-notif-list')
    if(!view || !list) return
    view.classList.remove('hidden')
    requestAnimationFrame(() => view.classList.add('show'))

    list.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span></div>'

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user){ list.innerHTML = '<p class="empty">Не авторизован</p>'; return }
        const { data:notifs } = await supabase.from('notifications')
            .select('*').eq('user_id', user.id)
            .order('created_at', { ascending:false }).limit(50)

        if(!notifs?.length){ list.innerHTML = '<p class="empty">Нет уведомлений</p>'; return }

        list.innerHTML = notifs.map(n => {
            const meta = n.meta || {}
            const isBan = n.type === 'ban' || n.type === 'warning'
            const isResolved = n.type === 'report_resolved'
            const isRejected = n.type === 'report_rejected'
            let metaDetails = ''
            if(isBan){
                metaDetails = `
                    ${meta.reason ? `<div class="sys-notif-meta"><b>Причина:</b> ${escapeHtml(meta.reason)}</div>` : ''}
                    ${meta.comment ? `<div class="sys-notif-meta"><b>Комментарий:</b> ${escapeHtml(meta.comment)}</div>` : ''}
                    ${meta.permanent ? `<div class="sys-notif-meta"><b>Срок:</b> бессрочно</div>` : (meta.until ? `<div class="sys-notif-meta"><b>Разблокировка:</b> ${escapeHtml(formatBanUntil(meta.until))}</div>` : '')}
                `
            } else if(isResolved || isRejected){
                metaDetails = `
                    ${meta.target_username ? `<div class="sys-notif-meta"><b>Пользователь:</b> @${escapeHtml(meta.target_username)}</div>` : ''}
                    ${meta.reason ? `<div class="sys-notif-meta"><b>Причина жалобы:</b> ${escapeHtml(meta.reason)}</div>` : ''}
                `
            }
            const cls = isResolved ? 'report-resolved' : (isRejected ? 'report-rejected' : '')
            return `
                <div class="sys-notif-item ${n.is_read ? '' : 'unread'} ${cls}">
                    <div class="sys-notif-title">${escapeHtml(n.title)}</div>
                    <div class="sys-notif-body">${escapeHtml(n.body || '')}</div>
                    ${metaDetails}
                    <div class="sys-notif-time">${new Date(n.created_at).toLocaleString('ru-RU')}</div>
                </div>
            `
        }).join('')

        const ids = notifs.filter(n => !n.is_read).map(n => n.id)
        if(ids.length) supabase.from('notifications').update({ is_read:true }).in('id', ids).then(()=>{})
    } catch(e){ list.innerHTML = `<p class="empty">Ошибка: ${e.message}</p>` }

    $('sys-notif-close')?.addEventListener('click', () => {
        view.classList.remove('show')
        setTimeout(() => view.classList.add('hidden'), 320)
    }, { once:true })
}

/* ============================================================
   АДМИН-ПАНЕЛЬ
============================================================ */
export function openAdminPanel(){
    const panel = $('admin-panel')
    if(!panel) return
    panel.classList.remove('hidden')
    requestAnimationFrame(() => panel.classList.add('show'))
    renderAdminUsers()
}

/* ============================================================
   СПИСОК ПОЛЬЗОВАТЕЛЕЙ
============================================================ */
async function renderAdminUsers(search = ''){
    const body = $('admin-body')
    if(!body) return
    body.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span>Загрузка…</div>'

    let q = supabase.from('profiles')
        .select('id, username, full_name, avatar_url, is_admin, warnings, ban_until, ban_permanent')
        .order('created_at', { ascending:false }).limit(100)

    if(search) q = q.ilike('username', `%${search.replace('@','')}%`)

    const { data, error } = await q
    if(error){ body.innerHTML = `<p class="empty">Ошибка: ${error.message}</p>`; return }

    body.innerHTML = `
        <div class="admin-search">
            <input id="admin-user-search" placeholder="Поиск по @username" value="${escapeHtml(search)}">
        </div>
        <div class="admin-user-list">
            ${(data || []).map(u => {
        const banned = u.ban_permanent || (u.ban_until && new Date(u.ban_until) > new Date())
        return `
                    <div class="admin-user-row">
                        <div class="admin-user-ava">${u.avatar_url ? `<img src="${u.avatar_url}">` : (u.full_name || u.username || 'U').charAt(0).toUpperCase()}</div>
                        <div class="admin-user-info">
                            <div class="admin-user-name">${escapeHtml(u.full_name || u.username || 'user')} ${u.is_admin ? '🛡' : ''}</div>
                            <div class="admin-user-sub">@${escapeHtml(u.username || '')}</div>
                            ${u.ban_permanent ? '<div class="admin-user-badge banned">Забанен навсегда</div>' : ''}
                            ${!u.ban_permanent && banned ? `<div class="admin-user-badge banned">До ${formatBanUntil(u.ban_until)}</div>` : ''}
                            ${u.warnings > 0 ? `<div class="admin-user-badge warn">Предупреждений: ${u.warnings}</div>` : ''}
                        </div>
                        <button class="admin-user-action" data-uid="${u.id}">⚙</button>
                    </div>
                `
    }).join('') || '<p class="empty">Пользователей не найдено</p>'}
        </div>
    `

    $('admin-user-search')?.addEventListener('input', e => {
        clearTimeout(window._adminSearchT)
        window._adminSearchT = setTimeout(() => renderAdminUsers(e.target.value), 320)
    })

    body.querySelectorAll('[data-uid]').forEach(btn => {
        btn.addEventListener('click', () => openUserAdminActions(btn.dataset.uid, data))
    })
}

function openUserAdminActions(userId, allUsers){
    const u = allUsers.find(x => x.id === userId)
    if(!u) return

    const actions = [
        { label: u.is_admin ? 'Снять админа' : 'Назначить админом', fn: async () => {
                await supabase.from('profiles').update({ is_admin: !u.is_admin }).eq('id', userId)
                renderAdminUsers()
            }},
        { label: 'Предупредить', fn: () => openWarnModal(userId, u) },
        { label: 'Заблокировать', danger: true, fn: () => openBanModal(userId, u) },
        { label: 'Разблокировать / сбросить', fn: async () => {
                if(!confirm('Снять бан и сбросить предупреждения?')) return
                await supabase.from('profiles').update({
                    ban_until:null, ban_permanent:false, warnings:0,
                    ban_reason:null, ban_comment:null
                }).eq('id', userId)
                renderAdminUsers()
            }},
        { label: 'Удалить все посты', danger: true, fn: async () => {
                if(!confirm('Удалить ВСЕ посты этого пользователя?')) return
                await supabase.from('posts').delete().eq('author_id', userId)
                alert('Готово')
            }},
        { label: 'Удалить все каналы', danger: true, fn: async () => {
                if(!confirm('Удалить ВСЕ каналы этого пользователя?')) return
                await supabase.from('channels').delete().eq('owner_id', userId)
                alert('Готово')
            }}
    ]

    if(typeof window.showActionSheet === 'function'){
        window.showActionSheet(`@${u.username || 'user'}`, actions.map(a => ({
            label: a.label, danger: a.danger, onClick: a.fn
        })))
    } else {
        const choice = prompt(
            'Действия для @' + u.username + ':\n' +
            '1 — ' + actions[0].label + '\n' +
            '2 — Предупредить\n' +
            '3 — Заблокировать\n' +
            '4 — Разблокировать\n' +
            '5 — Удалить все посты\n' +
            '6 — Удалить все каналы'
        )
        const idx = parseInt(choice) - 1
        if(actions[idx]) actions[idx].fn()
    }
}

/* ============================================================
   ПРЕДУПРЕЖДЕНИЕ
============================================================ */
function openWarnModal(userId, u){
    const reason = prompt('Причина предупреждения:', 'Нарушение правил сообщества')
    if(reason === null) return
    const comment = prompt('Комментарий администратора (увидит пользователь):', '') || ''
    sendWarning(userId, u, reason, comment)
}

async function sendWarning(userId, u, reason, comment){
    const { data:prof } = await supabase.from('profiles').select('warnings').eq('id', userId).maybeSingle()
    const newWarn = (prof?.warnings || 0) + 1

    await supabase.from('profiles').update({ warnings: newWarn }).eq('id', userId)

    await supabase.from('notifications').insert({
        user_id: userId,
        type: 'warning',
        title: 'Предупреждение от администрации listatread',
        body: `Вам вынесено предупреждение за нарушение правил сообщества.\n\nПричина: ${reason}\n\nЭто предупреждение ${newWarn} из 2. При повторном нарушении аккаунт будет заблокирован.`,
        meta: { reason, comment, warnings: newWarn }
    })

    if(newWarn >= 2){
        const until = new Date(Date.now() + 24*60*60*1000).toISOString()
        await supabase.from('profiles').update({
            ban_until: until,
            ban_permanent: false,
            ban_reason: 'Многочисленные нарушения правил сообщества',
            ban_comment: comment || 'Автоматическая блокировка после 2-го предупреждения',
            banned_at: new Date().toISOString()
        }).eq('id', userId)

        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'ban',
            title: 'Вы были заблокированы в сервисе listatread',
            body: `Вы были заблокированы в сервисе listatread за многочисленные нарушения правил сообщества.\n\nВаш аккаунт заблокирован до ${formatBanUntil(until)}.`,
            meta: {
                reason: 'Многочисленные нарушения правил сообщества',
                comment: comment || '',
                until
            }
        })
    }

    alert('Предупреждение отправлено')
    renderAdminUsers()
}

/* ============================================================
   БАН-МОДАЛКА (для админа)
============================================================ */
let _banTargetId = null
let _banTargetUser = null
let _banDuration = '24h'

function openBanModal(userId, u){
    _banTargetId = userId
    _banTargetUser = u
    _banDuration = '24h'
    const modal = $('ban-modal')
    if(!modal) return
    modal.classList.remove('hidden')
    $('ban-username').textContent = '@' + (u.username || 'user')
    $('ban-reason').value = ''
    $('ban-comment').value = ''
    document.querySelectorAll('.ban-dur').forEach(b => b.classList.toggle('active', b.dataset.dur === '24h'))
}

/* ============================================================
   ЖАЛОБЫ
============================================================ */
export async function renderAdminReports(){
    const body = $('admin-body')
    if(!body) return
    body.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span>Загрузка жалоб…</div>'

    const { data: reports, error } = await supabase
        .from('reports')
        .select('*, reporter:reporter_id ( id, username, full_name, avatar_url )')
        .order('created_at', { ascending:false })
        .limit(200)

    if(error){
        body.innerHTML = `<p class="empty">Ошибка: ${escapeHtml(error.message)}<br><br>Убедись что таблица <b>reports</b> создана в Supabase.</p>`
        return
    }
    if(!reports?.length){
        body.innerHTML = '<p class="empty">Жалоб нет</p>'
        return
    }

    const pending = reports.filter(r => r.status === 'pending')
    const history = reports.filter(r => r.status !== 'pending')

    body.innerHTML = `
        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.5);margin-bottom:10px">Активные · ${pending.length}</h3>
        <div class="admin-report-list" id="admin-reports-pending">
            ${pending.length ? await renderReportsRows(pending) : '<p class="empty">Жалоб в обработке нет</p>'}
        </div>
        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.5);margin:20px 0 10px">История · ${history.length}</h3>
        <div class="admin-report-list">
            ${history.length ? await renderReportsRows(history, true) : '<p class="empty">История пуста</p>'}
        </div>
    `

    body.querySelectorAll('[data-report-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const reportId = btn.dataset.reportId
            const action = btn.dataset.reportAction
            await handleReportAction(reportId, action)
        })
    })
}

async function renderReportsRows(reports, readonly = false){
    const out = []
    for(const r of reports){
        const target = await fetchReportTarget(r)
        const reporter = r.reporter || {}
        const reporterName = reporter.full_name || reporter.username || 'user'
        const targetTypeLabel = { post:'Пост', video:'Видео', music:'Музыка', profile:'Аккаунт', channel:'Канал', live:'Live' }[r.target_type] || r.target_type

        const previewHtml = target ? `
            ${target.media ? renderTargetMedia(target.media) : ''}
            ${target.text ? `<div>${escapeHtml(target.text.slice(0, 400))}</div>` : ''}
            ${target.author ? `<div style="margin-top:8px;font-weight:600;color:#fff">Автор: @${escapeHtml(target.author.username || 'user')}</div>` : ''}
        ` : '<i>Контент не найден (удалён?)</i>'

        out.push(`
            <div class="admin-report-row">
                <div class="admin-report-head">
                    <div class="admin-report-icon">${r.target_type === 'profile' ? '👤' : r.target_type === 'channel' ? '📺' : r.target_type === 'live' ? '🔴' : r.target_type === 'music' ? '🎵' : '📄'}</div>
                    <div class="admin-report-info">
                        <div class="admin-report-title">${targetTypeLabel} · ${escapeHtml(r.reason)}</div>
                        <div class="admin-report-sub">от @${escapeHtml(reporterName)} · ${new Date(r.created_at).toLocaleString('ru-RU')}${readonly ? ' · <b style="color:#30d158">обработана</b>' : ''}</div>
                    </div>
                </div>
                <div class="admin-report-preview">${previewHtml}</div>
                ${r.comment ? `<div class="admin-report-meta">Комментарий: ${escapeHtml(r.comment)}</div>` : ''}
                ${!readonly ? `
                    <div class="admin-report-actions">
                        <button class="admin-report-btn warn" data-report-id="${r.id}" data-report-action="warn">Предупредить</button>
                        <button class="admin-report-btn resolve" data-report-id="${r.id}" data-report-action="resolve">Заблокировать</button>
                        ${(r.target_type === 'post' || r.target_type === 'video' || r.target_type === 'music') ? `<button class="admin-report-btn delete" data-report-id="${r.id}" data-report-action="delete-post">Удалить пост</button>` : ''}
                        ${r.target_type === 'channel' ? `<button class="admin-report-btn delete" data-report-id="${r.id}" data-report-action="delete-channel">Удалить канал</button>` : ''}
                        <button class="admin-report-btn reject" data-report-id="${r.id}" data-report-action="reject">Нет оснований</button>
                    </div>
                ` : ''}
            </div>
        `)
    }
    return out.join('')
}

function renderTargetMedia(url){
    if(!url) return ''
    const clean = url.split('?')[0].toLowerCase()
    if(/\.(mp4|webm|mov|m4v)$/.test(clean)) return `<video src="${url}" controls playsinline class="admin-report-media"></video>`
    if(/\.(mp3|wav|ogg|m4a|aac)$/.test(clean)) return `<audio src="${url}" controls style="width:100%;margin-top:8px"></audio>`
    return `<img src="${url}" alt="" class="admin-report-media">`
}

async function fetchReportTarget(r){
    try {
        if(r.target_type === 'post' || r.target_type === 'video' || r.target_type === 'music'){
            const { data } = await supabase.from('posts')
                .select('id, content, media_url, author_id, profiles:author_id ( id, username, full_name, avatar_url )')
                .eq('id', r.target_id).maybeSingle()
            if(!data) return null
            return { media: data.media_url, text: data.content, author: data.profiles, authorId: data.author_id, postId: data.id }
        }
        if(r.target_type === 'profile'){
            const { data } = await supabase.from('profiles')
                .select('id, username, full_name, avatar_url, bio')
                .eq('id', r.target_id).maybeSingle()
            return data ? { media: data.avatar_url, text: data.bio, author: data, authorId: data.id } : null
        }
        if(r.target_type === 'channel'){
            const { data } = await supabase.from('channels')
                .select('id, name, description, avatar_url, owner_id, profiles:owner_id ( id, username, full_name )')
                .eq('id', r.target_id).maybeSingle()
            return data ? { media: data.avatar_url, text: data.description, author: data.profiles, authorId: data.owner_id, channelId: data.id } : null
        }
        if(r.target_type === 'live'){
            const { data } = await supabase.from('lives')
                .select('id, title, host_id, profiles:host_id ( id, username, full_name, avatar_url )')
                .eq('id', r.target_id).maybeSingle()
            return data ? { text: data.title, author: data.profiles, authorId: data.host_id } : null
        }
    } catch(e){ console.warn('[fetchReportTarget]', e.message) }
    return null
}

async function handleReportAction(reportId, action){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return

    const { data: report } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle()
    if(!report) return

    const target = await fetchReportTarget(report)
    const targetAuthorId = target?.authorId

    if(action === 'reject'){
        await supabase.from('reports').update({
            status: 'rejected',
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
        }).eq('id', reportId)

        if(report.reporter_id && target?.author){
            const author = target.author
            await supabase.from('notifications').insert({
                user_id: report.reporter_id,
                type: 'report_rejected',
                title: 'Жалоба рассмотрена',
                body: `Мы не нашли нарушений по вашему запросу проверки аккаунта @${author.username || 'user'}.`,
                meta: { reason: report.reason, target_username: author.username, status: 'rejected' }
            })
        }
        if(typeof window.showToast === 'function') window.showToast('info', 'Жалоба отклонена', { icon:'✓' })
        renderAdminReports()
        return
    }

    if(action === 'warn' && targetAuthorId){
        const reason = prompt('Причина предупреждения:', report.reason) || report.reason
        const comment = prompt('Комментарий:', '') || ''
        const { data:prof } = await supabase.from('profiles').select('warnings').eq('id', targetAuthorId).maybeSingle()
        const newWarn = (prof?.warnings || 0) + 1
        await supabase.from('profiles').update({ warnings: newWarn }).eq('id', targetAuthorId)
        await supabase.from('notifications').insert({
            user_id: targetAuthorId,
            type: 'warning',
            title: 'Предупреждение от администрации listatread',
            body: `Причина: ${reason}`,
            meta: { reason, comment }
        })
        await supabase.from('reports').update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
        }).eq('id', reportId)

        if(report.reporter_id && target?.author){
            await supabase.from('notifications').insert({
                user_id: report.reporter_id,
                type: 'report_resolved',
                title: 'Мы приняли меры по вашей жалобе',
                body: `Мы приняли меры по отношению к пользователю @${target.author.username || 'user'} по вашей жалобе.`,
                meta: { target_username: target.author.username, reason: report.reason, status: 'resolved' }
            })
        }
        if(typeof window.showToast === 'function') window.showToast('success', 'Предупреждение выдано', { icon:'⚠️' })
        renderAdminReports()
        return
    }

    if(action === 'resolve' && targetAuthorId){
        const reason = prompt('Причина блокировки:', report.reason) || report.reason
        const comment = prompt('Комментарий для пользователя:', '') || ''
        const dur = prompt('Длительность (24h, 3d, 7d, forever):', '7d') || '7d'
        const durMap = { '24h': 24*60*60*1000, '3d': 3*24*60*60*1000, '7d': 7*24*60*60*1000 }
        const ms = dur === 'forever' ? null : (durMap[dur] || durMap['7d'])
        const update = { ban_reason: reason, ban_comment: comment, banned_at: new Date().toISOString() }
        if(ms === null){ update.ban_permanent = true; update.ban_until = null }
        else { update.ban_permanent = false; update.ban_until = new Date(Date.now() + ms).toISOString() }
        await supabase.from('profiles').update(update).eq('id', targetAuthorId)

        await supabase.from('notifications').insert({
            user_id: targetAuthorId,
            type: 'ban',
            title: 'Вы были заблокированы в сервисе listatread',
            body: `Ваш аккаунт заблокирован ${ms === null ? 'бессрочно' : 'до ' + formatBanUntil(update.ban_until)}.`,
            meta: { reason, comment, until: update.ban_until, permanent: update.ban_permanent }
        })

        await supabase.from('reports').update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
        }).eq('id', reportId)

        if(report.reporter_id && target?.author){
            await supabase.from('notifications').insert({
                user_id: report.reporter_id,
                type: 'report_resolved',
                title: 'Мы приняли меры по вашей жалобе',
                body: `Мы приняли меры по отношению к пользователю @${target.author.username || 'user'} по вашей жалобе.`,
                meta: { target_username: target.author.username, reason: report.reason, status: 'resolved' }
            })
        }

        if(typeof window.showToast === 'function') window.showToast('success', 'Пользователь заблокирован', { icon:'🚫' })
        renderAdminReports()
        return
    }

    if(action === 'delete-post' && target?.postId){
        await supabase.from('posts').delete().eq('id', target.postId)
        await supabase.from('reports').update({ status:'resolved', resolved_at:new Date().toISOString(), resolved_by:user.id }).eq('id', reportId)
        if(report.reporter_id){
            await supabase.from('notifications').insert({
                user_id: report.reporter_id,
                type: 'report_resolved',
                title: 'Мы приняли меры по вашей жалобе',
                body: `Пост, на который вы пожаловались, был удалён.`,
                meta: { status:'resolved' }
            })
        }
        if(typeof window.showToast === 'function') window.showToast('success', 'Пост удалён', { icon:'✓' })
        renderAdminReports()
        return
    }

    if(action === 'delete-channel' && target?.channelId){
        await supabase.from('channels').delete().eq('id', target.channelId)
        await supabase.from('reports').update({ status:'resolved', resolved_at:new Date().toISOString(), resolved_by:user.id }).eq('id', reportId)
        if(report.reporter_id){
            await supabase.from('notifications').insert({
                user_id: report.reporter_id,
                type: 'report_resolved',
                title: 'Мы приняли меры по вашей жалобе',
                body: `Канал, на который вы пожаловались, был удалён.`,
                meta: { status:'resolved' }
            })
        }
        if(typeof window.showToast === 'function') window.showToast('success', 'Канал удалён', { icon:'✓' })
        renderAdminReports()
    }
}

/* ============================================================
   АВТО-ЗАКРЫТИЕ СТАРЫХ ЖАЛОБ (3 дня)
============================================================ */
export async function autoCloseOldReports(){
    try {
        const threeDaysAgo = new Date(Date.now() - 3*24*60*60*1000).toISOString()
        const { data: old } = await supabase.from('reports')
            .select('id, reporter_id, reason, target_type, target_id')
            .eq('status', 'pending')
            .lt('created_at', threeDaysAgo)
        if(!old?.length) return
        for(const r of old){
            await supabase.from('reports').update({
                status: 'rejected',
                resolved_at: new Date().toISOString()
            }).eq('id', r.id)
            if(r.reporter_id){
                await supabase.from('notifications').insert({
                    user_id: r.reporter_id,
                    type: 'report_rejected',
                    title: 'Жалоба рассмотрена',
                    body: `Мы не нашли нарушений по вашему запросу проверки.`,
                    meta: { reason: r.reason, status: 'rejected', auto: true }
                })
            }
        }
    } catch(e){ console.warn('[autoCloseOldReports]', e.message) }
}

/* ============================================================
   ОБРАБОТЧИК КЛИКОВ (табы, бан, закрытие)
============================================================ */
document.addEventListener('click', e => {
    const dur = e.target.closest('.ban-dur')
    if(dur){
        _banDuration = dur.dataset.dur
        document.querySelectorAll('.ban-dur').forEach(b => b.classList.toggle('active', b === dur))
    }
})

document.addEventListener('click', async e => {
    if(e.target.closest('#ban-confirm')){
        if(!_banTargetId) return
        const reason = $('ban-reason').value.trim() || 'Нарушение правил сообщества'
        const comment = $('ban-comment').value.trim()

        const durations = {
            '24h': 24*60*60*1000,
            '3d': 3*24*60*60*1000,
            '7d': 7*24*60*60*1000,
            'forever': null
        }
        const ms = durations[_banDuration]

        const update = {
            ban_reason: reason,
            ban_comment: comment,
            banned_at: new Date().toISOString()
        }
        if(ms === null){
            update.ban_permanent = true
            update.ban_until = null
        } else {
            update.ban_permanent = false
            update.ban_until = new Date(Date.now() + ms).toISOString()
        }

        await supabase.from('profiles').update(update).eq('id', _banTargetId)

        const untilText = ms === null ? 'бессрочно' : `до ${formatBanUntil(update.ban_until)}`

        await supabase.from('notifications').insert({
            user_id: _banTargetId,
            type: 'ban',
            title: 'Вы были заблокированы в сервисе listatread',
            body: `Вы были заблокированы в сервисе listatread за многочисленные нарушения правил сообщества.\n\nВаш аккаунт заблокирован ${untilText}.`,
            meta: { reason, comment, until: update.ban_until, permanent: update.ban_permanent }
        })

        $('ban-modal').classList.add('hidden')
        alert('Пользователь заблокирован')
        _banTargetId = null
        renderAdminUsers()
    }
    if(e.target.closest('#ban-cancel') || e.target.closest('#ban-backdrop')){
        $('ban-modal').classList.add('hidden')
    }
    if(e.target.closest('#admin-close')){
        const p = $('admin-panel')
        p.classList.remove('show')
        setTimeout(() => p.classList.add('hidden'), 300)
    }
    const tab = e.target.closest('.admin-tab')
    if(tab){
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === tab))
        const atab = tab.dataset.atab
        const body = $('admin-body')
        if(atab === 'users') renderAdminUsers()
        else if(atab === 'reports') renderAdminReports()
        else if(atab === 'posts' && body) body.innerHTML = '<p class="empty">Посты — скоро</p>'
        else if(atab === 'channels' && body) body.innerHTML = '<p class="empty">Каналы — скоро</p>'
    }
})

/* Экспорт для main.js */
window.__ADMIN__ = {
    state: ADMIN_STATE,
    check: checkAdminStatus,
    isBanned: () => ADMIN_STATE.isBanned
}