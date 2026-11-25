"""Recover only gate facts/event operations; requires exact verified 8.1 reference."""
import re,json,hashlib,sys
from pathlib import Path
root=Path(sys.argv[1]); dest=Path('preview-8-2')
expected=json.loads(Path('preview-8-1/extraction.json').read_text())
for name,key in [('war3map.j','scripts\\war3map.j'),('war3map.wpm','war3map.wpm')]:
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==expected[key]['sha256'],name+' differs from verified 8.1 reference'
s=(root/'war3map.j').read_text(); gates=[];events={}
for ident,kind,args in re.findall(r"set (udg_destructable\d+)=CreateDestructable\('(....)',([^\)]+)\)",s):
 x,y,angle,scale,variation=map(float,args.split(','));vertical=kind in ['ATg3','LTe3'];width,height=(24,128*scale) if vertical else (128*scale,24)
 gates.append(dict(id=ident,kind=kind,x=x,y=y,angle=angle,scale=scale,variation=variation,width=width,height=height,placement='verified script',footprint='reconstructed rectangle; not original pathing texture'))
for fn,body in re.findall(r'function (\w+)(.*?)endfunction',s,re.S):
 ops=[]
 for m in re.finditer(r'ModifyGateBJ\((\d),(udg_destructable\d+)\)|RemoveDestructable\((udg_destructable\d+)\)',body):
  ops.append(dict(id=m[2] or m[3],operation=int(m[1]) if m[1] else 'remove'))
 if ops:events[fn]=ops
assert len(gates)==17 and len({g['id'] for g in gates})==17
data=dict(scriptSha256=expected['scripts\\war3map.j']['sha256'],pathingSha256=expected['war3map.wpm']['sha256'],gates=sorted(gates,key=lambda g:g['id']),events=events)
(dest/'gate-evidence.json').write_text(json.dumps(data,indent=2))
(dest/'gates-data.js').write_text('const SCRIPTED_GATES82='+json.dumps(data['gates'])+';\nconst GATE_EVENTS82='+json.dumps(events)+';\n')
print('Verified 17 gates/barriers and',len(events),'event handlers against original member hashes')
