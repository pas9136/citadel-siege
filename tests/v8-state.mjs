import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
for(const engine of process.env.CHROMIUM_ONLY?[chromium]:[chromium,webkit]){
 const b=await engine.launch(),p=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.V8_URL||'http://localhost:8000/preview-8/');
 console.log(engine.name(),await p.evaluate(()=>{const t=__citadelTest;let n=0;const check=(v,m)=>{if(!v)throw Error(m);n++};let prev=0;for(let d=0;d<4;d++){document.querySelector('#difficulty8').value=d;t.start();const s=t.state();t.wave();t.spawn('grunt');const hp=t.enemies().at(-1).maxHp;check(hp>prev,'difficulty scaling');prev=hp;t.writeSave();const save=JSON.parse(localStorage.getItem('citadel.preview.v8.0.origins:citadel.laststand.save.v2'));t.load(save);check(t.state().origins.difficulty===d,'difficulty persists')}
 t.start();let s=t.state();check(t.origins.enter('ice'),'enter ice');t.origins.leave(false);check(!s.origins.completed.includes('ice'),'retreat no reward');check(t.origins.enter('ice'),'retry');t.hitHero(1e9);t.update(.1);check(s.stage===4&&s.p.hp>0&&!s.origins.completed.includes('ice'),'defeat returns safely');
 s.kills=19;t.spawn('grunt');let gold=s.p.gold;t.damageEnemy(t.enemies().at(-1),1e8);check(s.origins.milestones===1&&s.p.gold>=gold+100,'kill milestone');
 s.prep=210;s.paused=true;t.update(10);check(s.prep===210,'pause freezes timer');s.paused=false;
 t.writeSave();const save=JSON.parse(localStorage.getItem('citadel.preview.v8.0.origins:citadel.laststand.save.v2'));t.load(save);check(t.state().origins.milestones===1,'milestone survives reload');return n+' state checks'}));
 await p.locator('#portal8').click();assert.equal(await p.locator('#originsMenu').isVisible(),true);await p.locator('#closeOrigins').click();await p.setViewportSize({width:390,height:844});await p.setViewportSize({width:844,height:390});await p.reload();await p.locator('#continueGame').click();assert.equal(await p.evaluate(()=>__citadelTest.state().mode),'game');assert.deepEqual(errors,[]);await b.close();
}
