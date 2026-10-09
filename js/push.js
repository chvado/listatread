import { supabase } from './supabase.js'

const VAPID_PUBLIC = 'BFXnoxraj_-wlWpEBGxZIQu7AK_v5ZRKNya7fUNYUteInlYMWvu-_lZrtVtzP-oee3wyCxbVnEx7M_7p7j6IZZg'

function urlB64ToUint8(base64){
  const padding = '='.repeat((4 - base64.length % 4) % 4)
  const clean = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(clean)
  const out = new Uint8Array(raw.length)
  for(let i=0; i<raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export async function initPush(){
  if(!('serviceWorker' in navigator) || !('PushManager' in window)){
    console.warn('[push] not supported'); return false
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope:'/' })
    let perm = Notification.permission
    if(perm === 'default') perm = await Notification.requestPermission()
    if(perm !== 'granted'){ console.warn('[push] denied'); return false }

    let sub = await reg.pushManager.getSubscription()
    if(!sub){
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8(VAPID_PUBLIC)
      })
    }
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return false
    const j = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: j.endpoint,
      p256dh: j.keys.p256dh,
      auth: j.keys.auth
    }, { onConflict:'user_id,endpoint' })
    console.log('[push] subscribed')
    return true
  } catch(e){ console.error('[push]', e); return false }
}

if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message', event => {
    if(event.data?.type === 'open-dm'){
      const u = new URL(event.data.url, location.origin)
      const peerId = u.searchParams.get('dm')
      if(peerId && window.openDirectChat) window.openDirectChat(peerId)
    }
  })
}
