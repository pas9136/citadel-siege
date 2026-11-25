import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8000/preview-9-beta/');
await page.waitForFunction(()=>!!window.__citadelTest);
assert.equal(await page.locator('#skill4').count(),1);
for(let i=0;i<24;i++){
await page.reload();await page.waitForFunction(()=>!!window.__citadelTest);
const result=await page.evaluate(i=>{const t=window.__citadelTest;document.querySelectorAll('#heroCards button')[i].click();t.start(t.roster90[i][0]);let p=t.state().p;p.level=10;for(let j=0;j<5;j++){p.mana=1000;p.cooldowns[j]=0;t.spawn('grunt');t.skill(j);t.update(.016)}return {name:t.heroDefs[t.state().hero].name,hp:p.hp,skills:t.kits91[i].skills.length}},i);
assert.equal(result.skills,5);assert.ok(Number.isFinite(result.hp));console.log(i,result.name);
}
assert.deepEqual(errors,[]);
} finally {await browser.close()}
