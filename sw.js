const V = "livro-caixa-v5";
const SHELL = ["./","./index.html","./config.js","./manifest.webmanifest",
  "./vendor/firebase-app-compat.js","./vendor/firebase-auth-compat.js","./vendor/firebase-firestore-compat.js","./vendor/xlsx.full.min.js","./vendor/pdf.min.js","./vendor/pdf.worker.min.js",
  "./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const mine = url.origin === location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mine && !fonts) return;               // Firebase e o resto vão direto para a rede
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(req, {ignoreSearch: mine});
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;                        // abre na hora pelo cache e atualiza por trás
  }));
});
