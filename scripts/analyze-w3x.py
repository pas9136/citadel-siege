"""Read decrypted reference members; writes metadata, never redistributes map assets.
Usage: python scripts/analyze-w3x.py /path/to/extracted-members
"""
import sys,struct,json,hashlib
from pathlib import Path
root=Path(sys.argv[1]);out={}
for name in ['war3map.j','war3map.w3e','war3map.wpm','war3map.w3u','war3map.w3t','war3map.w3a']:
 b=(root/name).read_bytes();r={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()};out[name]=r
 if name.endswith('wpm'):
  version,w,h=struct.unpack_from('<III',b,4);r.update(version=version,width=w,height=h,unwalkable=sum(bool(v&2) for v in b[16:]),cells=w*h)
 elif name.endswith('w3e'):
  p=13;n=struct.unpack_from('<I',b,p)[0];p+=4;r['groundTiles']=[b[p+i*4:p+i*4+4].decode('ascii') for i in range(n)];p+=4*n;n=struct.unpack_from('<I',b,p)[0];p+=4;r['cliffTiles']=[b[p+i*4:p+i*4+4].decode('ascii') for i in range(n)];p+=4*n;w,h,x,y=struct.unpack_from('<IIff',b,p);r.update(width=w,height=h,origin=[x,y])
 elif name.endswith(('w3u','w3t','w3a')):
  p=0
  def integer():
   global p
   v=struct.unpack_from('<i',b,p)[0];p+=4;return v
  def raw():
   global p
   v=b[p:p+4].decode('latin1');p+=4;return v
  version=integer();r['version']=version;r['tables']=[]
  for table in range(2):
   n=integer();fields={};examples=[]
   for i in range(n):
    old,new=raw(),raw();mods=integer();obj={'base':old,'id':new,'fields':{}}
    for j in range(mods):
     field,kind=raw(),integer()
     if name.endswith('w3a'):integer();integer()
     if kind==0:v=integer()
     elif kind in [1,2]:v=struct.unpack_from('<f',b,p)[0];p+=4
     elif kind==3:
      end=b.index(0,p);v=b[p:end].decode('utf-8',errors='replace');p=end+1
     else:raise ValueError(kind)
     raw();fields[field]=fields.get(field,0)+1
     if field in ['unam','uhpm','umvs','uabi','igol','iabi','anam','alev','acdn','amcs']:obj['fields'][field]=v
    if obj['fields'] and len(examples)<8:examples.append(obj)
   r['tables'].append({'objects':n,'fieldCounts':fields,'examples':examples})
  r['parsedBytes']=p;assert p==len(b)
Path('preview-8/reference-analysis.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:{a:v for a,v in r.items() if a not in ['tables','sha256']}|({'objects':[t['objects'] for t in r['tables']]} if 'tables'in r else {}) for k,r in out.items()},indent=2))
