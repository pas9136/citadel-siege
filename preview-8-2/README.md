# CITADEL SIEGE 8.2 — Living Fortress

Playable preview: https://pas9136.github.io/citadel-siege/preview-8-2/

Built additively from the published 8.1 release. Previous releases are unchanged.
Saves use `citadel.preview.v8.2.dynamic-world:`; no earlier saves are migrated,
overwritten or deleted. Continue resumes only this preview's progress.

## Controls
Move with the joystick, keyboard or ground taps. Use the existing ability buttons,
shop/inventory, Origins travel and Map controls. Near a destructible fortification,
**Break structure** attacks it. Flame towers retain their existing targeting.
**FPS** toggles frame-time, entity count, navigation revision and pool diagnostics.
Gate collision changes immediately; opening/closing is animated separately.

## Verified reference and reconstruction boundary
The supplied `X HERO SIEGE 3.45v RUS.w3x` matches the 8.1 extraction hashes:
- Script: `4198cfb92b8f5f77f6026978467a1eb16ee47c4299af53a70e8fdd10a825b7a8`
- WPM: `fac0153ad4a44d0edaed78347fcfd0106010fa4ea99ac117954f7279c99f78b3`

`gate-evidence.json` contains all **17** literal scripted destructibles and **13**
event handlers, including positions, types, angles, scales and ordered operations.
`gates-data.js` is generated from those facts. Operations 0/1 mean close/open;
removal opens the barrier. All original gates are invulnerable in the source.

`world-data.js` is byte-identical to 8.1, including the full 384×896 static pathing
grid. Dynamic occupancy is a separate counted grid. No gate operation clears an
original blocked terrain cell. Collision, movement and route planning use the
combined occupancy. Gate changes, tower destruction, construction and demolition
invalidate clearance and flow fields and replan existing enemies immediately.
Overlapping actors are moved to a radius-safe cell when a gate closes.

Building dimensions and gate footprint rectangles are **reconstructed**, not
extracted Warcraft pathing textures. Artwork is original procedural stonework,
roofs, stairs, battlements, banners, shops, gates, ruins and environmental details;
no original game textures/models/audio or full JASS script are redistributed.
Verified source positions are preserved. Destructible fortifications use stable
position-based IDs; health and gate states survive reload.

## Campaign adaptation
The existing 8.1 campaign, heroes, five abilities per hero, items, crafting,
optional arenas, bosses, progression and difficulty settings are retained.
Source trigger **operations** are recovered, but scheduling follows this game's
existing campaign rather than a full JASS interpreter:
- Eight entry barriers are removed when gameplay starts.
- Demon gates open at wave 12, allowing the retained flame tower objectives.
- Warden/perimeter/final transitions apply recovered gate events.
- Perimeter seals open the northern passages; the final encounter closes its gate.
- Side-boss passages become available after the Warden in this adapted campaign.

This is not a claim of exact Warcraft runtime fidelity or original multiplayer
trigger timing. Original unit/building pathing textures and arbitrary JASS runtime
spawns are not reconstructed. Earlier optional campaigns remain at their URLs.

## Reproduction and tests
```
python scripts/extract-world.py /path/reference.w3x /path/libstorm.so
python scripts/extract-gates.py /tmp/citadel-reference
python scripts/build-v8-2.py
npm ci
npx playwright install chromium webkit
python3 -m http.server 8765
# In another terminal:
node tests/v8-2.mjs
node tests/v8-2-dynamic.mjs
node tests/v8-2-combat.mjs
node tests/v8-2-state.mjs
```
`CHROMIUM_ONLY=1` selects Chromium; `V82_URL` selects a deployed preview.
GitHub Actions installs both browser runtimes and system dependencies.
Campaign tests use accelerated damage, not a balance playthrough. Linux WebKit
is regression coverage, not a physical iPhone FPS/battery or Safari acceptance test.
Pooling covers enemy actors, friendly/hostile projectiles and destruction particles;
free lists are bounded and stale actor fields are cleared before reuse. Existing
render effects and UI floaters retain their original bounded lifecycle.
