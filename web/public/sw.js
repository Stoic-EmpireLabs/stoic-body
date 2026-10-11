// Stoic Body - Legacy Cache Purge & Service Worker Destroyer
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log('[Stoic Body] Deleting legacy cache:', name);
          return caches.delete(name);
        })
      );
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then((clients) => {
      clients.forEach((client) => {
        if (client.url && 'navigate' in client) {
          client.navigate(client.url);
        }
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Always bypass cache and fetch directly from network
  event.respondWith(fetch(event.request));
});
