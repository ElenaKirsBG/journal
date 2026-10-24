// Офлайн-модуль «Журнала сделок».
// Приложение всегда открывается из памяти телефона — мгновенно и без интернета.
// Обновления скачиваются в фоне и применяются при следующем запуске.
// При выпуске новой версии увеличьте номер VERSION.
const VERSION = 'v10';
const CACHE = 'trade-journal-' + VERSION;
const SHELL = ['./index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
const TIMEOUT = 6000; // не ждём сеть дольше 6 секунд

// Скачать файл, только если это настоящий файл приложения (не ошибка и не страница входа в Wi‑Fi)
async function fetchGood(url) {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(new Request(url, { cache: 'no-store', signal: ctrl.signal }));
    if (!r.ok || r.redirected || r.type !== 'basic') return null;
    if (url.endsWith('index.html') || url.endsWith('/')) {
      const text = await r.clone().text();
      if (!text.includes('id="tradeForm"')) return null; // чужая страница — не сохраняем
    }
    return r;
  } catch (e) { return null; } finally { clearTimeout(timer); }
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(async u => { const r = await fetchGood(new URL(u, self.registration.scope).href); if (r) await c.put(u, r); }));
    if (!(await c.match('./index.html'))) throw new Error('index.html не скачался — попробуем при следующем запуске');
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('trade-journal-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Ответ сразу из памяти; обновление — в фоне (update)
async function fromCache(req, key) {
  const c = await caches.open(CACHE);
  const hit = await c.match(key || req, { ignoreSearch: true });
  const update = fetchGood(req.url).then(r => r ? c.put(key || req, r.clone()).then(() => r) : null);
  if (hit) return { response: hit, update };
  const fresh = await update; // первый запуск — ждём сеть
  if (fresh) return { response: fresh, update };
  return { update, response: new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font:17px -apple-system,sans-serif;padding:40px 24px;text-align:center"><h2>Нет связи</h2><p>Журнал ещё не успел сохраниться на телефоне. Откройте его один раз с интернетом.</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }) };
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  const job = fromCache(req, req.mode === 'navigate' ? './index.html' : null);
  e.respondWith(job.then(x => x.response));
  e.waitUntil(job.then(x => x.update).catch(() => {}));
});
