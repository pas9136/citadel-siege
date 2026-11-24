import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('test-results',{recursive:true});
for(const engine of (process.env.CHROMIUM_ONLY?[chromium]:[chromium,webkit])){
 const browser=await engine.launch({headless:true});
 for(const [width,height] of [[844,390],[667,375],[932,430]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:true,deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.V7_URL||'http://localhost:8000/preview-7/');
 const result=await page.evaluate(()=>{
 const t=__citadelTest, checks=[];const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 t.start('ranger');const s=t.state(),p=s.p;s.prep=1e6;
 const travel=goal=>{let path=t.findPath(p,goal);check(path.length>0,'route exists');for(const step of path){check(t.clearSegment(p,step),'route clear');t.moveActor(p,step.x-p.x,step.y-p.y);check(Math.hypot(p.x-step.x,p.y-step.y)<.2,'movement arrives')}check(Math.hypot(p.x-goal.x,p.y-goal.y)<1,'goal reached '+JSON.stringify({goal,x:p.x,y:p.y}))};
 check(s.stage===4,'starts zone 4');check(!t.walkable(0,-540),'defense cannot bypass teleport');
 for(const shop of t.shops){travel({x:shop.x,y:shop.y+60});t.openShop();check(s.shop,'shop opens '+shop.name);p.gold=1000;const before=p.items.sword;t.buy('sword');check(p.items.sword===before+1&&p.gold<1000,'purchase '+shop.name);document.getElementById('closeShop').click()}
 for(const origin of t.spawnPoints){for(const r of [10,18,26,39]){const path=t.findPath(origin,{x:0,y:0},r);let a=origin;for(const b of path){check(t.clearSegment(a,b,r),'enemy route clear');a=b}check(Math.hypot(a.x,a.y)<1,'spawn reaches keep')}}
 p.x=300;p.y=250;t.moveActor(p,1000,0);check(p.x<303&&t.walkable(p.x,p.y),'large movement blocked');p.face=0;t.skill(1);check(p.x<303,'dash blocked');
 // Complete each real spawn queue and verify the four directions before killing it.
 for(let wave=1;wave<=30;wave++){t.wave();check(s.wave===wave,'wave begins');s.base.hp=1e7;p.hp=p.maxHp=1e7;const lanes=new Set();for(let i=0;i<10000&&s.stage===4&&!s.preparing;i++){t.update(.1);for(const e of t.enemies().filter(e=>!e.major)){lanes.add(e.lane);t.damageEnemy(e,1e9)}}check(lanes.size===4,'four attack directions wave '+wave)}
 check(s.stage===3&&t.enemies().some(e=>e.major),'teleport to first boss');check(!t.walkable(-380,-1080),'boss exit locked');
 let boss=t.enemies().find(e=>e.major);p.x=200;p.y=-800;const oldY=boss.y;for(let i=0;i<60;i++)t.update(.1);check(boss.y>oldY,'boss pursues hero '+JSON.stringify(boss));check(!!boss.telegraph||boss.specialClock!==undefined,'boss telegraph AI');
 t.damageEnemy(boss,1e9);t.update(.1);check(s.stage===2,'boss unlocks perimeter');check(t.walkable(-380,-1080),'west exit open');check(t.walkable(380,-1080),'east exit open');check(!t.walkable(0,-1900),'final gate locked');
 travel({x:-520,y:-1680});t.update(.1);check(s.seals[0]&&!s.seals[1],'west seal');travel({x:520,y:-1680});t.update(.1);check(s.seals.every(Boolean),'east seal');check(t.walkable(0,-1900),'final gate unlocked');
 t.writeSave();const saved=JSON.parse(localStorage.getItem('citadel.preview.v7.0:citadel.laststand.save.v2'));check(saved.stage===2&&saved.seals.every(Boolean),'stage saved');
 travel({x:0,y:-1960});t.update(.1);check(s.stage===1,'final arena entered');check(!t.walkable(0,-1900),'final encounter sealed');
 boss=t.enemies().find(e=>e.major);check(boss.kind==='overlord','final boss');t.frame();t.damageEnemy(boss,1e9);t.update(.1);check(s.mode==='over'&&document.querySelector('#gameOver h2').textContent==='CITADEL LIBERATED','victory ends run');
 t.load(saved);check(t.state().stage===2&&t.state().seals.every(Boolean),'checkpoint restored');t.frame();
 return {checks:checks.length,stage:t.state().stage};
 });
 await page.screenshot({path:`test-results/v7-${engine.name()}-${width}.png`});
 // Pointer capture/cancel, resize and save namespace checks on the actual UI.
 await page.evaluate(()=>__citadelTest.start());
 const joy=page.locator('#joystick');const box=await joy.boundingBox();
 await joy.dispatchEvent('pointerdown',{pointerId:7,clientX:box.x+box.width*.8,clientY:box.y+box.height/2,pointerType:'touch'});
 await page.waitForTimeout(150);await joy.dispatchEvent('pointercancel',{pointerId:7});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.setViewportSize({width,height});
 assert.deepEqual(errors,[]);console.log(engine.name(),width,result);await page.close();
 }
 await browser.close();
}
