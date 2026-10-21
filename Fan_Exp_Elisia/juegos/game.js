'use strict';
const $ = s => document.querySelector(s), W = 7, H = 7, RT = 60000, MX = 5, sleep = ms => new Promise(r => setTimeout(r, ms));
const E = [
  '<img src="assets/balon.png" class="im">', 
  '<img src="assets/casco.png" class="im">', 
  '<img src="assets/hombreras.png" class="im">', 
  '<img src="assets/Playbook.png" class="im">', 
  '<img src="assets/cleats.png" class="im">', 
  '<img src="assets/Guantes.png" class="im">'
];
const LV = [[95,22,{0:12}],[85,22,{1:14,0:10}],[75,20,{},0,1],[65,22,{},8],[55,20,{2:15,3:15}],[45,20,{},0,2],
[35,22,{0:12},12],[25,20,{1:20,4:20}],[15,24,{},8,2],[10,22,{},14],[5,24,{5:15},0,3],[1,26,{0:20,2:20},12,2]];
const RV = ['Coyotes','Toros','Tiburones','Águilas','Leones','Panteras','Jaguares','Cóndores','Titanes','Vikingos','Dragones','Gigantes'];
const MS = ['','','¡PRIMERA Y DIEZ!','¡PASE COMPLETO!','¡INTERCEPCIÓN!','¡SACK!','¡TOUCHDOWN!'];
let S = {u:0, st:[], e:MX, t:Date.now()}, G, AC, cam = {p:100};
try { Object.assign(S, JSON.parse(localStorage.rw || '{}')) } catch(e) {}
const save = () => { try { localStorage.rw = JSON.stringify(S) } catch(e) {} };
const B = $('#board'), rnd = () => Math.floor(Math.random() * G.K);
const fmt = m => { m = Math.ceil(m/1e3); return Math.floor(m/60) + ':' + String(m%60).padStart(2,'0') };

/* ---------- Prevenir Zoom por Doble Toque en iOS ---------- */
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
 const now = Date.now();
 if (now - lastTouchEnd <= 300) {
  e.preventDefault();
 }
 lastTouchEnd = now;
}, { passive: false });

/* ---------- Energía (botellas que se recargan) ---------- */
function tick() {
 const n = Date.now();
 if(S.e >= MX) S.t = n; else { const k = Math.floor((n-S.t)/RT); if(k>0){ S.e = Math.min(MX, S.e+k); S.t = S.e>=MX?n:S.t+k*RT; save() } }
 const l = S.e >= MX ? ' · LLENAS' : ' · ' + fmt(RT-(n-S.t));
 const bot = '<img src="assets/botella.png" style="width:16px;vertical-align:middle">';
 document.querySelectorAll('.en').forEach(e => e.innerHTML = bot.repeat(S.e) + '<i style="opacity:0.3">' + bot.repeat(MX-S.e) + '</i>' + l);
}
setInterval(tick, 1000);

/* ---------- Utilidades ---------- */
function snd(f, d=.12, ty='square') { try{ AC=AC||new AudioContext(); const o=AC.createOscillator(), g=AC.createGain(); o.type=ty; o.frequency.value=f; g.gain.value=.05; o.connect(g); g.connect(AC.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime+d); o.stop(AC.currentTime+d) }catch(e){} }
const show = id => document.querySelectorAll('.s').forEach(s => s.classList.toggle('on', s.id==id));
function toast(t) { const e=$('#toast'); e.textContent=t; e.classList.add('on'); setTimeout(()=>e.classList.remove('on'), 2200) }
function say(t, f=400) { const d=document.createElement('div'); d.className='fl'; d.textContent=t; $('#fx').appendChild(d); setTimeout(()=>d.remove(), 1100); snd(f, .25, 'sawtooth') }

/* ---------- Carga inicial ---------- */
async function boot() {
 const IM=['LogoRedwolfs.png','LogoArkansas.jpg','VS.jpg','balon.png','casco.png','hombreras.png','Playbook.png','cleats.png','Guantes.png','botella.png'];
 let n=0; const up=()=>$('#lb').style.width=(++n/(IM.length+2)*100)+'%';
 await Promise.all(IM.map(f => new Promise(r => { const i=new Image(); i.onload=i.onerror=()=>{up();r()}; i.src='assets/'+f })));
 buildMap(); up(); tick(); if(document.fonts) await document.fonts.ready; up(); await sleep(350); show('home');
}

