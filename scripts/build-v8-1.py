from pathlib import Path
p=Path(__file__).resolve().parent.parent
s=(p/'preview-8/index.html').read_text().replace('v8.0.origins:','v8.1.original-world:').replace('8.0 — ORIGINS','8.1 — ORIGINAL WORLD')
def function(name,body):
 global s
 start=s.index('function '+name+'(');a=s.index('{',start);depth=1;b=a+1
 while depth:
  if s[b]=='{':depth+=1
  if s[b]=='}':depth-=1
  b+=1
 s=s[:start]+body+s[b:]
function('referencePoint','')
s=s.replace('<script>','<script src="world-data.js"></script>\n<script>',1)
pos=s.index('// Collision geometry')
s=s[:pos]+(p/'preview-8-1/world.js').read_text()+'\n'+s[pos:]
function('walkable','function walkable(x,y,r=HERO_RADIUS){return terrainWalkable(x,y,r)}')
function('findPath','function findPath(start,goal,r=HERO_RADIUS){return gridPath(start,goal,r)}')
function('rebuildFortress','function rebuildFortress(){obstacles.length=0;assaultRoutes.clear();buildTerrain()}')
function('paintFortress',"""function paintFortress(){const g=terrainCanvas.getContext('2d');const im=g.createImageData(world.width,world.height);for(let row=0;row<world.height;row++)for(let col=0;col<world.width;col++){const i=(row*world.width+col)*4,walk=!blockedCell(col,row);im.data.set(walk?[94,112,112,255]:[21,32,38,255],i)}g.putImageData(im,0,0);if(typeof miniTerrain!=='undefined'){const mg=miniTerrain.getContext('2d');mg.drawImage(terrainCanvas,0,0,154,170)}}""")
s=s.replace('terrainCanvas.width=1440;terrainCanvas.height=3200','terrainCanvas.width=384;terrainCanvas.height=896')
a=s.index('const fortress=');b=s.index('function gateClosed',a)
s=s[:a]+"""const fortress={...worldRect,tile:8};
const floors=[];
const shops=world.units.filter(u=>u.kind==='ngme').map((u,i)=>({...referencePoint(u.x,u.y),name:['EAST','NORTH','SOUTH','WEST','UPPER'][i]||'SHOP'}));
const gates=[];
const spawnPoints=['udg_rect45','udg_rect47','udg_rect46','udg_rect48'].map(regionPoint);
const floorAt=(x,y)=>terrainWalkable(x,y);
"""+s[b:]
s=s.replace('ctx.drawImage(terrainCanvas,-720,-2600);','drawWorldChunks(left,top,right,bottom);')
s=s.replace('(x+720)/1440*77','(x-worldRect.left)/worldRect.width*77').replace('(y+2600)/3200*85','(y-worldRect.top)/worldRect.height*85')
# Replace known legacy placements, not coordinate values globally.
s=s.replace("state.p.y=stage===3?-820:stage===1?-2000:state.p.y", "state.p.y=stage===3?referencePoint(0,-1600).y:stage===1?regionPoint('gg_rct_FinalTpExit').y:state.p.y")
s=s.replace('b.x=0;b.y=stage===3?-1280:-2280;',"Object.assign(b,unitPoint(stage===3?'udg_MAGTHERIDON':'udg_ARTHAS'));")
s=s.replace("[{id:0,x:-560,y:0},{id:1,x:560,y:0}]", "['udg_FLAMETOWER1','udg_FLAMETOWER2'].map((name,id)=>({id,...unitPoint(name)}))")
s=s.replace("state.p.y=state.stage===1?-2000:-820", "state.p.y=state.stage===1?regionPoint('gg_rct_FinalTpExit').y:referencePoint(0,-1600).y")
s=s.replace("for(const [i,x] of [-520,520].entries())if(!state.seals[i]&&dist(state.p.x,state.p.y,x,-1680)<65)", "for(const [i,name] of ['udg_rect39','udg_rect41'].entries())if(!state.seals[i]&&dist(state.p.x,state.p.y,regionPoint(name).x,regionPoint(name).y)<65)")
s=s.replace('state.p.y<-1940',"dist(state.p.x,state.p.y,regionPoint('gg_rct_FinalTpEntrance').x,regionPoint('gg_rct_FinalTpEntrance').y)<120")
s=s.replace("state.p.x=0;state.p.y=154", "Object.assign(state.p,regionPoint('gg_rct_RESP'))")
s=s.replace("setDestination({x:shopHit.x,y:shopHit.y+65})","setDestination(shopApproach(shopHit))")
s=s.replace("}syncCamera();\n", "}smoothCamera(dt);\n")
s=s.replace("p.y=s.stage===4?154:s.stage===1?-2000:-820", "p.y=s.stage===4?84:s.stage===1?regionPoint('gg_rct_FinalTpExit').y:referencePoint(0,-1600).y")
s=s.replace("ctx.drawImage(miniTerrain,mx+7,my+18,77,85)","ctx.drawImage(miniTerrain,mx+27,my+18,36.43,85)")
s=s.replace("mx+7+(x-worldRect.left)/worldRect.width*77","mx+27+(x-worldRect.left)/worldRect.width*36.43")
pos=s.index('window.__citadelTest=')
s=s[:pos]+(p/'preview-8-1/integration.js').read_text()+'\n'+s[pos:]
s=s.replace('window.__citadelTest={','window.__citadelTest={world,worldRect,pathFlags,terrainWalkable,cellPoint,sourcePoint,regionPoint,unitPoint,clearance,gridPath, ')
(p/'preview-8-1/index.html').write_text(s)
