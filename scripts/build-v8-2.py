"""Build 8.2 additively from the published, immutable 8.1 HTML."""
from pathlib import Path
p=Path(__file__).resolve().parent.parent
s=(p/'preview-8-1/index.html').read_text().replace('v8.1.original-world:', 'v8.2.dynamic-world:').replace('8.1 — ORIGINAL WORLD','8.2 — LIVING FORTRESS')
s=s.replace('ВЕРСИЯ 7.0 — HEROES AT WAR','ВЕРСИЯ 8.2 — LIVING FORTRESS')
s=s.replace('schema:8,origins:', 'schema:8,dynamic82:serialize82(),origins:')
# Dynamic occupancy is separate from the verified WPM bytes.
s=s.replace('!!(pathFlags[(world.height-1-r)*world.width+c]&2)', '!!(pathFlags[(world.height-1-r)*world.width+c]&2)||!!dynamicCells82[r*world.width+c]')
s=s.replace('const world=ORIGINAL_WORLD;', 'const dynamicCells82=new Uint16Array(384*896);\nconst world=ORIGINAL_WORLD;')
# Pools acquire at the allocation sites, release only after all death callbacks finish.
for array,pool in [('enemies','actorPool82'),('projectiles','shotPool82'),('hostileShots','shotPool82')]:
 token=array+'.push({'
 start=0
 while True:
  a=s.find(token,start)
  if a<0:break
  b=a+len(token)-1; depth=1;end=b+1
  while depth:
   if s[end]=='{':depth+=1
   elif s[end]=='}':depth-=1
   end+=1
  s=s[:a]+array+'.push('+pool+'.take('+s[b:end]+')'+s[end:]
  start=end+len(pool)+12
 s=s.replace(array+'.splice(j,1)',pool+'.release('+array+'.splice(j,1)[0])')
s=s.replace('projectiles.shift()', 'shotPool82.release(projectiles.shift())')
s=s.replace('enemies=enemies.filter(e=>!e.dead)', 'enemies=enemies.filter(e=>{if(e.dead){actorPool82.release(e);return false}return true})')
s=s.replace('drawWorldChunks(left,top,right,bottom);','drawWorldChunks(left,top,right,bottom);drawDynamic82(left,top,right,bottom);')
s=s.replace("drawStructure(s.x,s.y,'keep')", "drawStructure(s.x,s.y,'shop')")
a=s.index(' for(const p of referenceStructures)');b=s.index(' for(let row=',a);s=s[:a]+s[b:]
# Terrain art must remain static; runtime obstacles have their own render layer.
a=s.index('function terrainChunk(');b=s.index('function drawWorldChunks(',a)
s=s[:a]+s[a:b].replace('blockedCell(', 'staticBlocked82(')+s[b:]
s=s.replace("ctx.fillStyle='#8c928366';ctx.fillRect(p.x-3,p.y-5,6,10)", "drawEnvironment82(p.x,p.y)")
s=s.replace('window.__citadelTest={', 'window.__citadelTest={dynamicCells82,staticBlocked82,fireProjectile,shots82:()=>projectiles,')
s=s.replace('window.__citadelTest={', (p/'preview-8-2/dynamic.js').read_text()+'\n'+(p/'preview-8-2/art.js').read_text()+'\nwindow.__citadelTest={dynamic82:{objects:()=>objects82,refresh:refresh82,setGate:setGate82,damage:damageObject82,revision:()=>navRevision82,pools:()=>poolStats82(),serialize:serialize82},')
s=s.replace('<script src="world-data.js"></script>', '<script src="world-data.js"></script>\n<script src="gates-data.js"></script>')
(p/'preview-8-2/index.html').write_text(s)
assert (p/'preview-8-2/world-data.js').read_bytes()==(p/'preview-8-1/world-data.js').read_bytes()
print('Built isolated 8.2; original WPM data preserved byte-for-byte')
