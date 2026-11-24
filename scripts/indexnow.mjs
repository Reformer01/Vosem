// Notify Bing/Yandex about the canonical public URLs after a deploy.
// Uses the same URL list as sitemap.ts so the two never drift apart.
const KEY = "e4e3d82b-cf3d-4c1f-b3fa-28d491dd80ff";
const HOST = "vosem.vercel.app";
const paths = ["/", "/about", "/voice-of-salvation", "/events", "/giving", "/contact"];

const res = await fetch("https://www.bing.com/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: paths.map((path) => `https://${HOST}${path}`),
  }),
});

console.log(`IndexNow: ${res.status} ${res.statusText}`);
if (!res.ok) process.exitCode = 1;
