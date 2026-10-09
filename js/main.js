/* ============================================================
   listatread — main.js (v14, с роутером, фиолетовые галочки, жалобы)
   PART 1 / 3 — до uploadAvatar()
============================================================ */
import { supabase } from './supabase.js'
function isUuid(s){
    return typeof s === 'string'
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
import { loadPosts } from './feed.js'
import { checkAdminStatus, ADMIN_STATE, showBlockedScreen, renderAdminReports, autoCloseOldReports } from './admin.js'
import { openDirectTab, buildDirectScreen, openDirectChat } from './direct.js'
/* ============================================================
   SVG-ИКОНКИ
============================================================ */
const SVG = {
    instagram:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="#fff" stroke="none"/></svg>',
    telegram:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M21.9 4.4 3.4 11.6c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.7 5.4c.2.6.4.8 1 .8.5 0 .7-.2 1-.5l2.4-2.3 4.7 3.5c.9.5 1.5.2 1.7-.8l3-14c.3-1.3-.5-1.9-1.4-1.5z"/></svg>',
    spotify:'<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#1DB954"/><path d="M7 9.5c3.5-.9 7-.5 9.7 1.2" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M7.5 12.3c2.8-.7 5.5-.4 7.7 1" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M8 15c2.2-.5 4.2-.3 6 .8" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
    roblox:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M9 9h6v6H9z" transform="rotate(45 12 12)"/></svg>',
    youtube:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M23 12s0-3.8-.5-5.5c-.3-1-1.1-1.8-2.1-2C18.6 4 12 4 12 4s-6.6 0-8.4.5c-1 .2-1.8 1-2.1 2C1 8.2 1 12 1 12s0 3.8.5 5.5c.3 1 1.1 1.8 2.1 2 1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5c1-.2 1.8-1 2.1-2 .5-1.7.5-5.5.5-5.5zM9.7 15.5v-7l6 3.5-6 3.5z"/></svg>',
    vk:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.8"><path d="M9 3h6a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6z"/><path d="M12.8 17.4h1.5c.5 0 .6-.3.6-.6 0-.6-.8-1.6-2.2-3.1-.2-.2-.2-.3 0-.5l2-2.5c.4-.5.2-.8-.4-.8h-1.7c-.5 0-.7.2-.9.6-.5 1-1.3 2.2-1.6 2.2-.2 0-.4-.2-.4-.7V10c0-.5-.1-.7-.6-.7H8.3c-.4 0-.7.3-.7.6 0 .5.5.6.6.7.2.1.3.3.3.6v1.6c0 .6-.1.8-.4.8-.4 0-1.2-1.2-1.7-2.6-.2-.5-.4-.7-.9-.7H4.4c-.6 0-.7.3-.7.7 0 .5.7 2.7 2.3 4.8 1 1.4 2.6 2.2 4 2.2 1.2 0 1.5-.2 1.5-.8v-1.1c0-.5.1-.6.5-.6.3 0 .8.2 1.6 1 .5.4.9.9 1.4.9z" fill="#fff" stroke="none"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M14 3v9.5a3.5 3.5 0 1 1-3.5-3.5c.3 0 .5 0 .8.1V11a2 2 0 1 0 1.2 1.9V3h1.5zm0 0c.4 1.6 1.7 3 3.3 3.2v1.5c-1.1-.1-2.2-.5-3.1-1.2V3z"/></svg>',
    facebook:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H6v3h2v8h3v-8h2.3l.7-3H11V7.5c0-.8.7-1.5 1.5-1.5H15V3z"/></svg>',
    github:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.3-.3-4.6-1.1-4.6-5a4 4 0 0 1 1-2.7c-.1-.3-.5-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .6 1.3.2 2.3.1 2.6a4 4 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
    discord:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M19.3 5.3A16 16 0 0 0 15.4 4l-.2.5a12 12 0 0 1 3.4 1.7c-3-1.4-6-1.6-9.2 0 1-.6 2.1-1.2 3.4-1.7L12.6 4A16 16 0 0 0 4.7 5.3C2.2 9 1.6 12.6 1.9 16a16 16 0 0 0 4.9 2.5l1-1.6c-.5-.2-1.1-.5-1.5-.8l.4-.3c3 1.4 6.3 1.4 9.3 0l.4.3c-.4.3-1 .6-1.5.8l1 1.6a16 16 0 0 0 4.9-2.5c.4-3.9-.6-7.5-2.5-10.7zM9 14c-.8 0-1.5-.8-1.5-1.7S8.2 10.6 9 10.6s1.5.7 1.5 1.7-.7 1.7-1.5 1.7zm6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.7 1.5 1.7-.7 1.7-1.5 1.7z"/></svg>',
    email:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zm10 7L4 6h16l-8 7z"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm5.7 14.2c-.2.7-1.4 1.4-2 1.5-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.3.4-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8 1-1.1.2-.3.4-.2.6-.1.3.1 1.7.8 2 1 .3.1.5.2.6.4 0 .1 0 .7-.2 1.3z"/></svg>',
    twitter:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.2 3h3.3l-7.2 8.3L23 21h-6.6l-5.2-6.8L5.3 21H2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.2 3zm-1.2 16h1.8L7 4.9H5L17 19z"/></svg>',
    reddit:'<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#FF4500"/><circle cx="8.5" cy="13.5" r="1.4" fill="#fff"/><circle cx="15.5" cy="13.5" r="1.4" fill="#fff"/><path d="M8 16c1.3.9 2.7 1.3 4 1.3s2.7-.4 4-1.3" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="17.5" cy="7" r="1.3" fill="#fff"/><path d="M12 8l1-4 3.3.8" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
    linkedin:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M4 4h4v16H4zM6 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM10 8h3.8v2.2h.1c.5-1 1.8-2 3.7-2 3.9 0 4.7 2.5 4.7 5.8V20h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V20h-4V8z"/></svg>',
    pinterest:'<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#E60023"/><path d="M12 5c-3.9 0-5.9 2.6-5.9 4.9 0 1.4.5 2.6 1.6 3 .2.1.3 0 .4-.2l.2-.8c.1-.2 0-.3-.1-.5-.3-.4-.6-1-.6-1.7 0-2.2 1.6-4.1 4.3-4.1 2.3 0 3.6 1.4 3.6 3.3 0 2.5-1.1 4.6-2.7 4.6-.9 0-1.6-.7-1.3-1.7l.7-2.7c.2-.7-.2-1.3-.9-1.3-1 0-1.8 1-1.8 2.4 0 .8.3 1.4.3 1.4l-1.1 4.6c-.3 1.4-.1 3-.1 3.2.1.1.2.1.3 0 .1-.2 1.3-1.6 1.7-3.1l.6-2.4c.4.7 1.4 1.2 2.5 1.2 3.3 0 5.5-3 5.5-7 0-3-2.6-5.9-6.9-5.9z" fill="#fff"/></svg>',
    tumblr:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M13.5 3v3.5h3.3v3.3h-3.3V15c0 1.4.4 2 1.8 2h1.7v3.3h-3.5c-3 0-4-1.5-4-3.8V9.8H7V7.2c2-.6 3-2.3 3.3-4.2H13.5z"/></svg>',
    line:'<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#00B900"/><path d="M12 5c-4 0-7.2 2.7-7.2 6 0 3 2.6 5.5 6.1 6l-.4 2c0 .2.2.2.3.1l2.3-2.5c3.4-.7 6.1-3 6.1-5.6 0-3.3-3.2-6-7.2-6z" fill="#fff"/></svg>',
    sms:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M21 3H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h4v3l4-3h10a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM7 9h10v2H7V9zm0 4h7v2H7v-2z"/></svg>',
    copy:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.9"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    scan:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.9"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18"/></svg>',
    play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>',
    search:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    music:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    channel:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/></svg>',
    live:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2s4 3 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>',
}

const SOCIALS = [
    { key:'instagram', svg:SVG.instagram, bg:'#E4405F', domain:'instagram.com', placeholder:'instagram.com/username' },
    { key:'telegram',  svg:SVG.telegram,  bg:'#26A5E4', domain:'t.me',         placeholder:'t.me/username' },
    { key:'spotify',   svg:SVG.spotify,   bg:'#191414', domain:'spotify.com',  placeholder:'open.spotify.com/user/...' },
    { key:'youtube',   svg:SVG.youtube,   bg:'#FF0000', domain:'youtube.com',  placeholder:'youtube.com/@channel' },
    { key:'facebook',  svg:SVG.facebook,  bg:'#0866FF', domain:'facebook.com', placeholder:'facebook.com/username' },
    { key:'github',    svg:SVG.github,    bg:'#181717', domain:'github.com',   placeholder:'github.com/username' },
    { key:'discord',   svg:SVG.discord,   bg:'#5865F2', domain:'discord.gg',   placeholder:'discord.gg/invite' },
    { key:'email',     svg:SVG.email,     bg:'#EA4335', domain:'@',            placeholder:'name@example.com' }
]

const SHARE_SOCIALS = [
    { key:'whatsapp',  svg:SVG.whatsapp,  bg:'#25D366', url: u => `https://wa.me/?text=${encodeURIComponent(u)}` },
    { key:'telegram',  svg:SVG.telegram,  bg:'#26A5E4', url: u => `https://t.me/share/url?url=${encodeURIComponent(u)}` },
    { key:'vk',        svg:SVG.vk,        bg:'#0077FF', url: u => `https://vk.com/share.php?url=${encodeURIComponent(u)}` },
    { key:'twitter',   svg:SVG.twitter,   bg:'#000000', url: u => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}` },
    { key:'facebook',  svg:SVG.facebook,  bg:'#0866FF', url: u => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { key:'reddit',    svg:SVG.reddit,    bg:'#FF4500', url: u => `https://reddit.com/submit?url=${encodeURIComponent(u)}` },
    { key:'linkedin',  svg:SVG.linkedin,  bg:'#0A66C2', url: u => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
    { key:'pinterest', svg:SVG.pinterest, bg:'#E60023', url: u => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}` },
    { key:'tumblr',    svg:SVG.tumblr,    bg:'#36465D', url: u => `https://tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(u)}` },
    { key:'line',      svg:SVG.line,      bg:'#00B900', url: u => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(u)}` },
    { key:'email',     svg:SVG.email,     bg:'#EA4335', url: u => `mailto:?body=${encodeURIComponent(u)}` },
    { key:'sms',       svg:SVG.sms,       bg:'#30d158', url: u => `sms:?body=${encodeURIComponent(u)}` },
    { key:'discord',   svg:SVG.discord,   bg:'#5865F2', url: u => u },
    { key:'copy',      svg:SVG.copy,      bg:'#0a84ff', url: null },
    { key:'scan',      svg:SVG.scan,      bg:'#1c1c1e', url: null }
]

const SHARE_CIRCLES = [
    { key:'scan',      label:'Сканер',       bg:'#1c1c1e', icon:SVG.scan },
    { key:'copy',      label:'Ссылка',       bg:'#0a84ff', icon:SVG.copy },
    { key:'telegram',  label:'Telegram',     bg:'#26A5E4', icon:SVG.telegram },
    { key:'insta_story', label:'Insta story', bg:'#d6249f', icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.2 8.4 2.2 8.8 2.2 12 2.2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.8 5.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>' },
    { key:'instagram', label:'Instagram',    bg:'#E4405F', icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="#fff" stroke="none"/></svg>' },
    { key:'viber',     label:'Viber',        bg:'#7360f2', icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2C7 2 3 5.6 3 10c0 2 .7 3.8 2 5.3-.1 1.3-.5 2.6-1.4 3.6 1.5.1 3-.4 4.2-1.3 1.3.5 2.7.8 4.2.8 5 0 9-3.6 9-8S17 2 12 2z"/></svg>' },
    { key:'whatsapp',  label:'WhatsApp',     bg:'#25D366', icon:SVG.whatsapp },
    { key:'wa_status', label:'WA status',    bg:'#128C7E', icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 2a10 10 0 1 0 10 10h-3a7 7 0 1 1-7-7V2z"/></svg>' },
    { key:'facebook',  label:'Facebook',     bg:'#0866FF', icon:SVG.facebook },
    { key:'discord',   label:'Discord',      bg:'#5865F2', icon:SVG.discord },
    { key:'more',      label:'Больше',       bg:'#48484a', icon:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>' }
]

const LANGUAGES = [
    { code:'en', flag:'🇬🇧', name:'English' }, { code:'ru', flag:'🇷🇺', name:'Русский' },
    { code:'zh', flag:'🇨🇳', name:'中文' }, { code:'es', flag:'🇪🇸', name:'Español' },
    { code:'fr', flag:'🇫🇷', name:'Français' }, { code:'de', flag:'🇩🇪', name:'Deutsch' },
    { code:'it', flag:'🇮🇹', name:'Italiano' }, { code:'pt', flag:'🇵🇹', name:'Português' },
    { code:'ja', flag:'🇯🇵', name:'日本語' }, { code:'ko', flag:'🇰🇷', name:'한국어' },
    { code:'ar', flag:'🇸🇦', name:'العربية' }, { code:'hi', flag:'🇮🇳', name:'हिन्दी' },
    { code:'tr', flag:'🇹🇷', name:'Türkçe' }, { code:'pl', flag:'🇵🇱', name:'Polski' },
    { code:'uk', flag:'🇺🇦', name:'Українська' }, { code:'nl', flag:'🇳🇱', name:'Nederlands' }
]

const COUNTRIES = [
    { code:'ru', flag:'🇷🇺', name:'Россия' }, { code:'us', flag:'🇺🇸', name:'США' },
    { code:'gb', flag:'🇬🇧', name:'Великобритания' }, { code:'de', flag:'🇩🇪', name:'Германия' },
    { code:'fr', flag:'🇫🇷', name:'Франция' }, { code:'it', flag:'🇮🇹', name:'Италия' },
    { code:'es', flag:'🇪🇸', name:'Испания' }, { code:'pt', flag:'🇵🇹', name:'Португалия' },
    { code:'nl', flag:'🇳🇱', name:'Нидерланды' }, { code:'se', flag:'🇸🇪', name:'Швеция' },
    { code:'no', flag:'🇳🇴', name:'Норвегия' }, { code:'dk', flag:'🇩🇰', name:'Дания' },
    { code:'fi', flag:'🇫🇮', name:'Финляндия' }, { code:'pl', flag:'🇵🇱', name:'Польша' },
    { code:'cz', flag:'🇨🇿', name:'Чехия' }, { code:'gr', flag:'🇬🇷', name:'Греция' },
    { code:'tr', flag:'🇹🇷', name:'Турция' }, { code:'ua', flag:'🇺🇦', name:'Украина' },
    { code:'by', flag:'🇧🇾', name:'Беларусь' }, { code:'kz', flag:'🇰🇿', name:'Казахстан' },
    { code:'ge', flag:'🇬🇪', name:'Грузия' }, { code:'am', flag:'🇦🇲', name:'Армения' },
    { code:'az', flag:'🇦🇿', name:'Азербайджан' }, { code:'il', flag:'🇮🇱', name:'Израиль' },
    { code:'ae', flag:'🇦🇪', name:'ОАЭ' }, { code:'sa', flag:'🇸🇦', name:'Саудовская Аравия' },
    { code:'in', flag:'🇮🇳', name:'Индия' }, { code:'cn', flag:'🇨🇳', name:'Китай' },
    { code:'jp', flag:'🇯🇵', name:'Япония' }, { code:'kr', flag:'🇰🇷', name:'Южная Корея' },
    { code:'au', flag:'🇦🇺', name:'Австралия' }, { code:'ca', flag:'🇨🇦', name:'Канада' },
    { code:'br', flag:'🇧🇷', name:'Бразилия' }, { code:'mx', flag:'🇲🇽', name:'Мексика' }
]

const STATUSES = [
    { code:'default', label:'По умолчанию', emoji:'👋' },
    { code:'kiss',    label:'Поцелуй',      emoji:'💋' },
    { code:'watch',   label:'Наблюдаю',     emoji:'👀' },
    { code:'cat',     label:'Котик',        emoji:'😻' },
    { code:'ghost',   label:'Призрак',      emoji:'👻' },
    { code:'love',    label:'Влюблён',      emoji:'🥰' },
    { code:'laugh',   label:'Смеюсь',       emoji:'😀' },
    { code:'lol',     label:'Ржу',          emoji:'😂' },
    { code:'party',   label:'Тусуюсь',      emoji:'🥳' },
    { code:'pumpkin', label:'Хэллоуин',     emoji:'🎃' },
    { code:'alien',   label:'Чужой',        emoji:'👾' },
    { code:'wedding', label:'Свадьба',      emoji:'💍' },
    { code:'dog',     label:'Собака',       emoji:'🐶' },
    { code:'cat2',    label:'Кошка',        emoji:'🐱' },
    { code:'bow',     label:'Бантик',       emoji:'🎀' },
    { code:'bear',    label:'Мишка',        emoji:'🧸' },
    { code:'plane',   label:'Путешествую',  emoji:'✈️' },
    { code:'clown',   label:'Клоун',        emoji:'🤡' },
    { code:'angel',   label:'Ангел',        emoji:'😇' },
    { code:'sick',    label:'Болею',        emoji:'🤒' },
    { code:'friends', label:'Друзья',       emoji:'👥' },
    { code:'cop',     label:'Коп',          emoji:'👮' },
    { code:'ninja',   label:'Ниндзя',       emoji:'🥷' },
    { code:'zombie',  label:'Зомби',        emoji:'🧟‍♂️' },
    { code:'business',label:'Бизнес',       emoji:'💼' },
    { code:'pig',     label:'Свинка',       emoji:'🐽' },
    { code:'tree',    label:'Ёлка',         emoji:'🎄' },
    { code:'mushroom',label:'Гриб',         emoji:'🍄' },
    { code:'rose',    label:'Роза',         emoji:'🌹' },
    { code:'wilted',  label:'Увядшая',      emoji:'🥀' },
    { code:'snow',    label:'Снег',         emoji:'❄️' },
    { code:'apple',   label:'Яблоко',       emoji:'🍎' },
    { code:'strawberry',label:'Земляника',  emoji:'🍓' },
    { code:'cake',    label:'Тортик',       emoji:'🎂' },
    { code:'soccer',  label:'Футбол',       emoji:'⚽️' },
    { code:'car',     label:'Машина',       emoji:'🚗' },
    { code:'camera',  label:'Фото',         emoji:'📸' },
    { code:'magnet',  label:'Магнит',       emoji:'🧲' },
    { code:'bath',    label:'Ванна',        emoji:'🛁' },
    { code:'note',    label:'Заметка',      emoji:'📝' },
    { code:'done',    label:'Готово',       emoji:'✅' },
    { code:'male',    label:'Мужской',      emoji:'🚹' },
    { code:'female',  label:'Женский',      emoji:'🚺' },
    { code:'baby',    label:'Ребёнок',      emoji:'🚼' }
]
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.code, s]))
function statusEmoji(c){ return STATUS_MAP[c]?.emoji || '👋' }
function statusLabel(c){ return STATUS_MAP[c]?.label || 'По умолчанию' }

const EMOJI_LIST = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🧠','👀','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','💞','💓','💗','💖','💘','💝','🔥','⭐','🌟','✨','⚡','💥','💫','💦','🎉','🎊','🎈','🎁','🎀','🏆','🥇','🎯','🎲','🎮','🎰','🌸','🌹','🌻','🌷','🍀','🍁','🍇','🍉','🍊','🍋','🍌','🍎','🍓','🍒','🍑','🥝','🍔','🍟','🍕','🌭','🍿','🍣','⚽','🏀','🏈','🎾','🎱','🏓','🥊','🎽','🚗','🚕','🚌','🚓','🚑','🚒','🚲','🛵','✈️','🚀','🛸','⌚','📱','💻','🎧','📷','💡','🔦','💸','💰','💎','🔧','🔨','🔮','📿','🧸','🎁','🛍️','🛒']

/* ============================================================
   STATE
============================================================ */
const state = {
    step:1, totalSteps:6,
    data:{ email:'', password:'', fullName:'', username:'', avatarFile:null, bio:'', socials:{}, gender:null, region:null, birthday:null, method:'skip', codeVerified:false, settings:{}, status:'default', theme:'light' },
    screen:'home', feedTab:'recommended', profileTab:'reposts',
    replyTo:null, currentUser:null, currentProfile:null, attachedPhoto:null, attachedVideo:false,
    attachedKind:null,
    chatContext:'global', chatTitle:'Global', lastPostAt:0,
    currentProfileViewId:null, inboxTab:'followers', viewingOwnProfile:true,
    hasMainChannelSub:false,
    myFollows: new Set(),
    myChannelSubs: new Set(),
    channelFilters: { type:'all', author:null },
    channelPosts: [],
    recBuffer: [], recCursor: 0, recShownIds: new Set(), recLoading: false, recObserver: null,
    channelLikedSet: new Set(),
    channelRepostedSet: new Set(),
    channelCounts: {},
    currentProfilePrivacy: {}
}

/* ============================================================
   ТЕМА
============================================================ */
const THEME_KEY = 'lt_theme'
function setPageBg(forceDark){
    const theme = document.documentElement.getAttribute('data-theme') || 'light'
    const dark = forceDark === true || (forceDark !== false && theme === 'dark')
    document.documentElement.classList.toggle('bg-dark', dark)
    document.documentElement.classList.toggle('bg-light', !dark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if(meta) meta.setAttribute('content', dark ? '#000000' : '#ffffff')
}
function applyTheme(theme){
    const t = theme === 'dark' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem(THEME_KEY, t) } catch {}
    const meta = document.querySelector('meta[name="theme-color"]')
    if(meta) meta.setAttribute('content', t === 'dark' ? '#000000' : '#ffffff')
    const icon = document.getElementById('theme-toggle-icon')
    const text = document.getElementById('theme-toggle-text')
    if(icon) icon.textContent = t === 'dark' ? '🌙' : '☀️'
    if(text) text.textContent = t === 'dark' ? 'Тёмная' : 'Светлая'
    const picker = document.getElementById('reg-theme-picker')
    if(picker) picker.querySelectorAll('.theme-choice').forEach(b => b.classList.toggle('active', b.dataset.theme === t))
    state.data.theme = t
}
function getTheme(){ try { return localStorage.getItem(THEME_KEY) || 'light' } catch { return 'light' } }
function initTheme(){ applyTheme(getTheme()) }

document.addEventListener('click', e => {
    if(e.target.closest('#theme-toggle')){
        const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
        applyTheme(cur === 'dark' ? 'light' : 'dark')
    }
    const choice = e.target.closest('#reg-theme-picker .theme-choice')
    if(choice){ applyTheme(choice.dataset.theme) }
})

initTheme()

/* ============================================================
   УТИЛИТЫ
============================================================ */
const $ = id => document.getElementById(id)
function withTimeout(p, ms, l){ return Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Timeout: ' + l)), ms))]) }
function escapeHtml(t){ const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML }
function computeDisplayStatus(p){ return p?.status || 'default' }
function isVideoUrl(u){ return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u||'') }
function isAudioUrl(u){ return /\.(mp3|wav|ogg|m4a|aac|flac|opus)(\?|$)/i.test(u||'') }
function isImageUrl(u){ return u && !isVideoUrl(u) && !isAudioUrl(u) }
function adminBadge(isAdmin, size = ''){ return isAdmin ? `<span class="admin-badge ${size}" title="Администратор">🦝</span>` : '' }

function loadingBlock(text = ''){
    return `<div class="loading-block"><span class="loading-spinner-inline"></span>${text ? escapeHtml(text) : ''}</div>`
}

async function refreshFollowCache(){
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        const [{ data:f }, { data:s }] = await Promise.all([
            supabase.from('follows').select('following_id').eq('follower_id', user.id),
            supabase.from('subscriptions').select('channel_id').eq('follower_id', user.id)
        ])
        state.myFollows = new Set((f||[]).map(x => x.following_id))
        state.myChannelSubs = new Set((s||[]).map(x => x.channel_id))
    } catch {}
}

function renderMedia(url, cls = 'feed-post-image', meta = {}){
    if(!url) return ''
    const clean = url.split('?')[0].toLowerCase()
    if(/\.(mp4|webm|mov|m4v)$/.test(clean)){
        return `<video class="${cls}" src="${url}" controls playsinline preload="metadata" style="width:100%;border-radius:var(--radius-md);margin-top:10px;display:block;max-height:420px;"></video>`
    }
    if(/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(clean)){
        const title = meta.title || meta.media_title || 'Аудио'
        return `<div class="track-card" data-track-src="${url}" data-track-post="${meta.postId || ''}" data-track-title="${escapeHtml(title)}">
      <button class="track-play" data-action="toggle-play" aria-label="Воспроизвести">${SVG.play}</button>
      <div class="track-info">
        <div class="track-title">${escapeHtml(title)}</div>
        <div class="track-meta">
          <span class="track-user">@${escapeHtml(meta.username || 'user')}</span>
          <span class="track-time" data-track-time="0:00 / 0:00">0:00 / 0:00</span>
        </div>
      </div>
      <div class="track-actions">
        <button class="track-more" data-action="track-more" aria-label="Действия">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
        </button>
      </div>
      <div class="track-progress"><div class="track-progress-fill"></div></div>
    </div>`
    }
    return `<img class="${cls}" src="${url}" alt="">`
}

async function fetchCounts(postIds){
    const out = {}
    postIds.forEach(id => out[id] = { likes:0, comments:0, reposts:0 })
    if(!postIds.length) return out
    try {
        const [{ data:likes }, { data:comments }, { data:reposts }] = await Promise.all([
                supabase.from('likes').select('post_id').in('post_id', postIds),
                supabase.from('comments').select('post_id').in('post_id', postIds),
                supabase.from('reposts').select('post_id').in('post_id', postIds)
            ])
        ;(likes || []).forEach(l => { if(out[l.post_id]) out[l.post_id].likes++ })
        ;(comments || []).forEach(c => { if(out[c.post_id]) out[c.post_id].comments++ })
        ;(reposts || []).forEach(r => { if(out[r.post_id]) out[r.post_id].reposts++ })
    } catch(e){ console.warn('[counts]', e.message) }
    return out
}

/* ============================================================
   ROUTER
============================================================ */
const Router = {
    _pending: null,

    init(){
        let raw = null;
        try {
            raw = sessionStorage.getItem('__redirect_path__');
            if (raw) sessionStorage.removeItem('__redirect_path__');
        } catch {}
        if (!raw) raw = location.pathname + location.search + location.hash;
        const parsed = this.parse(raw);
        if (parsed){ parsed.raw = raw; this._pending = parsed; }
    },

    parse(raw){
        if (!raw || raw === '/' || raw.startsWith('/index.html')) return null;
        let url;
        try { url = new URL(raw, location.origin); }
        catch { url = new URL(location.origin + raw); }
        const path = url.pathname;
        const qs   = url.searchParams;

        if (qs.get('u'))       return { type:'profile', id: qs.get('u') };
        if (qs.get('profile')) return { type:'profile', id: qs.get('profile') };
        if (qs.get('post'))    return { type:'post',    id: qs.get('post'), track: qs.get('track') === '1' };
        if (qs.get('c'))       return { type:'channel', id: qs.get('c') };
        if (qs.get('live'))    return { type:'live',    id: qs.get('live') };

        let m;
        if ((m = path.match(/^\/@([A-Za-z0-9_.]+)$/))) return { type:'profile', username: m[1] };
        if ((m = path.match(/^\/(?:c|channel)\/([A-Za-z0-9_-]+)$/i))) return { type:'channel', code: m[1] };
        if ((m = path.match(/^\/(?:live)\/([A-Za-z0-9_-]+)$/i))) return { type:'live', code: m[1] };
        if ((m = path.match(/^\/(?:p|post)\/([A-Za-z0-9-]+)$/))) return { type:'post', id: m[1] };
        if ((m = path.match(/^\/([A-Z0-9]{5})$/i))) return { type:'code', code: m[1].toUpperCase() };

        return null;
    },

    async resolve(){
        const r = this._pending; this._pending = null;
        if (!r) return false;

        try {
            if (r.type === 'profile'){
                let id = r.id;
                if (!id && r.username){
                    const { data } = await supabase.from('profiles')
                        .select('id').eq('username', r.username.toLowerCase()).maybeSingle();
                    if (data) id = data.id;
                }
                if (id){ openUserProfile(id); this.replace(r.raw || urlFor('profile', r.username || id)); return true; }
            }

            if (r.type === 'post'){
                const ok = await openPostByRoute(r.id, { track: r.track });
                if (ok){ this.replace(r.raw || urlFor('post', r.id)); return true; }
            }

            if (r.type === 'channel'){
                let id = r.id;
                if (!id && r.code){
                    const { data } = await supabase.from('channels')
                        .select('id').eq('join_code', r.code.toUpperCase()).maybeSingle();
                    if (data) id = data.id;
                    else {
                        const { data: byId } = await supabase.from('channels')
                            .select('id').eq('id', r.code).maybeSingle();
                        if (byId) id = byId.id;
                    }
                }
                if (id){ await openChannel(id); this.replace(r.raw || urlFor('channel', id)); return true; }
            }

            if (r.type === 'live'){
                let id = r.id;
                if (!id && r.code){
                    const { data } = await supabase.from('lives')
                        .select('id').eq('join_code', r.code.toUpperCase())
                        .eq('is_active', true).maybeSingle();
                    if (data) id = data.id;
                    else {
                        const { data: byId } = await supabase.from('lives')
                            .select('id').eq('id', r.code).maybeSingle();
                        if (byId) id = byId.id;
                    }
                }
                if (id){ await openLiveRoom(id); this.replace(r.raw || urlFor('live', id)); return true; }
            }

            if (r.type === 'code'){
                const { data: ch } = await supabase.from('channels')
                    .select('id').eq('join_code', r.code).maybeSingle();
                if (ch){ await openChannel(ch.id); this.replace(r.raw); return true; }
                const { data: live } = await supabase.from('lives')
                    .select('id').eq('join_code', r.code).eq('is_active', true).maybeSingle();
                if (live){ await openLiveRoom(live.id); this.replace(r.raw); return true; }
            }
        } catch(e){ console.warn('[router]', e.message) }

        showToast('error', 'Ссылка не найдена или устарела', { icon:'⚠️' });
        this.replace('/');
        return false;
    },

    push(path){
        try { history.pushState({}, '', path) }
        catch (e){ console.warn('[router.push]', e.message, '→', path) }
    },
    replace(path){
        try { history.replaceState({}, '', path) }
        catch (e){ console.warn('[router.replace]', e.message, '→', path) }
    }
};

function urlFor(type, id){
    switch(type){
        case 'profile': return '/@' + id;
        case 'post':    return '/p/' + id;
        case 'channel': return '/c/' + id;
        case 'live':    return '/live/' + id;
    }
    return '/';
}

async function openPostByRoute(postId, opts = {}){
    const scrollToCard = () => {
        const card = document.querySelector(`.feed-post[data-pid="${postId}"]`);
        if (!card) return false;
        card.scrollIntoView({ behavior:'smooth', block:'center' });
        const prev = card.style.boxShadow;
        card.style.transition = 'box-shadow .4s';
        card.style.boxShadow = '0 0 0 3px var(--blue), 0 8px 32px rgba(10,132,255,.35)';
        setTimeout(() => { card.style.boxShadow = prev }, 2200);
        if (opts.track){
            const playBtn = card.querySelector('[data-action="toggle-play"]');
            playBtn?.click();
        }
        return true;
    };

    if (scrollToCard()) return true;

    const { data: post } = await supabase.from('posts')
        .select('id, channel_id, author_id').eq('id', postId).maybeSingle();
    if (!post){ showToast('error', 'Пост не найден', { icon:'⚠️' }); return false; }

    if (post.channel_id){
        await openChannel(post.channel_id);
        await new Promise(r => setTimeout(r, 600));
        return scrollToCard();
    } else {
        state.chatContext = 'global'; state.chatTitle = 'Global';
        switchScreen('inbox');
        openLiveChat('global', 'Global');
        await new Promise(r => setTimeout(r, 800));
        return scrollToCard();
    }
}

/* ============================================================
   TOAST
============================================================ */
function showToast(type, msg, opts = {}){
    const c = $('toast-container'); if(!c) return
    const t = document.createElement('div'); t.className = 'toast ' + type
    const iconHtml = type === 'loading' ? '<div class="toast-spinner"></div>' : (opts.icon || '')
    t.innerHTML = `<div class="toast-icon">${iconHtml}</div><div class="toast-text">${escapeHtml(msg)}</div>${opts.showTime !== false ? `<div class="toast-time">${escapeHtml(opts.time || 'сейчас')}</div>` : ''}${opts.dismissible !== false ? '<button class="toast-close">×</button>' : ''}`
    c.appendChild(t); requestAnimationFrame(() => t.classList.add('show'))
    const close = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 350) }
    t.querySelector('.toast-close')?.addEventListener('click', close)
    if(opts.duration !== 0) setTimeout(close, opts.duration || (type === 'error' ? 4000 : 3000))
    return { close, el:t }
}

/* ============================================================
   CODE MODAL
============================================================ */
function openEnterMenu(){
    showActionSheet('Войти', [
        { label:'Вступить по QR', icon: SVG.scan, onClick: () => openQrScanModal() },
        { label:'Найти канал', icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/></svg>', onClick: () => openCodeModalFor('channel') },
        { label:'Вступить в LIVE', icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2s4 3 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>', onClick: () => openCodeModalFor('live') },
        { label:'Найти профиль', icon: ICONS.person, onClick: () => openCodeModalFor('profile') }
    ])
}

let codeModalMode = 'live'
function openCodeModalFor(mode){
    codeModalMode = mode
    const modal = $('code-modal'), input = $('code-modal-input')
    const titleMap = { live:'Введите код LIVE', channel:'Введите код канала', profile:'Найти профиль' }
    const subMap = { live:'5 символов', channel:'5 символов', profile:'ID профиля или @ник' }
    const btnMap = { live:'Войти в LIVE', channel:'Войти в канал', profile:'Найти' }
    const titleEl = modal.querySelector('.code-modal-title')
    const subEl = modal.querySelector('.code-modal-sub')
    if(titleEl) titleEl.textContent = titleMap[mode] || 'Введите код'
    if(subEl) subEl.textContent = subMap[mode] || '5 символов'
    const submitBtn = $('code-modal-submit')
    if(submitBtn) submitBtn.textContent = btnMap[mode] || 'Продолжить'
    modal.classList.remove('hidden')
    input.value = ''
    input.maxLength = mode === 'profile' ? 30 : 5
    input.style.fontSize = mode === 'profile' ? '22px' : '36px'
    input.style.letterSpacing = mode === 'profile' ? '2px' : '12px'
    input.placeholder = mode === 'profile' ? '@username или ID' : ''
    setTimeout(() => input.focus(), 100)
    const close = () => modal.classList.add('hidden')
    input.oninput = () => {
        if(mode === 'profile') input.value = input.value.replace(/[^A-Za-z0-9_.@]/g, '')
        else input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
    }
    const submit = async () => {
        const code = input.value.trim()
        if(mode !== 'profile' && code.length < 5){ showToast('error', 'Неверный код', { icon:'⚠️' }); return }
        if(!code){ showToast('error', 'Введите код', { icon:'⚠️' }); return }
        close()
        const loadToast = showToast('loading', 'Проверяем...', { dismissible:false, duration:0 })
        try {
            if(mode === 'profile'){
                const clean = code.replace(/^@/, '')
                let targetId = null
                const { data:p1 } = await supabase.from('profiles').select('id').eq('public_id', clean.toUpperCase()).maybeSingle()
                if(p1) targetId = p1.id
                else { const { data:p2 } = await supabase.from('profiles').select('id').eq('username', clean.toLowerCase()).maybeSingle(); if(p2) targetId = p2.id }
                await new Promise(r => setTimeout(r, 500)); loadToast.close()
                if(targetId){ showToast('success', 'Профиль найден', { icon:'✓' }); setTimeout(() => openUserProfile(targetId), 250) }
                else showToast('error', 'Профиль не найден', { icon:'⚠️' })
                return
            }
            const table = mode === 'live' ? 'lives' : 'channels'
            let q = supabase.from(table).select('id').eq('join_code', code.toUpperCase())
            if(mode === 'live') q = q.eq('is_active', true)
            const { data } = await q.maybeSingle()
            await new Promise(r => setTimeout(r, 700)); loadToast.close()
            if(data){ showToast('success', 'Код принят!', { icon:'✓' }); setTimeout(() => mode === 'live' ? openLiveRoom(data.id) : openChannel(data.id), 300) }
            else showToast('error', 'Неверный код', { icon:'⚠️' })
        } catch(e){ loadToast.close(); showToast('error', 'Неверный код', { icon:'⚠️' }) }
    }
    submitBtn.onclick = submit
    $('code-modal-cancel').onclick = close
    $('code-modal-backdrop').onclick = close
    input.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); submit() } }
}

/* ============================================================
   SCREENS
============================================================ */
const bootScreen = $('boot-screen')
const screens = {
    auth:$('auth-screen'), karsq:$('karsq-screen'), reset:$('reset-screen'),
    'register-landing':$('register-landing-screen'), register:$('register-screen'),
    loading:$('loading-screen')
}
const mainApp = $('main-app')
function showScreen(name){
    Object.values(screens).forEach(s => s?.classList.add('hidden'))
    mainApp.classList.add('hidden')

    if(name === 'main'){
        mainApp.classList.remove('hidden')
        setPageBg()
        return
    }
    if(screens[name]) screens[name].classList.remove('hidden')

    if(name === 'register-landing'){
        setPageBg(false)
    } else if(name === 'auth' || name === 'karsq' || name === 'reset'){
        setPageBg(true)
    } else if(name === 'register'){
        setPageBg()
    } else {
        setPageBg()
    }
}

let livechatRefreshTimer = null
function switchScreen(name){
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'))
    const t = document.getElementById('screen-' + name)
    if(t) t.classList.add('active')
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name))
    state.screen = name; window.scrollTo(0, 0)
    if(name === 'inbox') renderEventsScreen()
    if(name === 'profile'){
        if(state.currentProfileViewId) loadProfile(state.currentProfileViewId)
        else { state.viewingOwnProfile = true; loadProfile() }
    }
    if(name === 'settings') loadSettings()
    if(name === 'home'){ renderLiveNow(); renderStories(); renderHomeFeed() }
    if(name === 'channels') renderChannels()
    if(name !== 'livechat' && livechatRefreshTimer){ clearInterval(livechatRefreshTimer); livechatRefreshTimer = null }
    setTimeout(() => { updatePlayIcons(); syncFullPlayer(); }, 50)
    refreshFollowCache().then(() => {
        document.querySelectorAll('.feed-sub-btn').forEach(btn => {
            const isSub = state.myChannelSubs.has(btn.dataset.chid)
            btn.classList.toggle('subscribed', isSub)
            btn.innerHTML = isSub
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12l5 5 9-11"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
        })
    })
}
document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => {
    const s = b.dataset.screen
    if(s === 'profile'){ state.currentProfileViewId = null; state.viewingOwnProfile = true }
    switchScreen(s)
}))

/* ============================================================
   SIDEBAR
============================================================ */
const sidebar = $('sidebar'), sidebarBackdrop = $('sidebar-backdrop')
function openSidebar(){ sidebar.classList.add('open'); sidebarBackdrop.classList.remove('hidden') }
function closeSidebar(){ sidebar.classList.remove('open'); sidebarBackdrop.classList.add('hidden') }
sidebarBackdrop.addEventListener('click', closeSidebar)
$('sidebar-close').addEventListener('click', closeSidebar)
document.addEventListener('click', e => {
    if(e.target.closest('[data-menu="open"]')){ openSidebar(); return }
    if(e.target.closest('[data-prioriti="open"]')){ openPrioriti(); return }
    if(e.target.closest('#live-code-btn')){ openEnterMenu(); return }
})
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        const a = item.dataset.action
        closeSidebar()
        if(a === 'home'){ state.currentProfileViewId = null; state.viewingOwnProfile = true; return switchScreen('home') }
        if(a === 'direct') return openDirectTab()
        if(a === 'profile'){ state.currentProfileViewId = null; state.viewingOwnProfile = true; return switchScreen('profile') }
        if(a === 'inbox') return switchScreen('inbox')
        if(a === 'channels') return switchScreen('channels')
        if(a === 'music') return switchScreen('music')
        if(a === 'storr') return openPrioriti()
        if(a === 'live'){ return switchScreen('inbox') }
        if(a === 'ai') return showToast('info','AI — скоро',{icon:'🤖'})
        if(a === 'lang') return openLangModal()
        if(a === 'settings') return switchScreen('settings')
        if(a === 'privacy'){ switchScreen('settings'); switchSettingsTab('privacy'); return }
        if(a === 'additional'){
            showActionSheet('Дополнительно', [
                { label:'Экранное время', onClick:() => showToast('info','Скоро',{icon:'⏱'}) },
                { label:'Очистить кэш', onClick:() => { localStorage.removeItem('lt_cache'); showToast('success','Кэш очищен',{icon:'✓'}) } },
                { label:'Центр обновлений', onClick:() => showToast('info','Скоро',{icon:'🔄'}) }
            ])
            return
        }
        if(a === 'help-support') return showToast('info','support@listatread.online',{icon:'✉️'})
        if(a === 'help-terms')    return window.open('/terms','_blank')
        if(a === 'help-policy')   return window.open('/policy','_blank')
        if(a === 'help-rules')    return window.open('/rules','_blank')
        if(a === 'help-cookie')   return window.open('/cookie','_blank')
        if(a === 'help-about')    return showToast('info','listatread.online · v15',{icon:'ℓ'})
        if(a === 'karsq') return showScreen('karsq')
    })
})
$('sidebar-logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    closeSidebar(); showScreen('auth'); $('login-form').reset(); $('login-error').textContent = ''
})

/* ============================================================
   STORR
============================================================ */
const prioritiSheet = $('prioriti-sheet'), prioritiBackdrop = $('prioriti-backdrop')
function openPrioriti(){ prioritiSheet.classList.add('open'); prioritiBackdrop.classList.remove('hidden') }
function closePrioriti(){ prioritiSheet.classList.remove('open'); prioritiBackdrop.classList.add('hidden') }
prioritiBackdrop.addEventListener('click', closePrioriti)
$('storr-gifts-btn')?.addEventListener('click', () => { closePrioriti(); alert('Магазин подарков и клигов — скоро') })
$('storr-chvad-btn')?.addEventListener('click', () => { closePrioriti(); alert('Подписка listatread chvad — скоро') })

/* ============================================================
   ACTIONSHEET
============================================================ */
const actionsheet = $('actionsheet'), actionsheetBackdrop = $('actionsheet-backdrop'),
    actionsheetTitle = $('actionsheet-title'), actionsheetList = $('actionsheet-list')

const ICONS = {
    trash:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>',
    flag:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V4a1 1 0 0 1 1-1h11l-1 4h6l-1 4h-11"/></svg>',
    reply:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 17l-5-5 5-5M4 12h11a5 5 0 0 1 5 5v2"/></svg>',
    send:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    link:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7 0l4-4a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-4 4a5 5 0 0 0 7 7l1-1"/></svg>',
    gift:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8s-2-5-5-5-1 5 5 5zM12 8s2-5 5-5 1 5-5 5z"/></svg>',
    share:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    person:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
    dots:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
    check:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12l5 5 9-11"/></svg>',
    heart:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    heartFill:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    comment:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    repost:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    star:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2l2.9 6.9L22 9.6l-5.5 4.8 1.7 7.1L12 17.8 5.8 21.5l1.7-7.1L2 9.6l7.1-.7z"/></svg>',
    fullscreen:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>',
    filter:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
    plus:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    checkSmall:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12l5 5 9-11"/></svg>',
    minus:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    thumbUp:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
    thumbDown:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>'
}

function showActionSheet(title, items){
    actionsheetTitle.textContent = title
    actionsheetList.innerHTML = items.map((it, i) => `<button class="actionsheet-item ${it.danger ? 'danger' : ''}" data-idx="${i}">${it.icon || ''}<span>${it.label}</span></button>`).join('')
    actionsheetList.querySelectorAll('.actionsheet-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const it = items[+btn.dataset.idx]; closeActionSheet()
            if(it.onClick) setTimeout(it.onClick, 100)
        })
    })
    actionsheet.classList.add('open'); actionsheetBackdrop.classList.remove('hidden')
}
window.showActionSheet = showActionSheet
window.showToast = showToast
function closeActionSheet(){ actionsheet.classList.remove('open'); actionsheetBackdrop.classList.add('hidden') }
actionsheetBackdrop.addEventListener('click', closeActionSheet)
$('actionsheet-cancel').addEventListener('click', closeActionSheet)

/* ============================================================
   PWD TOGGLE
============================================================ */
document.querySelectorAll('.pwd-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const inp = document.getElementById(btn.dataset.target); if(!inp) return
        const isPwd = inp.type === 'password'
        inp.type = isPwd ? 'text' : 'password'; btn.textContent = isPwd ? '🙈' : '👁'
    })
})

/* ============================================================
   AUTH
============================================================ */
$('login-form').addEventListener('submit', async e => {
    e.preventDefault()
    const errEl = $('login-error'); errEl.textContent = ''
    const email = $('login-email').value.trim(), password = $('login-password').value
    if(!email || !password){ errEl.textContent = 'Заполните email и пароль'; return }
    const btn = $('login-btn'); btn.disabled = true; btn.textContent = 'Входим...'
    try {
        const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 15000, 'signIn')
        if(error) throw error
        await enterApp()
        const uname = data?.user?.email?.split('@')[0] || 'user'
        showToast('success', 'Вход в аккаунт @' + uname + ' успешно выполнен', { icon:'✓' })
    } catch(err){
        let m = err.message || 'Неверный email или пароль'
        if(m.includes('Timeout')) m = 'Превышено время ожидания'
        errEl.textContent = m
    } finally { btn.disabled = false; btn.textContent = 'Вход' }
})

$('karsq-btn').addEventListener('click', () => { $('karsq-error').textContent=''; $('karsq-email').value=''; $('karsq-password').value=''; showScreen('karsq') })
$('karsq-back').addEventListener('click', () => showScreen('auth'))
$('karsq-continue').addEventListener('click', () => {
    if(!$('karsq-email').value.trim()){ $('karsq-error').textContent = 'Введите почту'; return }
    $('karsq-error').textContent = 'Аккаунт karsq не найден'
})
document.querySelectorAll('.karsq-method').forEach(b => b.addEventListener('click', () => $('karsq-error').textContent = 'Аккаунт не поддерживает метод'))

$('forgot-password').addEventListener('click', () => {
    $('reset-step-1').classList.remove('hidden'); $('reset-step-2').classList.add('hidden')
    $('reset-error').textContent = ''; $('reset-email').value = ''; showScreen('reset')
})
$('reset-back').addEventListener('click', () => showScreen('auth'))
$('reset-karsq-btn').addEventListener('click', () => { $('reset-hint').textContent='Сброс karsq'; $('reset-step-1').classList.add('hidden'); $('reset-step-2').classList.remove('hidden') })
$('reset-lt-btn').addEventListener('click', () => { $('reset-hint').textContent='Сброс listatread'; $('reset-step-1').classList.add('hidden'); $('reset-step-2').classList.remove('hidden') })

$('go-register-btn').addEventListener('click', () => {
    showScreen('register-landing')
    const stage = $('logo-stage'); stage.classList.remove('animate'); void stage.offsetWidth
    requestAnimationFrame(() => stage.classList.add('animate'))
})
$('reg-landing-back').addEventListener('click', () => showScreen('auth'))
$('create-account-btn').addEventListener('click', () => startRegistration())
$('find-account-btn').addEventListener('click', () => alert('В разработке'))

$('github-btn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider:'github', options:{ redirectTo: location.origin + location.pathname } })
    if(error) alert('GitHub вход не настроен: ' + error.message)
})
$('apple-btn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider:'apple', options:{ redirectTo: location.origin + location.pathname } })
    if(error) alert('Apple вход не настроен: ' + error.message)
})
$('telegram-btn').addEventListener('click', () => alert('Telegram скоро'))
$('email-btn').addEventListener('click', () => alert('Используйте форму'))

/* ============================================================
   REGISTRATION
============================================================ */
function startRegistration(){
    state.step = 1
    state.data = { email:'', password:'', fullName:'', username:'', avatarFile:null, bio:'', socials:{}, gender:null, region:null, birthday:null, method:'skip', codeVerified:false, settings:{}, status:'default', theme:'light' }
    clearRegForm(); updateStep(); showScreen('register')
}
function clearRegForm(){
    $('reg-email').value=''; $('reg-name').value=''; $('reg-password').value=''; $('reg-username').value=''
    $('reg-bio').value=''; $('reg-birthday').value=''; $('reg-code').value=''; $('reg-avatar').value=''
    $('avatar-img').hidden = true; $('avatar-img').src = ''; $('avatar-placeholder').hidden = false
    $('code-checkmark').classList.remove('show'); $('verify-code-btn').classList.remove('hidden')
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'))
    document.querySelector('.method-btn[data-method="skip"]')?.classList.add('active')
    document.querySelectorAll('.social-input input').forEach(i => i.value = '')
    document.querySelectorAll('.social-input').forEach(el => el.classList.remove('valid', 'invalid'))
    document.querySelectorAll('.pwd-check').forEach(el => el.classList.remove('pass'))
    document.querySelectorAll('.reg-consent input').forEach(cb => { cb.checked = false; cb.closest('.reg-consent')?.classList.remove('checked') })
    const rf = $('region-flag'), rn = $('region-name'); if(rf) rf.textContent = '◯'; if(rn) rn.textContent = 'Выберите регион'
    updateMethodInfo('skip')
    applyTheme('light')
}
function updateStep(){
    document.querySelectorAll('.reg-step').forEach(step => {
        const n = +step.dataset.step
        step.classList.remove('active', 'prev')
        if(n === state.step) step.classList.add('active'); else if(n < state.step) step.classList.add('prev')
    })
    $('steps-bar').style.width = (state.step / state.totalSteps * 100) + '%'
    if(state.step >= 5) $('reg-back-arrow').classList.add('hidden'); else $('reg-back-arrow').classList.remove('hidden')
    const btn = $('reg-next')
    btn.disabled = state.step === 5 && !state.data.codeVerified
    btn.textContent = state.step === state.totalSteps ? 'Завершить' : 'Продолжить'
    $('reg-error').textContent = ''
    if(state.step === 5) $('verify-email-display').textContent = state.data.email
}
$('reg-back-arrow').addEventListener('click', () => { if(state.step > 1){ state.step--; updateStep() } else showScreen('register-landing') })

function validateStep(){
    const errEl = $('reg-error'); errEl.textContent = ''
    const s = state.step
    if(s === 1){
        const email = $('reg-email').value.trim()
        if(!/^[^\s@]{2,}@gmail\.com$/i.test(email)){
            errEl.textContent = 'Почта должна быть вида name@gmail.com (минимум 2 символа до @)'
            return false
        }
        const terms = document.querySelector('[data-consent="terms"]')?.checked
        const privacy = document.querySelector('[data-consent="privacy"]')?.checked
        const rules = document.querySelector('[data-consent="rules"]')?.checked
        if(!terms || !privacy || !rules){
            errEl.textContent = 'Подтвердите все три пункта ниже'
            return false
        }
        state.data.email = email
    }
    if(s === 2){
        const name = $('reg-name').value.trim()
        if(name.length < 2){ errEl.textContent = 'Введите имя'; return false }
        if(!state.data.gender){ errEl.textContent = 'Выберите пол'; return false }
        if(!state.data.region){ errEl.textContent = 'Выберите регион'; return false }
        const bd = $('reg-birthday').value
        if(!bd){ errEl.textContent = 'Укажите дату'; return false }
        const year = parseInt(bd.split('-')[0], 10)
        if(year < 1950 || year > 2014){ errEl.textContent = 'Дата должна быть между 1950 и 2014'; return false }
        state.data.fullName = name; state.data.birthday = bd
    }
    if(s === 3){
        const pwd = $('reg-password').value
        if(!isPasswordStrong(pwd)){ errEl.textContent = 'Пароль не соответствует требованиям'; return false }
        if(/[А-Яа-яЁё]/.test(pwd)){ errEl.textContent = 'Пароль должен содержать только латинские буквы'; return false }
        if(pwd.length > 30){ errEl.textContent = 'Пароль не должен превышать 30 символов'; return false }
        state.data.password = pwd
        state.data.method = document.querySelector('.method-btn.active')?.dataset.method || 'skip'
    }
    if(s === 4){
        const u = $('reg-username').value.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')
        $('reg-username').value = u
        if(u.length < 3){ errEl.textContent = 'Никнейм минимум 3 символа'; return false }
        state.data.username = u; state.data.bio = $('reg-bio').value.trim()
        const socials = {}; let invalid = false
        document.querySelectorAll('.social-input').forEach(wrap => {
            const key = wrap.dataset.key, val = wrap.querySelector('input').value.trim()
            if(!val) return
            const meta = SOCIALS.find(x => x.key === key)
            if(key === 'email'){ if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) invalid = true; else socials[key] = val }
            else { if(!val.toLowerCase().includes(meta.domain)) invalid = true; else socials[key] = val }
        })
        if(invalid){ errEl.textContent = 'Проверьте ссылки'; return false }
        state.data.socials = socials
    }
    if(s === 5 && !state.data.codeVerified){ errEl.textContent = 'Сначала нажмите Проверить'; return false }
    return true
}

$('reg-next').addEventListener('click', async () => {
    if(!validateStep()) return

    if(state.step === 1){
        const btn = $('reg-next'); btn.disabled = true; btn.textContent = 'Проверяем...'
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: state.data.email,
                options: { shouldCreateUser: false }
            })
            const emailTaken = error && !/not found|User.*not.*exist|Signups not allowed|Signups not allowed for otp/i.test(error.message || '')
            if(emailTaken || !error){
                btn.disabled = false; btn.textContent = 'Продолжить'
                $('reg-error').textContent = 'Этот email уже зарегистрирован'
                return
            }
        } catch(e){ console.warn('[email check]', e.message) }
        btn.disabled = false; btn.textContent = 'Продолжить'
    }

    if(state.step === 4){
        const btn = $('reg-next'); btn.disabled = true
        try {
            const { data } = await withTimeout(supabase.from('profiles').select('id').eq('username', state.data.username).maybeSingle(), 8000, 'check')
            if(data){ btn.disabled = false; $('reg-error').textContent = 'Никнейм занят'; return }
        } catch {}
        btn.disabled = false
    }
    if(state.step === state.totalSteps){ await completeRegistration(); return }
    state.step++; updateStep()
})

$('gender-row').addEventListener('click', e => {
    const btn = e.target.closest('.gender-btn'); if(!btn) return
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active'); state.data.gender = btn.dataset.gender
})

const METHOD_INFO = {
    skip:   { icon:'⏭', text:'Пропустить' },
    faceid: { icon:'◉', text:'FaceID — временно недоступно' },
    qr:     { icon:'▢', text:'QR — временно недоступно' },
    gid:    { icon:'⬡', text:'GID — временно недоступно' }
}
function updateMethodInfo(m){ const i = METHOD_INFO[m] || METHOD_INFO.skip; $('method-info').innerHTML = `<div class="method-info-icon">${i.icon}</div><div class="method-info-text">${i.text}</div>` }
$('method-slider').addEventListener('click', e => {
    const btn = e.target.closest('.method-btn'); if(!btn) return
    document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active'); state.data.method = btn.dataset.method; updateMethodInfo(btn.dataset.method)
})

function checkPasswordRules(p){
    return {
        length:  p.length >= 8,
        maxLen:  p.length <= 30,
        upper:   /[A-Z]/.test(p),
        lower:   /[a-z]/.test(p),
        digit:   /[0-9]/.test(p),
        special: /[^A-Za-z0-9]/.test(p),
        latin:   !/[А-Яа-яЁё]/.test(p)
    }
}
function isPasswordStrong(p){ return Object.values(checkPasswordRules(p)).every(v => v) }
$('reg-password').addEventListener('input', () => {
    const r = checkPasswordRules($('reg-password').value)
    document.querySelectorAll('.pwd-check').forEach(el => el.classList.toggle('pass', !!r[el.dataset.rule]))
})
$('reg-avatar').addEventListener('change', e => {
    const f = e.target.files?.[0]; if(!f) return
    state.data.avatarFile = f
    $('avatar-img').src = URL.createObjectURL(f); $('avatar-img').hidden = false; $('avatar-placeholder').hidden = true
})
$('reg-code').addEventListener('input', () => {
    if(state.data.codeVerified){ state.data.codeVerified = false; $('code-checkmark').classList.remove('show'); $('verify-code-btn').classList.remove('hidden'); $('reg-next').disabled = true }
    $('reg-error').textContent = ''
})
$('verify-code-btn').addEventListener('click', () => {
    if($('reg-code').value.trim().length < 4){ $('reg-error').textContent = 'Введите код'; return }
    state.data.codeVerified = true; $('code-checkmark').classList.add('show'); $('verify-code-btn').classList.add('hidden'); $('reg-next').disabled = false
})

/* Чекбоксы согласий */
document.querySelectorAll('.reg-consent input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        cb.closest('.reg-consent')?.classList.toggle('checked', cb.checked)
    })
})

function renderSocialInputs(){
    const box = $('social-inputs')
    box.innerHTML = SOCIALS.map(s => `<div class="social-input" data-key="${s.key}"><div class="social-input-icon" style="background:${s.bg}">${s.svg}</div><input type="text" placeholder="${s.placeholder}"></div>`).join('')
    box.querySelectorAll('.social-input').forEach(wrap => {
        const input = wrap.querySelector('input'), key = wrap.dataset.key
        input.addEventListener('input', () => {
            const v = input.value.trim(), meta = SOCIALS.find(x => x.key === key)
            wrap.classList.remove('valid', 'invalid'); if(!v) return
            if(key === 'email') wrap.classList.add(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'valid' : 'invalid')
            else wrap.classList.add(v.toLowerCase().includes(meta.domain) ? 'valid' : 'invalid')
        })
    })
}
renderSocialInputs()

/* ============================================================
   PART 2 / 3 — uploadAvatar() → renderProfileTracks()
============================================================ */

async function uploadAvatar(userId, file){
    const buckets = ['avatars', 'posts', 'channels']
    for(const bucket of buckets){
        try {
            const ext = file.name.split('.').pop() || 'jpg'
            const path = `${userId}/avatar-${Date.now()}.${ext}`
            const { error:upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert:true, contentType:file.type })
            if(upErr) continue
            const { data:pub } = supabase.storage.from(bucket).getPublicUrl(path)
            if(!pub?.publicUrl) continue
            const { error:updErr } = await supabase.from('profiles').update({ avatar_url:pub.publicUrl }).eq('id', userId)
            if(updErr) continue
            return pub.publicUrl
        } catch(e){ console.warn('[avatar]', bucket, e.message) }
    }
    return null
}

async function completeRegistration(){
    const btn = $('reg-next'); btn.disabled = true; btn.textContent = 'Создаём...'
    try {
        const regTheme = document.querySelector('#reg-theme-picker .theme-choice.active')?.dataset.theme || 'light'
        applyTheme(regTheme)

        const { data, error } = await withTimeout(supabase.auth.signUp({
            email: state.data.email, password: state.data.password,
            options: { data: { full_name:state.data.fullName, username:state.data.username, bio:state.data.bio, socials:state.data.socials, gender:state.data.gender, region:state.data.region, birthday:state.data.birthday, theme:regTheme } }
        }), 20000, 'signUp')
        if(error) throw error
        if(!data.session){ try { await withTimeout(supabase.auth.signInWithPassword({ email:state.data.email, password:state.data.password }), 15000, 'signIn') } catch {} }
        if(state.data.avatarFile && data.user){ await uploadAvatar(data.user.id, state.data.avatarFile) }
        showScreen('loading')
        $('loading-text').textContent = 'Почти готово...'
        await new Promise(r => setTimeout(r, 1800))
        await enterApp()
        showToast('success', 'Аккаунт @' + state.data.username + ' успешно создан', { icon:'✓' })
    } catch(err){
        let m = err.message || 'Не удалось создать аккаунт'
        if(m.includes('Timeout')) m = 'Превышено время ожидания'
        if(m.toLowerCase().includes('already registered')) m = 'Email уже зарегистрирован'
        $('reg-error').textContent = 'Ошибка: ' + m
        btn.disabled = false; btn.textContent = 'Завершить'
    }
}

/* ============================================================
   LANG / REGION
============================================================ */
let currentLang = localStorage.getItem('lang') || 'en'
const langModal = $('lang-modal'), langList = $('lang-list')
const regionModal = $('region-modal'), regionList = $('region-list')

function renderLangList(){
    langList.innerHTML = LANGUAGES.map(l => `<button class="lang-item ${l.code === currentLang ? 'active' : ''}" data-code="${l.code}"><span class="lang-item-flag">${l.flag}</span><span>${l.name}</span>${l.code === currentLang ? '<span class="lang-item-check">✓</span>' : ''}</button>`).join('')
    langList.querySelectorAll('.lang-item').forEach(b => b.addEventListener('click', () => {
        currentLang = b.dataset.code; localStorage.setItem('lang', currentLang)
        $('current-lang-flag').textContent = LANGUAGES.find(x => x.code === currentLang)?.flag || '🇬🇧'
        $('current-lang-name').textContent = LANGUAGES.find(x => x.code === currentLang)?.name || 'English'
        renderLangList(); closeLangModal()
    }))
}
function openLangModal(){ langModal.classList.remove('hidden') }
function closeLangModal(){ langModal.classList.add('hidden') }
$('lang-selector').addEventListener('click', openLangModal)
$('lang-backdrop').addEventListener('click', closeLangModal)

function renderRegionList(){
    regionList.innerHTML = COUNTRIES.map(c => `<button class="lang-item ${state.data.region === c.code ? 'active' : ''}" data-code="${c.code}"><span class="lang-item-flag">${c.flag}</span><span>${c.name}</span>${state.data.region === c.code ? '<span class="lang-item-check">✓</span>' : ''}</button>`).join('')
    regionList.querySelectorAll('.lang-item').forEach(b => b.addEventListener('click', () => {
        const c = COUNTRIES.find(x => x.code === b.dataset.code); if(!c) return
        state.data.region = c.code
        $('region-flag').textContent = c.flag; $('region-name').textContent = c.name
        closeRegionModal()
    }))
}
function openRegionModal(){ renderRegionList(); regionModal.classList.remove('hidden') }
function closeRegionModal(){ regionModal.classList.add('hidden') }
$('region-btn').addEventListener('click', openRegionModal)
$('region-backdrop').addEventListener('click', closeRegionModal)
renderLangList()

/* ============================================================
   STATUS
============================================================ */
async function saveStatus(code){
    try {
        const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
        try { await supabase.from('profiles').update({ status:code, status_emoji:code }).eq('id', user.id) }
        catch { await supabase.from('profiles').update({ status:code }).eq('id', user.id) }
        state.data.status = code
        const dot = $('status-dot'), lbl = $('status-label')
        if(dot) dot.textContent = statusEmoji(code)
        if(lbl) lbl.textContent = 'Статус: ' + statusLabel(code)
        showToast('success', 'Статус обновлён', { icon:statusEmoji(code) })
        renderSettingsStatusGrid()
    } catch(e){ console.warn(e) }
}
async function loadStatus(){
    try {
        const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
        const { data:profile } = await supabase.from('profiles').select('status, status_emoji').eq('id', user.id).maybeSingle()
        const code = profile?.status_emoji || profile?.status || 'default'
        state.data.status = code
        const dot = $('status-dot'), lbl = $('status-label')
        if(dot) dot.textContent = statusEmoji(code)
        if(lbl) lbl.textContent = 'Статус: ' + statusLabel(code)
    } catch {}
}
function renderSettingsStatusGrid(){
    const grid = $('settings-status-grid'); if(!grid) return
    grid.innerHTML = STATUSES.map(s => `<button class="status-item ${state.data.status === s.code ? 'active' : ''}" data-code="${s.code}"><div class="status-item-emoji">${s.emoji}</div><div class="status-item-label">${s.label}</div></button>`).join('')
    grid.querySelectorAll('.status-item').forEach(b => b.addEventListener('click', () => saveStatus(b.dataset.code)))
}
document.querySelectorAll('#status-current').forEach(btn => {
    btn.addEventListener('click', () => {
        closeSidebar(); switchScreen('settings'); switchSettingsTab('general')
        setTimeout(() => $('settings-status-grid')?.scrollIntoView({ behavior:'smooth', block:'center' }), 200)
    })
})

/* ============================================================
   STORIES
============================================================ */
async function renderStories(){
    const row = $('stories-row'); if(!row) return
    row.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
        const { data:follows } = await supabase.from('follows').select('following_id, profiles:following_id ( id, username, full_name, avatar_url, status, is_admin )').eq('follower_id', user.id)
        const people = (follows || []).map(f => f.profiles).filter(Boolean)
        let html = `<button class="story story-add" id="find-people-btn"><div class="story-ring"><div class="story-ring-inner">+</div></div><div class="story-name">Найти людей</div></button>`
        people.forEach(p => {
            const name = p.full_name || p.username || 'user'
            const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
            const emoji = statusEmoji(computeDisplayStatus(p))
            html += `<button class="story" data-uid="${p.id}"><div class="story-ring"><div class="story-ring-inner">${av}</div><div class="story-status-badge">${emoji}</div></div><div class="story-name">${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</div></button>`
        })
        row.innerHTML = html
        $('find-people-btn').addEventListener('click', () => alert('Поиск людей — скоро'))
        row.querySelectorAll('.story[data-uid]').forEach(btn => btn.addEventListener('click', () => openUserProfile(btn.dataset.uid)))
    } catch { row.innerHTML = '<p class="empty small">Не удалось загрузить</p>' }
}

/* ============================================================
   LIVE NOW
============================================================ */
async function renderLiveNow(){
    const row = $('live-now-row'); if(!row) return
    row.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const { data:mySubs } = await supabase.from('subscriptions').select('channel_id').eq('follower_id', user.id)
        const subIds = (mySubs || []).map(s => s.channel_id)
        const { data:myChannels } = await supabase.from('channels').select('id').eq('owner_id', user.id)
        const myIds = (myChannels || []).map(c => c.id)
        const allIds = [...new Set([...subIds, ...myIds])]
        let query = supabase.from('lives').select('id, title, type, channels:channel_id ( id, name, avatar_url )').eq('is_active', true).order('created_at', { ascending:false }).limit(10)
        if(allIds.length) query = query.in('channel_id', allIds)
        const { data:lives } = await query
        if(lives && lives.length){
            row.innerHTML = lives.map(l => {
                const ch = l.channels || {}
                const name = ch.name || 'Канал'
                const av = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
                return `<div class="live-avatar-wrap" data-live="${l.id}"><div class="live-avatar"><div class="live-avatar-top">LIVE</div><div class="live-avatar-inner">${av}<div class="live-bars"><span></span><span></span><span></span></div></div></div><div class="live-avatar-name">${escapeHtml(name)}</div></div>`
            }).join('')
            row.querySelectorAll('.live-avatar-wrap[data-live]').forEach(el => el.addEventListener('click', () => openLiveRoom(el.dataset.live)))
        } else {
            const regionObj = COUNTRIES.find(c => c.code === state.data.region)
            const regionLabel = regionObj ? regionObj.name : 'ваш регион'
            row.innerHTML = `<button class="live-now-card empty" id="live-now-empty"><div class="live-now-card-bars"><span></span><span></span><span></span></div><span class="live-now-pill">LIVE</span><div><div class="live-now-title">Пока нет live</div><div class="live-now-sub">Присоединитесь к лайв чату · ${escapeHtml(regionLabel)}</div></div></button>`
            $('live-now-empty')?.addEventListener('click', () => openLiveChat('region', regionObj ? `${regionObj.flag} ${regionObj.name}` : 'Регион'))
        }
    } catch { row.innerHTML = '<p class="empty small">Ошибка</p>' }
}

/* ============================================================
   HOME FEED
============================================================ */
async function renderHomeFeed(){
    const list = $('feed-list'); if(!list) return
    teardownInfinite()
    list.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        await refreshFollowCache()
        const tab = state.feedTab

        if(tab === 'recommended'){
            state.recBuffer = []
            state.recCursor = 0
            state.recShownIds = new Set()
            state.recLoading = false

            const posts = await loadPosts(user?.id)
            if(!posts || !posts.length){
                list.innerHTML = '<p class="empty">Пока нет публикаций</p>'
                return
            }
            state.recBuffer = posts
            list.innerHTML = ''
            setupInfinite(list, user?.id)
            await appendRecommendedChunk(list, user?.id, 5)
            return
        }

        let query = supabase.from('posts')
            .select('id, content, created_at, author_id, channel_id, media_url, media_title, profiles ( username, full_name, avatar_url, status, is_admin ), channels:channel_id ( id, name, avatar_url )')
            .not('channel_id', 'is', null)

        if(tab === 'video') query = query.order('created_at', { ascending:false }).limit(60)
        else if(tab === 'subs'){
            const { data:fol } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
            const ids = (fol || []).map(f => f.following_id)
            if(!ids.length){ list.innerHTML = '<p class="empty">Вы ни на кого не подписаны</p>'; return }
            query = query.in('author_id', ids).order('created_at', { ascending:false }).limit(30)
        } else if(tab === 'my'){
            const { data:subs } = await supabase.from('subscriptions').select('channel_id').eq('follower_id', user.id)
            const ids = (subs || []).map(s => s.channel_id)
            if(!ids.length){ list.innerHTML = '<p class="empty">Вы не подписаны ни на один канал</p>'; return }
            query = query.in('channel_id', ids).order('created_at', { ascending:false }).limit(30)
        } else {
            query = query.order('created_at', { ascending:false }).limit(30)
        }

        const { data, error } = await withTimeout(query, 12000, 'home')
        if(error || !data || !data.length){ list.innerHTML = '<p class="empty">Пока нет публикаций</p>'; return }

        let filtered = data
        if(tab === 'video') filtered = data.filter(p => isVideoUrl(p.media_url))
        if(!filtered.length){ list.innerHTML = '<p class="empty">Видео пока нет</p>'; return }

        const postIds = filtered.map(p => p.id)
        const [{ data:likes }, { data:reps }, counts] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
            supabase.from('reposts').select('post_id').eq('user_id', user.id).in('post_id', postIds),
            fetchCounts(postIds)
        ])
        const likedIds = new Set((likes || []).map(l => l.post_id))
        const repostedIds = new Set((reps || []).map(r => r.post_id))
        const contextMap = { recommended:'ваши рекомендации', video:'видео для вас', subs:'от подписок', my:'мои каналы' }
        const ctx = contextMap[tab] || 'ваши рекомендации'
        list.innerHTML = filtered.map(p => renderChannelPost(p, user?.id, likedIds, repostedIds, counts, ctx)).join('')
        likedIds.forEach(pid => syncPostLike(pid, true, 0))
        repostedIds.forEach(pid => syncPostRepost(pid, true, 0))
        attachFeedActions(list, user?.id)
        setTimeout(initTrackObserver, 100)
    } catch(e){
        console.warn('[renderHomeFeed]', e.message)
        list.innerHTML = '<p class="empty">Пока нет публикаций</p>'
    }
}

/* ============================================================
   БЕСКОНЕЧНАЯ ЛЕНТА РЕКОМЕНДАЦИЙ
============================================================ */
function teardownInfinite(){
    if(state.recObserver){ state.recObserver.disconnect(); state.recObserver = null }
    const s = document.getElementById('feed-sentinel'); if(s) s.remove()
}

function setupInfinite(list, userId){
    teardownInfinite()
    const sentinel = document.createElement('div')
    sentinel.id = 'feed-sentinel'
    sentinel.style.cssText = 'height:1px;width:100%;'
    list.parentNode.insertBefore(sentinel, list.nextSibling)

    state.recObserver = new IntersectionObserver(entries => {
        entries.forEach(en => { if(en.isIntersecting) appendRecommendedChunk(list, userId, 5) })
    }, { rootMargin: '0px 0px 700px 0px', threshold: 0 })
    state.recObserver.observe(sentinel)
}

async function appendRecommendedChunk(list, userId, size = 5){
    if(state.recLoading) return
    if(!list.isConnected) return
    state.recLoading = true
    try {
        let next = []

        while(next.length < size && state.recCursor < state.recBuffer.length){
            const p = state.recBuffer[state.recCursor++]
            if(!state.recShownIds.has(p.id)){
                next.push(p)
                state.recShownIds.add(p.id)
            }
        }

        if(next.length < size){
            const fresh = await loadPosts(userId)
            let freshFiltered = fresh.filter(p => !state.recShownIds.has(p.id))
            if(freshFiltered.length === 0){
                state.recShownIds = new Set()
                freshFiltered = fresh
            }
            state.recBuffer = freshFiltered
            state.recCursor = 0
            while(next.length < size && state.recCursor < state.recBuffer.length){
                const p = state.recBuffer[state.recCursor++]
                if(!state.recShownIds.has(p.id)){
                    next.push(p)
                    state.recShownIds.add(p.id)
                }
            }
        }

        if(!next.length) return

        const authorIds  = [...new Set(next.map(p => p.author_id).filter(Boolean))]
        const channelIds = [...new Set(next.map(p => p.channel_id).filter(Boolean))]
        const [{ data:profs }, { data:chs }] = await Promise.all([
            authorIds.length  ? supabase.from('profiles').select('id, username, full_name, avatar_url, status, is_admin').in('id', authorIds)  : Promise.resolve({ data: [] }),
            channelIds.length ? supabase.from('channels').select('id, name, avatar_url').in('id', channelIds) : Promise.resolve({ data: [] })
        ])
        const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]))
        const chMap   = Object.fromEntries((chs   || []).map(c => [c.id, c]))
        const enriched = next.map(p => ({
            ...p,
            profiles: profMap[p.author_id] || {},
            channels: p.channel_id ? (chMap[p.channel_id] || null) : null
        }))

        const ids = enriched.map(p => p.id)
        const [{ data:likes }, { data:reps }, counts] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', userId).in('post_id', ids),
            supabase.from('reposts').select('post_id').eq('user_id', userId).in('post_id', ids),
            fetchCounts(ids)
        ])
        const likedIds = new Set((likes || []).map(l => l.post_id))
        const repostedIds = new Set((reps || []).map(r => r.post_id))

        list.insertAdjacentHTML('beforeend', enriched.map(p => renderChannelPost(p, userId, likedIds, repostedIds, counts, 'ваши рекомендации')).join(''))
        likedIds.forEach(pid => syncPostLike(pid, true, 0))
        repostedIds.forEach(pid => syncPostRepost(pid, true, 0))

        const allCards = [...list.querySelectorAll('.feed-post')]
        const newCards = allCards.slice(allCards.length - enriched.length)
        newCards.forEach(card => attachHandlersToCard(card, userId))

        setTimeout(initTrackObserver, 60)
    } catch(e){
        console.warn('[appendRecommendedChunk]', e.message)
    } finally {
        state.recLoading = false
    }
}

function attachHandlersToCard(card, userId){
    if(card.dataset.handlersBound === '1') return
    card.dataset.handlersBound = '1'

    if(card.classList.contains('feed-post-video')){
        attachVideoCardClick(card)
        attachVideoProgress(card)
        attachVideoLoading(card)
        checkVideoState(card)
    }

    card.querySelectorAll('.feed-sub-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); handleFeedSubBtn(btn, userId) }))
    card.querySelectorAll('.feed-post-avatar[data-uid]').forEach(a => a.addEventListener('click', e => { e.stopPropagation(); openUserProfile(a.dataset.uid) }))
    card.querySelectorAll('.feed-channel-badge[data-chbadge]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openChannel(b.dataset.chbadge) }))
    card.querySelectorAll('.feed-action[data-like]').forEach(btn => btn.addEventListener('click', async e => { e.stopPropagation(); await toggleLikeGlobal(btn.dataset.like) }))
    card.querySelectorAll('.feed-action[data-comment]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openCommentsSheet(btn.dataset.comment) }))
    card.querySelectorAll('.feed-action[data-repost]').forEach(btn => btn.addEventListener('click', async e => { e.stopPropagation(); await toggleRepostGlobal(btn.dataset.repost) }))
    card.querySelectorAll('.feed-action[data-share]').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation()
        const pid = btn.dataset.share
        const cardEl = btn.closest('.feed-post')
        const videoSrc = cardEl?.dataset.videoSrc || null
        const content = cardEl?.querySelector('.feed-post-content')?.textContent || ''
        openShareSheet({ type:'post', postId:pid, src:videoSrc, title:content, content })
    }))
    card.querySelectorAll('.feed-more').forEach(btn => btn.addEventListener('click', async e => {
        e.stopPropagation()
        await showPostMoreMenu(btn, card, userId)
    }))
}

async function showPostMoreMenu(btn, card, userId){
    const pid = btn.dataset.pid
    const isMine = btn.dataset.mine === '1'
    const chId = btn.dataset.channel
    const authorId = btn.dataset.authorId || card.querySelector('.feed-post-avatar')?.dataset.uid
    const videoSrc = card.classList.contains('feed-post-video') ? card.dataset.videoSrc : null
    const onHome = state.screen === 'home'

    let amAdmin = false
    if(chId){ const { data:ch } = await supabase.from('channels').select('owner_id').eq('id', chId).maybeSingle(); if(ch && ch.owner_id === userId) amAdmin = true }

    const items = []

    if(authorId){
        const avEl = card.querySelector('.feed-post-avatar')
        let avHtml = ''
        if(avEl){
            avHtml = avEl.innerHTML.replace(/<div[^>]*class="story-status-badge"[^>]*>.*?<\/div>/,'')
        }
        items.push({
            label:`Профиль @${btn.dataset.author || 'user'}`,
            icon:`<span class="feed-more-menu-avatar">${avHtml || '?'}</span>`,
            onClick: () => openUserProfile(authorId)
        })
    }

    if(onHome && !isMine){
        items.push({
            label:'Неинтересно',
            icon:ICONS.thumbDown,
            onClick: () => { hidePostLocally(pid); showToast('info', 'Будем показывать меньше такого', { icon:'👋' }) }
        })
        items.push({
            label:'Интересно — больше такого',
            icon:ICONS.thumbUp,
            onClick: () => { boostPostLocally(pid); showToast('success', 'Учли!', { icon:'✓' }) }
        })
        if(chId) items.push({
            label:'Не рекомендовать с этого канала',
            icon:ICONS.flag,
            onClick: async () => { await hideChannelLocally(chId); showToast('info', 'Канал скрыт из рекомендаций') }
        })
        if(authorId) items.push({
            label:'Не рекомендовать этого автора',
            icon:ICONS.flag,
            onClick: async () => { await hideAuthorLocally(authorId); showToast('info', 'Автор скрыт из рекомендаций') }
        })
    }

    if(videoSrc) items.push({ label:'Полноэкранный режим', icon:ICONS.fullscreen, onClick: () => enterVideoFS(videoSrc, pid) })
    items.push({ label:'Поделиться', icon:ICONS.share, onClick: () => {
            const content = card.querySelector('.feed-post-content')?.textContent || ''
            openShareSheet({ type:'post', postId:pid, src:videoSrc, title:content, content })
        } })

    if(!isMine){
        items.push({ label:'Пожаловаться', icon:ICONS.flag, danger:true, onClick: () => {
                const authorEl = card.querySelector('.feed-post-avatar[data-uid]')
                const authorData = authorEl ? { id: authorEl.dataset.uid, username: btn.dataset.author, full_name: btn.dataset.author } : null
                const media = card.dataset.videoSrc || card.querySelector('.feed-post-image')?.src || null
                const text = card.querySelector('.feed-post-content')?.textContent || ''
                openReportModal({
                    targetType: card.dataset.videoSrc ? 'video' : 'post',
                    targetId: pid,
                    authorId: authorData?.id,
                    author: authorData,
                    media, text
                })
            } })
    }

    const iAmAdmin = ADMIN_STATE.isAdmin
    if(isMine || amAdmin || iAmAdmin){
        items.push({
            label: iAmAdmin && !isMine ? 'Удалить (админ)' : 'Удалить',
            icon: ICONS.trash,
            danger: true,
            onClick: async () => {
                if(!confirm('Удалить пост?')) return
                await supabase.from('posts').delete().eq('id', pid)
                card.remove()
            }
        })
    }

    if(!items.length) items.push({ label:'Нет действий', onClick: () => {} })
    showActionSheet(isMine ? 'Ваш пост' : (amAdmin ? 'Действия (админ)' : 'Действия'), items)
}

function hidePostLocally(postId){
    document.querySelectorAll(`.feed-post[data-pid="${postId}"]`).forEach(c => {
        c.style.transition = 'opacity .3s, transform .3s'
        c.style.opacity = '0'; c.style.transform = 'scale(.96)'
        setTimeout(() => c.remove(), 320)
    })
}
function boostPostLocally(postId){ console.log('[boost]', postId) }
async function hideChannelLocally(channelId){
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        try { await supabase.from('hidden_channels').insert({ user_id:user.id, channel_id:channelId }) } catch {}
        document.querySelectorAll(`.feed-post[data-channel="${channelId}"]`).forEach(c => c.remove())
    } catch {}
}
async function hideAuthorLocally(authorId){
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        try { await supabase.from('hidden_authors').insert({ user_id:user.id, author_id:authorId }) } catch {}
        document.querySelectorAll(`.feed-post .feed-post-avatar[data-uid="${authorId}"]`).forEach(a => a.closest('.feed-post')?.remove())
    } catch {}
}

document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const newTab = tab.dataset.tab
        if(newTab === state.feedTab && newTab !== 'recommended') return
        document.querySelectorAll('.feed-tab').forEach(x => x.classList.remove('active'))
        tab.classList.add('active')
        state.feedTab = newTab
        renderHomeFeed()
    })
})

function checkVideoState(card){
    const vid = card.querySelector('.post-bg-video')
    if(!vid) return
    const hint = card.querySelector('.feed-post-video-hint')
    if(!vid.paused && card.dataset.videoActivated === '1'){
        card.classList.add('is-playing')
        if(hint) hint.style.display = 'none'
    }
}

function attachVideoCardClick(card){
    if(card.dataset.videoClickBound === '1') return
    card.dataset.videoClickBound = '1'

    card.addEventListener('click', e => {
        if(e.target.closest('.feed-action, .feed-more, .feed-channel-badge, .feed-post-avatar, .profile-post-more, .feed-sub-btn, .post-video-progress, .poll-view')) return
        const vid = card.querySelector('.post-bg-video')
        if(!vid) return

        const hint = card.querySelector('.feed-post-video-hint')
        if(hint) hint.style.display = 'none'

        const activated = card.dataset.videoActivated === '1'
        if(!activated){
            card.dataset.videoActivated = '1'
            card.classList.add('is-playing')
            vid.pause()
            try { vid.currentTime = 0 } catch {}
            vid.muted = false
            vid.volume = 1
            const p = vid.play()
            if(p && p.catch) p.catch(() => { vid.muted = true; vid.play().catch(()=>{}) })
            hideVideoPauseIcon(card)
        } else {
            if(vid.paused){
                vid.play().catch(()=>{})
                hideVideoPauseIcon(card)
            } else {
                vid.pause()
                showVideoPauseIcon(card)
            }
        }
    })
}
function showVideoPauseIcon(card){
    let icon = card.querySelector('.video-pause-overlay')
    if(!icon){
        icon = document.createElement('div')
        icon.className = 'video-pause-overlay'
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="76" height="76" fill="#fff" style="filter:drop-shadow(0 6px 20px rgba(0,0,0,.65))"><path d="M8 5v14l11-7z"/></svg>'
        icon.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:6;pointer-events:none;opacity:.92;'
        card.appendChild(icon)
    }
    icon.style.display = 'block'
}
function hideVideoPauseIcon(card){
    const icon = card.querySelector('.video-pause-overlay')
    if(icon) icon.style.display = 'none'
}

function attachVideoProgress(card){
    const vid = card.querySelector('.post-bg-video')
    if(!vid) return
    let bar = card.querySelector('.post-video-progress')
    if(!bar){
        bar = document.createElement('div')
        bar.className = 'post-video-progress'
        bar.innerHTML = '<div class="post-video-progress-fill"></div>'
        card.appendChild(bar)
    }
    const fill = bar.querySelector('.post-video-progress-fill')
    vid.addEventListener('timeupdate', () => {
        if(vid.duration && isFinite(vid.duration)){
            fill.style.width = (vid.currentTime / vid.duration * 100) + '%'
        }
    })
    let dragging = false
    const setFromEvent = (clientX) => {
        const rect = bar.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        if(vid.duration && isFinite(vid.duration)){
            vid.currentTime = pct * vid.duration
        }
    }
    bar.addEventListener('pointerdown', e => { e.stopPropagation(); dragging = true; setFromEvent(e.clientX); bar.setPointerCapture(e.pointerId) })
    bar.addEventListener('pointermove', e => { if(dragging){ e.stopPropagation(); setFromEvent(e.clientX) } })
    bar.addEventListener('pointerup', e => { e.stopPropagation(); dragging = false })
}

function attachVideoLoading(card){
    const vid = card.querySelector('.post-bg-video')
    if(!vid) return

    const MIN_BUFFER = 0.3

    const update = () => {
        if(!vid.duration || !isFinite(vid.duration)) {
            card.classList.add('loading')
            card.dataset.videoReady = '0'
            return
        }
        let ratio = 0
        if(vid.buffered.length){
            ratio = vid.buffered.end(vid.buffered.length - 1) / vid.duration
        }
        ratio = Math.min(1, Math.max(0, ratio))

        if(ratio >= MIN_BUFFER){
            card.classList.remove('loading')
            card.dataset.videoReady = '1'
            card.dataset.videoBuffer = ratio.toFixed(2)
        } else {
            card.classList.add('loading')
            card.dataset.videoReady = '0'
            card.dataset.videoBuffer = ratio.toFixed(2)
        }
    }

    vid.addEventListener('loadstart',        update)
    vid.addEventListener('loadedmetadata',   update)
    vid.addEventListener('loadeddata',       update)
    vid.addEventListener('progress',         update)
    vid.addEventListener('canplay',          update)
    vid.addEventListener('canplaythrough',   update)
    vid.addEventListener('waiting',          update)
    vid.addEventListener('playing',          update)
    vid.addEventListener('timeupdate',       update)

    update()
}

function renderChannelPost(post, myId, likedIds = new Set(), repostedIds = new Set(), counts = {}, contextLabel = 'ваши рекомендации'){
    const p = post.profiles || {}, ch = post.channels || {}
    const name = p.full_name || p.username || 'Канал'
    const time = new Date(post.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
    const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
    const emoji = statusEmoji(computeDisplayStatus(p))
    const isMine = myId && post.author_id === myId
    const isLiked = likedIds.has(post.id), isReposted = repostedIds.has(post.id)
    const lc = counts[post.id]?.likes || 0
    const cc = counts[post.id]?.comments || 0
    const rc = counts[post.id]?.reposts || 0
    const isVideo = isVideoUrl(post.media_url)
    const adminMark = p.is_admin ? adminBadge(true) : ''

    let channelBadge = ''
    if(ch.id){
        const chName = ch.name || 'Канал'
        const chLogo = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : chName.charAt(0).toUpperCase()
        channelBadge = `<button class="feed-channel-badge" data-chbadge="${ch.id}"><span class="feed-channel-logo">${chLogo}</span><span class="feed-channel-name">${escapeHtml(chName)}</span></button>`
    }

    let subBtn = ''
    if(!isMine && ch.id){
        const isSub = state.myChannelSubs.has(ch.id)
        subBtn = `<button class="feed-sub-btn ${isSub ? 'subscribed' : ''}" data-chid="${ch.id}">${isSub ? ICONS.checkSmall : ICONS.plus}</button>`
    }

    const pollHtml = post.poll ? renderPoll(post.poll, post.id) : ''

    if(!isVideo){
        const media = renderMedia(post.media_url, 'feed-post-image', {
            title: post.media_title || post.title,
            postId: post.id,
            username: p.username || 'user'
        })
        return `<article class="feed-post" data-pid="${post.id}" data-channel="${post.channel_id || ''}">
    <div class="feed-post-header">
      <div class="feed-post-avatar avatar-with-status" data-uid="${post.author_id}">${av}<div class="story-status-badge">${emoji}</div></div>
      <div class="feed-post-info">
    <div class="feed-post-name verified">${escapeHtml(name)}${adminMark}${channelBadge}</div>
    ${buildMetaRow(time, contextLabel, post)}
</div>
      ${subBtn}
    </div>
    <div class="feed-post-content">${escapeHtml(post.content || '')}</div>
    ${media}${pollHtml}
    <div class="feed-post-footer">
      <button class="feed-action ${isLiked ? 'liked' : ''}" data-like="${post.id}">${isLiked ? ICONS.heartFill : ICONS.heart}<span class="feed-count" data-like-count="${post.id}">${lc}</span></button>
      <button class="feed-action" data-comment="${post.id}">${ICONS.comment}<span class="feed-count" data-comment-count="${post.id}">${cc}</span></button>
      <button class="feed-action ${isReposted ? 'reposted' : ''}" data-repost="${post.id}" ${isReposted ? 'style="color:var(--green)"' : ''}>${ICONS.repost}<span class="feed-count" data-repost-count="${post.id}">${rc}</span></button>
      <button class="feed-action" data-share="${post.id}">${ICONS.share}</button>
      <button class="feed-more" data-pid="${post.id}" data-author="${p.username || 'user'}" data-mine="${isMine ? 1 : 0}" data-channel="${post.channel_id || ''}">${ICONS.dots}</button>
    </div>
  </article>`
    }

    return `<article class="feed-post feed-post-video" data-pid="${post.id}" data-channel="${post.channel_id || ''}" data-video-src="${post.media_url}">
    <video class="post-bg-video" src="${post.media_url}" autoplay muted loop playsinline preload="metadata"></video>
    <div class="post-bg-overlay"></div>
    <div class="feed-post-video-hint" style="white-space:nowrap">нажмите чтобы посмотреть</div>
    <div class="feed-post-header">
      <div class="feed-post-avatar avatar-with-status" data-uid="${post.author_id}">${av}<div class="story-status-badge">${emoji}</div></div>
      <div class="feed-post-info">
    <div class="feed-post-name verified">${escapeHtml(name)}${adminMark}${channelBadge}</div>
    ${buildMetaRow(time, contextLabel, post)}
</div>
      ${subBtn}
    </div>
    <div class="feed-post-content">${escapeHtml(post.content || '')}</div>
    ${pollHtml}
    <div class="feed-post-footer">
      <button class="feed-action ${isLiked ? 'liked' : ''}" data-like="${post.id}">${isLiked ? ICONS.heartFill : ICONS.heart}<span class="feed-count" data-like-count="${post.id}">${lc}</span></button>
      <button class="feed-action" data-comment="${post.id}">${ICONS.comment}<span class="feed-count" data-comment-count="${post.id}">${cc}</span></button>
      <button class="feed-action ${isReposted ? 'reposted' : ''}" data-repost="${post.id}" ${isReposted ? 'style="color:var(--green)"' : ''}>${ICONS.repost}<span class="feed-count" data-repost-count="${post.id}">${rc}</span></button>
      <button class="feed-action" data-share="${post.id}">${ICONS.share}</button>
      <button class="feed-more" data-pid="${post.id}" data-author="${p.username || 'user'}" data-mine="${isMine ? 1 : 0}" data-channel="${post.channel_id || ''}">${ICONS.dots}</button>
    </div>
  </article>`
}

function renderPoll(poll, postId){
    if(!poll) return ''
    const myVote = poll.voters?.[state.currentUser?.id]
    const total = (poll.votes || []).reduce((a,b) => a + (b||0), 0)
    const isQuiz = poll.mode === 'quiz'
    const revealed = myVote !== undefined
    return `<div class="poll-view" data-poll-post="${postId}">
        <div class="poll-view-title">${isQuiz ? '🎯 Викторина' : '📊 Опрос'}</div>
        <div class="poll-view-options">
            ${poll.options.map((opt, i) => {
        const votes = poll.votes?.[i] || 0
        const pct = total ? Math.round(votes / total * 100) : 0
        const isSelected = myVote === i
        const isCorrect = isQuiz && revealed && poll.correct === i
        const isWrong = isQuiz && revealed && isSelected && poll.correct !== i
        return `<button class="poll-view-option ${isSelected?'selected':''} ${isCorrect?'correct':''} ${isWrong?'wrong':''}" data-poll-vote="${i}" data-poll-pid="${postId}">
                    ${revealed ? `<div class="poll-view-fill" style="width:${pct}%"></div>` : ''}
                    <div class="poll-view-label">
                        <span>${escapeHtml(opt)}</span>
                        ${revealed ? `<span class="poll-view-pct">${pct}%</span>` : ''}
                    </div>
                </button>`
    }).join('')}
        </div>
        <div class="poll-view-meta">${total} голос${total === 1 ? '' : 'ов'}</div>
    </div>`
}
function getPollRevealInfo(poll, userId){
    const myVote = poll.voters?.[userId]
    const total = (poll.votes || []).reduce((a,b) => a + (b||0), 0)
    return { myVote, total, revealed: myVote !== undefined, isQuiz: poll.mode === 'quiz' }
}

function buildPollInnerHtml(poll, postId, userId){
    const { myVote, total, revealed, isQuiz } = getPollRevealInfo(poll, userId)
    return `
        <div class="poll-view-title">${isQuiz ? '🎯 Викторина' : '📊 Опрос'}</div>
        <div class="poll-view-options">
            ${poll.options.map((opt, i) => {
        const votes = poll.votes?.[i] || 0
        const pct = total ? Math.round(votes / total * 100) : 0
        const isSelected = myVote === i
        const isCorrect  = isQuiz && revealed && poll.correct === i
        const isWrong    = isQuiz && revealed && isSelected && poll.correct !== i
        return `<button class="poll-view-option ${isSelected?'selected':''} ${isCorrect?'correct':''} ${isWrong?'wrong':''}" data-poll-vote="${i}" data-poll-pid="${postId}">
                    ${revealed ? `<div class="poll-view-fill" style="width:${pct}%"></div>` : ''}
                    <div class="poll-view-label">
                        <span>${escapeHtml(opt)}</span>
                        ${revealed ? `<span class="poll-view-pct">${pct}%</span>` : ''}
                    </div>
                </button>`
    }).join('')}
        </div>
        <div class="poll-view-meta">${total} голос${total === 1 ? '' : 'ов'}</div>
    `
}

function updatePollInDom(postId, newPoll, userId){
    document.querySelectorAll(`.poll-view[data-poll-post="${postId}"]`).forEach(el => {
        el.innerHTML = buildPollInnerHtml(newPoll, postId, userId)
        el.animate?.(
            [{ transform:'scale(1)' }, { transform:'scale(1.015)' }, { transform:'scale(1)' }],
            { duration: 220, easing: 'ease-out' }
        )
    })
    const inChannelPosts = state.channelPosts?.find(p => p.id === postId)
    if(inChannelPosts) inChannelPosts.poll = newPoll
    const inRecBuffer = state.recBuffer?.find(p => p.id === postId)
    if(inRecBuffer) inRecBuffer.poll = newPoll
}
function mediaLabel(post){
    if(isVideoUrl(post.media_url)) return 'оригинальный звук -'
    if(isAudioUrl(post.media_url)) return  'может быть защищено авторским правом пользователя -'
    if(post.media_url) return 'оригинальное фото -'
    return 'пост был выложен -'
}

function buildMetaRow(time, contextLabel, post){
    const p = post.profiles || {}
    const username = (p.username || 'user').replace(/^@/, '')
    const initial = (p.full_name || p.username || 'U').charAt(0).toUpperCase()
    const avaHtml = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : initial
    const soundLabel = mediaLabel(post)
    const content = `
        <span class="mq-label">${escapeHtml(contextLabel)}</span>
        <span class="mq-dot">•</span>
        <span class="mq-label">${escapeHtml(soundLabel)}</span>
        <span class="mq-dot">•</span>
        <span class="mq-sound">
            <span class="mq-sound-ava">${avaHtml}</span>
            <span class="mq-sound-name">@${escapeHtml(username)}</span>
        </span>
    `
    return `
        <div class="feed-post-time post-meta-row">
            <span class="post-date">${time}</span>
            <div class="post-marquee-wrap">
                <div class="post-marquee-inner">
                    <div class="post-marquee-track">${content}</div>
                    <div class="post-marquee-track" aria-hidden="true">${content}</div>
                </div>
                <span class="mq-loading">загрузка...</span>
            </div>
        </div>
    `
}

function initPostMarquees(root = document){
    root.querySelectorAll('.post-marquee-wrap').forEach(wrap => {
        if(wrap.dataset.mqInit === '1') return
        wrap.dataset.mqInit = '1'
        const inner = wrap.querySelector('.post-marquee-inner')
        if(!inner) return
        const tracks = inner.querySelectorAll('.post-marquee-track')
        if(tracks.length < 2) return
        requestAnimationFrame(() => {
            const wrapW  = wrap.clientWidth
            const trackW = tracks[0].scrollWidth
            if(trackW > wrapW + 2){
                const dur = Math.max(12, Math.round(trackW / 30))
                inner.style.animationDuration = dur + 's'
                inner.classList.add('scrolling')
            } else {
                tracks[1].style.display = 'none'
            }
        })
    })
}

async function handleFeedSubBtn(btn, myId){
    const chId = btn.dataset.chid
    if(!chId) return

    const wasSub = btn.classList.contains('subscribed')
    const nowSub = !wasSub

    applySubState(chId, nowSub)
    if(nowSub) state.myChannelSubs.add(chId)
    else state.myChannelSubs.delete(chId)

    try {
        if(nowSub){
            await supabase.from('subscriptions').insert({ follower_id: myId, channel_id: chId })
        } else {
            await supabase.from('subscriptions').delete().eq('follower_id', myId).eq('channel_id', chId)
        }
        showToast('success', nowSub ? 'Вы подписаны' : 'Отписка', { icon: nowSub ? '✓' : '👋' })
    } catch(e){
        applySubState(chId, wasSub)
        if(wasSub) state.myChannelSubs.add(chId)
        else state.myChannelSubs.delete(chId)
        showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    }
}

function applySubState(chId, sub){
    if(!chId) return
    document.querySelectorAll(`.feed-sub-btn[data-chid="${chId}"]`).forEach(b => {
        b.classList.toggle('subscribed', sub)
        b.innerHTML = sub ? ICONS.checkSmall : ICONS.plus
    })
    document.querySelectorAll(`.chan-item[data-ch="${chId}"] .chan-sub-icon`).forEach(el => {
        el.innerHTML = sub ? ICONS.checkSmall : ICONS.plus
    })
    if(music.channel?.id === chId){
        const fp = document.getElementById('full-channel-follow')
        if(fp){
            fp.classList.toggle('subscribed', sub)
            fp.innerHTML = sub
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12l5 5 9-11"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
        }
    }
}

async function attachFeedActions(list, myId){
    list.querySelectorAll('.feed-sub-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); handleFeedSubBtn(btn, myId) }))
    list.querySelectorAll('.feed-post-avatar[data-uid]').forEach(a => a.addEventListener('click', e => { e.stopPropagation(); openUserProfile(a.dataset.uid) }))
    list.querySelectorAll('.feed-channel-badge[data-chbadge]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openChannel(b.dataset.chbadge) }))

    list.querySelectorAll('.feed-post.feed-post-video').forEach(card => {
        attachVideoCardClick(card)
        attachVideoProgress(card)
        checkVideoState(card)
    })

    list.querySelectorAll('.feed-action[data-like]').forEach(btn => btn.addEventListener('click', async e => { e.stopPropagation(); await toggleLikeGlobal(btn.dataset.like) }))
    list.querySelectorAll('.feed-action[data-comment]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openCommentsSheet(btn.dataset.comment) }))
    list.querySelectorAll('.feed-action[data-repost]').forEach(btn => btn.addEventListener('click', async e => { e.stopPropagation(); await toggleRepostGlobal(btn.dataset.repost) }))
    list.querySelectorAll('.feed-action[data-share]').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation()
        const pid = btn.dataset.share
        const cardEl = btn.closest('.feed-post')
        const videoSrc = cardEl?.dataset.videoSrc || null
        const content = cardEl?.querySelector('.feed-post-content')?.textContent || ''
        openShareSheet({ type:'post', postId:pid, src:videoSrc, title:content, content })
    }))

    list.querySelectorAll('.feed-more').forEach(btn => btn.addEventListener('click', async e => {
        e.stopPropagation()
        const card = btn.closest('.feed-post')
        await showPostMoreMenu(btn, card, myId)
    }))
}

async function openCommentsSheet(postId){
    const { data:{ user } } = await supabase.auth.getUser()
    const { data:comments } = await supabase.from('comments')
        .select('id, text, created_at, profiles:user_id ( id, username, full_name, avatar_url, is_admin )')
        .eq('post_id', postId).order('created_at', { ascending:true }).limit(100)
    actionsheetTitle.textContent = 'Комментарии'
    actionsheetList.innerHTML = `
    <div class="ch-comments-list" style="max-height:50vh;overflow-y:auto;padding:4px 0 12px">
      ${(comments || []).length ? comments.map(c => {
        const p = c.profiles || {}
        const name = p.full_name || p.username || 'user'
        const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
        return `<div class="ch-comment"><div class="ch-comment-avatar">${av}</div><div class="ch-comment-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> ${escapeHtml(c.text)}</div></div>`
    }).join('') : '<p class="empty small">Нет комментариев</p>'}
    </div>
    <div class="ch-comment-row">
      <input type="text" id="comment-sheet-input" placeholder="Комментарий..." maxlength="200">
      <button class="ch-comment-send" id="comment-sheet-send">${ICONS.send}</button>
    </div>
  `
    actionsheet.classList.add('open'); actionsheetBackdrop.classList.remove('hidden')
    $('comment-sheet-send')?.addEventListener('click', async () => {
        const inp = $('comment-sheet-input')
        const text = inp.value.trim(); if(!text) return
        await supabase.from('comments').insert({ user_id:user.id, post_id:postId, text })
        inp.value = ''
        document.querySelectorAll(`.feed-count[data-comment-count="${postId}"]`).forEach(el => {
            el.textContent = (parseInt(el.textContent) || 0) + 1
        })
        openCommentsSheet(postId)
    })
}

/* ============================================================
   EVENTS
============================================================ */
async function renderEventsScreen(){
    try { const { data:{ user } } = await supabase.auth.getUser(); const { data:prof } = await supabase.from('profiles').select('region').eq('id', user.id).maybeSingle(); if(prof?.region) state.data.region = prof.region } catch {}
    const regionObj = COUNTRIES.find(c => c.code === state.data.region)
    const rn = $('region-chat-name')
    if(rn) rn.textContent = regionObj ? `${regionObj.flag} ${regionObj.name} · Нажмите` : 'Регион не указан'

    const livesBox = $('channel-chats')
    if(livesBox){
        livesBox.innerHTML = loadingBlock()
        const { data:lives } = await supabase.from('lives')
            .select('id, title, type, host_id, channel_id, channels:channel_id ( id, name, avatar_url ), profiles:host_id ( username, full_name, avatar_url )')
            .eq('is_active', true).order('created_at', { ascending:false }).limit(10)
        if(lives && lives.length){
            livesBox.innerHTML = lives.map(l => {
                const ch = l.channels || {}, host = l.profiles || {}
                const chName = ch.name || 'Канал'
                const hostName = host.full_name || host.username || 'user'
                const av = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : chName.charAt(0).toUpperCase()
                const displayName = l.type === 'rave' ? hostName : chName
                return `<div class="active-live-card" data-live="${l.id}"><div class="active-live-pill">LIVE NOW</div><div class="active-live-row"><div class="active-live-ava">${av}</div><div class="active-live-info"><div class="active-live-title">${escapeHtml(l.title || 'Трансляция')}</div><div class="active-live-sub">из ${escapeHtml(chName)} · ${escapeHtml(displayName)}</div></div><div class="active-live-bars"><span></span><span></span><span></span></div></div></div>`
            }).join('')
            livesBox.querySelectorAll('.active-live-card[data-live]').forEach(el => el.addEventListener('click', () => openLiveRoom(el.dataset.live)))
        } else livesBox.innerHTML = '<p class="empty small">Пока нет live чатов</p>'
    }

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const { data:notifs } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending:false }).limit(30)
        const box = $('notifications-list')
        if(!notifs || !notifs.length) box.innerHTML = '<p class="empty small">Нет уведомлений</p>'
        else box.innerHTML = notifs.map(n => {
            let icon = 'i', cls = 'info'
            if(n.type === 'warning'){ icon = '!'; cls = 'warn' }
            else if(n.type === 'follow' || n.type === 'login'){ icon = '✓'; cls = 'ok' }
            else if(n.type === 'report_resolved'){ icon = '✓'; cls = 'ok' }
            else if(n.type === 'report_rejected'){ icon = '!'; cls = 'warn' }
            const time = new Date(n.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
            return `<div class="notification-item ${n.is_read ? '' : 'unread'}"><div class="notification-icon ${cls}">${icon}</div><div class="notification-text"><strong>${escapeHtml(n.title)}</strong>${n.body ? `<div>${escapeHtml(n.body)}</div>` : ''}<div class="notification-time">${time}</div></div></div>`
        }).join('')
    } catch {}

    renderInboxPanel()
}

async function renderInboxPanel(){
    const box = $('inbox-list'); if(!box) return
    box.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const { data:myPosts } = await supabase.from('posts').select('id').eq('author_id', user.id)
        const myPostIds = (myPosts || []).map(p => p.id)

        if(state.inboxTab === 'followers'){
            const { data } = await supabase.from('follows').select('created_at, profiles:follower_id ( id, username, full_name, avatar_url, is_admin )').eq('following_id', user.id).order('created_at', { ascending:false }).limit(20)
            if(!data || !data.length){ box.innerHTML = '<p class="empty small">Нет новых подписчиков</p>'; return }
            box.innerHTML = data.map(f => {
                const p = f.profiles || {}
                const name = p.full_name || p.username || 'user'
                const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
                const time = new Date(f.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short' })
                return `<div class="inbox-item" data-uid="${p.id}" style="cursor:pointer"><div class="inbox-item-avatar">${av}</div><div class="inbox-item-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> подписался</div><div class="inbox-item-time">${time}</div></div>`
            }).join('')
            box.querySelectorAll('.inbox-item[data-uid]').forEach(el => el.addEventListener('click', () => openUserProfile(el.dataset.uid)))
        }
        else if(state.inboxTab === 'replies'){
            if(!myPostIds.length){ box.innerHTML = '<p class="empty small">У вас нет постов</p>'; return }
            const { data } = await supabase.from('posts')
                .select('id, content, created_at, reply_to, author_id, profiles:author_id ( id, username, full_name, avatar_url, is_admin )')
                .in('reply_to', myPostIds).order('created_at', { ascending:false }).limit(30)
            if(!data || !data.length){ box.innerHTML = '<p class="empty small">Нет ответов</p>'; return }
            box.innerHTML = data.map(r => {
                const p = r.profiles || {}
                const name = p.full_name || p.username || 'user'
                const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
                const time = new Date(r.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                return `<div class="inbox-item" data-uid="${r.author_id}" data-pid="${r.reply_to}" style="cursor:pointer"><div class="inbox-item-avatar">${av}</div><div class="inbox-item-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> ответил вам<div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${escapeHtml((r.content || '').slice(0, 60))}</div></div><div class="inbox-item-time">${time}</div></div>`
            }).join('')
            box.querySelectorAll('.inbox-item').forEach(el => el.addEventListener('click', () => { if(el.dataset.uid) openUserProfile(el.dataset.uid) }))
        }
        else if(state.inboxTab === 'comments'){
            if(!myPostIds.length){ box.innerHTML = '<p class="empty small">У вас нет постов</p>'; return }
            const { data } = await supabase.from('comments')
                .select('id, text, created_at, post_id, profiles:user_id ( id, username, full_name, avatar_url, is_admin )')
                .in('post_id', myPostIds).order('created_at', { ascending:false }).limit(30)
            if(!data || !data.length){ box.innerHTML = '<p class="empty small">Нет комментариев</p>'; return }
            box.innerHTML = data.map(c => {
                const p = c.profiles || {}
                const name = p.full_name || p.username || 'user'
                const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
                const time = new Date(c.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                return `<div class="inbox-item" data-uid="${p.id}" style="cursor:pointer"><div class="inbox-item-avatar">${av}</div><div class="inbox-item-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> оставил комментарий<div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${escapeHtml(c.text || '')}</div></div><div class="inbox-item-time">${time}</div></div>`
            }).join('')
            box.querySelectorAll('.inbox-item').forEach(el => el.addEventListener('click', () => { if(el.dataset.uid) openUserProfile(el.dataset.uid) }))
        }
        else if(state.inboxTab === 'likes'){
            if(!myPostIds.length){ box.innerHTML = '<p class="empty small">У вас нет постов</p>'; return }
            const { data } = await supabase.from('likes')
                .select('id, created_at, post_id, profiles:user_id ( id, username, full_name, avatar_url, is_admin )')
                .in('post_id', myPostIds).order('created_at', { ascending:false }).limit(30)
            if(!data || !data.length){ box.innerHTML = '<p class="empty small">Нет лайков</p>'; return }
            box.innerHTML = data.map(l => {
                const p = l.profiles || {}
                const name = p.full_name || p.username || 'user'
                const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
                const time = new Date(l.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                return `<div class="inbox-item" data-uid="${p.id}" style="cursor:pointer"><div class="inbox-item-avatar">${av}</div><div class="inbox-item-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> лайкнул ваш пост</div><div class="inbox-item-time">${time}</div></div>`
            }).join('')
            box.querySelectorAll('.inbox-item').forEach(el => el.addEventListener('click', () => { if(el.dataset.uid) openUserProfile(el.dataset.uid) }))
        }
        else if(state.inboxTab === 'reposts'){
            if(!myPostIds.length){ box.innerHTML = '<p class="empty small">У вас нет постов</p>'; return }
            const { data } = await supabase.from('reposts')
                .select('id, created_at, post_id, profiles:user_id ( id, username, full_name, avatar_url, is_admin )')
                .in('post_id', myPostIds).order('created_at', { ascending:false }).limit(30)
            if(!data || !data.length){ box.innerHTML = '<p class="empty small">Нет репостов</p>'; return }
            box.innerHTML = data.map(r => {
                const p = r.profiles || {}
                const name = p.full_name || p.username || 'user'
                const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
                const time = new Date(r.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                return `<div class="inbox-item" data-uid="${p.id}" style="cursor:pointer"><div class="inbox-item-avatar">${av}</div><div class="inbox-item-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> сделал репост</div><div class="inbox-item-time">${time}</div></div>`
            }).join('')
            box.querySelectorAll('.inbox-item').forEach(el => el.addEventListener('click', () => { if(el.dataset.uid) openUserProfile(el.dataset.uid) }))
        }
        else if(state.inboxTab === 'invites'){
            const { data } = await supabase.from('channel_invites')
                .select('id, status, channels:channel_id ( id, name, avatar_url ), profiles:from_user_id ( username, full_name )')
                .eq('to_user_id', user.id).eq('status', 'pending').order('created_at', { ascending:false }).limit(20)
            if(!data || !data.length){ box.innerHTML = '<p class="empty small">Нет приглашений</p>'; return }
            box.innerHTML = data.map(inv => {
                const ch = inv.channels || {}, from = inv.profiles || {}
                const fromName = from.full_name || from.username || 'user'
                const av = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : (ch.name || 'K').charAt(0).toUpperCase()
                return `<div class="invite-item"><div class="invite-item-icon">${av}</div><div class="invite-item-info"><strong>${escapeHtml(fromName)} приглашает в канал</strong><div style="font-size:12px;color:var(--text-secondary)">${escapeHtml(ch.name || '')}</div></div><div class="invite-item-actions"><button class="invite-btn accept" data-accept="${inv.id}" data-ch="${ch.id}">Войти</button><button class="invite-btn decline" data-decline="${inv.id}">✕</button></div></div>`
            }).join('')
            box.querySelectorAll('.invite-btn.accept').forEach(btn => btn.addEventListener('click', async () => {
                await supabase.from('channel_invites').update({ status:'accepted' }).eq('id', btn.dataset.accept)
                try { await supabase.from('subscriptions').insert({ follower_id:user.id, channel_id:btn.dataset.ch }) } catch {}
                renderInboxPanel()
            }))
            box.querySelectorAll('.invite-btn.decline').forEach(btn => btn.addEventListener('click', async () => {
                await supabase.from('channel_invites').update({ status:'declined' }).eq('id', btn.dataset.decline)
                renderInboxPanel()
            }))
        }
        else box.innerHTML = '<p class="empty small">Нет данных</p>'
    } catch(e){ console.warn(e); box.innerHTML = '<p class="empty small">Ошибка</p>' }
}

document.querySelectorAll('.inbox-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.inbox-tab').forEach(t => t.classList.remove('active'))
        tab.classList.add('active'); state.inboxTab = tab.dataset.itab; renderInboxPanel()
    })
})

$('enter-global')?.addEventListener('click', () => openLiveChat('global', 'Global'))
$('hero-region')?.addEventListener('click', () => {
    const r = COUNTRIES.find(c => c.code === state.data.region)
    openLiveChat('region', r ? `${r.flag} ${r.name}` : 'Регион')
})

function openLiveChat(ctx, title){
    state.chatContext = ctx; state.chatTitle = title
    const t = $('livechat-title'), h = $('livechat-header-text')
    if(t) t.textContent = title
    if(h) h.textContent = ctx === 'global' ? 'Global · Мировой чат' : title
    switchScreen('livechat'); renderLiveFeed()
    if(livechatRefreshTimer) clearInterval(livechatRefreshTimer)
    livechatRefreshTimer = setInterval(() => {
        if(state.screen === 'livechat') renderLiveFeed(true)
        else { clearInterval(livechatRefreshTimer); livechatRefreshTimer = null }
    }, 1000)
}
$('livechat-back')?.addEventListener('click', () => switchScreen('inbox'))

/* ============================================================
   COMPOSER (LIVE-CHAT)
============================================================ */
const photoInput = $('photo-input'), audioInput = $('audio-input'), videoInput = $('video-input')
const photoPreview = $('photo-preview')

function resetComposerPreview(){
    state.attachedPhoto = null
    state.attachedVideo = false
    state.attachedKind = null
    if(photoPreview){ photoPreview.classList.add('hidden'); photoPreview.innerHTML = '' }
    if(photoInput) photoInput.value = ''
    if(audioInput) audioInput.value = ''
    if(videoInput) videoInput.value = ''
}

function renderComposerPreview(file, kind){
    if(!photoPreview) return
    const url = URL.createObjectURL(file)
    photoPreview.classList.remove('hidden')
    if(kind === 'audio'){
        photoPreview.innerHTML = `<audio controls src="${url}" style="width:100%;border-radius:var(--radius-md)"></audio>
            <button class="photo-preview-remove" id="photo-preview-remove-dyn">✕</button>`
    } else if(kind === 'video'){
        photoPreview.innerHTML = `<video src="${url}" muted playsinline style="width:100%;border-radius:var(--radius-md);display:block;max-height:200px;object-fit:cover"></video>
            <button class="photo-preview-remove" id="photo-preview-remove-dyn">✕</button>`
    } else {
        photoPreview.innerHTML = `<img src="${url}" alt="">
            <button class="photo-preview-remove" id="photo-preview-remove-dyn">✕</button>`
    }
    document.getElementById('photo-preview-remove-dyn')?.addEventListener('click', resetComposerPreview)
}

if(photoInput){
    $('attach-photo')?.addEventListener('click', () => photoInput.click())
    photoInput.addEventListener('change', e => {
        const f = e.target.files?.[0]; if(!f) return
        state.attachedPhoto = f; state.attachedVideo = false; state.attachedKind = 'image'
        renderComposerPreview(f, 'image')
    })
}

const emojiPicker = $('emoji-picker')
if(emojiPicker){
    emojiPicker.innerHTML = EMOJI_LIST.map(e => `<button type="button">${e}</button>`).join('')
    emojiPicker.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { $('post-content').value += b.textContent; emojiPicker.classList.add('hidden') }))
    $('add-emoji')?.addEventListener('click', () => emojiPicker.classList.toggle('hidden'))
}

$('post-btn')?.addEventListener('click', async () => {
    const since = Date.now() - state.lastPostAt
    if(since < 15000){ alert(`Подождите ${Math.ceil((15000 - since) / 1000)} сек.`); return }
    const text = $('post-content').value.trim()
    if(!text && !state.attachedPhoto) return
    const btn = $('post-btn'); btn.disabled = true
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        let mediaUrl = null
        if(state.attachedPhoto){
            const ext = state.attachedPhoto.name.split('.').pop() || 'bin'
            const path = `${user.id}/${Date.now()}.${ext}`
            const { error:upErr } = await supabase.storage.from('posts').upload(path, state.attachedPhoto, { contentType:state.attachedPhoto.type })
            if(!upErr){ const { data:pub } = supabase.storage.from('posts').getPublicUrl(path); mediaUrl = pub.publicUrl }
        }
        const payload = { content:text, author_id:user.id, show_in_profile:true }
        if(mediaUrl) payload.media_url = mediaUrl
        if(state.replyTo) payload.reply_to = state.replyTo
        const { error } = await supabase.from('posts').insert(payload)
        if(error) throw error
        $('post-content').value = ''
        resetComposerPreview()
        cancelReply(); state.lastPostAt = Date.now(); await renderLiveFeed()
    } catch(err){ alert('Ошибка: ' + err.message) }
    finally { btn.disabled = false }
})

function replyToUser(postId, username){ state.replyTo = postId; $('reply-to-name').textContent = '@' + username; $('reply-banner').classList.remove('hidden'); $('post-content').focus() }
function cancelReply(){ state.replyTo = null; $('reply-banner').classList.add('hidden') }
$('reply-cancel')?.addEventListener('click', cancelReply)

/* ============================================================
   LIVE FEED
============================================================ */
async function renderLiveFeed(silent = false){
    const list = $('live-feed'); if(!list) return
    if(!silent) list.innerHTML = loadingBlock()
    try {
        const { data, error } = await withTimeout(supabase.from('posts')
            .select('id, content, created_at, author_id, reply_to, media_url, media_title, show_in_profile, channel_id, profiles ( username, full_name, avatar_url, status, region, is_admin )')
            .is('channel_id', null).order('created_at', { ascending:false }).limit(80), 12000, 'live')
        if(error){ if(!silent) list.innerHTML = `<p class="empty">Ошибка: ${error.message}</p>`; return }
        let filtered = data
        if(state.chatContext === 'region') filtered = data.filter(p => (p.profiles?.region || null) === (state.data.region || null))
        if(!filtered.length){ if(!silent) list.innerHTML = `<p class="empty">${state.chatContext === 'region' ? 'В регионе пока нет сообщений' : 'Нет публикаций'}</p>`; return }
        const { data:{ user } } = await supabase.auth.getUser()
        const postsMap = {}; filtered.forEach(p => postsMap[p.id] = p)
        const counts = await fetchCounts(filtered.map(p => p.id))
        const ids = filtered.map(p => p.id)
        const [{ data:likesRow }, { data:repsRow }] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
            supabase.from('reposts').select('post_id').eq('user_id', user.id).in('post_id', ids)
        ])
        const likedSet = new Set((likesRow||[]).map(l => l.post_id))
        const repostedSet = new Set((repsRow||[]).map(r => r.post_id))
        list.innerHTML = filtered.map(p => renderLivePost(p, user?.id, postsMap, counts, likedSet, repostedSet)).join('')
        likedSet.forEach(pid => syncPostLike(pid, true, 0))
        repostedSet.forEach(pid => syncPostRepost(pid, true, 0))

        list.querySelectorAll('.feed-post.feed-post-video').forEach(card => {
            attachVideoCardClick(card)
            attachVideoProgress(card)
            attachVideoLoading(card)
            checkVideoState(card)
        })

        list.querySelectorAll('.feed-action[data-toggle]').forEach(btn => btn.addEventListener('click', async () => {
            const pid = btn.dataset.toggle, isHidden = btn.classList.contains('hidden-post')
            await supabase.from('posts').update({ show_in_profile:isHidden }).eq('id', pid); renderLiveFeed()
        }))
        list.querySelectorAll('.feed-more').forEach(btn => btn.addEventListener('click', async e => {
            e.stopPropagation()
            const pid = btn.dataset.pid, author = btn.dataset.author, isMine = btn.dataset.mine === '1'
            const videoSrc = btn.closest('.feed-post-video')?.dataset.videoSrc
            const card = btn.closest('.feed-post')
            const items = []
            if(videoSrc) items.push({ label:'Полноэкранный режим', icon:ICONS.fullscreen, onClick: () => enterVideoFS(videoSrc, pid) })
            items.push({ label:'Поделиться', icon:ICONS.share, onClick: () => openShareSheet({ type:'post', postId:pid, src:videoSrc, title: card?.querySelector('.feed-post-content')?.textContent || '' }) })
            if(isMine) items.push({ label:'Удалить', icon:ICONS.trash, danger:true, onClick: async () => { if(!confirm('Удалить?')) return; await supabase.from('posts').delete().eq('id', pid); renderLiveFeed() } })
            else {
                items.push({ label:'Ответить', icon:ICONS.reply, onClick: () => replyToUser(pid, author) })
                items.push({ label:'Репост', icon:ICONS.repost, onClick: async () => { await toggleRepostGlobal(pid) } })
                items.push({ label:'Пожаловаться', icon:ICONS.flag, danger:true, onClick: () => openReportModal({
                        targetType: card?.dataset.videoSrc ? 'video' : 'post',
                        targetId: pid,
                        author: { username: author, full_name: author },
                        media: card?.dataset.videoSrc,
                        text: card?.querySelector('.feed-post-content')?.textContent || ''
                    }) })
            }
            showActionSheet(isMine ? 'Ваш пост' : 'Действия', items)
        }))
        list.querySelectorAll('.feed-action[data-reply]').forEach(btn => btn.addEventListener('click', () => replyToUser(btn.dataset.reply, btn.dataset.author)))
        list.querySelectorAll('.feed-action[data-repost]').forEach(btn => btn.addEventListener('click', () => toggleRepostGlobal(btn.dataset.repost)))
        list.querySelectorAll('.feed-action[data-like]').forEach(btn => btn.addEventListener('click', () => toggleLikeGlobal(btn.dataset.like)))
        list.querySelectorAll('.feed-post-avatar[data-uid]').forEach(a => a.addEventListener('click', () => openUserProfile(a.dataset.uid)))
    } catch(e){ if(!silent) list.innerHTML = `<p class="empty">Ошибка: ${e.message}</p>` }
}

function renderLivePost(post, myId, postsMap, counts = {}, likedSet = new Set(), repostedSet = new Set()){
    const p = post.profiles || {}
    const name = p.full_name || p.username || 'Пользователь'
    const uname = p.username || 'user'
    const time = new Date(post.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
    const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
    const emoji = statusEmoji(computeDisplayStatus(p))
    const isMine = myId && post.author_id === myId
    const hidden = post.show_in_profile === false
    const rc = counts[post.id]?.reposts || 0
    const isRep = repostedSet.has(post.id)
    const isVideo = isVideoUrl(post.media_url)
    const adminMark = p.is_admin ? adminBadge(true) : ''

    let replyBlock = ''
    if(post.reply_to && postsMap[post.reply_to]){
        const orig = postsMap[post.reply_to]
        const origP = orig.profiles || {}
        const origUser = origP.username || 'user'
        replyBlock = `<div class="feed-reply-context">@${escapeHtml(uname)} ответил <a data-uid-ref="${orig.author_id}">@${escapeHtml(origUser)}</a> на <a data-pid-ref="${post.reply_to}">пост</a></div>`
    } else if(post.reply_to){
        replyBlock = `<div class="feed-reply-context">@${escapeHtml(uname)} ответил на <a data-pid-ref="${post.reply_to}">пост</a></div>`
    }

    if(!isVideo){
        const media = renderMedia(post.media_url, 'feed-post-image', {
            title: post.media_title || post.title,
            postId: post.id,
            username: uname
        })
        const footer = isMine
            ? `<div class="feed-post-footer" style="justify-content:flex-end;border-top:none;padding-top:8px;margin-top:8px;gap:12px"><button class="feed-action profile-toggle ${hidden ? 'hidden-post' : ''}" data-toggle="${post.id}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="feed-more" data-pid="${post.id}" data-author="${uname}" data-mine="1">${ICONS.dots}</button></div>`
            : `<div class="feed-post-footer">
                <button class="feed-action" data-reply="${post.id}" data-author="${uname}">${ICONS.reply}</button>
                <button class="feed-action ${isRep?'reposted':''}" data-repost="${post.id}" ${isRep?'style="color:var(--green)"':''}>${ICONS.repost}<span class="feed-count" data-repost-count="${post.id}">${rc}</span></button>
                <button class="feed-action" data-share="${post.id}">${ICONS.share}</button>
                <button class="feed-more" data-pid="${post.id}" data-author="${uname}" data-mine="0">${ICONS.dots}</button>
              </div>`

        return `<article class="feed-post" data-live="1" data-pid="${post.id}">${replyBlock}<div class="feed-post-header"><div class="feed-post-avatar avatar-with-status" data-uid="${post.author_id}">${av}<div class="story-status-badge">${emoji}</div></div>
<div class="feed-post-info">
    <div class="feed-post-name">${escapeHtml(name)}${adminMark}</div>
    ${buildMetaRow(time, 'live chat', post)}
</div>
</div><div class="feed-post-content">${escapeHtml(post.content || '')}</div>${media}${footer}</article>`
    }

    const footer = isMine
        ? `<div class="feed-post-footer" style="justify-content:flex-end;border-top:none;padding-top:8px;margin-top:8px;gap:12px"><button class="feed-action profile-toggle ${hidden ? 'hidden-post' : ''}" data-toggle="${post.id}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="feed-more" data-pid="${post.id}" data-author="${uname}" data-mine="1">${ICONS.dots}</button></div>`
        : `<div class="feed-post-footer">
            <button class="feed-action" data-reply="${post.id}" data-author="${uname}">${ICONS.reply}</button>
            <button class="feed-action ${isRep?'reposted':''}" data-repost="${post.id}" ${isRep?'style="color:var(--green)"':''}>${ICONS.repost}<span class="feed-count" data-repost-count="${post.id}">${rc}</span></button>
            <button class="feed-action" data-share="${post.id}">${ICONS.share}</button>
            <button class="feed-more" data-pid="${post.id}" data-author="${uname}" data-mine="0">${ICONS.dots}</button>
          </div>`

    return `<article class="feed-post feed-post-video" data-live="1" data-pid="${post.id}" data-video-src="${post.media_url}">
        <video class="post-bg-video" src="${post.media_url}" autoplay muted loop playsinline preload="metadata"></video>
        <div class="post-bg-overlay"></div>
        <div class="feed-post-video-hint" style="white-space:nowrap">нажмите чтобы посмотреть</div>
        ${replyBlock}
        <div class="feed-post-header"><div class="feed-post-avatar avatar-with-status" data-uid="${post.author_id}">${av}<div class="story-status-badge">${emoji}</div></div><div class="feed-post-info"><div class="feed-post-name">${escapeHtml(name)}${adminMark}</div><div class="feed-post-time">${time}</div></div></div>
        <div class="feed-post-content">${escapeHtml(post.content || '')}</div>
        ${footer}
    </article>`
}

document.addEventListener('click', e => {
    const uidRef = e.target.closest('[data-uid-ref]')
    const pidRef = e.target.closest('[data-pid-ref]')
    if(uidRef){ e.preventDefault(); openUserProfile(uidRef.dataset.uidRef) }
    if(pidRef){ e.preventDefault(); const pid = pidRef.dataset.pidRef; document.querySelector(`.feed-post[data-pid="${pid}"]`)?.scrollIntoView({ behavior:'smooth', block:'center' }) }
})

/* ============================================================
   PROFILE TOPBAR
============================================================ */
function updateProfileTopbar(){
    const screen = $('screen-profile'); if(!screen) return
    const topbar = screen.querySelector('.topbar'); if(!topbar) return

    if(state.viewingOwnProfile){
        topbar.innerHTML = `
            <button class="topbar-btn" data-menu="open"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
            <div class="topbar-logo-static">профиль</div>
            <div style="display:flex;gap:4px;align-items:center">
                <button class="topbar-btn" id="profile-share-own" title="Поделиться"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></button>
                <button class="topbar-btn topbar-star" data-prioriti="open"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2l2.9 6.9L22 9.6l-5.5 4.8 1.7 7.1L12 17.8 5.8 21.5l1.7-7.1L2 9.6l7.1-.7z"/></svg></button>
            </div>`
        $('profile-share-own')?.addEventListener('click', () => {
            const { data:{ user } } = supabase.auth.getUser().then(({ data }) => {
                if(data.user) openShareSheet({ type:'profile', profileId: data.user.id })
            })
        })
    } else {
        topbar.innerHTML = `
            <button class="topbar-btn" id="profile-back-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>
            <div class="topbar-logo-static" id="profile-topbar-name">@user</div>
            <div style="display:flex;gap:4px;align-items:center">
                <button class="topbar-btn" id="profile-share-btn" title="Поделиться"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></button>
                <button class="topbar-btn" id="profile-dots-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button>
            </div>`
        $('profile-back-btn').addEventListener('click', () => { state.currentProfileViewId = null; state.viewingOwnProfile = true; switchScreen('home') })
        $('profile-share-btn').addEventListener('click', () => {
            if(state.currentProfileViewId) openShareSheet({ type:'profile', profileId: state.currentProfileViewId })
        })
        $('profile-dots-btn').addEventListener('click', async () => { /* … оставить как было … */ })
    }
}

/* ============================================================
   PROFILE LOAD
============================================================ */
async function loadProfile(userId = null){
    const loader = $('profile-loader'), body = $('profile-body')
    loader.classList.remove('hidden'); body.classList.add('hidden')
    try {
        const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
        await refreshFollowCache()
        state.currentUser = user
        const targetId = userId || user.id
        state.currentProfileViewId = userId
        state.viewingOwnProfile = (targetId === user.id)
        updateProfileTopbar()

        const { data:profile } = await supabase.from('profiles').select('*').eq('id', targetId).maybeSingle()
        let iBlocked = false
        if(targetId !== user.id){
            const { data:blockRow } = await supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', targetId).maybeSingle()
            iBlocked = !!blockRow
        }
        state.currentProfilePrivacy = (targetId === user.id) ? {} : (profile?.privacy || {})

        if(profile){
            state.currentProfile = profile
            const uname = profile.username || 'user'
            const fname = profile.full_name || 'Пользователь'
            $('profile-name').innerHTML = escapeHtml(fname) + (profile.is_admin ? adminBadge(true, 'big') : '')
            $('profile-username').textContent = '@' + uname
            $('profile-bio').textContent = profile.bio || 'Описание пока не добавлено'
            const av = $('profile-avatar')
            if(profile.avatar_url) av.innerHTML = `<img src="${profile.avatar_url}" alt="">`
            else av.textContent = fname.charAt(0).toUpperCase()
            const topName = $('profile-topbar-name'); if(topName) topName.textContent = '@' + uname
            if(iBlocked){ $('stat-posts').textContent = '0'; $('stat-subs').textContent = '0'; $('stat-followers').textContent = '0' }
            else {
                const [postsRes, subsRes, followersRes] = await Promise.all([
                    supabase.from('posts').select('*', { count:'exact', head:true }).eq('author_id', targetId),
                    supabase.from('follows').select('*', { count:'exact', head:true }).eq('follower_id', targetId),
                    supabase.from('follows').select('*', { count:'exact', head:true }).eq('following_id', targetId)
                ])
                $('stat-posts').textContent = postsRes.count || 0
                $('stat-subs').textContent = subsRes.count || 0
                $('stat-followers').textContent = followersRes.count || 0
            }
        }
        await renderProfileActions(targetId, user.id, iBlocked)
        if(iBlocked) renderBlockedContent()
        else if(state.profileTab === 'posts') await renderMyPosts(targetId)
        else renderProfileTab()
    } catch(e){ console.warn(e.message) }
    finally { loader.classList.add('hidden'); body.classList.remove('hidden') }
}

function renderBlockedContent(){
    $('profile-content').innerHTML = `<div class="blocked-banner"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M5.5 5.5l13 13" stroke-linecap="round"/></svg><h3>Вы заблокировали пользователя</h3></div>`
}

async function renderProfileActions(targetId, myId, iBlocked){
    const box = $('profile-actions'); box.innerHTML = ''
    if(targetId === myId){
        const wrap = document.createElement('div'); wrap.className = 'profile-actions-own'
        const editBtn = document.createElement('button'); editBtn.className = 'profile-edit-btn'; editBtn.textContent = 'Изменить профиль'
        editBtn.addEventListener('click', () => switchScreen('settings'))
        wrap.appendChild(editBtn)
        box.appendChild(wrap)
        return
    }
    const { data:isSub } = await supabase.from('follows').select('id').eq('follower_id', myId).eq('following_id', targetId).maybeSingle()
    const following = !!isSub
    const wrap = document.createElement('div'); wrap.className = 'profile-actions-other'
    const followBtn = document.createElement('button'); followBtn.className = 'btn-follow ' + (following ? 'following' : ''); followBtn.textContent = following ? 'Отписаться' : 'Подписаться'
    followBtn.addEventListener('click', async () => { /* … оставить как было … */ })
    const giftBtn = document.createElement('button'); giftBtn.className = 'btn-icon-round btn-gift-round'; giftBtn.innerHTML = ICONS.gift
    giftBtn.addEventListener('click', () => openPrioriti())
    // share уже в топбаре — здесь только follow + gift
    wrap.appendChild(followBtn); wrap.appendChild(giftBtn)
    box.appendChild(wrap)
}

document.querySelectorAll('#profile-tabs .profile-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('#profile-tabs .profile-tab').forEach(t => t.classList.remove('active'))
    tab.classList.add('active'); state.profileTab = tab.dataset.ptab; renderProfileTab()
}))

async function renderProfileTab(){
    const box = $('profile-content'), wrap = $('new-post-wrap')
    if(wrap) wrap.classList.toggle('hidden', !(state.viewingOwnProfile && state.profileTab === 'posts'))

    const priv = state.currentProfilePrivacy || {}
    const isForeign = !state.viewingOwnProfile

    if(state.profileTab === 'posts'){
        if(isForeign && priv.hide_posts) return box.innerHTML = '<p class="empty">Посты скрыты</p>'
        return renderMyPosts(state.currentProfileViewId)
    }
    if(state.profileTab === 'reposts'){
        if(isForeign && priv.hide_reposts) return box.innerHTML = '<p class="empty">Репосты скрыты</p>'
        return renderMyReposts(state.currentProfileViewId || state.currentUser?.id)
    }
    if(state.profileTab === 'liked'){
        if(isForeign && priv.hide_likes) return box.innerHTML = '<p class="empty">Лайки скрыты</p>'
        return renderMyLiked(state.currentProfileViewId || state.currentUser?.id)
    }
    if(state.profileTab === 'channels'){
        if(isForeign && priv.hide_channels) return box.innerHTML = '<p class="empty">Каналы скрыты</p>'
        return renderProfileChannels(state.currentProfileViewId || state.currentUser?.id)
    }
    if(state.profileTab === 'gifts'){
        if(isForeign && priv.hide_gifts) return box.innerHTML = '<p class="empty">Подарки скрыты</p>'
        return box.innerHTML = '<p class="empty">Подарков пока нет</p>'
    }
    if(state.profileTab === 'tracks') return renderProfileTracks(state.currentProfileViewId || state.currentUser?.id)
    if(state.profileTab === 'shop') return box.innerHTML = '<p class="empty">Магазин — скоро</p>'
    box.innerHTML = '<p class="empty">Пока пусто</p>'
}

function renderProfilePost(p, myId, likedSet = new Set(), repostedSet = new Set(), counts = {}){
    const prof = p.profiles || {}
    const ch = p.channels || {}
    const name = prof.full_name || prof.username || 'Пользователь'
    const avContent = prof.avatar_url ? `<img src="${prof.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
    const emoji = statusEmoji(computeDisplayStatus(prof))
    const time = new Date(p.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
    const isMine = p.author_id === myId
    const isVideo = isVideoUrl(p.media_url)
    const isRep = repostedSet.has(p.id)
    const rc = counts[p.id]?.reposts || 0
    const adminMark = prof.is_admin ? adminBadge(true) : ''

    let channelBadge = ''
    if(ch.id){
        const chName = ch.name || 'Канал'
        const chLogo = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : chName.charAt(0).toUpperCase()
        channelBadge = `<button class="feed-channel-badge" data-chbadge="${ch.id}"><span class="feed-channel-logo">${chLogo}</span><span class="feed-channel-name">${escapeHtml(chName)}</span></button>`
    }

    let subBtn = ''
    if(!isMine && ch.id){
        const isSub = state.myChannelSubs.has(ch.id)
        subBtn = `<button class="feed-sub-btn ${isSub ? 'subscribed' : ''}" data-chid="${ch.id}">${isSub ? ICONS.checkSmall : ICONS.plus}</button>`
    }

    const moreBtn = `<button class="feed-more profile-post-more" data-pid="${p.id}" data-author="${prof.username||'user'}" data-mine="${isMine ? 1 : 0}" data-channel="${p.channel_id||''}">${ICONS.dots}</button>`

    let sourceLine = ''
    if(!ch.id){
        sourceLine = `<div class="profile-post-source-line">из LIVE CHAT</div>`
    }

    const header = `<div class="feed-post-header">
    <div class="feed-post-avatar avatar-with-status" data-uid="${p.author_id}">${avContent}<div class="story-status-badge">${emoji}</div></div>
    <div class="feed-post-info">
        <div class="feed-post-name">${escapeHtml(name)}${adminMark}${channelBadge}</div>
        ${buildMetaRow(time, ch.id ? 'пост канала' : 'из live chat', p)}
    </div>
    ${subBtn}
</div>`

    const pollHtml = p.poll ? renderPoll(p.poll, p.id) : ''

    if(!isVideo){
        const media = renderMedia(p.media_url, 'feed-post-image', { title: p.media_title, postId: p.id, username: prof.username || 'user' })
        const lc = counts[p.id]?.likes || 0
        const cc = counts[p.id]?.comments || 0
        const isLiked = likedSet.has(p.id)
        return `<article class="feed-post" data-pid="${p.id}" style="margin-bottom:12px" data-channel="${p.channel_id||''}">
        ${sourceLine}
        ${header}
        <div class="feed-post-content">${escapeHtml(p.content || '')}</div>
        ${media}${pollHtml}
        <div class="feed-post-footer">
            <button class="feed-action ${isLiked?'liked':''}" data-like="${p.id}">${isLiked?ICONS.heartFill:ICONS.heart}<span class="feed-count" data-like-count="${p.id}">${lc}</span></button>
            <button class="feed-action" data-comment="${p.id}">${ICONS.comment}<span class="feed-count" data-comment-count="${p.id}">${cc}</span></button>
            <button class="feed-action ${isRep?'reposted':''}" data-repost="${p.id}" ${isRep?'style="color:var(--green)"':''}>${ICONS.repost}<span class="feed-count" data-repost-count="${p.id}">${rc}</span></button>
            <button class="feed-action" data-share="${p.id}">${ICONS.share}</button>
            ${moreBtn}
        </div>
    </article>`
    }

    const lc = counts[p.id]?.likes || 0
    const cc = counts[p.id]?.comments || 0
    const isLiked = likedSet.has(p.id)
    return `<article class="feed-post feed-post-video" data-pid="${p.id}" data-channel="${p.channel_id||''}" data-video-src="${p.media_url}" style="margin-bottom:12px">
    <video class="post-bg-video" src="${p.media_url}" autoplay muted loop playsinline preload="metadata"></video>
    <div class="post-bg-overlay"></div>
    <div class="feed-post-video-hint" style="white-space:nowrap">нажмите чтобы посмотреть</div>
    ${sourceLine}
    ${header}
    <div class="feed-post-content">${escapeHtml(p.content || '')}</div>
    ${pollHtml}
    <div class="feed-post-footer">
        <button class="feed-action ${isLiked?'liked':''}" data-like="${p.id}">${isLiked?ICONS.heartFill:ICONS.heart}<span class="feed-count" data-like-count="${p.id}">${lc}</span></button>
        <button class="feed-action" data-comment="${p.id}">${ICONS.comment}<span class="feed-count" data-comment-count="${p.id}">${cc}</span></button>
        <button class="feed-action ${isRep?'reposted':''}" data-repost="${p.id}" ${isRep?'style="color:var(--green)"':''}>${ICONS.repost}<span class="feed-count" data-repost-count="${p.id}">${rc}</span></button>
        <button class="feed-action" data-share="${p.id}">${ICONS.share}</button>
        ${moreBtn}
    </div>
</article>`
}

async function renderMyLiked(userId){
    const box = $('profile-content'); box.innerHTML = loadingBlock()
    const { data:{ user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('likes').select(`post_id, posts:post_id ( id, content, media_url, media_title, created_at, author_id, channel_id, show_in_profile, profiles:author_id ( username, full_name, avatar_url, status, is_admin ), channels:channel_id ( id, name, avatar_url ) )`).eq('user_id', userId).order('created_at', { ascending:false }).limit(50)
    if(!data || !data.length){ box.innerHTML = '<p class="empty">Ничего не понравилось</p>'; return }
    const posts = data.map(l => l.posts).filter(p => p && p.id)
    const counts = await fetchCounts(posts.map(p => p.id))
    const [{ data:likes }, { data:reps }] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', posts.map(p => p.id)),
        supabase.from('reposts').select('post_id').eq('user_id', user.id).in('post_id', posts.map(p => p.id))
    ])
    const likedSet = new Set((likes||[]).map(l => l.post_id))
    const repostedSet = new Set((reps||[]).map(r => r.post_id))
    box.innerHTML = posts.map(p => renderProfilePost(p, user.id, likedSet, repostedSet, counts)).join('')
    attachFeedActions(box, user.id)
    setTimeout(initTrackObserver, 100)
}

async function renderMyReposts(userId){
    const box = $('profile-content'); box.innerHTML = loadingBlock()
    const { data:{ user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('reposts').select(`id, posts:post_id ( id, content, media_url, media_title, created_at, author_id, channel_id, show_in_profile, profiles:author_id ( username, full_name, avatar_url, status, is_admin ), channels:channel_id ( id, name, avatar_url ) )`).eq('user_id', userId).order('created_at', { ascending:false }).limit(50)
    if(!data || !data.length){ box.innerHTML = '<p class="empty">Репостов пока нет</p>'; return }
    const posts = data.map(r => r.posts).filter(p => p && p.id)
    const counts = await fetchCounts(posts.map(p => p.id))
    const [{ data:likes }, { data:reps }] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', posts.map(p => p.id)),
        supabase.from('reposts').select('post_id').eq('user_id', user.id).in('post_id', posts.map(p => p.id))
    ])
    const likedSet = new Set((likes||[]).map(l => l.post_id))
    const repostedSet = new Set((reps||[]).map(r => r.post_id))
    box.innerHTML = posts.map(p => renderProfilePost(p, user.id, likedSet, repostedSet, counts)).join('')
    attachFeedActions(box, user.id)
    setTimeout(initTrackObserver, 100)
}

async function renderProfileChannels(userId){
    const box = $('profile-content'); box.innerHTML = loadingBlock()
    const { data:subs } = await supabase.from('subscriptions').select('channel_id, channels ( id, name, description, avatar_url, owner_id )').eq('follower_id', userId)
    const channels = (subs || []).map(s => s.channels).filter(Boolean)
    const { data:own } = await supabase.from('channels').select('id, name, description, avatar_url, owner_id').eq('owner_id', userId)
    const all = [...(own || []), ...channels]
    const unique = Array.from(new Map(all.map(c => [c.id, c])).values())
    if(!unique.length){ box.innerHTML = '<p class="empty small">Нет каналов</p>'; return }
    box.innerHTML = unique.map(c => {
        const av = c.avatar_url ? `<img src="${c.avatar_url}" alt="">` : (c.name || 'K').charAt(0).toUpperCase()
        const isOwner = c.owner_id === userId
        return `<button class="chan-item" data-ch="${c.id}"><div class="chan-item-icon">${av}</div><div class="chan-item-info"><div class="chan-item-name">${escapeHtml(c.name || 'Канал')}</div><div class="chan-item-sub">${escapeHtml(c.description || '')}</div><div class="chan-item-role" style="${isOwner ? '' : 'color:var(--text-secondary)'}">${isOwner ? 'Владелец' : 'Участник'}</div></div></button>`
    }).join('')
    box.querySelectorAll('.chan-item[data-ch]').forEach(b => b.addEventListener('click', () => openChannel(b.dataset.ch)))
}

async function renderMyPosts(userId = null){
    const box = $('profile-content'); box.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const targetId = userId || user.id
        const { data, error } = await supabase.from('posts')
            .select('id, content, created_at, author_id, media_url, media_title, channel_id, show_in_profile, poll, profiles ( username, full_name, avatar_url, status, region, is_admin ), channels:channel_id ( id, name, avatar_url )')
            .eq('author_id', targetId).order('created_at', { ascending:false }).limit(60)
        if(error){ box.innerHTML = `<p class="empty">Ошибка: ${error.message}</p>`; return }
        if(!data.length){ box.innerHTML = '<p class="empty">Пока нет постов</p>'; return }
        const counts = await fetchCounts(data.map(p => p.id))
        const [{ data:likes }, { data:reps }] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', data.map(p => p.id)),
            supabase.from('reposts').select('post_id').eq('user_id', user.id).in('post_id', data.map(p => p.id))
        ])
        const likedSet = new Set((likes||[]).map(l => l.post_id))
        const repostedSet = new Set((reps||[]).map(r => r.post_id))
        box.innerHTML = data.map(p => renderProfilePost(p, user.id, likedSet, repostedSet, counts)).join('')
        attachFeedActions(box, user.id)
        setTimeout(initTrackObserver, 100)
    } catch(e){ box.innerHTML = `<p class="empty">Ошибка: ${e.message}</p>` }
}

async function renderProfileTracks(userId){
    const box = $('profile-content')
    box.innerHTML = loadingBlock()
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    const { data:profile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).maybeSingle()
    const whoName = profile?.full_name || profile?.username || 'Пользователь'
    const { data } = await supabase.from('saved_tracks')
        .select(`post_id, created_at, posts:post_id ( id, content, media_url, media_title, created_at, author_id, channel_id, profiles:author_id ( username, full_name, avatar_url, region, is_admin ), channels:channel_id ( id, name, avatar_url ) )`)
        .eq('user_id', userId)
        .order('created_at', { ascending:false }).limit(50)
    const items = (data || []).map(x => x.posts).filter(Boolean)
    if(!items.length){ box.innerHTML = '<p class="empty">Треков пока нет</p>'; return }
    box.innerHTML = items.map(p => {
        const prof = p.profiles || {}
        const ch = p.channels || {}
        const name = prof.full_name || prof.username || 'user'
        const avContent = prof.avatar_url ? `<img src="${prof.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
        const time = new Date(p.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
        let sourceLine = ''
        if(p.channel_id && ch.id){
            const chName = ch.name || 'Канал'
            const chLogo = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : chName.charAt(0).toUpperCase()
            sourceLine = `<div class="profile-post-source-line channel-source"><span class="feed-channel-logo">${chLogo}</span><span class="chat-name">${escapeHtml(chName)}</span></div>`
        } else {
            sourceLine = `<div class="profile-post-source-line">из LIVE CHAT</div>`
        }
        return `<div class="feed-post" data-pid="${p.id}" style="margin-bottom:12px">
            <div class="profile-post-source-line" style="color:var(--blue)"><strong>${escapeHtml(whoName)}</strong>&nbsp;сохранил</div>
            ${sourceLine}
            <div class="feed-post-header">
                <div class="feed-post-avatar avatar-with-status" data-uid="${p.author_id}">${avContent}</div>
                <div class="feed-post-info">
    <div class="feed-post-name">${escapeHtml(name)}${prof.is_admin ? adminBadge(true) : ''}</div>
    ${buildMetaRow(time, 'live chat', p)}
</div>
            </div>
            <div class="feed-post-content">${escapeHtml(p.content || '')}</div>
            ${renderMedia(p.media_url, 'feed-post-image', { title: p.media_title, postId: p.id, username: prof.username || 'user' })}
        </div>`
    }).join('')
    box.querySelectorAll('.feed-post-avatar[data-uid]').forEach(a => a.addEventListener('click', () => openUserProfile(a.dataset.uid)))
    setTimeout(initTrackObserver, 100)
}

/* ============================================================
   PART 3 / 3 — openUserProfile() → конец файла
============================================================ */

function openUserProfile(userId){
    if (!userId || userId === 'false' || userId === false || userId === 'null' || userId === 'undefined'){
        console.warn('[openUserProfile] skipped invalid userId:', userId)
        return
    }
    if (!isUuid(userId)){
        console.warn('[openUserProfile] not a uuid:', userId, '— ищу по нику/коду');
        (async () => {
            const { data } = await supabase.from('profiles')
                .select('id')
                .or(`username.eq.${userId.toLowerCase()},public_id.eq.${userId.toUpperCase()}`)
                .maybeSingle();
            if (data?.id) {
                openUserProfile(data.id);
            } else {
                showToast('error', 'Профиль не найден', { icon:'⚠️' });
            }
        })();
        return;
    }
    state.currentProfileViewId = userId
    state.viewingOwnProfile = false
    Router.push('/?u=' + userId)
    ;(async () => {
        try {
            const { data } = await supabase.from('profiles')
                .select('username').eq('id', userId).maybeSingle()
            if (data?.username) Router.replace('/@' + data.username)
        } catch(e){ console.warn('[openUserProfile]', e.message) }
    })()
    switchScreen('profile')
}

document.addEventListener('click', e => {
    if(e.target.closest('#new-post-btn') && state.viewingOwnProfile) showNewPostPicker()
})

async function showNewPostPicker(){
    let channels = []
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const { data } = await supabase.from('channels').select('id, name').eq('owner_id', user.id)
        channels = data || []
    } catch {}
    const items = []
    if(channels.length){ channels.forEach(c => items.push({ label:`Канал: ${c.name}`, icon:ICONS.send, onClick: () => openChannel(c.id) })) }
    else items.push({ label:'Нет доступных каналов', icon:ICONS.send, onClick: () => {} })
    items.push({ label:'Новый пост в Global live chat', icon:ICONS.reply, onClick: () => { switchScreen('inbox'); openLiveChat('global', 'Global') } })
    const r = COUNTRIES.find(c => c.code === state.data.region)
    items.push({ label:`Новый пост в live chat · ${r ? r.name : 'Регион'}`, icon:ICONS.reply, onClick: () => { switchScreen('inbox'); openLiveChat('region', r ? `${r.flag} ${r.name}` : 'Регион') } })
    showActionSheet('Новый пост', items)
}

/* ============================================================
   QR
============================================================ */
const GRADIENTS = [
    ['#ff9f0a','#ff375f','#bf5af2'],['#30d158','#ffd60a','#ff9f0a'],['#0a84ff','#bf5af2','#ff375f'],['#ff375f','#ffd60a','#30d158'],
    ['#5e5ce6','#0a84ff','#30d158'],['#ff453a','#ff9f0a','#ffd60a'],['#26a5e4','#5e5ce6','#bf5af2'],['#a56a3a','#ff9f0a','#ffd60a']
]
const FULL_GRADIENTS = [
    ['#ff9f0a','#ff375f','#bf5af2'],['#30d158','#0a84ff','#bf5af2'],['#0a84ff','#bf5af2','#ff375f'],['#ff375f','#ffd60a','#30d158'],
    ['#5e5ce6','#0a84ff','#30d158'],['#ff453a','#ff9f0a','#ffd60a'],['#26a5e4','#5e5ce6','#bf5af2'],['#a56a3a','#ff9f0a','#ffd60a'],
    ['#30d158','#ffd60a','#ff9f0a'],['#bf5af2','#ff375f','#0a84ff']
]
function applyRandomQrGradient(){
    const g = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
    const sheet = $('qr-modal')?.querySelector('.qr-sheet')
    if(sheet){ sheet.style.background = `linear-gradient(135deg,${g[0]},${g[1]},${g[2]})`; sheet.classList.add('animated') }
    const els = [$('qr-name'), $('qr-username'), $('qr-pid'), document.querySelector('.qr-pid-label'), document.querySelector('.qr-section-title')]
    els.forEach(el => { if(el) el.style.color = '#fff' })
}
async function openQrModal(){
    const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
    const { data:profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if(!profile) return
    const fname = profile.full_name || 'Пользователь'
    const uname = profile.username || 'user'
    const pid = profile.public_id || user.id.slice(0, 10).toUpperCase()
    const shareUrl = `${location.origin}${urlFor('profile', profile.username || user.id)}`
    const av = $('qr-avatar')
    if(profile.avatar_url) av.innerHTML = `<img src="${profile.avatar_url}" alt="">`
    else av.textContent = fname.charAt(0).toUpperCase()
    $('qr-name').textContent = fname
    $('qr-username').textContent = '@' + uname
    $('qr-pid').textContent = pid
    const qrImg = $('qr-image'), fb = $('qr-fallback')
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(shareUrl)}`
    qrImg.onerror = () => { qrImg.classList.add('hidden'); fb?.classList.remove('hidden') }
    qrImg.onload = () => { qrImg.classList.remove('hidden'); fb?.classList.add('hidden') }
    const socBox = $('qr-socials')
    socBox.innerHTML = SHARE_SOCIALS.map(s => `<button class="qr-social-btn" data-sk="${s.key}" style="background:${s.bg}">${s.svg}</button>`).join('')
    socBox.querySelectorAll('.qr-social-btn').forEach(btn => btn.addEventListener('click', () => {
        const s = SHARE_SOCIALS.find(x => x.key === btn.dataset.sk); if(!s) return
        if(s.key === 'copy'){ navigator.clipboard?.writeText(shareUrl); showToast('success', 'Ссылка скопирована', { icon:'✓' }); return }
        if(s.key === 'scan'){ closeQrModal(); openQrScanModal(); return }
        if(s.url) window.open(s.url(shareUrl), '_blank')
    }))
    $('qr-copy-id').onclick = () => { navigator.clipboard?.writeText(pid); showToast('success', 'ID скопирован', { icon:'✓' }) }
    $('qr-cancel').onclick = closeQrModal
    $('qr-backdrop').onclick = closeQrModal
    $('qr-scan-btn').onclick = () => { closeQrModal(); openQrScanModal() }
    const frame = $('qr-frame'); if(frame) frame.onclick = applyRandomQrGradient
    applyRandomQrGradient()
    const modal = $('qr-modal'); modal.classList.remove('hidden'); void modal.offsetWidth
    requestAnimationFrame(() => modal.classList.add('open'))
}
function closeQrModal(){
    const modal = $('qr-modal'); if(!modal) return
    modal.classList.remove('open')
    setTimeout(() => { if(!modal.classList.contains('open')) modal.classList.add('hidden') }, 380)
}
async function openQrScanModal(){
    const modal = $('qr-scan-modal')
    modal.classList.remove('hidden'); void modal.offsetWidth
    requestAnimationFrame(() => modal.classList.add('open'))
    $('qr-scan-input').value = ''
    let stream = null, detector = null, rafId = null
    const video = $('qr-video'), hint = $('qr-scan-hint')
    try {
        if('BarcodeDetector' in window){
            stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } })
            video.srcObject = stream; await video.play()
            detector = new window.BarcodeDetector({ formats:['qr_code'] })
            hint.textContent = 'Наведите камеру на QR'
            const scan = async () => {
                if(!detector || video.readyState < 2){ rafId = requestAnimationFrame(scan); return }
                try { const codes = await detector.detect(video); if(codes.length){ handleQrResult(codes[0].rawValue); return } } catch {}
                rafId = requestAnimationFrame(scan)
            }
            scan()
        } else hint.textContent = 'Сканер не поддерживается браузером'
    } catch(e){ hint.textContent = 'Нет доступа к камере' }
    function stopScanner(){ if(rafId) cancelAnimationFrame(rafId); if(stream) stream.getTracks().forEach(t => t.stop()) }
    async function handleQrResult(raw){
        stopScanner()
        let targetId = null
        try {
            const u = new URL(raw); const p = new URLSearchParams(u.search)
            const uid = p.get('profile') || p.get('u')
            if(uid) targetId = uid
            else if(u.pathname.includes('/@')) targetId = u.pathname.split('/@')[1]
            else if(u.pathname.startsWith('/@')) targetId = u.pathname.slice(2)
        } catch {
            const clean = raw.trim().replace(/^@/, '')
            const { data:p1 } = await supabase.from('profiles').select('id').eq('public_id', clean.toUpperCase()).maybeSingle()
            if(p1) targetId = p1.id
            else { const { data:p2 } = await supabase.from('profiles').select('id').eq('username', clean.toLowerCase()).maybeSingle(); if(p2) targetId = p2.id }
        }
        closeQrScanModal()
        if(targetId) openUserProfile(targetId)
        else showToast('error', 'Профиль не найден', { icon:'⚠️' })
    }
    $('qr-scan-cancel').onclick = () => { stopScanner(); closeQrScanModal() }
    $('qr-scan-backdrop').onclick = () => { stopScanner(); closeQrScanModal() }
    $('qr-scan-open').onclick = async () => {
        const v = $('qr-scan-input').value.trim(); if(!v) return
        stopScanner()
        const clean = v.replace(/^@/, '')
        let targetId = null
        const { data:p1 } = await supabase.from('profiles').select('id').eq('public_id', clean.toUpperCase()).maybeSingle()
        if(p1) targetId = p1.id
        else { const { data:p2 } = await supabase.from('profiles').select('id').eq('username', clean.toLowerCase()).maybeSingle(); if(p2) targetId = p2.id }
        closeQrScanModal()
        if(targetId) openUserProfile(targetId)
        else showToast('error', 'Профиль не найден', { icon:'⚠️' })
    }
}
function closeQrScanModal(){
    const modal = $('qr-scan-modal'); if(!modal) return
    modal.classList.remove('open')
    setTimeout(() => { if(!modal.classList.contains('open')) modal.classList.add('hidden') }, 380)
}

/* ============================================================
   SETTINGS
============================================================ */
$('settings-back')?.addEventListener('click', () => switchScreen('profile'))
document.querySelectorAll('.settings-tab').forEach(tab => tab.addEventListener('click', () => switchSettingsTab(tab.dataset.stab)))
function switchSettingsTab(name){
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.toggle('active', t.dataset.stab === name))
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === name))
}
async function loadSettings(){
    try {
        const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
        const { data:profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if(profile){
            const el1 = $('set-name'); if(el1) el1.value = profile.full_name || ''
            const el2 = $('set-username'); if(el2) el2.value = profile.username || ''
            const el3 = $('set-bio'); if(el3) el3.value = profile.bio || ''
            const el4 = $('set-email'); if(el4) el4.value = profile.email || user.email || ''
            const av = $('set-avatar-preview')
            if(av){ if(profile.avatar_url) av.innerHTML = `<img src="${profile.avatar_url}" alt="">`; else av.textContent = (profile.full_name || 'U').charAt(0).toUpperCase() }
            const s = profile.settings || {}
            document.querySelectorAll('[data-set]').forEach(el => { el.checked = s[el.dataset.set] !== undefined ? s[el.dataset.set] : el.checked })
            const priv = profile.privacy || {}
            document.querySelectorAll('[data-priv]').forEach(el => { el.checked = !!priv[el.dataset.priv] })
            const infoEl = (id, val) => { const el = $(id); if(el) el.textContent = val }
            const realId = profile.public_id || '—';
            const idEl = $('info-id');
            if(idEl){
                idEl.textContent = realId; idEl.dataset.publicId = realId; idEl.style.cursor = 'pointer'; idEl.title = 'Нажми, чтобы скопировать';
                if(!idEl._copyBound){
                    idEl._copyBound = true;
                    idEl.addEventListener('click', () => { if(idEl.dataset.publicId && idEl.dataset.publicId !== '—'){ navigator.clipboard?.writeText(idEl.dataset.publicId); showToast('success', 'ID скопирован: ' + idEl.dataset.publicId, { icon:'✓' }) } })
                }
            }
            infoEl('info-email', profile.email || user.email || '—')
            infoEl('info-created', new Date(user.created_at).toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' }))
            infoEl('info-last-login', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ru-RU') : '—')
            infoEl('info-provider', user.app_metadata?.provider || 'email')
            infoEl('info-region', profile.region ? (COUNTRIES.find(c => c.code === profile.region)?.name || profile.region) : '—')
            infoEl('info-2fa', profile.method && profile.method !== 'skip' ? profile.method.toUpperCase() : 'Не доступно')
            infoEl('info-verified', user.email_confirmed_at ? 'Нет методов входа' : 'Нет методов входа')
        }
        renderSettingsStatusGrid()
        applyTheme(getTheme())
    } catch(e){ console.warn(e.message) }
}
$('save-general')?.addEventListener('click', async () => {
    const btn = $('save-general'); btn.disabled = true; btn.textContent = 'Сохранение...'
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const newUsername = $('set-username').value.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')

        const { data:prof } = await supabase.from('profiles')
            .select('username, username_changed_at').eq('id', user.id).maybeSingle()

        // Проверка смены юзернейма
        if(newUsername && prof?.username !== newUsername){
            if(prof?.username_changed_at){
                const last = new Date(prof.username_changed_at).getTime()
                const week = 7 * 24 * 60 * 60 * 1000
                const elapsed = Date.now() - last
                if(elapsed < week){
                    const daysLeft = Math.ceil((week - elapsed) / (24*60*60*1000))
                    showToast('error', `Юзернейм можно менять раз в 7 дней. Осталось ${daysLeft} д.`, {icon:'⏳', duration:5000})
                    btn.disabled = false; btn.textContent = 'Сохранить изменения'
                    return
                }
            }
        }

        const update = {
            full_name: $('set-name').value.trim(),
            username: newUsername,
            bio: $('set-bio').value.trim()
        }
        if(newUsername && prof?.username !== newUsername){
            update.username_changed_at = new Date().toISOString()
        }

        const { error } = await supabase.from('profiles').update(update).eq('id', user.id)
        if(error) throw error
        showToast('success', 'Профиль сохранён', { icon:'✓' })
    } catch(e){ showToast('error', 'Ошибка: ' + e.message) }
    finally { btn.disabled = false; btn.textContent = 'Сохранить изменения' }
})
$('set-avatar')?.addEventListener('change', async e => {
    const f = e.target.files?.[0]; if(!f) return
    const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
    const url = await uploadAvatar(user.id, f)
    if(url){ $('set-avatar-preview').innerHTML = `<img src="${url}" alt="">`; showToast('success', 'Аватар обновлён', { icon:'✓' }) }
    else showToast('error', 'Не удалось загрузить')
})
$('save-privacy')?.addEventListener('click', async () => {
    const btn = $('save-privacy'); btn.disabled = true; btn.textContent = 'Сохранение...'
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const priv = {}
        document.querySelectorAll('[data-priv]').forEach(el => priv[el.dataset.priv] = el.checked)
        const { error } = await supabase.from('profiles').update({ privacy: priv }).eq('id', user.id)
        if(error) throw error
        showToast('success', 'Настройки сохранены', { icon:'✓' })
    } catch(e){ showToast('error', 'Ошибка: ' + e.message) }
    finally { btn.disabled = false; btn.textContent = 'Сохранить настройки' }
})
document.querySelectorAll('.settings-row[data-saction]').forEach(row => {
    row.addEventListener('click', () => {
        const a = row.dataset.saction
        if(a === 'share-account'){ switchScreen('profile'); setTimeout(openQrModal, 250); return }
        if(a === 'scan-qr'){ openQrScanModal(); return }
        if(a === 'clear-cache'){ localStorage.removeItem('lt_cache'); showToast('success', 'Кэш очищен', { icon:'✓' }); return }
        if(a === 'force-reload'){ location.reload(); return }
        if(a === 'stats'){ showToast('info', 'Ваша статистика — скоро', { icon:'📊' }); return }
        if(a === 'support' || a === 'terms' || a === 'about'){ showToast('info', 'Раздел — скоро', { icon:'⏳' }); return }
        if(a === 'delete-request'){ showToast('info', 'Запрос на удаление — скоро', { icon:'⏳' }); return }
        const label = row.querySelector('.settings-row-text')?.childNodes[0]?.textContent.trim() || 'Раздел'
        showToast('info', '«' + label + '» — скоро', { icon:'⏳' })
    })
})
$('logout-from-settings-v2')?.addEventListener('click', async () => { if(!confirm('Выйти из аккаунта?')) return; await supabase.auth.signOut(); showScreen('auth') })
$('logout-from-settings')?.addEventListener('click', async () => { if(!confirm('Выйти?')) return; await supabase.auth.signOut(); showScreen('auth') })
$('delete-account')?.addEventListener('click', () => showActionSheet('Удалить аккаунт?', [{ label:'Да, удалить', icon:ICONS.trash, danger:true, onClick: () => {} }, { label:'Отмена', onClick: () => {} }]))

/* ============================================================
   CHANNELS
============================================================ */
async function renderChannels(){
    const stage = $('chan-hero-stage')
    if(stage){ stage.classList.remove('animate'); void stage.offsetWidth; requestAnimationFrame(() => stage.classList.add('animate')) }
    const mineBox = $('chan-mine-list'), recBox = $('chan-recommend-list')
    if(!mineBox || !recBox) return
    mineBox.innerHTML = loadingBlock()
    recBox.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        await refreshFollowCache()
        const { data:myOwn } = await supabase.from('channels').select('id, name, description, avatar_url, owner_id').eq('owner_id', user.id).limit(10)
        const { data:subs } = await supabase.from('subscriptions').select('channel_id, channels ( id, name, description, avatar_url, owner_id )').eq('follower_id', user.id).limit(20)
        const subChannels = (subs || []).map(s => s.channels).filter(Boolean)
        const all = [...(myOwn || []), ...subChannels]
        const unique = Array.from(new Map(all.map(c => [c.id, c])).values())
        if(!unique.length){
            mineBox.innerHTML = `<div class="empty small" style="padding:20px;text-align:center"><p style="margin-bottom:12px">Вы не вступили ни в один канал</p><button class="btn-primary" id="chan-create-empty">Создать</button></div>`
            $('chan-create-empty')?.addEventListener('click', () => openCreateChannel())
        } else {
            mineBox.innerHTML = (await Promise.all(unique.map(async c => {
                const av = c.avatar_url ? `<img src="${c.avatar_url}" alt="">` : (c.name || 'K').charAt(0).toUpperCase()
                const { count:subsCount } = await supabase.from('subscriptions').select('*', { count:'exact', head:true }).eq('channel_id', c.id)
                const isOwner = c.owner_id === user.id
                const subIcon = isOwner ? '' : `<span class="chan-sub-icon" style="margin-left:auto;color:var(--red);display:flex">${ICONS.checkSmall}</span>`
                return `<button class="chan-item" data-ch="${c.id}"><div class="chan-item-icon">${av}</div><div class="chan-item-info"><div class="chan-item-name">${escapeHtml(c.name || 'Канал')}</div><div class="chan-item-sub">${escapeHtml(c.description || '')}</div><div class="chan-item-meta">${subsCount || 0} подписчиков</div><div class="chan-item-role" style="${isOwner ? '' : 'color:var(--text-secondary)'}">${isOwner ? 'Владелец' : 'Участник'}</div></div>${subIcon}</button>`
            }))).join('')
        }
        const exclude = new Set(unique.map(c => c.id))
        const { data:recs } = await supabase.from('channels').select('id, name, description, avatar_url').limit(20)
        const filtered = (recs || []).filter(c => !exclude.has(c.id)).slice(0, 6)
        if(!filtered.length) recBox.innerHTML = '<p class="empty small">Рекомендаций пока нет</p>'
        else recBox.innerHTML = filtered.map(c => {
            const av = c.avatar_url ? `<img src="${c.avatar_url}" alt="">` : (c.name || 'K').charAt(0).toUpperCase()
            const isSub = state.myChannelSubs.has(c.id)
            const subIcon = isSub
                ? `<span class="chan-sub-icon" style="margin-left:auto;color:var(--red);display:flex">${ICONS.checkSmall}</span>`
                : `<span class="chan-sub-icon" style="margin-left:auto;color:var(--red);display:flex">${ICONS.plus}</span>`
            return `<button class="chan-item" data-ch="${c.id}" data-chrec="1"><div class="chan-item-icon">${av}</div><div class="chan-item-info"><div class="chan-item-name">${escapeHtml(c.name || 'Канал')}</div><div class="chan-item-sub">${escapeHtml(c.description || '')}</div></div>${subIcon}</button>`
        }).join('')
        document.querySelectorAll('.chan-item[data-ch]').forEach(b => b.addEventListener('click', e => {
            const subIcon = e.target.closest('.chan-sub-icon')
            if(subIcon && b.dataset.chrec === '1'){
                e.stopPropagation()
                handleChannelRecSub(b.dataset.ch, subIcon)
                return
            }
            openChannel(b.dataset.ch)
        }))
    } catch { mineBox.innerHTML = '<p class="empty small">Ошибка</p>'; recBox.innerHTML = '<p class="empty small">Ошибка</p>' }
}
async function handleChannelRecSub(chId, el){
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return

    const isSub = state.myChannelSubs.has(chId)
    const nowSub = !isSub

    applySubState(chId, nowSub)
    if(nowSub) state.myChannelSubs.add(chId)
    else state.myChannelSubs.delete(chId)

    try {
        if(nowSub){
            await supabase.from('subscriptions').insert({ follower_id: user.id, channel_id: chId })
        } else {
            await supabase.from('subscriptions').delete().eq('follower_id', user.id).eq('channel_id', chId)
        }
        showToast('success', nowSub ? 'Подписка оформлена' : 'Отписка', { icon: nowSub ? '✓' : '👋' })
    } catch(e){
        applySubState(chId, isSub)
        if(isSub) state.myChannelSubs.add(chId)
        else state.myChannelSubs.delete(chId)
        showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    }
}

/* ============================================================
   СОЗДАНИЕ / РЕДАКТИРОВАНИЕ КАНАЛА
============================================================ */
const ccState = {
    step: 1,
    mode: 'create',
    channelId: null,
    data: { name:'', description:'', avatarFile:null, avatarUrl:null, channelType:'public', joinCode:'' },
    subsList: [], followersList: [], showAllSubs: false, showAllFollowers: false
}

const CC_TYPES = {
    public: { label:'Публичный канал', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>', desc:'Канал виден всем и может появляться в рекомендациях, listatread awards и публикациях пользователей.' },
    private: { label:'Частный канал', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>', desc:'В канал можно вступить только по коду. Частные каналы не появляются в рекомендациях, профилях и listatread awards.' },
    community: { label:'Общественный канал', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><circle cx="17" cy="9" r="2.5"/><path d="M14.5 14.5c2.5 0 4.5 2 4.5 4.5"/></svg>', desc:'В вашем канале все участники могут создавать посты. Вы также можете удалять, редактировать посты и настраивать группу лично.' }
}

async function getChannelLimitFor(userId){
    try {
        const { data:prof } = await supabase.from('profiles').select('chvad_active, subscription').eq('id', userId).maybeSingle()
        return (prof?.chvad_active || prof?.subscription) ? 5 : 2
    } catch { return 2 }
}

function openCreateChannel(){
    ccState.step = 1
    ccState.mode = 'create'
    ccState.channelId = null
    ccState.data = { name:'', description:'', avatarFile:null, avatarUrl:null, channelType:'public', joinCode: generateJoinCode() }
    ccState.subsList = []
    ccState.followersList = []
    ccState.showAllSubs = false
    ccState.showAllFollowers = false
    renderCreateChannelScreen()
}

async function openEditChannel(channelId){
    const { data:{ user } } = await supabase.auth.getUser()
    const { data:ch } = await supabase.from('channels').select('*').eq('id', channelId).maybeSingle()
    if(!ch || ch.owner_id !== user.id) return
    ccState.step = 1
    ccState.mode = 'edit'
    ccState.channelId = channelId
    ccState.data = { name: ch.name || '', description: ch.description || '', avatarFile: null, avatarUrl: ch.avatar_url || null, channelType: ch.channel_type === 'bycode' ? 'private' : (ch.channel_type || 'public'), joinCode: ch.join_code || generateJoinCode() }
    ccState.subsList = []
    ccState.followersList = []
    renderCreateChannelScreen()
}

function renderCreateChannelScreen(){
    let screen = $('create-channel-screen')
    if(!screen){
        screen = document.createElement('div')
        screen.id = 'create-channel-screen'
        document.body.appendChild(screen)
        screen.addEventListener('click', e => {
            if(e.target.closest('#cc-back')){
                if(ccState.step > 1){ ccState.step--; renderCreateChannelScreen() }
                else closeCreateChannel()
                return
            }
            if(e.target.closest('#cc-next')){ ccNext(); return }
            if(e.target.closest('.cc-type-card')){
                ccState.data.channelType = e.target.closest('.cc-type-card').dataset.type
                renderCreateChannelScreen()
                return
            }
            if(e.target.closest('#cc-regen')){
                ccState.data.joinCode = generateJoinCode()
                $('cc-code-text').textContent = ccState.data.joinCode
                return
            }
            if(e.target.closest('#cc-friends-more-subs')){ ccState.showAllSubs = true; renderCcFriends(); return }
            if(e.target.closest('#cc-friends-more-follows')){ ccState.showAllFollowers = true; renderCcFriends(); return }
        })
    }

    const isEdit = ccState.mode === 'edit'
    const title = isEdit ? 'Изменить канал' : 'Создание канала'

    screen.innerHTML = `
        <div class="reg-topbar">
            <button class="reg-back-btn" id="cc-back">‹</button>
            <span class="reg-topbar-title">${title}</span>
            <span class="reg-topbar-spacer"></span>
        </div>
        <div class="cc-steps-bar"><div class="cc-steps-bar-fill" id="cc-bar" style="width:${ccState.step/3*100}%"></div></div>

        <div class="cc-step ${ccState.step === 1 ? 'active' : ''}">
            <h2>Основное</h2>
            <p class="step-hint">Аватарка, название и описание</p>

            <label class="cc-avatar-upload" id="cc-avatar-pick">
                <div class="cc-avatar-preview" id="cc-avatar-preview">
                    ${ccState.data.avatarUrl ? `<img src="${ccState.data.avatarUrl}" alt="">` : (ccState.data.avatarFile ? `<img src="${URL.createObjectURL(ccState.data.avatarFile)}" alt="">` : 'K')}
                </div>
                <input type="file" id="cc-avatar" accept="image/*" hidden>
                <span style="font-size:13px;color:var(--text-secondary)">Нажмите чтобы выбрать аватарку <b style="color:var(--red)">*</b></span>
            </label>

            <label class="step-label">Название <b style="color:var(--red)">*</b></label>
            <input type="text" id="cc-name" placeholder="Мой канал" maxlength="30" value="${escapeHtml(ccState.data.name)}">

            <label class="step-label">Описание</label>
            <textarea id="cc-desc" placeholder="О чём канал? (необязательно)" maxlength="200" rows="3">${escapeHtml(ccState.data.description)}</textarea>
        </div>

        <div class="cc-step ${ccState.step === 2 ? 'active' : ''}">
            <h2>Настройки</h2>
            <div class="cc-type-grid" id="cc-type-grid">
                ${Object.entries(CC_TYPES).map(([key, t]) => `
                    <button type="button" class="cc-type-card ${ccState.data.channelType === key ? 'selected' : ''}" data-type="${key}">
                        <div class="cc-type-head">
                            <span class="cc-type-icon">${t.icon}</span>
                            <span>${t.label}</span>
                        </div>
                        <div class="cc-type-desc">${t.desc}</div>
                    </button>
                `).join('')}
            </div>

            <label class="step-label">Код приглашения</label>
            <div class="cc-code-box">
                <span id="cc-code-text">${ccState.data.joinCode}</span>
                <button class="btn-primary" style="width:auto;padding:8px 14px;font-size:13px" id="cc-regen">Обновить</button>
            </div>
        </div>

        <div class="cc-step ${ccState.step === 3 ? 'active' : ''}">
            <h2>Пригласить друзей</h2>
            <p class="step-hint">Выберите до 10 подписок и подписчиков</p>
            <div id="cc-friends"></div>
        </div>

        <div class="cc-nav">
            <button class="btn-primary" id="cc-next">${ccState.step === 3 ? (isEdit ? 'Сохранить' : 'Создать канал') : 'Далее'}</button>
        </div>
        <p id="cc-error" class="error"></p>
    `

    if(ccState.step === 1){
        $('cc-name').addEventListener('input', e => { ccState.data.name = e.target.value })
        $('cc-desc').addEventListener('input', e => { ccState.data.description = e.target.value })

        const avatarInput = $('cc-avatar')
        if(avatarInput){
            avatarInput.addEventListener('change', e => {
                const f = e.target.files?.[0]
                if(!f) return
                ccState.data.avatarFile = f
                const prev = $('cc-avatar-preview')
                if(prev) prev.innerHTML = `<img src="${URL.createObjectURL(f)}" alt="">`
            })
        }
    }
    if(ccState.step === 3){
        loadCcFriends()
    }
    requestAnimationFrame(() => screen.classList.add('show'))
}

function closeCreateChannel(){
    const screen = $('create-channel-screen'); if(!screen) return
    screen.classList.remove('show')
    setTimeout(() => { if(!screen.classList.contains('show')) screen.remove() }, 340)
}

function generateJoinCode(){
    const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    let s = ''
    for(let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)]
    return s
}

async function loadCcFriends(){
    const box = $('cc-friends'); if(!box) return
    box.innerHTML = loadingBlock()
    const { data:{ user } } = await supabase.auth.getUser()
    const [{ data:subs }, { data:follows }] = await Promise.all([
        supabase.from('follows').select('profiles:following_id ( id, username, full_name, avatar_url )').eq('follower_id', user.id).limit(100),
        supabase.from('follows').select('profiles:follower_id ( id, username, full_name, avatar_url )').eq('following_id', user.id).limit(100)
    ])
    ccState.subsList = (subs || []).map(x => x.profiles).filter(Boolean)
    ccState.followersList = (follows || []).map(x => x.profiles).filter(Boolean)
    renderCcFriends()
}

function renderCcFriends(){
    const box = $('cc-friends'); if(!box) return
    const renderList = (items, showAll, moreId, label) => {
        if(!items.length) return `<p class="empty small">Нет ${label}</p>`
        const list = showAll ? items : items.slice(0, 10)
        return `
            <div class="cc-invite-block">
                <div class="cc-invite-title">
                    <span>${label} · ${items.length}</span>
                    ${!showAll && items.length > 10 ? `<button class="cc-invite-more" id="${moreId}">Больше</button>` : ''}
                </div>
                <div class="cc-friends-list">
                    ${list.map(p => {
            const name = p.full_name || p.username || 'user'
            const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
            return `<label class="subs-item" style="cursor:pointer">
                            <input type="checkbox" class="cc-friend-checkbox" value="${p.id}" style="width:auto;margin-right:8px">
                            <div class="subs-item-avatar">${av}</div>
                            <div class="subs-item-info"><div class="subs-item-name">${escapeHtml(name)}</div>
                            <div class="subs-item-role">@${escapeHtml(p.username || 'user')}</div></div>
                        </label>`
        }).join('')}
                </div>
            </div>
        `
    }
    box.innerHTML =
        renderList(ccState.subsList, ccState.showAllSubs, 'cc-friends-more-subs', 'Подписки') +
        renderList(ccState.followersList, ccState.showAllFollowers, 'cc-friends-more-follows', 'Подписчики')
}

async function ccNext(){
    const err = $('cc-error'); err.textContent = ''
    const isEdit = ccState.mode === 'edit'

    if(ccState.step === 1){
        const name = ($('cc-name').value || '').trim()
        const desc = ($('cc-desc').value || '').trim()
        if(name.length < 3){ err.textContent = 'Название минимум 3 символа'; return }
        if(!ccState.data.avatarFile && !ccState.data.avatarUrl){ err.textContent = 'Добавьте аватарку'; return }
        ccState.data.name = name
        ccState.data.description = desc
        ccState.step = 2
        renderCreateChannelScreen()
        return
    }

    if(ccState.step === 2){
        ccState.step = 3
        renderCreateChannelScreen()
        return
    }

    const btn = $('cc-next')
    btn.disabled = true
    btn.textContent = isEdit ? 'Сохраняем...' : 'Создаём...'
    try {
        const { data:{ user } } = await supabase.auth.getUser()

        if(!isEdit){
            const { count } = await supabase.from('channels').select('*', { count:'exact', head:true }).eq('owner_id', user.id)
            const limit = await getChannelLimitFor(user.id)
            if((count || 0) >= limit){
                err.textContent = `Лимит каналов: ${limit}. Оформите listatread chvad, чтобы создать до 5.`
                btn.disabled = false
                btn.textContent = 'Создать канал'
                return
            }
        }

        let avatarUrl = ccState.data.avatarUrl
        if(ccState.data.avatarFile){
            const f = ccState.data.avatarFile
            const ext = f.name.split('.').pop() || 'jpg'
            const path = `${user.id}/channel-${Date.now()}.${ext}`
            const { error:upErr } = await supabase.storage.from('channels').upload(path, f, { contentType:f.type })
            if(!upErr){
                const { data:pub } = supabase.storage.from('channels').getPublicUrl(path)
                avatarUrl = pub.publicUrl
            }
        }

        const channelType = ccState.data.channelType
        const canMembersPost = channelType === 'community'
        const isPublic = channelType === 'public'

        let channelId = ccState.channelId
        if(isEdit){
            const { error } = await supabase.from('channels').update({
                name: ccState.data.name, description: ccState.data.description, avatar_url: avatarUrl,
                join_code: ccState.data.joinCode, channel_type: channelType, is_public: isPublic, can_members_post: canMembersPost
            }).eq('id', ccState.channelId)
            if(error) throw error
        } else {
            const { data:ch, error } = await supabase.from('channels').insert({
                owner_id: user.id, name: ccState.data.name, description: ccState.data.description, avatar_url: avatarUrl,
                join_code: ccState.data.joinCode, channel_type: channelType, is_public: isPublic, can_members_post: canMembersPost
            }).select().single()
            if(error) throw error
            channelId = ch.id
        }

        const checked = Array.from(document.querySelectorAll('.cc-friend-checkbox:checked')).map(c => c.value)
        if(checked.length && channelId){
            await supabase.from('channel_invites').insert(checked.map(uid => ({ channel_id: channelId, from_user_id: user.id, to_user_id: uid })))
        }

        closeCreateChannel()
        if(state.screen === 'channels') renderChannels()
        setTimeout(() => openChannel(channelId), 200)
    } catch(e){
        err.textContent = 'Ошибка: ' + e.message
        btn.disabled = false
        btn.textContent = isEdit ? 'Сохранить' : 'Создать канал'
    }
}

/* ============================================================
   CHANNEL PAGE
============================================================ */
async function openChannel(channelId){
    try {
        const { data } = await supabase.from('channels').select('join_code').eq('id', channelId).maybeSingle();
        Router.push(urlFor('channel', data?.join_code || channelId));
    } catch { Router.push(urlFor('channel', channelId)); }

    document.querySelectorAll('.post-bg-video').forEach(v => { try { v.pause() } catch {} })
    const _mp = document.getElementById('mini-player')
    if(_mp && music.src){ _mp.classList.remove('hidden'); _mp.classList.add('show') }

    let screen = $('channel-screen')
    if(!screen){ screen = document.createElement('div'); screen.id = 'channel-screen'; screen.className = 'hidden'; document.body.appendChild(screen) }
    screen.classList.remove('hidden')
    screen.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        await refreshFollowCache()
        const { data:ch } = await supabase.from('channels').select('*').eq('id', channelId).maybeSingle()
        if(!ch){ screen.innerHTML = '<p class="empty">Канал не найден</p>'; return }
        const isOwner = ch.owner_id === user.id
        const { data:subRow } = await supabase.from('subscriptions').select('id').eq('follower_id', user.id).eq('channel_id', channelId).maybeSingle()
        const isSub = !!subRow
        const canPost = isOwner || (isSub && ch.can_members_post)
        const { data:activeLive } = await supabase.from('lives').select('id').eq('channel_id', channelId).eq('is_active', true).order('created_at', { ascending:false }).limit(1).maybeSingle()
        const [subsRes, postsRes] = await Promise.all([
            supabase.from('subscriptions').select('*', { count:'exact', head:true }).eq('channel_id', channelId),
            supabase.from('posts').select('*', { count:'exact', head:true }).eq('channel_id', channelId)
        ])
        let marksCount = 0
        try {
            const { data:postsIds } = await supabase.from('posts').select('id').eq('channel_id', channelId)
            const ids = (postsIds || []).map(p => p.id)
            if(ids.length){
                const [l, c, r] = await Promise.all([
                    supabase.from('likes').select('*', { count:'exact', head:true }).in('post_id', ids),
                    supabase.from('comments').select('*', { count:'exact', head:true }).in('post_id', ids),
                    supabase.from('reposts').select('*', { count:'exact', head:true }).in('post_id', ids)
                ])
                marksCount = (l.count || 0) + (c.count || 0) + (r.count || 0)
            }
            const { data:livesIds } = await supabase.from('lives').select('id').eq('channel_id', channelId)
            const liveIds = (livesIds || []).map(x => x.id)
            if(liveIds.length){
                const { count:ll } = await supabase.from('live_likes').select('*', { count:'exact', head:true }).in('live_id', liveIds)
                marksCount += (ll || 0)
            }
        } catch {}
        const avContent = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : (ch.name || 'K').charAt(0).toUpperCase()
        const avatarHtml = activeLive
            ? `<div class="ch-ig-avatar" style="background:conic-gradient(from 0deg,#ff375f,#ff9f0a,#ff375f);padding:3px"><div style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff">${avContent}</div></div>`
            : `<div class="ch-ig-avatar">${avContent}</div>`
        const showStarBtn = !isOwner

        state.channelFilters = { type:'all', author:null }
        state.channelPosts = []
        state.channelLikedSet = new Set()
        state.channelRepostedSet = new Set()
        state.channelCounts = {}

        screen.innerHTML = `
      <div class="ch-page-header">
        <button class="topbar-btn" id="ch-back"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>
        <div class="topbar-logo-static">канал</div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="topbar-btn" id="ch-filter-btn" title="Фильтры" style="color:var(--text)">${ICONS.filter}</button>
          <button class="topbar-btn" id="ch-dots-btn" title="Действия" style="color:var(--text)">${ICONS.dots}</button>
        </div>
      </div>
      <div class="ch-ig-header">${avatarHtml}<div class="ch-ig-info"><div class="ch-ig-name">${escapeHtml(ch.name || 'Канал')}</div><div class="ch-ig-desc">${escapeHtml(ch.description || '')}</div><div class="ch-ig-stats"><div class="ch-ig-stat"><strong id="ch-subs-count">${subsRes.count || 0}</strong> подписчики</div><div class="ch-ig-stat"><strong>${postsRes.count || 0}</strong> посты</div><div class="ch-ig-stat"><strong>${marksCount}</strong> отметки</div></div></div></div>
      <div class="ch-ig-actions">
        ${isOwner ? `<button class="ch-live-btn" id="ch-live-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 2s4 3 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>LIVE</button>` : ''}
        <button class="btn-follow ${isSub && !isOwner ? 'following' : ''}" id="ch-follow-btn" style="${isOwner ? 'background:var(--surface-2);color:var(--text)' : ''}">${isOwner ? 'Изменить' : (isSub ? 'Отписаться' : 'Подписаться')}</button>
        ${showStarBtn ? `<button class="btn-icon-round btn-star-round" id="ch-star-btn" title="storr">${ICONS.star}</button>` : ''}
        <button class="btn-add-people" id="ch-add-people"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="8" r="4"/><path d="M2 21c0-4.4 3.6-8 8-8 2 0 3.8.7 5.2 1.8M19 14v6M16 17h6"/></svg></button>
      </div>
      ${activeLive ? `<div class="active-live-card" data-live="${activeLive.id}" style="margin:0 0 16px"><div class="active-live-pill">LIVE NOW</div><div class="active-live-row"><div class="active-live-ava">${avContent}</div><div class="active-live-info"><div class="active-live-title">${escapeHtml(ch.name)}</div><div class="active-live-sub">Идёт трансляция</div></div><div class="active-live-bars"><span></span><span></span><span></span></div></div></div>` : ''}
      <div class="ch-page-tabs"><button class="ch-page-tab active" data-chtab="posts">Посты</button><button class="ch-page-tab" data-chtab="live">Live</button><button class="ch-page-tab" data-chtab="gifts">Подарки</button></div>
      <div class="ch-page-content" id="ch-content"></div>
    `
        $('ch-back').addEventListener('click', () => {
            screen.classList.add('hidden')
            switchScreen('channels')
        })
        $('ch-filter-btn').addEventListener('click', openChannelFilterMenu)
        $('ch-dots-btn').addEventListener('click', () => {
            const items = []
            items.push({ label:'Скопировать ссылку', icon:ICONS.link, onClick: () => navigator.clipboard?.writeText(`${location.origin}${urlFor('channel', ch.join_code || channelId)}`) })
            if(!isOwner) items.push({ label:'Пожаловаться', icon:ICONS.flag, danger:true, onClick: () => openReportModal({
                    targetType:'channel', targetId: channelId,
                    author: { username: null, full_name: ch.name, avatar_url: ch.avatar_url },
                    text: ch.description, media: ch.avatar_url
                }) })
            showActionSheet('Действия', items)
        })
        $('ch-live-btn')?.addEventListener('click', () => {
            if(activeLive) openLiveRoom(activeLive.id)
            else showActionSheet('Начать трансляцию', [{ label:'Live chat', icon:ICONS.send, onClick: () => openCreateLive(channelId, 'live') }, { label:'Rave', icon:ICONS.gift, onClick: () => openCreateLive(channelId, 'rave') }])
        })
        $('ch-follow-btn').addEventListener('click', async () => {
            if(isOwner){
                openChannelSettings(channelId, 'general')
                return
            }
            const btn = $('ch-follow-btn')
            const wasSub = btn.classList.contains('following')
            const nowSub = !wasSub
            btn.classList.toggle('following', nowSub)
            btn.textContent = nowSub ? 'Отписаться' : 'Подписаться'
            applySubState(channelId, nowSub)
            if(nowSub) state.myChannelSubs.add(channelId)
            else state.myChannelSubs.delete(channelId)
            try {
                if(nowSub) await supabase.from('subscriptions').insert({ follower_id:user.id, channel_id:channelId })
                else await supabase.from('subscriptions').delete().eq('follower_id', user.id).eq('channel_id', channelId)
                showToast('success', nowSub ? 'Вы подписаны' : 'Отписка', { icon: nowSub ? '✓' : '👋' })
            } catch(e){
                btn.classList.toggle('following', wasSub)
                btn.textContent = wasSub ? 'Отписаться' : 'Подписаться'
                applySubState(channelId, wasSub)
                if(wasSub) state.myChannelSubs.add(channelId)
                else state.myChannelSubs.delete(channelId)
                showToast('error', 'Не удалось: ' + e.message)
            }
        })
        $('ch-star-btn')?.addEventListener('click', () => openPrioriti())
        $('ch-add-people').addEventListener('click', () => openInviteMenu(ch, user.id))
        screen.querySelectorAll('.active-live-card[data-live]').forEach(el => el.addEventListener('click', () => openLiveRoom(el.dataset.live)))
        screen.querySelectorAll('.ch-page-tab').forEach(tab => tab.addEventListener('click', () => {
            screen.querySelectorAll('.ch-page-tab').forEach(t => t.classList.remove('active'))
            tab.classList.add('active')
            loadChContent(channelId, tab.dataset.chtab, canPost)
        }))
        loadChContent(channelId, 'posts', canPost)
    } catch(e){ screen.innerHTML = `<p class="empty">Ошибка: ${e.message}</p>` }
}

function openChannelFilterMenu(){
    const cur = state.channelFilters.type
    showActionSheet('Фильтры', [
        { label:(cur==='all'?'✓ ':'') + 'Все посты', onClick: () => { state.channelFilters.type='all'; applyChannelFilter() } },
        { label:(cur==='video'?'✓ ':'') + 'Только видео', onClick: () => { state.channelFilters.type='video'; applyChannelFilter() } },
        { label:(cur==='audio'?'✓ ':'') + 'Только музыка', onClick: () => { state.channelFilters.type='audio'; applyChannelFilter() } },
        { label:(cur==='image'?'✓ ':'') + 'Только фото', onClick: () => { state.channelFilters.type='image'; applyChannelFilter() } },
        { label:(cur==='text'?'✓ ':'') + 'Только текст', onClick: () => { state.channelFilters.type='text'; applyChannelFilter() } },
        { label:'От автора…', onClick: () => openChannelAuthorFilter() }
    ])
}
async function openChannelAuthorFilter(){
    const posts = state.channelPosts || []
    const authors = new Map()
    posts.forEach(p => {
        const a = p.profiles
        if(a && a.id) authors.set(a.id, a.full_name || a.username || 'user')
    })
    if(!authors.size){ showToast('info', 'Нет авторов'); return }
    const items = [{ label:'Сбросить выбор автора', onClick: () => { state.channelFilters.author = null; applyChannelFilter() } }]
    authors.forEach((name, id) => items.push({ label:name, onClick: () => { state.channelFilters.author = id; applyChannelFilter() } }))
    showActionSheet('От автора', items)
}
function applyChannelFilter(){
    const box = $('ch-content'); if(!box) return

    let contentRoot = box.querySelector('#ch-posts-list')
    if(!contentRoot){
        contentRoot = document.createElement('div')
        contentRoot.id = 'ch-posts-list'
        box.appendChild(contentRoot)
    }

    const f = state.channelFilters
    const isFiltering = f.type !== 'all' || f.author

    let note = document.getElementById('ch-filter-note')
    if(!note){
        note = document.createElement('div')
        note.id = 'ch-filter-note'
        note.className = 'ch-filter-note'
        box.insertBefore(note, contentRoot)
    }
    if(isFiltering){
        const labels = { all:'Все', video:'Видео', audio:'Музыка', image:'Фото', text:'Текст' }
        let text = 'Вы используете фильтры: ' + labels[f.type]
        if(f.author){
            const found = state.channelPosts.find(p => p.profiles?.id === f.author)?.profiles
            text += ' · автор ' + (found?.username || '')
        }
        note.innerHTML = `<span>${escapeHtml(text)}</span><button class="ch-filter-reset" id="ch-filter-reset">Сбросить</button>`
        note.style.display = 'flex'
        const resetBtn = document.getElementById('ch-filter-reset')
        if(resetBtn) resetBtn.onclick = () => { state.channelFilters = { type:'all', author:null }; applyChannelFilter() }
    } else {
        note.style.display = 'none'
    }

    const posts = state.channelPosts.filter(p => {
        if(f.author && p.profiles?.id !== f.author) return false
        if(f.type === 'video') return isVideoUrl(p.media_url)
        if(f.type === 'audio') return isAudioUrl(p.media_url)
        if(f.type === 'image') return isImageUrl(p.media_url)
        if(f.type === 'text') return !p.media_url
        return true
    })

    const userId = state.currentUser?.id
    contentRoot.innerHTML = posts.length
        ? posts.map(p => renderProfilePost(p, userId, state.channelLikedSet, state.channelRepostedSet, state.channelCounts)).join('')
        : '<p class="empty small">Нет постов по фильтру</p>'

    attachFeedActions(contentRoot, userId)
    setTimeout(initTrackObserver, 80)
}

async function openInviteMenu(ch, myId){
    showActionSheet('Пригласить', [{ label:'Загрузка...', onClick: () => {} }])
    const { data:fol } = await supabase.from('follows').select('profiles:following_id ( id, username, full_name, avatar_url )').eq('follower_id', myId).limit(30)
    const people = (fol || []).map(f => f.profiles).filter(Boolean)
    const av = ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : (ch.name || 'K').charAt(0).toUpperCase()
    actionsheetList.innerHTML = `<div class="invite-modal-body"><div class="invite-modal-head"><div class="invite-modal-avatar">${av}</div><div><div class="invite-modal-name">${escapeHtml(ch.name)}</div></div></div><div class="invite-modal-code">${escapeHtml(ch.join_code || '—')}</div><div class="invite-list">${people.length ? people.map(p => { const name = p.full_name || p.username || 'user'; const pav = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase(); return `<button class="invite-list-item" data-uid="${p.id}"><div class="invite-list-avatar">${pav}</div><div style="flex:1"><div class="invite-list-name">${escapeHtml(name)}</div></div></button>` }).join('') : '<p class="empty small">Нет подписок</p>'}</div></div>`
    const codeEl = actionsheetList.querySelector('.invite-modal-code')
    codeEl?.addEventListener('click', () => navigator.clipboard?.writeText(ch.join_code || ''))
    actionsheetList.querySelectorAll('.invite-list-item').forEach(btn => btn.addEventListener('click', async () => { try { await supabase.from('channel_invites').insert({ channel_id:ch.id, from_user_id:myId, to_user_id:btn.dataset.uid }); btn.style.opacity = '0.4'; btn.disabled = true } catch {} }))
}

async function loadChContent(channelId, tab, canPost = false){
    const box = $('ch-content'); box.innerHTML = loadingBlock()
    if(tab === 'live'){
        const { data:lives } = await supabase.from('lives').select('id, title, type, is_active, created_at').eq('channel_id', channelId).order('created_at', { ascending:false }).limit(20)
        if(!lives || !lives.length){ box.innerHTML = '<p class="empty small">Пока нет live</p>'; return }
        box.innerHTML = lives.map(l => `<div class="active-live-card" data-live="${l.id}" style="margin-bottom:10px"><div class="active-live-pill">${l.is_active ? 'LIVE NOW' : 'ЗАВЕРШЁН'}</div><div class="active-live-row"><div class="active-live-info"><div class="active-live-title">${escapeHtml(l.title || 'Трансляция')}</div><div class="active-live-sub">${l.type === 'rave' ? 'Rave' : 'Live chat'} · ${new Date(l.created_at).toLocaleString('ru-RU', { day:'numeric', month:'short' })}</div></div></div></div>`).join('')
        box.querySelectorAll('.active-live-card[data-live]').forEach(el => el.addEventListener('click', () => openLiveRoom(el.dataset.live)))
        return
    }
    if(tab === 'gifts'){
        box.innerHTML = `<div class="prioriti-empty" style="margin-top:20px"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8s-2-5-5-5-1 5 5 5zM12 8s2-5 5-5 1 5-5 5z"/></svg><p>Подарков пока нет</p></div>`
        return
    }
    if(canPost){
        box.innerHTML = `
      <div class="ch-new-post">
        <textarea id="ch-new-text" class="ch-new-post-text" placeholder="Текст" rows="3"></textarea>
        <div class="ch-new-post-media-box" id="ch-new-media-box"></div>
        <div class="ch-new-post-tools">
          <button class="tool-btn" id="ch-new-photo" title="Фото"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 18l5-5 4 4 3-3 6 6"/></svg></button>
          <button class="tool-btn" id="ch-new-video" title="Видео"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4z"/></svg></button>
          <button class="tool-btn" id="ch-new-audio" title="Трек (MP3)"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></button>
          <button class="tool-btn" id="ch-new-poll" title="Опрос"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h4v8H3zM10 6h4v14h-4zM17 9h4v11h-4z"/></svg></button>
          <button class="tool-btn" id="ch-new-emoji" title="Смайл"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="0.8" fill="currentColor"/><circle cx="15" cy="10" r="0.8" fill="currentColor"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg></button>
          <input type="file" id="ch-new-photo-input" accept="image/*" hidden>
          <input type="file" id="ch-new-video-input" accept="video/*" hidden>
          <input type="file" id="ch-new-audio-input" accept="audio/mpeg,audio/mp3,audio/*" hidden>
        </div>
        <div class="ch-new-post-footer"><small style="color:var(--text-secondary)">Пост канала</small><button class="btn-primary" id="ch-new-publish" style="width:auto;padding:10px 20px;font-size:14px">Опубликовать</button></div>
      </div>
      <div id="ch-posts-list"></div>
    `
        setupChannelComposer(channelId, canPost)
    } else box.innerHTML = '<div id="ch-posts-list"></div>'
    loadChannelPosts(channelId, canPost)
}

function setupChannelComposer(channelId, canPost){
    const photoInput = $('ch-new-photo-input'), videoInput = $('ch-new-video-input'), audioInput = $('ch-new-audio-input')
    const mediaBox = $('ch-new-media-box'), textArea = $('ch-new-text'), publishBtn = $('ch-new-publish')
    let attachedFile = null, attachedKind = null
    let pollMode = 'vote'
    let pollOptions = [{text:''},{text:''}]

    function renderPreview(){
        if(!attachedFile){
            if(!document.getElementById('poll-builder-instance')) mediaBox.innerHTML = ''
            return
        }
        const url = URL.createObjectURL(attachedFile)
        if(attachedKind === 'audio') mediaBox.innerHTML = `<audio controls src="${url}"></audio><input type="text" id="ch-new-track-title" placeholder="Название песни" maxlength="80" style="width:100%;margin-top:8px;padding:12px 14px;font-size:14px;border-radius:10px;border:1px solid var(--border);background:#fff;">`
        else if(attachedKind === 'video') mediaBox.innerHTML = `<video controls playsinline src="${url}"></video>`
        else mediaBox.innerHTML = `<img src="${url}" alt="">`
    }

    $('ch-new-photo').addEventListener('click', () => photoInput.click())
    photoInput.addEventListener('change', e => { const f = e.target.files?.[0]; if(!f) return; attachedFile = f; attachedKind = 'image'; removePollBuilder(); renderPreview() })

    $('ch-new-video').addEventListener('click', () => videoInput.click())
    videoInput.addEventListener('change', e => { const f = e.target.files?.[0]; if(!f) return; attachedFile = f; attachedKind = 'video'; removePollBuilder(); renderPreview() })

    $('ch-new-audio').addEventListener('click', () => audioInput.click())
    audioInput.addEventListener('change', e => { const f = e.target.files?.[0]; if(!f) return; attachedFile = f; attachedKind = 'audio'; removePollBuilder(); renderPreview() })

    $('ch-new-emoji').addEventListener('click', () => showActionSheet('Смайлы', EMOJI_LIST.slice(0, 24).map(em => ({ label:em, onClick: () => { textArea.value += em; textArea.focus() } }))))

    $('ch-new-poll').addEventListener('click', () => {
        if(document.getElementById('poll-builder-instance')) return
        attachedFile = null; attachedKind = null
        mediaBox.innerHTML = ''
        const tpl = document.getElementById('tpl-poll-builder').content.cloneNode(true)
        mediaBox.appendChild(tpl)
        const builder = mediaBox.querySelector('.poll-builder')
        builder.id = 'poll-builder-instance'
        pollOptions = [{text:''},{text:''}]
        renderPollOptions()
        builder.querySelectorAll('.poll-mode-btn').forEach(b => b.addEventListener('click', () => {
            pollMode = b.dataset.pollMode
            builder.querySelectorAll('.poll-mode-btn').forEach(x => x.classList.toggle('active', x === b))
            document.getElementById('poll-quiz-correct').style.display = pollMode === 'quiz' ? 'block' : 'none'
        }))
        builder.querySelector('.poll-mode-btn[data-poll-mode="vote"]').classList.add('active')
        document.getElementById('poll-add-btn').addEventListener('click', () => {
            if(pollOptions.length >= 5) return showToast('info', 'Максимум 5 пунктов')
            pollOptions.push({ text:'' })
            renderPollOptions()
        })
    })

    function renderPollOptions(){
        const box = document.getElementById('poll-options'); if(!box) return
        box.innerHTML = pollOptions.map((o, i) => `
            <div class="poll-option-row">
                <input type="text" maxlength="30" placeholder="Вариант ${i+1}" value="${escapeHtml(o.text)}" data-poll-idx="${i}">
                ${pollOptions.length > 2 ? `<button type="button" class="poll-option-remove" data-poll-remove="${i}">✕</button>` : ''}
            </div>
        `).join('')
        box.querySelectorAll('input[data-poll-idx]').forEach(inp => inp.addEventListener('input', () => {
            pollOptions[+inp.dataset.pollIdx].text = inp.value
            updateQuizSelect()
        }))
        box.querySelectorAll('[data-poll-remove]').forEach(b => b.addEventListener('click', () => {
            pollOptions.splice(+b.dataset.pollRemove, 1); renderPollOptions()
        }))
        updateQuizSelect()
    }
    function updateQuizSelect(){
        const sel = document.getElementById('poll-correct-select'); if(!sel) return
        sel.innerHTML = pollOptions.map((o, i) => `<option value="${i}">${escapeHtml(o.text || 'Вариант ' + (i+1))}</option>`).join('')
    }
    function removePollBuilder(){
        const b = document.getElementById('poll-builder-instance')
        if(b) b.remove()
    }

    publishBtn.addEventListener('click', async () => {
        try {
            const { data:{ user } } = await supabase.auth.getUser()
            if(!user) return
            const text = textArea.value.trim()
            const hasPoll = !!document.getElementById('poll-builder-instance')
            if(!text && !attachedFile && !hasPoll) return
            publishBtn.disabled = true; publishBtn.textContent = 'Публикация...'
            let mediaUrl = null
            if(attachedFile){
                const ext = attachedFile.name.split('.').pop() || 'bin'
                const path = `${user.id}/channel-${Date.now()}.${ext}`
                const { error:upErr } = await supabase.storage.from('posts').upload(path, attachedFile, { contentType:attachedFile.type })
                if(!upErr){ const { data:pub } = supabase.storage.from('posts').getPublicUrl(path); mediaUrl = pub.publicUrl }
            }
            const payload = { content:text, author_id:user.id, channel_id:channelId }
            if(mediaUrl) payload.media_url = mediaUrl
            const trackTitle = document.getElementById('ch-new-track-title')?.value.trim()
            if(trackTitle && attachedKind === 'audio') payload.media_title = trackTitle

            if(hasPoll){
                const filled = pollOptions.filter(o => o.text.trim())
                if(filled.length < 2){ showToast('error','Минимум 2 пункта'); publishBtn.disabled = false; publishBtn.textContent = 'Опубликовать'; return }
                const correctIdx = pollMode === 'quiz' ? +document.getElementById('poll-correct-select').value : null
                payload.poll = {
                    mode: pollMode,
                    options: filled.map(o => o.text.trim().slice(0, 30)),
                    correct: correctIdx,
                    votes: filled.map(() => 0),
                    voters: {}
                }
            }

            const { error } = await supabase.from('posts').insert(payload)
            if(error) throw error
            textArea.value = ''; mediaBox.innerHTML = ''; attachedFile = null; attachedKind = null
            photoInput.value = ''; videoInput.value = ''; audioInput.value = ''
            loadChannelPosts(channelId, true)
        } catch(err){ showToast('error', 'Ошибка: ' + err.message) }
        finally { publishBtn.disabled = false; publishBtn.textContent = 'Опубликовать' }
    })
}

async function loadChannelPosts(channelId, canPost){
    const list = $('ch-posts-list'); if(!list) return
    list.innerHTML = loadingBlock()
    const { data } = await supabase.from('posts').select(`id, content, media_url, media_title, created_at, author_id, channel_id, show_in_profile, poll, profiles:author_id ( id, username, full_name, avatar_url, status, is_admin ), channels:channel_id ( id, name, avatar_url )`).eq('channel_id', channelId).order('created_at', { ascending:false }).limit(30)
    if(!data || !data.length){ list.innerHTML = '<p class="empty small">Пока нет постов</p>'; return }
    const { data:{ user } } = await supabase.auth.getUser()
    state.currentUser = user
    const ids = data.map(p => p.id)
    const [{ data:likes }, { data:reps }, counts] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
        supabase.from('reposts').select('post_id').eq('user_id', user.id).in('post_id', ids),
        fetchCounts(ids)
    ])
    const likedSet = new Set((likes||[]).map(l => l.post_id))
    const repostedSet = new Set((reps||[]).map(r => r.post_id))
    state.channelPosts = data
    state.channelLikedSet = likedSet
    state.channelRepostedSet = repostedSet
    state.channelCounts = counts
    list.innerHTML = data.map(p => renderProfilePost(p, user.id, likedSet, repostedSet, counts)).join('')
    attachFeedActions(list, user.id)
    applyChannelFilter()
    setTimeout(initTrackObserver, 100)
}

document.addEventListener('click', async e => {
    const opt = e.target.closest('[data-poll-vote]')
    if(!opt) return
    e.stopPropagation()
    e.preventDefault()

    const postId = opt.dataset.pollPid
    const idx = +opt.dataset.pollVote

    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return

    const { data:post } = await supabase.from('posts').select('poll').eq('id', postId).maybeSingle()
    if(!post?.poll) return

    const poll = JSON.parse(JSON.stringify(post.poll))
    poll.votes  = poll.votes  || []
    poll.voters = poll.voters || {}

    const prev = poll.voters[user.id]

    if(poll.mode === 'quiz' && prev !== undefined){
        showToast('info', 'Ответ уже дан', { icon:'ℹ️' })
        return
    }

    if(prev === idx && poll.mode !== 'quiz'){
        poll.votes[prev] = Math.max(0, (poll.votes[prev] || 0) - 1)
        delete poll.voters[user.id]
    } else {
        if(prev !== undefined) poll.votes[prev] = Math.max(0, (poll.votes[prev] || 0) - 1)
        poll.votes[idx] = (poll.votes[idx] || 0) + 1
        poll.voters[user.id] = idx
    }

    updatePollInDom(postId, poll, user.id)

    try {
        const { data: freshPoll, error } = await supabase.rpc('vote_poll', {
            p_post_id: postId,
            p_option_index: idx
        })
        if(error){
            console.error('[vote_poll] ' + JSON.stringify({
                message: error.message, details: error.details, hint: error.hint, code: error.code
            }, null, 2))
            throw error
        }
        if(freshPoll) updatePollInDom(postId, freshPoll, user.id)
    } catch(err){
        console.warn('[vote]', err.message)
        showToast('error', 'Не удалось сохранить голос: ' + (err.message || 'ошибка'), { icon:'⚠️' })
        if(post.poll) updatePollInDom(postId, post.poll, user.id)
    }
}, { capture: true })

async function loadComments(postId, myId){
    const list = document.querySelector(`.ch-comments-list[data-list="${postId}"]`); if(!list) return
    list.innerHTML = loadingBlock()
    const { data } = await supabase.from('comments').select(`id, text, profiles:user_id ( username, full_name, avatar_url )`).eq('post_id', postId).order('created_at', { ascending:true }).limit(50)
    if(!data || !data.length){ list.innerHTML = '<p class="empty small" style="padding:6px 0">Нет комментариев</p>'; return }
    list.innerHTML = data.map(c => { const p = c.profiles || {}; const name = p.full_name || p.username || 'user'; const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase(); return `<div class="ch-comment"><div class="ch-comment-avatar">${av}</div><div class="ch-comment-text"><strong>${escapeHtml(name)}</strong> ${escapeHtml(c.text)}</div></div>` }).join('')
}

/* ============================================================
   LIVE
============================================================ */
const clState = { step:1, type:'live', data:{ title:'', isPublic:true, joinCode:'' }, channelId:null }
function openCreateLive(channelId, type){
    let screen = $('create-live-screen')
    if(!screen){
        screen = document.createElement('div')
        screen.id = 'create-live-screen'
        screen.className = 'hidden'
        screen.innerHTML = `
      <div class="reg-topbar"><button class="reg-back-btn" id="cl-back">‹</button><span class="reg-topbar-title">Создание трансляции</span><span class="reg-topbar-spacer"></span></div>
      <div class="cl-step active" data-clstep="1"><h2>Что создаём?</h2><div class="cl-type-row"><button class="cl-type" data-type="live"><div class="cl-type-icon">🎤</div><div class="cl-type-title">Live chat</div><div class="cl-type-desc">Все пишут</div></button><button class="cl-type" data-type="rave"><div class="cl-type-icon">🎧</div><div class="cl-type-title">Rave</div><div class="cl-type-desc">Ведущий в центре</div></button></div></div>
      <div class="cl-step" data-clstep="2"><h2>Название</h2><input type="text" id="cl-title" placeholder="Моя трансляция" maxlength="60"></div>
      <div class="cl-step" data-clstep="3"><h2>Доступ</h2><div class="settings-group"><label class="toggle-row"><span>Открытая</span><input type="checkbox" class="toggle" id="cl-public" checked></label></div><div class="cl-code-box"><span id="cl-code-text">-</span><button class="btn-primary" style="width:auto;padding:8px 14px;font-size:13px" id="cl-regen">Обновить</button></div></div>
      <div class="cc-nav"><button class="btn-primary" id="cl-next">Далее</button></div>
      <p id="cl-error" class="error"></p>
    `
        document.body.appendChild(screen)
        $('cl-back').addEventListener('click', () => { if(clState.step > 1){ clState.step--; clUpdate() } else closeCreateLive() })
        screen.querySelectorAll('.cl-type').forEach(btn => btn.addEventListener('click', () => { clState.type = btn.dataset.type; clState.step = 2; clUpdate() }))
        $('cl-regen').addEventListener('click', () => { clState.data.joinCode = generateJoinCode(); $('cl-code-text').textContent = clState.data.joinCode })
        $('cl-next').addEventListener('click', clNext)
    }
    clState.step = 1; clState.type = type; clState.channelId = channelId
    clState.data = { title:'', isPublic:true, joinCode:generateJoinCode() }
    $('cl-title').value = ''
    $('cl-code-text').textContent = clState.data.joinCode
    screen.querySelectorAll('.cl-type').forEach(b => b.classList.toggle('active', b.dataset.type === type))
    clUpdate(); screen.classList.remove('hidden')
}
function closeCreateLive(){ $('create-live-screen')?.classList.add('hidden') }
function clUpdate(){
    document.querySelectorAll('.cl-step').forEach(s => s.classList.toggle('active', +s.dataset.clstep === clState.step))
    $('cl-next').textContent = clState.step === 3 ? 'Начать' : 'Далее'
    $('cl-error').textContent = ''
}
async function clNext(){
    const err = $('cl-error'); err.textContent = ''
    if(clState.step === 1){ clState.step = 2; clUpdate(); return }
    if(clState.step === 2){ const t = $('cl-title').value.trim(); if(t.length < 2){ err.textContent = 'Введите название'; return } clState.data.title = t; clState.step = 3; clUpdate(); return }
    const btn = $('cl-next'); btn.disabled = true; btn.textContent = 'Создаём...'
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const { data:live, error } = await supabase.from('lives').insert({ channel_id:clState.channelId, host_id:user.id, title:clState.data.title, type:clState.type, is_public:clState.data.isPublic, join_code:clState.data.joinCode, is_active:true }).select().single()
        if(error) throw error
        await supabase.from('live_participants').insert({ live_id:live.id, user_id:user.id })
        closeCreateLive(); openLiveRoom(live.id)
    } catch(e){ err.textContent = 'Ошибка: ' + e.message }
    finally { btn.disabled = false; btn.textContent = 'Начать' }
}

let liveRoomCleanup = null
let liveRoomChannelUnique = 0
async function openLiveRoom(liveId){
    try {
        const { data } = await supabase.from('lives').select('join_code').eq('id', liveId).maybeSingle();
        Router.push(urlFor('live', data?.join_code || liveId));
    } catch { Router.push(urlFor('live', liveId)); }

    let screen = $('live-room-screen')
    if(!screen){ screen = document.createElement('div'); screen.id = 'live-room-screen'; screen.className = 'hidden'; document.body.appendChild(screen) }
    if(liveRoomCleanup){ try { liveRoomCleanup() } catch(e){} liveRoomCleanup = null }
    document.querySelectorAll('.post-bg-video').forEach(v => { try { v.pause() } catch {} })
    screen.classList.remove('hidden')
    screen.innerHTML = loadingBlock()
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) throw new Error('Не авторизован')
        const { data:live } = await supabase.from('lives').select('id, title, type, is_active, host_id, join_code, created_at, channels:channel_id ( id, name, avatar_url ), profiles:host_id ( username, full_name, avatar_url, is_admin )').eq('id', liveId).maybeSingle()
        if(!live){ screen.innerHTML = '<p class="empty" style="color:#fff">Трансляция не найдена</p>'; return }
        if(!live.is_active){ renderLiveEnded(screen); return }
        const host = live.profiles || {}, ch = live.channels || {}
        const hostName = host.full_name || host.username || 'user'
        const chName = ch.name || 'Канал'
        const isHost = live.host_id === user.id
        const isRave = live.type === 'rave'
        const avatarSource = isRave ? host : ch
        const displayName = isRave ? hostName : chName
        const avatarImg = avatarSource?.avatar_url ? `<img src="${avatarSource.avatar_url}" alt="">` : displayName.charAt(0).toUpperCase()
        const hostAdminMark = host.is_admin ? adminBadge(true, 'small') : ''
        const startTime = new Date(live.created_at).getTime()
        function formatAirTime(){ const d = Math.floor((Date.now() - startTime) / 1000); const h = Math.floor(d / 3600); const m = Math.floor((d % 3600) / 60); const s = d % 60; return (h > 0 ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') }
        try { await supabase.from('live_participants').insert({ live_id:liveId, user_id:user.id }) } catch {}
        let isSub = false
        if(ch.id){ const { data:subRow } = await supabase.from('subscriptions').select('id').eq('follower_id', user.id).eq('channel_id', ch.id).maybeSingle(); isSub = !!subRow }
        const showSubBtn = ch.id && !isHost
        screen.innerHTML = `
      <div class="lr-top"><div class="lr-host"><div class="lr-host-ava"><div class="lr-host-ava-inner">${avatarImg}</div></div><div><div class="lr-host-name">${escapeHtml(displayName)}${hostAdminMark}</div><div class="lr-host-label">LIVE NOW</div></div></div><div style="display:flex;gap:8px;align-items:center">${isHost ? '<button class="lr-end-btn" id="lr-end">Завершить</button>' : ''}<button class="topbar-btn" id="lr-close" style="color:#fff"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div></div>
      <div class="lr-channel-line"><span class="lr-channel-name">${escapeHtml(displayName)}</span>${showSubBtn ? `<button class="lr-sub-btn ${isSub ? 'following' : ''}" id="lr-sub-btn">${isSub ? 'Отписаться' : 'Подписаться'}</button>` : ''}</div>
      <div class="lr-airtime">${escapeHtml(live.title || 'Трансляция')} · <span id="lr-airtime">${formatAirTime()}</span> · <span class="lr-viewers" id="lr-viewers">1</span></div>
      <div class="lr-likes-wrap"><div class="lr-likes-top"><span>Лайки</span><span class="lr-likes-count" id="lr-likes-count">0</span></div><div class="lr-likes-bar"><div class="lr-likes-fill" id="lr-likes-fill"></div></div></div>
      <div class="lr-body" id="lr-body"><div class="lr-stage"><div class="lr-stage-ava"><div class="lr-stage-ava-inner">${avatarImg}</div></div><div class="lr-stage-name">${escapeHtml(displayName)}</div><div class="lr-stage-sub">LIVE-ЧАТ</div><div class="lr-stage-bars"><span></span><span></span><span></span><span></span><span></span></div></div></div>
      <div class="lr-chat" id="lr-chat"></div>
      <div class="lr-actions"><button class="lr-action-btn" id="lr-act-gift"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8s-2-5-5-5-1 5 5 5zM12 8s2-5 5-5 1 5-5 5z"/></svg></button><button class="lr-action-btn" id="lr-act-code"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h.01"/></svg></button><button class="lr-action-btn" id="lr-act-report"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V4a1 1 0 0 1 1-1h11l-1 4h6l-1 4h-11"/></svg></button></div>
      <div class="lr-composer"><input type="text" id="lr-input" placeholder="Написать сообщение..." maxlength="300"><button class="lr-send" id="lr-send">${ICONS.send}</button></div>
    `
        $('lr-close').addEventListener('click', () => screen.classList.add('hidden'))
        $('lr-end')?.addEventListener('click', async () => { if(!confirm('Завершить?')) return; await supabase.from('lives').update({ is_active:false, ended_at:new Date().toISOString() }).eq('id', liveId); renderLiveEnded(screen) })
        $('lr-sub-btn')?.addEventListener('click', async () => {
            const btn = $('lr-sub-btn')
            const wasSub = btn.classList.contains('following')
            const nowSub = !wasSub
            btn.classList.toggle('following', nowSub)
            btn.textContent = nowSub ? 'Отписаться' : 'Подписаться'
            isSub = nowSub
            applySubState(ch.id, nowSub)
            if(nowSub) state.myChannelSubs.add(ch.id)
            else state.myChannelSubs.delete(ch.id)
            try {
                if(nowSub) await supabase.from('subscriptions').insert({ follower_id: user.id, channel_id: ch.id })
                else await supabase.from('subscriptions').delete().eq('follower_id', user.id).eq('channel_id', ch.id)
            } catch(e){
                btn.classList.toggle('following', wasSub)
                btn.textContent = wasSub ? 'Отписаться' : 'Подписаться'
                isSub = wasSub
                applySubState(ch.id, wasSub)
                if(wasSub) state.myChannelSubs.add(ch.id)
                else state.myChannelSubs.delete(ch.id)
                showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
            }
        })
        const codeBtn = $('lr-act-code'); let codeResetTimer = null
        codeBtn.addEventListener('click', () => { navigator.clipboard?.writeText(live.join_code || ''); codeBtn.classList.add('active'); if(codeResetTimer) clearTimeout(codeResetTimer); codeResetTimer = setTimeout(() => codeBtn.classList.remove('active'), 900) })
        $('lr-act-gift').addEventListener('click', () => openPrioriti())
        $('lr-act-report')?.addEventListener('click', () => openReportModal({ targetType: 'live', targetId: liveId, author: host, text: live.title }))
        const sendMsg = async () => { const input = $('lr-input'); const text = input.value.trim(); if(!text) return; input.value = ''; await supabase.from('live_messages').insert({ live_id:liveId, user_id:user.id, content:text }); loadLiveMessages(liveId) }
        $('lr-send').addEventListener('click', sendMsg)
        $('lr-input').addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); sendMsg() } })
        let lastTap = 0
        const body = $('lr-body')
        body.addEventListener('click', async e => {
            const now = Date.now()
            if(now - lastTap < 320){
                spawnFlyingHeart(e.clientX, e.clientY)
                try { await supabase.from('live_likes').insert({ live_id:liveId, user_id:user.id }) } catch {}
                updateLiveLikes(liveId)
            }
            lastTap = now
        })
        const airTimer = setInterval(() => { const el = $('lr-airtime'); if(el && !screen.classList.contains('hidden')) el.textContent = formatAirTime(); else if(!el) clearInterval(airTimer) }, 1000)
        const refreshTimer = setInterval(() => { if(screen.classList.contains('hidden')){ clearInterval(refreshTimer); return } loadLiveMessages(liveId); updateLiveLikes(liveId); updateLiveViewers(liveId) }, 1000)
        loadLiveMessages(liveId); updateLiveLikes(liveId); updateLiveViewers(liveId)
        liveRoomChannelUnique++
        const channelName = `live_${liveId}_room_${liveRoomChannelUnique}_${Date.now()}`
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event:'INSERT', schema:'public', table:'live_messages', filter:`live_id=eq.${liveId}` }, () => loadLiveMessages(liveId))
            .on('postgres_changes', { event:'UPDATE', schema:'public', table:'lives', filter:`id=eq.${liveId}` }, payload => { if(payload.new.is_active === false) renderLiveEnded(screen) })
        channel.subscribe()
        liveRoomCleanup = () => { try { clearInterval(airTimer); clearInterval(refreshTimer); supabase.removeChannel(channel) } catch {} }
    } catch(e){ screen.innerHTML = `<p class="empty" style="color:#fff;padding:60px 20px;text-align:center">Ошибка: ${escapeHtml(e.message || 'неизвестно')}</p>` }
}
function renderLiveEnded(screen){
    screen.innerHTML = `<div class="live-ended"><div class="live-ended-icon">🎬</div><h2>Эфир завершён</h2><p>Трансляция закончилась.</p><button class="live-ended-back" id="live-ended-back">← Назад</button></div>`
    $('live-ended-back').addEventListener('click', () => { screen.classList.add('hidden'); switchScreen('inbox'); renderEventsScreen(); renderLiveNow() })
}
function spawnFlyingHeart(x, y){ const h = document.createElement('div'); h.className = 'lr-heart-fly'; h.textContent = '❤️'; h.style.left = (x - 18) + 'px'; h.style.top = (y - 18) + 'px'; document.body.appendChild(h); setTimeout(() => h.remove(), 1400) }
async function updateLiveLikes(liveId){ const { count } = await supabase.from('live_likes').select('*', { count:'exact', head:true }).eq('live_id', liveId); const total = count || 0; const c = $('lr-likes-count'), f = $('lr-likes-fill'); if(c) c.textContent = total; if(f) f.style.width = Math.min((total % 100), 100) + '%' }
async function updateLiveViewers(liveId){ const { count } = await supabase.from('live_participants').select('*', { count:'exact', head:true }).eq('live_id', liveId); const el = $('lr-viewers'); if(el) el.textContent = count || 1 }
async function loadLiveMessages(liveId){
    const box = $('lr-chat'); if(!box) return
    const { data } = await supabase.from('live_messages').select('id, content, created_at, profiles:user_id ( username, full_name, avatar_url, is_admin )').eq('live_id', liveId).order('created_at', { ascending:true }).limit(100)
    if(!data || !data.length){ box.innerHTML = ''; return }
    box.innerHTML = data.map(m => { const p = m.profiles || {}; const name = p.full_name || p.username || 'user'; const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase(); return `<div class="lr-msg"><div class="lr-msg-ava">${av}</div><div class="lr-msg-text"><strong>${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</strong> ${escapeHtml(m.content || '')}</div></div>` }).join('')
    box.scrollTop = box.scrollHeight
}

/* ============================================================
   СИНХРОНИЗАЦИЯ ЛАЙКОВ / РЕПОСТОВ
============================================================ */
function syncPostLike(postId, liked, delta){
    document.querySelectorAll(`.feed-action[data-like="${postId}"]`).forEach(btn => {
        const countEl = btn.querySelector('.feed-count')
        const cur = countEl ? parseInt(countEl.textContent) || 0 : 0
        const next = Math.max(0, cur + (delta || 0))
        btn.classList.toggle('liked', liked)
        btn.innerHTML = (liked ? ICONS.heartFill : ICONS.heart) + `<span class="feed-count" data-like-count="${postId}">${next}</span>`
        if(btn.closest('.feed-post-video')){
            const span = btn.querySelector('.feed-count')
            if(span) span.style.color = liked ? '#ff375f' : '#fff'
            btn.style.color = liked ? '#ff375f' : '#fff'
        }
    })
    document.querySelectorAll(`.ch-post-action[data-like="${postId}"]`).forEach(btn => { btn.classList.toggle('liked', liked); btn.innerHTML = liked ? ICONS.heartFill : ICONS.heart })
    const fullLike = document.getElementById('full-like')
    if(fullLike && music.postId === postId) fullLike.classList.toggle('liked', liked)
}
function syncPostRepost(postId, reposted, delta){
    document.querySelectorAll(`.feed-action[data-repost="${postId}"]`).forEach(btn => {
        const countEl = btn.querySelector('.feed-count')
        const cur = countEl ? parseInt(countEl.textContent) || 0 : 0
        const next = Math.max(0, cur + (delta || 0))
        btn.classList.toggle('reposted', reposted)
        btn.innerHTML = ICONS.repost + `<span class="feed-count" data-repost-count="${postId}">${next}</span>`
        if(btn.closest('.feed-post-video')){
            const span = btn.querySelector('.feed-count')
            if(span) span.style.color = reposted ? '#30d158' : '#fff'
            btn.style.color = reposted ? '#30d158' : '#fff'
        } else {
            btn.style.color = reposted ? 'var(--green)' : ''
        }
    })
    const fullRep = document.getElementById('full-repost')
    if(fullRep && music.postId === postId){ fullRep.classList.toggle('reposted', reposted); fullRep.style.background = reposted ? 'var(--green)' : '' }
}

async function toggleLikeGlobal(postId){
    const anyBtn = document.querySelector(`.feed-action[data-like="${postId}"], .ch-post-action[data-like="${postId}"]`)
    const wasLiked = anyBtn ? anyBtn.classList.contains('liked') : false
    const nowLiked = !wasLiked

    syncPostLike(postId, nowLiked, nowLiked ? +1 : -1)

    const btnEl = document.querySelector(`.feed-action[data-like="${postId}"] svg, .ch-post-action[data-like="${postId}"] svg`)
    if(btnEl){
        btnEl.style.transition = 'transform .18s cubic-bezier(.34,1.56,.64,1)'
        btnEl.style.transform = 'scale(1.25)'
        setTimeout(() => { btnEl.style.transform = '' }, 180)
    }

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user){ syncPostLike(postId, wasLiked, wasLiked ? +1 : -1); return }
        if(nowLiked){
            const { error } = await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
            if(error) throw error
        } else {
            const { error } = await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
            if(error) throw error
        }
    } catch(e){
        syncPostLike(postId, wasLiked, wasLiked ? +1 : -1)
        showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    }
}

async function toggleRepostGlobal(postId){
    const anyBtn = document.querySelector(`.feed-action[data-repost="${postId}"], .ch-post-action[data-repost="${postId}"]`)
    const wasReposted = anyBtn ? anyBtn.classList.contains('reposted') : false
    const nowReposted = !wasReposted

    syncPostRepost(postId, nowReposted, nowReposted ? +1 : -1)
    const btnEl = document.querySelector(`.feed-action[data-repost="${postId}"] svg`)
    if(btnEl){
        btnEl.style.transition = 'transform .18s cubic-bezier(.34,1.56,.64,1)'
        btnEl.style.transform = 'scale(1.25)'
        setTimeout(() => { btnEl.style.transform = '' }, 180)
    }

    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user){ syncPostRepost(postId, wasReposted, wasReposted ? +1 : -1); return }
        if(nowReposted){
            const { error } = await supabase.from('reposts').insert({ user_id: user.id, post_id: postId })
            if(error) throw error
        } else {
            const { error } = await supabase.from('reposts').delete().eq('user_id', user.id).eq('post_id', postId)
            if(error) throw error
        }
    } catch(e){
        syncPostRepost(postId, wasReposted, wasReposted ? +1 : -1)
        showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    }
}

/* ============================================================
   МУЗЫКАЛЬНЫЙ ПЛЕЕР
============================================================ */
const music = {
    postId: null, src: null, title: 'Аудио',
    user: { name:'user', ava:null }, channel: { id:null, name:'—', ava:null },
    authorId: null, channelId: null,
    isPlaying: false, speed: 1, hasChvad: false
}
const globalAudio = document.getElementById('global-audio')
function fmtTime(s){ if(!isFinite(s) || s < 0) return '0:00'; const m = Math.floor(s/60), sec = Math.floor(s%60); return m + ':' + String(sec).padStart(2,'0') }
function avatarInitial(name){ return (name || '?').charAt(0).toUpperCase() }
function avatarHTML(url, initial){ return url ? `<img src="${url}" alt="">` : initial }

function setMarqueeText(el, text){
    if(!el) return
    el.classList.remove('marquee-on')
    el.textContent = text || ''
    requestAnimationFrame(() => {
        const contW = el.clientWidth
        if(!contW) return
        const meas = document.createElement('span')
        meas.style.position = 'absolute'; meas.style.visibility = 'hidden'; meas.style.whiteSpace = 'nowrap'
        meas.style.font = getComputedStyle(el).font
        meas.textContent = text || ''
        document.body.appendChild(meas)
        const textW = meas.offsetWidth
        document.body.removeChild(meas)
        if(textW > contW + 2){
            el.innerHTML = ''
            const span = document.createElement('span')
            span.textContent = text || ''
            el.appendChild(span)
            el.style.setProperty('--mq-w', contW + 'px')
            el.classList.add('marquee-on')
        }
    })
}

async function loadTrack(postId, src, title, autoPlay = true){
    let user = { name:'user', ava:null }, channel = { id:null, name:'—', ava:null }, authorId = null, channelId = null
    try {
        const { data:post } = await supabase.from('posts').select('id, author_id, channel_id, profiles:author_id ( username, full_name, avatar_url, is_admin ), channels:channel_id ( id, name, avatar_url )').eq('id', postId).maybeSingle()
        if(post){
            const p = post.profiles || {}
            const ch = post.channels || {}
            user.name = p.full_name || p.username || 'user'
            user.ava = p.avatar_url || null
            user.is_admin = p.is_admin
            channel.id = ch.id || null
            channel.name = ch.name || '—'
            channel.ava = ch.avatar_url || null
            authorId = post.author_id
            channelId = post.channel_id
        }
    } catch(e){ console.warn(e.message) }
    music.postId = postId; music.src = src; music.title = title || 'Аудио'
    music.user = user; music.channel = channel
    music.authorId = authorId; music.channelId = channelId
    try {
        const { data:{ user:me } } = await supabase.auth.getUser()
        if(me){
            const { data:prof } = await supabase.from('profiles').select('chvad_active, subscription').eq('id', me.id).maybeSingle()
            music.hasChvad = !!(prof?.chvad_active || prof?.subscription)
        }
    } catch {}
    globalAudio.src = src
    globalAudio.playbackRate = music.speed
    if(autoPlay) await playTrack()
    updateMiniPlayer()
    updateFullPlayer()
    updateAllTrackCards()
    loadSaveTrackState(postId)
    syncFullPlayer()
}
async function playTrack(){ try { await globalAudio.play(); music.isPlaying = true; updatePlayIcons(); refreshMiniPlayerVisibility() } catch(e){ console.warn('play err', e.message) } }
function pauseTrack(){ globalAudio.pause(); music.isPlaying = false; updatePlayIcons(); refreshMiniPlayerVisibility() }
function togglePlayTrack(){ if(music.isPlaying) pauseTrack(); else playTrack() }


let _lastIconState = null
function updatePlayIcons(){
    // Простое надёжное условие: не пауза, есть src, не закончился
    const realPlaying = !!globalAudio.src && !globalAudio.paused && !globalAudio.ended
    music.isPlaying = realPlaying

    const icon = realPlaying ? SVG.pause : SVG.play
    const miniBtn = document.getElementById('mini-play-btn')
    const fullBtn = document.getElementById('full-play')
    if(miniBtn && miniBtn.dataset.icon !== icon){ miniBtn.innerHTML = icon; miniBtn.dataset.icon = icon }
    if(fullBtn && fullBtn.dataset.icon !== icon){ fullBtn.innerHTML = icon; fullBtn.dataset.icon = icon }

    const stateKey = (music.src || '') + '|' + (realPlaying ? 1 : 0)
    if(_lastIconState !== stateKey){
        _lastIconState = stateKey
        document.querySelectorAll('.track-card').forEach(card => {
            const isCurrent = card.dataset.trackSrc === music.src
            const btn = card.querySelector('.track-play')
            const wantIcon = (isCurrent && realPlaying) ? SVG.pause : SVG.play
            if(btn && btn.dataset.icon !== wantIcon){ btn.innerHTML = wantIcon; btn.dataset.icon = wantIcon }
            card.classList.toggle('playing', isCurrent && realPlaying)
        })
    }
    const mp = document.getElementById('mini-player')
    const fp = document.getElementById('full-player')
    if(mp) mp.classList.toggle('paused', !realPlaying)
    if(fp) fp.classList.toggle('paused', !realPlaying)
    const nowEl = document.querySelector('.mini-now')
    if(nowEl) nowEl.textContent = realPlaying ? 'Сейчас играет' : 'Приостановлено'
}
function updateMiniPlayer(){
    setMarqueeText(document.getElementById('mini-title'), music.title)
    const mUserAva = document.getElementById('mini-user-ava')
    const mChAva = document.getElementById('mini-channel-ava')
    if(mUserAva) mUserAva.innerHTML = avatarHTML(music.user.ava, avatarInitial(music.user.name))
    setMarqueeText(document.getElementById('mini-user-name'), '@' + (music.user.name||'').replace(/^@/,''))
    if(mChAva) mChAva.innerHTML = avatarHTML(music.channel.ava, avatarInitial(music.channel.name))
    setMarqueeText(document.getElementById('mini-channel-name'), music.channel.name)
}
function updateFullPlayer(){
    setMarqueeText(document.getElementById('full-song-title'), music.title)
    const fCover = document.getElementById('full-cover')
    const fChAva = document.getElementById('full-channel-ava')
    const fUserAva = document.getElementById('full-user-ava')
    if(fCover) fCover.innerHTML = music.channel.ava ? `<img src="${music.channel.ava}" alt="">` : avatarInitial(music.channel.name)
    if(fChAva) fChAva.innerHTML = avatarHTML(music.channel.ava, avatarInitial(music.channel.name))
    setMarqueeText(document.getElementById('full-channel-name'), music.channel.name)
    if(fUserAva) fUserAva.innerHTML = avatarHTML(music.user.ava, avatarInitial(music.user.name))
    setMarqueeText(document.getElementById('full-user-name'), '@' + (music.user.name||'').replace(/^@/,''))
}
function syncFullPlayer(){
    const btn = document.getElementById('full-channel-follow')
    if(!btn) return
    if(!music.channel?.id){ btn.style.display = 'none'; return }
    btn.style.display = 'flex'
    const isSub = state.myChannelSubs.has(music.channel.id)
    btn.classList.toggle('subscribed', isSub)
    btn.innerHTML = isSub
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12l5 5 9-11"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
}
document.getElementById('full-channel-follow')?.addEventListener('click', async () => {
    if(!music.channel?.id) return
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return

    const chId = music.channel.id
    const btn = document.getElementById('full-channel-follow')
    const wasSub = btn.classList.contains('subscribed')
    const nowSub = !wasSub

    applySubState(chId, nowSub)
    if(nowSub) state.myChannelSubs.add(chId)
    else state.myChannelSubs.delete(chId)

    try {
        if(nowSub){
            await supabase.from('subscriptions').insert({ follower_id: user.id, channel_id: chId })
        } else {
            await supabase.from('subscriptions').delete().eq('follower_id', user.id).eq('channel_id', chId)
        }
        showToast('success', nowSub ? 'Подписка оформлена' : 'Отписка', { icon:'✓' })
    } catch(e){
        applySubState(chId, wasSub)
        if(wasSub) state.myChannelSubs.add(chId)
        else state.myChannelSubs.delete(chId)
        showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    }
})

function updateAllTrackCards(){
    document.querySelectorAll('.track-card').forEach(card => {
        const src = card.dataset.trackSrc
        const isCurrent = src === music.src
        const fill = card.querySelector('.track-progress-fill')
        const timeEl = card.querySelector('.track-time')
        if(fill){
            const pct = (isCurrent && globalAudio.duration) ? (globalAudio.currentTime / globalAudio.duration * 100) : 0
            fill.style.width = pct + '%'
        }
        if(timeEl){
            const storedTotal = parseFloat(timeEl.dataset.totalDur) || 0
            const totalDur = (isCurrent && globalAudio.duration) ? globalAudio.duration : storedTotal
            const curTime = isCurrent ? (globalAudio.currentTime || 0) : 0
            timeEl.textContent = totalDur > 0 ? fmtTime(curTime) + ' / ' + fmtTime(totalDur) : '0:00 / 0:00'
        }
    })
}
const _preloaded = new WeakSet()
function preloadTrackDurations(){
    document.querySelectorAll('.track-card').forEach(card => {
        if(_preloaded.has(card)) return
        _preloaded.add(card)
        const src = card.dataset.trackSrc
        const timeEl = card.querySelector('.track-time')
        if(!src || !timeEl) return
        const a = new Audio(); a.preload = 'metadata'; a.muted = true; a.src = src
        a.addEventListener('loadedmetadata', () => { if(isFinite(a.duration) && a.duration > 0){ timeEl.dataset.totalDur = a.duration; updateAllTrackCards() } })
        a.addEventListener('error', () => { timeEl.textContent = '— / —' })
    })
}
function refreshMiniPlayerVisibility(){
    const box = document.getElementById('mini-player'); if(!box) return
    if(music.src){ box.classList.remove('hidden'); box.classList.add('show') }
    else box.classList.remove('show')
}
let _lastTimeUpdate = 0
globalAudio?.addEventListener('timeupdate', () => {
    const now = performance.now()
    if (now - _lastTimeUpdate < 200) return
    _lastTimeUpdate = now

    const cur = globalAudio.currentTime, dur = globalAudio.duration || 0, pct = dur ? (cur / dur * 100) : 0
    const mpf = document.getElementById('mini-progress-fill')
    const fpf = document.getElementById('full-progress-fill')
    const ftc = document.getElementById('full-time-current')
    const ftt = document.getElementById('full-time-total')
    if(mpf) mpf.style.width = pct + '%'
    if(fpf) fpf.style.width = pct + '%'
    if(ftc) ftc.textContent = fmtTime(cur)
    if(ftt) ftt.textContent = fmtTime(dur)

    updateAllTrackCards()
})
globalAudio?.addEventListener('loadedmetadata', () => { const ftt = document.getElementById('full-time-total'); if(ftt) ftt.textContent = fmtTime(globalAudio.duration); updateAllTrackCards(); updatePlayIcons() })
globalAudio?.addEventListener('pause', () => { updatePlayIcons() })
globalAudio?.addEventListener('play', () => { updatePlayIcons() })

document.addEventListener('click', async e => {
    const playBtn = e.target.closest('[data-action="toggle-play"]')
    if(playBtn){
        const card = playBtn.closest('.track-card'); if(!card) return
        const src = card.dataset.trackSrc, postId = card.dataset.trackPost, title = card.dataset.trackTitle || 'Аудио'
        if(src === music.src) togglePlayTrack()
        else await loadTrack(postId, src, title, true)
        return
    }
    const moreBtn = e.target.closest('[data-action="track-more"]')
    if(moreBtn){
        const card = moreBtn.closest('.track-card')
        const src = card.dataset.trackSrc
        const items = [
            { label:'Скорость 0.5x', onClick: () => { globalAudio.playbackRate = 0.5; music.speed = 0.5; showToast('info','Скорость: 0.5×') } },
            { label:'Скорость 1x',   onClick: () => { globalAudio.playbackRate = 1;   music.speed = 1;   showToast('info','Скорость: 1×') } },
            { label:'Скорость 1.5x', onClick: () => { globalAudio.playbackRate = 1.5; music.speed = 1.5; showToast('info','Скорость: 1.5×') } },
            { label:'Скорость 2x',   onClick: () => { globalAudio.playbackRate = 2;   music.speed = 2;   showToast('info','Скорость: 2×') } },
            { label:'Поделиться', icon:ICONS.share, onClick: () => openShareSheet({ type:'track', postId: card.dataset.trackPost, title: card.dataset.trackTitle, src }) }
        ]
        if(music.hasChvad) items.push({ label:'Скачать трек', onClick: () => { const a = document.createElement('a'); a.href = src; a.download = (card.dataset.trackTitle||'track') + '.mp3'; document.body.appendChild(a); a.click(); a.remove(); showToast('success','Загрузка началась', { icon:'⬇️' }) } })
        else items.push({ label:'Скачать (chvad)', onClick: () => showToast('error','Только для подписчиков chvad', { icon:'⭐' }) })
        showActionSheet('Параметры трека', items)
        return
    }
})

document.getElementById('mini-open')?.addEventListener('click', e => { if(e.target.closest('#mini-play-btn')) return; openFullPlayer() })

function applyRandomFullBg(){
    const bg = document.getElementById('full-bg'); if(!bg) return
    const g = FULL_GRADIENTS[Math.floor(Math.random() * FULL_GRADIENTS.length)]
    bg.style.background = `radial-gradient(circle at 20% 20%, ${g[0]} 0%, transparent 45%), radial-gradient(circle at 80% 30%, ${g[1]} 0%, transparent 45%), radial-gradient(circle at 50% 85%, ${g[2]} 0%, transparent 55%)`
}
function openFullPlayer(){
    const fp = document.getElementById('full-player'); if(!fp) return
    document.body.classList.add('full-player-open')
    applyRandomFullBg()
    if(music.postId) loadSaveTrackState(music.postId)
    refreshFollowCache().then(syncFullPlayer)
    syncFullPlayer()
    updateFullPlayer()
    fp.classList.remove('hidden'); void fp.offsetWidth
    requestAnimationFrame(() => fp.classList.add('show'))
    updatePlayIcons()
}
function closeFullPlayer(){
    const fp = document.getElementById('full-player'); if(!fp) return
    document.body.classList.remove('full-player-open')
    fp.classList.remove('show')
    setTimeout(() => { if(!fp.classList.contains('show')) fp.classList.add('hidden') }, 400)
}
document.getElementById('full-close')?.addEventListener('click', closeFullPlayer)
document.getElementById('mini-play-btn')?.addEventListener('click', e => { e.stopPropagation(); togglePlayTrack() })
document.getElementById('full-play')?.addEventListener('click', togglePlayTrack)
document.getElementById('full-progress')?.addEventListener('click', e => {
    const bar = e.currentTarget; const rect = bar.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width
    if(globalAudio.duration) globalAudio.currentTime = pct * globalAudio.duration
})

let musicRepeat = false
let musicQueueOn = false
let sleepTimerId = null
let sleepUntilTs = null

document.getElementById('full-queue')?.addEventListener('click', e => {
    const btn = e.currentTarget
    musicQueueOn = !musicQueueOn
    btn.classList.toggle('active', musicQueueOn)
    showToast('info', musicQueueOn ? 'Очередь из ленты включена' : 'Очередь выключена', { icon:'🎵' })
})
document.getElementById('full-repeat')?.addEventListener('click', e => {
    const btn = e.currentTarget
    musicRepeat = !musicRepeat
    btn.classList.toggle('active', musicRepeat)
    showToast('info', musicRepeat ? 'Повтор включён' : 'Повтор выключен', { icon:'🔁' })
})

function startSleepTimer(ms){
    clearSleepTimer()
    sleepUntilTs = Date.now() + ms
    sleepTimerId = setTimeout(() => {
        pauseTrack()
        showToast('info', 'Таймер сна: музыка остановлена', { icon:'🌙' })
        sleepTimerId = null; sleepUntilTs = null
    }, ms)
    const m = Math.round(ms / 60000)
    const label = m < 60 ? m + ' мин' : Math.round(m / 60) + ' ч'
    showToast('info', 'Таймер сна установлен', { icon:'🌙', time: label })
}
function clearSleepTimer(){
    if(sleepTimerId){ clearTimeout(sleepTimerId); sleepTimerId = null }
    sleepUntilTs = null
}

document.getElementById('full-save')?.addEventListener('click', () => { if(music.postId) toggleSaveTrack(music.postId) })
document.getElementById('full-share')?.addEventListener('click', () => {
    if(!music.postId) return
    openShareSheet({
        type: 'track',
        postId: music.postId,
        title: music.title,
        src: music.src
    })
})

globalAudio?.addEventListener('ended', () => {
    if(musicRepeat){ try { globalAudio.currentTime = 0; playTrack() } catch {} return }
    if(musicQueueOn){ playNextFromFeed(); return }
    music.isPlaying = false
    updatePlayIcons(); refreshMiniPlayerVisibility()
})

async function playNextFromFeed(){
    try {
        const cards = [...document.querySelectorAll('.track-card')]
        const idx = cards.findIndex(c => c.dataset.trackSrc === music.src)
        const next = cards[idx + 1]
        if(!next){ music.isPlaying = false; updatePlayIcons(); return }
        const src = next.dataset.trackSrc
        const postId = next.dataset.trackPost
        const title = next.dataset.trackTitle || 'Аудио'
        await loadTrack(postId, src, title, true)
    } catch(e){ console.warn('[queue]', e.message) }
}

document.getElementById('full-more')?.addEventListener('click', async () => {
    const items = [
        { label:'Скорость 0.5x', onClick: () => { globalAudio.playbackRate = 0.5; music.speed = 0.5 } },
        { label:'Скорость 1x',   onClick: () => { globalAudio.playbackRate = 1;   music.speed = 1 } },
        { label:'Скорость 1.5x', onClick: () => { globalAudio.playbackRate = 1.5; music.speed = 1.5 } },
        { label:'Скорость 2x',   onClick: () => { globalAudio.playbackRate = 2;   music.speed = 2 } },
        { label:'Таймер сна: 10 минут', onClick: () => startSleepTimer(10*60*1000) },
        { label:'Таймер сна: 20 минут', onClick: () => startSleepTimer(20*60*1000) },
        { label:'Таймер сна: 30 минут', onClick: () => startSleepTimer(30*60*1000) },
        { label:'Таймер сна: 1 час',    onClick: () => startSleepTimer(60*60*1000) },
        { label:'Таймер сна: 3 часа',   onClick: () => startSleepTimer(3*60*60*1000) },
    ]
    if(sleepUntilTs) items.push({ label:'Отменить таймер сна', onClick: () => { clearSleepTimer(); showToast('info','Таймер сна отменён',{icon:'🌙'}) } })
    if(music.src && music.hasChvad){
        items.push({ label:'Скачать трек', onClick: () => { const a = document.createElement('a'); a.href = music.src; a.download = (music.title || 'track') + '.mp3'; document.body.appendChild(a); a.click(); a.remove() } })
    }
    if(music.postId){
        const { data:{ user } } = await supabase.auth.getUser()
        const { data:post } = await supabase.from('posts').select('author_id').eq('id', music.postId).maybeSingle()
        const isMine = post?.author_id === user.id
        if(isMine) items.push({ label:'Удалить', icon:ICONS.trash, danger:true, onClick: async () => { if(!confirm('Удалить пост?')) return; await supabase.from('posts').delete().eq('id', music.postId); pauseTrack(); closeFullPlayer(); if(state.screen === 'home') renderHomeFeed() } })
        if(!isMine) items.push({ label:'Пожаловаться', icon:ICONS.flag, danger:true, onClick: () => openReportModal({
                targetType: music.src && isAudioUrl(music.src) ? 'music' : 'video',
                targetId: music.postId,
                author: music.user,
                media: music.src,
                text: music.title
            }) })
    }
    showActionSheet('Действия', items)
})
document.getElementById('full-channel-ava')?.addEventListener('click', () => { if(music.channelId) openChannel(music.channelId) })
document.getElementById('full-user-ava')?.addEventListener('click', () => { if(music.authorId) openUserProfile(music.authorId) })

async function toggleSaveTrack(postId){
    const btn = document.getElementById('full-save')
    if(!btn) return
    const wasSaved = btn.classList.contains('active')
    const nowSaved = !wasSaved

    btn.classList.toggle('active', nowSaved)
    btn.style.transition = 'transform .18s cubic-bezier(.34,1.56,.64,1)'
    btn.style.transform = 'scale(1.18)'
    setTimeout(() => { btn.style.transform = '' }, 180)
    showToast(nowSaved ? 'success' : 'info',
        nowSaved ? 'Сохранено в профиль' : 'Убрано из треков',
        { icon:'🔖' })

    const { data:{ user } } = await supabase.auth.getUser()
    if(!user){ btn.classList.toggle('active', wasSaved); return }

    try {
        if(nowSaved) await supabase.from('saved_tracks').insert({ user_id: user.id, post_id: postId })
        else await supabase.from('saved_tracks').delete().eq('user_id', user.id).eq('post_id', postId)
    } catch(e){
        btn.classList.toggle('active', wasSaved)
        showToast('error', 'Не удалось: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    }
}
async function loadSaveTrackState(postId){
    try { const { data:{ user } } = await supabase.auth.getUser(); if(!user) return
        const { data:row } = await supabase.from('saved_tracks').select('id').eq('user_id', user.id).eq('post_id', postId).maybeSingle()
        const btn = document.getElementById('full-save'); if(btn) btn.classList.toggle('active', !!row)
    } catch {}
}

/* ============================================================
   OBSERVER: автоплей видео
============================================================ */
let feedVideoObserver = null
function initFeedVideoObserver(){
    if(feedVideoObserver) feedVideoObserver.disconnect()
    feedVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(en => {
            const card = en.target
            const vid = card.querySelector('.post-bg-video')
            if(!vid) return
            const userActivated = card.dataset.videoActivated === '1'
            if(en.intersectionRatio > 0.5){
                if(!userActivated) vid.muted = true
                vid.play().catch(()=>{})
                card.classList.add('is-playing-auto')
                checkVideoState(card)
            } else {
                vid.pause()
                card.classList.remove('is-playing-auto')
                card.dataset.videoActivated = '0'
                card.classList.remove('is-playing')
                hideVideoPauseIcon(card)
                const hint = card.querySelector('.feed-post-video-hint')
                if(hint) hint.style.display = ''
                vid.muted = true
                try { vid.currentTime = 0 } catch {}
            }
        })
    }, { threshold: [0, 0.5, 1] })
    document.querySelectorAll('.feed-post.feed-post-video').forEach(c => feedVideoObserver.observe(c))
}
function initTrackObserver(){
    preloadTrackDurations()
    initFeedVideoObserver()
    initPostMarquees()
    const obs = new IntersectionObserver(() => { if(music.isPlaying) refreshMiniPlayerVisibility() }, { threshold: 0.35 })
    document.querySelectorAll('.track-card').forEach(c => obs.observe(c))
}

/* ============================================================
   FULLSCREEN VIDEO MODE
============================================================ */
let videoFsPrevMusic = false
function enterVideoFS(src, postId){
    const fs = document.getElementById('video-fs'), vid = document.getElementById('video-fs-el')
    if(!fs || !vid || !src) return
    videoFsPrevMusic = music.isPlaying
    if(music.isPlaying) pauseTrack()
    document.getElementById('mini-player')?.classList.remove('show')
    document.querySelectorAll('.topbar').forEach(b => b.classList.add('topbar-hidden'))
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    vid.pause(); vid.src = src
    vid.muted = false; vid.volume = 1; vid.loop = true
    try { vid.currentTime = 0 } catch {}
    const p = vid.play()
    if(p && p.catch) p.catch(() => { vid.muted = true; vid.play().then(() => { vid.muted = false }).catch(()=>{}) })
    fs.dataset.pid = postId || ''
    fs.classList.remove('hidden'); void fs.offsetWidth
    requestAnimationFrame(() => fs.classList.add('show'))
}
function exitVideoFS(){
    const fs = document.getElementById('video-fs'), vid = document.getElementById('video-fs-el')
    if(!fs || !vid) return
    vid.pause(); vid.removeAttribute('src'); vid.load()
    fs.classList.remove('show')
    setTimeout(() => { if(!fs.classList.contains('show')) fs.classList.add('hidden') }, 320)
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.querySelectorAll('.topbar').forEach(b => b.classList.remove('topbar-hidden'))
    if(videoFsPrevMusic) playTrack()
    videoFsPrevMusic = false
}
document.getElementById('video-fs-back')?.addEventListener('click', exitVideoFS)
document.getElementById('video-fs-more')?.addEventListener('click', async () => {
    const fs = document.getElementById('video-fs'), pid = fs?.dataset.pid
    const items = [
        { label:'Скорость 0.5x', onClick: () => document.getElementById('video-fs-el').playbackRate = 0.5 },
        { label:'Скорость 1x',   onClick: () => document.getElementById('video-fs-el').playbackRate = 1 },
        { label:'Скорость 1.5x', onClick: () => document.getElementById('video-fs-el').playbackRate = 1.5 },
        { label:'Скорость 2x',   onClick: () => document.getElementById('video-fs-el').playbackRate = 2 }
    ]
    if(pid){
        items.push({ label:'Поделиться', icon:ICONS.share, onClick: () => openShareSheet({ type:'post', postId:pid, src: document.getElementById('video-fs-el').src }) })
        const { data:{ user } } = await supabase.auth.getUser()
        const { data:post } = await supabase.from('posts').select('author_id, channel_id').eq('id', pid).maybeSingle()
        const isMine = post?.author_id === user.id
        if(isMine) items.push({ label:'Удалить', icon:ICONS.trash, danger:true, onClick: async () => { if(!confirm('Удалить пост?')) return; await supabase.from('posts').delete().eq('id', pid); exitVideoFS(); if(state.screen === 'home') renderHomeFeed() } })
        if(!isMine) items.push({ label:'Пожаловаться', icon:ICONS.flag, danger:true, onClick: () => openReportModal({ targetType:'video', targetId: pid, media: document.getElementById('video-fs-el').src }) })
    }
    showActionSheet('Действия', items)
})
;(function initVideoFsSwipe(){
    const fs = document.getElementById('video-fs'); if(!fs) return
    let sy = 0, cy = 0, drag = false
    fs.addEventListener('touchstart', e => { sy = e.touches[0].clientY; cy = sy; drag = true; fs.style.transition = 'none' }, { passive: true })
    fs.addEventListener('touchmove', e => { if(!drag) return; cy = e.touches[0].clientY; const dy = Math.max(0, cy - sy); fs.style.transform = `translateY(${dy}px)` }, { passive: true })
    fs.addEventListener('touchend', () => { if(!drag) return; drag = false; fs.style.transition = ''; const dy = cy - sy; fs.style.transform = ''; if(dy > 80) exitVideoFS() })
})()

/* ============================================================
   СВАЙП ВНИЗ ДЛЯ МОДАЛОК / ШИТОВ
============================================================ */
;(function initSwipe(){
    function attach(el, closeFn, baseX){
        if(!el) return
        const handle = el.querySelector('.actionsheet-handle, .prioriti-handle, .lang-sheet-handle, .code-modal-handle, .share-handle')
        if(!handle) return
        if(handle.dataset.unifiedDrag === '1') return
        handle.dataset.unifiedDrag = '1'

        let startY = 0, curY = 0, drag = false, startTime = 0
        const base = baseX ? `translateX(${baseX})` : ''

        const onStart = (e) => {
            drag = true
            startTime = Date.now()
            startY = (e.touches?.[0] || e).clientY
            curY = startY
            el.classList.add('dragging')
            el.style.transition = 'none'
        }
        const onMove = (e) => {
            if(!drag) return
            if(e.cancelable) e.preventDefault()
            curY = (e.touches?.[0] || e).clientY
            const dy = Math.max(0, curY - startY)
            el.style.transform = `${base} translateY(${dy}px)`
        }
        const onEnd = () => {
            if(!drag) return
            drag = false
            el.classList.remove('dragging')
            const dy = curY - startY
            const height = el.offsetHeight || 1
            const ratio = dy / height
            const velocity = dy / (Date.now() - startTime)

            el.style.transition = ''
            el.style.transform = ''

            if(ratio > 0.5 || velocity > 0.8){
                closeFn()
            }
        }

        handle.addEventListener('touchstart', onStart, { passive: true })
        handle.addEventListener('touchmove', onMove, { passive: false })
        handle.addEventListener('touchend', onEnd)
        handle.addEventListener('touchcancel', onEnd)

        handle.addEventListener('mousedown', onStart)
        window.addEventListener('mousemove', e => { if(drag) onMove(e) })
        window.addEventListener('mouseup', onEnd)
    }

    attach($('actionsheet'), closeActionSheet, '')
    attach($('prioriti-sheet'), closePrioriti, '-50%')
    attach($('lang-modal')?.querySelector('.lang-sheet'), closeLangModal, '')
    attach($('region-modal')?.querySelector('.lang-sheet'), closeRegionModal, '')
    attach($('code-modal')?.querySelector('.code-modal-sheet'), () => $('code-modal')?.classList.add('hidden'), '')
})()

/* ============================================================
   СВАЙП-TO-DISMISS MINI-PLAYER
============================================================ */
;(function initMiniPlayerSwipe(){
    const mp = document.getElementById('mini-player')
    if(!mp) return
    let startY = 0, currentY = 0, dragging = false

    mp.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY
        currentY = startY
        dragging = true
        mp.style.transition = 'none'
    }, { passive: true })

    mp.addEventListener('touchmove', e => {
        if(!dragging) return
        e.preventDefault()
        e.stopPropagation()
        currentY = e.touches[0].clientY
        const dy = Math.max(0, currentY - startY)
        mp.style.transform = `translateX(-50%) translateY(${dy}px)`
    }, { passive: false })

    function finish(close){
        dragging = false
        if(close){
            try { globalAudio.pause(); globalAudio.src = '' } catch {}
            music.src = null
            music.postId = null
            music.isPlaying = false

            mp.style.transition = 'opacity .25s ease, transform .25s ease'
            mp.style.transform = 'translateX(-50%) translateY(160%)'
            mp.classList.remove('show')

            setTimeout(() => {
                mp.classList.add('hidden')
                mp.style.transform = ''
                mp.style.transition = ''
                updatePlayIcons()
            }, 300)
        } else {
            mp.style.transition = 'transform .22s cubic-bezier(.4,0,.2,1)'
            mp.style.transform = 'translateX(-50%) translateY(0)'
            setTimeout(() => {
                mp.style.transition = ''
                mp.style.transform = ''
            }, 240)
        }
    }

    mp.addEventListener('touchend', () => {
        if(!dragging) return
        finish((currentY - startY) > 80)
    })

    mp.addEventListener('touchcancel', () => {
        if(!dragging) return
        finish(false)
    })
})()

/* ============================================================
   ЕЖЕДНЕВНОЕ УВЕДОМЛЕНИЕ
============================================================ */
const DAILY_MESSAGES = [
    { title:'🎉 listatread chvad', body:'Подписка chvad открывает больше статусов.' },
    { title:'🔥 Начни LIVE!', body:'Стань первым — запусти LIVE.' },
    { title:'🎁 Магазин подарков', body:'Загляни в storr.' },
    { title:'✨ Новые статусы', body:'Обнови свой профиль!' },
    { title:'📣 Live чат региона', body:'Присоединяйся к общению.' }
]
async function maybeSendDailyNotification(){
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) return
        const today = new Date().toISOString().slice(0, 10)
        const key = 'lt_daily_notif_' + user.id
        if(localStorage.getItem(key) === today) return
        const hours = new Date().getHours()
        if(hours < 10 || hours > 22){ const delay = ((10 - hours + 24) % 24) * 3600 * 1000; setTimeout(maybeSendDailyNotification, Math.min(delay, 6 * 3600 * 1000)); return }
        if(!sessionStorage.getItem(key + '_scheduled')){
            sessionStorage.setItem(key + '_scheduled', '1')
            const wait = Math.floor(Math.random() * 60 * 60 * 1000)
            setTimeout(async () => {
                const pick = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)]
                try { await supabase.from('notifications').insert({ user_id:user.id, type:'info', title:pick.title, body:pick.body }); localStorage.setItem(key, today); if(state.screen === 'inbox') renderEventsScreen() } catch {}
            }, wait)
        }
    } catch(e){ console.warn(e.message) }
}

/* ============================================================
   REPORT — жалобы
============================================================ */
const REPORT_REASONS = [
    { key:'spam',    icon:'📢', label:'Спам или реклама' },
    { key:'abuse',   icon:'😡', label:'Оскорбления или травля' },
    { key:'adult',   icon:'🔞', label:'Контент для взрослых' },
    { key:'violence',icon:'⚔️', label:'Насилие или угрозы' },
    { key:'fraud',   icon:'💸', label:'Мошенничество' },
    { key:'copyright',icon:'©️', label:'Нарушение авторских прав' },
    { key:'fake',    icon:'🎭', label:'Фейковая информация' },
    { key:'hate',    icon:'💢', label:'Пропаганда ненависти' },
    { key:'danger',  icon:'☠️', label:'Опасный контент' },
    { key:'symbols', icon:'🚫', label:'Оскорбительные символы' },
    { key:'bully',   icon:'👊', label:'Буллинг' },
    { key:'illegal', icon:'⚠️', label:'Продажа запрещённых товаров' },
    { key:'privacy', icon:'🔒', label:'Личные данные без согласия' },
    { key:'minor',   icon:'🧒', label:'Несовершеннолетние в опасности' },
    { key:'other',   icon:'❓', label:'Другое' }
]
let _reportCtx = { targetType:null, targetId:null, authorId:null, media:null, text:null, author:null }

function getReportModal(){
    let el = document.getElementById('report-modal')
    if(!el){
        el = document.createElement('div')
        el.id = 'report-modal'
        el.className = 'report-modal hidden'
        el.innerHTML = `
            <div class="report-backdrop" id="report-backdrop"></div>
            <div class="report-sheet" id="report-sheet">
                <div class="actionsheet-handle"></div>
                <h3 class="report-title">Пожаловаться</h3>
                <p class="report-sub">Выберите причину жалобы</p>
                <div class="report-preview" id="report-preview"></div>
                <div class="report-reasons" id="report-reasons"></div>
                <textarea class="report-comment hidden" id="report-comment" placeholder="Опишите проблему подробнее..." maxlength="500"></textarea>
                <div class="report-actions"><button class="btn-gray" id="report-cancel">Отмена</button><button class="btn-primary" id="report-submit" disabled>Отправить</button></div>
            </div>
        `
        document.body.appendChild(el)
        document.getElementById('report-backdrop').addEventListener('click', closeReportModal)
        document.getElementById('report-cancel').addEventListener('click', closeReportModal)
        document.getElementById('report-submit').addEventListener('click', submitReport)
    }
    return el
}
function openReportModal(ctx){
    _reportCtx = { ..._reportCtx, ...ctx }
    const modal = getReportModal()
    const reasons = document.getElementById('report-reasons')
    const comment = document.getElementById('report-comment')
    const submit = document.getElementById('report-submit')
    let selected = null

    const preview = document.getElementById('report-preview')
    let previewHtml = ''
    if(ctx.media){
        const clean = ctx.media.split('?')[0].toLowerCase()
        if(/\.(mp4|webm|mov|m4v)$/.test(clean)) previewHtml += `<video src="${ctx.media}" controls playsinline class="report-preview-media"></video>`
        else if(/\.(mp3|wav|ogg|m4a|aac)$/.test(clean)) previewHtml += `<audio src="${ctx.media}" controls style="width:100%;margin-bottom:8px"></audio>`
        else previewHtml += `<img src="${ctx.media}" class="report-preview-media" alt="">`
    }
    if(ctx.text) previewHtml += `<div class="report-preview-text">${escapeHtml(ctx.text.slice(0, 300))}</div>`
    if(ctx.author){
        const name = ctx.author.full_name || ctx.author.username || 'user'
        const av = ctx.author.avatar_url ? `<img src="${ctx.author.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
        previewHtml += `<div class="report-preview-head"><div class="report-preview-ava">${av}</div><div><div class="report-preview-name">${escapeHtml(name)}</div><div class="report-preview-sub">@${escapeHtml(ctx.author.username || 'user')}</div></div></div>`
    }
    preview.innerHTML = previewHtml || '<div style="text-align:center;color:var(--text-secondary);font-size:13px">Жалоба на контент</div>'

    reasons.innerHTML = REPORT_REASONS.map(r => `<button class="report-reason" data-key="${r.key}"><span class="report-reason-icon">${r.icon}</span><span class="report-reason-text">${r.label}</span></button>`).join('')
    reasons.querySelectorAll('.report-reason').forEach(b => {
        b.addEventListener('click', () => {
            reasons.querySelectorAll('.report-reason').forEach(x => x.classList.toggle('active', x === b))
            selected = b.dataset.key
            if(selected === 'other') comment.classList.remove('hidden')
            else comment.classList.add('hidden')
            submit.disabled = false
        })
    })
    comment.value = ''
    submit.disabled = true
    modal.classList.remove('hidden')
    requestAnimationFrame(() => { document.getElementById('report-sheet').style.transform = 'translateY(0)' })
    modal._selected = () => selected
}
function closeReportModal(){
    const modal = document.getElementById('report-modal'); if(!modal) return
    document.getElementById('report-sheet').style.transform = 'translateY(100%)'
    setTimeout(() => modal.classList.add('hidden'), 280)
}
async function submitReport(){
    const modal = document.getElementById('report-modal')
    const selected = modal?._selected?.()
    if(!selected) return
    const comment = document.getElementById('report-comment').value.trim()
    if(selected === 'other' && !comment){ showToast('error', 'Опишите проблему', { icon:'⚠️' }); return }
    const reasonLabel = REPORT_REASONS.find(r => r.key === selected)?.label || selected
    const btn = document.getElementById('report-submit')
    btn.disabled = true; btn.textContent = 'Отправляем...'
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user) throw new Error('Не авторизован')
        await supabase.from('reports').insert({
            reporter_id: user.id,
            target_type: _reportCtx.targetType,
            target_id: _reportCtx.targetId,
            reason: reasonLabel,
            reason_key: selected,
            comment: comment || null,
            status: 'pending'
        })
        closeReportModal()
        showGreyReportPush()
    } catch(e){
        console.error('[report]', e)
        showToast('error', 'Не удалось отправить жалобу: ' + (e.message || 'ошибка'), { icon:'⚠️' })
    } finally { btn.disabled = false; btn.textContent = 'Отправить' }
}
function showGreyReportPush(){
    let push = document.getElementById('report-push')
    if(!push){
        push = document.createElement('div')
        push.id = 'report-push'
        push.className = 'grey-push hidden'
        push.innerHTML = `<div class="grey-push-icon">✅</div><div class="grey-push-body"><div class="grey-push-title">Ваша жалоба отправлена</div><div class="grey-push-sub">Следите за статусом в уведомления системы. Спасибо, что делаете listatread лучше!</div></div><div class="grey-push-close">✕</div>`
        document.body.appendChild(push)
        push.querySelector('.grey-push-close').addEventListener('click', e => { e.stopPropagation(); push.classList.remove('show'); setTimeout(() => push.classList.add('hidden'), 320) })
    }
    push.classList.remove('hidden')
    requestAnimationFrame(() => push.classList.add('show'))
    setTimeout(() => { push.classList.remove('show'); setTimeout(() => push.classList.add('hidden'), 320) }, 6000)
}
window.openReportModal = openReportModal
window.showGreyReportPush = showGreyReportPush

/* ============================================================
   ENTER APP / BOOT / REALTIME
============================================================ */
async function heartbeat(){ try { const { data:{ user } } = await supabase.auth.getUser(); if(!user) return; await supabase.from('profiles').update({ last_seen:new Date().toISOString() }).eq('id', user.id) } catch {} }
async function checkMainChannelSubscription(){
    try { const { data:{ user } } = await supabase.auth.getUser(); if(!user){ state.hasMainChannelSub = false; return }
        const { count } = await supabase.from('subscriptions').select('*', { count:'exact', head:true }).eq('follower_id', user.id)
        state.hasMainChannelSub = (count || 0) > 0
    } catch { state.hasMainChannelSub = false }
}

async function ensureQjnSub(userId){
    try {
        if(!userId) return
        const { data:ch } = await supabase.from('channels').select('id').eq('join_code', 'QJN3G').maybeSingle()
        if(!ch?.id) return
        const { data:existing } = await supabase.from('subscriptions').select('id').eq('follower_id', userId).eq('channel_id', ch.id).maybeSingle()
        if(existing) return
        await supabase.from('subscriptions').insert({ follower_id:userId, channel_id:ch.id })
        await refreshFollowCache()
    } catch(e){ console.warn('[QJN3G]', e.message) }
}

async function enterApp(){
    await checkAdminStatus()

    if(ADMIN_STATE.isBanned){
        showScreen('main')
        mainApp.classList.add('hidden')
        showBlockedScreen()
        return
    }

    showScreen('main')
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(user){
            const { data:prof } = await supabase.from('profiles')
                .select('region, status, status_emoji, theme')
                .eq('id', user.id).maybeSingle()
            if(prof?.region) state.data.region = prof.region
            if(prof?.status_emoji || prof?.status) state.data.status = prof.status_emoji || prof.status
            if(prof?.theme) applyTheme(prof.theme)
            else applyTheme(getTheme())
        }
    } catch {}

    await checkMainChannelSubscription()
    await refreshFollowCache()
    switchScreen('home')
    renderLiveNow(); renderStories(); loadProfile(); loadStatus();
    renderEventsScreen(); renderLiveFeed()
    maybeSendDailyNotification()
    heartbeat()

    // Подписка на QJN3G
    try { const { data:{ user } } = await supabase.auth.getUser(); if(user) await ensureQjnSub(user.id) } catch {}
    // Автозакрытие старых жалоб
    try { autoCloseOldReports() } catch {}

    await Router.resolve()
}

window.addEventListener('popstate', async () => {
    document.querySelectorAll('#channel-screen, #live-room-screen')
        .forEach(el => el.classList.add('hidden'))
    ;['share-modal', 'search-overlay', 'qr-modal', 'qr-scan-modal', 'actionsheet', 'prioriti-sheet', 'code-modal', 'lang-modal', 'region-modal', 'report-modal']
        .forEach(id => document.getElementById(id)?.classList.add('hidden'))

    const target = Router.parse(location.pathname + location.search + location.hash)
    if (!target){
        state.currentProfileViewId = null;
        state.viewingOwnProfile = true;
        switchScreen('home');
        return;
    }
    Router._pending = target;
    Router._pending.raw = location.pathname + location.search + location.hash;
    await Router.resolve();
});

async function boot(){
    Router.init()

    initTheme()
    setPageBg(true)
    const start = Date.now()
    try {
        const { data:{ session } } = await withTimeout(supabase.auth.getSession(), 6000, 'boot')
        const el = Date.now() - start
        if(el < 1200) await new Promise(r => setTimeout(r, 1200 - el))
        bootScreen.classList.add('fade-out')
        setTimeout(() => bootScreen.remove(), 400)
        if(session) await enterApp()
        else showScreen('auth')
    } catch(e){
        const el = Date.now() - start
        if(el < 1200) await new Promise(r => setTimeout(r, 1200 - el))
        bootScreen.classList.add('fade-out')
        setTimeout(() => bootScreen.remove(), 400)
        showScreen('auth')
    }
}

document.getElementById('home-search-btn')?.addEventListener('click', openSearchMenu)

function openSearchMenu(){
    showActionSheet('Поиск', [
        { label: 'Поиск в listatread', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>', onClick: () => openPostSearch() },
        { label: 'Найти людей', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><circle cx="17" cy="9" r="2.5"/><path d="M14.5 14.5c2.5 0 4.5 2 4.5 4.5"/></svg>', onClick: () => openFindPeople() },
        { label: 'Найти трек listatread', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', onClick: () => openFindTrack() },
        { label: 'Найти канал по коду', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/></svg>', onClick: () => openCodeModalFor('channel') },
        { label: 'Найти профиль по ID или @', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>', onClick: () => openCodeModalFor('profile') },
        { label: 'Найти LIVE по коду', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2s4 3 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>', onClick: () => openCodeModalFor('live') },
        { label: 'Сканировать QR', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18"/></svg>', onClick: () => openQrScanModal() }
    ])
}
document.getElementById('home-chats-btn')?.addEventListener('click', () => { openDirectTab() })

;(function initTopbarAutoHide(){
    let lastY = window.scrollY, ticking = false
    const SHOW_DELTA = 1, HIDE_DELTA = 10, HIDE_AFTER = 30
    function update(){
        const curY = window.scrollY, diff = curY - lastY
        const activeScreen = document.querySelector('.app-screen.active')
        if(!activeScreen){ lastY = curY; ticking = false; return }
        const bar = activeScreen.querySelector('.topbar')
        if(!bar){ lastY = curY; ticking = false; return }
        if(curY < 8) bar.classList.remove('topbar-hidden')
        else if(diff <= -SHOW_DELTA) bar.classList.remove('topbar-hidden')
        else if(diff >= HIDE_DELTA && curY > HIDE_AFTER) bar.classList.add('topbar-hidden')
        lastY = curY; ticking = false
    }
    window.addEventListener('scroll', () => { if(!ticking){ requestAnimationFrame(update); ticking = true } }, { passive:true })
})()

/* ============================================================
   СИСТЕМА ПОИСКА
============================================================ */
let _searchPool = null
let _searchScreenEl = null
let _searchMode = 'posts'
let _searchFilter = 'all'
let _searchDebounce = null
const SEARCH_HISTORY_KEY = 'lt_search_history'
const SEARCH_HISTORY_MAX = 10

function getSearchHistory(){
    try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]') } catch { return [] }
}
function pushSearchHistory(q){
    if(!q) return
    const arr = getSearchHistory().filter(x => x !== q)
    arr.unshift(q)
    try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(arr.slice(0, SEARCH_HISTORY_MAX))) } catch {}
}

async function loadSearchPool(){
    if(_searchPool) return _searchPool
    const [profs, chans, posts] = await Promise.all([
        supabase.from('profiles').select('username, full_name').limit(300),
        supabase.from('channels').select('name').limit(300),
        supabase.from('posts').select('media_title').not('media_title', 'is', null).limit(150)
    ])
    const set = new Set()
    ;(profs.data || []).forEach(p => {
        if(p.username) set.add('@' + p.username)
        if(p.full_name) set.add(p.full_name)
    })
    ;(chans.data || []).forEach(c => { if(c.name) set.add(c.name) })
    ;(posts.data || []).forEach(p => { if(p.media_title) set.add(p.media_title) })
    ;['автомобиль','аэропорт','музыка','видео','спорт','игры','еда','путешествия','кино','животные','природа','фото'].forEach(w => set.add(w))
    _searchPool = [...set].filter(Boolean)
    return _searchPool
}

function getSearchOverlay(){
    if(_searchScreenEl) return _searchScreenEl
    const el = document.createElement('div')
    el.id = 'search-overlay'
    el.className = 'search-overlay hidden'
    el.innerHTML = `
        <div class="search-top">
            <button class="topbar-btn" id="search-back-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <div class="search-input-wrap">
                <input type="text" id="search-input" placeholder="Поиск" autocomplete="off" enterkeyhint="search">
                <button class="search-clear-btn hidden" id="search-clear">✕</button>
            </div>
            <button class="topbar-btn" id="search-submit">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            </button>
        </div>
        <div class="search-suggestions hidden" id="search-suggestions"></div>
        <div class="search-title-bar hidden" id="search-title-bar"></div>
        <div class="search-results" id="search-results"></div>
    `
    document.body.appendChild(el)

    el.querySelector('#search-back-btn').addEventListener('click', closeSearchOverlay)
    el.querySelector('#search-clear').addEventListener('click', () => {
        const inp = el.querySelector('#search-input')
        inp.value = ''
        el.querySelector('#search-clear').classList.add('hidden')
        el.querySelector('#search-suggestions').classList.add('hidden')
        el.querySelector('#search-title-bar').classList.add('hidden')
        el.querySelector('#search-results').innerHTML = ''
        showHistorySuggestions()
        inp.focus()
    })
    el.querySelector('#search-submit').addEventListener('click', () => {
        const q = el.querySelector('#search-input').value.trim()
        if(q) performSearch(q, _searchMode)
    })

    const input = el.querySelector('#search-input')
    input.addEventListener('input', () => {
        const q = input.value.trim()
        el.querySelector('#search-clear').classList.toggle('hidden', !q)
        clearTimeout(_searchDebounce)
        _searchDebounce = setTimeout(() => {
            if(!q){ showHistorySuggestions(); return }
            updateSuggestions(q)
        }, 80)
    })
    input.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
            e.preventDefault()
            input.blur()
            const q = input.value.trim()
            if(q) performSearch(q, _searchMode)
        }
    })

    el.addEventListener('click', e => {
        if(!e.target.closest('.search-input-wrap') && !e.target.closest('#search-suggestions')){
            el.querySelector('#search-suggestions').classList.add('hidden')
        }
    })

    _searchScreenEl = el
    return el
}

function closeSearchOverlay(){
    const el = _searchScreenEl; if(!el) return
    el.classList.remove('open')
    setTimeout(() => { if(!el.classList.contains('open')) el.classList.add('hidden') }, 300)
    document.body.style.overflow = ''
}

function openSearchOverlay(mode){
    _searchMode = mode
    _searchFilter = 'all'
    const el = getSearchOverlay()
    const placeholders = {
        posts:  'Поиск постов, людей, каналов',
        people: 'Найти людей по имени или @',
        tracks: 'Поиск треков и музыки'
    }
    el.querySelector('#search-input').placeholder = placeholders[mode] || 'Поиск'
    el.querySelector('#search-input').value = ''
    el.querySelector('#search-clear').classList.add('hidden')
    el.querySelector('#search-title-bar').classList.add('hidden')
    el.querySelector('#search-results').innerHTML = ''
    el.querySelector('#search-suggestions').classList.remove('hidden')
    renderSearchFilters(mode)
    el.classList.remove('hidden')
    void el.offsetWidth
    requestAnimationFrame(() => el.classList.add('open'))
    document.body.style.overflow = 'hidden'
    loadSearchPool().then(() => showHistorySuggestions())
    setTimeout(() => el.querySelector('#search-input').focus(), 120)
}

function renderSearchFilters(mode){
    const el = _searchScreenEl; if(!el) return
    let bar = el.querySelector('#search-filters')
    if(!bar){
        bar = document.createElement('div')
        bar.id = 'search-filters'
        bar.className = 'search-filters'
        const top = el.querySelector('.search-top')
        top.parentNode.insertBefore(bar, top.nextSibling)
    }
    const sets = {
        posts:  [['all','Все'],['posts','Посты'],['channels','Каналы'],['video','Видео'],['photo','Фото'],['tracks','Треки'],['people','Люди']],
        people: [['all','Все'],['name','По имени'],['bio','По описанию']],
        tracks: [['all','Все треки']]
    }
    const list = sets[mode] || sets.posts
    bar.innerHTML = list.map(([k,label]) =>
        `<button class="search-filter-chip ${_searchFilter===k?'active':''}" data-filter="${k}">${label}</button>`
    ).join('')
    bar.querySelectorAll('.search-filter-chip').forEach(b => {
        b.addEventListener('click', () => {
            _searchFilter = b.dataset.filter
            bar.querySelectorAll('.search-filter-chip').forEach(x => x.classList.toggle('active', x === b))
            const q = el.querySelector('#search-input').value.trim()
            if(q) performSearch(q, _searchMode)
        })
    })
}

function renderSuggestions(items){
    const box = _searchScreenEl.querySelector('#search-suggestions')
    if(!items.length){ box.classList.add('hidden'); return }
    box.innerHTML = items.map(s => `
        <button class="search-sug-item" data-q="${escapeHtml(s)}">
            <span class="search-sug-icon">${ICONS.search}</span>
            <span class="search-sug-text">${escapeHtml(s)}</span>
        </button>
    `).join('')
    box.classList.remove('hidden')
    box.querySelectorAll('.search-sug-item').forEach(b => b.addEventListener('click', () => {
        const q = b.dataset.q
        _searchScreenEl.querySelector('#search-input').value = q
        _searchScreenEl.querySelector('#search-clear').classList.remove('hidden')
        box.classList.add('hidden')
        performSearch(q, _searchMode)
    }))
}

function updateSuggestions(q){
    if(!_searchPool){ showHistorySuggestions(); return }
    const low = q.toLowerCase()
    const starts = _searchPool.filter(s => s.toLowerCase().startsWith(low))
    const contains = _searchPool.filter(s => !s.toLowerCase().startsWith(low) && s.toLowerCase().includes(low))
    const top = [...starts, ...contains].slice(0, 5)
    if(!top.length){ renderSuggestions([]); return }
    const box = _searchScreenEl.querySelector('#search-suggestions')
    box.innerHTML = top.map(s => {
        const idx = s.toLowerCase().indexOf(low)
        const before = s.slice(0, idx)
        const match = s.slice(idx, idx + q.length)
        const after = s.slice(idx + q.length)
        return `<button class="search-sug-item" data-q="${escapeHtml(s)}">
            <span class="search-sug-icon">${ICONS.search}</span>
            <span class="search-sug-text">${escapeHtml(before)}<b>${escapeHtml(match)}</b>${escapeHtml(after)}</span>
        </button>`
    }).join('')
    box.classList.remove('hidden')
    box.querySelectorAll('.search-sug-item').forEach(b => b.addEventListener('click', () => {
        const qq = b.dataset.q
        _searchScreenEl.querySelector('#search-input').value = qq
        _searchScreenEl.querySelector('#search-clear').classList.remove('hidden')
        box.classList.add('hidden')
        performSearch(qq, _searchMode)
    }))
}

function showHistorySuggestions(){
    const hist = getSearchHistory()
    const box = _searchScreenEl.querySelector('#search-suggestions')
    if(!hist.length){ box.classList.add('hidden'); return }
    box.innerHTML = `<div class="search-history-title">Недавние</div>` + hist.map(s => `
        <button class="search-sug-item" data-q="${escapeHtml(s)}">
            <span class="search-sug-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </span>
            <span class="search-sug-text">${escapeHtml(s)}</span>
        </button>
    `).join('')
    box.classList.remove('hidden')
    box.querySelectorAll('.search-sug-item').forEach(b => b.addEventListener('click', () => {
        const q = b.dataset.q
        _searchScreenEl.querySelector('#search-input').value = q
        _searchScreenEl.querySelector('#search-clear').classList.remove('hidden')
        box.classList.add('hidden')
        performSearch(q, _searchMode)
    }))
}

function openPostSearch(){ openSearchOverlay('posts') }
function openFindPeople(){ openSearchOverlay('people') }
function openFindTrack(){ openSearchOverlay('tracks') }

async function performSearch(query, mode){
    query = query.trim()
    if(!query) return
    pushSearchHistory(query)

    const el = _searchScreenEl
    el.querySelector('#search-suggestions').classList.add('hidden')
    el.querySelector('#search-title-bar').classList.remove('hidden')
    el.querySelector('#search-title-bar').textContent = 'Поиск: «' + query + '»'
    const results = el.querySelector('#search-results')
    results.innerHTML = `<div class="loading-block"><span class="loading-spinner-inline"></span>Поиск…</div>`

    try {
        if(mode === 'people'){
            const people = await searchPeopleByTerm(query, _searchFilter)
            if(!people.length){ renderEmpty(results, query); return }
            renderPeopleResults(results, people); return
        }
        if(mode === 'tracks'){
            const tracks = await searchTracksByTerm(query)
            if(!tracks.length){ renderEmpty(results, query); return }
            await renderPostsResults(results, tracks, 'трек'); return
        }
        const bundle = await searchAllByTerm(query, _searchFilter)
        const empty = !bundle.people.length && !bundle.channels.length && !bundle.posts.length
        if(empty){ renderEmpty(results, query); return }
        await renderAllResults(results, bundle, query)
    } catch(e){
        console.warn('[search]', e.message)
        results.innerHTML = `<p class="search-empty">Ошибка поиска</p>`
    }
}

function renderEmpty(box, q){
    box.innerHTML = `<div class="search-empty"><div class="search-empty-icon">🔎</div>Нет результатов по запросу «${escapeHtml(q)}»</div>`
}

const POST_SELECT = 'id, content, media_url, media_title, created_at, author_id, channel_id, poll, profiles:author_id ( username, full_name, avatar_url, status, is_admin ), channels:channel_id ( id, name, avatar_url )'

async function searchPeopleByTerm(query, filter = 'all'){
    const term = `%${query.replace(/[%_]/g, '')}%`
    let q = supabase.from('profiles').select('id, username, full_name, avatar_url, bio, status, is_admin')
    if(filter === 'name') q = q.or(`username.ilike.${term},full_name.ilike.${term}`)
    else if(filter === 'bio') q = q.ilike('bio', term)
    else q = q.or(`username.ilike.${term},full_name.ilike.${term},bio.ilike.${term}`)
    const { data, error } = await q.limit(60)
    if(error){ console.warn('[searchPeople]', error.message); return [] }
    return data || []
}

async function searchTracksByTerm(query){
    const term = `%${query.replace(/[%_]/g, '')}%`
    const [byTitle, byContent] = await Promise.all([
        supabase.from('posts').select(POST_SELECT).ilike('media_title', term).not('media_url', 'is', null).order('created_at', { ascending:false }).limit(50),
        supabase.from('posts').select(POST_SELECT).ilike('content', term).not('media_url', 'is', null).order('created_at', { ascending:false }).limit(50)
    ])
    const map = new Map()
    ;(byTitle.data   || []).forEach(p => map.set(p.id, p))
    ;(byContent.data || []).forEach(p => map.set(p.id, p))
    return [...map.values()].filter(p => isAudioUrl(p.media_url)).slice(0, 60)
}

async function searchAllByTerm(query, filter = 'all'){
    const term = `%${query.replace(/[%_]/g, '')}%`
    const out = { people: [], channels: [], posts: [] }

    const wantPeople   = filter === 'all' || filter === 'people'
    const wantChannels = filter === 'all' || filter === 'channels'
    const wantPosts    = filter === 'all' || filter === 'posts' || filter === 'video' || filter === 'photo' || filter === 'tracks'

    const jobs = []
    if(wantPeople) jobs.push(
        supabase.from('profiles').select('id, username, full_name, avatar_url, bio, status, is_admin')
            .or(`username.ilike.${term},full_name.ilike.${term},bio.ilike.${term}`).limit(20)
            .then(r => out.people = r.data || [])
    )
    if(wantChannels) jobs.push(
        supabase.from('channels').select('id, name, description, avatar_url')
            .or(`name.ilike.${term},description.ilike.${term}`).limit(20)
            .then(r => out.channels = r.data || [])
    )
    if(wantPosts){
        jobs.push(
            supabase.from('posts').select(POST_SELECT)
                .or(`content.ilike.${term},media_title.ilike.${term}`)
                .order('created_at', { ascending:false }).limit(40)
                .then(r => out.posts = r.data || [])
        )
    }
    await Promise.all(jobs)

    if(filter === 'video') out.posts = out.posts.filter(p => isVideoUrl(p.media_url))
    if(filter === 'photo') out.posts = out.posts.filter(p => p.media_url && isImageUrl(p.media_url))
    if(filter === 'tracks') out.posts = out.posts.filter(p => isAudioUrl(p.media_url))
    if(filter === 'channels') out.posts = []

    return out
}

function renderPeopleResults(box, people){
    box.innerHTML = people.map(p => {
        const name = p.full_name || p.username || 'user'
        const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
        const emoji = statusEmoji(computeDisplayStatus(p))
        return `<div class="search-person" data-uid="${p.id}">
            <div class="search-person-avatar">${av}</div>
            <div class="search-person-info">
                <div class="search-person-name">${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''} ${emoji}</div>
                <div class="search-person-sub">@${escapeHtml(p.username || 'user')}</div>
                ${p.bio ? `<div class="search-person-bio">${escapeHtml(p.bio)}</div>` : ''}
            </div>
        </div>`
    }).join('')
    box.querySelectorAll('.search-person[data-uid]').forEach(el => el.addEventListener('click', () => {
        closeSearchOverlay(); setTimeout(() => openUserProfile(el.dataset.uid), 250)
    }))
}

function renderChannelsResults(box, channels){
    return channels.map(c => {
        const name = c.name || 'Канал'
        const ic = c.avatar_url ? `<img src="${c.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
        return `<div class="search-channel-row" data-ch="${c.id}">
            <div class="search-channel-icon">${ic}</div>
            <div class="search-channel-info">
                <div class="search-channel-name">${escapeHtml(name)}</div>
                ${c.description ? `<div class="search-channel-sub">${escapeHtml(c.description)}</div>` : ''}
            </div>
        </div>`
    }).join('')
}

async function renderAllResults(box, bundle, query){
    box.innerHTML = ''
    let html = ''

    if(bundle.people.length){
        html += `<div class="search-section-title">Люди</div>`
        html += bundle.people.slice(0, 5).map(p => {
            const name = p.full_name || p.username || 'user'
            const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
            return `<div class="search-person" data-uid="${p.id}">
                <div class="search-person-avatar">${av}</div>
                <div class="search-person-info">
                    <div class="search-person-name">${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</div>
                    <div class="search-person-sub">@${escapeHtml(p.username || 'user')}</div>
                </div>
            </div>`
        }).join('')
    }
    if(bundle.channels.length){
        html += `<div class="search-section-title">Каналы</div>`
        html += renderChannelsResults(box, bundle.channels.slice(0, 5))
    }
    if(bundle.posts.length){
        html += `<div class="search-section-title">Посты</div>`
        html += `<div id="search-posts-container"></div>`
    }

    box.innerHTML = html

    box.querySelectorAll('.search-person[data-uid]').forEach(el => el.addEventListener('click', () => {
        closeSearchOverlay(); setTimeout(() => openUserProfile(el.dataset.uid), 250)
    }))
    box.querySelectorAll('.search-channel-row[data-ch]').forEach(el => el.addEventListener('click', () => {
        closeSearchOverlay(); setTimeout(() => openChannel(el.dataset.ch), 250)
    }))

    if(bundle.posts.length){
        const container = box.querySelector('#search-posts-container')
        await renderPostsResults(container, bundle.posts, 'результат поиска')
    }
}

async function renderPostsResults(box, data, ctx){
    const ids = data.map(p => p.id)
    const { data:{ user } } = await supabase.auth.getUser()
    const [{ data:likes }, { data:reps }, counts] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user?.id).in('post_id', ids),
        supabase.from('reposts').select('post_id').eq('user_id', user?.id).in('post_id', ids),
        fetchCounts(ids)
    ])
    const likedIds    = new Set((likes || []).map(l => l.post_id))
    const repostedIds = new Set((reps  || []).map(r => r.post_id))
    box.innerHTML = data.map(p => renderChannelPost(p, user?.id, likedIds, repostedIds, counts, ctx)).join('')
    likedIds.forEach(pid => syncPostLike(pid, true, 0))
    repostedIds.forEach(pid => syncPostRepost(pid, true, 0))
    attachFeedActions(box, user?.id)
    setTimeout(initTrackObserver, 100)
}

/* ============================================================
   ОБРАБОТЧИКИ ЭКРАНА КАНАЛОВ
============================================================ */
document.addEventListener('click', e => {
    if(e.target.closest('#chan-add-btn')){ e.preventDefault(); e.stopPropagation(); openCreateChannel(); return }
    if(e.target.closest('#chvad-more')){
        e.preventDefault(); e.stopPropagation()
        showActionSheet('listatread chvad', [
            { label:'Без рекламы', icon:ICONS.check, onClick: () => {} },
            { label:'Музыка без ограничений', icon:ICONS.music, onClick: () => {} },
            { label:'Оформление профиля', icon:ICONS.person, onClick: () => {} },
            { label:'Больше статусов', icon:ICONS.star, onClick: () => {} },
            { label:'Публикация видео', icon:ICONS.send, onClick: () => {} },
            { label:'Live без ограничений', icon:ICONS.live, onClick: () => {} },
            { label:'Оформить подписку', icon:ICONS.gift, onClick: () => openPrioriti() }
        ])
        return
    }
    if(e.target.closest('#chan-create-empty')){ e.preventDefault(); e.stopPropagation(); openCreateChannel(); return }
})

/* ============================================================
   НАСТРОЙКИ КАНАЛА
============================================================ */
const chSetState = {
    channelId: null, tab: 'general', channel: null, members: [], canModerate: false, isOwner: false,
    newAvatarFile: null, newType: null
}

async function openChannelSettings(channelId, initialTab = 'general'){
    const { data:{ user } } = await supabase.auth.getUser()
    const { data:ch } = await supabase.from('channels').select('*').eq('id', channelId).maybeSingle()
    if(!ch || ch.owner_id !== user.id) return
    chSetState.channelId = channelId
    chSetState.tab = initialTab
    chSetState.channel = ch
    chSetState.isOwner = true
    chSetState.canModerate = true
    renderChannelSettings()
}

function renderChannelSettings(){
    let screen = $('channel-settings-screen')
    if(!screen){
        screen = document.createElement('div')
        screen.id = 'channel-settings-screen'
        document.body.appendChild(screen)
        screen.addEventListener('click', e => {
            if(e.target.closest('#chs-back')){ closeChannelSettings(); return }
            const tabBtn = e.target.closest('.settings-tab')
            if(tabBtn){ chSetState.tab = tabBtn.dataset.stab; renderChannelSettings(); return }
        })
    }

    const ch = chSetState.channel
    const tab = chSetState.tab
    const currentType = ch.channel_type === 'bycode' ? 'private' : (ch.channel_type || 'public')
    const typeLabel = currentType === 'private' ? 'Частный' : (currentType === 'community' ? 'Общественный' : 'Публичный')

    screen.innerHTML = `
        <div class="reg-topbar">
            <button class="reg-back-btn" id="chs-back">‹</button>
            <span class="reg-topbar-title">Настройки канала</span>
            <span class="reg-topbar-spacer"></span>
        </div>
        <div class="settings-tabs">
            <button class="settings-tab ${tab==='general'?'active':''}" data-stab="general">Общие</button>
            <button class="settings-tab ${tab==='privacy'?'active':''}" data-stab="privacy">Приватность</button>
            <button class="settings-tab ${tab==='additional'?'active':''}" data-stab="additional">Дополнительно</button>
        </div>

        <div class="settings-panel ${tab==='general'?'active':''}" data-panel="general">
            <div class="ch-edit-form">
                <label class="ch-edit-avatar" for="chs-avatar">
                    <div class="ch-edit-avatar-img" id="chs-avatar-preview">
                        ${ch.avatar_url ? `<img src="${ch.avatar_url}" alt="">` : (ch.name || 'K').charAt(0).toUpperCase()}
                    </div>
                    <input type="file" id="chs-avatar" accept="image/*" hidden>
                    <span class="ch-edit-avatar-hint">Нажмите чтобы изменить аватарку</span>
                </label>
                <label class="settings-label">Название</label>
                <input type="text" id="chs-name" maxlength="30" value="${escapeHtml(ch.name || '')}">
                <label class="settings-label">Описание</label>
                <textarea id="chs-desc" maxlength="200" rows="3" placeholder="О чём канал?">${escapeHtml(ch.description || '')}</textarea>
                <label class="settings-label">Код приглашения</label>
                <div class="chs-code-display">
                    <span>${escapeHtml(ch.join_code || '—')}</span>
                    <span class="chs-code-note">нельзя изменить</span>
                </div>
                <button class="btn-primary settings-save" id="chs-save-general">Сохранить изменения</button>
            </div>
            <h3 class="settings-group-title ch-members-title">Участники</h3>
            <div id="chs-members-list">${loadingBlock()}</div>
        </div>

        <div class="settings-panel ${tab==='privacy'?'active':''}" data-panel="privacy">
            <div class="settings-group">
                <h3 class="settings-group-title">Видимость канала</h3>
                <label class="toggle-row"><span>Показывать в рекомендациях</span><input type="checkbox" class="toggle" data-chset="recommend" ${currentType==='public'?'checked':''}></label>
                <label class="toggle-row"><span>Показывать в профилях</span><input type="checkbox" class="toggle" data-chset="profile" ${currentType==='public'?'checked':''}></label>
                <label class="toggle-row"><span>Показывать в listatread awards</span><input type="checkbox" class="toggle" data-chset="awards" ${currentType==='public'?'checked':''}></label>
            </div>
            <button class="btn-primary settings-save" id="chs-save-privacy">Сохранить</button>
        </div>

        <div class="settings-panel ${tab==='additional'?'active':''}" data-panel="additional">
            <div class="settings-section">
                <div class="settings-section-header">Информация</div>
                <div class="info-row"><span>Код</span><strong>${escapeHtml(ch.join_code || '—')}</strong></div>
                <div class="info-row"><span>Тип</span><strong>${typeLabel}</strong></div>
                <div class="info-row"><span>Создан</span><strong>${new Date(ch.created_at).toLocaleDateString('ru-RU')}</strong></div>
            </div>
            <button class="settings-row danger" id="chs-delete-channel">
                <div class="settings-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg></div>
                <div class="settings-row-text">Удалить канал</div>
            </button>
        </div>
    `

    requestAnimationFrame(() => screen.classList.add('show'))

    if(tab === 'general'){
        loadChannelMembers()
        $('chs-avatar')?.addEventListener('change', e => {
            const f = e.target.files?.[0]
            if(!f) return
            chSetState.newAvatarFile = f
            $('chs-avatar-preview').innerHTML = `<img src="${URL.createObjectURL(f)}" alt="">`
        })
        $('chs-save-general')?.addEventListener('click', saveChannelGeneral)
    }
    if(tab === 'privacy') $('chs-save-privacy')?.addEventListener('click', saveChannelPrivacy)
    if(tab === 'additional'){
        $('chs-delete-channel')?.addEventListener('click', async () => {
            if(!confirm('Удалить канал навсегда?')) return
            await supabase.from('channels').delete().eq('id', chSetState.channelId)
            closeChannelSettings()
            if(state.screen === 'channels') renderChannels()
        })
    }
}

function closeChannelSettings(){
    const screen = $('channel-settings-screen'); if(!screen) return
    screen.classList.remove('show')
    setTimeout(() => { if(!screen.classList.contains('show')) screen.remove() }, 340)
}

async function saveChannelPrivacy(){
    const chId = chSetState.channelId
    const getToggle = (key, dflt=false) => {
        const el = document.querySelector(`[data-chset="${key}"]`)
        return el ? el.checked : dflt
    }
    const membersPost = getToggle('members_post')
    const isPublicVis = getToggle('recommend', true) || getToggle('profile', true) || getToggle('awards', true)

    try {
        await supabase.from('channels').update({
            can_members_post: membersPost,
            is_public: isPublicVis,
            channel_type: membersPost ? 'community' : (isPublicVis ? 'public' : 'private')
        }).eq('id', chId)
        showToast('success', 'Настройки сохранены', { icon:'✓' })
    } catch(e){ showToast('error', 'Ошибка: ' + e.message) }
}

async function saveChannelGeneral(){
    const btn = $('chs-save-general')
    btn.disabled = true; btn.textContent = 'Сохранение...'
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        const name = ($('chs-name').value || '').trim()
        const desc = ($('chs-desc').value || '').trim()

        if(name.length < 3){
            showToast('error', 'Название минимум 3 символа', { icon:'⚠️' })
            btn.disabled = false; btn.textContent = 'Сохранить изменения'
            return
        }

        let avatarUrl = chSetState.channel.avatar_url
        if(chSetState.newAvatarFile){
            const f = chSetState.newAvatarFile
            const ext = f.name.split('.').pop() || 'jpg'
            const path = `${user.id}/channel-${Date.now()}.${ext}`
            const { error:upErr } = await supabase.storage.from('channels').upload(path, f, { contentType:f.type })
            if(!upErr){
                const { data:pub } = supabase.storage.from('channels').getPublicUrl(path)
                avatarUrl = pub.publicUrl
            }
        }

        const { error } = await supabase.from('channels').update({
            name, description: desc, avatar_url: avatarUrl
        }).eq('id', chSetState.channelId)
        if(error) throw error

        chSetState.channel = { ...chSetState.channel, name, description: desc, avatar_url: avatarUrl }
        chSetState.newAvatarFile = null
        chSetState.newType = null
        showToast('success', 'Канал обновлён', { icon:'✓' })
    } catch(e){
        showToast('error', 'Ошибка: ' + e.message)
    } finally {
        btn.disabled = false; btn.textContent = 'Сохранить изменения'
    }
}

/* ============================================================
   УЧАСТНИКИ КАНАЛА
============================================================ */
async function loadChannelMembers(){
    const box = $('chs-members-list'); if(!box) return
    box.innerHTML = loadingBlock()

    const chId = chSetState.channelId

    const { data:ch } = await supabase
        .from('channels')
        .select('owner_id, profiles:owner_id ( id, username, full_name, avatar_url, is_admin )')
        .eq('id', chId)
        .maybeSingle()

    let members = []
    {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('role, follower_id, profiles:follower_id ( id, username, full_name, avatar_url, is_admin )')
            .eq('channel_id', chId)
        if(!error && data){
            members = data.map(s => ({ ...(s.profiles || {}), _role: s.role || 'member' })).filter(m => m.id)
        } else {
            const { data:data2 } = await supabase
                .from('subscriptions')
                .select('follower_id, profiles:follower_id ( id, username, full_name, avatar_url, is_admin )')
                .eq('channel_id', chId)
            members = (data2 || []).map(s => ({ ...(s.profiles || {}), _role: 'member' })).filter(m => m.id)
        }
    }

    const owner = ch?.profiles || {}
    const admins = members.filter(m => m._role === 'admin')
    const regularMembers = members.filter(m => m._role !== 'admin')
    chSetState.members = members

    const total = 1 + members.length
    const render = (p, role, actions='') => {
        const name = p.full_name || p.username || 'user'
        const av = p.avatar_url ? `<img src="${p.avatar_url}" alt="">` : name.charAt(0).toUpperCase()
        return `<div class="ch-member-row">
            <div class="ch-member-avatar">${av}</div>
            <div class="ch-member-info">
                <div class="ch-member-name">${escapeHtml(name)}${p.is_admin ? adminBadge(true, 'small') : ''}</div>
                <div class="ch-member-role ${role==='member'?'member':''}">${role === 'owner' ? 'Владелец' : role === 'admin' ? 'Админ' : 'Участник'}</div>
            </div>
            <div class="ch-member-actions">${actions}</div>
        </div>`
    }

    let html = `<div class="cc-invite-title ch-members-title-left"><span><span id="ch-members-total">${total}</span> участников</span></div>`
    html += render(owner, 'owner')

    admins.forEach(m => {
        html += render(m, 'admin', `
            <button type="button" class="ch-member-btn demote" data-demote="${m.id}">Снять</button>
            <button type="button" class="ch-member-btn kick"   data-kick="${m.id}">Удалить</button>
        `)
    })
    regularMembers.forEach(m => {
        html += render(m, 'member', `
            <button type="button" class="ch-member-btn promote" data-promote="${m.id}">Повысить</button>
            <button type="button" class="ch-member-btn kick"    data-kick="${m.id}">Удалить</button>
        `)
    })
    box.innerHTML = html
}

async function handlePromoteMember(userId){
    const chId = chSetState.channelId
    if(!chId || !userId) return
    const { error } = await supabase.from('subscriptions').update({ role: 'admin' }).eq('channel_id', chId).eq('follower_id', userId)
    if(error){ showToast('error', 'Ошибка: ' + error.message, { icon:'⚠️' }); return }
    showToast('success', 'Назначен админом', { icon:'⭐' })
    loadChannelMembers()
}

async function handleDemoteMember(userId){
    const chId = chSetState.channelId
    if(!chId || !userId) return
    const { error } = await supabase.from('subscriptions').update({ role: 'member' }).eq('channel_id', chId).eq('follower_id', userId)
    if(error){ showToast('error', 'Ошибка: ' + error.message, { icon:'⚠️' }); return }
    showToast('success', 'Снят с админов', { icon:'✓' })
    loadChannelMembers()
}

async function handleKickMember(userId){
    const chId = chSetState.channelId
    if(!chId || !userId) return
    if(!confirm('Удалить участника из канала?')) return
    const { error } = await supabase.from('subscriptions').delete().eq('channel_id', chId).eq('follower_id', userId)
    if(error){ showToast('error', 'Ошибка: ' + error.message, { icon:'⚠️' }); return }
    showToast('success', 'Участник удалён', { icon:'✓' })
    loadChannelMembers()
}

document.addEventListener('click', e => {
    const kickBtn    = e.target.closest('[data-kick]')
    const promoteBtn = e.target.closest('[data-promote]')
    const demoteBtn  = e.target.closest('[data-demote]')

    if(kickBtn){ e.preventDefault(); e.stopPropagation(); handleKickMember(kickBtn.dataset.kick); return }
    if(promoteBtn){ e.preventDefault(); e.stopPropagation(); handlePromoteMember(promoteBtn.dataset.promote); return }
    if(demoteBtn){ e.preventDefault(); e.stopPropagation(); handleDemoteMember(demoteBtn.dataset.demote); return }
})

/* ============================================================
   SHARE SHEET
============================================================ */
let _shareCtx = { type:null, postId:null, channelId:null, authorId:null, src:null, title:null, url:null, profileId:null, selectedFriends:new Set() }

function getShareModal(){ return document.getElementById('share-modal') }

function applyRandomShareQr(){
    const el = document.getElementById('share-qr-banner'); if(!el) return
    const g = FULL_GRADIENTS[Math.floor(Math.random() * FULL_GRADIENTS.length)]
    el.style.background = `linear-gradient(135deg,${g[0]},${g[1]},${g[2]})`
    el.classList.add('animated')
}

async function fetchPostMeta(postId){
    try {
        const { data } = await supabase.from('posts')
            .select('id, content, media_title, author_id, profiles:author_id ( username, full_name, avatar_url ), channels:channel_id ( id, name, avatar_url )')
            .eq('id', postId).maybeSingle()
        return data || {}
    } catch { return {} }
}

function renderMiniMeta(prefix, meta){
    const p = meta.profiles || {}, ch = meta.channels || {}
    const uAva = document.getElementById(`${prefix}-user-ava`)
    const uName = document.getElementById(`${prefix}-user-name`)
    const chAva = document.getElementById(`${prefix}-ch-ava`)
    const chName = document.getElementById(`${prefix}-ch-name`)
    if(uAva) uAva.innerHTML = p.avatar_url ? `<img src="${p.avatar_url}">` : (p.full_name || p.username || 'U').charAt(0).toUpperCase()
    if(uName) uName.textContent = '@' + (p.username || 'user')
    if(chAva) chAva.innerHTML = ch.avatar_url ? `<img src="${ch.avatar_url}">` : (ch.name || 'K').charAt(0).toUpperCase()
    if(chName) chName.textContent = ch.name || '—'
}

async function openShareSheet(ctx){
    _shareCtx = { ..._shareCtx, ...ctx, selectedFriends:new Set() }
    const modal = getShareModal(); if(!modal) return
    modal.classList.remove('hidden')

    document.getElementById('share-video-banner').classList.add('hidden')
    document.getElementById('share-track-banner').classList.add('hidden')
    document.getElementById('share-profile-banner').classList.add('hidden')

    if(ctx.type === 'post')    _shareCtx.url = `${location.origin}${urlFor('post', ctx.postId)}`
    if(ctx.type === 'track')   _shareCtx.url = `${location.origin}${urlFor('post', ctx.postId)}?track=1`
    if(ctx.type === 'profile'){
        try {
            const { data:prof } = await supabase.from('profiles').select('username').eq('id', ctx.profileId).maybeSingle()
            _shareCtx.url = `${location.origin}${urlFor('profile', prof?.username || ctx.profileId)}`
        } catch {
            _shareCtx.url = `${location.origin}/?u=${ctx.profileId}`
        }
    }

    if(ctx.type === 'post' && ctx.src && isVideoUrl(ctx.src)){
        document.getElementById('share-video-banner').classList.remove('hidden')
        const vid = document.getElementById('share-video-el')
        vid.src = ctx.src; try { vid.currentTime = 0; vid.play().catch(()=>{}) } catch {}
        document.getElementById('share-video-title').textContent = ctx.title || ctx.content || 'Видео'
        const meta = await fetchPostMeta(ctx.postId)
        renderMiniMeta('share-video', meta)
    }

    if(ctx.type === 'track'){
        document.getElementById('share-track-banner').classList.remove('hidden')
        document.getElementById('share-track-title').textContent = ctx.title || 'Трек'
        const meta = await fetchPostMeta(ctx.postId)
        renderMiniMeta('share-track', meta)
        const bg = document.getElementById('share-track-bg')
        bg.style.backgroundImage = meta.channels?.avatar_url ? `url('${meta.channels.avatar_url}')` : 'linear-gradient(135deg,#ff9f0a,#ff375f)'
    }

    if(ctx.type === 'profile'){
        document.getElementById('share-profile-banner').classList.remove('hidden')
        const { data:profile } = await supabase.from('profiles').select('*').eq('id', ctx.profileId).maybeSingle()
        const fname = profile?.full_name || 'Пользователь'
        const av = document.getElementById('share-profile-ava')
        if(profile?.avatar_url) av.innerHTML = `<img src="${profile.avatar_url}" alt="">`
        else av.textContent = fname.charAt(0).toUpperCase()
        document.getElementById('share-profile-name').textContent = fname
        document.getElementById('share-profile-username').textContent = '@' + (profile?.username || 'user')
    }

    renderShareFriends()

    const qrImg = document.getElementById('share-qr-img')
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(_shareCtx.url)}`
    applyRandomShareQr()
    document.getElementById('share-qr-banner').onclick = () => {
        if(ctx.type === 'track' && music.postId){
            closeShareSheet(); openFullPlayer()
        } else if(ctx.type === 'post'){
            closeShareSheet(); if(ctx.src) enterVideoFS(ctx.src, ctx.postId)
        } else if(ctx.type === 'profile'){
            closeShareSheet(); openUserProfile(ctx.profileId)
        }
    }

    renderShareSocials()

    const sendBtn = document.getElementById('share-send-direct')
    sendBtn.disabled = true
    sendBtn.textContent = 'Отправить в директ'
    sendBtn.onclick = async () => {
        if(!_shareCtx.selectedFriends.size) return
        sendBtn.disabled = true; sendBtn.textContent = 'Отправка…'
        await new Promise(r => setTimeout(r, 500))
        sendBtn.textContent = 'Отправлено ✓'
        showToast('success', 'Отправлено (заглушка)', { icon:'✓' })
        setTimeout(() => { sendBtn.textContent = 'Отправить в директ'; sendBtn.disabled = true; _shareCtx.selectedFriends.clear(); renderShareFriends() }, 1400)
    }

    attachShareDrag()

    requestAnimationFrame(() => {
        document.getElementById('share-sheet').style.transform = 'translateY(0)'
    })
}

async function renderShareFriends(){
    const box = document.getElementById('share-friends-row'); if(!box) return
    box.innerHTML = '<div class="loading-block"><span class="loading-spinner-inline"></span></div>'
    try {
        const { data:{ user } } = await supabase.auth.getUser()
        if(!user){ box.innerHTML = '<p class="empty small">Войдите</p>'; return }
        const { data:fol } = await supabase.from('follows')
            .select('profiles:following_id ( id, username, full_name, avatar_url )')
            .eq('follower_id', user.id).limit(30)
        const people = (fol || []).map(f => f.profiles).filter(Boolean)
        if(!people.length){ box.innerHTML = '<p class="empty small">Нет подписок</p>'; return }
        box.innerHTML = people.map(p => {
            const name = p.full_name || p.username || 'user'
            const av = p.avatar_url ? `<img src="${p.avatar_url}">` : name.charAt(0).toUpperCase()
            return `<button class="share-friend" data-uid="${p.id}">
                <span class="share-friend-ava">${av}</span>
                <span class="share-friend-name">${escapeHtml(name)}</span>
            </button>`
        }).join('')
        box.querySelectorAll('.share-friend').forEach(b => b.addEventListener('click', () => {
            const uid = b.dataset.uid
            if(_shareCtx.selectedFriends.has(uid)) _shareCtx.selectedFriends.delete(uid)
            else _shareCtx.selectedFriends.add(uid)
            b.classList.toggle('selected', _shareCtx.selectedFriends.has(uid))
            const sendBtn = document.getElementById('share-send-direct')
            sendBtn.disabled = _shareCtx.selectedFriends.size === 0
            sendBtn.textContent = _shareCtx.selectedFriends.size
                ? `Отправить в директ (${_shareCtx.selectedFriends.size})`
                : 'Отправить в директ'
        }))
    } catch(e){ box.innerHTML = '<p class="empty small">Ошибка</p>' }
}

function renderShareSocials(){
    const box = document.getElementById('share-socials-row')
    box.innerHTML = SHARE_CIRCLES.map(s => `<button class="share-social-circle" data-sk="${s.key}" style="background:${s.bg}">${s.icon}<span class="share-social-label">${s.label}</span></button>`).join('')
    box.querySelectorAll('.share-social-circle').forEach(btn => btn.addEventListener('click', () => {
        const k = btn.dataset.sk
        const url = _shareCtx.url || ''
        const u = encodeURIComponent(url)
        if(k === 'copy'){ navigator.clipboard?.writeText(url); showToast('success','Ссылка скопирована',{icon:'✓'}); return }
        if(k === 'scan'){ closeShareSheet(); openQrScanModal(); return }
        if(k === 'more'){
            if(navigator.share) navigator.share({ url }).catch(()=>{})
            else { navigator.clipboard?.writeText(url); showToast('info','Ссылка скопирована',{icon:'✓'}) }
            return
        }
        const links = {
            telegram:  `https://t.me/share/url?url=${u}`,
            whatsapp:  `https://wa.me/?text=${u}`,
            facebook:  `https://www.facebook.com/sharer/sharer.php?u=${u}`,
            discord:   url,
            instagram: url,
            insta_story: url,
            viber:     `viber://forward?text=${u}`,
            wa_status: `https://wa.me/?text=${u}`
        }
        if(links[k]) window.open(links[k], '_blank')
    }))
}

function closeShareSheet(){
    const modal = getShareModal(); if(!modal) return
    const sheet = document.getElementById('share-sheet')
    sheet.style.transform = 'translateY(100%)'
    setTimeout(() => {
        modal.classList.add('hidden')
        sheet.style.transform = ''
        const vid = document.getElementById('share-video-el'); if(vid){ try { vid.pause(); vid.src = '' } catch {} }
    }, 280)
}

function attachShareDrag(){
    const sheet = document.getElementById('share-sheet')
    const handle = document.getElementById('share-handle')
    if(!sheet || !handle || handle.dataset.bound === '1') return
    handle.dataset.bound = '1'
    let startY = 0, curY = 0, drag = false, startTime = 0
    const onStart = e => {
        drag = true; startTime = Date.now()
        startY = (e.touches?.[0] || e).clientY; curY = startY
        sheet.classList.add('dragging')
    }
    const onMove = e => {
        if(!drag) return
        if(e.cancelable) e.preventDefault()
        curY = (e.touches?.[0] || e).clientY
        const dy = Math.max(0, curY - startY)
        sheet.style.transform = `translateY(${dy}px)`
    }
    const onEnd = () => {
        if(!drag) return
        drag = false
        sheet.classList.remove('dragging')
        const dy = curY - startY
        const height = sheet.offsetHeight || 1
        const ratio = dy / height
        const velocity = dy / (Date.now() - startTime)
        if(ratio > 0.5 || velocity > 0.8){
            closeShareSheet()
        } else {
            sheet.style.transform = 'translateY(0)'
        }
    }
    handle.addEventListener('touchstart', onStart, { passive:true })
    handle.addEventListener('touchmove', onMove, { passive:false })
    handle.addEventListener('touchend', onEnd)
    handle.addEventListener('mousedown', onStart)
    window.addEventListener('mousemove', e => { if(drag) onMove(e) })
    window.addEventListener('mouseup', () => { if(drag) onEnd() })
}

document.getElementById('share-cancel')?.addEventListener('click', closeShareSheet)
document.getElementById('share-backdrop')?.addEventListener('click', closeShareSheet)

document.getElementById('share-track-download')?.addEventListener('click', async () => {
    const banner = document.getElementById('share-track-banner')
    if(!banner) return
    try {
        const rect = banner.getBoundingClientRect()
        const canvas = document.createElement('canvas')
        canvas.width = rect.width * 2; canvas.height = rect.height * 2
        const ctx = canvas.getContext('2d')
        ctx.scale(2,2)
        const bg = document.getElementById('share-track-bg')
        const bgUrl = bg?.style.backgroundImage?.match(/url\(['"]?(.*?)['"]?\)/)?.[1]
        if(bgUrl){
            const img = new Image(); img.crossOrigin = 'anonymous'; img.src = bgUrl
            await new Promise(r => { img.onload = r; img.onerror = r })
            ctx.filter = 'blur(20px) saturate(1.4)'
            ctx.drawImage(img, -20, -20, rect.width + 40, rect.height + 40)
            ctx.filter = 'none'
        } else {
            const grd = ctx.createLinearGradient(0, 0, rect.width, rect.height)
            grd.addColorStop(0,'#ff9f0a'); grd.addColorStop(1,'#ff375f')
            ctx.fillStyle = grd; ctx.fillRect(0,0,rect.width,rect.height)
        }
        const ov = ctx.createLinearGradient(0, 0, 0, rect.height)
        ov.addColorStop(0,'rgba(0,0,0,.05)'); ov.addColorStop(1,'rgba(0,0,0,.75)')
        ctx.fillStyle = ov; ctx.fillRect(0,0,rect.width,rect.height)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 26px -apple-system, sans-serif'
        const logoSize = 44, logoX = 14, logoY = 14
        ctx.save()
        ctx.beginPath()
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI*2)
        ctx.fillStyle = '#000'
        ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4
        ctx.fill()
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
        ctx.fillStyle = '#fff'
        ctx.font = `400 ${Math.round(logoSize * 0.72)}px -apple-system, BlinkMacSystemFont, 'Times New Roman', serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('ℓ', logoX + logoSize/2, logoY + logoSize/2 + 2)
        ctx.restore()
        ctx.textAlign = 'start'; ctx.textBaseline = 'top'
        const title = document.getElementById('share-track-title').textContent
        ctx.fillText(title.slice(0, 24), 24, rect.height - 80)
        ctx.font = '13px -apple-system, sans-serif'
        ctx.fillText('прослушайте трек · listatread', 24, rect.height - 50)
        const url = canvas.toDataURL('image/png')
        const a = document.createElement('a'); a.href = url; a.download = 'listatread-track.png'
        document.body.appendChild(a); a.click(); a.remove()
        showToast('success', 'Баннер сохранён', { icon:'✓' })
    } catch(e){ showToast('error', 'Не удалось сохранить: ' + e.message) }
})

/* ============================================================
   СТАРТ
============================================================ */
boot()
setInterval(heartbeat, 30 * 1000)
document.addEventListener('visibilitychange', () => { if(!document.hidden){ heartbeat(); updatePlayIcons() } })
window.addEventListener('focus', () => { heartbeat(); updatePlayIcons() })

try {
    const ch = supabase.channel('public:realtime_v14')
        .on('postgres_changes', { event:'*', schema:'public', table:'posts' }, () => {
            if(state.screen === 'livechat') renderLiveFeed(true)
            if(state.screen === 'profile' && state.profileTab === 'posts') renderMyPosts(state.currentProfileViewId)
        })
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'follows' }, () => { if(state.screen === 'inbox') renderInboxPanel(); renderStories() })
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'channel_invites' }, () => { if(state.screen === 'inbox') renderInboxPanel() })
        .on('postgres_changes', { event:'*', schema:'public', table:'lives' }, () => { if(state.screen === 'home') renderLiveNow(); if(state.screen === 'inbox') renderEventsScreen() })
    ch.subscribe((s, err) => { if(err) console.warn('[realtime]', err.message) })
} catch(e){ console.warn('[realtime] disabled:', e.message) }