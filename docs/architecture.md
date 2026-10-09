# Architecture decision: emulation first

The original remains an opaque but executable reference. Rewriting missions and physics before decoding and measuring them would introduce unverified behavior. We therefore run the user's unchanged Java bytecode with FreeJ2ME-Web, pinned to `c19416e75cbc15f9a27f7e967ee81cb108761e30`, on CheerpJ loader `20260317_2978`.

FreeJ2ME-Web supplies MIDP/CLDC APIs and canvas, input, RMS, media and MIDI bridges. CheerpJ supplies the browser Java runtime. FreeJ2ME-Web is GPL-3.0-or-later; CheerpJ has separate proprietary terms. Legacy Mozilla j2me.js was considered but not adopted; newer J2meJS redistribution/modification terms were unsuitable for this self-hosted integration. An independent compatibility benchmark remains pending.

## Actual modules

- `archive.js`: bounded ZIP directory parsing, safe paths, manifest continuation, streamed deflate, CRC checks and SHA-256 identity. Imported games are never server uploads.
- `runner.js`: CheerpJ native callbacks, original MIDlet installation and launch, phone configuration, key repeat, lifecycle pause, media/MIDI audio, backup calls.
- `eventqueue.js`: serialized Java event pump; drains the final queued event and deduplicates video frames.
- `input.js`: keyboard/touch/gamepad source ownership. Releasing one source cannot release a key held by another. Blur, pause and interrupted pointers release input.
- `app.js`: responsive game shell, settings, controls, local JAR continuation and checkpoint export/import.
- `storage.js`: IndexedDB for imported bytes, versioned host backup JSON and preferences. CheerpJ's `/files` filesystem independently persists installed JAR/config/RMS.
- `HostBridge.java`: invokes the original protected MIDlet pause/start lifecycle and exports/imports the corresponding RMS directory. Import is permitted before launch only, validates paths/expanded size, and restores old data on failure.
- `build.mjs`: reproducible pinned runtime packaging and matching license/source distribution. `serve.mjs`: local static server including HEAD and byte-range handling needed by the Java runtime.

Each exact JAR gets `rio-<first 24 SHA-256 hex>` as its installation ID. Backup validation checks the full SHA-256. Display scaling changes output pixels only; original canvas dimensions and simulation remain native. Phone/display settings apply at launch. Master gain affects MIDI and media; separate original music/effect/ambient streams cannot be reliably distinguished and are not independently mixed.

## Lifecycle and persistence

A user click unlocks Web Audio. Launch then starts the original MIDlet. Pause suspends its timing using pauseApp, not just drawing. Browser backgrounding releases input, pauses and requests a checkpoint backup; background scheduling/storage flush is browser-dependent, so export is still necessary. Backups capture records the original game has written, not program counters, heap, or unsaved in-memory progress. 90-second backups do not invent mission autosave behavior.

The app is static and runs client-side. HTTPS is needed for audio worklets and modern APIs. No COOP/COEP headers are enabled without evidence that this runtime requires them. Canvas preserves the original render cadence; this project does not claim 60 FPS simulation or add interpolated original sprites. Mobile CSS and touch handlers are present; platform and performance verification are tracked separately.

## Enhancement boundary

No resource-substitution hook, HD atlas, animation interpolation, map reconstruction, or spatial audio replacement is yet implemented. A later authorized remaster requires decoders, frame/state mapping and original-vs-enhanced traces. Postprocessing alone is not an HD asset remaster.
