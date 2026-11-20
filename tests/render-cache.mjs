// Verify renderer caches survive repeated frames and viewport/DPR changes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{for(const dpr of [1,1.5,2,3]){
  const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:dpr});
  await page.addInitScript(()=>window.requestAnimationFrame=()=>1);
  await page.route('http://citadel.test/',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto('http://citadel.test/');
  const result=await page.evaluate(()=>{
   const t=window.__citadelTest;t.start();t.enemies().splice(0);
   const kinds=Object.keys(t.types());for(let i=0;i<240;i++){t.spawn(kinds[i%kinds.length]);const e=t.enemies().at(-1);e.x=(i%24-12)*20;e.y=100+Math.floor(i/24)*12}
   t.frame();const before=JSON.stringify(t.state());let canvases=0,gradients=0;
   const create=document.createElement.bind(document);document.createElement=(tag,...args)=>{if(tag==='canvas')canvases++;return create(tag,...args)};
   const proto=CanvasRenderingContext2D.prototype,gradient=proto.createLinearGradient;
   proto.createLinearGradient=function(...args){gradients++;return gradient.apply(this,args)};
   for(let i=0;i<10;i++)t.frame();
   const canvas=document.querySelector('#canvas'),width=canvas.width;
   const pixels=canvas.getContext('2d').getImageData(0,0,1,1).data[3];t.resize();
   return{canvases,gradients,unchanged:before===JSON.stringify(t.state()),width,preserved:pixels===canvas.getContext('2d').getImageData(0,0,1,1).data[3]};
  });
  assert.deepEqual(result,{canvases:0,gradients:0,unchanged:true,width:Math.floor(844*Math.min(2,dpr)),preserved:true});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{window.__citadelTest.resize();window.__citadelTest.frame()});
  assert.equal(await page.locator('#canvas').evaluate(c=>c.width),Math.floor(390*Math.min(2,dpr)));
  console.log(`PASS: ${name} DPR ${dpr}: 240 enemies, steady caches, state isolation, resize`);await page.close();
 }}finally{await browser.close()}
}
