// Spatial kernel. WPM rows run south to north; canvas Y runs north to south.
const world=ORIGINAL_WORLD;
const pathFlags=Uint8Array.from(atob(world.pathing),c=>c.charCodeAt(0));
function referencePoint(x,y){return {x:x*.25,y:-(y+8704)*.25}}
function sourcePoint(x,y){return {x:x*4,y:-y*4-8704}}
const worldRect={left:-1536,top:-5760,width:3072,height:7168};
function regionPoint(name){const r=world.regions[name];if(!r)throw Error('Missing reference region '+name);return referencePoint((r[0]+r[2])/2,(r[1]+r[3])/2)}
function unitPoint(name){const u=world.units.find(u=>u.name===name);if(!u)throw Error('Missing reference unit '+name);return referencePoint(u.x,u.y)}
function cellPoint(i){return {x:worldRect.left+(i%world.width+.5)*8,y:worldRect.top+(Math.floor(i/world.width)+.5)*8}}
function cellIndex(x,y){const c=Math.floor((x-worldRect.left)/8),r=Math.floor((y-worldRect.top)/8);return c<0||r<0||c>=world.width||r>=world.height?-1:r*world.width+c}
function blockedCell(c,r){return c<0||r<0||c>=world.width||r>=world.height||!!(pathFlags[(world.height-1-r)*world.width+c]&2)}
function terrainWalkable(x,y,r=0){
 const c0=Math.floor((x-r-worldRect.left)/8),c1=Math.floor((x+r-worldRect.left)/8),r0=Math.floor((y-r-worldRect.top)/8),r1=Math.floor((y+r-worldRect.top)/8);
 for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++)if(blockedCell(col,row)){
  const xx=worldRect.left+col*8,yy=worldRect.top+row*8,dx=x-Math.max(xx,Math.min(x,xx+8)),dy=y-Math.max(yy,Math.min(y,yy+8));if(r===0||dx*dx+dy*dy<r*r+.001)return false;
 }return true;
}
const clearanceCache=new Map();
function clearance(radius){const r=Math.ceil(radius),old=clearanceCache.get(r);if(old)return old;const a=new Uint8Array(world.width*world.height);for(let i=0;i<a.length;i++){const p=cellPoint(i);a[i]=terrainWalkable(p.x,p.y,r)}clearanceCache.set(r,a);return a}
function nearestCell(p,r){const grid=clearance(r),i=cellIndex(p.x,p.y);if(i>=0&&grid[i])return i;const col=Math.floor((p.x-worldRect.left)/8),row=Math.floor((p.y-worldRect.top)/8);for(let d=1;d<100;d++)for(let y=row-d;y<=row+d;y++)for(let x=col-d;x<=col+d;x++){if(Math.max(Math.abs(x-col),Math.abs(y-row))!==d||x<0||y<0||x>=world.width||y>=world.height)continue;const n=y*world.width+x;if(grid[n])return n}return -1}
const flowCache=new Map();
function gridPath(start,goal,r=18){
 if(clearSegment(start,goal,r))return [{...goal}];
 const grid=clearance(r),from=nearestCell(start,r),to=nearestCell(goal,r);if(from<0||to<0)return [];
 const key=Math.ceil(r)+':'+to;let next=flowCache.get(key);
 if(!next){next=new Int32Array(grid.length).fill(-1);const q=new Int32Array(grid.length);let head=0,tail=1;q[0]=to;next[to]=to;
 while(head<tail){const i=q[head++],c=i%world.width;for(const n of [c?i-1:-1,c<world.width-1?i+1:-1,i-world.width,i+world.width])if(n>=0&&n<grid.length&&grid[n]&&next[n]===-1){next[n]=i;q[tail++]=n}}
 if(flowCache.size>=12)flowCache.delete(flowCache.keys().next().value);flowCache.set(key,next)}
 if(next[from]===-1)return [];const raw=[];let i=from;while(i!==to&&raw.length<grid.length){raw.push(cellPoint(i));i=next[i]}raw.push(cellPoint(to));
 if(!clearSegment(start,raw[0],r))return [];
 const path=[];let prev=start;for(let n=0;n<raw.length;){let end=n;while(end+1<raw.length&&end-n<32&&clearSegment(prev,raw[end+1],r))end++;path.push(raw[end]);prev=raw[end];n=end+1}if(clearSegment(prev,goal,r))path.push({...goal});return path;
}
// Bounded LRU terrain chunks: never allocate a full-resolution world canvas.
const chunks=new Map(),decorationCells=new Map();
for(const d of world.doodads){const p=referencePoint(d.x,d.y),key=Math.floor((p.x-worldRect.left)/256)+','+Math.floor((p.y-worldRect.top)/256);if(!decorationCells.has(key))decorationCells.set(key,[]);decorationCells.get(key).push(p)}
const referenceStructures=world.units.filter(u=>['ntt1','unp2','hctw','hgtw','nico'].includes(u.kind)).map(u=>referencePoint(u.x,u.y));
function terrainChunk(cx,cy){const key=cx+','+cy;if(chunks.has(key)){const c=chunks.get(key);chunks.delete(key);chunks.set(key,c);return c}let c;if(chunks.size>=64){const oldest=chunks.keys().next().value;c=chunks.get(oldest);chunks.delete(oldest)}else c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 for(let y=0;y<256;y+=8)for(let x=0;x<256;x+=8){const col=cx*32+x/8,row=cy*32+y/8,blocked=blockedCell(col,row),ti=(world.terrainHeight-1-Math.min(world.terrainHeight-1,Math.floor(row/4)))*world.terrainWidth+Math.min(world.terrainWidth-1,Math.floor(col/4));const t=world.terrain[ti]||[8192,0,0,0,0];const shade=((t[0]-8192)/512+(t[4]&15)*3)|0;g.fillStyle=blocked?'#202b30':['#455154','#4a5658','#505b5b','#465354'][(col+row+(t[2]&15))%4];g.fillRect(x,y,8,8);if(!blocked){g.fillStyle='rgba(195,202,184,.12)';if(row%4===0)g.fillRect(x,y,8,1);if(col%4===0)g.fillRect(x,y,1,8);if(shade>5){g.fillStyle='#acb8aa18';g.fillRect(x,y,8,8)}}else if(!blockedCell(col,row+1)){g.fillStyle='#8b9182';g.fillRect(x,y+4,8,3)}}
 if(chunks.size>=64)chunks.delete(chunks.keys().next().value);chunks.set(key,c);return c}
