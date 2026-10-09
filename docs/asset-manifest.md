# Asset inventory

| Asset | Included? | Source / status |
| --- | --- | --- |
| Game sprites, tiles, maps, music, scripts | No | Read locally from user-supplied JAR at runtime |
| HD characters/vehicles/environments | No | Not implemented; packed-resource decoder and permissions needed |
| New animation frames | No | Not implemented |
| Remixed sound effects or music | No | Not implemented |
| Host interface | Yes | Original CSS/text/buttons; no third-party artwork or font download |
| Emulator runtime + media/MIDI support | Yes, generated during build | Pinned FreeJ2ME-Web with license/corresponding source |
| HostBridge.class | Yes, base64 source-controlled | Compiled original GPL Java integration, not game code |

Crisp integer scaling, optional soft scaling and CRT scanlines are display treatments. They do not increase sprite detail or constitute a graphical remaster. No provenance claim is made for assets inside privately imported game files.
