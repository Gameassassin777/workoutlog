const CACHE_NAME = 'tropical-fit-v150';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './db.js',
  './transition.js',
  './timer.js',
  './ai.js',
  './export.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './bg.mp4',
  './bg-day.mp4',
  './bg.jpg',
  './bg2.jpg',
  './bg-night-saver.jpg',
  './bg-day-saver.jpg',
  'https://fonts.googleapis.com/css2?family=Pacifico&display=swap'
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
    ).then(() => self.clients.claim())
  );
});

// ─── Push Notifications ────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'TropicalFit 🌴', body: 'New island update!', url: './' };
  
  if (event.data) {
    try {
      const json = event.data.json();
      data = Object.assign(data, json);
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  // Mobile Fix: Use absolute URLs for icons
  const baseUrl = self.location.origin + self.location.pathname.replace('sw.js', '');
  const iconUrl = new URL('icons/icon-192.png', baseUrl).href;

  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
    icon: iconUrl,
    badge: iconUrl,
    tag: data.tag || ('tf-' + Date.now()),
    data: { url: data.url || './' },
    vibrate: [100, 50, 100],
  });

  event.waitUntil(promiseChain);
});
  
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || './';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        const existing = list.find(c => c.url.includes(self.location.origin));
        if (existing) { existing.focus(); existing.postMessage({ type: 'NOTIF_CLICK', url }); }
        else clients.openWindow(url);
      })
    );
  });

// ─── Scheduled Rest Timer Notifications ────────────────────
let _restNotifTimer = null;

self.addEventListener('message', event => {
  const msg = event.data;
  if (!msg) return;

  if (msg.type === 'SCHEDULE_REST_NOTIF') {
    if (_restNotifTimer) { clearTimeout(_restNotifTimer); _restNotifTimer = null; }
    const delay = Math.max(0, msg.delay || 0);
    const baseUrl = self.location.origin + self.location.pathname.replace('sw.js', '');
    const iconUrl = new URL('icons/icon-192.png', baseUrl).href;
    // Captured for closure — used to cancel server alarm after SW fires
    const userId = msg.userId || '';
    const apiBase = msg.apiBase || '';
    _restNotifTimer = setTimeout(() => {
      _restNotifTimer = null;
      self.registration.showNotification('Rest Over — Get Back to Work! 💪', {
        body: msg.exercise ? `Time for your next set of ${msg.exercise}` : 'Your rest timer just finished.',
        icon: iconUrl,
        badge: iconUrl,
        tag: 'rest-timer',
        renotify: true,
        vibrate: [200, 100, 200, 100, 300],
        data: { url: './#activeWorkout' },
      });
      // SW handled it — cancel server alarm so the DO doesn't also fire a push
      if (userId && apiBase) {
        fetch(apiBase + '/api/rest-timer/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        }).catch(() => {});
      }
    }, delay);
  }

  if (msg.type === 'CANCEL_REST_NOTIF') {
    if (_restNotifTimer) { clearTimeout(_restNotifTimer); _restNotifTimer = null; }
    // Dismiss any existing rest-timer notification
    self.registration.getNotifications({ tag: 'rest-timer' }).then(notifs => {
      notifs.forEach(n => n.close());
    });
  }
});

self.addEventListener('fetch', event => {
  // Do not cache non-GET requests or backend API requests
  if (event.request.method !== 'GET' || event.request.url.includes('workers.dev')) return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';
  const isCode = /\.(html|js|css|json)(\?|$)/.test(url.pathname);

  // Network-first for HTML/JS/CSS/JSON so users always get the latest code.
  // Falls back to cache if offline.
  if (isNavigation || isCode) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'error') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

  // Cache-first for media (images, video, fonts) — these change rarely
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      return cached || fetch(event.request).then(response => {
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
