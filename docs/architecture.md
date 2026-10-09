# Architecture decision record 001: emulation-first

The first milestone selects self-hosted [FreeJ2ME-Web](https://github.com/zb3/freej2me-web) for preservation of unchanged Java ME bytecode. Runtime source is pinned to `c19416e75cbc15f9a27f7e967ee81cb108761e30` and fetched during build. Static Vercel output contains the emulator inside `/emulator/`, not a game bundle. The upstream emulator uses CheerpJ (third-party proprietary web runtime), canvas/WebGL and an internal storage mechanism. Compatibility, save/export behavior, and phone controls belong to the upstream implementation and need target-game verification.

The root launcher is separate from the upstream code to reduce the risk of inadvertently changing its behavior. A later remaster may introduce authorized resource substitution, a postprocessing renderer or a controlled migration if the emulation approach cannot meet the acceptance criteria. Those features **are not implemented**.
