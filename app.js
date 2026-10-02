/* APP: navegacao, telas, player expandido, menus, configuracoes. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>{if(!isFinite(t))return'0:00';t=Math.floor(t);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const PRIV='Suas músicas permanecem no seu dispositivo. O Entre Nós não envia seus arquivos MP3 para nenhum servidor.';
const COVER='data:image/svg+xml;utf8,'+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#3a0a12'/><stop offset='1' stop-color='#0a0506'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><circle cx='200' cy='200' r='120' fill='none' stroke='#d7263d' stroke-width='2' opacity='.6'/><circle cx='200' cy='200' r='80' fill='none' stroke='#d7263d' stroke-width='2' opacity='.35'/><text x='200' y='222' text-anchor='middle' font-family='Georgia,serif' font-size='64' fill='#f4f0f0' letter-spacing='6'>EN</text></svg>");
let cfg=Object.assign({theme:'noite',volume:.8,autoplay:true,shuffle:false,repeat:'off',showHidden:false},Store.get('settings',{}));
const saveCfg=()=>Store.set('settings',cfg);
const S={view:'home',arg:null,tab:'songs',pending:null,seeking:false};
const ctx={ids:[]};
const PARENT={playlist:'library',hidden:'settings'};
const NAV=[['home','Início','home'],['library','Biblioteca','music'],['letters','Para você','mail'],['favs','Favoritas','heart'],['settings','Configurações','gear']];

/* ---------- utilidades de UI ---------- */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2800)}
function modal(html,cls){const o=$('#overlay');o.innerHTML=`<div class="sheet ${cls||''}" role="dialog" aria-modal="true">${html}</div>`;o.classList.add('open');const f=$('button,input',o);f&&f.focus&&f.focus()}
function closeModal(){const o=$('#overlay');o.classList.remove('open');o.innerHTML=''}
const cover=s=>(s&&s.cover)||COVER;
const closeBtn='<button class="ib" data-act="close" aria-label="Fechar">'+ic('close')+'</button>';

/* ---------- player (marcacao compartilhada entre inicio e expandido) ---------- */
function pl(){return `<div class="pl"><button class="cover-btn" data-act="expand" aria-label="Abrir player completo"><img class="cv" alt="Capa da música" src="${COVER}"></button>
<div class="meta"><h2 class="t"></h2><p class="ar"></p><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></div>
<div><input class="seek" type="range" min="0" max="1000" value="0" aria-label="Progresso da música"><div class="times"><span class="tc">0:00</span><span class="td">0:00</span></div></div>
<div class="ctrls"><button class="ib" data-act="shuffle" aria-label="Aleatório">${ic('shuffle')}</button><button class="ib" data-act="prev" aria-label="Música anterior">${ic('prev',28)}</button><button class="ib big" data-act="toggle" aria-label="Tocar"></button><button class="ib" data-act="next" aria-label="Próxima música">${ic('next',28)}</button><button class="ib" data-act="repeat" aria-label="Repetir"></button></div>
<div class="row2"><button class="ib" data-act="fav" aria-label="Favoritar"></button><div class="volbox"><button class="ib" data-act="mute" aria-label="Silenciar"></button><input class="vol" type="range" min="0" max="100" aria-label="Volume"></div></div></div>`}
function queueHTML(){ctx.ids=Player.queue.filter(i=>Library.songs.has(i));
  return ctx.ids.map(i=>row(Library.songs.get(i))).join('')||'<p class="sub">A fila está vazia.</p>'}
function openFull(){modal(`<div class="fh">${closeBtn}<span class="sub">Tocando agora</span><span style="width:48px"></span></div>${pl()}<h3 class="qh">Fila de reprodução</h3><div class="qlist">${queueHTML()}</div>`,'full');update()}

