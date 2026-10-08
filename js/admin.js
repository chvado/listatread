/* ============================================================
   listatread — admin.js (админ-панель, предупреждения, бан)
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
            const metaDetails = isBan
                ? `
            ${meta.reason ? `<div class="sys-notif-meta"><b>Причина:</b> ${escapeHtml(meta.reason)}</div>` : ''}
            ${meta.comment ? `<div class="sys-notif-meta"><b>Комментарий:</b> ${escapeHtml(meta.comment)}</div>` : ''}
            ${meta.permanent ? `<div class="sys-notif-meta"><b>Срок:</b> бессрочно</div>` : (meta.until ? `<div class="sys-notif-meta"><b>Разблокировка:</b> ${escapeHtml(formatBanUntil(meta.until))}</div>` : '')}
        `
                : ''
            return `
        <div class="sys-notif-item ${n.is_read ? '' : 'unread'}">
            <div class="sys-notif-title">${escapeHtml(n.title)}</div>
            <div class="sys-notif-body">${escapeHtml(n.body || '')}</div>
            ${metaDetails}
            <div class="sys-notif-time">${new Date(n.created_at).toLocaleString('ru-RU')}</div>
        </div>
    `
        }).join('')

        // Отмечаем прочитанными
        const ids = notifs.filter(n => !n.is_read).map(n => n.id)
        if(ids.length) supabase.from('notifications').update({ is_read:true }).in('id', ids).then(()=>{})


    } catch(e){ list.innerHTML = `<p class="empty">Ошибка: ${e.message}</p>` }

    $('sys-notif-close')?.addEventListener('click', () => {
        view.classList.remove('show')
        setTimeout(() => view.classList.add('hidden'), 320)
    }, { once:true })
}

function showFullBanNotice(notif, meta){
    const box = document.getElementById('full-ban-modal')
    if(!box){
        const el = document.createElement('div')
        el.id = 'full-ban-modal'
        el.className = 'ban-modal'
        el.innerHTML = `
            <div class="ban-backdrop" data-close="1"></div>
            <div class="ban-sheet">
                <div class="share-handle"></div>
                <h3 class="ban-title">${escapeHtml(notif.title)}</h3>
                <p class="ban-sub">listatread · система</p>
                <div style="font-size:14px;line-height:1.6;color:rgba(255,255,255,.85);white-space:pre-wrap;padding:14px;background:rgba(255,255,255,.05);border-radius:14px;margin-top:8px">
${escapeHtml(notif.body || '')}
${meta.reason ? `\n\nПричина: ${escapeHtml(meta.reason)}` : ''}
${meta.comment ? `\n\nКомментарий администратора: ${escapeHtml(meta.comment)}` : ''}
${meta.until ? `\n\nРазблокировка: ${escapeHtml(formatBanUntil(meta.until))}` : ''}
${meta.permanent ? '\n\nСрок: бессрочно' : ''}
                </div>
                <div class="ban-actions" style="grid-template-columns:1fr">
                    <button class="btn-primary" id="full-ban-close">Понятно</button>
                </div>
            </div>
        `
        document.body.appendChild(el)
        el.querySelector('[data-close]').addEventListener('click', () => el.classList.add('hidden'))
        el.querySelector('#full-ban-close').addEventListener('click', () => el.classList.add('hidden'))
    }
    const el = document.getElementById('full-ban-modal')
    el.querySelector('.ban-title').textContent = notif.title
    el.querySelector('div[style*="pre-wrap"]').textContent =
        (notif.body || '') +
        (meta.reason ? `\n\nПричина: ${meta.reason}` : '') +
        (meta.comment ? `\n\nКомментарий администратора: ${meta.comment}` : '') +
        (meta.permanent ? '\n\nСрок: бессрочно' : (meta.until ? `\n\nРазблокировка: ${formatBanUntil(meta.until)}` : ''))
    el.classList.remove('hidden')
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

async function renderAdminUsers(search = ''){
    const body = $('admin-body')
    if(!body) return
    body.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span>Загрузка…</div>'

    let q = supabase.from('profiles')
        .select('id, username, full_name, avatar_url, is_admin, warnings, ban_until, ban_permanent')
        .order('created_at', { ascending:false }).limit(100)

    if(search){
        q = q.ilike('username', `%${search.replace('@','')}%`)
    }

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
                        <div class="admin-user-ava">
                            ${u.avatar_url ? `<img src="${u.avatar_url}">` : (u.full_name || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
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

    const input = $('admin-user-search')
    input?.addEventListener('input', e => {
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

    // Простая встроенная панель действий — используем actionsheet из main.js
    // если он доступен через window; иначе fallback alert
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

    // Если в проекте доступен showActionSheet из main.js через window — используем его
    if(typeof window.showActionSheet === 'function'){
        window.showActionSheet(`@${u.username || 'user'}`, actions.map(a => ({
            label: a.label, danger: a.danger, onClick: a.fn
        })))
    } else {
        // fallback
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

    // Уведомление №1 — предупреждение
    await supabase.from('notifications').insert({
        user_id: userId,
        type: 'warning',
        title: 'Предупреждение от администрации listatread',
        body: `Вам вынесено предупреждение за нарушение правил сообщества.\n\nПричина: ${reason}\n\nЭто предупреждение ${newWarn} из 2. При повторном нарушении аккаунт будет заблокирован.`,
        meta: { reason, comment, warnings: newWarn }
    })

    // На 2-е предупреждение — авто-бан на 24ч
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

        const untilText = ms === null
            ? 'бессрочно'
            : `до ${formatBanUntil(update.ban_until)}`

        await supabase.from('notifications').insert({
            user_id: _banTargetId,
            type: 'ban',
            title: 'Вы были заблокированы в сервисе listatread',
            body: `Вы были заблокированы в сервисе listatread за многочисленные нарушения правил сообщества.\n\nВаш аккаунт заблокирован ${untilText}.`,
            meta: {
                reason,
                comment,
                until: update.ban_until,
                permanent: update.ban_permanent
            }
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
    if(tab && tab.dataset.atab === 'users'){
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === tab))
        renderAdminUsers()
    }
})

/* Экспорт для main.js */
window.__ADMIN__ = {
    state: ADMIN_STATE,
    check: checkAdminStatus,
    isBanned: () => ADMIN_STATE.isBanned
}