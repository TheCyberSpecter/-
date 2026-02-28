// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
const CACHE_NAME = 'nova-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png' // Add any CSS or JS file names here too
];

// Install the Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated for 新星の軌跡');
});

// Fetch assets from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
