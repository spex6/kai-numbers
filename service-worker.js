const CACHE_NAME = "kai-numbers-v1";

const FILES_TO_CACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "tf.min.js",
  "manifest.json",
  "fonts/Baloo2-ExtraBold.ttf",
  "images/mirror.png",
  "images/mode1_tile.png",
  "images/zero.png",
  "images/icon-192.png",
  "images/icon-512.png",
  "images/icon-maskable-512.png",
  "mnist_model/model.json",
  "mnist_model/group1-shard1of1.bin"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (n) {
          if (n !== CACHE_NAME) return caches.delete(n);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});