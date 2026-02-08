# WORM-3 Game Improvement Suggestions

A prioritized list of improvements to enhance gameplay, performance, polish, and long-term viability.

---

## 1. Gameplay & Mechanics

### 1.1 Scramble Quality Control
**Problem:** The shuffle currently applies random moves with no constraint on difficulty or solvability distance. This can produce trivially easy scrambles (a few moves from solved) or unreasonably hard ones.

**Suggestion:** Implement a controlled scramble algorithm that:
- Guarantees a minimum number of moves from the solved state (e.g., no two consecutive inverse moves)
- Avoids redundant moves (e.g., R followed by R' cancels out)
- Scales scramble depth to match the current level's intended difficulty
- For Sudokube/Ultimate modes, validates that the scrambled state is actually reachable

### 1.2 Move Notation & Replay System
**Problem:** There's no way to review what moves were made, share solutions, or learn from replays.

**Suggestion:**
- Implement standard Rubik's cube notation (R, U, F, L, D, B with ' for inverse, 2 for double) extended with WORM-3-specific flip notation (e.g., `F@(1,2)` for flip at position)
- Add a move log panel that shows the sequence of moves in notation form
- Support importing/exporting move sequences as text strings
- Add a replay mode that plays back a recorded solution with animation

### 1.3 Difficulty Curve Tuning
**Problem:** The jump from Level 5 (3x3 with parity) to Level 6 (4x4 with explode view) is steep. Players also lack practice options between levels.

**Suggestion:**
- Add optional "practice" sub-levels between major level transitions (e.g., 5a, 5b) that introduce one new mechanic at a time
- Add a free-play sandbox mode where players can pick any cube size and toggle mechanics independently
- Consider adding a difficulty selector (Easy/Normal/Hard) per level that adjusts scramble depth and chaos intensity

### 1.4 Hint System Enhancement
**Problem:** The solve mode (`SolveMode.jsx`) provides CFOP-style step highlights, but doesn't give actionable guidance for the unique manifold mechanics.

**Suggestion:**
- Add manifold-aware hints that explain *when* to use flips strategically (e.g., "Flip this pair to fix parity without disrupting the cross")
- Provide step-by-step guided tutorials for each win condition (Classic, Sudokube, Ultimate, WORM)
- Add a "next suggested move" feature that highlights which slice to rotate and in which direction
- Track common player mistakes and offer contextual tips

### 1.5 Undo System Expansion
**Problem:** The undo history is limited to 10 moves (`MAX_UNDO_HISTORY = 10` in `useGameStore.js:48`), which is insufficient for complex solves.

**Suggestion:**
- Increase the undo limit to at least 50 moves, or make it configurable in settings
- Add a redo capability (currently only undo exists)
- Add move bookmarking so players can save/restore specific states during a solve
- Show a visual timeline of the undo history

---

## 2. Audio & Feedback

### 2.1 Sound Effects
**Problem:** The audio system (`src/utils/audio.js`) is fully implemented with pooling, but no actual audio files exist. The game is completely silent.

**Suggestion:** Add sound effects for:
- **Slice rotations** - Satisfying mechanical click/snap (vary pitch slightly for consecutive moves)
- **Flips** - Ethereal "wormhole" whoosh sound with reverb
- **Chaos cascades** - Rising tension sound that escalates with cascade chain length
- **Victory** - Celebratory fanfare, different per win type (Classic vs Ultimate vs WORM)
- **UI interactions** - Subtle clicks for menu navigation, toggles
- **Level transitions** - Atmospheric transition sounds
- **Ambient background** - Subtle space ambience to complement the visual environments

Use Web Audio API or generate procedural sounds to avoid large asset downloads. Libraries like Tone.js or simple oscillator-based synthesis would work well for a retro-themed game.

### 2.2 Visual Feedback for Interactions
**Problem:** Some interactions lack clear visual confirmation, making it hard to know if an action registered.

**Suggestion:**
- Add a brief color flash or scale pulse on stickers when they are clicked/tapped
- Show a ghost preview of where a slice will end up before releasing a drag
- Add particle burst effects on successful flips (currently only the wave animation exists)
- Highlight the last-moved slice briefly after rotation completes

---

## 3. Performance

### 3.1 Three.js Rendering Optimization
**Problem:** Every state change triggers a full React re-render of the 3D scene. For 5x5 cubes (125 cubies x 6 stickers = 750 sticker meshes), this is expensive.

**Suggestion:**
- Use `React.memo` with custom comparators on `Cubie` and `StickerPlane` components to prevent unnecessary re-renders
- Use Three.js `InstancedMesh` for sticker rendering — all stickers of the same color can share a single draw call
- Implement frustum culling for wormhole tunnels (only render tunnels visible to the camera)
- Use `useFrame` selectively instead of React state updates for animations
- Consider using `@react-three/offscreen` for heavy computations

### 3.2 Black Hole Shader Performance
**Problem:** The gravitational lensing shader in `BlackHoleEnvironment.jsx` runs complex ray-marching calculations every frame. On lower-end devices this can drop below 30fps.

