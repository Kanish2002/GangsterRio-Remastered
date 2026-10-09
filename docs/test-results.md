# Test results — 2026-10-10

## Automated

`npm test`: **13 passed, 0 failed**. Checks ZIP boundaries/path traversal/duplicates/CRC/deflate, manifest parsing, declared MIDlet class and checksum, overlapping input ownership, interrupted held keys, gamepad dead zone/mapping, backup schema/JAR mismatch/base64 rejection, HTTP MIME/HEAD/byte ranges, final-event queue regression, and deterministic original audio-bank structure.

`RUNTIME_ARCHIVE=<matching pinned source> npm run build`: **passed**. Emulator SHA-256 validated; static runtime, Java 8 host JAR and corresponding source generated. No proprietary game is in output.

These tests cover custom host logic, not the original game's physics or mission code. The environment's Playwright Chromium installation failed on truncated browser downloads; managed local preview also failed on a restricted proc mount. Browser automation used the available cloud Chromium UI instead. Production testing is blocked: Vercel deployment API returned 403, not authorized for scope `kanish-tech`; no CLI credential is available. A local browser preview also returned ERR_CONNECTION_REFUSED.

## Browser reference

Upstream FreeJ2ME-Web: locally imported reference SHA-256 ending `36c6364d`, SonyEricsson 240×320, sound on. Reached original loading, sound prompt, intro and beach tutorial; keypad input advances tutorial and changes visible player/camera. No game-critical Java exception was observed in the inspected runtime log. Extension-injected metadata messages are separate from game execution.

## Unverified

Complete campaign, combat, vehicle handling, police, money, actual saved mission reload, external RMS compatibility, physical gamepads, real iOS/Android, independent desktop emulator, cross-browser support and measured sustained FPS/frame time/memory/input latency. These are open acceptance criteria, not passes.

## Additional Java check

Compiled the actual HostBridge with the pinned emulator API on Java 17 targeting Java 8. `RmsBridgeTest` passed real disk-backed export → mutate → import → exact-byte comparison. Traversal, oversized expanded ZIP, invalid archive and invalid app ID were rejected without changing the existing record. This tests the bridge; it does not prove browser flush behavior or original campaign checkpoint compatibility.

## CI browser check

GitHub workflow `Verify preservation host` builds an original, distributable Java ME fixture. Playwright launches it through this host, checks keyboard input, lifecycle pause, RMS export/import, reload persistence, a 390 px layout and visible touch button. Screenshots and JSON results are uploaded as a seven-day artifact. No proprietary game is passed to CI. Workflow run [38002090772](https://github.com/Kanish2002/GangsterRio-Remastered/actions/runs/38002090772) passed on commit ebe37afb25ee5f2ecf1b5635d176d501948949bf before the audio-bank substitution. The changed bank requires a fresh CI pass; the test fixture is not a substitute game.

## Audio-bank substitution check

The modified MIDI WebAssembly module compiled and instantiated in Node. All 128 program slots plus percussion produced finite, nonzero audio; minimum measured peak 0.03879. The test exercises actual FluidSynth output after replacing the complete embedded sample bank. This is synthesis validation, not a claim of authentic or HD remixed game audio.
