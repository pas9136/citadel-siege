# Version 2.8 recovery record

## Verified starting state

The provided workspace contained no checkout or saved changes from the failed session. A fresh clone of `pas9136/citadel-siege` showed `development` and `origin/development` at `a0451aa80438d4be4cce66d299d94db37d6ff55f`. No version 2.8 commit was present in the fetched history. Uncommitted or unpushed work in the previous session cannot be recovered from this workspace.

These commits were already pushed beyond `main`, oldest first:

- `f52c143`: dependency-free smoke tests.
- `5f52337`: smoke checks on development and pull requests.
- `1ba8f07`: smoke selector quoting fix.
- `f55c2dd`: version 2.7 fortress artwork, centered camera, mobile controls and browser regressions.
- `4a53f74`: supported Ubuntu 24.04 CI runner.
- `a0451aa`: integer touch coordinates for cross-browser regression tests.

The starting `main` SHA was `f1f72c46e987139ae57516d0fea5426bb3a027a4`. This task works only on `development`; the existing quality workflow does not deploy.

## Implemented in this recovery

- Shared rendered/collision geometry for walls, pillars and furniture; indexed circle/rectangle queries, wall sliding and movement substeps, including ranger dash.
- Radius-specific cached navigation graphs, reachable destination selection, connected grid search and route smoothing. Manual movement and lifecycle transitions clear tap routes.
- Usable fortress doors, cleared supply-cache furniture and collision-safe entry coordinates for every enemy size.
- Cached assault paths through lane waypoints; collision-safe camp guard spawning, pursuit and return-home routes.
- Pointer ownership, drag/cancel filtering, secondary-finger handling and joystick takeover.
- Version 2.8 metadata and documentation, expanded regression coverage.

## Validation

Final result: PASS, exit code 0; 10 browser/viewport combinations, 256 enemy gate/type route checks across both engines, both live-loop checks and both navigation suites. `git diff --check` passed.

Run `npm test`: syntax/markup/version checks, Chromium and WebKit at five viewports each, animation-loop smoke checks, camera/touch/joystick/overlay/dash/respawn/bounds/save regressions, plus navigation checks in both engines. Navigation covers 128 enemy gate/type combinations per engine, room and cache access, live boss assaults from all four lanes, guard pursuit/home behavior, blocked taps, wall sliding, dash tunnelling, cancellation and exhaustive checks against the collision spatial index. `git diff --check` also applies.

The workspace initially lacked Playwright browsers and WebKit system libraries. Browser binaries were installed; Debian libraries were extracted outside the repository and linked into the local WebKit bundle. Local full-suite invocation:

```sh
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 \
LD_LIBRARY_PATH=/tmp/citadel-libs/root/usr/lib/x86_64-linux-gnu npm test
```

The validation flag bypasses a system `ldconfig` check that does not see the privately installed GLES library; the actual WebKit browser and all its tests still run. CI retains the standard `playwright install --with-deps` and `node tests/gameplay.mjs` commands on Ubuntu 24.04. No test is skipped in the full-suite invocation.

Browser emulation is not physical iPhone testing. Movement collisions do not change the existing combat damage/spell rules, and actors do not block each other. Existing save keys and progress format are retained.
