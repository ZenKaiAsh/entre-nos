/* PLAYER (HTML5 Audio). Os arquivos tocam por URL.createObjectURL(blob), criada apenas no aparelho. */
(function(){
const a=new Audio();a.preload='metadata';
const P=window.Player={
  audio:a,queue:[],idx:-1,cur:null,shuffle:false,repeat:'off',autoplay:true,url:null,ls:{state:[],tick:[]},
  on(t,f){this.ls[t].push(f)},emit(t){this.ls[t].forEach(f=>f())},
  async play(id,queue){
    if(queue)this.queue=queue.slice();
    await this.load(id,true);
  },
  async load(id,go){
    const s=Library.songs.get(id);if(!s)return;
    this.cur=s;if(this.queue.indexOf(id)<0)this.queue.push(id);this.idx=this.queue.indexOf(id);
    if(this.url)URL.revokeObjectURL(this.url);
    this.url=URL.createObjectURL(s.blob);a.src=this.url;
    Store.set('last',id);this.emit('state');this.emit('tick');
    if('mediaSession' in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:s.title,artist:s.artist,album:s.album});
      navigator.mediaSession.setActionHandler('play',()=>this.toggle());navigator.mediaSession.setActionHandler('pause',()=>this.toggle());
      navigator.mediaSession.setActionHandler('nexttrack',()=>this.next());navigator.mediaSession.setActionHandler('previoustrack',()=>this.prev())}catch(e){}}
    if(go){try{await a.play()}catch(e){this.onerror&&this.onerror(e)}}
  },
  toggle(){if(!this.cur)return false;if(a.paused){a.play().catch(e=>this.onerror&&this.onerror(e))}else a.pause();return true},
  next(auto){
    const n=this.queue.length;if(!n)return;
    if(auto&&this.repeat==='one'){a.currentTime=0;a.play();return}
    if(auto&&!this.autoplay){a.pause();return}
    let i;
    if(this.shuffle&&n>1){do{i=Math.floor(Math.random()*n)}while(i===this.idx)}
    else{i=this.idx+1;if(i>=n){if(this.repeat==='all'||!auto)i=0;else{a.pause();a.currentTime=0;this.emit('state');return}}}
    this.load(this.queue[i],true);
  },
  prev(){
    if(!this.queue.length)return;
    if(a.currentTime>3){a.currentTime=0;return}
    this.load(this.queue[(this.idx-1+this.queue.length)%this.queue.length],true);
  },
  seekPct(p){if(isFinite(a.duration))a.currentTime=p*a.duration},
  setShuffle(v){this.shuffle=v;this.emit('state')},
  cycleRepeat(){this.repeat={off:'all',all:'one',one:'off'}[this.repeat];this.emit('state');return this.repeat},
  mute(){a.muted=!a.muted;this.emit('state')}
};
['play','pause','loadedmetadata','volumechange'].forEach(e=>a.addEventListener(e,()=>{P.emit('state');P.emit('tick')}));
a.addEventListener('timeupdate',()=>P.emit('tick'));
a.addEventListener('ended',()=>P.next(true));
a.addEventListener('error',()=>{if(a.getAttribute('src'))P.onerror&&P.onerror(a.error)});
})();
