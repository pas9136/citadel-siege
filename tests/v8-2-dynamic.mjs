import {chromium,webkit} from 'playwright';
import fs from 'node:fs';import assert from 'node:assert/strict';
assert.deepEqual(fs.readFileSync('preview-8-2/world-data.js'),fs.readFileSync('preview-8-1/world-data.js'));
const evidence=JSON.parse(fs.readFileSync('preview-8-2/gate-evidence.json'));assert.equal(evidence.gates.length,17);assert.equal(Object.keys(evidence.events).length,13);
const reports=[];
for(const engine of process.env.CHROMIUM_ONLY?[chromium]:[chromium,webkit]){
 const browser=await engine.launch();const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.V82_URL||'http://localhost:8765/preview-8-2/');
 const result=await page.evaluate(()=>{
 const t=__citadelTest,checks=[];function check(ok,msg){if(!ok)throw Error(msg);checks.push(msg)}t.start();const s=t.state();s.p.hp=s.p.maxHp=s.base.hp=s.base.maxHp=1e9;
 t.fireProjectile(0,0,{x:0,y:300,id:999},1);check(t.walkable(t.shots82().at(-1).x,t.shots82().at(-1).y,2),'keep bolts launch outside emitting footprint');
 const original=t.pathFlags.slice();check(t.dynamic82.objects().filter(o=>o.kind==='gate').length===17,'all 17 script objects present');
 for(const g of t.dynamic82.objects().filter(o=>o.kind==='gate')){
  t.dynamic82.setGate(g.id,false);let rev=t.dynamic82.revision();check(!t.walkable(g.x,g.y,0),g.id+' closed collision');const closed=t.dynamicCells82.reduce((a,b)=>a+b,0);t.spawn('grunt');const e=t.enemies().at(-1);e.path=[{x:123456,y:123456}];
  t.dynamic82.setGate(g.id,true);check(t.dynamic82.revision()>rev,g.id+' invalidates navigation immediately');check(!e.path.some(p=>p.x===123456),g.id+' replans living enemies');check(t.dynamicCells82.reduce((a,b)=>a+b,0)<closed,g.id+' releases footprint');
 }
 check(original.every((v,i)=>v===t.pathFlags[i]),'gate cycles leave original WPM unchanged');
 const tower=t.towers()[0];check(!t.walkable(tower.x,tower.y,0),'live tower footprint');let rev=t.dynamic82.revision();t.damageTower(tower,1e9);check(t.dynamic82.revision()>rev,'tower destruction invalidates routes synchronously');check(t.walkable(tower.x,tower.y,0),'tower rubble traversable');
 const o=t.dynamic82.objects().find(o=>o.destructible&&!t.staticBlocked82(Math.floor((o.x-t.worldRect.left)/8),Math.floor((o.y-t.worldRect.top)/8)));check(!!o,'destructible on static floor');check(!t.walkable(o.x,o.y,0),'fortress footprint');t.dynamic82.damage(o.id,1e9);check(t.walkable(o.x,o.y,0),'destroyed fortress releases collision');
 // A closing gate must not trap an actor inside its newly occupied footprint.
 const g=t.dynamic82.objects().find(o=>o.kind==='gate'&&t.walkable(o.x,o.y,18));if(g){s.p.x=g.x;s.p.y=g.y;t.dynamic82.setGate(g.id,false);check(t.walkable(s.p.x,s.p.y,18),'gate closure safely relocates overlapping hero');t.dynamic82.setGate(g.id,true)}
 const killedId=o.id;for(const e of [...t.enemies()])t.damageEnemy(e,1e9);t.update(.1);const before=t.dynamic82.pools().actors.reused;for(let i=0;i<20;i++)t.spawn('grunt');check(t.dynamic82.pools().actors.reused>before,'actor pool reuses reclaimed objects');check(t.enemies().every(e=>!e.dead&&!e.major&&!e.arenaBoss),'pooled actors clear prior state');
 for(let i=0;i<10;i++)t.fireProjectile(s.p.x,s.p.y,t.enemies()[0],1);for(let i=0;i<30;i++)t.update(.1);for(let i=0;i<10;i++)t.fireProjectile(s.p.x,s.p.y,t.enemies()[0],1);check(t.dynamic82.pools().projectiles.reused>0,'projectile pool reuse');
 const objects=t.dynamic82.objects().filter(o=>o.destructible&&o.hp>0);for(const x of objects.slice(0,2))t.dynamic82.damage(x.id,1e9);for(let i=0;i<20;i++)t.update(.1);for(const x of objects.slice(2,4))t.dynamic82.damage(x.id,1e9);check(t.dynamic82.pools().particles.reused>0,'particle pool reuse');
 // Construction must update even while inventory pauses simulation.
 s.p.gold=100000;s.expansion.wood=10000;s.inventoryOpen=true;rev=t.dynamic82.revision();check(t.command('build','0:barricade'),'construct barricade');check(t.dynamic82.revision()>rev,'construction immediate occupancy');t.command('remove','0');s.inventoryOpen=false;
 for(const p of Object.values(t.dynamic82.pools()))check(p.free<=p.limit,'bounded free lists');
 localStorage.setItem('citadel.preview.v8.1.original-world:sentinel','preserve');localStorage.setItem('citadel.save','production-preserve');t.writeSave();return {checks:checks.length,killedId,pools:t.dynamic82.pools()};
 });
 await page.reload();await page.locator('#continueGame').click();assert.equal(await page.evaluate(id=>__citadelTest.dynamic82.objects().find(o=>o.id===id).hp,result.killedId),0);assert.equal(await page.evaluate(()=>localStorage.getItem('citadel.preview.v8.1.original-world:sentinel')),'preserve');assert.equal(await page.evaluate(()=>localStorage.getItem('citadel.save')),'production-preserve');
 await page.getByRole('button',{name:'FPS',exact:true}).click();await page.waitForTimeout(650);assert.match(await page.locator('pre').innerText(),/FPS/);
 await page.setViewportSize({width:844,height:390});assert.equal(await page.evaluate(()=>__citadelTest.state().mode),'game');await page.getByRole('button',{name:'Map',exact:true}).click();assert.equal(await page.locator('dialog').evaluate(e=>e.open),true);await page.getByRole('button',{name:'Close map',exact:true}).click();
 assert.deepEqual(errors,[]);reports.push({engine:engine.name(),...result,persistence:true,saveIsolation:true,diagnostics:true,rotation:true,mapControls:true});await browser.close();
}
fs.writeFileSync('preview-8-2/dynamic-test-results.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));
