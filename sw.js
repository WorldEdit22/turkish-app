// Offline support: serve from the cache instantly, refresh the cache in the
// background so the next launch picks up any new version.

const CACHE = 'turkish-v8';
const ASSETS = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/store.js',
  'js/ai.js',
  'js/grammar.js',
  'js/combine.js',
  'js/examples.js',
  'js/html.js',
  'js/photo.js',
  'js/scanview.js',
  'js/swipe.js',
  'js/translate.js',
  'js/translateview.js',
  'js/update.js',
  'data/words.js',
  'data/patterns.js',
  'data/ranks.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

// cache: 'reload' skips the browser's HTTP cache, so a new version is never
// stored next to files left over from the old one.
self.addEventListener('install', (e) => {
  const fresh = ASSETS.map((url) => new Request(url, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // AI calls go straight out
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});
