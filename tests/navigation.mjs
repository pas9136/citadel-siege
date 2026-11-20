import assert from 'node:assert/strict';
// Shared by both browser engines. Real game functions and simulation, no duplicate model.
export async function navigationChecks(page) {
 const result=await page.evaluate(()=>{
  const t=window.__citadelTest,failures=[];
  const check=(ok,label)=>{if(!ok)failures.push(label)};
  t.start('ranger');t.state().prep=1e6;
  const p=t.state().p;
  // Independently compare the spatial index to exhaustive circle/rectangle collision.
  for(const r of [10,18,39])for(let y=-900;y<=900;y+=20)for(let x=-900;x<=900;x+=20){
   const solid=t.obstacles().some(o=>{const dx=Math.max(o.x-x,0,x-o.x-o.w),dy=Math.max(o.y-y,0,y-o.y-o.h);return dx*dx+dy*dy<(r+.1)**2});
   check(t.walkable(x,y,r,920-r)===(Math.abs(x)<=920-r&&Math.abs(y)<=920-r&&!solid),'spatial collision mismatch');
  }
  // The guard hall north wall is 16 units thick: both walking and dash must stop.
  p.x=100;p.y=-420;p.face=Math.PI/2;
  t.skill(1);check(p.y<-400&&t.walkable(p.x,p.y),'dash tunnels through wall');
  t.moveActor(p,0,600);check(p.y<-400&&t.walkable(p.x,p.y),'large movement tunnels through wall');
  p.x=100;p.y=-420;t.moveActor(p,80,80);check(p.x>150&&t.walkable(p.x,p.y),'wall sliding');
  const start={x:0,y:154};
  const goals=[{x:0,y:-800},{x:0,y:-220},{x:0,y:840},...t.caches()];
  for(const x of [-425,145])for(let i=0;i<3;i++)goals.push({x:x+45,y:285+i*170+60});
  for(const goal of goals){const path=t.findPath(start,goal);let from=start;
   check(path.length>0,'empty room route '+JSON.stringify(goal));
   for(const next of path){check(t.clearSegment(from,next),'route clips geometry');from=next}
   check(Math.hypot(from.x-goal.x,from.y-goal.y)<1,'room/cache unreachable '+JSON.stringify(goal));
  }
  // Blocked taps resolve to reachable ground, and actual movement arrives without clipping.
  t.start();t.state().prep=1e6;
  const goal=t.setDestination({x:100,y:-380});check(goal&&t.walkable(goal.x,goal.y),'blocked destination');
  for(let i=0;i<1800&&t.destination();i++){t.update(1/60);check(t.walkable(t.state().p.x,t.state().p.y),'hero clips route')}
  check(t.destination()===null,'hero route never completes');
  // Each kind, each gate, including both offsets, must reach melee range without clipping.
  let routes=0;
  for(const [kind,type] of Object.entries(t.types()))for(const start of [
   {x:-880,y:170},{x:-880,y:200},{x:880,y:170},{x:880,y:200},
   {x:-20,y:-880},{x:20,y:-880},{x:-20,y:880},{x:20,y:880}
  ]){
   const path=t.findPath(start,{x:0,y:0},type.size,920-type.size);let from=start;
   for(const next of path){check(t.clearSegment(from,next,type.size,920-type.size),'enemy route clips '+kind);from=next}
   check(Math.hypot(from.x,from.y)<1,'enemy gate unreachable '+kind+JSON.stringify(start));routes++;
  }
  // Simulate the production spawn and route-following loop, forcing each assault lane.
  const random=Math.random;
  try {for(const [wave,value] of [[0,0],[2,0],[0,.7],[0,.99]]){
   t.start();t.state().prep=1e6;t.state().p.hp=1e8;t.state().p.attack=0;t.state().base.hp=1e9;
   t.state().wave=wave;Math.random=()=>value;t.spawn('overlord');const enemy=t.enemies()[0];
   for(let i=0;i<2400&&Math.hypot(enemy.x,enemy.y)>enemy.size+53;i++){
    t.update(1/30);check(t.walkable(enemy.x,enemy.y,enemy.size,920-enemy.size),'live enemy clips');
   }
   check(Math.hypot(enemy.x,enemy.y)<=enemy.size+53,'live enemy stuck');
  }}finally{Math.random=random}
  // Guards must spawn clear, pursue and return home without crossing solids.
  t.start();t.state().prep=1e6;t.state().p.hp=1e8;t.state().p.attack=0;
  t.state().p.x=0;t.state().p.y=350;t.updateCampGuards(.1);
  const guards=t.enemies().filter(e=>e.campId!==undefined);
  check(guards.length>=4,'missing camp guards');
  for(let i=0;i<240;i++){t.update(1/60);for(const e of guards)check(t.walkable(e.x,e.y,e.size,920-e.size),'guard clips')}
  t.state().p.x=0;t.state().p.y=-800;
  for(let i=0;i<1200;i++)t.update(1/60);
  for(const e of guards)check(Math.hypot(e.x-e.homeX,e.y-e.homeY)<1,'guard cannot return home');
  t.start();t.state().prep=1e6;
  return {failures:[...new Set(failures)],routes};
 });
 assert.deepEqual(result.failures,[]);
 // Cancel, drag and secondary touch must not become movement commands.
 const input=await page.evaluate(()=>{
  const t=window.__citadelTest,c=document.querySelector('canvas'),v=t.view();
  const send=(type,id,x,primary=true)=>c.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:v.y,isPrimary:primary,button:0,bubbles:true}));
  send('pointerdown',10,v.x);send('pointercancel',10,v.x);send('pointerup',10,v.x+70);
  const cancelled=t.destination()===null;
  send('pointerdown',11,v.x);send('pointermove',11,v.x+40);send('pointerup',11,v.x+40);
  const dragged=t.destination()===null;
  send('pointerdown',12,v.x,false);send('pointerup',12,v.x+40,false);
  const secondary=t.destination()===null;
  t.setDestination({x:0,y:-800});window.dispatchEvent(new Event('blur'));
  return {cancelled,dragged,secondary,blur:t.destination()===null&&t.route().length===0};
 });
 assert.deepEqual(input,{cancelled:true,dragged:true,secondary:true,blur:true});
 console.log(`PASS: navigation — ${result.routes} enemy gate/type routes, fortress rooms, caches, wall sliding, dash, blocked taps, live assaults, cancelled input`);
}
