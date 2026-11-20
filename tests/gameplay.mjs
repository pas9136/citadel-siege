// Real-browser regressions. RAF is advanced explicitly, so results do not depend on CPU speed.
import assert from 'node:assert/strict';
import { navigationChecks } from './navigation.mjs';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium, webkit } = createRequire(import.meta.url)('playwright');
const html = await readFile(new URL('../index.html', import.meta.url));
const server = createServer((req,res) => {res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const url = `http://127.0.0.1:${server.address().port}`;
await mkdir(new URL('../test-results/',import.meta.url),{recursive:true});
let checks=0;
try {
 for (const engine of (process.env.BROWSERS || 'chromium,webkit').split(',')) {
  const browser = await ({chromium,webkit}[engine]).launch(engine==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  try {
   for (const [width,height] of [[320,568],[390,844],[430,932],[844,390],[1280,800]]) {
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:3,hasTouch:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(() => { window.__nativeRAF=window.requestAnimationFrame;window.requestAnimationFrame=()=>1; });
    await page.goto(url);
    assert.match(await page.title(),/v3\.0/);
    await page.locator('#startGame').tap();
    const initial=await page.evaluate(()=>{
     const t=window.__citadelTest,p=t.state().p,v=t.view();t.frame();
     return {v,p:{x:p.x,y:p.y},screen:t.worldToScreen(p.x,p.y),hud:document.querySelector('.hud').getBoundingClientRect().bottom,controls:document.querySelector('.skill-grid').getBoundingClientRect().top,canvas:document.querySelector('canvas').width};
    });
    assert.equal(initial.screen.x,initial.v.x);assert.equal(initial.screen.y,initial.v.y);
    assert.ok(initial.v.y>initial.hud+25 && initial.v.y<height-25,'hero visible below HUD');
    if(height>width)assert.ok(initial.v.y<initial.controls-25,'hero above touch controls');
    assert.equal(initial.canvas,width*2,'Retina backing store capped at 2x');
    // Input and rendering use inverse transforms at all mobile zoom levels.
    // Native WebKit touch events use integer CSS pixels.
    const point={x:Math.round(initial.v.x+60),y:Math.round(initial.v.y)};
    await page.touchscreen.tap(point.x,point.y);
    const travel=await page.evaluate(point=>{
     const t=window.__citadelTest,w=t.screenToWorld(point.x,point.y),dest={...t.destination()};
     let centered=true;
     for(let i=0;i<120;i++){t.update(1/60);const p=t.state().p,s=t.worldToScreen(p.x,p.y),v=t.view();centered&&=Math.abs(s.x-v.x)<.001&&Math.abs(s.y-v.y)<.001}
     t.frame();const p=t.state().p;return{dest,w,centered,p:{x:p.x,y:p.y},stopped:t.destination()===null};
    },point);
    assert.ok(Math.abs(travel.dest.x-travel.w.x)<1e-6);assert.ok(Math.abs(travel.dest.y-travel.w.y)<1e-6);
    assert.ok(travel.centered);assert.ok(travel.stopped);assert.ok(Math.hypot(travel.p.x-travel.dest.x,travel.p.y-travel.dest.y)<9);
    // A real pointer drag takes over tap-to-move; releasing cancels it without drift.
    await page.touchscreen.tap(point.x,point.y);
    const joy=await page.locator('#joystick').boundingBox();
    await page.mouse.move(joy.x+joy.width/2,joy.y+joy.height/2);await page.mouse.down();
    await page.mouse.move(joy.x+joy.width*.85,joy.y+joy.height/2);
    const joystick=await page.evaluate(()=>{const t=window.__citadelTest,x=t.state().p.x;for(let i=0;i<30;i++)t.update(1/60);return{dx:t.state().p.x-x,dest:t.destination()}});
    assert.ok(joystick.dx>20);assert.equal(joystick.dest,null);
    await page.mouse.up();
    assert.ok(await page.evaluate(()=>{const t=window.__citadelTest,x=t.state().p.x;t.update(1/60);return t.state().p.x===x}));
    // Secondary fingers cannot steal the joystick; OS cancellation releases it.
    const multi=await page.evaluate(()=>{
     const t=window.__citadelTest,j=document.querySelector('#joystick'),r=j.getBoundingClientRect();
     const send=(type,id,x)=>j.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:r.y+r.height/2,bubbles:true}));
     send('pointerdown',11,r.x+r.width*.85);send('pointerdown',12,r.x);
     const x=t.state().p.x;t.update(.1);const right=t.state().p.x>x;
     send('pointercancel',11,r.x);const stopped=t.state().p.x;t.update(.1);
     return right&&t.state().p.x===stopped;
    });assert.ok(multi);
    // No stale movement carries over into a new run.
    await page.touchscreen.tap(point.x,point.y);
    assert.ok(await page.evaluate(()=>{const t=window.__citadelTest;t.menu();t.start();const p=t.state().p,x=p.x,y=p.y;t.update(.1);return t.destination()===null&&p.x===x&&p.y===y}));
    // Talent/inventory overlays freeze gameplay and block keyboard abilities and waves.
    for(const overlay of ['talents','inventory']){
     await page.evaluate(overlay=>{const t=window.__citadelTest;t.start();if(overlay==='talents')t.openTalents();else t.inventory();t.state().p.hp-=100},overlay);
     await page.keyboard.press('1');await page.keyboard.press('5');await page.keyboard.press('b');
     const blocked=await page.evaluate(()=>{const t=window.__citadelTest,s=t.state(),before=s.elapsed;t.wave();t.update(.5);return{s:s.shop,wave:s.wave,cool:s.p.cooldowns[0],potions:s.p.potions,frozen:s.elapsed===before}});
     assert.deepEqual(blocked,{s:false,wave:0,cool:0,potions:2,frozen:true});
     await page.keyboard.press('Escape');
    }
    // Dash, death/respawn and boundary movement preserve the centered camera.
    const transitions=await page.evaluate(()=>{
     const t=window.__citadelTest;t.start('ranger');t.skill(1);const p=t.state().p;
     const aligned=()=>t.camera().x===p.x&&t.camera().y===p.y;
     const dash=aligned();p.x=869;p.y=869;window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));for(let i=0;i<60;i++)t.update(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{key:'d'}));const edge=p.x<=870&&aligned();
     p.hp=0;p.respawn=.01;t.update(.02);return{dash,edge,respawn:p.x===0&&p.y===154&&aligned()};
    });
    assert.deepEqual(transitions,{dash:true,edge:true,respawn:true});
    // Rotation recomputes the viewport and input transforms without moving the hero.
    await page.setViewportSize({width:height,height:width});
    assert.ok(await page.evaluate(()=>{const t=window.__citadelTest;t.resize();const p=t.state().p,v=t.view(),s=t.worldToScreen(p.x,p.y),w=t.screenToWorld(s.x,s.y);return s.x===v.x&&s.y===v.y&&Math.abs(w.x-p.x)<.001&&Math.abs(w.y-p.y)<.001}));
    await page.setViewportSize({width,height});
    await page.evaluate(()=>new Promise(resolve=>window.__nativeRAF(()=>{const t=window.__citadelTest;t.start();t.resize();t.frame();resolve()})));
    assert.ok(await page.evaluate(()=>document.querySelector('canvas').getContext('2d').getImageData(10,10,1,1).data[3]>0),'canvas rendered after rotation');
    await page.screenshot({path:new URL(`../test-results/${engine}-${width}x${height}.png`,import.meta.url).pathname});
    // Save/continue still restores progress from the same localStorage format.
    await page.evaluate(()=>{const t=window.__citadelTest;t.state().p.gold=777;t.menu()});await page.reload();await page.locator('#continueGame').tap();
    assert.equal(await page.evaluate(()=>window.__citadelTest.state().p.gold),777);
    assert.deepEqual(errors,[],`browser errors in ${engine} ${width}x${height}`);
    checks++;console.log(`PASS: ${engine} ${width}x${height} — controls, camera, zoom, overlays, respawn, saves`);
    await page.close();
   }
   const nav=await browser.newPage();await nav.addInitScript(()=>window.requestAnimationFrame=()=>1);await nav.goto(url);await navigationChecks(nav);await nav.close();
   const settings=await browser.newPage();await settings.goto(url);await settings.locator('#startGame').click();await settings.locator('#pauseButton').click();await settings.locator('#soundToggle').check();await settings.reload();assert.equal(await settings.evaluate(()=>localStorage.getItem('citadel.sound')),'true');assert.ok(await settings.locator('#legacyGoals').textContent());await settings.close();
   // Run the actual animation loop as well as deterministic simulation checks.
   const live=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
   const liveErrors=[];live.on('pageerror',e=>liveErrors.push(e.message));await live.goto(url);
   await live.locator('#startGame').tap();await live.locator('#nextWave').tap();
   await live.waitForFunction(()=>window.__citadelTest.state().elapsed>.5);
   assert.ok(await live.evaluate(()=>{const t=window.__citadelTest,s=t.state();return s.wave===1&&t.enemies().length>0&&t.camera().x===s.p.x&&t.camera().y===s.p.y}));
   assert.deepEqual(liveErrors,[]);await live.close();
  } finally { await browser.close(); }
 }
} finally { await new Promise(resolve=>server.close(resolve)); }
console.log(`PASS: ${checks} browser/viewport combinations`);
