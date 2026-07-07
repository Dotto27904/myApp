// キャッシュ名（好きな名前でOK）
const CACHE_NAME = "library-app-cache-v1";

// オフラインで使うファイル一覧
const urlsToCache = [
  "index.html",
  "css/style.css",
  "js/app.js",
  "images/map_1F.png",
  "images/map_2F.png",
  "images/icon.png"
];

// インストール時にキャッシュする
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// オフライン時はキャッシュから読み込む
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