/* ---------- Navegación y Menú Popup ---------- */
$('#bhome').onclick = () => { window.location.href = '../index.html'; };
const openHelp = () => $('#helpModal').classList.add('on');
const closeHelp = () => $('#helpModal').classList.remove('on');
if($('#bhelp')) $('#bhelp').onclick = openHelp;
if($('#bghelp')) $('#bghelp').onclick = openHelp;
if($('#closeHelp')) $('#closeHelp').onclick = closeHelp;

/* ---------- Mapa (la cancha) ---------- */
function buildMap() {
 let h='<div class=ez>RED WOLVES<small>ZONA DE ANOTACIÓN</small></div>';
 for(let p=10; p<=90; p+=10) h+=`<div class=yl style="top:${10+p*.9}%"><i>${Math.min(p,100-p)}</i></div>`;
 LV.forEach((l,i) => h+=`<button class="node ${i<S.u?'done':i==S.u?'cur':'lock'}" style="top:${10+l[0]*.9}%;left:${i%2?66:34}%" data-i=${i}>${i+1}<small>${i<S.u?'★'.repeat(S.st[i]||1):l[0]+' yd'}</small></button>`);
 $('#field').innerHTML = h;
}
function openMap() { buildMap(); show('map'); tick(); setTimeout(()=>{ const n=$('.node.cur')||$('.node:last-child'); n&&n.scrollIntoView({block:'center'}) },60) }$('#field').onclick = e => { const b=e.target.closest('.node'); if(b && !b.classList.contains('lock')) start(+b.dataset.i) };
$('#play').onclick = () => { snd(500); openMap() };
$('#bm').onclick = openMap;

/* ---------- Inicio de nivel (Versus) ---------- */
async function start(i) {
 tick();
 if(S.e<1){ toast('Sin energía 💧 próxima en '+fmt(RT-(Date.now()-S.t))); return }
 if(S.e>=MX) S.t=Date.now(); S.e--; save(); tick(); snd(250,.3);
 $('#rn').textContent = RV[i]; $('#vy').textContent = `NIVEL ${i+1} · A ${LV[i][0]} YARDAS DE LA ZONA`; show('vs');
 await Promise.race([sleep(2300), new Promise(r => $('#vs').onclick=r)]);
 init(i); show('game');
}

/* ---------- Tablero ---------- */
function mk(t) { const e=document.createElement('div'); e.className='tile t'+t+(t==9?' td':''); e.innerHTML=t==9?'⭐':E[t]; B.appendChild(e); return {t, e, s:'', pot:1} }
function sync() { for(let r=0; r<H; r++) for(let c=0; c<W; c++){ const x=G.g[r][c]; if(x){ x.e.style.left=c*100/W+'%'; x.e.style.top=r*100/H+'%' } } }
const sw = (a,b) => { [G.g[a.r][a.c], G.g[b.r][b.c]] = [G.g[b.r][b.c], G.g[a.r][a.c]] };
const iceUp = k => G.iv[k].className='ice h'+G.ice[k];
const left = () => Object.values(G.need).reduce((a,b) => a+Math.max(0,b), 0) + G.ice.reduce((a,b)=>a+b,0) + G.balls - G.arr;

function init(i) {
 const l = LV[i];
 G = {i, K:i<3?5:6, mv:l[1], mv0:l[1], need:{...l[2]}, balls:l[4]||0, arr:0, busy:0, g:[], ice:Array(W*H).fill(0), iv:[], sel:null, hasIce:!!l[3]};
 B.innerHTML=''; $('#fx').innerHTML='';
 for(let r=0; r<H; r++) { G.g[r]=[]; for(let c=0; c<W; c++) { let t;
  do t=rnd(); while((c>1 && G.g[r][c-1].t==t && G.g[r][c-2].t==t) || (r>1 && G.g[r-1][c].t==t && G.g[r-2][c].t==t));
  G.g[r][c] = mk(t);
 } }
 [...Array(W).keys()].sort(()=>Math.random()-.5).slice(0,G.balls).forEach(c => { G.g[0][c].e.remove(); G.g[0][c]=mk(9) });
 [...Array(W*H).keys()].sort(()=>Math.random()-.5).slice(0,l[3]||0).forEach(k => G.ice[k] = i>=9?2:1);
 for(let k=0; k<W*H; k++){ const d=document.createElement('div'); d.style.left=(k%W)*100/W+'%'; d.style.top=(k/W|0)*100/H+'%'; G.iv[k]=d; B.appendChild(d); iceUp(k) }
 sync(); G.tot = Math.max(1, left()); hud(); if(!hasMove()) shuffle(); cam.p = i?LV[i-1][0]:100;
}

