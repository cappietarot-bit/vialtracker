/* The Lab service worker.

   Two jobs. It caches the app so it opens with no signal — the whole thing is
   one 5 MB file, so once it is cached there is nothing else to fetch. And it
   exists so the page can own a badge and notifications at all, which a page
   without a registered worker cannot.

   Cache strategy is network-first for the document with a cache fallback, so a
   new deploy is picked up on the next online load rather than being pinned to
   whatever was cached first. Everything else is cache-first. */

const CACHE = "thelab-v5";
const SHELL = ["./", "./index.html", "./manifest.json",
               "./icon-192.png", "./icon-512.png", "./favicon.png"];
// The exercise photos are a separate file now, so the first load is 0.8 MB
// instead of 3.8 MB. Cached like the rest of the shell, but fetched after the
// page is already usable rather than before it can paint.
const LAZY = ["./photos.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(SHELL).then(() => c.addAll(LAZY).catch(() => {}))
  ).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  const isDoc = req.mode === "navigate" ||
                (req.headers.get("accept") || "").includes("text/html");

  if (isDoc) {
    // network first: a new build should win as soon as there is a connection
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      // only real responses: a stored 404 outlives the reason for it
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }))
  );
});

/* the page asks for a notification rather than a server pushing one, because
   there is no server — see the honest limits noted in the app */
self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type !== "notify") return;
  self.registration.showNotification(d.title || "The Lab", {
    body: d.body || "",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: d.tag || "vialback-due",
    renotify: false,
    silent: !!d.silent,
    data: { url: "./" }
  });
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if ("focus" in c) return c.focus();
    if (clients.openWindow) return clients.openWindow("./");
  }));
});
