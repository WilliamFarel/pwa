const CACHE_NAME = 'todo-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icons/android-icon-72x72.png',
  '/icons/android-icon-96x96.png',
  '/icons/apple-icon-180x180.png',
  '/icons/ms-icon-144x144.png',
  '/icons/apple-icon-152x152.png',
  '/icons/android-icon-192x192.png',
  '/icons/ms-icon-310x310.png',
  '/icons/ms-icon-70x70.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});