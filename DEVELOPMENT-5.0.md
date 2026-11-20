# CITADEL SIEGE 5.0 — development checkpoint

This is **not the 5.0 release**. Production and the version label remain 4.0. Do not merge or deploy this checkpoint as a completed overhaul.

## Recovery and completed work

Remote branch `checkpoint-v4-before-v5` preserves production `58fba72b3caefc18e17222b8b40f0efb5ebb67b2`. Work is on `development`, based on that production commit.

Art stage commit: `0387191` (subsequent validation commit fixes the ballista's internal `arrow` kind).

- Original procedural character art replaces circular hero, enemy and allied-unit bodies. Layered armor, closed helmets, split cloaks, hooded casters, bowmen, shields, swords, staffs and horned heavy enemies. Blue/green allied cloth and red enemy cloth. The same artwork supplies hero-selection portraits.
- Render-only movement orientation and subtle distance-driven bobbing, plus hit displacement. A WeakMap holds poses outside persisted state. These are a foundation, not a complete directional walk/attack/death animation system.
- Cached stone masonry now includes beveled joints, deterministic grain, cracks, moss and deeper wall shadows. Existing floors, rooms, labels, route connections and obstacles remain intact.
- Original cached keep, enemy watchtower, ballista, crystal frost tower, barricade and rubble illustrations. Rank pips visualize existing upgrades; construction still completes immediately as in v4.
- Charcoal/steel/bronze interface materials across menu, HUD, inventory, shop, talents and command center; landscape hero-selection layout; 44px modal close buttons; original monochrome combat-button symbols. Existing touch handlers and camera transforms are unchanged.
- No external asset requests; the game remains one self-contained HTML file. Sprite caches are bounded by the finite unit/building types and ranks. Terrain stays a single cached bitmap. Retina backing store remains capped at 2x.
- Combat, navigation, economy, progression and save schema were not changed. No mana system exists in v4; a cosmetic mana bar has not been invented.

## Validation (2026-11-20)

- `npm test`: PASS, Chromium and WebKit at 320×568, 390×844, 430×932, 844×390 and 1280×800. Includes 256 navigation routes, equipment/combat, army/construction, legacy progression, schema migrations/corrupt saves, joystick cancellation/multitouch, overlays, real RAF, and 120 simulated seconds per browser.
- `npm run test:visual`: PASS, six browser/viewport tests and 18 image comparisons. Menu, staged battlefield and inventory at 667×375, 844×390 and 932×430, both engines, 2x backing scale. Baselines live in `tests/visual/baselines/`. This is the initial v5-development baseline, not proof that every requested screen is finished.
- Manually inspected Chromium menu/battlefield and WebKit compact inventory screenshots. No overlap in the checked controls; small menus and inventory scroll vertically.
- `git diff --check`: PASS.
- Production URL returned HTTP 200 and `CITADEL SIEGE · ВЕРСИЯ 4.0` on 2026-11-20. No production deployment was attempted.

Visual baselines were generated on Debian 13 with Playwright 1.58.2. Use the same browser/font environment to compare images. The existing Ubuntu CI gameplay workflow remains unchanged; visual snapshots are a separate local command until a matching CI image/font set is pinned. Update baselines only after review with `npm run test:visual -- --update-snapshots`.

This environment could not install packages system-wide. WebKit used extracted Debian libraries in `/tmp/citadel-libs/root/usr/lib/x86_64-linux-gnu`, and its local MiniBrowser wrapper was changed to preserve `LD_LIBRARY_PATH`. Neither workaround changes repository or production runtime. Local command:

```sh
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 LD_LIBRARY_PATH=/tmp/citadel-libs/root/usr/lib/x86_64-linux-gnu npm test
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 LD_LIBRARY_PATH=/tmp/citadel-libs/root/usr/lib/x86_64-linux-gnu npm run test:visual
```

`node tests/render-performance.mjs` compares CPU Canvas submission with the v4 checkpoint at 240 visible enemies. It is diagnostic, not a device FPS guarantee. Physical iPhone Safari/GPU/memory qualification remains required. An isolated host run measured median/p95 milliseconds: Chromium v4 0.9/204.1, development 2.2/167.4; WebKit v4 1/2, development 2/9. The WebKit increase and severe Chromium host stalls remain performance-qualification concerns; do not treat this checkpoint as performance-approved.

## Remaining work before 5.0 release

1. Art-direction pass: richer chamber-specific furnishing, architectural elevation, stairs/gates, environmental variation, atmospheric light and decorative assets. Current cached terrain is an incremental improvement, not the complete premium environment.
2. Proper multi-frame directional walk/attack/cast animations, distinct elite/boss/creature identities, hero-specific hit/death states. Current sprites rotate as a unit and share several silhouettes.
3. Combat-effects overhaul: class-specific abilities/projectiles, melee contact, critical feedback, healing/shields, death effects and readable boss warnings. Current v4 effects are preserved. Replace the shared ability glyphs with class-specific icon sets.
4. Complete UI artwork/layout pass: inventory equipment illustrations and rarity borders, talent connections, recruitment/build cards, shop, boss health panel and settings. Emoji still remain in several existing panels. Check all states including long translated text, not only initial screens.
5. Extend screenshot fixtures to every hero, spells, bosses, dead units, damaged buildings, talent/shop/settings panels, safe-area insets and portrait rotation. Pin the font/browser CI environment before enabling image comparison there.
6. Profile real iPhone Safari during large waves; resolve GPU/thermal/memory regressions and verify simultaneous joystick/skills on hardware. Cached drawing alone does not prove smooth device performance.
7. Only after all above pass: update title/menu/package/tests to 5.0; run full local and remote CI, merge development into main, deploy GitHub Pages, then verify the production version and browser smoke flow.

## Resumed optimization checkpoint (2026-11-20)

This continuation is also **not a release**. Passing a subset of the release gates is insufficient for merging to main or deploying Pages. Keep the version at 4.0 until the remaining work above is finished.

Implemented:
- Cache the viewport background gradient and a dedicated 2x minimap texture; avoid resampling the full 1840×1840 terrain for the minimap on every frame.
- Retain sprite-frame references in render-only WeakMap poses. Remove redundant enemy save/restore transforms and allocating defender filters during drawing.
- Cache projectile glow textures and short-lived combat text textures instead of applying blur on every frame. Cull offscreen friendly projectiles. Floater textures are weakly held and collectible.
- Avoid reallocating the canvas backing store on unchanged resize events; retain the 2x DPR ceiling.
- Pre-rasterize four finite poses per unit/team (idle, two strides, attack/cast), interpolate facing with simulation time, and trigger attack poses from actual combat actions. Reduced-effects mode suppresses gait and attack poses. Add guardian shoulder armor and an overlord crown. These remain a foundation: complete directional/death/boss-specific animation sets are still outstanding.
- Add `npm run test:render` for both engines at DPR 1, 1.5, 2 and 3: 240 units, no new steady-state canvases/linear gradients, state isolation, unchanged-size resize preservation, and portrait rotation. Include it in the development Actions workflow.
- Extend `npm run benchmark:render` to compare v4, `a92ad1b`, and the working tree. `PACED=1` measures RAF intervals as well as submission time; `COMBAT=1` advances combat with 240 high-health enemies. Fixed random seed makes subsequent runs reproducible. These are host diagnostics, not physical iPhone FPS claims.

Release blockers remain: complete environment furnishing/lighting; full directional, death and distinct boss animations; class-specific ability art and effects; complete inventory/equipment/talent/recruitment/construction/shop/settings/boss UI; upgrade and loot feedback; expanded visual fixtures for those states and safe areas; a pinned visual CI environment; physical iPhone Safari/GPU/thermal/memory and simultaneous-input qualification. Then update all version labels, run final local/remote checks, merge, deploy and verify production. The existing seven-item release list above remains authoritative; none is marked complete by this optimization checkpoint.

Validation of the resumed code:
- Full `npm test`: PASS, all 10 browser/viewport combinations, both engines' navigation/equipment/expansion checks, legacy save migrations and corrupted-save recovery, and real RAF checks. The 120-second deterministic stress simulation completed in 545 ms (Chromium) / 1034 ms (WebKit); this is simulation throughput, not gameplay FPS.
- Visual suite: PASS, 6 cases / 18 comparisons at 667×375, 844×390 and 932×430 in both engines. Existing baselines remain unchanged (all differences within the existing 0.1% tolerance). A fresh 844×390 battlefield was also inspected for the guardian and overlord changes.
- Renderer cache/DPR checks: PASS, 8 cases, with every enemy kind represented among 240 actors. A missing variant cache entry found during development was fixed before the final rerun.
- `git diff --check`: PASS.
- Local WebKit again required extracted Debian libraries and preserving `LD_LIBRARY_PATH` in both the GTK and WPE MiniBrowser wrappers. These environment changes are not committed.
- Pre-rasterized unit poses use about 7.8 MiB of RGBA pixels (80 × 160 × 160 × 4 bytes), excluding browser overhead; this trades bounded memory for avoiding procedural drawing in combat. Physical-device memory/thermal qualification remains outstanding.
- Production HTTP 200 still identifies version **4.0**. No release merge or deployment was performed.

Final seeded heavy-combat benchmark (`PACED=1 COMBAT=1 npm run benchmark:render`), 240 enemies, 844×390/DPR 2, 180 samples (3 simulated seconds). Raw results: `tests/benchmarks/2026-11-20-combat.json`. CPU values include update and draw; RAF intervals also include browser scheduling/rasterization.

| Engine | Revision | CPU median/p95 ms | RAF interval median/p95 ms |
|---|---|---:|---:|
| chromium | v4 | 2.1/5.5 | 26.4/51.2 |
| chromium | checkpoint | 3.5/8.0 | 35.8/89.6 |
| chromium | development | 2.0/5.7 | 33.8/53.5 |
| webkit | v4 | 7.0/23.0 | 124.0/245.0 |
| webkit | checkpoint | 7.0/32.0 | 101.0/139.0 |
| webkit | development | 7.0/13.0 | 100.0/144.0 |

Performance is **not approved for release**: CPU improvements do not establish smooth frame delivery on this host, and no physical iPhone was available. Full UI/effects/environment and device qualification work could not be completed in this continuation; preserve this tested development checkpoint rather than labeling it 5.0.
