COMMIT 1 — EXPAND WORLD, ENLARGE UI, ADD CHAOS METER

Suggested commit message:
feat: expand world and add large chaos-driven ui

Goal:
Turn the small sandbox into a bigger stage for future madness.
After this commit, the game should still be fully playable, but the world should feel larger, the UI should be easier to read, and the codebase should contain the main variables for future chaos gameplay.

==================================================
HIGH-LEVEL IDEA
==================================================
1. Increase the world size so the player has more space and more blocks to interact with.
2. Increase text size and UI visibility so effects and messages feel dramatic.
3. Introduce a global chaos / anger system that will drive later events.
4. Add a clear on-screen status area for objectives and warnings.
5. Keep all current mechanics working: movement, block placing, destroying, hotbar, save/load.

==================================================
FILES TO CHANGE
==================================================
- index.html
- style.css
- script.js
- README.md (optional at this stage)

==================================================
STEP-BY-STEP INSTRUCTIONS
==================================================

1. OPEN script.js AND FIND WORLD SIZE CONSTANTS.
   You likely have something like:
   - WORLD_W = 16
   - WORLD_H = 8
   - WORLD_D = 16

   Replace them with something noticeably bigger, for example:
   - WORLD_W = 28
   - WORLD_H = 12
   - WORLD_D = 28

   If rendering becomes too slow, reduce to:
   - WORLD_W = 24
   - WORLD_H = 10
   - WORLD_D = 24

   Required result:
   the world must feel larger than before.

2. FIND THE PLAYER INITIAL POSITION.
   Update it so the player starts near the center of the bigger world.
   Example:
   - x = WORLD_W / 2
   - y = WORLD_H - 2
   - z = WORLD_D / 2

   Required result:
   the player should spawn in a sensible visible area.

3. FIND THE TERRAIN GENERATION FUNCTION.
   It is probably called generateWorld().

   Increase terrain variety slightly:
   - keep sin/cos-based generation
   - increase height differences a little
   - place more trees than before
   - optionally add a rare special top block for future anomalies

   Concrete changes:
   - widen the variation of height by adjusting coefficients
   - call placeTree() more times, not just 2 places
   - distribute trees across the map, not only near center

   Required result:
   the map should not feel empty.

4. ADD GLOBAL CHAOS STATE TO script.js.
   Near other global state variables, add:
   - worldAnger = 0
   - maxWorldAnger = 100
   - worldPhase = 0
   - collectedCores = 0
   - totalCores = 3
   - activeEffects = object storing future effect timers
   - messageText = ""
   - messageTimer = 0
   - objectiveText = "Find anomaly cores"

   Required result:
   future chaos logic has a stable place in code.

5. FIND THE HTML UI AREA IN index.html.
   Add three new visible UI elements inside your main overlay:
   - a large chaos meter block
   - a large objective block
   - a large message banner

   Example IDs:
   - chaosPanel
   - chaosFill
   - objectivePanel
   - worldMessage

   Do not remove existing hotbar or coordinate elements.
   Only extend the UI.

   Required result:
   the HTML must contain visible placeholders for chaos and objectives.

6. OPEN style.css AND MAKE THE UI MUCH BIGGER.
   Increase text size for:
   - title
   - coords
   - selected block text
   - help text
   - objective text
   - world message text

   Specific direction:
   - title around 36px or larger
   - important labels around 20–28px
   - world message around 28–42px
   - chaos panel thick and easy to notice

   Also add styling for:
   - a wide chaos bar
   - a dramatic floating warning banner
   - stronger shadows and contrast

   Required result:
   the game must look more readable and more theatrical.

7. IN style.css, ADD A CSS CLASS OR ID FOR FULL-SCREEN EFFECTS.
   Add classes for future screen states, for example:
   - body.chaos-tilt
   - body.chaos-invert
   - body.chaos-wave

   You do not need to fully use them yet, but prepare them now.

   Required result:
   future commits can reuse these classes instead of hacking styles later.

8. GO BACK TO script.js AND WRITE updateChaosUI().
   This function must:
   - compute percent = worldAnger / maxWorldAnger
   - update chaosFill width
   - update objectivePanel text
   - update worldMessage visibility/content based on messageTimer

   Add a helper function:
   - showWorldMessage(text, duration)

   showWorldMessage should:
   - set messageText
   - set messageTimer
   - render the message in the big message block

   Required result:
   a single function controls the new status UI.

9. MODIFY BLOCK INTERACTION LOGIC.
   Find the code where destroying and placing blocks happens.

   Add chaos gain rules:
   - destroying a normal block: +1 anger
   - placing a block: +0.5 anger
   - destroying wood or leaves: +2 anger
   - optionally clamp value to maxWorldAnger

   Required result:
   actions must now feed the chaos system.

10. IN update(), ADD BASIC CHAOS DECAY.
   Every frame or every few frames:
   - reduce worldAnger slightly if the player is idle
   - clamp it to [0, maxWorldAnger]

   The decay must be small enough that chaos still matters.

   Required result:
   anger should not stay permanently maxed if player calms down.

11. ADD A SIMPLE PHASE SYSTEM.
   In script.js, create logic like:
   - if worldAnger < 20 => phase 0
   - if worldAnger >= 20 and < 45 => phase 1
   - if worldAnger >= 45 and < 75 => phase 2
   - if worldAnger >= 75 => phase 3

   Save the current phase in worldPhase.
   Do not add the crazy events yet.
   Only detect phase and maybe show a message when phase changes.

   Example messages:
   - "The world noticed you"
   - "Geometry is irritated"
   - "Reality is slipping"
   - "The world is no longer pretending"

   Required result:
   the player should feel progression already.

12. MAKE THE WORLD MESSAGE BIG AND CENTERED.
   In CSS and JS, make sure showWorldMessage() is readable and dramatic.
   This will be the main delivery channel for weirdness later.

13. VERIFY SAVE/LOAD STILL WORKS.
   Since the world is bigger, save data is larger.
   Make sure:
   - generation still works
   - loading old save does not completely break the game

   If needed, add a saveVersion variable.
   If old save is incompatible, regenerate world cleanly.

==================================================
WHAT MUST WORK AFTER THIS COMMIT
==================================================
- the world is much bigger
- the map feels less empty
- UI text is bigger and more visible
- there is a visible chaos/anger meter
- there is an objective panel
- there is a dramatic world message banner
- destroying/placing blocks changes chaos
- phase changes can already trigger warning text
- the game still loads and plays normally

==================================================
WHAT TO TEST MANUALLY
==================================================
1. Open the page.
2. Confirm the world is bigger.
3. Move around and ensure rendering is still acceptable.
4. Break blocks and verify chaos bar increases.
5. Place blocks and verify chaos bar increases slightly.
6. Wait a bit and verify chaos can slowly decrease.
7. Check that phase messages appear when chaos gets high enough.
8. Press R if you have reset and verify the game still recovers.
9. Reload the page and confirm save/load does not explode.

==================================================
DO NOT DO IN THIS COMMIT
==================================================
- do not add screen flipping yet
- do not add parasite blocks yet
- do not add win/lose conditions yet
- do not rewrite the whole rendering system

This commit is only the foundation for the fun chaos.
