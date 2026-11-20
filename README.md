# CITADEL SIEGE · 2.7

Original mobile HTML5 Action RPG / fortress defense game. Open `index.html` in a modern browser; the game needs no build, external assets, or runtime dependencies. Progress is saved locally in the browser.

## Development

Work in `development`. Pushing this branch runs quality checks; the workflow does not deploy the game.

- `index.html`: interface, cached procedural fortress artwork, gameplay and controls.
- `tests/smoke.mjs`: dependency-free syntax and markup checks.
- `tests/gameplay.mjs`: deterministic browser regressions in Chromium and WebKit.

```sh
node tests/smoke.mjs
npm ci
npx playwright install --with-deps chromium webkit
npm test
```

Browser tests cover five viewport sizes (320×568, 390×844, 430×932, 844×390 and 1280×800), Retina resolution limits, camera centering, tap-to-move coordinate mapping, joystick takeover/release, rotation, overlays, dash, respawn, world bounds and save/continue. Screenshots are written to ignored `test-results/` and uploaded by CI. To use an existing Chromium locally: `BROWSERS=chromium CHROMIUM_PATH=/usr/bin/chromium node tests/gameplay.mjs`.

## Version 2.7

- Original stone halls, galleries, furnished side rooms, supply courtyards, gatehouses, lamps and a compass mosaic, cached into one terrain bitmap.
- Adaptive world scale independent of HUD/button sizes; safe-area-aware combat center in portrait and compact landscape controls.
- Hero and camera share a position, with smooth movement acceleration instead of camera lag. Dash and respawn recenter immediately.
- Shared inverse transforms for map rendering and touch targeting.
- Fixed stale destinations across runs and respawns, conflicting overlays, and abilities/potions/waves firing behind overlays. Old toast messages no longer carry over into new runs.

The architecture remains visual: walls and furniture do not yet have collision or pathfinding. Browser emulation does not replace performance and touch testing on a physical iPhone/Safari. Existing save keys are retained; no migration is needed.