function hud() {
 let h=''; for(const t in G.need) h+=`<span class="chip t${t}">${E[t]} ${Math.max(0,G.need[t])}</span>`;
 if(G.hasIce) h+=`<span class=chip>🛡️ ${G.ice.filter(v=>v>0).length}</span>`;
 if(G.balls) h+=`<span class="chip td">⭐ ${G.balls-G.arr}</span>`;
 $('#obj').innerHTML = h; $('#mv').textContent = 'JUGADAS: '+G.mv;
}

/* ---------- Detección de combinaciones ---------- */
function runs() {
 const R=[], T=(r,c)=>{ const x=G.g[r][c]; return x && x.t<9 ? x.t : -1 };
 for(let r=0; r<H; r++) for(let c=0; c<W;) { const t=T(r,c); let d=c+1; if(t>=0) while(d<W && T(r,d)==t) d++; if(d-c>=3) R.push({h:1, cells:Array.from({length:d-c},(_,i)=>r*W+c+i)}); c=d; }
 for(let c=0; c<W; c++) for(let r=0; r<H;) { const t=T(r,c); let d=r+1; if(t>=0) while(d<H && T(d,c)==t) d++; if(d-r>=3) R.push({h:0, cells:Array.from({length:d-r},(_,i)=>(r+i)*W+c)}); r=d; }
 for(let r=0; r<H-1; r++){
  for(let c=0; c<W-1; c++){
   const t1 = T(r,c);
   if(t1>=0 && t1===T(r,c+1) && t1===T(r+1,c) && t1===T(r+1,c+1)) {
    R.push({h:2, cells:[r*W+c, r*W+(c+1), (r+1)*W+c, (r+1)*W+(c+1)]});
   }
  }
 }
 return R;
}

function find() {
 const R=runs(), set=new Set, sp=[], cnt={};
 R.forEach(a => a.cells.forEach(k => { set.add(k); cnt[k]=(cnt[k]||0)+1; }));
 R.forEach(a => {
  const L = a.cells.length;
  if(a.h===2) { sp.push({k: a.cells[0], s: 'f'}); return; }
  if(L<4) return;
  const k = a.cells.find(k => G.sw && G.sw.includes(k));
  sp.push({k: k ?? a.cells[L>>1], s: L>4 ? 'z' : a.h ? 'r' : 'c'});
 });
 for(const k in cnt) if(cnt[k]>1) sp.push({k: +k, s: 'x'});
 sp.forEach(o => set.delete(o.k)); return {set, sp};
}

/* ---------- Limpiar, caer, rellenar ---------- */
async function clear(set, customTarget=null) {
 const q=[...set];
 while(q.length) {
  const k=q.pop(), r=k/W|0, c=k%W, x=G.g[r][c]; if(!x||!x.s) continue; const add=[];
  const p = x.pot || 1;
  if(x.s=='r' || x.s=='mix') for(let i=0; i<W; i++) add.push(r*W+i);
  if(x.s=='c' || x.s=='mix') for(let i=0; i<H; i++) add.push(i*W+c);
  if(x.s=='x') for(let a=-1-p+1; a<2+p-1; a++) for(let b=-1-p+1; b<2+p-1; b++) if(r+a>=0 && r+a<H && c+b>=0 && c+b<W) add.push((r+a)*W+c+b);
  if(x.s=='z') G.g.forEach((row,i)=>row.forEach((y,j)=>y && y.t==(customTarget!=null?customTarget:x.t) && add.push(i*W+j)));
  if(x.s=='f') { for(let i=0; i<3*p; i++) add.push(Math.floor(Math.random()*H)*W + Math.floor(Math.random()*W)); }
  x.s=''; add.forEach(a => { const y=G.g[a/W|0][a%W]; if(y && y.t<9 && !set.has(a)){ set.add(a); q.push(a); } });
 }
 const ib=new Set, els=[];
 set.forEach(k => {
  const r=k/W|0, c=k%W, x=G.g[r][c]; if(!x) return; if(x.t in G.need) G.need[x.t]--;
  [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b]) => { const rr=r+a, cc=c+b; if(rr>=0&&rr<H&&cc>=0&&cc<W) ib.add(rr*W+cc) });
  x.e.classList.add('pop'); els.push(x.e); G.g[r][c]=null;
 });
 ib.forEach(k => { if(G.ice[k]>0){ G.ice[k]--; iceUp(k); } });
 hud(); await sleep(210); els.forEach(e => e.remove());
}

