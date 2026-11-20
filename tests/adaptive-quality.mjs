import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
 const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:3,hasTouch:true});
 await page.addInitScript(()=>window.requestAnimationFrame=()=>1);
 await page.route('http://citadel.test/',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto('http://citadel.test/');
 const r=await page.evaluate(()=>{
  const t=window.__citadelTest;t.start();const before=JSON.stringify(t.state());
  const feed=(n,ms)=>{for(let i=0;i<n;i++)t.sampleFrame(ms)};
  feed(60,40);const medium=t.graphics();feed(60,40);const low=t.graphics();
  const geometry=t.view();t.resize();const afterResize=t.graphics();
  // Isolated stalls and pause must not trigger recovery or downgrade.
  feed(30,1000);t.state().paused=true;feed(300,16.67);const paused=t.graphics();t.state().paused=false;
  feed(121,16.67);const brief=t.graphics();feed(730,16.67);const recovered=t.graphics();
  const unchanged=before===JSON.stringify(t.state());
  return{medium,low,afterResize,paused,brief,recovered,unchanged,geometrySame:JSON.stringify(geometry)===JSON.stringify(t.view()),width:document.querySelector('#canvas').width};
 });
 assert.equal(r.medium.dpr,1.5);assert.equal(r.low.dpr,1);assert.equal(r.afterResize.dpr,1);assert.equal(r.paused.level,2);assert.equal(r.brief.level,2);assert.equal(r.recovered.level,1);assert.equal(r.unchanged,true);assert.equal(r.geometrySame,true);assert.equal(r.width,1266);
 console.log(`PASS: ${name}: frame delivery adaptation, hysteresis, pause/stall exclusion, resize, simulation isolation`);
 }finally{await browser.close()}
}
