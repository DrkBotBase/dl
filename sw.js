const CACHE_NAME = 'mejv-pwa-v7'; 
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './192.png',
  './512.png',
  './logo.png',
  './legal/index.html',
  './descargas-facebook/index.html',
  './descargas-instagram/index.html',
  './descargas-pinterest/index.html'
  './descargas-spotify/index.html'
  './descargas-tiktok/index.html',
  './descargas-youtube/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('mejv-pwa-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const requestUrl = new URL(event.request.url);
      const isSameOrigin = requestUrl.origin === self.location.origin;

      try {
        const networkResponse = await fetch(
          event.request,
          isSameOrigin ? { cache: 'no-store' } : undefined
        );

        if (isSameOrigin && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
          );
        }

        return networkResponse;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('./index.html');
          if (offlinePage) return offlinePage;
        }

        throw error;
      }
    })()
  );
});
