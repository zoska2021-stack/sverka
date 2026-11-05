// Сверка — офлайн-кэш. При обновлении файлов увеличьте VERSION.
const VERSION = "sverka-2.3";
const FILES = ["./", "index.html", "manifest.webmanifest", "jszip.min.js", "pdf.min.mjs", "pdf.worker.min.mjs",
  "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "sw.js"];
self.addEventListener("install", e => {
  // по одному файлу: если какого-то нет, остальные всё равно сохранятся
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => c.add(f).catch(err => console.warn("нет файла", f, err))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => req.mode === "navigate" ? caches.match("index.html") : Response.error()))
  );
});