function drawWorldChunks(left,top,right,bottom){for(let y=Math.max(0,Math.floor((top-worldRect.top)/256));y<Math.min(28,Math.ceil((bottom-worldRect.top)/256));y++)for(let x=Math.max(0,Math.floor((left-worldRect.left)/256));x<Math.min(12,Math.ceil((right-worldRect.left)/256));x++)ctx.drawImage(terrainChunk(x,y),worldRect.left+x*256,worldRect.top+y*256);
 for(const s of shops)if(s.x>left-60&&s.x<right+60&&s.y>top-60&&s.y<bottom+60){drawStructure(s.x,s.y,'keep');ctx.fillStyle='#e2bd60';ctx.fillRect(s.x-23,s.y-33,46,8);ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText(s.name,s.x,s.y+45)}
 for(const p of referenceStructures){if(p.x>left-60&&p.x<right+60&&p.y>top-60&&p.y<bottom+60)drawStructure(p.x,p.y,'enemy')}
 for(let row=Math.floor((top-worldRect.top)/256);row<=Math.floor((bottom-worldRect.top)/256);row++)for(let col=Math.floor((left-worldRect.left)/256);col<=Math.floor((right-worldRect.left)/256);col++)for(const p of decorationCells.get(col+','+row)||[]){if(p.x<left||p.x>right||p.y<top||p.y>bottom)continue;ctx.fillStyle='#8c928366';ctx.fillRect(p.x-3,p.y-5,6,10)}
}
