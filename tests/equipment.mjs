import assert from 'node:assert/strict';
export async function equipmentChecks(page){
 const result=await page.evaluate(()=>{
  const t=window.__citadelTest,fail=[];const check=(v,m)=>{if(!v)fail.push(m)};
  t.start();const s=t.state(),p=s.p,base=p.attack;
  const make=(id,slot,rarity=2)=>({id,slot,rarity,level:5,rank:0,roll:1,set:'dawn'});
  s.gear.bag=[make(1,'weapon'),make(2,'armor'),make(3,'boots'),make(4,'ring',4),make(5,'helmet'),make(6,'artifact')];s.gear.nextId=7;
  check(!t.manageGear('equip',1),'actions allowed outside inventory');t.inventory();
  for(let i=1;i<=6;i++)check(t.manageGear('equip',i),'equip slot '+i);
  check(t.heroStat('attack')>base&&t.heroStat('armor')>p.armor&&t.heroStat('speed')>p.speed,'stats not applied');
  check(!t.manageGear('sell',1),'sold equipped item');
  p.gold=10000;const old=t.heroStat('attack');check(t.manageGear('upgrade',1)&&t.heroStat('attack')>old&&p.gold<10000,'upgrade');
  for(let i=0;i<20;i++)t.manageGear('upgrade',1);check(s.gear.bag[0].rank<=10,'rank cap');
  check(t.manageGear('unequip',1),'unequip');const gold=p.gold;check(t.manageGear('sell',1)&&p.gold>gold,'sell');
  check(t.manageGear('equip',6),'artifact equip');
  // Actual melee damage uses effective gear stats, not the base-stat field.
  t.spawn('grunt');const e=t.enemies()[0];e.x=p.x+30;e.y=p.y;e.hp=1e6;e.maxHp=1e6;e.speed=0;
  const hp=e.hp,attack=t.heroStat('attack');t.playerAuto();check(Math.abs(hp-e.hp-Math.round(attack))<1,'combat ignores gear');
  p.hp=p.maxHp;const before=p.hp;t.hitHero(100);check(Math.abs(before-p.hp-100*Math.max(.4,1-t.heroStat('armor')))<.001,'defense ignored');
  const injured=p.hp;t.damageEnemy(e,1e7);check(p.hp>injured,'legendary recovery ignored');
  const count=s.gear.bag.length;t.dropGear(true);check(s.gear.bag.length===count+1&&s.gear.bag.at(-1).rarity>=2,'boss loot');
  while(s.gear.bag.length<40)t.dropGear(true);const fullGold=p.gold;t.dropGear(true);check(s.gear.bag.length===40&&p.gold>fullGold,'overflow conversion');
  const clean=t.restoreGear({bag:[null,{},make(1,'weapon'),make(1,'ring'),make(2,'<bad>'),{...make(3,'armor'),rank:Infinity,roll:-99}],equipped:{weapon:1,ring:1}});
  check(clean.bag.length===2&&clean.equipped.weapon===1&&!clean.equipped.ring&&clean.bag[1].rank===0,'invalid gear sanitization');
  t.writeSave();return {fail,gear:JSON.parse(JSON.stringify(s.gear)),attack:p.attack,effective:t.heroStat('attack')};
 });
 assert.deepEqual(result.fail,[]);
 await page.reload();await page.locator('#continueGame').click();
 const after=await page.evaluate(()=>{const t=window.__citadelTest;return {gear:t.state().gear,attack:t.state().p.attack,effective:t.heroStat('attack')}});
 assert.deepEqual(after.gear,result.gear);assert.equal(after.attack,result.attack);assert.equal(after.effective,result.effective);
 await page.locator('#inventoryButton').click();
 await page.locator('[data-gear="unequip"]').first().click();
 assert.ok(await page.locator('[data-gear="equip"]').count()>0);
 // Existing v3 progress (no expansion fields) must load with empty gear and identical base stats.
 await page.evaluate(()=>{window.__citadelTest.menu();const key='citadel.laststand.save.v2',save=JSON.parse(localStorage.getItem(key));delete save.gear;delete save.schema;save.gold=12345;save.attack=83;localStorage.setItem(key,JSON.stringify(save))});
 await page.reload();await page.locator('#continueGame').click();
 assert.deepEqual(await page.evaluate(()=>{const t=window.__citadelTest;return [t.state().p.gold,t.heroStat('attack'),t.state().gear.bag.length]}),[12345,83,0]);
 await page.evaluate(()=>window.__citadelTest.start());assert.equal(await page.evaluate(()=>window.__citadelTest.state().gear.bag.length),0);
 console.log('PASS: equipment — six slots, combat stats, recovery, upgrades, sales, boss loot, overflow, sanitization, save migration, UI actions');
}
