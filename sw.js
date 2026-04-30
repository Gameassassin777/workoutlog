const CACHE_NAME = 'tropical-fit-v70';
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
  '/workoutlog/bg-day.mp4',
  '/workoutlog/bg.jpg',
  '/workoutlog/bg2.jpg',
  '/workoutlog/bg-night-saver.jpg',
  '/workoutlog/bg-day-saver.jpg'
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

// ─── Push Notifications ────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'TropicalFit', body: 'Something happened on the island 🏖️', url: '/workoutlog/' };
  try { data = { ...data, ...event.data.json() }; } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/workoutlog/icons/icon-192.png',
      badge: '/workoutlog/icons/icon-192.png',
      tag: data.tag || 'tropicalfit',
      data: { url: data.url },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/workoutlog/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('/workoutlog'));
      if (existing) { existing.focus(); existing.postMessage({ type: 'NOTIF_CLICK', url }); }
      else clients.openWindow(url);
    })
  );
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
