"""Extract spatial metadata only. Requires locally built StormLib; never publishes assets."""
import ctypes as C,sys,struct,json,hashlib,re,base64
from pathlib import Path
lib=C.CDLL(sys.argv[2]);h=C.c_void_p()
assert lib.SFileOpenArchive(sys.argv[1].encode(),0,0,C.byref(h)), 'Cannot open supplied archive'
for fn in ['SFileOpenArchive','SFileOpenFileEx','SFileReadFile','SFileCloseFile','SFileCloseArchive']:
 getattr(lib,fn).restype=C.c_bool
lib.SFileGetFileSize.restype=C.c_uint32
out=Path('/tmp/citadel-reference');out.mkdir(exist_ok=True)
members={}
for name in ['war3map.w3e','war3map.wpm','war3map.doo','war3mapUnits.doo','war3map.w3r','war3map.w3i','scripts\\war3map.j','war3mapMap.blp','war3mapPreview.tga','war3map.mmp']:
 f=C.c_void_p()
 if not lib.SFileOpenFileEx(h,name.encode(),0,C.byref(f)):
  members[name]={'available':False};continue
 size=lib.SFileGetFileSize(f,None);buf=C.create_string_buffer(size);read=C.c_uint()
 assert lib.SFileReadFile(f,buf,size,C.byref(read),None) and read.value==size
 b=buf.raw;lib.SFileCloseFile(f);(out/name.split('\\')[-1]).write_bytes(b)
 members[name]={'available':True,'bytes':size,'sha256':hashlib.sha256(b).hexdigest()}
lib.SFileCloseArchive(h)
Path('preview-8-1').mkdir(exist_ok=True)
Path('preview-8-1/extraction.json').write_text(json.dumps(members,indent=2))
print(json.dumps(members,indent=2))
