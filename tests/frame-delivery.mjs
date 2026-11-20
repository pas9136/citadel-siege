// Real production RAF loop, no manual update/draw. Host diagnostic, not an iPhone claim.
import {chromium,webkit} from 'playwright';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const [engineName,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true});
 await page.addInitScript(()=>{let seed=19;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});
 await page.route('http://citadel.test/',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto('http://citadel.test/');
 await page.evaluate(()=>{const t=window.__citadelTest;t.start();const s=t.state();s.p.hp=s.p.maxHp=s.base.hp=s.base.maxHp=1e9;t.enemies().splice(0);for(let i=0;i<240;i++){t.spawn(['grunt','runner','brute','shaman','boss'][i%5]);const e=t.enemies().at(-1);e.x=(i%24-12)*20;e.y=100+Math.floor(i/24)*12;e.hp=e.maxHp=1e9}});
 await page.waitForTimeout(8000);
 const result=await page.evaluate(()=>new Promise(resolve=>{let start,last;const samples=[];function record(now){start??=now;if(last)samples.push(now-last);last=now;if(now-start<15000)requestAnimationFrame(record);else{samples.sort((a,b)=>a-b);resolve({samples:samples.length,medianMs:samples[Math.floor(samples.length*.5)],p95Ms:samples[Math.floor(samples.length*.95)],over33ms:samples.filter(x=>x>33.4).length/samples.length,quality:window.__citadelTest.graphics(),enemies:window.__citadelTest.enemies().length})}}requestAnimationFrame(record)}));
 console.log(JSON.stringify({engine:engineName,...result}));await page.screenshot({path:`test-results/frame-delivery-${engineName}.png`});
 }finally{await browser.close()}
}
