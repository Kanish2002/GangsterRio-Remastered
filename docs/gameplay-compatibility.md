# Gameplay compatibility

Preservation approach: unchanged game bytecode controls movement, collision, combat, vehicles, AI, camera, missions and difficulty. Emulator API differences can still affect behavior and require testing.

| System | Evidence so far | Remaining verification |
| --- | --- | --- |
| Startup/loading/audio prompt | Reached in upstream Chromium reference | Custom-host production test |
| Beach tutorial/player movement | Cardinal/diagonal prompts, player/camera changes observed | Repeatable input/coordinate trace |
| NPC/water animation/HUD/minimap | Visible in original tutorial | Longer gameplay and rendering defects |
| Combat/weapons/damage | Original implementation loaded; not exercised | Actual fights and health/weapon comparisons |
| Vehicles/traffic/police | Not exercised | Enter/drive/exit/collisions and chase behavior |
| Campaign/progression/economy | Not completed | Mission-by-mission success/failure and rewards |
| Original RecordStores | API found by inspection; host integration present | In-game checkpoint → reload → continue progression |
| Original device save conversion | Not implemented | External RMS format mapping and exact-build tests |
| Other device editions | No lawful copies compared | Per-build mechanics/features matrix |

Known presentation difference: MIDI instrumentation uses original synthesized samples instead of upstream's unlicensed Roland bank. Sound is not identical to the reference. No gameplay differences are yet quantified. Lack of observed differences is not equivalence proof. The wrapper does not rewrite game rules; altered display resolution or incorrect phone profile may cause incompatibility and should match the original variant.