function update(){
  const c=Player.cur,a=Player.audio,playing=!a.paused&&!!c;
  const m=$('#mini');const show=!!c&&S.view!=='home'&&!$('#overlay.open .full');
  if(show){const had=!m.hidden;m.hidden=false;
    m.innerHTML=`<img alt="" src="${cover(c)}"><div class="rt"><b>${esc(c.title)}</b><span>${esc(c.artist)}</span></div><button class="ib" data-act="toggle" aria-label="Tocar"></button><i class="bar"></i>`;
    m.setAttribute('role','button');m.setAttribute('aria-label','Abrir player completo');if(had)m.style.animation='none'}
  else m.hidden=true;
  $$('.t').forEach(e=>e.textContent=c?c.title:'Nenhuma música');
  $$('.ar').forEach(e=>e.textContent=c?c.artist+(c.album&&c.album!=='Sem álbum'?' · '+c.album:''):'Adicione músicas para começar');
  $$('.cv').forEach(i=>i.src=cover(c));
  $$('.pl').forEach(p=>p.classList.toggle('playing',playing));$$('.cover-btn').forEach(p=>p.classList.toggle('playing',playing));
  $$('[data-act=toggle]').forEach(b=>{b.innerHTML=ic(playing?'pause':'play',b.classList.contains('big')?34:26);b.setAttribute('aria-label',playing?'Pausar':'Tocar')});
  $$('[data-act=fav]').forEach(b=>{const on=!!(c&&c.fav);b.classList.toggle('on',on);b.innerHTML=ic(on?'heartf':'heart');b.setAttribute('aria-pressed',on)});
  $$('[data-act=shuffle]').forEach(b=>{b.classList.toggle('on',Player.shuffle);b.setAttribute('aria-pressed',Player.shuffle)});
  $$('[data-act=repeat]').forEach(b=>{b.classList.toggle('on',Player.repeat!=='off');b.innerHTML=ic(Player.repeat==='one'?'repeat1':'repeat');b.setAttribute('aria-label','Repetir: '+{off:'desligado',all:'tudo',one:'uma música'}[Player.repeat])});
  $$('[data-act=mute]').forEach(b=>b.innerHTML=ic(a.muted||a.volume===0?'mute':'vol'));
  $$('.vol').forEach(v=>{v.value=Math.round(a.volume*100);rng(v)});
  $$('.row').forEach(r=>{const b=$('b',r);b&&b.classList.toggle('on',!!c&&r.dataset.id===c.id)});
  const q=$('.qlist');if(q)q.innerHTML=queueHTML();
  tick();
}
function rng(el){el.style.setProperty('--p',(el.max?el.value/el.max*100:0)+'%')}
function tick(){
  const a=Player.audio,d=isFinite(a.duration)?a.duration:(Player.cur?Player.cur.dur:0),p=d?a.currentTime/d:0;
  $$('.seek').forEach(s=>{if(!S.seeking){s.value=Math.round(p*1000)}rng(s)});
  $$('.tc').forEach(e=>e.textContent=fmt(a.currentTime));$$('.td').forEach(e=>e.textContent=fmt(d));
  const b=$('#mini .bar');if(b)b.style.width=(p*100)+'%';
}

/* ---------- listas ---------- */
function row(s,extra){return `<div class="row" role="button" tabindex="0" data-act="playrow" data-id="${esc(s.id)}"><img alt="" src="${cover(s)}"><div class="rt"><b>${esc(s.title)}</b><span>${esc(s.artist)} · ${esc(s.album)}</span></div><span class="dur">${fmt(s.dur)}</span>${extra||''}<button class="ib" data-act="menu" data-id="${esc(s.id)}" aria-label="Mais opções de ${esc(s.title)}">${ic('dots')}</button></div>`}
function list(songs){ctx.ids=songs.map(s=>s.id);return songs.map(s=>row(s)).join('')}
const empty=(icon,t,p,btn)=>`<div class="empty">${ic(icon,40)}<h3>${t}</h3><p>${p}</p>${btn||''}</div>`;
const addBtn='<button class="btn" data-act="add">'+'Adicionar músicas</button>';
const head=(t,back)=>`<header class="vh">${back?`<button class="ib" data-act="back" aria-label="Voltar">${ic('back')}</button>`:''}<h1>${t}</h1></header>`;
const brDate=d=>d.split('-').reverse().join('/');
const unlocked=t=>!t.unlockDate||new Date()>=new Date(t.unlockDate+'T00:00:00'); /* data local do aparelho */

