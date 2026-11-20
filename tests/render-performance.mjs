// CPU submission benchmark, not physical-device FPS. Compare the v4 checkpoint with this checkout.
import { chromium, webkit } from 'playwright';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const current=await readFile(new URL('../index.html',import.meta.url),'utf8');
const baseline=execFileSync('git',['show','58fba72:index.html'],{encoding:'utf8'});
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{for(const [label,html] of [['v4',baseline],['development',current]]){
  const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:2});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>1});
  await page.route('http://citadel.test/',r=>r.fulfill({contentType:'text/html',body:html}));
  await page.goto('http://citadel.test/');
  const result=await page.evaluate(()=>{
   const t=window.__citadelTest;t.start();t.enemies().splice(0);
   for(let i=0;i<240;i++){t.spawn(['grunt','runner','brute','shaman','boss'][i%5]);const e=t.enemies().at(-1);e.x=(i%24-12)*20;e.y=100+Math.floor(i/24)*12}
   for(let i=0;i<20;i++)t.frame();const samples=[];
   for(let i=0;i<180;i++){const start=performance.now();t.frame();samples.push(performance.now()-start)}
   samples.sort((a,b)=>a-b);return{enemies:t.enemies().length,medianMs:samples[90],p95Ms:samples[171]};
  });console.log(name,label,JSON.stringify(result));await page.close();
 }}finally{await browser.close()}
}
