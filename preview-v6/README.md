# CITADEL SIEGE 6.0 playable preview

Public entry: https://pas9136.github.io/citadel-siege/preview-v6/

Separate from production `/` (4.0) and `/preview/` (5.0 RC1). No existing
files or storage namespaces are replaced. Saves use `citadel.preview.v6.0:`.

## Play

Move with WASD/arrows, tap ground to navigate, or use the touch joystick.
Skills: 1–4; potion: 5/space. Inventory: I; talents: T; pause: Escape.
Approach one of four yellow-roofed item shops and tap it (or press B/shop HUD).
Purchases pause the simulation and use the existing inventory/stat economy.

1. Zone IV: defend four waves arriving from behind all four shops.
2. Completing the fourth wave teleports the party into the Warden's enclosed hall.
3. Killing the Warden opens both side exits. Follow either symmetrical rampart;
   activate BOTH marked seals on the northern junction before approaching the throne.
4. Enter the northern arena to seal the gate and fight the Siege Lord. Killing him wins.

Hero death retains existing respawn rules, now using the active zone checkpoint.
Continue restores zone, seals, equipment, talents and party. Boss encounters restart
at full health; defense resumes from the last completed wave. Preview progression
is independent of production. All three heroes and their existing systems remain.

## Implementation and verification

`world.js` is the map source. Floor rectangles produce the solid wall grid, cached
stonework/lighting, and minimap. Gate changes invalidate collision/navigation caches.
All movement, including dashes and enemy routes, uses radius-aware collision and
4-unit substeps. Bosses pursue the hero within their sealed arenas, with telegraphed
attacks. Projectiles stop at walls. Terrain is cached in one 1440×3200 canvas;
existing sprite caches, culling, DPR limits and adaptive graphics remain enabled.

`progression.js` integrates the new encounter state machine with the existing game.
Run `python3 scripts/build-v6.py` to regenerate the self-contained index from the
unchanged 5.0 template and these two source files. No external image assets needed.

Serve the repository (`python3 -m http.server 8000`), then run `node tests/v6.mjs`.
The suite exercises real collision/routes, shops/purchases, four attack directions,
wave-to-boss-to-perimeter-to-final progression, boss pursuit, seals, victory, checkpoint
restoration, touch cancellation and rotation in Chromium and WebKit at landscape
844×390, 667×375 and 932×430. Combat kills are accelerated for deterministic transition
coverage; this is not a full manual balance playthrough or physical iPhone benchmark.

The reference image was not attached to this task. Geometry implements the written
spatial specification; pixel-exact reference fidelity still requires that image.
