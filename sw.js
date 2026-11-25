const CACHE='memorama-v17';
const ARCHIVOS=['./','./index.html','./manifest.json','./icon.svg'];
const FUENTES=['fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>
      Promise.all(ARCHIVOS.map(a=>c.add(a).catch(()=>{})))
    )
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const guardable=u.origin===location.origin||FUENTES.includes(u.hostname);
  e.respondWith(
    fetch(e.request).then(r=>{
      if(guardable&&r&&(r.ok||r.type==='opaque')){
        const copia=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copia)).catch(()=>{});
      }
      return r;
    }).catch(()=>
      caches.match(e.request).then(r=>r||caches.match('./index.html'))
    )
  );
});