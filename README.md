# WORM-3

**A Rubik's Cube on the Real Projective Plane**

WORM-3 is an interactive 3D puzzle that embeds Rubik's Cube mechanics on the real projective plane (RP2) -- a compact, non-orientable 2-manifold formed by identifying antipodal points on the 2-sphere. Every conventional Rubik's Cube simulator assumes an orientable surface with six independent faces. WORM-3 does not. Here, opposite faces are the *same* face, viewed from the other side.

**[Play Live](https://macmayo1993.github.io/WORM-3/)**

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [The Mathematics](#the-mathematics)
- [Gameplay Overview](#gameplay-overview)
- [Level System: A Topology Curriculum](#level-system-a-topology-curriculum)
- [Solving Modes](#solving-modes)
- [Controls](#controls)
- [Visual Modes and Tile Styles](#visual-modes-and-tile-styles)
- [WORM Mode](#worm-mode)
- [Immersive Environments](#immersive-environments)
- [Settings and Customization](#settings-and-customization)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [License](#license)
- [Author](#author)

---

## Why This Exists

The real projective plane is among the most important surfaces in mathematics, yet it is almost never encountered outside abstract algebra and topology courses. It cannot be embedded in three-dimensional space without self-intersection, which makes it difficult to visualize and nearly impossible to build intuition about.

WORM-3 makes RP2 tangible. By mapping Rubik's Cube mechanics onto this surface, the puzzle forces you to *feel* non-orientability: closed paths reverse handedness, parity states emerge that are unreachable on the ordinary cube, and solving one face inevitably disrupts its antipodal partner. The mathematics is not decorative. It is the game.

No other known puzzle or simulator offers real-time visualization and interaction with Rubik's-style mechanics on a non-orientable manifold.

---

## The Mathematics

### The Real Projective Plane (RP2)

The real projective plane is the quotient space S2 / Z2, formed by identifying every point on the 2-sphere with its antipodal point. Equivalently, it is the set of all lines through the origin in R3.

WORM-3 implements this identification concretely. Each cube face is paired with its opposite:

| Face | Antipodal Partner | Color Pair |
|------|-------------------|------------|
| Front (+Z) | Back (-Z) | Red <-> Orange |
| Left (-X) | Right (+X) | Green <-> Blue |
| Top (+Y) | Bottom (-Y) | White <-> Yellow |

When you flip a sticker, its antipodal counterpart flips simultaneously. This is the geometric realization of the quotient map: the two stickers are literally the same point on RP2, viewed from opposite sides of the sphere.

### Non-Orientability

An orientable surface allows you to consistently define "clockwise" everywhere. RP2 does not. If you trace a closed path across the manifold identifications, you can return to your starting point with your orientation reversed -- like traversing a Mobius strip, but in two dimensions.

In WORM-3, this manifests as **parity**. Some cube configurations require sequences that correct a projective twist -- standard Rubik's algorithms fail because they assume orientability. The parity indicator distinguishes even states (cyan glow) from odd/fundamental-twist states (purple glow).

### Group Theory

The Rubik's Cube group on a standard 3x3 cube has approximately 4.3 x 10^19 elements. WORM-3's manifold identification creates additional constraints and symmetries. The antipodal pairing means every rotation affects two slices simultaneously in the topological sense, and the configuration space contains orbits unreachable on the ordinary cube.

The solve mode teaches CFOP method stages (Cross, F2L, OLL, PLL) adapted for the projective surface, exposing how standard group-theoretic algorithms must be modified when the underlying surface changes.

### Latin Squares and Constraint Satisfaction

In Sudokube mode, each face must form a valid Latin square: digits 1 through N (where N = size^2 for a size x size cube) with no repetition in any row or column. This adds an independent algebraic structure on top of the color-matching constraint.

Ultimate mode requires satisfying *both* constraints simultaneously -- color matching AND Latin squares across antipodal identifications. This is a genuine constraint satisfaction problem on a non-orientable surface.

### Chaos Theory and Cascades

Chaos mode introduces probabilistic propagation along manifold paths. A single flip increments a sticker's tally. When tallies exceed thresholds, flips cascade to manifold neighbors with probability determined by the chaos level. The system exhibits sensitive dependence on initial conditions: one flip can trigger chain reactions across the entire manifold, or it can dissipate immediately.

Four chaos levels control propagation parameters:

| Level | Propagation Speed | Chain Probability | Decay Rate |
|-------|-------------------|-------------------|------------|
| 1 | Slow | Low | High |
| 2 | Moderate | Increased | Medium |
| 3 | Fast | High | Low |
| 4 | Maximum | Very High + Auto-Rotate | Minimal |

At Level 4, the cube also auto-rotates based on scramble disparity -- the more disordered the cube, the more frequently it rotates itself.

---

## Gameplay Overview

### Free Play

The default mode. Choose any cube size (2x2 through 5x5), any background, and any visual mode. All features are available. Shuffle the cube and solve it however you like.

### Level Play

A structured 10-level curriculum that teaches one new concept per level. Start from a 2x2 cube learning basic rotations and progress to a 5x5 cube with full RP2 topology, chaos cascades, and dual-constraint solving. Levels unlock sequentially (with Level 10 always available as a challenge).

### Core Mechanics

- **Slice Rotations**: Drag on the cube or use WASD to rotate rows, columns, and depth slices
- **Antipodal Flips**: Click a sticker (in flip mode) to flip it and its antipodal partner through a wormhole connection
- **Camera Orbit**: Drag on empty space to orbit the camera and explore the 3D environment
- **Explode View**: Separate cubies to reveal the internal structure and wormhole network
- **Net View**: Unfold the cube as a flat 2D net with all antipodal connections visible

---

## Level System: A Topology Curriculum

Each level is set in a detailed 3D environment representing a stage of life, creating a narrative arc from childhood to the cosmos. The environments are not random -- they are metaphors for the increasing complexity of the topology being learned.

| Level | Name | Environment | Size | Chaos | New Concept | Win Condition |
|-------|------|-------------|------|-------|-------------|---------------|
| 1 | Baby Cube | Daycare | 2x2 | 0 | Basic slice rotations (WASD) | Classic |
| 2 | Twin Paradox | Elementary | 2x2 | 0 | Wormhole tunnel visualization (T) | Classic |
| 3 | Flip Gateway | Middle School | 3x3 | 0 | Antipodal flip mechanic (click) | Classic |
| 4 | Chaos Ripple | High School | 3x3 | 1 | Chaos propagation mode (C) | Classic |
| 5 | Parity Gate | College | 3x3 | 1 | Parity indicators (even/odd) | Classic |
| 6 | Manifold Axes | Office | 4x4 | 2 | Explode view (X), projective planes | Classic |
| 7 | Sudokube Veil | NASA | 4x4 | 2 | Sudokube mode (Latin squares) | Sudokube |
| 8 | Ultimate Seam | Rocket | 4x4 | 3 | Ultimate mode (colors + numbers) | Ultimate |
| 9 | Quotient Collapse | Moon | 5x5 | 3 | Net view (N), full RP2 topology | Ultimate |
| 10 | Black Hole | Singularity | 5x5 | 4 | Everything at maximum | Ultimate |

### Progressive Unlock System

- Level 1 and Level 10 are always available (start easy or jump to the deep end)
- Completing a level unlocks the next in sequence
- Progress saves to localStorage
- Completed levels show a green checkmark; locked levels show a padlock

### Level Tutorials

Each level begins with an instructional overlay explaining the new mechanic, how it relates to RP2 topology, practical tips for success, and level statistics. Tutorials can be dismissed with the "Got it! Start Level" button or by pressing Space/Enter.

### Level 10: Singularity Cutscene

Level 10 features a 15-second cinematic introduction built with GSAP timeline choreography:

**Phase 1 -- Emergence (0-3s)**: Close-up on a solved 5x5 cube. Title "SINGULARITY" fades in with a purple gradient. Slow rotation and camera pull-back.

**Phase 2 -- Hyperspace Flight (3-8s)**: The cube launches into the void. 300 star-streak particles create a hyperspace effect. Five wormhole tunnels spawn with colored trails following quadratic Bezier curves. Text: "SEAMS TEAR... SYMMETRY BREAKS". Chromatic aberration distortion overlay.

**Phase 3 -- Event Horizon (8-12s)**: The black hole environment intensifies. The cube spirals toward the singularity. Text: "APPROACHING EVENT HORIZON". Haptic feedback on mobile devices.

**Phase 4 -- Ignition (12-15s)**: The cube snaps to gameplay position. Text: "MASTER THE MANIFOLD / SURVIVE THE SINGULARITY". Seamless transition to shuffled game state.

The cutscene can be skipped after 2 seconds via the Skip button.

---

## Solving Modes

### Classic Mode

Uniform color matching on the projective surface. Each face must display a single color when solved. The antipodal constraint means solving one face affects its opposite -- you cannot treat them independently.

### Sudokube Mode

Each face must contain digits 1 through N^2 (9 for 3x3, 16 for 4x4, 25 for 5x5) without repetition in any row or column. This is a Latin square constraint layered on top of the manifold topology.

### Ultimate Mode

Both color and Sudokube constraints must be satisfied simultaneously. This requires managing two independent algebraic structures across antipodal identifications -- the hardest mode in the game.

### Solve Mode (CFOP Assistant)

An interactive solving guide based on the CFOP method (Cross, F2L, OLL, PLL), adapted for the projective surface. It highlights relevant stickers for each stage, provides algorithm suggestions (Sune, T-Perm, Sledgehammer), and tracks progress through the solve.

---

## Controls

### Keyboard

| Action | Key | Description |
|--------|-----|-------------|
| Move cursor | Arrow keys | Navigate between stickers (wraps across faces) |
| Rotate slice up | W | Rotate the column slice upward |
| Rotate slice down | S | Rotate the column slice downward |
| Rotate slice left | A | Rotate the row slice leftward |
| Rotate slice right | D | Rotate the row slice rightward |
| Rotate face CCW | Q | Counter-clockwise face rotation |
| Rotate face CW | E | Clockwise face rotation |
| Flip sticker | F | Flip sticker at cursor (requires flip mode) |
| Toggle tunnels | T | Show/hide wormhole connections |
| Toggle flip mode | G | Enable/disable sticker flipping |
| Toggle chaos | C | Activate chaos propagation |
| Toggle explode | X | Expand cube to reveal internal structure |
| Toggle net view | N | Show unfolded cube net |
| Cycle visual mode | V | Classic -> Grid -> Sudokube -> Wireframe |
| Show help | H or ? | Display controls reference |
| Escape | Esc | Close menus, hide cursor |

### Mouse

- **Left-drag on cube**: Rotate the corresponding slice
- **Shift + drag on cube**: Twist the face (rotate around face normal)
- **Left-click sticker (flip mode)**: Flip sticker and its antipodal partner
- **Drag on empty space**: Orbit camera around the cube
- **Scroll**: Zoom in/out

### Touch (Mobile)

- **Swipe on cube**: Rotate slices
- **Tap sticker**: Flip (when flip mode active)
- **Pinch**: Zoom
- **Two-finger rotate**: Orbit camera
- **Bottom toolbar**: Access all toggle functions

### Hands Mode (Speedcube Notation)

For experienced cubers, Hands Mode maps keyboard keys to standard Rubik's notation:

| Key | Move | Key | Move |
|-----|------|-----|------|
| I | U (Up) | K | U' (Up inverse) |
| J | R (Right) | L | R' (Right inverse) |
| F | L (Left) | D | L' (Left inverse) |
| H | F (Front) | G | F' (Front inverse) |

Supports double moves (U2), combo detection (Sexy Move, Sune, T-Perm), and TPS (turns per second) tracking with a rolling 5-second window.

---

## Visual Modes and Tile Styles

### Visual Modes

- **Classic**: Standard solid-color stickers
- **Grid**: Numbered grid overlay showing position indices
- **Sudokube**: Large centered numbers for Latin square solving
- **Wireframe**: Minimalist edge-only rendering with glow effects

### Tile Styles (13 per-face customizable styles)

Each of the six manifold faces can use a different material style, all implemented as custom shader materials:

| Style | Description | Type |
|-------|-------------|------|
| Solid | Flat color fill | Static |
| Glossy | Specular highlights | Static |
| Matte | Soft diffuse shading | Static |
| Metallic | Brushed metal with anisotropic highlights | Static |
| Carbon Fiber | Woven pattern texture | Static |
| Hex Grid | Honeycomb pattern | Static |
| Circuit | Tech traces with animated pulses | Animated |
| Holographic | Rainbow iridescence (view-dependent) | Animated |
| Pulse | Radial brightness waves | Animated |
| Lava | Molten flow (FBM noise) | Animated |
| Galaxy | Stars and nebula | Animated |
| Glass | Transparent with Fresnel glow | Static |
| Comic | Halftone dots and bold outlines | Static |

---

## WORM Mode

An alternative gameplay mode where a "worm" creature navigates the cube surface, demonstrating manifold connectivity through play.

### Surface Mode

The worm crawls across the cube surface using manifold neighbors. Cross-face transitions are handled automatically with direction remapping -- the worm seamlessly crosses from one face to its neighbor, exactly as paths behave on RP2. The worm must collect orbs while avoiding self-collision.

### Tunnel Mode

The worm travels *inside* antipodal tunnels -- the wormhole connections between identified faces. It follows Bezier curves through the cube's interior with smart routing to avoid self-intersection. Orbs spawn at tunnel midpoints. This mode makes the quotient map S2 -> RP2 physically traversable.

### Scoring

```
Score = (worm length x 100) + (orbs eaten x 50) + (warps used x 25)
```

---

## Immersive Environments

### Free Play Backgrounds

Free play offers **interactive HDR photo panoramas** loaded from real photographic environment maps. These are actual photographs that wrap around the scene in 360 degrees, creating a VR-like environment you can look around in.

**Interactivity:**
- Orbit the camera (drag on empty space) to look around the full panorama
- A gentle auto-drift keeps the environment slowly rotating when idle
- Photos are rendered crisp with vivid intensity
- The panorama also provides image-based lighting, so cube reflections naturally match the environment

| Background | Description |
|------------|-------------|
| Black Hole | Animated GLSL shader with accretion disk, gravitational lensing, photon sphere, and flip-reactive pulses |
| Sunset | Golden hour outdoor panorama |
| Forest | Dense canopy with dappled light |
| Sunrise | Dawn sky with warm tones |
| Park | Open outdoor parkland |
| Night Sky | Dark sky with natural stars |
| City Skyline | Urban skyline panorama |
| Apartment | Indoor apartment interior |
| Modern Lobby | Architectural interior space |
| Warehouse | Industrial interior |
| Photo Studio | Professional studio lighting |
| Dark | Solid black |
| Midnight Blue | Deep dark blue |

### Level Backgrounds (Life Journey)

Each level features a handcrafted 3D environment representing a stage in life, built entirely from Three.js geometry. These are not textures -- they are fully realized 3D scenes with lighting, shadows, and interactive elements that respond to gameplay.

**Daycare** (Level 1): Warm afternoon sunlight streams through a window, casting volumetric light across a playroom. A cube-net floor pattern uses all six face colors. A rotation-axis mobile hangs from the ceiling with three colored arrows (X=Red, Y=Green, Z=Blue) teaching the fundamental rotation axes. A shape-sorter toy, scattered crayons, a color-reference poster, and floating dust motes in the sunbeam complete the scene.

**Elementary Classroom** (Level 2): A chalkboard reads "Welcome to Miss Cole's Class". Twenty student desks in rows, a teacher's desk, gold stars floating near the ceiling, an alphabet banner, and warm window light create a familiar learning environment.

**Middle School Hallway** (Level 3): Two walls of lockers in blue tones stretch into the distance. Linoleum tile flooring, fluorescent ceiling lights, floating notebook papers, a water fountain, and an exit sign capture the transitional space.

**High School Cafeteria** (Level 4): A deliberately chaotic space with darker mood lighting. Cafeteria tables, floating food trays, red and blue vending machines, and multi-colored point lights (red, cyan, yellow) reflect the chaos mechanic being introduced.

**College Dorm Room** (Level 5): A late-night study scene. A desk lamp provides the only warm light. A laptop glows, a coffee mug sits nearby, bookshelves line the wall, floating study materials drift overhead, and moonlight filters through a window.

**Office** (Level 6): A cubicle farm with 12 workstations, each with monitors, desks, and chairs. Floating bar charts, a water cooler, fluorescent grid lighting, and corporate gray carpet capture the structured monotony.

**NASA Mission Control** (Level 7): A dark, tech-lit command center. A massive display wall (30m center screen plus side monitors) towers over three tiered rows of control consoles. Each console has dual monitors with cyan and green emissive glow. Data stream particles cascade through the air.

**Launch Pad** (Level 8): A rocket sits on a concrete platform under a night sky of 200 stars. The rocket has a white body, red nose cone, three fins, and engine nozzles. A red launch tower with cross beams stands alongside. Flame cones and smoke clouds billow from the engines.

**Lunar Surface** (Level 9): Gray terrain stretches to the horizon beneath 500 stars. Earth hangs in the sky -- a blue sphere with green continents and a thin atmosphere. Twenty craters dot the landscape. A gold lunar module with landing legs, an American flag, and a trail of astronaut footprints complete the scene.

**Black Hole** (Level 10): A custom GLSL shader environment featuring procedural gravitational lensing, an accretion disk with flowing hot/warm/cool bands, a photon sphere ring, and Hawking radiation glow. The entire environment pulses in response to flip actions.

---

## Settings and Customization

Accessible via the gear icon. All settings persist to localStorage.

### Color Schemes

Five built-in schemes plus fully custom colors:

| Scheme | Description |
|--------|-------------|
| Standard | Classic Rubik's colors (Red, Green, White, Orange, Blue, Yellow) |
| Neon | Bright fluorescent variants |
| Pastel | Soft muted tones |
| Mono | Grayscale with subtle differentiation |
| Custom | User-defined colors per face, with "Extract from Image" for automatic palette generation |

**Extract from Image**: Upload any image and the system uses k-means clustering (10 iterations) to extract 6 dominant colors, automatically assigning them to cube faces sorted by hue.

### Face Textures

Upload images to map onto individual cube faces. Textures are loaded as Three.js textures with sRGB color space and linear filtering.

### Per-Face Tile Styles

Each manifold face can use a different tile style from the 13 available options. Mix glossy with metallic, carbon fiber with holographic -- each face of the projective surface can have its own visual identity.

### UI Layout Toggles

- **Stats Bar**: Move counter, timer, entropy percentage
- **Manifold Footer**: Bottom panel with manifold state information
- **Face Progress Bars**: Per-face solve completion indicators

---

## Technical Architecture

### Stack

| Technology | Version | Role |
|------------|---------|------|
| React | 18.2 | UI framework with functional components and hooks |
| Three.js | 0.159 | 3D rendering engine |
| @react-three/fiber | 8.15 | React renderer for Three.js |
| @react-three/drei | 9.93 | Camera controls, environment maps, text, shadows |
| Zustand | 5.0 | State management (single store, 340 lines) |
| GSAP | 3.14 | Cutscene timeline animations |
| Vite | 5.4 | Development server and production bundler |
| Vitest | 4.0 | Test framework with UI |

### Source Structure

```
src/
├── App.jsx                          # Main component, Canvas setup, routing
├── App.css                          # Full design system (2000 lines)
│
├── game/                            # Core puzzle logic (pure functions)
│   ├── cubeState.js                 # Cubie generation and deep cloning
│   ├── cubeRotation.js              # 90-degree rotations and sticker remapping
│   ├── manifoldLogic.js             # RP2 antipodal identification and flips
│   ├── winDetection.js              # Victory condition checking (4 modes)
│   ├── solveDetection.js            # CFOP method stage tracking (460 lines)
│   ├── coordinates.js               # Grid positioning and world-space conversion
│   ├── cubeUtils.js                 # Edge detection and sticker iteration
│   └── handsInput.js                # Speedcube notation parsing and combos
│
├── hooks/                           # Custom React hooks (11 hooks)
│   ├── useGameStore.js              # Central Zustand store (340 lines)
│   ├── useCubeState.js              # Cube operations (rotate, flip, shuffle)
│   ├── useAnimation.js              # Rotation animation with GSAP snap
│   ├── useGameSession.js            # Timer and win detection loop
│   ├── useChaosMode.js              # Cascade propagation engine
│   ├── useCursor.js                 # Keyboard navigation with face wrapping
│   ├── useKeyboardControls.js       # Keybinding system
│   ├── useLevelSystem.js            # Level progression and feature gating
│   ├── useSettings.js               # Preferences and texture loading
│   ├── useHandsMode.js              # Speedcube control system with TPS
│   └── useUndo.js                   # Move reversal (max 10 history)
│
├── 3d/                              # Three.js components
│   ├── CubeAssembly.jsx             # Main cube with drag interactions
│   ├── Cubie.jsx                    # Individual cube pieces (RoundedBox)
│   ├── StickerPlane.jsx             # Clickable sticker surfaces with shaders
│   ├── TileStyleMaterials.jsx       # 13 custom shader materials
│   ├── BlackHoleEnvironment.jsx     # GLSL black hole shader
│   ├── BackgroundEnvironments.jsx   # 7 procedural shader backgrounds
│   └── LifeJourneyBackgrounds.jsx   # 9 realistic 3D scene environments
│
├── levels/                          # Level system
│   ├── schema.js                    # Level schema and BACKGROUNDS enum
│   └── data/                        # 10 level definition files
│       ├── level-01-baby-cube.js
│       ├── level-02-twin-paradox.js
│       └── ... through level-10-black-hole.js
│
├── components/
│   ├── menus/                       # UI menus
│   │   ├── MainMenu.jsx             # Play, Levels, Settings entry point
│   │   ├── TopMenuBar.jsx           # Stats, mode indicators, toggle buttons
│   │   ├── SettingsMenu.jsx         # Full settings panel
│   │   ├── HelpMenu.jsx             # Controls reference
│   │   ├── MobileControls.jsx       # Touch toolbar
│   │   └── DevConsole.jsx           # Debug state inspector
│   ├── screens/                     # Full-screen overlays
│   │   ├── WelcomeScreen.jsx        # First-launch introduction
│   │   ├── Tutorial.jsx             # General tutorial
│   │   ├── FirstFlipTutorial.jsx    # Flip mechanic tutorial
│   │   ├── LevelTutorial.jsx        # Per-level instruction overlay
│   │   ├── LevelSelectScreen.jsx    # Level grid with unlock states
│   │   ├── VictoryScreen.jsx        # Win celebration
│   │   └── Level10Cutscene.jsx      # 15-second cinematic (619 lines)
│   └── overlays/                    # HUD elements
│       ├── CursorHighlight.jsx      # Sticker selection indicator
│       ├── HandsOverlay.jsx         # Move trail, TPS, combos
│       ├── InstabilityTracker.jsx   # Chaos disparity bar
│       ├── RotationPreview.jsx      # Next-move preview
│       ├── FaceRotationButtons.jsx  # Touch rotation controls
│       └── SolveHighlight.jsx       # CFOP stage highlighting
│
├── manifold/                        # Wormhole visualizations
│   └── smartRouting.js              # Bezier curve routing (avoids cube)
│
├── worm/                            # WORM mode gameplay
│   ├── WormGame.jsx                 # Surface and tunnel worm logic
│   └── WormCamera.jsx               # Worm-following camera
│
└── utils/
    ├── colorSchemes.js              # Color schemes, tile styles, defaults
    ├── constants.js                 # Face/color mappings
    ├── audio.js                     # Audio pooling (4 instances/sound)
    └── levels.js                    # Level completion helpers
```

### Key Algorithms

**Antipodal Mapping** -- O(1) lookup. Every sticker is assigned a manifold grid ID (format `M{face}-{position}`). The manifold map provides instant access to any sticker's antipodal partner based on grid coordinates. Antipodal pairs: faces 1<->4, 2<->5, 3<->6.

**Slice Rotation** -- `rotateSliceCubies()` computes new 3D positions for all cubies in a slice via 90-degree vector rotation, then remaps sticker direction keys to maintain correct face assignments after the rotation.

**Drag-to-Rotate** -- Custom pointer handler system (not OrbitControls). Drag threshold: 5px mouse / 8px touch. The `mapSwipe()` function projects the drag vector onto the cube face plane, crosses it with the face normal to determine the rotation axis, then applies real-time rotation during drag with GSAP snap-to-nearest-90-degrees on release (0.15s, back.out easing).

**Chaos Propagation** -- Chain-based system. Flips increment per-sticker tallies. Propagation probability = `tally * chaos_level_factor`. When triggered, the flip cascades to manifold neighbors (not Euclidean neighbors), creating topologically-aware chain reactions.

**Win Detection** -- Short-circuit evaluation. `checkRubiksSolved()` verifies uniform face colors. `checkSudokubeSolved()` verifies Latin square property per face (no row/column repeats). Ultimate mode requires both. WORM mode requires all stickers to have traversed at least one wormhole.

**CFOP Solve Assistant** -- 460 lines tracking white cross edges, F2L corner-edge pairs, OLL yellow-face orientation, and PLL last-layer permutation. Provides algorithm suggestions (Sune, T-Perm, Sledgehammer) and highlights relevant pieces for the current solve stage.

**Wormhole Routing** -- Bezier curves connecting antipodal sticker pairs through the cube interior. Smart routing pushes control points perpendicular to the main axis to avoid intersecting the cube geometry.

**Audio Pooling** -- Four instances per sound effect in a round-robin pool. Prevents audio element recreation overhead during rapid successive rotations.

### State Management

A single Zustand store (`useGameStore.js`, 340 lines) manages all application state:

- **Cube state**: size, cubies array, manifold map
- **Game session**: moves, time, victory flags, undo history (max 10)
- **Visual modes**: classic/grid/sudokube/wireframe, flip mode, tunnels, explode, net view
- **Chaos state**: level (0-4), auto-rotate, cascades, upcoming rotations
- **Animation**: current animation, pending moves
- **UI state**: welcome, tutorial, help, settings, menus, cutscene, level tutorial
- **Level system**: current level, level data, completed levels
- **Hands mode**: move queue, TPS tracking, combo detection
- **Settings**: color scheme, custom colors, manifold styles, UI toggles

### Performance

- **HDR photo backgrounds**: Single texture lookup, zero per-frame overhead
- **InstancedMesh**: Dust motes, floor tiles use GPU instancing
- **Material sharing**: Custom shader materials cached and reused across tiles
- **Vector caching**: Reuses THREE.Vector3 objects in hot render paths
- **Component memoization**: useMemo for expensive calculations
- **Suspense boundaries**: Lazy loading for 3D scenes
- **Audio pooling**: 4 pre-allocated instances per sound, round-robin playback

### Design System (CSS)

Glass morphism throughout: `backdrop-filter: blur(12px)` on all panels. Dark slate backgrounds (#1E2332) with blue accent (#3B82F6). Responsive breakpoints for mobile (<768px) and landscape orientations. iOS safe-area support. Dynamic viewport units (100dvh) for mobile browser compensation. Touch targets minimum 44px.

---

## Getting Started

```bash
git clone https://github.com/MacMayo1993/WORM-3.git
cd WORM-3
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Deploy to GitHub Pages:

```bash
npm run deploy
```

---

## License

MIT License

---

## Author

**Mac Mayo**
macmayo@mayomanifoldresearch.org
https://mayomanifoldresearch.org

---

WORM-3 exists to make non-orientable geometry tangible and playable.
