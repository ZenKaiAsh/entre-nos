// Cacheia somente os arquivos do aplicativo. Os MP3 do usuário NUNCA passam por aqui.
const V='entre-nos-v1';
const FILES=['./','index.html','manifest.json','css/style.css','js/romanticTexts.js','js/storage.js','js/library.js','js/player.js','js/playlists.js','js/app.js','assets/default-cover.svg','assets/icons/icon.svg','assets/icons/icon-192.png','assets/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    const copy=res.clone();caches.open(V).then(c=>c.put(r,copy));return res;
  }).catch(()=>r.mode==='navigate'?caches.match('index.html'):undefined)));
});
