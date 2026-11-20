# v4.0 expansion — continuation record

Status: development stage, NOT a v4.0 release. Production remains v3.0. Do not merge until the requested expansion systems and integration tests are complete. Version labels intentionally remain 3.0 until release qualification.

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

## Next implementation stages (not implemented)

1. Allied army: bounded persistent roster and recruit/upgrade UI, collision-safe rally positions, cached pursuit paths, melee/ranged/magic/healing behavior. Add deterministic combat, path and save tests before committing.
2. Construction: persistent structures and resource economy, validated placement preventing blocked corridors/spawns, navigation-cache invalidation, tower specializations, barricades, repair and render integration. Test reachability after every placement/removal and loading.
3. Boss/enemy mechanics: telegraphed attacks, phases, ranged/armored elite behaviors, boss loot integration and wave pacing. Verify dodging, no unavoidable early damage spikes and wave completion.
4. Class-specific specialization, active skill upgrades, permanent rewards and long-term progression balance. Keep base stats distinct from derived bonuses.
5. Mobile army/construction/progression UI, expanded art/animations and landscape equipment tests. Add long-running simulation/performance coverage and broader corrupted-save fixtures.
6. Integrate all save fields and migration, run full Chromium/WebKit and v3.0 save fixtures, update version to 4.0 only after completion, push and wait for development/PR Actions, then merge and verify Pages commit/hash/version/live save continuation.

Deferred requested features are not represented by placeholder menus. There is no production release authorization milestone until these systems are working and all critical tests pass.
