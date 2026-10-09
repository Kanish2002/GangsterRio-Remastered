# Original Java ME analysis

Target is the 2D Java ME edition of Gameloft's Gangstar Rio: City of Saints, distinct from the 3D smartphone edition. Gameloft's 2011 feature-phone announcement names the title; the inspected copy was supplied privately by the user. No game download is distributed or recommended here.

## Inspected reference

SHA-256: `417b94698c1d4f1d17b966c86fbe2da8bd3846926922af693ba22ba5e9c6364d`.
Size: 1,483,741 bytes; 44 ZIP entries; 1,952,889 bytes expanded; 13 Java classes.

Manifest: MIDlet name Gangstar Rio: City of Saints; version 1.0.9; main class GloftGRIO; CLDC 1.1/MIDP 2.0; SEMC-Screen-Size 240,320. Vendor `mob.ua`, promotional site and modified description show repackaged metadata. This is **not authenticated as an untouched Gameloft release**. No matching original JAD was supplied. It cannot be identified as the most feature-complete edition solely from size or manifest. Other Nokia/S60/landscape/touchscreen variants were not lawfully obtained and compared.

## Inspection actually performed

ZIP inventory, manifest, class constant-pool analysis, CFR 0.152 reconstruction, and selected bytecode inspection. Private reconstructed files are excluded from the repository. Obfuscated overloads, reconstructed control flow, and decompiler warnings prevent claiming complete original source recovery.

| Class/group | Observed responsibility / confidence |
| --- | --- |
| GloftGRIO | MIDlet lifecycle; constructs the game canvas/thread; pauses and resumes it |
| a | Canvas + Runnable; monolithic state dispatch, input, rendering, resource decoding and RecordStore calls |
| e | Packed sprite/palette data and PNG assembly; IHDR/PLTE/tRNS/IDAT handling |
| f | Runnable audio manager, MIDP Manager/createPlayer and VolumeControl; additional helpers unresolved |
| g, i | Large entity/world/animation structures inferred from references; exact system boundaries unresolved |
| h | In-game promotional UI and an `igp19` RecordStore; this store is not evidence of mission progress |
| b, c, d, j, l | Constants/interfaces |
| k | Small helper; detailed role unresolved |

`a` contains a target loop interval of 66 ms, repaint/serviceRepaints and separate state dispatch phases. Actual elapsed-time handling and clamping also appear, so treating the game as a newly implemented fixed 15 Hz simulation would be inaccurate. This project executes the original loop unchanged. `pauseApp` invokes the original pause routine; `startApp` resumes it and resets elapsed time.

The archive has numbered resources 0–21 and subresources, `999`, `T`, `dataIGP`, and icon.png. Except for the icon, these are custom packed data rather than conveniently separated image/map/audio files. Sprite frames, mission scripts, collision geometry, weapons, and vehicle parameters have **not** been completely decoded. RMS accesses include open/get/add/set record/close; all game record names and schemas are not reconstructed.

## Working browser reference

Pinned upstream FreeJ2ME-Web was opened in Chromium; the supplied copy was imported locally, SonyEricsson/240×320/sound on selected. Observed original Gameloft splash, game artwork/loading, sound yes/no prompt, title continuation, opening boat cutscene, and playable beach tutorial. Animated NPCs, water, player, health HUD and minimap were visible. Keypad input advanced cardinal-direction tutorial to diagonal-direction instructions and changed player/camera position.

This establishes execution beyond menus. It does not verify combat, driving, all missions, police, economy, or a completed campaign. No independent desktop-emulator comparison or deterministic gameplay trace has been captured. These gaps must be resolved before claiming full fidelity or modifying gameplay presentation.

References: [Gameloft 2011 feature-phone announcement](https://www.gameloft.com/newsroom/gameloft-to-release-five-new-games-for-mobile-phones-by-the-end-of-2011), [FreeJ2ME-Web source](https://github.com/zb3/freej2me-web), [CFR](https://www.benf.org/other/cfr/).