const VIEWS={
home(){return `<div class="wrap"><header class="brand">${ic('heartf',16)}<h1>ENTRE NÓS</h1>${ic('heartf',16)}</header>${pl()}${Library.list().length?'':'<div style="text-align:center;margin-top:24px">'+addBtn+'</div>'}<p class="priv">${PRIV}</p></div>`},
library(){
  const songs=Library.shown();
  let body;
  if(S.tab==='songs'){
    body=`<div class="actions"><button class="btn" data-act="add">${ic('plus',20)} Adicionar músicas</button>${'webkitdirectory' in $('#folder')?`<button class="btn ghost" data-act="addfolder">${ic('folder',20)} Adicionar pasta</button>`:''}${songs.length?`<button class="btn ghost" data-act="playall">${ic('play',20)} Tocar tudo</button>`:''}</div>`+
      (songs.length?list(songs):empty('music','Sua biblioteca está vazia','Selecione arquivos de áudio do seu aparelho. Se o navegador limpar os dados do site, basta selecioná-los de novo.',''))+`<p class="priv">${PRIV}</p>`;
  }else{
    const pls=Playlists.all();
    body=`<div class="actions"><button class="btn" data-act="pl-new">${ic('plus',20)} Nova playlist</button></div>`+(pls.length?`<div class="grid">${pls.map(p=>`<button class="pcard" data-act="open-pl" data-id="${p.id}"><img alt="" src="${p.cover||COVER}"><b>${esc(p.name)}</b><span>${Playlists.ids(p).length} músicas</span></button>`).join('')}</div>`:empty('list','Nenhuma playlist ainda','Crie uma para reunir as músicas de vocês, como "Nossas músicas" ou "Noite".',''));
  }
  return `<div class="wrap">${head('Biblioteca')}<div class="seg" role="tablist"><button class="${S.tab==='songs'?'on':''}" data-act="tab" data-v="songs" role="tab">Músicas</button><button class="${S.tab==='pls'?'on':''}" data-act="tab" data-v="pls" role="tab">Playlists</button></div>${body}</div>`},
playlist(){
  const p=Playlists.get(S.arg);if(!p)return VIEWS.library();
  const songs=Playlists.ids(p).map(i=>Library.songs.get(i));
  return `<div class="wrap">${head(esc(p.name),true)}<div class="actions"><button class="btn" data-act="play-pl" data-id="${p.id}">${ic('play',20)} Reproduzir</button><button class="btn ghost" data-act="pl-songs" data-id="${p.id}">${ic('plus',20)} Adicionar músicas</button><button class="btn danger" data-act="pl-del" data-id="${p.id}">Excluir playlist</button></div>${songs.length?list(songs):empty('list','Playlist vazia','Adicione músicas da sua biblioteca.','')}</div>`},
letters(){return `<div class="wrap">${head('Para você')}<p class="sub" style="margin:-8px 0 18px">Palavras escritas só para você.</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${romanticTexts.map(t=>{const ok=unlocked(t);
  return `<button class="lcard ${ok?'':'locked'}" data-act="letter" data-id="${esc(t.id)}">${ic(ok?t.icon:'lock',28)}<b>${esc(t.title)}</b><span>${ok?(t.unlockDate?'Abrir mensagem':'Ler'):'Abre em '+brDate(t.unlockDate)}</span></button>`}).join('')}</div></div>`},
favs(){const f=Library.favs();return `<div class="wrap">${head('Favoritas')}${f.length?`<div class="actions"><button class="btn" data-act="playall-fav">${ic('play',20)} Tocar favoritas</button></div>`+list(f):empty('heart','Nenhuma favorita ainda','Toque no coração durante uma música para guardá-la aqui.','')}</div>`},
hidden(){const h=Library.hiddenList();return `<div class="wrap">${head('Músicas ocultas',true)}<p class="sub" style="margin-bottom:14px">Os arquivos originais continuam no seu aparelho. Ocultar apenas tira a música da biblioteca.</p>${h.length?h.map(s=>row(s,`<button class="btn ghost" style="min-height:40px;padding:0 12px;font-size:14px" data-act="m-hide" data-id="${esc(s.id)}">Mostrar novamente</button>`)).join(''):empty('music','Nada oculto','As músicas que você ocultar aparecem aqui.','')}</div>`},
settings(){const sw=(k,l)=>`<label>${l}<input class="sw" type="checkbox" role="switch" data-set="${k}" ${cfg[k]?'checked':''}></label>`;
  return `<div class="wrap">${head('Configurações')}<div class="cfg"><label>Tema<select data-set="theme"><option value="noite" ${cfg.theme==='noite'?'selected':''}>Noite</option><option value="rubi" ${cfg.theme==='rubi'?'selected':''}>Rubi</option></select></label><label>Volume<input class="vol" type="range" min="0" max="100" data-set="volume" aria-label="Volume"></label>${sw('autoplay','Reprodução automática')}${sw('shuffle','Aleatório')}${sw('showHidden','Mostrar músicas ocultas')}</div>
<div class="cfg"><button data-act="go-hidden">Músicas ocultas ${ic('back',18).replace('class="ic"','class="ic" style="transform:scaleX(-1)"')}</button><button data-act="reload">Recarregar biblioteca</button><button data-act="clear" style="color:#ff8d99">Limpar dados do aplicativo</button><button data-act="about">Sobre</button></div><p class="priv">${PRIV}</p></div>`}
};

