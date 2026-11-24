"""Compile extracted spatial facts. No textures/models/scripts shipped."""
import struct,json,re,base64,sys
from pathlib import Path
root=Path(sys.argv[1]);dest=Path('preview-8-1');b=(root/'war3map.w3e').read_bytes();p=13
n=struct.unpack_from('<I',b,p)[0];p+=4+4*n;n=struct.unpack_from('<I',b,p)[0];p+=4+4*n
w,h,ox,oy=struct.unpack_from('<IIff',b,p);p+=16
terrain=[]
for i in range(w*h):
 height,water,flags,texture,cliff=struct.unpack_from('<HHBBB',b,p);p+=7
 terrain.append([height,water,flags,texture,cliff])
assert p==len(b)
b=(root/'war3map.wpm').read_bytes();version,pw,ph=struct.unpack_from('<III',b,4);assert len(b)==16+pw*ph
pathing=base64.b64encode(b[16:]).decode()
j=(root/'war3map.j').read_text();num=r'(-?(?:\d+(?:\.\d*)?|\.\d+))'
regions={m[0]:list(map(float,m[1:])) for m in re.findall(r'(\w+)=Rect\('+','.join([num]*4)+r'\)',j)}
units=[dict(name=m[0],kind=m[1],x=float(m[2]),y=float(m[3]),angle=float(m[4])) for m in re.findall(r'set (\w+)=CreateUnit\(p,\'(....)\','+','.join([num]*3)+r'\)',j)]
b=(root/'war3map.doo').read_bytes();magic,ver,sub,count=struct.unpack_from('<4sIII',b);p=16;doodads=[]
for i in range(count):
 kind=b[p:p+4].decode('latin1');p+=4
 variation,x,y,z,angle,sx,sy,sz,flags,life=struct.unpack_from('<I7fBB',b,p);p+=34
 table,sets=struct.unpack_from('<iI',b,p);p+=8
 for k in range(sets):
  n=struct.unpack_from('<I',b,p)[0];p+=4+8*n
 ident=struct.unpack_from('<I',b,p)[0];p+=4
 doodads.append(dict(kind=kind,x=x,y=y,z=z,angle=angle,scale=[sx,sy,sz],flags=flags))
print('Doodads',count,'consumed',p,'of',len(b),'tail',b[p:].hex())
# W3I header and camera bounds after four zero-terminated strings.
b=(root/'war3map.w3i').read_bytes();p=12
for _ in range(4):p=b.index(0,p)+1
camera=list(struct.unpack_from('<8f',b,p));p+=32
complements=list(struct.unpack_from('<4i',b,p));p+=16
mapdims=list(struct.unpack_from('<2i',b,p))
ub=(root/'war3mapUnits.doo').read_bytes()
unitHeader=struct.unpack_from('<4sIII',ub)
assert unitHeader[3]==1 and ub[16:20]==b'sloc', 'Unexpected unit placement structure'
startLocation=list(struct.unpack_from('<3f',ub,24))
from PIL import Image
originalMini=Image.open(root/'war3mapMap.blp')
originalPreview=Image.open(root/'war3mapPreview.tga')
mb=(root/'war3map.mmp').read_bytes();mv,mc=struct.unpack_from('<II',mb);assert len(mb)==8+mc*16
minimapIcons=[list(struct.unpack_from('<4I',mb,8+i*16)) for i in range(mc)]
wb=(root/'war3map.wpm').read_bytes()[16:]
im=Image.new('RGB',(pw,ph));im.putdata([(21,32,38) if v&2 else (94,112,112) for y in range(ph-1,-1,-1) for v in wb[y*pw:(y+1)*pw]]);im.save(dest/'reference-geometry.png')
data=dict(version='8.1',scale=.25,origin=[ox,oy],terrainWidth=w,terrainHeight=h,width=pw,height=ph,cell=8,pathing=pathing,terrain=terrain,regions=regions,units=units,doodads=doodads,metadata=dict(camera=camera,complements=complements,dimensions=mapdims),unitPlacementBytes=len(ub),unitPlacement=dict(version=unitHeader[1],subversion=unitHeader[2],count=unitHeader[3],startLocation=startLocation),originalMinimap=dict(size=originalMini.size,previewSize=originalPreview.size,icons=minimapIcons))
(dest/'world-data.js').write_text('const ORIGINAL_WORLD='+json.dumps(data,separators=(',',':'))+';\n')
(dest/'world-metadata.json').write_text(json.dumps({k:v for k,v in data.items() if k not in ['pathing','terrain','doodads']},indent=2))
print(pw,ph,w,h,len(regions),len(units))
