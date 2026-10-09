# Rights and provenance

A user supplied a Java ME game for private inspection and browser-local testing. Supplying a file is not evidence of redistribution or modification permission. The inspected manifest indicates repackaging; lawful acquisition and original authenticity have not been established independently. No proprietary JAR, JAD, extracted resource, decompiled source, or gameplay recording is committed or deployed.

The site accepts only local file import. File bytes go to browser IndexedDB and CheerpJ's persistent virtual filesystem, not this site's server. JAD URLs are not followed. The host's game-installation key derives from a SHA-256 checksum. Users must hold the necessary rights for their own use.

| Distributed material | Provenance / terms |
| --- | --- |
| Custom launcher, validation, tests and host bridge | Original project contributions; GPL-3.0-or-later |
| FreeJ2ME-Web | zb3/freej2me-web pinned commit c19416e75cbc15f9a27f7e967ee81cb108761e30; GPL-3.0-or-later, included license contains additional notices |
| ASM and other runtime components | Upstream license/source notices retained |
| MIDI synth / media decoder | Upstream Fluidsynth/LGPL and FFmpeg component notices/source retained in matching runtime source archive |
| CheerpJ | Remotely hosted Leaning Technologies runtime, separate licensing; eligibility must be assessed for actual deployment use |

The distribution serves the matching upstream source archive at `/runtime/freej2me-web-source.tar.gz`, upstream license at `/runtime/LICENSE`, and custom bridge source at `/runtime/host-source/org/rio/HostBridge.java`. Packaged sample games are removed from the playable runtime. Original upstream source packaging is retained for corresponding-source availability.

The project is not an official Gameloft product. Existing title references identify a compatibility target and do not confer asset rights. Commercialization or original-asset enhancement requires separately established permissions. Neither original game rights nor complete Java ME emulator compatibility are implied.
