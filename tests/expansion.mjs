import assert from 'node:assert/strict';
export async function expansionChecks(page){
 const result=await page.evaluate(()=>{
  const t=window.__citadelTest,fail=[];const check=(v,m)=>{if(!v)fail.push(m)};
  localStorage.setItem('citadel.legacy.v4','{}');t.start();t.inventory();let s=t.state(),p=s.p,e=s.expansion;p.gold=100000;e.wood=10000;
  for(const kind of ['guard','archer','mage','healer'])check(t.command('recruit',kind),'recruit '+kind);
  for(let i=0;i<8;i++)t.command('recruit','guard');check(e.army.length===8&&!t.command('recruit','guard'),'roster cap');
  for(let i=0;i<8;i++)t.command('unit','0');check(e.army[0].rank===5,'unit cap');
  for(const key of ['0:arrow','1:frost','2:barricade','3:arrow'])check(t.command('build',key),'build '+key);
  const gold=p.gold;check(!t.command('build','0:arrow')&&!t.command('build','9:arrow')&&gold===p.gold,'placement validation');
  const paths=t.findPath({x:0,y:154},{x:0,y:700});check(paths.length>0,'construction blocked exit');
  e.buildings[0].hp=0;check(t.command('repair','0')&&e.buildings[0].hp===250,'repair');check(t.command('upgrade','0')&&e.buildings[0].rank===2,'tower upgrade');
  check(!t.command('spec','1'),'early specialization');p.level=5;check(t.command('spec','1')&&!t.command('spec','2'),'exclusive specialization');
  p.talentPoints=10;for(let i=0;i<5;i++)t.command('skill','0');check(e.skills[0]===3&&p.talentPoints===7,'skill upgrade cap');
  s.inventoryOpen=false;t.spawn('grunt');let enemy=t.enemies()[0];enemy.x=30;enemy.y=154;enemy.hp=100000;enemy.maxHp=100000;const hp=enemy.hp;t.updateExpansion(1);check(enemy.hp<hp,'allied damage');
  p.hp=10;e.army[3].clock=0;t.updateExpansion(1);check(p.hp>10,'healer');
  t.spawn('boss');const boss=t.enemies().at(-1);boss.x=0;boss.y=200;boss.specialClock=0;t.updateExpansion(.01);check(boss.telegraph?.left===1.3,'boss warning');const before=p.hp;t.updateExpansion(.5);check(p.hp===before,'early boss damage');p.x=300;t.updateExpansion(.9);check(p.hp>=before&&!boss.telegraph,'dodge');boss.hp=boss.maxHp*.4;t.updateExpansion(.1);check(boss.phase===2,'boss phase');
  p.x=0;p.hp=p.maxHp;boss.specialClock=0;t.updateExpansion(.01);t.updateExpansion(1.4);check(p.hp<p.maxHp,'boss impact');
  s.wave=5;s.preparing=false;t.finishWave();check(t.legacy().points===5,'legacy reward');s.preparing=false;t.finishWave();check(t.legacy().points===5,'duplicate reward');s.inventoryOpen=true;check(t.command('legacy','power'),'permanent purchase');
  t.writeSave();const save=JSON.parse(localStorage.getItem('citadel.laststand.save.v2'));check(save.schema===5&&!('path' in save.expansion.army[0]),'durable schema');const attack=t.heroStat('attack');t.load(save);check(t.state().expansion.army.length===8&&t.heroStat('attack')===attack,'roundtrip');t.load(save);check(t.heroStat('attack')===attack,'reload inflation');
  t.start();check(t.state().expansion.army.length===0&&t.legacy().power===1&&t.heroStat('attack')>t.state().p.attack,'new run legacy');
  const bad=t.restoreExpansion({wood:-5,army:[null,{kind:'__proto__'},{kind:'guard',rank:Infinity,hp:-5}],buildings:[null,{kind:'arrow',pad:0},{kind:'frost',pad:0},{kind:'arrow',pad:99}],spec:999,skills:[NaN,-1,Infinity,9]});check(bad.army.length===1&&bad.army[0].hp===0&&bad.buildings.length===1&&bad.wood===0,'corrupt save validation');
  localStorage.setItem('citadel.legacy.v4','{}');t.load({hero:'knight',wave:7,attack:83,gold:1234,schema:3});check(t.heroStat('attack')===83&&t.state().p.gold===1234&&t.state().expansion.army.length===0,'v3 migration');
  // Each class gets its defense/control specialization without mutating base stats.
  for(const hero of ['knight','mage','ranger']){t.start(hero);const q=t.state();q.p.level=5;t.inventory();check(t.command('spec','2'),'class spec '+hero);q.inventoryOpen=false;if(hero==='knight')check(t.heroStat('armor')===q.p.armor+.08,'guardian defense');if(hero==='ranger')check(t.heroStat('speed')===q.p.speed+35,'ranger mobility');if(hero==='mage'){t.skill(1);check(q.p.cooldowns[1]>0,'mage ability');const cooldown=q.p.cooldowns[1];q.p.cooldowns[1]=0;q.expansion.spec=0;t.skill(1);check(Math.abs(cooldown/q.p.cooldowns[1]-.8)<.001,'mage cooldown')}}
  // Construction never invalidates existing traversable assault corridors, including after removal.
  t.start();t.inventory();t.state().p.gold=100000;t.state().expansion.wood=1000;
  for(let pad=0;pad<4;pad++){t.command('build',pad+':barricade');for(const goal of [{x:0,y:700},{x:0,y:-700},{x:700,y:185},{x:-700,y:185}]){const path=t.findPath({x:0,y:154},goal);check(path.length>0&&path.every(n=>t.walkable(n.x,n.y)),'build route')}}
  check(t.command('remove','0')&&t.state().expansion.buildings.length===3,'remove structure');
  // Stress a late-wave battle for 120 simulated seconds. Fixed budgets bound entity work.
  t.start();s=t.state();s.prep=99999;s.p.maxHp=s.p.hp=1e9;s.base.maxHp=s.base.hp=1e9;s.inventoryOpen=true;s.p.gold=100000;
  for(let i=0;i<8;i++)t.command('recruit','archer');s.inventoryOpen=false;for(let i=0;i<240;i++)t.spawn('grunt');const begin=performance.now();for(let i=0;i<7200;i++)t.update(1/60);const ms=performance.now()-begin;t.frame();check(Number.isFinite(s.p.hp)&&s.expansion.army.length===8&&t.enemies().length<=240&&t.hostileShots().length<=45,'stress bounds');
  return{fail,ms};
 });assert.deepEqual(result.fail,[]);assert.ok(result.ms<30000,`120s simulation took ${result.ms}ms`);
 for(const viewport of [{width:320,height:568},{width:844,height:390}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>{const t=window.__citadelTest;t.start();t.inventory()});
  const recruit=page.locator('[data-command="recruit"]').first();await recruit.scrollIntoViewIfNeeded();await recruit.click();assert.equal(await page.evaluate(()=>window.__citadelTest.state().expansion.army.length),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
 }
 console.log(`PASS: expansion — army, construction, bosses, specialization, legacy, schema 3/5, corrupted saves, mobile UI; 120s stress ${Math.round(result.ms)}ms`);
}
