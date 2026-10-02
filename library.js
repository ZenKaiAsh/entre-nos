/* BIBLIOTECA
   Ponto de extensao para ID3: adicione funcoes async em Library.parsers.
   Cada uma recebe (file) e devolve {title, artist, album, cover} (cover = dataURL) ou null. */
(function(){
const AUDIO=/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|weba|webm)$/i;
const probe=file=>new Promise(res=>{
  const a=new Audio(),u=URL.createObjectURL(file);let fin=false;
  const done=d=>{if(fin)return;fin=true;URL.revokeObjectURL(u);a.src='';res(isFinite(d)?d:0)};
  a.preload='metadata';a.onloadedmetadata=()=>done(a.duration);a.onerror=()=>done(0);
  setTimeout(()=>done(0),5000);a.src=u;
});
window.Library={
  songs:new Map(),showHidden:false,parsers:[],
  async load(){this.songs.clear();(await Store.all()).forEach(s=>this.songs.set(s.id,s))},
  list(){return [...this.songs.values()].sort((a,b)=>a.added-b.added)},
  shown(){return this.list().filter(s=>this.showHidden||!s.hidden)},
  favs(){return this.list().filter(s=>s.fav&&!s.hidden)},
  hiddenList(){return this.list().filter(s=>s.hidden)},
  async save(s){await Store.put(s)},
  async remove(id){await Store.del(id);this.songs.delete(id)},
  async importFiles(files,progress){
    const ok=files.filter(f=>(f.type&&f.type.indexOf('audio/')===0)||AUDIO.test(f.name));
    let n=0,i=0;
    for(const f of ok){
      i++;progress&&progress(i,ok.length);
      const id=[f.name,f.size,f.lastModified].join('|');
      if(this.songs.has(id))continue;
      const base=f.name.replace(/\.[^.]+$/,'').replace(/_/g,' ').trim();
      let title=base,artist='Artista desconhecido',album='Sem álbum',cover=null;
      const parts=base.split(' - ');
      if(parts.length>1){artist=parts[0].trim();title=parts.slice(1).join(' - ').trim()}
      const rel=f.webkitRelativePath&&f.webkitRelativePath.split('/');
      if(rel&&rel.length>1)album=rel[rel.length-2];
      for(const p of this.parsers){try{const m=await p(f);if(m){title=m.title||title;artist=m.artist||artist;album=m.album||album;cover=m.cover||cover}}catch(e){}}
      const s={id,title,artist,album,cover,dur:await probe(f),fav:false,hidden:false,added:Date.now()+i,fileName:f.name,size:f.size,blob:f};
      try{await this.save(s);this.songs.set(id,s);n++}catch(e){console.warn('Falha ao salvar',f.name,e)}
    }
    return n;
  }
};
})();