function fall() {
 for(let c=0; c<W; c++) {
  let w = H-1;
  for(let r=H-1; r>=0; r--) { const x=G.g[r][c]; if(x){ G.g[r][c]=null; G.g[w][c]=x; w--; } }
  for(let r=w, n=1; r>=0; r--, n++) {
   const x=mk(rnd()); x.e.style.left=c*100/W+'%'; x.e.style.top=-n*100/H+'%'; G.g[r][c]=x;
  }
 }
 void B.offsetWidth;
}

async function settle() {
 for(;;) {
  fall(); sync(); await sleep(290); let a=0;
  G.g[H-1].forEach((x,c) => { if(x && x.t==9){ a++; G.arr++; x.e.classList.add('pop'); G.g[H-1][c]=null; const e=x.e; setTimeout(()=>e.remove(),220) } });
  if(!a) break; say('¡TOUCHDOWN!', 700); hud(); await sleep(240);
 }
}

async function chain(combo=0) {
 for(;;) {
  const m=find(); G.sw=null; if(!m.set.size) break; combo++;
  const s = m.sp.map(o=>o.s);
  const t = combo>1 ? MS[Math.min(combo,6)] : s.includes('z') ? '¡EL RUGIDO RED WOLF!' : s.includes('x') ? '¡CAPTURA!' : s.some(v=>v=='r'||v=='c') ? '¡PASE BALA!' : s.includes('f') ? '¡BALÓN EN LLAMAS!' : '';
  t ? say(t, 300+combo*80) : snd(300+combo*60, .15);
  if(combo>=4){ const g=$('#game'); g.classList.remove('sh'); void g.offsetWidth; g.classList.add('sh'); }
  await clear(m.set);
  m.sp.forEach(o => { const x=G.g[o.k/W|0][o.k%W]; if(x){ x.s=o.s; x.e.className='tile t'+x.t+' s-'+o.s; } });
  await settle();
 }
 return combo;
}

/* ---------- Jugadas ---------- */
async function triggerPower(r, c) {
 const x = G.g[r][c];
 if(!x || !x.s) return;
 G.busy = 1;
 const s = new Set([r*W+c]);
 await clear(s);
 await settle();
 await chain();
 G.busy = 0;
}

async function trySwap(a, b) {
 if(G.busy || G.mv<1) return;
 if(G.ice[a.r*W+a.c]>0 || G.ice[b.r*W+b.c]>0) return;
 
 const x=G.g[a.r][a.c], y=G.g[b.r][b.c];
 if(!x || !y || (x.t>8 && y.t>8)) return;
 
 G.busy=1; sw(a,b); sync(); snd(300,.08); await sleep(190);
 
 if(x.s && y.s) {
  G.mv--; hud();
  const s = new Set([a.r*W+a.c, b.r*W+b.c]);
  if(x.s == y.s) { x.pot = 2; }
  else { x.s = 'mix'; }
  await clear(s);
  await settle();
  await chain(1);
  if(left()<=0) return win(); if(G.mv<=0) return lose();
  G.busy=0; return;
 }

 const z = x.s=='z' ? x : y.s=='z' ? y : null;
 if(!z && !runs().length) {
  sw(a,b); sync(); snd(120,.15,'sawtooth'); await sleep(190); G.busy=0; return;
 }
 
 G.mv--; hud(); let n=0;
 if(z) {
  const o = z==x ? y : x, s=new Set; z.s='';
  const targetType = o.t<9 ? o.t : Math.floor(Math.random()*6);
  G.g.forEach((row,i) => row.forEach((t,j) => t && (t==z || t.t==targetType) && s.add(i*W+j)));
  say('¡EL RUGIDO RED WOLF!', 200); n=1; await clear(s, targetType); await settle();
 } else G.sw = [a.r*W+a.c, b.r*W+b.c];
 
 await chain(n); hud();
 if(left()<=0) return win(); if(G.mv<=0) return lose();
 if(!hasMove()){ say('¡AUDIBLE!', 500); shuffle(); }
 G.busy=0;
}

