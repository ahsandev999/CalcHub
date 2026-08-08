const CACHE_NAME = 'calchub-v2.0.0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png'
];

// 1. Install Event — Pre-cache core shell & skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching PWA core shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// 2. Activate Event — Clean up old cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache version:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET or cross-origin requests (except Google Fonts / CDN)
  if (req.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('fonts.gstatic.com') && !url.origin.includes('fonts.googleapis.com')) {
    return;
  }

  // A. Navigation requests (HTML pages) -> Network-First (with offline cache fallback)
  if (req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Network offline, serving cached page');
          const cachedResponse = await caches.match(req);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // B. Static Assets (JS, CSS, Images, Fonts) -> Cache-First (with network fallback)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
