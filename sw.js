/* Service worker: cache the app shell so it works fully offline.
   Bump CACHE when you change any cached file to force an update. */
const CACHE = "foundation-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./routine.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// focus (or open) the app when a notification is tapped
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Only handle same-origin requests; let YouTube etc. hit the network.
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // refresh in the background
        fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        }).catch(() => {});
        return cached;
      }
      return fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