/* ---------- navegacao ---------- */
function go(v,arg){S.view=v;S.arg=arg;render()}
function render(keep){
  const m=$('#main'),y=m.scrollTop;
  m.innerHTML=VIEWS[S.view]();
  if(!keep){m.classList.remove('in');void m.offsetWidth;m.classList.add('in');m.scrollTop=0}else m.scrollTop=y;
  const cur=PARENT[S.view]||S.view;
  $$('#nav button').forEach(b=>{const on=b.dataset.view===cur;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false')});
  update();
}

/* ---------- menus e modais ---------- */
function openMenu(id){
  const s=Library.songs.get(id);if(!s)return;
  modal(`<div class="sh"><h3>${esc(s.title)}</h3><p>${esc(s.artist)}</p></div><div class="menu">
<button data-act="m-play" data-id="${esc(id)}">Reproduzir</button><button data-act="m-pl" data-id="${esc(id)}">Adicionar à playlist</button>
<button data-act="m-fav" data-id="${esc(id)}">${s.fav?'Remover dos favoritos':'Favoritar'}</button>
${S.view==='playlist'?`<button data-act="m-rempl" data-id="${esc(id)}">Remover desta playlist</button>`:''}
<button data-act="m-hide" data-id="${esc(id)}">${s.hidden?'Mostrar novamente':'Ocultar música'}</button><button data-act="m-info" data-id="${esc(id)}">Informações</button>
<button class="dg" data-act="m-del" data-id="${esc(id)}">Remover do aplicativo</button></div>`);
}
function plForm(){modal(`<div class="fh"><h3>Nova playlist</h3>${closeBtn}</div><div class="field"><label for="pn">Nome</label><input id="pn" type="text" maxlength="40" placeholder="Nossas músicas"><div class="chips"><button data-act="chip" data-name="Nossas músicas">Nossas músicas</button><button data-act="chip" data-name="Noite">Noite</button><button data-act="chip" data-name="Para você">Para você</button></div></div><div class="field"><label for="pc">Capa (opcional)</label><input id="pc" type="file" accept="image/*"></div><button class="btn" data-act="pl-create" style="width:100%">Criar playlist</button>`)}
function openLetter(id){
  const t=romanticTexts.find(x=>x.id===id);if(!t)return;
  if(!unlocked(t)){modal(`<div class="letter big-ic">${ic('lock',44)}</div><h3 style="text-align:center;margin:12px 0 6px">Essa mensagem ainda está fechada.</h3><p class="sub" style="text-align:center;margin-bottom:18px">Ela abre em ${brDate(t.unlockDate)}.</p><button class="btn ghost" data-act="close" style="width:100%">Fechar</button>`,'letter');return}
  modal(`<div class="letter big-ic">${ic(t.icon,40)}</div><h3>${esc(t.title)}</h3>${t.text.split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('')}<p class="sign">Para você</p><button class="btn ghost" data-act="close" style="width:100%">Fechar</button>`,'letter');
}
function confirmBox(msg,act){modal(`<h3>Tem certeza?</h3><p class="sub" style="margin:8px 0 20px">${msg}</p><div class="actions"><button class="btn danger" data-act="${act}">Sim, continuar</button><button class="btn ghost" data-act="close">Cancelar</button></div>`)}

/* ---------- importacao ---------- */
async function pick(files){
  files=[...files];if(!files.length)return;
  const n=await Library.importFiles(files,(i,t)=>toast(`Importando ${i} de ${t}`)).catch(e=>{console.error(e);toast('Não foi possível salvar os arquivos. Verifique o espaço do aparelho.');return 0});
  toast(n?`${n} música(s) adicionada(s)`:'Nenhum arquivo de áudio novo foi encontrado');
  if(n&&!Player.cur){Player.queue=Library.shown().map(s=>s.id);Player.load(Player.queue[0],false)}
  render(true);
}
$('#file').addEventListener('change',e=>{pick(e.target.files);e.target.value=''});
$('#folder').addEventListener('change',e=>{pick(e.target.files);e.target.value=''});

/* ---------- acoes ---------- */
async function toggleFav(id){const s=Library.songs.get(id);if(!s)return;s.fav=!s.fav;await Library.save(s);toast(s.fav?'Adicionada às favoritas':'Removida das favoritas');S.view==='favs'?render(true):update()}
const ACT={
  close:closeModal,
  expand(){if(Player.cur||Library.list().length)openFull();else toast('Adicione músicas para abrir o player')},
  toggle(){if(!Player.toggle()){Library.list().length?toast('Escolha uma música na biblioteca'):$('#file').click()}},
  next(){Player.next()},prev(){Player.prev()},
  shuffle(){Player.setShuffle(!Player.shuffle);cfg.shuffle=Player.shuffle;saveCfg()},
  repeat(){cfg.repeat=Player.cycleRepeat();saveCfg()},
  mute(){Player.mute()},
  fav(){if(Player.cur)toggleFav(Player.cur.id)},
  add(){$('#file').click()},addfolder(){$('#folder').click()},
  back(){go(PARENT[S.view]||'home')},
  tab(t){S.tab=t.dataset.v;render(true)},
  playrow(t){Player.play(t.dataset.id,ctx.ids)},
  playall(){const ids=Library.shown().map(s=>s.id);if(ids.length)Player.play(Player.shuffle?ids[Math.floor(Math.random()*ids.length)]:ids[0],ids)},
  'playall-fav'(){const ids=Library.favs().map(s=>s.id);if(ids.length)Player.play(ids[0],ids)},
  menu(t){openMenu(t.dataset.id)},
  'm-play'(t){closeModal();Player.play(t.dataset.id,ctx.ids.length?ctx.ids:null)},
  'm-fav'(t){closeModal();toggleFav(t.dataset.id)},
  async 'm-hide'(t){const s=Library.songs.get(t.dataset.id);s.hidden=!s.hidden;await Library.save(s);closeModal();toast(s.hidden?'Música ocultada. O arquivo continua no seu aparelho.':'Música visível novamente');
    if(s.hidden&&Player.cur&&Player.cur.id===s.id&&!Library.showHidden){Player.audio.pause()}render(true)},
  'm-info'(t){const s=Library.songs.get(t.dataset.id);modal(`<div class="fh"><h3>Informações</h3>${closeBtn}</div><div class="menu">${[['Nome',s.title],['Artista',s.artist],['Álbum',s.album],['Duração',fmt(s.dur)],['Arquivo',s.fileName],['Tamanho',(s.size/1048576).toFixed(1)+' MB']].map(r=>`<div class="chk" style="justify-content:space-between"><span class="sub">${r[0]}</span><span style="text-align:right;word-break:break-all">${esc(r[1])}</span></div>`).join('')}</div>`)},
  async 'm-del'(t){const id=t.dataset.id;closeModal();if(Player.cur&&Player.cur.id===id){Player.audio.pause()}await Library.remove(id);Player.queue=Player.queue.filter(x=>x!==id);toast('Removida do aplicativo. O arquivo original não foi apagado.');render(true)},
  'm-rempl'(t){Playlists.removeSong(S.arg,t.dataset.id);closeModal();render(true)},
  'm-pl'(t){S.pending=t.dataset.id;const pls=Playlists.all();
    modal(`<div class="fh"><h3>Adicionar à playlist</h3>${closeBtn}</div><div class="menu">${pls.map(p=>`<button data-act="pl-add" data-pid="${p.id}">${esc(p.name)}</button>`).join('')}<button data-act="pl-new" style="color:var(--red2)">Criar nova playlist</button></div>`)},
  'pl-add'(t){Playlists.add(t.dataset.pid,[S.pending]);closeModal();toast('Adicionada à playlist');if(S.view==='playlist')render(true)},
  'pl-new'(){plForm()},
  chip(t){$('#pn').value=t.dataset.name},
  async 'pl-create'(){const f=$('#pc').files[0],c=f?await Playlists.readCover(f):null,p=Playlists.create($('#pn').value,c);
    if(S.pending){Playlists.add(p.id,[S.pending]);S.pending=null;toast('Playlist criada e música adicionada')}else toast('Playlist criada');closeModal();S.tab='pls';render(true)},
  'open-pl'(t){go('playlist',t.dataset.id)},
  'play-pl'(t){const ids=Playlists.ids(Playlists.get(t.dataset.id));ids.length?Player.play(ids[0],ids):toast('Esta playlist está vazia')},
  'pl-del'(t){confirmBox('A playlist será excluída. As músicas continuam na biblioteca.','pl-del-ok');S.arg=t.dataset.id},
  'pl-del-ok'(){Playlists.remove(S.arg);closeModal();go('library')},
  'pl-songs'(t){const p=Playlists.get(t.dataset.id),av=Library.shown().filter(s=>p.songs.indexOf(s.id)<0);
    if(!av.length){toast('Todas as músicas já estão nesta playlist');return}
    modal(`<div class="fh"><h3>Escolha as músicas</h3>${closeBtn}</div>${av.map(s=>`<label class="chk"><input type="checkbox" value="${esc(s.id)}"><span>${esc(s.title)}<br><span class="sub">${esc(s.artist)}</span></span></label>`).join('')}<button class="btn" style="width:100%;margin-top:14px" data-act="pl-songs-ok" data-id="${p.id}">Adicionar selecionadas</button>`)},
  'pl-songs-ok'(t){const ids=$$('#overlay input:checked').map(i=>i.value);Playlists.add(t.dataset.id,ids);closeModal();render(true)},
  letter(t){openLetter(t.dataset.id)},
  'go-hidden'(){go('hidden')},
  async reload(){await Library.load();toast(Library.list().length?`${Library.list().length} músicas na biblioteca`:'Nenhuma música salva. Selecione os arquivos novamente em Biblioteca.');render(true)},
  clear(){confirmBox('Isso apaga músicas salvas, playlists, favoritos e configurações deste aplicativo. Os arquivos originais no seu aparelho não são apagados.','clear-ok')},
  async 'clear-ok'(){Player.audio.pause();await Store.wipe();location.reload()},
  about(){modal(`<div class="fh"><h3>Entre Nós</h3>${closeBtn}</div><p class="sub" style="margin-bottom:12px">Um pequeno lugar feito só para nós, em comemoração aos 2 meses.</p><p class="sub">${PRIV} Não há login, coleta de dados nem análise de uso.</p>`)}
};
document.addEventListener('click',e=>{
  const o=$('#overlay');if(e.target===o){closeModal();return}
  if(e.target.closest('#mini')&&!e.target.closest('[data-act=toggle]')){ACT.expand();return}
  const t=e.target.closest('[data-act]');if(t&&ACT[t.dataset.act])ACT[t.dataset.act](t);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('row')){e.preventDefault();e.target.click()}
  else if(e.key===' '&&e.target===document.body){e.preventDefault();ACT.toggle()}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.classList.contains('seek')){Player.seekPct(t.value/1000);rng(t)}
  else if(t.classList.contains('vol')){const v=t.value/100;Player.audio.volume=v;Player.audio.muted=false;cfg.volume=v;saveCfg();$$('.vol').forEach(x=>{x.value=t.value;rng(x)})}
});
document.addEventListener('pointerdown',e=>{if(e.target.classList&&e.target.classList.contains('seek'))S.seeking=true});
document.addEventListener('pointerup',()=>{S.seeking=false});
document.addEventListener('change',e=>{
  const k=e.target.dataset&&e.target.dataset.set;if(!k||k==='volume')return;
  cfg[k]=e.target.type==='checkbox'?e.target.checked:e.target.value;saveCfg();
  if(k==='theme')document.documentElement.dataset.theme=cfg.theme;
  if(k==='autoplay')Player.autoplay=cfg.autoplay;
  if(k==='shuffle')Player.setShuffle(cfg.shuffle);
  if(k==='showHidden'){Library.showHidden=cfg.showHidden}
});

