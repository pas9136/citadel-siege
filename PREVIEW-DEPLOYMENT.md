# Public RC1 preview

Open https://pas9136.github.io/citadel-siege/preview/ directly in iPhone Safari.
The menu identifies version 5.0 RC1. No local server or computer is needed.

The `preview/5.0-rc.1` branch owns `.github/workflows/preview-pages.yml`.
A push to this branch tests and publishes one combined Pages artifact. Pages
uses GitHub Actions, rather than the previous main-branch legacy build.
`main` and `development` are not merged or modified.

Production `/` is byte-for-byte `index.html` from main commit
`58fba72b3caefc18e17222b8b40f0efb5ebb67b2` (4.0). The builder fails if main
moves; review and repin production before the next deployment. Future main
pushes alone do not publish while Pages is configured for Actions.

Preview source is the exact `v5.0.0-rc.1` commit
`bc5d6d3232a854868cca6a8cc756d155cbd001ca`. This self-contained HTML has no
external asset paths or service worker. The only deployment transformation
prefixes the three localStorage read/write/delete calls with
`citadel.preview.v5.0.0-rc.1:`. All gameplay and assets are unchanged. A
reversibility assertion verifies this boundary; build.json records SHA-256
hashes and pinned commits. The deployed HTML thus differs from the tag only
in its save namespace, necessary because both paths share an origin.

Preview saves, settings, records and legacy progress are separate. Existing
production saves are neither migrated nor overwritten. Continue in preview
resumes only preview progress, using the same URL and Safari storage.

CI runs RC1 smoke/gameplay, rendering/DPR, adaptive quality, and final artifact
checks in Chromium and WebKit. The latter verifies production save preservation,
preview start/save/reload/continue/deletion, touch controls and rotation.
Linux WebKit does not replace the user's physical-iPhone acceptance session.

To stop serving RC1 and restore legacy publishing, switch Pages back to
Deploy from a branch: main, root. This leaves browser saves untouched.
