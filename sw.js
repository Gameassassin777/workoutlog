const CACHE_NAME = 'tropical-fit-v23';
const ASSETS = [
  '/workoutlog/',
  '/workoutlog/index.html',
  '/workoutlog/style.css',
  '/workoutlog/app.js',
  '/workoutlog/db.js',
  '/workoutlog/shader.js',
  '/workoutlog/palm.js',
  '/workoutlog/transition.js',
  '/workoutlog/timer.js',
  '/workoutlog/ai.js',
  '/workoutlog/export.js',
  '/workoutlog/manifest.json',
  '/workoutlog/icons/icon-192.png',
  '/workoutlog/icons/icon-512.png',
  '/workoutlog/bg.mp4',
  '/workoutlog/bg-day.mp4'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
