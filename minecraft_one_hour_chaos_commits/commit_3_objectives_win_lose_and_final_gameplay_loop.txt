COMMIT 3 — OBJECTIVES, WIN/LOSE, ESCALATION, FINAL GAMEPLAY LOOP

Suggested commit message:
feat: add anomaly core objective fail states and final chaos loop

Goal:
Turn the chaotic sandbox into an actual short game.
After this commit, the player should have a clear objective, a reason to manage chaos, a path to victory, and a real risk of failure.

==================================================
HIGH-LEVEL IDEA
==================================================
1. Introduce a proper gameplay loop: explore, collect, manage chaos, survive.
2. Add a win condition tied to anomaly cores.
3. Add lose conditions tied to world collapse or parasite spread.
4. Improve pacing so the experience feels like a compact chaotic arcade run.
5. Keep everything readable enough for demo presentation.

==================================================
FILES TO CHANGE
==================================================
- script.js
- style.css
- index.html (if you want end-screen panels)
- README.md

==================================================
STEP-BY-STEP INSTRUCTIONS
==================================================

1. OPEN script.js AND ADD GAME STATE FLAGS.
   Add variables such as:
   - gameWon = false
   - gameLost = false
   - worldCollapse = 0
   - maxWorldCollapse = 100
   - parasiteCount = 0
   - maxParasiteCountBeforeLoss = choose a threshold
   - gameTimer = 0

   Required result:
   there must now be a distinct game progression state.

2. WRITE updateGameState().
   This function should:
   - skip dangerous logic if gameWon or gameLost
   - count parasite blocks periodically
   - update collapse based on current phase and parasite spread
   - check victory and defeat conditions

   Required result:
   one place decides whether the run is still alive.

3. DEFINE A WIN CONDITION.
   The simplest strong version:
   - player must collect all anomaly cores
   - collectedCores >= totalCores => trigger victory

   On victory:
   - gameWon = true
   - show giant message
   - calm screen effects
   - optionally reduce all chaos to zero

   Example messages:
   - "You convinced geometry to stand down"
   - "The world accepted your violence"
   - "Reality is stable. Probably."

   Required result:
   the player can actually finish the game.

4. DEFINE AT LEAST ONE LOSE CONDITION.
   Recommended combination:
   - if worldAnger remains too high for too long, worldCollapse rises fast
   - if parasiteCount exceeds threshold, lose
   - if worldCollapse reaches maxWorldCollapse, lose

   On loss:
   - gameLost = true
   - freeze most world updates
   - show giant failure message
   - optionally force upside-down or dark-red screen

   Example messages:
   - "The world replaced you"
   - "Geometry revoked your permissions"
   - "You were outvoted by blocks"

   Required result:
   player mistakes now matter.

5. ADD A WORLD COLLAPSE BAR TO THE UI.
   In index.html add a second bar panel if needed.
   In style.css make it visually distinct from chaos.
   In script.js write updateCollapseUI().

   Meaning:
   - chaos = immediate emotional state of the world
   - collapse = longer-term strategic danger

   Required result:
   players can read short-term and long-term danger separately.

6. COUNT PARASITE BLOCKS.
   In script.js, add a helper that scans the world and counts BLOCK_PARASITE and maybe BLOCK_FLESH.
   Run it periodically, not every frame if performance is an issue.

   Required result:
   you can use parasiteCount for loss conditions and UI.

7. MODIFY OBJECTIVE FLOW.
   Instead of one static objective string, make it dynamic.

   Suggested sequence:
   - if no cores collected: "Find anomaly cores"
   - if parasiteCount is high: "Destroy parasite growth"
   - if phase 3: "Survive and extract the last core"
   - if all cores collected: "Return to stability"

   Required result:
   the objective panel should guide the player, not just display flavor text.

