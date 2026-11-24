self.addEventListener('install', e => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  let data = { title: 'listatread', body: 'Новое уведомление', url: '/' }
  try { data = { ...data, ...event.data.json() } } catch {}
  const options = {
    body: data.body || '',
    icon: data.avatar || undefined,
    tag: 'lt-' + (data.peerId || Date.now()),
    data: { url: data.url || '/' },
    vibrate: [80, 40, 80],
    renotify: true
  }
  event.waitUntil(self.registration.showNotification(data.title || 'listatread', options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type:'window', includeUncontrolled:true })
    for(const c of all){
      if(c.url.includes(self.location.origin)){
        c.focus()
        c.postMessage({ type:'open-dm', url })
        return
      }
    }
    await self.clients.openWindow(url)
  })())
})

const CACHE = 'lt-media-v1', MAX = 400
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', e => {
  const r = e.request
  if(r.method !== 'GET' || r.headers.has('range')) return
  const u = new URL(r.url)
  const ok = u.hostname === 'api.listatread.online' && u.pathname.includes('/storage/v1/object/public/')
      && (r.destination === 'image' || /\.(png|jpe?g|webp|gif|avif)$/i.test(u.pathname))
  if(!ok) return
  e.respondWith((async () => {
    const c = await caches.open(CACHE)
    const hit = await c.match(r)
    if(hit) return hit
    const res = await fetch(r)
    if(res && (res.ok || res.type === 'opaque')){ c.put(r, res.clone()); trim(c) }
    return res
  })())
})
async function trim(c){ const k = await c.keys(); if(k.length > MAX) await Promise.all(k.slice(0, k.length - MAX).map(x => c.delete(x))) }
