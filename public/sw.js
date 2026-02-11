// 卸载旧 Service Worker — 此文件仅用于清除浏览器中残留的旧 SW
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => {
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => client.navigate(client.url))
  })
  return self.registration.unregister()
})
