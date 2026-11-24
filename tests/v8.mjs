import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
for(const engine of process.env.CHROMIUM_ONLY?[chromium]:[chromium,webkit]){
 const browser=await engine.launch();
 for(const viewport of [{width:844,height:390},{width:390,height:844},{width:667,height:375}]){
 const page=await browser.newPage({viewport,isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.V8_URL||'http://localhost:8000/preview-8/');
 const results=await page.evaluate(()=>{
 const t=__citadelTest,checks=[];function check(x,m){if(!x)throw Error(m);checks.push(m)}
 localStorage.setItem('citadel.preview.v7.0:sentinel','preserved');
 t.start();const s=t.state(),p=s.p;p.hp=p.maxHp=1e7;s.base.hp=s.base.maxHp=1e7;
 check(s.prep===210,'regular countdown');check(t.origins.convert(0,-8704).y===0,'castle conversion');
 const travel=goal=>{const route=t.findPath(p,goal);check(route.length>0,'route exists');for(const step of route){check(t.clearSegment(p,step),'clear corridor');t.moveActor(p,step.x-p.x,step.y-p.y)}check(Math.hypot(p.x-goal.x,p.y-goal.y)<1,'arrived')};
 for(const shop of t.shops){travel({x:shop.x,y:shop.y+65});t.openShop();check(s.shop,'shop accessible');p.gold=5000;t.buy('might');t.buy('vigor');document.getElementById('closeShop').click()}
 travel({x:-400,y:65});t.openShop();p.gold=2000;const atk=p.attack;t.buy('originsBlade');check(s.origins.blade&&p.attack===atk+35&&p.gold===1100,'recipe');t.buy('originsBlade');check(p.gold===1100,'no duplicate legendary');document.getElementById('closeShop').click();
 for(const a of t.origins.arenas){const pos={x:p.x,y:p.y},gold=p.gold;check(t.origins.enter(a.id),'arena entry '+a.id);check(!t.origins.travel('castle'),'no escape teleport');for(let tick=0;tick<21;tick++)t.update(.1);check(t.hazards().length>0,'arena attacks '+a.id);t.frame();for(const e of [...t.enemies()])t.damageEnemy(e,1e10);t.update(.1);check(s.stage===4&&p.x===pos.x&&p.y===pos.y,'arena returns');check(s.origins.completed.includes(a.id)&&p.gold>=gold+a.reward,'unique reward');check(!t.origins.enter(a.id),'one time reward')}
 for(let wave=1;wave<=12;wave++){t.wave();check(s.wave===wave,'wave starts '+wave);check(s.planned===5+wave,'group formula');const lanes=new Set();for(let n=0;n<1000&&!s.preparing;n++){t.update(.1);for(const e of t.enemies()){lanes.add(e.lane);t.damageEnemy(e,1e10)}}check(s.preparing,'wave cleared');check(lanes.size===1&&lanes.has([0,2,1,3][(wave-1)%4]),'rotating direction')}
 check(s.stage===4&&!s.origins.final,'tower gate');t.wave();check(s.wave===12,'cannot skip tower objective');
 // Use actual auto attack against selected towers.
 for(const tower of t.towers()){p.x=tower.x;p.y=tower.y+45;t.selectTower(tower.id);p.attack=1e6;t.playerAuto();check(tower.hp===0,'tower auto attack')}
 t.update(.1);check(s.origins.final&&s.prep===30,'final countdown');t.update(29);check(s.wave===12,'countdown waits');t.update(1.1);check(s.wave===13,'separate final wave');for(let i=0;i<1000&&s.stage===4;i++){t.update(.1);for(const e of t.enemies())if(!e.major)t.damageEnemy(e,1e10)}check(s.stage===3,'central boss transition');t.damageEnemy(t.enemies().find(e=>e.major),1e10);t.update(.1);check(s.stage===2,'perimeter transition');
 for(const e of t.enemies())t.damageEnemy(e,1e10);travel({x:-520,y:-1680});t.update(.1);travel({x:520,y:-1680});t.update(.1);check(s.seals.every(Boolean),'perimeter objectives');t.writeSave();const saved=JSON.parse(localStorage.getItem('citadel.preview.v8.0.origins:citadel.laststand.save.v2'));check(saved.origins.completed.length===10&&saved.origins.blade,'progress saved');check(t.origins.travel('final'),'final teleport');t.damageEnemy(t.enemies().find(e=>e.major),1e10);t.update(.1);check(s.mode==='over','victory');t.load(saved);check(t.state().stage===2&&t.state().origins.completed.length===10,'restore');check(localStorage.getItem('citadel.preview.v7.0:sentinel')==='preserved','save isolation');return checks.length;
 });
 assert.deepEqual(errors,[]);console.log(engine.name(),viewport,results,'checks');await page.close();
 }
 await browser.close();
}
