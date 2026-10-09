# Gangstar Rio — browser preservation player

Runs a user-provided Java ME JAR in a browser through pinned FreeJ2ME-Web and CheerpJ. This repository contains **no Gameloft game binary, decompiled game code, artwork, or music**. It is an emulation-first preservation milestone, not a completed HD remaster.

## Play

1. Open the deployed website, choose a lawfully obtained JAR, and wait for runtime preparation.
2. Optionally import the matching JAD. Choose the phone profile and native display size in Settings; supplied reference testing uses SonyEricsson, 240 × 320, sound enabled.
3. Click Launch. The original game has its own loading screens, sound prompt, title screen, and tutorial. First startup can take several minutes. No fake percentage is shown.
4. WASD/arrows send keypad 2/4/8/6, Space/Enter send 5, E sends 0, Q/R send left/right soft keys. The original numbered keypad is available for diagonals and game-specific commands. Settings remaps desktop keys. Touch buttons support simultaneous pointers. Gamepad axes/D-pad and face buttons are mapped; hardware verification is pending.
5. Use the original game's save option for progression. Toolbar Backup copies RMS records already written by the game. Export/import backs up those records, **not a live emulator snapshot**. Reload, continue the installed JAR, then import before Launch. Backups are tied to the exact JAR SHA-256.

JAR bytes, settings, and records stay in this browser's IndexedDB-backed storage. They are not uploaded by this application. Clearing site data, changing browser/origin, or private browsing can remove saves. Export important checkpoints. The browser runtime is downloaded from Leaning Technologies and requires network access at first startup.

## Develop

Node 24+, `tar`, and internet access:

```sh
npm test
npm run build
npm run preview
```

No npm dependencies are required. Build downloads upstream commit `c19416e75cbc15f9a27f7e967ee81cb108761e30`, checks the emulator JAR checksum, packages the custom Java host bridge, and writes static output to `dist`. `RUNTIME_ARCHIVE=/absolute/path/to/source.tar.gz npm run build` supports an independently obtained matching source archive. Vercel uses `npm run build`, output `dist`, no server-side game engine.

The custom host bridge's Java 8 class is stored as base64 with its source. Recompile with Java 8+ (`javac --release 8 -cp /path/to/freej2me-web.jar -d /tmp/rio-host runtime-host/org/rio/HostBridge.java`), then base64-encode `/tmp/rio-host/org/rio/HostBridge.class` into `runtime-host/HostBridge.class.b64`.

## Evidence and limitations

See [original analysis](docs/original-game-analysis.md), [architecture](docs/architecture.md), [compatibility](docs/gameplay-compatibility.md), [asset inventory](docs/asset-manifest.md), [rights](docs/legal-provenance.md), [test results](docs/test-results.md), and [status/backlog](docs/implementation-status.md).

Original missions, vehicles, physics, AI, and difficulty run as original bytecode. That preserves the implementation, but **does not prove complete emulator compatibility**. The beach tutorial was reached in the upstream browser reference. Full campaign and variant comparison remain unverified. No HD assets, intermediate animation frames, spatial audio remix, or rewritten gameplay systems are implemented.

## Licenses

Custom integration: GPL-3.0-or-later. The distribution includes FreeJ2ME-Web's license, corresponding runtime source, and the custom bridge source. Third-party components retain their own notices. CheerpJ is a separately hosted proprietary runtime; verify [its licensing conditions](https://cheerpj.com/docs/licensing) before commercial deployment. This project is not affiliated with Gameloft.
