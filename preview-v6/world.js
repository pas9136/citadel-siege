// Geometry, navigation and rendering share these floor rectangles (world units).
const fortress={left:-720,top:-2600,width:1440,height:3200,tile:40};
const floors=[[-320,-320,640,640],[-640,-120,1280,240],[-120,-520,240,1040],
 [-320,-1520,640,800],[-600,-1760,160,1200],[440,-1760,160,1200],
 [-600,-680,1200,120],[-600,-1760,1200,120],[-440,-1160,880,160],
 [-80,-1920,160,280],[-440,-2480,880,600]];
const shops=[{x:-400,y:0,name:'WEST'},{x:400,y:0,name:'EAST'},{x:0,y:-400,name:'NORTH'},{x:0,y:400,name:'SOUTH'}];
const gates=[{x:-440,y:-1160,w:120,h:160,stage:3},{x:320,y:-1160,w:120,h:160,stage:3},{x:-80,y:-1920,w:160,h:40,stage:1}];
const spawnPoints=[{x:-600,y:0},{x:600,y:0},{x:0,y:-480},{x:0,y:480}];
// Shops have paved alcoves and solid, yellow-roofed footprints.
for(const s of shops)floors.push([s.x-120,s.y-120,240,240]);
const floorAt=(x,y)=>floors.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h);
function gateClosed(g){return g.stage===3?(state?.stage??4)>=3:state?.stage===1||!(state?.seals?.every(Boolean))}
function rebuildFortress(){
 obstacles.length=0;navigationGrids.clear();assaultRoutes.clear();
 for(let y=fortress.top;y<600;y+=40)for(let x=-720;x<720;x+=40)if(!floorAt(x+20,y+20))obstacles.push({x,y,w:40,h:40});
 for(const s of shops)obstacles.push({x:s.x-30,y:s.y-28,w:60,h:56});
 for(const g of gates)if(gateClosed(g))obstacles.push({...g});
 indexObstacles();buildTerrain();
 if(typeof miniTerrain!=='undefined'){miniTerrain.getContext('2d').clearRect(0,0,154,170);miniTerrain.getContext('2d').drawImage(terrainCanvas,0,0,154,170)}
}
function paintFortress(){
 const g=terrainCanvas.getContext('2d');g.setTransform(1,0,0,1,720,2600);g.fillStyle='#101c23';g.fillRect(-720,-2600,1440,3200);
 for(let y=-2600;y<600;y+=40)for(let x=-720;x<720;x+=40){
  const floor=floorAt(x+20,y+20),n=Math.abs(Math.imul(x+901,y+2701))%5;
  g.fillStyle=floor?['#48585a','#4d5d5d','#536160','#4a585b','#505d60'][n]:'#233237';g.fillRect(x+1,y+1,38,38);
  if(floor){g.fillStyle='#a4aaa329';g.fillRect(x+3,y+2,34,2);g.fillStyle='#101e2855';g.fillRect(x+2,y+36,36,3)}
  else if([[40,0],[-40,0],[0,40],[0,-40]].some(([dx,dy])=>floorAt(x+20+dx,y+20+dy))){g.fillStyle='#89918a';g.fillRect(x+2,y+2,36,8);g.fillStyle='#0b121a88';g.fillRect(x+2,y+28,36,10);if((x+y)%120===0){const light=g.createRadialGradient(x+20,y+20,2,x+20,y+20,60);light.addColorStop(0,'#ffc66c70');light.addColorStop(1,'#ffb84800');g.fillStyle=light;g.fillRect(x-40,y-40,120,120);g.fillStyle='#ffcf81';g.fillRect(x+17,y+15,6,10)}}
 }
 // Inlaid arena borders and compass medallions are non-solid floor decoration.
 for(const [y,w,h] of [[-1120,560,720],[-2180,800,500]]){
  g.strokeStyle='#b89e6655';g.lineWidth=3;g.strokeRect(-w/2,y-h/2,w,h);
  for(const r of [100,116,130]){g.beginPath();g.arc(0,y,r,0,Math.PI*2);g.stroke()}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*45,y+Math.sin(a)*45);g.lineTo(Math.cos(a+.2)*100,y+Math.sin(a+.2)*100);g.lineTo(Math.cos(a)*130,y+Math.sin(a)*130);g.closePath();g.stroke()}
  g.fillStyle='#713d4544';g.fillRect(-45,y+140,90,70);
 }
 g.textAlign='center';g.font='bold 18px Georgia';g.fillStyle='#c6b587';
 for(const [label,y] of [['IV · DEFENSE COURT',260],['III · WARDEN’S HALL',-1400],['II · RAMPART WALK',-1685],['I · THE CITADEL THRONE',-2380]])g.fillText(label,0,y);
 for(const s of shops){g.fillStyle='#1a2023';g.fillRect(s.x-36,s.y-30,72,68);g.fillStyle='#ad873d';g.fillRect(s.x-30,s.y-28,60,56);g.fillStyle='#e5c764';g.beginPath();g.moveTo(s.x-38,s.y-20);g.lineTo(s.x,s.y-48);g.lineTo(s.x+38,s.y-20);g.closePath();g.fill();g.fillStyle='#342e25';g.fillRect(s.x-9,s.y+6,18,22);g.fillStyle='#ffe6a1';g.font='bold 11px system-ui';g.fillText(s.name+' SHOP',s.x,s.y+52)}
 for(const g0 of gates){g.fillStyle=gateClosed(g0)?'#b26e55':'#68a89b';g.fillRect(g0.x,g0.y,g0.w,g0.h);if(gateClosed(g0)){g.strokeStyle='#e9bc82';for(let x=g0.x+8;x<g0.x+g0.w;x+=16){g.beginPath();g.moveTo(x,g0.y);g.lineTo(x,g0.y+g0.h);g.stroke()}}}
 for(const [i,x] of [-520,520].entries()){g.strokeStyle='#9bdad3';g.lineWidth=3;g.beginPath();g.arc(x,-1680,25,0,7);g.stroke();g.fillStyle='#c4ece1';g.font='18px Georgia';g.fillText(i?'E':'W',x,-1674)}
 g.setTransform(1,0,0,1,0,0);
}
