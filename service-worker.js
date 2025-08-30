const STATIC_CACHE = 'tarot-static-v9';
const IMG_CACHE = 'tarot-img-v5';

const PRECACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './vendor/jszip.min.js',
  './manifest.webmanifest',
  './data/cards.pl.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-16.png',
  './favicon.ico'
];

const SCOPE_PATH = new URL(self.registration.scope).pathname;

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(PRECACHE)));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => ![STATIC_CACHE, IMG_CACHE].includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(e.request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(e.request, net.clone());
        return net;
      } catch {
        const cached = await caches.match(e.request);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  let rel = url.pathname;
  if (rel.startsWith(SCOPE_PATH)) rel = rel.slice(SCOPE_PATH.length);
  if (rel.startsWith('/')) rel = rel.slice(1);

  if (rel.startsWith('img/')) {
    e.respondWith(cacheFirst(e.request, IMG_CACHE)); return; 
  }  
});