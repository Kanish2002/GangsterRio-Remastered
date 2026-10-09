# Gangster Rio Remastered — Java ME preservation lab

> **Status: browser emulator integration / compatibility-validation stage, not a completed HD remaster.**

This public project aims to provide a browser-based, user-supplied-JAR preservation workflow for the **2D Java ME edition** of *Gangstar Rio: City of Saints* (Gameloft, 2011). It does **not** bundle Gameloft's game, assets, music, missions, or proprietary code. No permission to redistribute those files has been established.

## What the first milestone does

- Presents a responsive browser launcher for desktop and mobile.
- Self-hosts the **FreeJ2ME-Web** Java ME runtime from a pinned upstream revision during the production build.
- Allows a user to install **their own lawfully obtained** Java ME JAR/JAD *inside the emulator* and attempt to launch it.
- Lets a user inspect basic JAR inventory and SHA-256 locally in their browser (the inspection tool does not upload the JAR).
- Uses the emulator's existing local game installation and RMS persistence capabilities where supported, with import/export available in the runtime.
- Keeps the existing game's original compiled behavior in the emulation path; there is **no reconstructed or verified original game logic** in this repository yet.

**Not yet achieved:** verified gameplay of *Gangstar Rio* on this runtime, cross-version mission comparison, original-game bytecode study, sprite replacement, HD art, sound remastering, or custom modern game controls. No original game files have been supplied.

## Quick start

Install Node.js 20+.

```sh
npm test
npm run build
npm run preview
```

The production build downloads the pinned FreeJ2ME-Web source archive from GitHub and includes its open-source runtime files. Network access is required during the first build and when running CheerpJ in the browser. To validate just this project's UI offline: `SKIP_RUNTIME_FETCH=1 npm run build` (the actual emulator will not be installed).

Open the shown local URL. To play, choose **Open emulator** and use the emulator's **Select JAR file** form to import your legitimately acquired game. The emulator has its own settings for display resolution, phone type, key mappings, import/export, and save data.

## Controls

FreeJ2ME-Web maps arrow keys to movement, Enter to action, 0–9 to keypad, F1/Q to left soft key, F2/W to right soft key, E to *, R to #, and Esc to emulator settings. These are **emulator defaults**, not verified Gangstar-specific controls. The runtime provides on-screen controls for touchscreen devices.

## Licensing and provenance

- Game: © Gameloft; **not included**. Upload only a legally acquired JAR/JAD that you are authorized to use. The uploader belongs to the browser-hosted emulator; this website does not transmit game files to its own backend.
- Runtime: [zb3/freej2me-web](https://github.com/zb3/freej2me-web), derived from FreeJ2ME, GPL-3.0-or-later and third-party component notices in its [LICENSE](https://github.com/zb3/freej2me-web/blob/main/LICENSE).
- Runtime is pinned to Git commit `c19416e75cbc15f9a27f7e967ee81cb108761e30`. The production site offers the full archived upstream source at `/runtime/freej2me-web-source.tar.gz` and the upstream license at `/runtime/LICENSE`. The upstream runtime includes the externally supplied CheerpJ component, subject to its own terms and connectivity.
- This repository's additional launcher and inspection code is distributed under GPL-3.0-or-later, to keep license obligations clear.

The project is not affiliated with or endorsed by Gameloft or the FreeJ2ME-Web maintainers.

See [Architecture](docs/architecture.md), [Research](docs/original-game-analysis.md), [Status](docs/implementation-status.md), and [Legal provenance](docs/legal-provenance.md).

## Deployment

Create a Vercel project from `Kanish2002/GangsterRio-Remastered`, set Framework Preset to **Other**, Build Command to `npm run build` and Output Directory to `dist`. The runtime files need HTTP Range support; Vercel's static hosting is intended to provide this, but confirm with an actual range request.

Do not add copyrighted game packages to `public/`, `dist/` or GitHub. The final result requires a real Java ME game compatibility test and permission-aware artwork production.
