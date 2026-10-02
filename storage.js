/* ARMAZENAMENTO LOCAL
   Os arquivos de audio escolhidos ficam guardados no IndexedDB do navegador, no aparelho da pessoa.
   Eles NAO sao enviados ao GitHub nem a nenhum servidor. O GitHub Pages hospeda apenas o codigo do app.
   Metadados leves (configuracoes, playlists, flags) ficam no localStorage. */
(function(){
const DB='entre-nos',S='songs';let db;
const open=()=>db?Promise.resolve(db):new Promise((res,rej)=>{
  const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>r.result.createObjectStore(S,{keyPath:'id'});
  r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>rej(r.error);
});
const tx=(mode,fn)=>open().then(d=>new Promise((res,rej)=>{
  const t=d.transaction(S,mode),q=fn(t.objectStore(S));
  t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error);
}));
window.Store={
  all:()=>tx('readonly',s=>s.getAll()),
  put:x=>tx('readwrite',s=>s.put(x)),
  del:id=>tx('readwrite',s=>s.delete(id)),
  clear:()=>tx('readwrite',s=>s.clear()),
  get(k,d){try{const v=localStorage.getItem('en:'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('en:'+k,JSON.stringify(v))}catch(e){}},
  wipe(){Object.keys(localStorage).filter(k=>k.indexOf('en:')===0).forEach(k=>localStorage.removeItem(k));return this.clear()}
};
const st=d=>`<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`;
const P={
  play:'<path d="M8 5v14l11-7z"/>',pause:'<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
  next:'<path d="M6 5l9 7-9 7zM17 5h2v14h-2z"/>',prev:'<path d="M18 5l-9 7 9 7zM5 5h2v14H5z"/>',
  dots:'<circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/>',
  heartf:'<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z"/>',
  shuffle:st('M3 6h3c5 0 7 12 12 12h3M3 18h3c1.5 0 2.8-.8 3.8-2M14 8c1-1.2 2.3-2 4-2h3M18 3l3 3-3 3M18 15l3 3-3 3'),
  repeat:st('M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3'),
  repeat1:st('M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3M11 10l1-1v6'),
  heart:st('M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z'),
  home:st('M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10'),
  music:st('M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z'),
  mail:st('M3 5h18v14H3zM3 6l9 7 9-7'),
  gear:st('M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2'),
  plus:st('M12 5v14M5 12h14'),
  vol:st('M3 9v6h4l5 4V5L7 9zM16 8a5 5 0 010 8M19 5a9 9 0 010 14'),
  mute:st('M3 9v6h4l5 4V5L7 9zM16 9l5 6M21 9l-5 6'),
  list:st('M4 6h13M4 12h13M4 18h8M19 14v6l4-3z'),
  close:st('M6 6l12 12M18 6L6 18'),back:st('M15 5l-7 7 7 7'),
  lock:st('M6 11h12v9H6zM8 11V8a4 4 0 018 0v3'),key:st('M14 10a4 4 0 11-1.2-2.8L21 15v3h-3v-2h-2v-2h-2z'),
  moon:st('M20 14A8 8 0 0110 4a8 8 0 1010 10z'),
  sun:st('M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5'),
  calendar:st('M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'),
  thought:st('M21 12a8 8 0 01-11.5 7.2L3 21l1.8-5.5A8 8 0 1121 12z'),
  folder:st('M3 6h6l2 2h10v11H3z')
};
window.ic=(n,s=24)=>`<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true">${P[n]||P.heart}</svg>`;
})();
