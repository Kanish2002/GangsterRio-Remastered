# Test results — 2026-10-10

## Automated

`npm test`: **12 passed, 0 failed**. Checks ZIP boundaries/path traversal/duplicates/CRC/deflate, manifest parsing, declared MIDlet class and checksum, overlapping input ownership, interrupted held keys, gamepad dead zone/mapping, backup schema/JAR mismatch/base64 rejection, HTTP MIME/HEAD/byte ranges, and final-event queue regression.

`RUNTIME_ARCHIVE=<matching pinned source> npm run build`: **passed**. Emulator SHA-256 validated; static runtime, Java 8 host JAR and corresponding source generated. No proprietary game is in output.

These tests cover custom host logic, not the original game's physics or mission code. The environment's Playwright Chromium installation failed on truncated browser downloads; managed local preview also failed on a restricted proc mount. Browser automation used the available cloud Chromium UI instead. Production results are recorded below after actual tests.

## Browser reference

Upstream FreeJ2ME-Web: locally imported reference SHA-256 ending `36c6364d`, SonyEricsson 240×320, sound on. Reached original loading, sound prompt, intro and beach tutorial; keypad input advances tutorial and changes visible player/camera. No game-critical Java exception was observed in the inspected runtime log. Extension-injected metadata messages are separate from game execution.

## Unverified

Complete campaign, combat, vehicle handling, police, money, actual saved mission reload, external RMS compatibility, physical gamepads, real iOS/Android, independent desktop emulator, cross-browser support and measured sustained FPS/frame time/memory/input latency. These are open acceptance criteria, not passes.
