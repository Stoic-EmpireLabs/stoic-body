// Stoic Sovereign OS — Offline Progressive Web App (PWA) Service Worker
// Enables 100% offline access, instant cache loads, and background resilience.

const CACHE_NAME = "stoic-sovereign-v2.0";
const OFFLINE_URLS = [
  "/",
  "/manifest.json",
  "/icon.png",
  "/icon-512.png",
  "/calendar",
  "/goals",
  "/training",
  "/nutrition",
  "/progress",
  "/learning",
  "/settings",
];

// Install Event: Pre-cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline app shell");
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.warn("[Service Worker] Non-blocking asset cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Purging legacy cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate with Offline Fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Bypass non-origin or API calls if preferred
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and no cache match, return cached root or offline fallback
          return cachedResponse || caches.match("/");
        });

      return cachedResponse || fetchPromise;
    })
  );
});
