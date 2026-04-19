COMMIT 2 — WORLD EVENTS, SCREEN MADNESS, LYING UI, ANOMALIES

Suggested commit message:
feat: add world events screen distortion and anomaly gameplay

Goal:
Turn the game from a calm sandbox into a chaotic reactive world.
After this commit, the world must visibly fight back. The player must feel that their actions trigger distortions, lies, anomalies, and unstable block behavior.

==================================================
HIGH-LEVEL IDEA
==================================================
1. Use the chaos meter from commit 1 to trigger actual world events.
2. Add strong visual effects: shake, drift, screen tilt, upside-down mode.
3. Add lying hotbar labels and fake interface corruption.
4. Add anomaly blocks with real behavior.
5. Keep the game playable: weird, but still controllable.

==================================================
FILES TO CHANGE
==================================================
- style.css
- script.js
- index.html (only if you need extra message/debug nodes)

==================================================
STEP-BY-STEP INSTRUCTIONS
==================================================

1. OPEN script.js AND ADD A CENTRAL EFFECT STATE OBJECT.
   Add something like:
   - screenShakeTimer
   - screenShakePower
   - driftTimer
   - invertTimer
   - upsideDownTimer
   - liarHotbarTimer
   - blinkTimer
   - coughTimer
   - debugCorruptionTimer

   Required result:
   all temporary effects must be controlled through timers, not scattered booleans.

2. CREATE updateScreenEffects().
   This function should:
   - decrement all effect timers
   - compute current visual offsets / transforms
   - update CSS classes on body or main root

   Use body classes, for example:
   - chaos-tilt
   - chaos-invert
   - chaos-upside-down
   - chaos-wave

   For screen shake and drift:
   - use inline transform on the canvas or wrapping element
   - small random x/y offsets for shake
   - smooth sinusoidal offset for drift

   Required result:
   one function owns the screen madness.

3. IN index.html, IF NEEDED, WRAP CANVAS + UI INTO A ROOT CONTAINER.
   If your current structure makes transforms awkward, add a top-level wrapper like:
   - gameRoot

   Put canvas and overlay inside it.
   Then apply transforms to gameRoot instead of body if needed.

   Required result:
   you have a stable target for rotation / inversion / drifting.

4. OPEN style.css AND IMPLEMENT THE VISUAL EFFECT CLASSES.
   Add styles for:
   - upside-down rotation: rotate(180deg)
   - invert colors: filter/invert style if acceptable
   - tilt: small rotation, like 2–5 degrees
   - wave / floating feel: can be simulated via animation class

   Keep effects readable enough so the game is still playable.

   Required result:
   when classes are added, the whole screen visibly changes.

5. ADD PHASE-BASED WORLD EVENTS.
   In script.js, create a function like triggerPhaseEvents().
   This function should examine worldPhase and occasionally fire events.

   Example design:
   - phase 1: small shake, rare warning messages
   - phase 2: lying hotbar, drifting screen, cough event
   - phase 3: upside-down bursts, blink events, anomaly spread

   Do not run events every frame.
   Use cooldowns or random timers.

   Required result:
   higher chaos must produce stronger effects.

6. IMPLEMENT SCREEN SHAKE EVENT.
   Create a function:
   - triggerScreenShake(power, duration)

   Use it when:
   - player destroys special blocks
   - phase jumps upward
   - reality blink happens

   Required result:
   the screen physically reacts to major events.

7. IMPLEMENT DRIFT / FLOAT EVENT.
   Create a function:
   - triggerDrift(duration)

   During drift:
   - screen slowly moves left-right or up-down
   - maybe slight rotation
   - player should still be able to move

   Required result:
   the game looks like reality is slipping.

8. IMPLEMENT UPSIDE-DOWN BURST.
   Create a function:
   - triggerUpsideDown(duration)

   This should temporarily rotate the whole visible game 180 degrees.
   Keep the duration short, like 1–2 seconds.

   Also show a large message such as:
   - "Reality rotated"
   - "The sky disagrees"

   Required result:
   the game occasionally becomes dramatically disorienting.

9. IMPLEMENT REALITY BLINK.
   Create a function:
   - triggerRealityBlink()

   On blink:
   - briefly flash a message
   - randomly change a handful of blocks in the world
   - maybe convert some dirt to anomaly blocks
   - maybe trigger shake or invert colors for a moment

   Required result:
   the world must feel unstable, not static.

