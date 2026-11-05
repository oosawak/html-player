/* HTMLカセットプレイヤー Service Worker（オフライン用）
   ダウンロードボタンが Cache Storage (hp-v50) に全ファイルを保存し、
   ここは同一オリジンの取得を「キャッシュ優先＋無ければ通信」で捌く。 */
const CACHE = "hp-v50";
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request, { ignoreSearch: true }).then((hit) =>
        hit || fetch(e.request).then((res) => {
          if (res && res.ok) c.put(e.request, res.clone());
          return res;
        })
      )
    )
  );
});