/* ---------- inicializacao ---------- */
function welcome(){
  const w=document.createElement('div');w.id='welcome';
  w.innerHTML=`<div class="h">${ic('heartf',72)}</div><h1>Feliz 2 meses</h1><p>Eu fiz esse pequeno lugar só para nós.</p><button class="btn" id="enter">Entrar</button><small>${PRIV}</small>`;
  document.body.appendChild(w);$('#enter').focus();
  $('#enter').onclick=()=>{Store.set('seen',true);w.classList.add('out');setTimeout(()=>w.remove(),700)};
}
async function boot(){
  document.documentElement.dataset.theme=cfg.theme;
  $('#nav').innerHTML=NAV.map(n=>`<button data-view="${n[0]}" aria-label="${n[1]}">${ic(n[2],24)}<span>${n[1]}</span></button>`).join('');
  $('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)go(b.dataset.view)});
  Player.audio.volume=cfg.volume;Player.autoplay=cfg.autoplay;Player.shuffle=cfg.shuffle;Player.repeat=cfg.repeat;Library.showHidden=cfg.showHidden;
  Player.on('state',update);Player.on('tick',tick);
  Player.onerror=()=>toast('Não foi possível tocar este arquivo. Tente selecioná-lo novamente.');
  try{await Library.load()}catch(e){console.error(e);toast('Não foi possível ler a biblioteca salva. Selecione os arquivos novamente.')}
  Player.queue=Library.shown().map(s=>s.id);
  const last=Store.get('last');if(last&&Library.songs.has(last))await Player.load(last,false);
  render();
  if(!Store.get('seen'))welcome();
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
  if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
boot();
})();