**Suggestion:**
- Add a quality setting (Low/Medium/High) that adjusts ray-march step count
- Render the black hole to a lower-resolution render target and composite it
- On mobile or low-power devices, fall back to a pre-rendered animated texture
- Cache the accretion disk calculation when the camera isn't moving

### 3.3 State Update Batching
**Problem:** Actions like chaos cascades can trigger many rapid state updates via Zustand, each causing a React re-render cycle.

**Suggestion:**
- Batch chaos cascade updates into a single state transition using Zustand's `set` with a callback that applies all cascaded flips at once
- Use `requestAnimationFrame` to throttle visual updates during cascades
- Debounce win detection checks — don't check after every single flip in a cascade chain

---

## 4. User Experience

### 4.1 Onboarding Improvements
**Problem:** The game introduces complex topology concepts (projective plane, antipodal mapping, non-orientable manifolds) without gradually building player intuition.

**Suggestion:**
- Add an interactive "topology playground" before Level 1 that lets players explore how flips work on a simple 2x2 cube without any win condition
- Use animated diagrams showing how the projective plane wraps (like a Mobius strip but 2D)
- Add tooltips on first encounter with each mechanic: "This sticker and its twin are connected across the manifold"
- Show a 2D net view side-by-side during early levels so players can see both the 3D cube and the unfolded connections

### 4.2 Mobile UX Polish
**Problem:** Touch controls exist but lack discoverability and refinement.

**Suggestion:**
- Add a gesture tutorial overlay on first mobile visit showing swipe, tap, pinch, and rotate gestures with animated hand icons
- Increase touch target sizes for stickers (currently the clickable area matches the visual sticker, which is small on mobile)
- Add edge-swipe gestures for quick menu access
- Support two-finger tap as an alternative to right-click for camera reset
- Add a "lock rotation" toggle so accidental camera movements don't interfere with slice rotations

### 4.3 Accessibility
**Problem:** No screen reader support, no high-contrast mode, limited keyboard-only optimization.

**Suggestion:**
- Add ARIA labels to all interactive elements and announce state changes (e.g., "Red face, row 2 column 1, currently green")
- Implement a high-contrast mode with distinct patterns/textures on stickers (not just colors)
- Add shape overlays (circle, triangle, square, star, diamond, hexagon) as an alternative to colors for color-blind players
- Make keyboard cursor navigation more prominent with better visual indicators
- Support Tab key navigation through menu items
- Add an audio description mode that speaks the current cube state

### 4.4 Progress Visibility
**Problem:** The top menu bar shows stats but doesn't give players a clear sense of overall campaign progress or what they're working toward.

**Suggestion:**
- Add a persistent campaign progress bar showing "Level 4/10 — 12/30 stars"
- Show a world map or constellation-style visualization of all levels with completion status
- Display personal best times/moves on the level select screen
- Add a statistics dashboard accessible from the main menu showing total play time, total moves, favorite mode, etc.

---

## 5. Content & Replayability

### 5.1 Custom Level Editor
**Problem:** Only 10 built-in levels exist. Once completed, there's limited reason to return.

**Suggestion:**
- Add a level editor that lets players configure: cube size, enabled mechanics (flip, chaos, wormholes), win condition, scramble depth, chaos intensity, and visual theme
- Support saving/loading custom levels as JSON
- Add a "share level" feature that generates a shareable URL with the level encoded in the hash/query string
- Consider a community gallery where players can browse and rate shared levels

### 5.2 Daily Challenge Mode
**Problem:** No recurring content to bring players back.

**Suggestion:**
- Add a daily challenge with a fixed seed (so all players solve the same puzzle)
- Use the date as the random seed to generate consistent scrambles
- Track daily challenge streaks and best times
- Show a global or friends leaderboard for daily challenge times

### 5.3 Speedcubing Mode
**Problem:** The hands mode exists but lacks competitive speedcubing features.

**Suggestion:**
- Add a proper speedcubing timer with inspection time (15 seconds) per WCA rules
- Support standard scramble notation display
- Track ao5, ao12, ao100 (average of 5, 12, 100 solves)
- Add split timing for each solve phase (cross, F2L, OLL, PLL for CFOP)
- Generate proper random-state scrambles using a Kociemba-like solver

### 5.4 Achievement System Expansion
**Problem:** Only 5 achievements exist (`first_steps`, `topology_master`, `speed_demon`, `perfectionist`, `completionist`), which is thin.

**Suggestion:** Add achievements for:
- "Manifold Master" — Complete a level using only flips and no regular rotations
- "Chaos Surfer" — Win a level while chaos cascade is at Level 3+
- "Minimalist" — Solve any level in under N moves (based on cube size)
- "Night Owl" — Play for 30+ minutes in a single session
- "Full Spectrum" — Win in all 4 win conditions (Classic, Sudokube, Ultimate, WORM)
- "Net Navigator" — Solve a level entirely using the 2D net view
- "Speed Demon Gold/Diamond" — Tighter time thresholds
- "Completionist+" — 3 stars on all levels
- Display achievements in a trophy case with unlock dates

---

## 6. Technical Quality

### 6.1 Production Readiness
**Problem:** `testMode: true` is hardcoded in `ProgressManager.js:534`, which unlocks all levels and bypasses progression.

