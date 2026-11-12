// PCS Prep v5.5 offline cache
const C="garcha-pcs-prep-v5_5-2026-11-04";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);if(u.origin===self.location.origin&&//(feed|alert|status|model).json$|/archive//.test(u.pathname)){e.respondWith(fetch(e.request).then(res=>{if(res&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(u.pathname,cp));}return res;}).catch(()=>caches.match(u.pathname)));return;}
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res&&res.status===200&&(e.request.url.startsWith(self.location.origin)||e.request.url.includes("fonts.g"))){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}
    return res;}).catch(()=>caches.match("./index.html"))));});
