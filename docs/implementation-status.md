# Implementation status — 2026-10-10

This is an emulation-first preservation milestone. It is **not a completed HD remaster**.

| Feature | Status |
| --- | --- |
| Supplied JAR inventory, manifest, hash, selected bytecode/decompiler inspection | Completed, with authenticity and reconstruction limits |
| Upstream browser launch beyond menus into beach tutorial | Verified |
| Self-hosted pinned runtime build | Verified locally |
| Integrated local JAR/JAD import, keyboard/touch controls, settings and original lifecycle pause | Implemented; production tests pending |
| Original RMS backup/export/import and browser persistence | Implemented; production tests pending |
| Gamepad mapping | Unit tested; hardware test pending |
| Full original gameplay/campaign compatibility | Unverified |
| HD sprites, new animation frames, environmental artwork | Not implemented |
| Audio remix, spatial audio, separate music/effects/ambient sliders | Not implemented; original runtime audio + master gain only |
| GitHub source publication | Verified remote commit e8a9c9aae9f7101a19d14dfc60f1aea09f37deea |
| Vercel deployment | Blocked by 403: current connection lacks access to kanish-tech; no CLI credentials |
| Java RMS bridge | Real export/restore and rejected-import preservation test passed |
| CI browser integration | Added original fixture and workflow; execution pending |
| Mobile/iOS/fullscreen/performance targets | Unverified |

## Prioritized backlog

1. Verify custom production launch, controls, original pause, RMS export/import and refresh persistence; fix blockers.
2. Build repeatable original mission/vehicle/combat/police test matrix, save checkpoint traces and independent emulator comparison. Obtain authorized additional variants before selecting the most complete release.
3. Establish modification/distribution rights; decode packed sprite/frame/map/audio formats and map animation timing/collision alignment.
4. Implement opt-in resource substitution; draw authorized 2×/4× sprites and tiles. Validate the same gameplay traces before/after.
5. Add visual-only intermediate animation frames/effects and licensed audio replacement with measured timing. Retain original mode for comparisons.
6. Exercise Android/iOS, touch/gamepads, browser suspension/audio interruption; measure and optimize actual runtime performance.
7. Add PWA/offline distribution only after verifying licensing, cache sizes, storage eviction and CheerpJ hosting constraints.
