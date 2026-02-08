# WORM-3 UI & UX Improvement Suggestions

Focused recommendations for improving the user interface and user experience, organized by priority.

---

## Critical: Mobile Responsiveness

### C1. Level Select Grid Breaks on Small Screens
**File:** `src/components/screens/LevelSelectScreen.jsx`

The 5-column grid layout is hardcoded and doesn't adapt to viewport width. On phones, this produces 5 tiny, untappable level buttons.

**Fix:** Use responsive column counts:
- Desktop (>768px): 5 columns
- Tablet (480-768px): 3 columns
- Phone (<480px): 2 columns

Also increase `gap` on mobile from 10px to 16px for larger touch targets.

### C2. TopMenuBar Overflows on Mobile
**File:** `src/components/menus/TopMenuBar.jsx`

The stats panel packs four stat items (Moves, Flips, Pairs, Time) into one row with fixed gaps. On narrow screens these wrap unpredictably, and 9px labels become unreadable.

**Fix:**
- Show only Moves and Time on mobile; hide Flips/Pairs behind a tap-to-expand
- Increase label font from 9px to 11px on mobile
- Use `flex-wrap: wrap` with a defined minimum item width

### C3. Controls Bar Overflows
**File:** `src/App.jsx` (controls-row, lines 691-770)

The bottom toolbar has 12+ buttons in a single row. On mobile, `flex-wrap` causes a chaotic multi-row layout with tiny buttons (0.45rem font, 35px min-width).

**Fix:**
- On mobile, show only the 4-5 most-used buttons (FLIP, SHUFFLE, RESET, LEVELS, visual mode)
- Move secondary controls (CHAOS levels, EXPLODE, TUNNELS, NET, SOLVE, HANDS) into the MobileControls FAB menu
- Use icon-only buttons with tooltips instead of text labels on small screens

### C4. Tutorial/Modal Padding Too Aggressive
**Files:** `Tutorial.jsx`, `LevelTutorial.jsx`, `SettingsMenu.jsx`, `HelpMenu.jsx`

Multiple modals use 32-48px padding, which on a 375px-wide phone leaves only ~280px of usable content width.

**Fix:** Use responsive padding: `padding: clamp(16px, 4vw, 48px)`

### C5. CubeNet Panel Unusable on Mobile
**File:** `src/components/CubeNet.jsx`

The 2D net uses a fixed cross layout requiring 4 columns. Individual sticker cells on a 5x5 cube become ~12px wide on mobile — untappable.

**Fix:**
- On mobile, display one face at a time with face-navigation arrows
- Add pinch-to-zoom on the net panel
- Increase minimum cell touch target to 44x44px

---

## High Priority: Interaction Feedback

### H1. No Feedback on State Changes
**Components:** TopMenuBar, SettingsMenu, all buttons

When a user changes a setting, shuffles, resets, or achieves a win condition, there's no visual confirmation. Stats update silently.

**Fix:**
- Flash the move counter briefly when it increments (subtle scale + color pulse)
- Show a toast notification when settings save ("Settings saved")
- Add a brief highlight animation on the Shuffle and Reset buttons when clicked
- Play the vibration feedback (`audio.vibrate()`) on button presses, not just flips

### H2. Unclear Active Button States
**File:** `src/App.css` (btn-compact)

Active buttons use a blue background (`rgba(59, 130, 246, 0.75)`) but locked buttons use similar dark tones. The difference between "active", "inactive", and "locked" is too subtle.

**Fix:**
- Active: solid blue background + checkmark icon or underline accent
- Inactive: transparent background with white border
- Locked: grayed out with visible lock icon + reduced opacity (current 40% is good)
- Add a brief transition animation when toggling between states

### H3. Drag/Swipe Preview Missing
**File:** `src/3d/CubeAssembly.jsx`

When users start dragging to rotate a slice, there's no preview of what will happen until the rotation completes. On mobile, accidental swipes can rotate the wrong slice.

**Fix:**
- Show a ghost/transparent preview of the rotation destination while dragging
- Add direction arrows on the edges of the slice being rotated
- Display the slice axis label ("Row 2 →") near the cursor during drag

