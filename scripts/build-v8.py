from pathlib import Path
p=Path(__file__).resolve().parent.parent
s=(p/'preview-7/index.html').read_text().replace('v7.0:', 'v8.0.origins:')
s=s.replace('v7.0 · HEROES AT WAR','8.0 — ORIGINS').replace('<div class="subtitle">HEROES AT WAR</div>','<div class="subtitle">8.0 — ORIGINS</div>')
a=s.index('  <p class="intro">7.0');b=s.index('  <div class="section-kicker">',a)
s=s[:a]+'''  <p class="intro">Defend the castle through twelve rotating assaults. Break both flame towers, survive the final wave, then conquer the Warden, ramparts and northern throne.</p>
  <label style="grid-column:1/-1">Difficulty <select id="difficulty8" style="padding:12px;background:#26343d;color:#fff"><option value="0">Story</option><option value="1" selected>Normal</option><option value="2">Veteran</option><option value="3">Nightmare</option></select></label>
  <a class="secondary" style="grid-column:1/-1;margin:8px 0" href="../preview-7/">Play 7.0 · Heroes at War</a>
'''+s[b:]
s=s.replace('schema:7,','schema:8,origins:state.origins,').replace('enemyTowers:[],supplyCaches:', 'enemyTowers:enemyTowers.map(t=>t.hp),supplyCaches:')
s=s.replace("window.__citadelTest={",(p/'preview-8/origins.js').read_text()+"\nwindow.__citadelTest={origins: {arenas:arenaDefs,enter:enterArena,leave:leaveArena,travel:travelOrigins,convert:referencePoint}, ")
s=s.replace("addEventListener('click',startWave)","addEventListener('click',()=>startWave())")
s=s.replace('(e.major||heroDistance<245)', '(e.major||e.arenaBoss||heroDistance<245)')
# The v7 combat auto-selector otherwise drops explicitly selected structures.
s=s.replace('if(!candidate)return;targetId=candidate.id','if(!candidate){if(targetTowerId!==null)auto7();return}targetId=candidate.id')
(p/'preview-8/index.html').write_text(s)
