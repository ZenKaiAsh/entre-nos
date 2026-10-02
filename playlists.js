/* PLAYLISTS (salvas no localStorage; guardam apenas os ids das musicas) */
window.Playlists={
  all(){return Store.get('playlists',[])},
  save(l){Store.set('playlists',l)},
  get(id){return this.all().find(p=>p.id===id)},
  create(name,cover){const l=this.all();const p={id:'p'+Date.now().toString(36),name:(name||'').trim()||'Minha playlist',cover:cover||null,songs:[]};l.push(p);this.save(l);return p},
  remove(id){this.save(this.all().filter(p=>p.id!==id))},
  add(id,ids){const l=this.all(),p=l.find(x=>x.id===id);if(!p)return;ids.forEach(s=>{if(p.songs.indexOf(s)<0)p.songs.push(s)});this.save(l)},
  removeSong(id,sid){const l=this.all(),p=l.find(x=>x.id===id);if(!p)return;p.songs=p.songs.filter(s=>s!==sid);this.save(l)},
  ids(p){return p.songs.filter(s=>Library.songs.has(s)&&(Library.showHidden||!Library.songs.get(s).hidden))},
  readCover(file){return new Promise(res=>{
    const r=new FileReader();
    r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,400/Math.max(im.width,im.height));
      c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};
      im.onerror=()=>res(null);im.src=r.result};
    r.onerror=()=>res(null);r.readAsDataURL(file);
  })}
};
