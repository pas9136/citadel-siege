// CPU submission benchmark, not physical-device FPS. Compare the v4 checkpoint with this checkout.
import { chromium, webkit } from 'playwright';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const current=await readFile(new URL('../index.html',import.meta.url),'utf8');
const checkpoint=execFileSync('git',['show','a92ad1b:index.html'],{encoding:'utf8'});
const paced=process.env.PACED==='1',combat=process.env.COMBAT==='1';
const baseline=execFileSync('git',['show','58fba72:index.html'],{encoding:'utf8'});
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{for(const [label,html] of [['v4',baseline],['checkpoint',checkpoint],['development',current]]){
  const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:2});
  await page.addInitScript(()=>{window.__nativeRAF=window.requestAnimationFrame;window.requestAnimationFrame=()=>1;let seed=19;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});
  await page.route('http://citadel.test/',r=>r.fulfill({contentType:'text/html',body:html}));
  await page.goto('http://citadel.test/');
  const result=await page.evaluate(async({paced,combat})=>{
   const t=window.__citadelTest;t.start();t.enemies().splice(0);if(combat){const s=t.state();s.p.hp=s.p.maxHp=s.base.hp=s.base.maxHp=1e9}
   for(let i=0;i<240;i++){t.spawn(['grunt','runner','brute','shaman','boss'][i%5]);const e=t.enemies().at(-1);e.x=(i%24-12)*20;e.y=100+Math.floor(i/24)*12;if(combat)e.hp=e.maxHp=1e9}
   for(let i=0;i<20;i++){t.frame();if(paced)await new Promise(window.__nativeRAF)}const samples=[],intervals=[];let previous=performance.now();
   for(let i=0;i<180;i++){if(paced)await new Promise(window.__nativeRAF);const start=performance.now();intervals.push(start-previous);previous=start;if(combat)t.update(1/60);t.frame();samples.push(performance.now()-start)}
   samples.sort((a,b)=>a-b);intervals.sort((a,b)=>a-b);return{paced,combat,intervalMedianMs:paced?intervals[90]:null,intervalP95Ms:paced?intervals[171]:null,enemies:t.enemies().length,medianMs:samples[90],p95Ms:samples[171]};
  },{paced,combat});console.log(name,label,JSON.stringify(result));await page.close();
 }}finally{await browser.close()}
}
