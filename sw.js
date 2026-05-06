const CACHE_NAME = 'tropical-fit-v106';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './shader.js',
  './palm.js',
  './transition.js',
  './timer.js',
  './ai.js',
  './export.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './bg.mp4',
  './bg-day.mp4',
  './bg.jpg',
  './bg2.jpg',
  './bg-night-saver.jpg',
  './bg-day-saver.jpg'
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
  console.log('[SW] Push Received', event);
  let data = { title: 'TropicalFit', body: 'Beach update!', url: '/workoutlog/' };
  
  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch (e) {
      // Fallback to text if not JSON
      data.body = event.data.text();
    }
  }

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
  // Do not cache non-GET requests or backend API requests
  if (event.request.method !== 'GET' || event.request.url.includes('workers.dev')) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Only cache valid HTTP responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
