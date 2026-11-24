# 8.1 Original World — accuracy and acceptance report

Status: experimental playable reconstruction of the static reference terrain/pathing.
**This is not a verified complete Warcraft runtime reconstruction.** Dynamic gate,
destructible and building footprints remain unverified; zero WPM differences must
not be interpreted as zero differences against a running Warcraft map.

Baseline: `688f1dcf08cd437bd6cf30461bc09b0f7dd795e4`. The published `/preview-8/index.html`
and baseline file both hashed to
`78d72a1e0af73685100b19764a64bad5bbafd0b92148d5c23462c3394bb938e0`.
No previous release files are changed. Saves use `citadel.preview.v8.1.original-world:`;
8.0 saves remain available at their existing URL and are not overwritten or migrated.

## Reproduction

1. Build StormLib (tested commit `d60b7e6d3501474f4d92c7b9c752a37e78385f67`)
   with CMake, `STORM_USE_BUNDLED_LIBRARIES=ON`, `BUILD_SHARED_LIBS=ON`.
2. Run `python scripts/extract-world.py /path/reference.w3x /path/libstorm.so`.
   This writes private extracted members under `/tmp/citadel-reference` and hashes
   to `extraction.json`. The script is `scripts\war3map.j` inside the archive.
3. Run `python scripts/compile-world.py /tmp/citadel-reference` (requires Pillow).
4. Run `python scripts/build-v8-1.py`. Serve the repository and run
   `node tests/v8-1.mjs`. Optional `V81_URL` selects a deployed preview.
5. Open `compare.html` for reference raster, runtime collision raster and differences.

Only spatial facts and original procedural artwork are published. Original minimap
images are decoded for metadata only; neither minimap is used as game artwork.
No Warcraft textures, models, scripts or audio are included.

## Extracted evidence

- Terrain: 97 × 225 vertices, 128 source units between vertices; all 21,825 records
  include height, water, tile flags, texture details and cliff/layer byte.
- World extent: X −6144…6144, Y −14336…14336 (12,288 × 28,672).
- WPM: 384 × 896 cells, 32 source units per cell. 147,944 unwalkable cells;
  196,120 walkable cells. Flag 0x02 controls ground movement.
- Doodads: all 831 records parsed, including position, orientation and scale;
  remaining eight bytes are zero special-doodad version/count.
- Units.doo: version 7/subversion 9, one `sloc` start-location record. Gameplay
  placements instead come from 95 literal `CreateUnit` statements in the script.
- W3R absent. 117 script-defined rectangles recovered instead.
- W3I camera bounds, terrain complements and playable dimensions parsed.
- Original BLP/TGA dimensions and twelve MMP icon records recorded in metadata.
- Binary hashes and member availability are in `extraction.json`.

## Alignment and measurements

Uniform transform: `X = sourceX / 4`, `Y = -(sourceY + 8704) / 4`.
Inverse: `sourceX = 4X`, `sourceY = -4Y - 8704`.
World: 3072 × 7168; cell: 8 × 8. The source bottom-up rows are inverted exactly
once. Rendering, collision, navigation, objective markers and minimaps use this
same coordinate space. The compact minimap preserves the 3:7 world aspect ratio.

| Landmark | Source | Reconstructed |
|---|---|---|
| Castle | (0, −8704) | (0, 0) |
| West/east attacks | (±1152, −8704) | (±288, 0) |
| North/south attacks | (0, −7552 / −9856) | (0, −288 / 288) |
| Four main shops | 2688 units from castle | 672 units from castle |
| Flame towers | (±2048, −4352) | (±512, −1088) |
| Central boss initial placement | (−3.5, −375.2) | (−0.875, −2082.2) |
| Final boss initial placement | (3.5, 9080.4) | (0.875, −4446.1) |
| Final portal entry | (0, 5792) | (0, −3624) |
| Final portal exit | (0, 8112) | (0, −4204) |

The independently rasterized WPM reference and runtime cell-center collision
comparison have **0 / 344,064 differing cells**. Consequently static corridor
edges and arena floor outlines agree at WPM resolution. This does not compare
collision at arbitrary subcell positions against Warcraft's engine. This game's
circular actor radii erode walkable space; some scripted teleports therefore snap
to the nearest radius-safe cell, without modifying the underlying geometry.

## Transitions

The six named boss arena entrances and positions use their script-defined regions.
Reflection uses the source −150/−150 offset; fire/ice use −233/−233 hero and
+233/+233 boss offsets. Mirror uses its region center. Central hero arrival uses
player-one's 500-unit/225-degree projection from `udg_rect02`. The perimeter arrival
uses `udg_rect38` from `Trig_Survival2Start_Actions`. The final teleport follows
`Trig_FINALTELEPORT_Actions`, entry → exit. The retained 8.0 progression and two-seal
objective are adaptations: their timing and complete gate trigger behavior are
not represented as identical to the original campaign.

## Implementation and validation

Static WPM collision replaces all old rectangular corridors. Radius-aware reverse
BFS fields share routes among units with the same goal/radius. Path smoothing
checks every segment; movement uses substeps. At most twelve flow fields are kept.
Terrain uses 64 recycled 256-pixel chunks (16 MiB RGBA), viewport culling and a
spatial index for doodads. Existing adaptive quality and combat limits remain.
There is no full-resolution world canvas or static minimap gameplay background.
Terrain elevations influence procedural shading; this remains a top-down 2D view.

Chromium: see `test-results.json`; landscape 844×390 and portrait 390×844.
Coverage includes every pathing cell, 100 wall boundaries, four attack routes,
five shops, ten arenas, four difficulties, twelve waves plus final countdown,
both tower objectives, all campaign zones/bosses, a 100-enemy update/render,
actual reload/save restoration and synthetic touch-pointer joystick movement.
Campaign tests accelerate damage; they are not balance playthroughs. Browser CI
installs Chromium and WebKit dependencies. Local WebKit is unavailable because
seven shared libraries are absent; no physical iPhone has been tested.

## Known gaps against the full requested acceptance criteria

- WPM is not the complete runtime collision map. Doodad/building/destructible
  pathing textures and script gate opening/closing have not been reconstructed.
  Environmental placements are visual markers; static fortifications other than
  the two campaign flame towers are not new destructible gameplay objectives.
- Procedural walls follow blocked cells; doodads use generic original column
  markers and fortifications share original procedural silhouettes. Architectural
  classification, detailed stairs, object-specific lighting and full elevation
  rendering remain incomplete.
- Only literal unit placement statements and rectangle definitions are compiled;
  arbitrary JASS-generated coordinates and all runtime relocation phases are not.
- Legacy ability/inventory/crafting implementations remain, but the new suite does
  not independently exhaust every ability/equipment combination.
- Actor entity pooling, sustained physical-iPhone FPS/battery testing, long battle
  benchmarks and complete dynamic passage validation remain outstanding.

These gaps prevent claiming the entire 8.1 specification is complete, even though
the static geometry replacement and accelerated campaign are playable.
