import {test,expect} from 'playwright/test';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');
for(const hero of ['knight','mage','ranger'])test(`release states ${hero}`,async({page})=>{
 await page.setViewportSize({width:844,height:390});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;let seed=19;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});
 await page.route('http://citadel.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://citadel.test/');
 await page.evaluate(hero=>{const t=window.__citadelTest;t.start(hero);t.state().p.level=10;t.enemies().splice(0);t.spawn('overlord');const e=t.enemies().at(-1);e.x=100;e.y=180;e.telegraph={x:0,y:170,r:100,left:.7};t.spawn('grunt');const victim=t.enemies().at(-1);victim.x=-80;victim.y=180;t.damageEnemy(victim,1e6);t.skill(0);t.update(.12);t.state().expansion.buildings=[{kind:'arrow',pad:0,rank:2,hp:0,clock:0}];t.frame();document.querySelector('#toastArea').replaceChildren()},hero);
 await expect(page).toHaveScreenshot(`${hero}-combat.png`);
 await page.locator('#talentButton').tap();await expect(page).toHaveScreenshot(`${hero}-talents.png`);await page.locator('#closeTalent').tap();
 await page.locator('#shopButton').tap();await expect(page).toHaveScreenshot(`${hero}-shop.png`);await page.locator('#closeShop').tap();
 await page.locator('#pauseButton').tap();await expect(page).toHaveScreenshot(`${hero}-settings.png`);
 await expect(page.locator('#resumeGame')).toBeInViewport();await page.locator('#reduceFx').scrollIntoViewIfNeeded();await expect(page.locator('#reduceFx')).toBeInViewport();await page.locator('#resumeGame').tap();
 // Synthetic safe-area values exercise layout; they are not device emulation.
 await page.addStyleTag({content:':root{--safe-l:44px;--safe-r:44px;--safe-b:21px;--safe-t:0px}'});
 for(const selector of ['#joystick','.skill-grid']){const r=await page.locator(selector).boundingBox();expect(r.x).toBeGreaterThanOrEqual(44);expect(r.x+r.width).toBeLessThanOrEqual(800);expect(r.y+r.height).toBeLessThanOrEqual(390)}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{window.__citadelTest.resize();window.__citadelTest.frame()});
 await expect(page.locator('#pauseButton')).toBeVisible();expect(errors).toEqual([]);
});