function hasMove() {
 if(G.g.some(r => r.some(x => x && x.s=='z'))) return 1;
 for(let r=0; r<H; r++) for(let c=0; c<W; c++) for(const [a,b] of [[0,1],[1,0]]) {
  const r2=r+a, c2=c+b; if(r2>=H || c2>=W) continue;
  if(G.ice[r*W+c]>0 || G.ice[r2*W+c2]>0) continue;
  const x=G.g[r][c], y=G.g[r2][c2]; if(!x || !y || (x.t>8 && y.t>8)) continue;
  sw({r,c},{r:r2,c:c2}); const ok=runs().length || (x.s && y.s); sw({r,c},{r:r2,c:c2}); if(ok) return 1;
 }
 return 0;
}
function shuffle() {
 const t=[]; G.g.forEach(r => r.forEach(x => x && x.t<9 && t.push(x)));
 for(let n=0; n<80; n++){ t.forEach(x => x.t=rnd()); if(!runs().length && hasMove()) break; }
 t.forEach(x => { x.e.className='tile t'+x.t+(x.s?' s-'+x.s:''); x.e.innerHTML=E[x.t] });
}

/* ---------- Entrada (toque y deslizar sin zoom en iOS) ---------- */
function cell(e) { const b=B.getBoundingClientRect(), f=(v,m)=>Math.min(m-1, Math.max(0, Math.floor(v*m))); return {r:f((e.clientY-b.top)/b.height,H), c:f((e.clientX-b.left)/b.width,W)} }
function pick(c) { G.sel=c; document.querySelectorAll('.tile.sel').forEach(e => e.classList.remove('sel')); const x=c && G.g[c.r][c.c]; if(x) x.e.classList.add('sel'); }

let lastTapTime = 0, lastTapCell = null;

B.onpointerdown = e => {
 if(!G || G.busy) return;
 const c = cell(e), s = G.sel;
 const now = Date.now();

 // Detección de doble toque nativo en JS (evita zoom en iOS)
 if (lastTapCell && lastTapCell.r === c.r && lastTapCell.c === c.c && (now - lastTapTime) < 320) {
  G.dn = null;
  pick(null);
  lastTapCell = null;
  triggerPower(c.r, c.c);
  return;
 }
 lastTapTime = now;
 lastTapCell = c;

 G.dn = {...c, x:e.clientX, y:e.clientY};
 if(s && Math.abs(s.r-c.r)+Math.abs(s.c-c.c)==1){ G.dn=null; pick(null); trySwap(s,c); } else pick(c);
};

window.onpointerup = e => {
 const d=G && G.dn; if(!d) return; G.dn=null; const dx=e.clientX-d.x, dy=e.clientY-d.y;
 if(Math.hypot(dx,dy)>22) {
  const o = Math.abs(dx)>Math.abs(dy) ? {r:d.r, c:d.c+Math.sign(dx)} : {r:d.r+Math.sign(dy), c:d.c};
  pick(null); if(o.r>=0 && o.r<H && o.c>=0 && o.c<W) trySwap(d,o);
 }
};

