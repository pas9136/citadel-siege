import { test, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';
const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');
for(const [width,height] of [[667,375],[844,390],[932,430]]){
 test(`presentation ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.addInitScript(()=>{
   window.requestAnimationFrame=()=>1;
   let seed=19;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  });
  await page.route('http://citadel.test/',route=>route.fulfill({contentType:'text/html',body:html}));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://citadel.test/');
  await expect(page).toHaveScreenshot(`menu-${width}.png`);
  await page.locator('#startGame').tap();
  await page.evaluate(()=>{
   const t=window.__citadelTest,s=t.state();
   document.querySelector('#toastArea').replaceChildren();
   s.expansion.army=['guard','archer','mage','healer'].map((kind,i)=>({kind,rank:1,hp:100,x:-100+i*60,y:200,clock:0}));
   s.expansion.buildings=[{kind:'arrow',pad:0,rank:2,hp:500,clock:0},{kind:'frost',pad:1,rank:3,hp:750,clock:0}];
   t.enemies().splice(0);
   ['grunt','runner','brute','shaman','guardian','boss','overlord'].forEach((kind,i)=>{
    t.spawn(kind);const e=t.enemies().at(-1);e.x=-220+i*70;e.y=70;e.path=[];
   });
   t.frame();
  });
  await expect(page).toHaveScreenshot(`battlefield-${width}.png`);
  const controls=await page.locator('#joystick, .skill-grid, .hud').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));
  for(const r of controls){expect(r.x).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(width);expect(r.bottom).toBeLessThanOrEqual(height)}
  const overlap=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
  expect(overlap(controls[0],controls[1])).toBe(false);
  await page.locator('#inventoryButton').tap();
  await expect(page).toHaveScreenshot(`inventory-${width}.png`);
  expect(errors).toEqual([]);
 });
}
