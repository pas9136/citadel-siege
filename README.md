# CITADEL SIEGE · 5.0 RC1

Original mobile HTML5 Action RPG / fortress defense game. Open `index.html` in a modern browser; the game needs no build, external assets, or runtime dependencies. Progress is saved locally in the browser.

This is a release candidate for physical iPhone testing, not a production release. See [RELEASE-CANDIDATE-5.0.md](RELEASE-CANDIDATE-5.0.md) for setup and acceptance checks.

## Development

Work in `development`. Pushing this branch runs quality checks; the workflow does not deploy the game.

- `index.html`: interface, cached procedural fortress artwork, gameplay and controls.
- `tests/smoke.mjs`: dependency-free syntax and markup checks.
- `tests/gameplay.mjs`: deterministic browser regressions in Chromium and WebKit.
- `tests/navigation.mjs`: collision, fortress access, enemy routing and pointer cancellation checks, invoked by the browser suite.

```sh
node tests/smoke.mjs
npm ci
npx playwright install --with-deps chromium webkit
npm test
```

Browser tests cover five viewport sizes (320×568, 390×844, 430×932, 844×390 and 1280×800), Retina resolution limits, camera centering, tap-to-move coordinate mapping, joystick takeover/release, rotation, overlays, dash, respawn, world bounds and save/continue. Screenshots are written to ignored `test-results/` and uploaded by CI. To use an existing Chromium locally: `BROWSERS=chromium CHROMIUM_PATH=/usr/bin/chromium node tests/gameplay.mjs`.

## Version 2.8

- Walls, pillars and furniture register solid geometry through the terrain drawing helpers. Radius-aware movement slides along walls; substeps also prevent dash tunnelling.
- Tap destinations follow a cached navigation grid with connected routes and line-of-sight smoothing. Taps on obstacles resolve to reachable ground. Keyboard/joystick input cancels routes; overlays, blur, respawn and new runs clear input.
- Open north/south doorways and wider side entrances connect the fortress. Furniture no longer overlaps supply objectives. Ground outside the rooms and decorative floor borders remain traversable.
- Assaults use radius-aware, cached routes through their lane waypoints; all enemy sizes fit their entry positions. Camp guards spawn on reachable ground and periodically replan pursuit/home routes.
- Canvas taps track the owning pointer and reject drags, cancellation, secondary fingers and taps during joystick use.
- Tests check all 16 enemy types across eight gate approaches (128 routes per browser), room/cache access, live boss assaults, blocked taps, sliding and dash collision, plus the existing mobile regressions.

## Version 2.7

- Original stone halls, galleries, furnished side rooms, supply courtyards, gatehouses, lamps and a compass mosaic, cached into one terrain bitmap.
- Adaptive world scale independent of HUD/button sizes; safe-area-aware combat center in portrait and compact landscape controls.
- Hero and camera share a position, with smooth movement acceleration instead of camera lag. Dash and respawn recenter immediately.
- Shared inverse transforms for map rendering and touch targeting.
- Fixed stale destinations across runs and respawns, conflicting overlays, and abilities/potions/waves firing behind overlays. Old toast messages no longer carry over into new runs.

Browser emulation does not replace performance and touch testing on a physical iPhone/Safari. Existing save keys are retained; no migration is needed.

## Version 3.0 — focused presentation release

Brass/slate menu styling, fortress banners and stone bevels, quiet hit outlines instead of full-body flashes, terrain-backed minimap with distinct boss markers, larger boss bars, saved optional audio and a persistent best-wave chronicle. Existing classes, talents, shop, inventory, fortress upgrades, routes and save schema remain available.

Scope limits: this is not the complete proposed overhaul. New equipment slots/rarities, friendly guard armies, new boss attack patterns, expanded class trees and extensive endless-balance redesign are deferred. No physical iPhone testing.


## Version 4.0 — armies and fortress expansion

Open 🎒 **Inventory and command** to recruit up to eight guards, archers, mages and healers; upgrade or revive them; build ballistae, frost towers or barricades on four safe pads; and repair or remove structures. Gold pays for recruitment and construction; cleared waves and captured supply depots supply wood. Barricades intercept nearby attacks without blocking routes.

At level five, choose an attack or class-specific defense/control specialization. Spend talent points on three ranks for each active skill. Newly achieved waves grant permanent legacy points for attack and defense bonuses, retained after defeat and new runs. Bosses now telegraph ground attacks and accelerate them below half health. Existing six-slot equipment, loot and all previous features remain.

Schema 5 retains the existing save key, migrates older saves and preserves base stats without stacking derived bonuses. Army and buildings persist on continue but reset on a new run; legacy is stored independently. Full automated coverage includes both browser engines, ten viewport combinations, 256 navigation routes, expansion and equipment regressions, old/corrupt saves, mobile command actions and 120-second simulations. No physical-device testing has been performed.