10. ADD LYING HOTBAR MODE.
   You already have hotbar text.
   Modify updateHotbar() so that if liarHotbarTimer > 0:
   - labels shown to the player are fake labels
   - actual block ids remain unchanged

   Example fake labels:
   - "maybe stone"
   - "human grass"
   - "approved geometry"
   - "nutritional dirt"

   Required result:
   the UI becomes untrustworthy without breaking core controls.

11. ADD FAKE DEBUG CORRUPTION.
   If you already have a fake debug overlay, corrupt it harder in higher phases.
   Add lines such as:
   - reality.dll failed
   - grass thread blocked
   - warning: stone became emotional
   - object world has opinions

   Make the text larger and more alarming than before.

   Required result:
   debug overlay must now support the chaos theme, not just be a tiny joke.

12. ADD ANOMALY BLOCK TYPES TO script.js.
   Introduce a few new block ids, for example:
   - BLOCK_EYE
   - BLOCK_PARASITE
   - BLOCK_CORE
   - BLOCK_FLESH

   Add names and colors for each.

   Required result:
   anomaly blocks exist as first-class block types.

13. PLACE ANOMALY BLOCKS INTO THE WORLD.
   Update generation or a post-generation pass:
   - place 1–3 cores hidden in the world
   - place a few eye blocks
   - place a few parasite seeds

   Spread them out, not all in one chunk.

   Required result:
   the world must now contain targets and threats.

14. IMPLEMENT EYE BLOCK BEHAVIOR.
   Add logic in update or event handling:
   - eye blocks can occasionally relocate
   - if player is near one, show a message
   - destroying it causes a larger anger spike and a shake burst

   Required result:
   eye blocks must feel alive.

15. IMPLEMENT PARASITE BLOCK SPREAD.
   Add a timed function, for example updateAnomalies().
   Once every N frames or once per second:
   - find parasite blocks
   - try to spread to neighboring dirt/grass/air according to a simple rule

   Keep spread limited, not explosive.
   For example, only allow 1–3 spread operations per tick.

   Required result:
   the player must feel pressure to deal with spreading corruption.

16. IMPLEMENT FLESH / CORRUPTED TERRAIN AS A SECONDARY EFFECT.
   When parasite spreads, maybe convert nearby grass into flesh.
   This is mainly visual, but helps the world feel infected.

17. MODIFY BLOCK INTERACTION FOR SPECIAL BLOCKS.
   In the mousedown handler:
   - if player destroys BLOCK_CORE, increase collectedCores and show a dramatic message
   - if destroys BLOCK_EYE, trigger strong event
   - if destroys BLOCK_PARASITE, reduce anger slightly or give relief
   - if destroys BLOCK_FLESH, maybe nothing or slight anger

   Required result:
   special blocks must matter.

18. UPDATE OBJECTIVE TEXT.
   Use the objective panel to display things like:
   - "Collect anomaly cores: 1/3"
   - "Destroy parasite growth"
   - "Survive phase 3"

   Required result:
   the player should know what they are trying to do.

19. ADD EVENT COOLDOWNS.
   Do not let screen flip, blink, cough, and shake all happen every frame.
   Add cooldown variables and check them before triggering events.

   Required result:
   chaos feels intentional, not broken.

==================================================
WHAT MUST WORK AFTER THIS COMMIT
==================================================
- chaos phases cause real visual changes
- the screen can shake
- the screen can drift
- the screen can briefly flip upside down
- the hotbar can lie temporarily
- anomaly blocks exist in the world
- eye blocks react strongly
- parasite blocks spread over time
- collecting or destroying special blocks matters
- the objective panel reflects the new gameplay

==================================================
WHAT TO TEST MANUALLY
==================================================
1. Start the game and verify it still loads.
2. Raise anger by breaking blocks.
3. Confirm phase transitions trigger real effects.
4. Confirm the screen can shake.
5. Confirm drifting works and stops after duration.
6. Confirm upside-down mode happens briefly and recovers.
7. Confirm hotbar labels lie without changing actual placement behavior.
8. Confirm parasite blocks spread over time.
9. Confirm eye blocks produce special reactions.
10. Confirm collected cores count can change if a core is destroyed.
11. Confirm none of these effects permanently soft-lock the game.

==================================================
DO NOT DO IN THIS COMMIT
==================================================
- do not add final win screen yet
- do not add final lose condition yet
- do not rewrite save system from scratch

This commit is about making the world feel actively insane.