**Suggestion:**
- Set `testMode: false` for production builds
- Use an environment variable (`import.meta.env.VITE_TEST_MODE`) to control this
- Add a hidden key sequence (e.g., Konami code) to toggle test mode at runtime for QA

### 6.2 Test Coverage
**Problem:** Only basic unit tests exist for `cubeState`, `cubeRotation`, `cubeUtils`, and `winDetection`. Core systems like manifold logic, chaos propagation, and level progression are untested.

**Suggestion:** Add tests for:
- `manifoldLogic.js` — Verify antipodal mappings are symmetric and complete for all cube sizes
- `coordinates.js` — Verify `faceRCFor` and `faceValue` for all 6 faces and all cube sizes
- Chaos system — Verify cascade propagation respects manifold topology, not just Euclidean neighbors
- Level system — Verify unlock logic, star calculations, and achievement triggers
- Integration tests — Test full gameplay flows (scramble → solve → win detection → progress save)
- Snapshot tests for 3D components to catch visual regressions

### 6.3 Code Deduplication
**Problem:** `faceRCFor` and `faceValue` are duplicated in `src/game/coordinates.js` and `src/3d/Cubie.jsx`.

**Suggestion:**
- Remove the duplicate in `Cubie.jsx` and import from `coordinates.js`
- Audit for other duplicated logic across components

### 6.4 TypeScript Migration
**Problem:** The entire codebase is plain JavaScript with incomplete JSDoc annotations. As complexity grows, type errors become harder to catch.

**Suggestion:**
- Incrementally migrate to TypeScript, starting with the `game/` directory (pure logic, no JSX)
- Define interfaces for `Cubie`, `Sticker`, `LevelDefinition`, `GameState`
- Use `@ts-check` comments in JS files as a lightweight intermediate step
- This would also unlock better IDE autocompletion and refactoring support

### 6.5 Error Boundaries
**Problem:** No React error boundaries exist. A crash in the 3D rendering layer takes down the entire app with no recovery option.

**Suggestion:**
- Add an `ErrorBoundary` component wrapping the Three.js Canvas
- On crash, show a friendly "Something went wrong" message with a "Reset & Retry" button
- Log errors to help with debugging (consider a lightweight error reporting service)

---

## 7. Social & Engagement

### 7.1 Share & Export
**Suggestion:**
- Add a screenshot button that captures the current 3D view (using `renderer.domElement.toDataURL()`)
- Add a "share solve" button that generates an animated GIF or short video of the last N moves
- Generate shareable links like `worm3.app/#/challenge/[encoded-state]` for sharing specific puzzle states

### 7.2 Leaderboards
**Suggestion:**
- Add local leaderboards per level (stored in localStorage) tracking top 10 times and move counts
- If a backend is added later, support global leaderboards
- Show position changes ("You improved from #5 to #3!")

### 7.3 Multiplayer Potential
**Suggestion:**
- Add a "race" mode where two players solve the same scramble simultaneously (split-screen or networked)
- Add a "puzzle relay" where players take turns making moves toward a shared goal
- Even without networking, a local hot-seat mode would add social play value

---

## 8. Visual Polish

### 8.1 Animation Smoothness
**Suggestion:**
- Add easing curves to slice rotations (currently linear). A slight ease-out makes rotations feel more physical
- Add a subtle bounce/overshoot at the end of snap rotations
- Animate cube size transitions (when changing from 3x3 to 4x4) with a morph effect instead of an instant swap
- Add camera shake on chaos cascade triggers for dramatic effect

### 8.2 Theme System
**Suggestion:**
- Allow players to customize sticker colors and cube body color
- Add unlockable visual themes tied to achievements (e.g., "Neon" theme for completing Level 10, "Gold" theme for all 3-star)
- Add seasonal themes (holiday colors, etc.)

### 8.3 Victory Celebrations
**Suggestion:**
- Scale victory celebrations based on difficulty — a 2x2 solve gets a modest confetti, a 5x5 Ultimate WORM solve gets the full cinematic treatment
- Add a slow-motion replay of the final move
- Show solve statistics in a polished card format (time, moves, efficiency rating)

---

## Summary: Top 10 Highest-Impact Improvements

| # | Improvement | Category | Impact |
|---|-------------|----------|--------|
| 1 | Add sound effects | Audio | Dramatically improves game feel |
| 2 | Fix `testMode: true` for production | Technical | Blocks proper level progression |
| 3 | Improve onboarding / topology tutorial | UX | Reduces player confusion and drop-off |
| 4 | Add scramble quality control | Gameplay | Ensures fair, balanced puzzles |
| 5 | Expand undo to 50+ moves with redo | Gameplay | Reduces frustration on hard levels |
| 6 | Optimize Three.js rendering | Performance | Enables smooth play on more devices |
| 7 | Add daily challenge mode | Content | Drives recurring engagement |
| 8 | Expand achievement system | Content | Gives players goals beyond campaign |
| 9 | Add mobile gesture tutorial | UX | Makes the game playable on mobile |
| 10 | Add error boundaries | Technical | Prevents unrecoverable crashes |
