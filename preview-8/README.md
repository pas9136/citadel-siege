# CITADEL SIEGE 8.0 — ORIGINS · development preview

Public preview: https://pas9136.github.io/citadel-siege/preview-8/

Baseline: `b9037b5bb2d2b8de6b496453ea7217ec9caca3f0`, the latest published
7.0 release candidate and head of development-v7.0. Its Chromium campaign
(187 checks at each of three viewports) and combat suites were rerun successfully.
The baseline has no recorded physical-iPhone acceptance; this build does not
upgrade that claim. All previous release directories remain byte-identical.

## Playing

Select Story, Normal, Veteran or Nightmare and Warrior, Mage or Ranger. The menu
also links to the unchanged 7.0 campaign. Existing joystick, tap movement,
auto attack, five skills, mana, potions, equipment, talents and army remain.
Select a flame tower by tapping it, then approach to auto attack it.
Major attacks rotate W → N → E → S, twelve groups of `5 + wave` units. The regular
countdown is 210 seconds; combat time is deducted from the following preparation
period. If an attack lasts longer than 210 seconds, the next waits for its clear.
“Next wave” voluntarily skips preparation. Both towers AND all twelve waves must
be cleared to start the unskippable 30-second final countdown. Clear the final
assault to enter the central boss hall, defeat its guardian, activate both
perimeter seals, then enter the northern boss arena (walk or Travel menu).

Origins → Travel opens optional encounters during cleared preparation or the
perimeter stage. Each freezes the campaign and restores its exact enemy roster,
tower health, position and timer on return. Entry locks the arena exits.
Victory grants a named one-time relic (different attack/health bonuses) and gold.
Retreat and death grant no completion reward. Reloading mid-arena restores the
pre-entry campaign checkpoint, not the encounter. There are six guardians plus
Reflection, Mirror, Ashmaw and Rime challenges. Each has original cached animated
canvas silhouettes and a distinct telegraphed attack pattern. Reflection adapts
to hero class; Mirror has three enemies. No rapid full-screen flash is added.

Nearby yellow shops retain equipment, consumables, legendary drops and existing
recipes. Goods adds permanent campaign-save attribute books and Dawnforged Blade:
two Might books + two Vigor books + 900 gold; learned attributes remain after
combining. Milestones 20/40/60/80 award 100/200/600/1000 gold (reference / 50).
Difficulty scales enemy health and attack by 0.7 / 1 / 1.45 / 2, including bosses.
Storage prefix: `citadel.preview.v8.0.origins:`. No old saves are migrated/deleted.

## Archive evidence versus adaptations

The supplied W3X has an MPQ header at byte 512 and encrypted members. Extracted
using StormLib (scripts\\war3map.j, not root war3map.j). No map script, texture,
model, audio or other original asset is distributed. `reference-analysis.json`
records SHA-256 hashes, sizes, parsed definitions and counts; the reproducible
binary analyzer is `scripts/analyze-w3x.py`. JASS line references below count
CR-separated lines after normalization to LF.

Verified directly:

- `Trig_OptionsDifficulty_Actions`, lines 8352–8364: four difficulty buttons.
- `Trig_WaveTimer_Actions` area, line 9622: 210 seconds; lines 9628/9682:
  wave 12 checks. `Trig_WaveAttack_Actions` lines 9730–9772: direction announcements,
  four direction indexes and `5 + udg_integer03` spawn formula.
- `Trig_FinalWaveTimer_Conditions/Actions`, lines 9774–9794: both flame towers
  dead, then a separate 30-second timer. The original can interrupt ordinary
  attacks; Origins deliberately requires all twelve completed first.
- `Trig_WaveKills20/40/60/80`, lines 12709–12764: cumulative wave-kill thresholds
  and 5000/10000/30000/50000 gold. Origins uses campaign kills and economy scaling.
- Optional-boss dialog, lines 1319–1329: the six requested reference encounters.
  New names, silhouettes, combat patterns and reward balance are adaptations.
- `CreateRegions`, lines 14219 and 14257–14260: castle rectangle center (0,-8704),
  major attack centers (-1152,-8704), (0,-7552), (1152,-8704), (0,-9856).
- Unit creation lines 15476 and 15602: central boss (-3.5,-375.2), final boss
  (3.5,9080.4). `main`: requested camera bounds.
- Terrain W3E: 97 × 225 vertices, origin (-6144,-14336), seven ground tiles,
  two cliff types. WPM: 384 × 896 cells, 147944 with unwalkable flag 0x02.
- Fully consumed W3U tables: 101 modified base + 160 custom units; W3T:
  16 + 183 items; W3A: 123 + 547 abilities. Parsed typed field overrides include
  health, movement, abilities, gold costs, names, ability levels and cooldowns.

`referencePoint` registers reference coordinates to the existing four-zone world.
It uses piecewise Y anchors; X ±1152 maps to ±600 and camera X ±5504 maps to ±720.
Castle → (0,0); major lanes → (-600,0)/(0,-480)/(600,0)/(0,480);
central boss → approximately (-1.82,-1280); final boss → (1.82,-2280);
user-supplied teleport anchors (0,5792)/(0,8112) → (0,-1880)/(0,-2000).
The actual major bosses retain the v7 centerline X=0 for collision clearance.
These are landmark registrations, NOT a uniform-scale or cell-for-cell WPM port.
The visible v7 floor rectangles, shop solids, pathfinding and gate collision are
retained. Raw terrain/pathing were analyzed but not transplanted. Optional arenas
reuse the central hall in an isolated encounter state. These are explicit geometry
adaptations; an exact recreation of reference corridors is not claimed.

## Validation and remaining limits

Build: `python3 scripts/build-v8.py` (deterministic v7 template + original extension).
Serve repository on port 8000. Run `node tests/v8.mjs`, `node tests/v8-combat.mjs`,
`node tests/v8-state.mjs`. Set CHROMIUM_ONLY=1 where WebKit cannot launch.
V8_URL can target the published preview. CI installs both browser dependencies.

Chromium: 159 Origins checks per viewport (844×390, 390×844, 667×375), plus inherited
combat coverage for all fifteen abilities, mana, skill upgrades, equipment,
recipes, both major boss phase sequences and a 100-enemy stress encounter.
Additional state tests cover four difficulty levels, arena retreat/death/retry,
milestone persistence, pause, Travel UI, orientation change and actual reload.
Tests accelerate combat using deterministic damage; they are not an unassisted
full-length balance playthrough. Physical iPhone Safari, sustained-device FPS,
battery and long-session balance are not verified. Local WebKit lacks seven
system libraries; consult the Origins CI run for its result. The inherited UI
is partly Russian. This is a development preview, not device-certified 8.0 final.
