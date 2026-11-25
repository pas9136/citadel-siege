// 8.2: runtime footprints are an additive layer, never edits to the WPM.
// Dimensions are original gameplay reconstructions, not Warcraft pathing textures.
class Pool82 {
 constructor(limit){this.limit=limit;this.free=[];this.owned=new WeakSet();this.available=new WeakSet();this.live=new Set();this.created=0;this.reused=0}
 take(values){let o=this.free.pop();if(o){this.available.delete(o);this.reused++}else{o={};this.created++;this.owned.add(o)}for(const k of Object.keys(o))delete o[k];Object.assign(o,values);if(this===shotPool82)launchShot82(o);this.live.add(o);return o}
 release(o){if(!o||!this.owned.has(o)||this.available.has(o))return;this.live.delete(o);if(typeof visualPose!=='undefined')visualPose.delete(o);if(this.free.length<this.limit){this.available.add(o);this.free.push(o)}}
}
const actorPool82=new Pool82(240),shotPool82=new Pool82(240),particlePool82=new Pool82(320);
// Launch bolts outside their emitting keep/tower, without bypassing unrelated walls.
function launchShot82(q){if(!state)return;const emitter=[{x:0,y:0,w:64,h:56},...enemyTowers.map(t=>({...t,w:36,h:36}))].find(o=>rectHit82(o,q.x,q.y,2));if(!emitter)return;const speed=Math.hypot(q.vx,q.vy);if(!speed)return;for(let d=0;d<100&&rectHit82(emitter,q.x,q.y,4);d+=2){q.x+=q.vx/speed*2;q.y+=q.vy/speed*2}}
function poolStats82(){return Object.fromEntries(Object.entries({actors:actorPool82,projectiles:shotPool82,particles:particlePool82}).map(([k,p])=>[k,{created:p.created,reused:p.reused,free:p.free.length,limit:p.limit}]))}
function staticBlocked82(c,r){return c<0||r<0||c>=world.width||r>=world.height||!!(pathFlags[(world.height-1-r)*world.width+c]&2)}
function collectPools82(){const actors=new Set([...enemies,...(arenaReturn?.enemies||[])]),shots=new Set([...projectiles,...hostileShots]),fx=new Set(particles);for(const [p,active] of [[actorPool82,actors],[shotPool82,shots],[particlePool82,fx]])for(const o of p.live)if(!active.has(o))p.release(o)}
let objects82=[],navRevision82=0,signature82='',restoring82=false;
const gateOverrides82={};
function serialize82(){return {objects:Object.fromEntries(objects82.filter(o=>o.destructible).map(o=>[o.id,o.hp])),gates:{...gateOverrides82}}}
function rectHit82(o,x,y,r=0){const dx=Math.max(Math.abs(x-o.x)-o.w/2,0),dy=Math.max(Math.abs(y-o.y)-o.h/2,0);return dx*dx+dy*dy<=r*r}
function initObjects82(saved){
 objects82=[{id:'castle',x:0,y:0,w:64,h:56,kind:'castle'},...shops.map((s,i)=>({...s,id:'shop'+i,w:48,h:40,kind:'shop'}))];
 for(const g of SCRIPTED_GATES82){const p=referencePoint(g.x,g.y);objects82.push({...p,id:g.id,w:g.width,h:g.height,kind:'gate',source:g,open:false,animation:0})}
 // Verified placement coordinates; silhouettes/footprints are reconstructed.
 for(const u of world.units.filter(u=>['ntt1','unp2','hctw','hgtw','nico'].includes(u.kind))){if(/FLAMETOWER/.test(u.name))continue;const id=u.name+':'+u.x+':'+u.y;objects82.push({...referencePoint(u.x,u.y),id,w:32,h:32,kind:'fortress',destructible:true,hp:Math.max(0,Math.min(800,Number(saved?.objects?.[id]??800)))})}
 for(const k of Object.keys(gateOverrides82))delete gateOverrides82[k];Object.assign(gateOverrides82,saved?.gates||{});signature82='';refresh82(true);
}
function gateOpen82(g){if(Object.hasOwn(gateOverrides82,g.id))return gateOverrides82[g.id];return gateCondition82(g.source)}
// Replay source operations (0 close, 1 open, 2 destroy). Campaign scheduling is adapted.
function applyGateEvent82(name){for(const op of GATE_EVENTS82[name]||[])gateOverrides82[op.id]=op.operation!==0;refresh82()}
function gateCondition82(g){const n=Number(g.id.slice(-2));if(n<=8)return !!state;if(n===13||n===14)return state?.stage<4||state?.wave>=12;if(n===15)return state?.stage===2&&state?.seals?.every(Boolean);if(n===10||n===11||n===12)return state?.stage===2&&state?.seals?.every(Boolean);return state?.stage<3}
function refresh82(force=false){
 if(!state)return;
 for(const o of objects82){if(o.kind==='gate')o.open=gateOpen82(o);o.solid=o.kind==='gate'?!o.open:o.destructible?o.hp>0:true}
 const extra=[...enemyTowers.filter(t=>t.hp>0).map(t=>({...t,id:'tower'+t.id,w:36,h:36,solid:true})),...(state.expansion?.buildings||[]).filter(b=>b.hp>0).map(b=>({...buildPads[b.pad],id:'pad'+b.pad,w:b.kind==='barricade'?64:32,h:32,solid:true}))];
 const sig=objects82.map(o=>o.id+':'+Number(o.solid)).join('|')+';'+extra.map(o=>o.id).join('|');if(!force&&sig===signature82)return;signature82=sig;
 dynamicCells82.fill(0);
 for(const o of [...objects82,...extra])if(o.solid){const c0=Math.max(0,Math.floor((o.x-o.w/2-worldRect.left)/8)),c1=Math.min(world.width-1,Math.ceil((o.x+o.w/2-worldRect.left)/8)-1),r0=Math.max(0,Math.floor((o.y-o.h/2-worldRect.top)/8)),r1=Math.min(world.height-1,Math.ceil((o.y+o.h/2-worldRect.top)/8)-1);for(let y=r0;y<=r1;y++)for(let x=c0;x<=c1;x++)dynamicCells82[y*world.width+x]++}
 navRevision82++;clearanceCache.clear();flowCache.clear();assaultRoutes.clear();
 if(state.p&&!terrainWalkable(state.p.x,state.p.y,HERO_RADIUS))placeActor(state.p,state.p);
 for(const e of enemies){if(e.dead)continue;if(!terrainWalkable(e.x,e.y,e.size))placeActor(e,e,e.size);const goal=e.campId!==undefined?(e.major||e.arenaBoss?state.p:{x:e.homeX,y:e.homeY}):{x:0,y:0};e.path=findPath(e,goal,e.size);e.routeClock=0;e.pathIndex=0}
 for(const a of state.expansion?.army||[]){a.path=[];a.routeClock=0;if(a.hp>0&&!terrainWalkable(a.x,a.y,14))placeActor(a,a,14)}
 if(moveDestination)movePath=findPath(state.p,moveDestination);
}
function setGate82(id,open){const g=objects82.find(o=>o.id===id&&o.kind==='gate');if(!g)return false;gateOverrides82[id]=!!open;refresh82();writeSave();return true}
function debris82(x,y){for(let i=0;i<(reducedFx?8:24);i++){if(particles.length>=320)particlePool82.release(particles.shift());const a=Math.random()*Math.PI*2,v=20+Math.random()*90;particles.push(particlePool82.take({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:.6+Math.random()*.7,maxLife:1.3,size:2+Math.random()*4}))}}
function damageObject82(id,amount){if(!Number.isFinite(amount)||amount<=0)return false;const o=objects82.find(o=>o.id===id&&o.destructible&&o.hp>0);if(!o)return false;o.hp=Math.max(0,o.hp-amount);if(!o.hp){debris82(o.x,o.y);refresh82();writeSave()}return true}
const damageTower82=damageTower;damageTower=function(t,d){const alive=t?.hp>0;damageTower82(t,d);if(alive&&t.hp<=0){debris82(t.x,t.y);refresh82()}};
const create82=createGame;createGame=function(h,save){restoring82=true;objects82=[];dynamicCells82.fill(0);clearanceCache.clear();flowCache.clear();for(const k of Object.keys(gateOverrides82))delete gateOverrides82[k];create82(h,save);collectPools82();initObjects82(save?.dynamic82);placeActor(state.p,state.p);restoring82=false;writeSave()};
const save82=writeSave;writeSave=function(){if(!restoring82)save82()};
const stage82=enterStage;enterStage=function(n){stage82(n);if(n===3)applyGateEvent82('Trig_AttackNecropolis_Actions');if(n===2){applyGateEvent82('Trig_Boss1Dead_Actions');applyGateEvent82('Trig_Survival3Start_Actions')}if(n===1)applyGateEvent82('Trig_Boss6Music_Actions');refresh82();placeActor(state.p,state.p);writeSave()};
const enter82=enterArena;enterArena=function(id){const ok=enter82(id);if(ok){refresh82();placeActor(state.p,state.p);for(const e of enemies)placeActor(e,e,e.size)}return ok};
const leave82=leaveArena;leaveArena=function(won){const ok=leave82(won);if(ok){refresh82();placeActor(state.p,state.p)}return ok};
const update82=update;update=function(dt){if(!state||state.mode!=='game'||state.paused||state.shop||state.inventoryOpen||state.talentsOpen)return;refresh82();const sealed=state.seals?.every(Boolean);update82(dt);if(!sealed&&state.seals?.every(Boolean))applyGateEvent82('Trig_Survival3Attack_Actions');refresh82();collectPools82();for(const o of objects82)if(o.kind==='gate')o.animation=Math.max(0,Math.min(1,o.animation+(o.open?1:-1)*dt*2));for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;if(p.life<=0)particlePool82.release(particles.splice(i,1)[0])}};
// A nearby ruin can be attacked explicitly, without changing enemy targeting.
const break82=document.createElement('button');break82.textContent='Break structure';break82.className='interactive';break82.style.cssText='position:fixed;left:12px;top:110px;z-index:6;min-height:44px;display:none';$('ui').appendChild(break82);
break82.onclick=()=>{if(!activeOrigins())return;const o=objects82.find(o=>o.destructible&&o.hp>0&&dist(o.x,o.y,state.p.x,state.p.y)<state.p.range+30);if(o){damageObject82(o.id,heroStat('attack'));addEffect('slash',o.x,o.y,{r:30,duration:.2,color:'#ffd27c'})}};

const command82=command;command=function(a,k){const ok=command82(a,k);if(ok)refresh82();return ok};
const menu82=menu;menu=function(){menu82();collectPools82()};
