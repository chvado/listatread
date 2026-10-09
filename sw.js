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