8. MAKE SPECIAL BLOCKS SUPPORT GAMEPLAY BETTER.
   Improve interaction rules:
   - BLOCK_CORE: collecting it reduces anger a little and increments collectedCores
   - BLOCK_PARASITE: destroying it reduces collapse slightly or pauses spread briefly
   - BLOCK_EYE: destroying it triggers a punishment burst but maybe reveals direction via message
   - BLOCK_FLESH: mostly cosmetic, but can contribute to parasite pressure

   Required result:
   player choices should have tactical meaning.

9. ADD CORE HINT SYSTEM.
   Since the world is bigger now, the player needs help finding cores.
   Add a simple hint every few seconds:
   - locate nearest core
   - compare player position to core
   - show a directional hint in big text

   Examples:
   - "The core is east"
   - "Something hums below you"
   - "The world is hiding a heart to the north"

   Required result:
   exploration has purpose and does not become random wandering.

10. ADD A SHORT RELIEF WINDOW AFTER COLLECTING A CORE.
   After a core is collected:
   - reduce anger by a chunk
   - pause parasite spread briefly
   - show a big stabilizing message

   Required result:
   collecting a core feels rewarding, not neutral.

11. ADD A SOFT TIME PRESSURE.
   Increase gameTimer in update().
   Optionally:
   - after certain time, phase thresholds become easier to hit
   - or parasite spread becomes slightly faster

   Keep it mild.
   The goal is not to punish instantly, but to stop infinite stalling.

   Required result:
   the player cannot idle forever without consequences.

12. ADD END-SCREEN OR LARGE OVERLAY STATES.
   In index.html, add a hidden panel if needed:
   - endScreen
   - endTitle
   - endSubtitle

   In style.css:
   - make it full-screen or centered big overlay
   - large text, dramatic background, obvious win/lose feel

   In script.js:
   - show on win/loss
   - hide during normal play

   Required result:
   the run should end with a clear presentation, not a console log.

13. ADD RESTART / NEW RUN FLOW.
   If you already have R for reset, enhance it:
   - if gameWon or gameLost, R should cleanly regenerate the whole run
   - reset anger, collapse, effects, collected cores, timers, messages

   Required result:
   the demo can be replayed quickly.

14. CALM OR AMPLIFY VISUALS BASED ON OUTCOME.
   On victory:
   - remove upside-down and invert effects
   - show calm message
   - maybe return hotbar labels to normal

   On defeat:
   - stronger red tint, more drift, maybe permanent tilt
   - final absurd message

   Required result:
   endings must feel different.

15. UPDATE README.md.
   Add a compact description of the new gameplay:
   - larger world
   - chaos meter
   - collapse meter
   - anomaly cores
   - parasite spread
   - visual madness events
   - win/lose states

   Required result:
   the repo now describes the actual game loop.

==================================================
WHAT MUST WORK AFTER THIS COMMIT
==================================================
- the player has a real objective
- the player can win by collecting all cores
- the player can lose if the world collapses or parasite growth gets out of control
- the UI shows chaos, collapse, objectives, and major messages
- core collection feels meaningful
- the game can be restarted cleanly
- the whole experience feels like a short chaotic game, not just a sandbox

==================================================
WHAT TO TEST MANUALLY
==================================================
1. Start a new run.
2. Verify objective text makes sense.
3. Find and collect at least one core.
4. Confirm collected core count updates.
5. Confirm collecting a core creates a relief effect.
6. Let parasite spread and verify pressure increases.
7. Force chaos high and see if collapse rises.
8. Verify lose condition can trigger.
9. Verify win condition can trigger.
10. After win/loss, press R and verify a clean reset.
11. Verify overlay texts are large and readable.
12. Confirm the game still feels playable despite the visual insanity.

==================================================
DO NOT DO IN THIS COMMIT
==================================================
- do not completely redesign rendering
- do not add giant new systems unrelated to the core loop
- do not destroy performance with excessive full-world scanning every frame

This commit is about making the game finishable, replayable, and memorable.