/* ---------- Resultados ---------- */
function end(t, s, st, lb, fn) {
 $('#et').textContent=t; $('#es').textContent=s; $('#st').textContent=st; $('#b1').textContent=lb;
 $('#end').classList.add('on'); $('#b1').onclick=()=>{$('#end').classList.remove('on'); fn()}; $('#b2').onclick=()=>{$('#end').classList.remove('on'); openMap()};
}
function win() {
 const i=G.i, r=G.mv/G.mv0, s=r>.4?3:r>.2?2:1; S.st[i]=Math.max(S.st[i]||0, s); S.u=Math.max(S.u, i+1); save();
 [0,150,300,450].forEach((d,k) => setTimeout(() => snd(400+k*150, .3), d));
 end(i==11?'🏆 ¡CAMPEONES NACIONALES!':'¡TOUCHDOWN!', i==11?'Los Red Wolves dominan el fútbol americano universitario de México.':`Quedan ${LV[i+1][0]} yardas para la zona de anotación.`, '★'.repeat(s)+'☆'.repeat(3-s), i<11?'SIGUIENTE':'JUGAR DE NUEVO', ()=>start(i<11?i+1:0));
}
function lose() { snd(100,.6,'sawtooth'); end('SIN JUGADAS','Te quedaste corto. ¡Vuelve a la ofensiva!','','REINTENTAR (−1 💧)', ()=>start(G.i)); }

/* ---------- Vista desde el campo hacia la zona de anotación (perspectiva) ---------- */
const cx=$('#view').getContext('2d');
function draw() {
 const w=640, h=220, hy=h*.42, p=cam.p, x=cx;
 const D=y=>Math.max(p-y+.8,.3), sy=(d,z=0)=>hy+(1.8-z)*h*.5/d, sx=(u,d)=>w/2+u*w*.046/d;
 const g=x.createLinearGradient(0,0,0,hy); g.addColorStop(0,'#4a9ee0'); g.addColorStop(1,'#d6ecfa'); x.fillStyle=g; x.fillRect(0,0,w,h);
 x.fillStyle='#8a8a62'; x.beginPath(); x.moveTo(0,hy); for(let i=0; i<=w; i+=16) x.lineTo(i, hy-16-10*Math.sin(i*.019)-6*Math.sin(i*.05)); x.lineTo(w,hy); x.fill();
 x.fillStyle='#2a7d36'; x.fillRect(0,hy,w,h-hy);
 const q=(a,b,c)=>{ const d1=D(a), d2=D(b); x.fillStyle=c; x.beginPath(); x.moveTo(sx(-26.7,d1),sy(d1)); x.lineTo(sx(26.7,d1),sy(d1)); x.lineTo(sx(26.7,d2),sy(d2)); x.lineTo(sx(-26.7,d2),sy(d2)); x.fill() };
 for(let y=100; y>0; y-=5) if(y-5<p+.7) q(y,y-5, (y/5)%2?'#2f9e44':'#3bb54e');
 q(0,-10,'#c8102e');
 x.strokeStyle='#fff';
 for(let y=100; y>=-10; y-=y>0?5:10){ if(y>p) continue; const d=D(y); x.lineWidth=Math.min(10, Math.max(1, (y%10?1:2.2)*5/d)); x.beginPath(); x.moveTo(sx(-26.7,d),sy(d)); x.lineTo(sx(26.7,d),sy(d)); x.stroke(); }
 const df=D(-10); x.lineWidth=3; [-26.7,26.7].forEach(u => { x.beginPath(); x.moveTo(sx(u,.3),sy(.3)); x.lineTo(sx(u,df),sy(df)); x.stroke(); });
 x.strokeStyle='#ffd43b'; x.lineWidth=Math.max(2,30/df); const P=(u,z)=>[sx(u,df),sy(df,z)]; x.beginPath();
 x.moveTo(...P(0,0)); x.lineTo(...P(0,3.3)); x.moveTo(...P(-3,3.3)); x.lineTo(...P(3,3.3)); x.moveTo(...P(-3,3.3)); x.lineTo(...P(-3,13)); x.moveTo(...P(3,3.3)); x.lineTo(...P(3,13)); x.stroke();
}
(function loop() {
 if(G && $('#game').classList.contains('on')) {
  const l=LV[G.i], np=G.i<11?LV[G.i+1][0]:.2, tg=l[0]-(l[0]-np)*(1-left()/G.tot)*.9;
  cam.p += (tg-cam.p)*.04; $('#ys').textContent = `NIVEL ${G.i+1} · ${Math.max(0,Math.round(cam.p))} YDS`; draw();
 }
 requestAnimationFrame(loop);
})();

boot();