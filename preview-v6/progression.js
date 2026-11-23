const originalCreate=createGame, originalFinish=finishWave, originalWave=startWave, originalUpdate=update, originalUI=updateUI, originalShop=openShop;
const defeatTitle=$('gameOver').querySelector('h2').textContent;
function enterStage(stage){
 state.stage=stage;state.preparing=false;state.toSpawn=0;state.stageBoss=false;enemies=[];hostileShots=[];projectiles=[];traps=[];clearMovement();
 state.p.x=0;state.p.y=stage===3?-820:stage===1?-2000:state.p.y;state.p.hp=state.p.maxHp;
 for(const u of state.expansion.army){u.x=state.p.x;u.y=state.p.y;u.path=[]}
 rebuildFortress();syncCamera();
 if(stage===3||stage===1){spawnEnemy(stage===3?'boss':'overlord');const b=enemies.at(-1);b.x=0;b.y=stage===3?-1280:-2280;b.homeX=b.x;b.homeY=b.y;b.campId=-1;b.path=[];b.hp=b.maxHp=stage===3?2200:5500;b.attack=stage===3?42:68;b.speed=stage===3?58:65;b.major=true;state.stageBoss=true}
 showBanner('ZONE '+stage,stage===3?'DEFEAT THE WARDEN':stage===2?'ACTIVATE BOTH RAMPART SEALS':'DEFEAT THE SIEGE LORD');writeSave();updateUI();
}
createGame=function(hero,save){originalCreate(hero,save);$('gameOver').querySelector('h2').textContent=defeatTitle;state.stage=4;state.seals=[false,false];state.stageBoss=false;supplyCaches=[];enemies=[];state.wave=Math.min(4,state.wave);rebuildFortress();if(save?.stage&&save.stage!==4){state.seals=save.seals||[false,false];enterStage(save.stage);if(save.stage===2&&save.position&&walkable(save.position.x,save.position.y)){Object.assign(state.p,save.position);syncCamera()}}updateUI();writeSave()};
startWave=function(){if(state?.stage!==4)return;originalWave();if(!state.preparing){state.planned=state.toSpawn=12+state.wave*4;state.spawnSerial=0}};
finishWave=function(){if(state?.stage!==4)return;if(state.toSpawn>0||enemies.some(e=>!e.dead))return;originalFinish();if(state.wave>=4)enterStage(3)};
spawnEnemy=function(force){if(enemies.length>=100)return false;const i=(state.spawnSerial??0)%4;state.spawnSerial=(state.spawnSerial??0)+1;const pos=spawnPoints[i],kind=force||(state.wave>=3&&i===2?'brute':state.wave>=2&&i===1?'runner':'grunt'),t=types[kind],power=1+state.wave*.18;
 enemies.push({id:++uid,kind,...pos,lane:i,hp:t.hp*power,maxHp:t.hp*power,speed:t.speed,attack:t.attack*(1+state.wave*.06),timer:1,size:t.size,slow:0,freeze:0,dead:false,hit:0,attackType:t.interval,path:findPath(pos,{x:0,y:0},t.size),pathIndex:0});return true};
openShop=function(){if(!state)return;const near=shops.find(s=>dist(s.x,s.y,state.p.x,state.p.y)<120);if(!near){toast('Подойди к жёлтой лавке · Approach a yellow item shop');return}originalShop();$('shopOverlay').querySelector('h2').textContent=near.name+' · ITEM SHOP'};
updateUI=function(){originalUI();if(!state)return;$('waveNum').textContent=state.stage===4?state.wave+'/4':'ZONE '+state.stage;$('prepControls').classList.toggle('hidden',state.stage!==4||!state.preparing);$('objective6').textContent=state.stage===4?'IV · DEFEND 4 WAVES · SHOPS AT YELLOW ROOFS':state.stage===3?'III · DEFEAT THE WARDEN':state.stage===2?'II · RAMPART SEALS '+state.seals.filter(Boolean).length+'/2 · THEN NORTH':'I · DEFEAT THE SIEGE LORD'};
update=function(dt){const active=state?.mode==='game'&&!state.paused&&!state.shop&&!state.talentsOpen&&!state.inventoryOpen;if(!active)return;originalUpdate(dt);if(state.mode!=='game')return;
 if(state.stage!==4&&state.p.hp<=0&&state.p.respawn<=dt){state.p.x=0;state.p.y=state.stage===1?-2000:-820}
 if(state.stageBoss&&!enemies.some(e=>e.major&&!e.dead)){state.stageBoss=false;if(state.stage===3)enterStage(2);else{endGame();$('gameOver').querySelector('h2').textContent='CITADEL LIBERATED';$('recordText').textContent='6.0 · All four zones completed';return}}
 if(state.stage===2){for(const [i,x] of [-520,520].entries())if(!state.seals[i]&&dist(state.p.x,state.p.y,x,-1680)<65){state.seals[i]=true;toast('Rampart seal activated');rebuildFortress();writeSave()}if(state.seals.every(Boolean)&&state.p.y<-1940)enterStage(1)}
};
const objective=document.createElement('div');objective.id='objective6';objective.style.cssText='position:fixed;bottom:max(8px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);font:10px system-ui;color:#e9d39d;pointer-events:none;white-space:nowrap;z-index:3;text-shadow:0 2px 3px #000';$('ui').appendChild(objective);
rebuildFortress();
