# CITADEL SIEGE 8.2 recovery

Baseline: main 63110438fb905030ce90872056fc11d1b747568a (published 8.1).
Development branch: development-v8.2. Previous 8.2 files are unavailable; reimplementation authorized.

## Completed
- Recovered published 8.1 and its extraction/build/test tools from development-v8.1.
- Established isolated development branch; earlier previews and saves unchanged.

## Pending
- Locate exact W3X reference and verify member hashes; extract 17 scripted barriers.
- Dynamic collision, immediate navigation invalidation, destructibles and architecture.
- Animations, effects, pooling and optional diagnostics.
- Chromium/WebKit campaign, collision, navigation, persistence and mobile regressions.
- Publish preview-8-2 through existing GitHub Pages main-branch hosting.

## Known issues
Original archive is absent locally. 8.1 spatial metadata is available; exact script recovery must be verified against extraction.json, never inferred and labeled recovered.

## Resume
Fetch origin; checkout development-v8.2. Read this file and git log before continuing.

## Checkpoint 2 — dynamic runtime and recovered gates
- User supplied archive; script SHA-256 4198cfb9… and WPM fac0153a… match 8.1 exactly.
- Recovered all 17 CreateDestructable placements and 13 event handlers into gate-evidence.json; extraction is reproducible.
- Added separate occupancy grid, destructible fortifications, tower/building footprints, route invalidation, isolated 8.2 save namespace.
- Added pooling allocation sites, architectural drawing, animated gates, destruction particles and optional diagnostics (initial smoke passed in Chromium).
- Footprint rectangles and architectural artwork are reconstructed; source placements/operations are verified. Existing adapted campaign schedules gate events; this is not a full JASS interpreter.
- Pending: full regression, lifecycle/pool checks, gate passage coverage, browser CI and publish.

## Checkpoint 3 — regression fixes and browser CI
- Chromium full campaign passed: 250 checks each at 844x390 and 390x844; zero WPM mismatches; save/reload and touch controls passed.
- Dynamic suite passed: 85 assertions covering all 17 gate collision/replan transitions, tower/destructible collision release, pool reuse, construction, reload, save isolation, diagnostics, rotation and map controls.
- Fixed repeated JASS temporary unit names by including source coordinates in persistent IDs.
- Gate scheduling adaptation: demon gates open at wave 12 so flame objectives remain reachable in the retained 8.1 campaign.
- Removed duplicate legacy structure art and kept terrain chunk shading independent of dynamic occupancy.
- WebKit local dependencies missing; GitHub Actions installs both browser runtimes. Pending CI results and publication.

## Checkpoint 4 — combat preservation and release preparation
- Chromium: all 15 hero abilities, upgrades, mana/save restoration, 12 enemy types, both multi-phase bosses, hazards, recipes, equipment and 100-enemy combat passed; 15 state checks passed.
- Fixed projectiles colliding with their own emitting keep/tower; gate closure resolves overlapping actors to safe cells.
- Added styled mobile controls and original environmental details; documented verified vs reconstructed facts and adapted gate scheduling in preview-8-2/README.md.
- Earlier releases verified byte-for-byte unchanged with git diff against baseline.
- Remaining: final four-suite CI on both engines, public deploy and public smoke test.

## Final verification additions
- First GitHub Actions run 45536423192 passed Chromium and WebKit campaign/dynamic suites.
- Added physical crossing and route assertions for every gate, four 60-second simulated lane-to-keep attacks and a 100-enemy, 600-update endurance check. Local lane attacks all damaged the keep; no stuck routes.
- Final CI also runs the combat and progression-state suites. No further gameplay changes planned unless these reveal a defect.
- Final mobile visual review moved Break structure below Origins Travel to avoid overlap; corrected the retained menu footer's release label to 8.2.
