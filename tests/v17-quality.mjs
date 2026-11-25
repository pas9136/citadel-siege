import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8000/preview-17/');
 await page.waitForFunction(()=>!!window.__citadelTest);
 assert.equal(await page.locator('#skill4').count(),1);
 for(let i=0;i<24;i++){
 const result=await page.evaluate(i=>{const t=window.__citadelTest;t.choose92(i);let s=t.state(),p=s.p;p.level=15;s.expansion.skills=[3,3,3,3,3];let checks=[];for(let j=0;j<5;j++){p.mana=1000;p.cooldowns[j]=0;let before=t.allies92().length;t.spawn('grunt');t.skill(j);let k=t.kits91[i].skills[j];checks.push({name:k.title,kind:k.kind,created:t.allies92().length-before,cooldown:p.cooldowns[j]});t.update(.016)}return {hp:p.hp,checks}},i);
 assert.ok(Number.isFinite(result.hp));
 for(const k of result.checks){if(k.kind==='summon')assert.ok(k.created>0,k.name+' failed to summon');assert.ok(Number.isFinite(k.cooldown),k.name);}
 console.log(engine.name(),i,result.checks.map(k=>k.name).join(', '));
 }
 await page.evaluate(()=>{const t=window.__citadelTest;t.choose92(0);t.enterStage111(3);const hp=t.state().base.hp;t.hitBase111(999999);if(t.state().base.hp!==hp)throw Error('Castle damaged after defense');t.frame();});
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
}