### H4. Parity Indicator Unexplained
**File:** `src/components/menus/TopMenuBar.jsx`

"EVEN" and "ODD" parity labels appear with color coding but no explanation. New players have no idea what parity means or why it matters.

**Fix:**
- Add a tooltip on hover/tap: "Even parity = solvable with standard moves. Odd parity = requires a flip to fix."
- Link to the relevant help section
- Consider hiding parity until Level 5 (which introduces parity as a mechanic)

---

## High Priority: Visual Consistency

### V1. Inconsistent Color Language
**Across all components**

The UI uses at least 4 different color "languages":
- Blue (#3b82f6) for primary actions and active states
- Green (#22c55e) for success/shuffle
- Red (#ef4444) for chaos/danger
- Purple (#9370DB / #a78bfa) for levels and special modes

But these colors are applied inconsistently. Level 10 uses purple, Freeplay uses purple, and parity "odd" also uses purple — three unrelated concepts sharing a color.

**Fix:**
- Define a clear color token system: `--color-primary` (blue), `--color-success` (green), `--color-danger` (red), `--color-special` (gold/amber for special modes), `--color-muted` (slate)
- Replace hardcoded `rgba(59, 130, 246, ...)` values with CSS custom properties throughout
- Use amber/gold for level 10 (final boss) to distinguish from purple (educational)

### V2. Typography Inconsistencies
**Across all components**

At least 4 font families in use:
- Georgia/Times (retro theme in CSS base)
- System font stack (-apple-system, etc.) in buttons and modern UI
- Courier New (monospace) for stats and dev console
- "Product Sans" / "Google Sans" in intro/title

Labels range from 8px to 18px with no consistent scale.

**Fix:**
- Define a type scale: 10px (caption), 12px (label), 14px (body), 16px (subtitle), 20px (heading), 28px+ (display)
- Standardize on 2 font families: system sans-serif for UI, monospace for stats/code
- Remove Georgia/serif references — they clash with the modern dark-mode UI
- Use `rem` units instead of `px` for better accessibility scaling

### V3. Border and Shadow Inconsistencies
**Across all components**

Border styles vary between:
- `1px solid rgba(255, 255, 255, 0.12)` (most common)
- `1px solid rgba(255, 255, 255, 0.15)` (buttons)
- `2px solid rgba(...)` (active states)
- `1px solid rgba(96, 165, 250, 0.5)` (primary buttons)

**Fix:**
- Define 3 border tokens: `--border-subtle` (0.08), `--border-default` (0.15), `--border-emphasis` (0.25)
- Use consistent box-shadow elevations: sm (4px), md (12px), lg (24px)

---

## High Priority: Onboarding

### O1. Tutorial is Text-Heavy with No Interactivity
**File:** `src/components/screens/Tutorial.jsx`

The 9-step tutorial explains concepts with static text. Users must read about "antipodal pairs" and "quotient spaces" without seeing them in action.

**Fix:**
- Replace steps 1-3 with an interactive mini-puzzle: show a 2x2 cube, highlight two paired stickers, let the user click to flip
- Add animated diagrams (using Three.js inline) showing the rotation → flip → solve loop
- Reduce to 5-6 steps max; move advanced topics (chaos, hands mode) to in-game contextual tips

### O2. No Contextual Help During Gameplay
**Files:** App.jsx, various components

After the initial tutorial, players are on their own. If they forget what the FLIP button does, they must open the full Help menu and scan 7 sections.

**Fix:**
- Add tooltips on hover/long-press for every toolbar button (e.g., "FLIP: Click stickers to swap colors with their antipodal partner")
- Show a one-time hint the first time each feature is used: "You just unlocked Chaos Mode! Stickers may cascade randomly."
- Add a "?" icon next to complex UI elements (parity indicator, chaos levels) that opens a focused explanation

### O3. Level Tutorial Doesn't Explain Feature Unlocks
**File:** `src/components/screens/LevelTutorial.jsx`

The "NEW FEATURES UNLOCKED" section shows tags like "Flips", "Tunnels", "Explode" but doesn't explain what they are or how to use them.

**Fix:**
- For each unlocked feature, show a 1-sentence description: "TUNNELS: Colorful lines connecting paired stickers across the cube"
- Add a "Try it now" prompt: "Press T to toggle tunnels on/off"
- Animate the new feature briefly on the background cube

---

## Medium Priority: Accessibility

### A1. No Keyboard Navigation in Menus
**Files:** All menu/overlay components

Menu items, buttons in settings, and level select grid can only be activated with mouse/touch. No tab-order or focus management exists.

**Fix:**
- Add `tabIndex` to all interactive elements in menus
- Trap focus within open modals (focus cycling)
- Support arrow keys for level grid navigation
- Add visible focus rings (`:focus-visible` styling) on all interactive elements

### A2. Missing Dialog Roles and ARIA Labels
**Files:** All overlay/modal components

No component uses `role="dialog"`, `aria-labelledby`, or `aria-modal="true"`.

**Fix:**
- Wrap each overlay in `role="dialog"` with `aria-modal="true"`
- Connect title elements with `aria-labelledby`
- Add `aria-label` to icon-only buttons (the MobileControls FAB partially does this)

### A3. Color-Only Information Encoding
**Files:** TopMenuBar (parity, achievements), LevelSelectScreen (locked/completed), CubeNet

Multiple UI states are communicated through color alone:
- Parity: cyan vs purple
- Level status: green (complete), blue (hover), dark (locked)
- Face progress bars: colored bars with no text labels

**Fix:**
- Add text labels alongside color indicators: "EVEN ✓" / "ODD ⚠"
- Add icons to level states: checkmark for complete, lock for locked, arrow for current
- Label face progress bars with face names ("Front: 8/9")

### A4. Motion Sensitivity (prefers-reduced-motion)
**Files:** VictoryScreen (confetti), chaos mode, all animations

The victory screen spawns 50 confetti particles; the WORM victory creates 30 wiggling emoji. No `prefers-reduced-motion` media query is respected.

**Fix:**
- Wrap all CSS animations in `@media (prefers-reduced-motion: no-preference) { ... }`
- In JS animations (confetti, cascades), check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and use simple fade transitions instead

### A5. Cube Net Has No Keyboard Support
**File:** `src/components/CubeNet.jsx`

The 2D net only responds to click events. Keyboard users can't navigate between sticker cells or trigger flips.

**Fix:**
- Add `tabIndex={0}` and `onKeyDown` handlers to cells
- Support arrow keys to move between cells within a face
- Support Enter/Space to flip the selected cell
- Show a visible focus indicator (border highlight) on the focused cell

---

## Medium Priority: Information Architecture

### I1. Help Menu is a Wall of Text
**File:** `src/components/menus/HelpMenu.jsx`

7 sections with 30+ keyboard bindings in one scrollable modal. Users looking for "how to flip" must scan the entire document.

**Fix:**
- Add a tab bar at the top: "Controls | Features | Modes | Keyboard"
- Add a search/filter input for quick lookup
- Use collapsible sections (accordion) so users see headers first
- Show the most relevant section first based on context (if chaos mode is active, show chaos help first)

### I2. Victory Screen Doesn't Explain Other Win Conditions
**File:** `src/components/screens/VictoryScreen.jsx`

When a player achieves a Rubik's solve, the victory screen shows a small hint about Sudokube — but doesn't explain what Sudokube IS or how to attempt it.

**Fix:**
- Add a "Discover more challenges" expandable section with brief descriptions of each win condition
- Show a visual preview of what Sudokube mode looks like (numbered grid)
- Add a "Switch to Sudokube Mode" button directly on the victory screen

### I3. Settings Have No Live Preview
**File:** `src/components/menus/SettingsMenu.jsx`

Changing color schemes, tile styles, or background themes requires closing the settings menu to see the effect on the 3D cube.

**Fix:**
- Make the settings panel narrower (side drawer instead of centered modal) so the cube is visible alongside
- Update the cube in real-time as settings change (Zustand store updates should already trigger re-renders)
- Add a mini preview cube inside the settings panel for color/tile changes

---

## Low Priority: Polish & Delight

### P1. Welcome Screen Skip Button Appears Too Early
**File:** `src/components/screens/WelcomeScreen.jsx`

The "Skip" button appears at 2 seconds — before the user has seen anything interesting (the explosion starts at 4s, wormholes at 7s). This encourages skipping before the educational content plays.

**Fix:**
- Delay "Skip" to 5 seconds (after the cube explodes, showing the concept)
- Rename to "Skip Intro" with a countdown showing how long until ENTER appears
- Or: replace with a progress bar at the bottom showing 0-10 seconds

### P2. Main Menu Is Static and Disconnected from 3D
**File:** `src/components/menus/MainMenu.jsx`

The Main Menu shows a text card over a dark overlay. The 3D cube is hidden behind it. This creates a disconnect between the visual identity (3D topology puzzle) and the menu (flat card).

**Fix:**
- Make the overlay semi-transparent so the cube is faintly visible behind the card
- Add a slowly-rotating cube animation in the background
- Or: add a small 3D cube preview inside the card, rotating to show the wormhole connections

### P3. Level Badge Obstructs Gameplay
**File:** `src/App.jsx` (lines 781-786)

The level badge (e.g., "4 Chaos Ripple") is fixed at `top: 80px, left: 24px`, which overlaps with the cube on smaller viewports.

**Fix:**
- Auto-hide the badge after 3 seconds, with a fade-out animation
- Show it again briefly on level changes
- Or: integrate it into the TopMenuBar instead of a separate floating element

### P4. No Loading State for 3D Canvas
**Files:** `WelcomeScreen.jsx`, `App.jsx`

The `<Suspense fallback={null}>` for the Environment shows nothing while loading. Users see a black screen until the HDR downloads.

**Fix:**
- Replace `fallback={null}` with a minimal loading indicator (spinning cube wireframe, or "Loading..." text centered in canvas)
- For the welcome screen, show the text overlay immediately while the 3D loads behind it

### P5. Victory Confetti Should Scale with Difficulty
**File:** `src/components/screens/VictoryScreen.jsx`

A 2x2 Classic solve and a 5x5 Ultimate WORM solve both get similar confetti. The celebration should match the achievement.

**Fix:**
- 2x2 Classic: subtle particles (10)
- 3x3 Classic: moderate confetti (25)
- Ultimate/WORM: full fireworks (50+) with camera shake and slow-motion replay of final move
- Scale particle count and animation duration with cube size and win condition rarity

### P6. No Transition Animations Between Screens
**Files:** All screen transitions

Screen transitions (Welcome → Tutorial → Main Menu → Level Select → Game) are instant cuts. This feels jarring.

**Fix:**
- Add fade transitions (200-300ms) between major screens
- Use slide-in for modals (settings, help) from the right/bottom
- Use scale+fade for level select (zoom into selected level)

---

## Summary: Top 10 UI/UX Priorities

| # | Issue | Category | Impact |
|---|-------|----------|--------|
| 1 | Mobile controls bar overflows with 12+ buttons | Mobile | Game unusable on phones |
| 2 | Level select 5-column grid breaks on mobile | Mobile | Can't select levels on phones |
| 3 | No interaction feedback (button presses, setting changes) | Feedback | Feels unresponsive |
| 4 | Tutorial is static text walls, not interactive | Onboarding | High player drop-off |
| 5 | Help menu is unsearchable wall of text | Information | Can't find answers quickly |
| 6 | Inconsistent color language across components | Visual | UI feels unprofessional |
| 7 | No keyboard navigation in menus/modals | Accessibility | Excludes keyboard users |
| 8 | Parity indicator shown without explanation | UX | Confuses new players |
| 9 | CubeNet panel unusable on mobile | Mobile | Feature inaccessible on phones |
| 10 | Settings have no live preview | UX | Trial-and-error workflow |
