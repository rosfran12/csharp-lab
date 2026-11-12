const PREFIX = 'csharp-lab-shell-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + 'v3';
const ASSETS = ['./', './index.html', './features.js', './progress-v2.js', './lab-data.js', './lab-validator.js', './lab.js', './lab.css', './manifest.webmanifest', './icon.svg', './runtime/Program.cs', './runtime/Lab.csproj', './runtime/LabRuntime.cs'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  const known = ASSETS.map(asset => new URL(asset, self.registration.scope).href);
  if (event.request.mode !== 'navigate' && !known.includes(url.href)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && known.includes(url.href)) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(async () => (await (await caches.open(CACHE)).match(event.request)) || (event.request.mode === 'navigate' ? await (await caches.open(CACHE)).match(new URL('./index.html', self.registration.scope)) : Response.error())));
});
