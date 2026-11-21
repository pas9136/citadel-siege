# CITADEL SIEGE 5.0 RC1 — iPhone test candidate

This candidate is **not performance-qualified or approved for production**. It preserves the completed v5 development work recovered through `7fd28a2` (latest gameplay/rendering code `88da7a0`). Only release identification, documentation and version assertions change for RC1. No merge to `main` or Pages deployment is authorized by this candidate.

## Test on an iPhone

On a Mac/PC with Python 3, connected to the same Wi-Fi as the iPhone:

```sh
git clone --branch v5.0.0-rc.1 https://github.com/pas9136/citadel-siege.git citadel-siege-rc1
cd citadel-siege-rc1
python3 -m http.server 8080 --bind 0.0.0.0
```

Alternatively download and extract the RC archive and run the Python command inside its folder. Find the computer's Wi-Fi IPv4 address in network settings (for example `192.168.1.20`). In **Safari on the iPhone**, open `http://192.168.1.20:8080/`, substituting that address. Allow local network/firewall access if prompted; both devices must be on a network that allows peer connections. Stop the server with Ctrl-C afterward. No npm install or build is needed to play.

Confirm the menu reads **CITADEL SIEGE · ВЕРСИЯ 5.0 RC1**. Do not use the production Pages URL for this test: it still serves v4.0. The LAN address has separate browser storage from production, so an existing production save will not appear there automatically. Keep the same host address/port for save/continue testing.

## Physical-device acceptance (pending)

Record iPhone model, iOS version, orientation, Low Power Mode, and whether the phone is warm. Test all three heroes, portrait and landscape, including a rotation during play:

- Start a run; move with the joystick while tapping skills with another finger. Check release/cancellation, dash, and controls around the notch/home indicator.
- Open and close inventory, talents, shop and pause/settings. Recruit/upgrade allies and construct/repair a tower. Confirm text and action buttons remain reachable.
- Save, reload Safari, and continue. Check hero, equipment, army, structures and progression survive.
- Play multiple waves including a boss. Check telegraphs and hit/death feedback remain readable, and note stutter or input lag during busy combat.
- Play for 10–15 minutes once to check sustained frame delivery, heat, reloads/crashes and memory pressure. Background Safari briefly and return; confirm controls recover.

Report observed smoothness and problems; do not infer measured FPS from visual impressions. A device-side frame trace is useful only if a repeatable problem appears. Production release remains blocked on this device session and resolution of material issues it finds. Optional decorative work stays in `BACKLOG-5.1.md`.

## Recovery and performance assessment

The new workspace contained no checkout or retained test output. All remote development commits, raw benchmark JSON and visual baselines were recovered without rewriting history. Uncommitted work from the previous machine cannot be verified or recovered from this workspace.

Current cloud evidence: cgroup `cpu.max` is `200000 100000` (two CPU equivalents), and `/dev/dri` is absent (no exposed GPU device). Playwright here uses Linux WebKit, not iOS Safari. The previous session's host configuration was not captured fully enough to prove identical conditions.

Existing seeded measurements already show slow WebKit on v4: RAF median/p95 **95/121 ms** versus development **48/73 ms**, with CPU submission **3/7 ms** for both (adaptive quality finishes at different scales: v4 2, development 1). The separate production-loop development measurement was **52/76 ms**. These are scheduling/rasterization-sensitive callback intervals, not display presentation or touch latency. Together with the restricted host, this supports a substantial environment contribution and does not establish a v5 iPhone regression. It does not conclusively exclude game-side rasterization costs either. Physical iPhone testing is the remaining discriminator. No benchmarks were repeated for RC1.

## Validation

Recovered final-code CI passed gameplay, render-cache/DPR and adaptive-quality checks:
https://github.com/pas9136/citadel-siege/actions/runs/44762639628

Recovered local record: both engines, ten viewport cases, 256 navigation routes, equipment/army/construction/boss/save regressions; 12 visual cases / 42 comparisons; eight render-cache/DPR cases; adaptive checks in both engines. These are historical results, not newly run checks.

Fresh RC validation (2026-11-21):
- PASS: syntax/version assertions and gameplay in Chromium and WebKit, all ten viewport cases, 256 navigation routes, equipment, expansion, save migration/corrupt recovery and real RAF checks. The 120-second deterministic simulation is simulated time, not a long benchmark.
- PASS: renderer caches, state isolation and resize at DPR 1/1.5/2/3 in both engines (eight cases).
- PASS: adaptive-quality hysteresis, pause/stall exclusion and simulation isolation in both engines.
- Visual references: only four menu images changed, and pixel-difference bounds were confined to the version footer. All other references were retained. Final comparison result is recorded in the validation log.
- Functional commands had 180–240-second limits; visual runs had 60–120-second limits. No benchmark loops were run.
- Local WebKit required extracted Debian libraries and the same wrapper fix described in the historical notes. A first launch stopped at missing host libraries; it was not a gameplay failure. After repair, only the blocked WebKit gameplay and remaining suites were run.
- `git diff --check`: PASS.

Fresh successful output is preserved in `tests/validation/5.0-rc.1.txt`. Visual CI environment/font pinning remains deferred; visual checks were performed locally with Playwright 1.58.2 on Debian 13. Pushing development runs the existing functional CI without deploying Pages.
