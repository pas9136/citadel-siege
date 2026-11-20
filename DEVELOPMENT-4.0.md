# v4.0 expansion — continuation record

Status: v4.0 release candidate. Recovered equipment checkpoint `fb653f4093d3bfcd7c66255fbeb8f7860fb47f30`; all expansion systems below are implemented. Merge only after the final full suite and GitHub Actions pass.

## Recovery checkpoint

`checkpoint-v3-before-v4` points to production merge `b9f2db5cd7606221bffd8bad05b0b4a6ffd5326d` and is pushed to origin. Starting development commit: `9a7eb5861b4043df87adf2db2006c65044840019`.

## Implemented stage: equipment and loot

- Six actual slots: weapon, armor, helmet, boots, ring, artifact.
- Common through Mythic rarities, randomized level-scaled rolls, two sets.
- Inventory comparison, equip/unequip, selling, ten upgrade ranks with gold costs.
- Normal enemy kills have a 12% drop chance; bosses/overlords guarantee Rare or better. Loot is automatically collected. The 40-item bag automatically sells overflow; equipped items cannot be sold.
- Additive gear stats feed melee, ranged and ability damage, movement speed and incoming damage reduction. Legacy base stats are never mutated by gear, preventing equip/reload inflation.
- Three matching set pieces add 10% base attack. Legendary/Mythic equipment recovers 1% max health per equipped piece on a kill credited to the defense. Equipment defense bonus caps at 20 percentage points; existing total damage-reduction cap remains 60%. Movement bonus caps at 90.
- Schema 4 adds gear to the existing save key. Missing gear migrates to an empty inventory. Item records, slots, IDs, ranks and rolls are validated; duplicate/invalid items are discarded. Legacy shop upgrades remain separate and functional.
- Equipment belongs to the current run, persists through continue/reload, and resets on a new run. Permanent cross-run equipment is not implemented.

## Tests

`tests/equipment.mjs` is invoked for Chromium and WebKit by the existing full browser suite. It exercises all slots, actual melee damage/mitigation, special healing, upgrade limits/costs, equipped-sale prevention, selling, guaranteed boss loot, full-bag conversion, invalid gear validation, round-trip stats/IDs, real inventory buttons, old saves without gear, and new-run reset. Existing 10-viewport controls/camera/save and 256 route checks remain enabled.

Local browser libraries live outside the repository. Run here with:

```sh
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 LD_LIBRARY_PATH=/tmp/citadel-libs/root/usr/lib/x86_64-linux-gnu npm test
```

CI uses the existing standard Playwright installation. No physical iPhone testing.

## Completed expansion systems

- Allied army: eight persistent roster slots, guard/archer/mage/healer, five ranks, paid revival, collision-aware movement with one-second cached pursuit paths. Allies attack and can be attacked; healers restore living allies and the hero.
- Construction: four named safe pads, ballista and slowing frost towers, damage-intercepting barricades, five upgrade ranks, repair and removal. Gold and wood economy; wood from waves and supply caches. Structures deliberately do not add impassable geometry, preserving all existing corridors and spawn routes.
- Bosses: boss and overlord ground attacks lock their target before a 1.3-second visible warning; half-health phase shortens recovery. Warnings remain visible with reduced effects. Armored guardians reduce incoming damage; shamans fire dodgeable aimed bolts at nearby heroes. Existing boss loot and wave pacing retained.
- Specializations: level-five one-time run choice; Berserker/Pyromancer/Sniper damage, Guardian defense, Enchanter cooldown reduction, Tracker speed. Four active skills each accept three talent-point upgrades. Damage/buff strength and cooldowns scale without modifying base stats.
- Legacy: one permanent point per newly achieved wave, with a persisted high-water mark preventing repeated rewards on replay. Ten attack and ten defense ranks; escalating prices. Separate storage survives defeat/new runs; run equipment/army/construction reset.
- Mobile: scrollable command center in inventory, jump link, 44px command buttons, portrait/landscape interaction checks. Visible units, structures and boss warning animations.
- Performance: bounded units/structures/projectiles/effects, cached pursuit and assault paths, cached legacy stat inputs, per-frame projectile target map. Saves omit navigation routes and transient clocks.
- Save schema 5 uses the existing key; missing expansion fields initialize defaults. Roster/building kinds, limits, ranks, HP, pad uniqueness and numeric fields are sanitized. Schema 3/4 equipment and base-stat compatibility retained.

## Release validation

`npm test` runs static checks plus Chromium and WebKit at five viewports each, 128 enemy navigation routes per browser, equipment regressions, expansion combat/save/migration/corrupt-data tests, real portrait/landscape command buttons, and a 120-second deterministic stress simulation per browser. Also exercises actual RAF, sound persistence and save/continue. Physical-device performance is not claimed.

Local WebKit launcher must preserve `LD_LIBRARY_PATH` when using extracted libraries (the bundled wrapper otherwise overwrites it). CI installs normal system dependencies with Playwright.

Final local qualification (2026-11-20): full `npm test` exited 0 with ten browser/viewport combinations, 256 navigation routes, equipment and expansion suites. 120 simulated seconds: Chromium 419 ms; WebKit 932 ms (simulation CPU time, not device FPS). `git diff --check` passed. Mobile command panel visually inspected at 390×844. Remote CI and Pages verification are required after pushing this commit.
