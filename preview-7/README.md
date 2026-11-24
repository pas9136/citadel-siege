# CITADEL SIEGE 7.0 — HEROES AT WAR

Playable release candidate: https://pas9136.github.io/citadel-siege/preview-7/

Built from approved commit `9887944`, using the unchanged 6.0 fortress geometry,
collision, camera, shop locations and 4 → 3 → 2 → 1 gate sequence. Production,
5.0 preview and 6.0 preview are untouched. Storage prefix: `citadel.preview.v7.0:`.
All art is procedural original canvas/SVG art; no Warcraft assets.

## Play

Move with WASD/arrows, joystick, or tap ground. Tap an enemy to select it.
Basic attacks are automatic; automatic selection prioritizes support/siege units.
Abilities: 1–4 and Q (fifth). Ultimate requires level 5. Healing: Space/5.
Mana: M or tap the blue MP indicator. Inventory I; talents T; nearby shop B.
Abilities cost mana; mana regenerates. Inventory → Command → Skills upgrades all
five abilities with talent points. Equipment, specialization and talents combine.
Pause settings include reduced effects; rendering also adapts automatically.

- Warrior: Ground Slam, Defensive Shield, Whirlwind, Berserker Rage, Charge.
- Mage: Fireball, Frost Nova, Chain Lightning, Meteor Storm, Arcane Shield.
- Ranger: Multishot, Evasion Dash, Explosive Trap, Arrow Storm, Poison Arrow.
- 30 waves with rotating four-lane mixed formations, twelve army archetypes,
  commander mini-bosses every fifth wave, support AI, rewards and preparation.
- Physical/magic/true damage, critical hits, armor/resistance, burning, poison,
  slow, stun, knockback, shields and evasion.
- Three-phase Warden and four-phase Siege Lord, timed ground warnings,
  reinforcements, vulnerability windows, boss loot and animated victory title.
- Perimeter patrols, both seals, checkpoint persistence, isolated saves.
- Spatial buckets for separation, pooled boss warning objects, bounded enemy and
  projectile counts, sprite caching, existing adaptive DPR/effect quality.

## Build and verify

`python3 scripts/build-v7.py` deterministically embeds `combat.js` into the approved
6.0 HTML template. `world.js` is an exact reference copy of the 6.0 map source.
Serve the repo on port 8000. Run `node tests/v7.mjs` and
`node tests/v7-combat.mjs`; use `CHROMIUM_ONLY=1` if WebKit cannot run.
`V7_URL` can point tests at the public deployment.

Local results: Chromium campaign suite passed at 844×390, 667×375, 932×430
(187 assertions each), including all waves, zones, navigation, shop purchases,
seals, victory, save restoration, pointer cancel and orientation changes.
Combat suite: all fifteen ability activations/costs/cooldowns, fifth-skill
upgrades and reloads, mana use/purchase, twelve archetypes, every boss phase,
hazard damage, recipes, equipment bonuses and a 100-enemy encounter passed.
Unchanged 6.0 suite passed in Chromium at all three viewports (135 checks each).
Production syntax/controls smoke test passed. Old release files match baseline.

Limitations: these are accelerated deterministic transition tests, not an
unassisted 30-wave balance playthrough. Physical iPhone Safari, sustained device
frame rate, battery use and long-session balance are not verified. WebKit local
launch was blocked by seven absent system libraries; installer required an
unavailable root password, and user-local apt downloads had no package sources.
The GitHub workflow installs dependencies and runs both engines. The inherited
interface is partly Russian. New skills use the existing animation vocabulary;
this release does not claim bespoke animation sets for every ability.
