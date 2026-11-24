/* Rallentatore Rel30 - service worker (revisione 1): tiene una copia della pagina per usarla senza rete. */
var CACHE = "rallentatore-rel30";
var FILES = ["./", "index.html", "strumenti.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (r) {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    });
  }));
});
