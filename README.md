# WORM-3

A Rubik's Cube realized on the real projective plane (RP²)

WORM-3 is an interactive 3D puzzle that embeds Rubik's Cube mechanics on the real projective plane — a compact, non-orientable 2-manifold formed by identifying antipodal points on the 2-sphere.

In contrast to every conventional Rubik's Cube simulator, which assumes an orientable surface with six independent faces, WORM-3 enforces antipodal identification across opposite faces:

- Front ↔ Back (Red ↔ Orange)
- Left ↔ Right (Green ↔ Blue)
- Top ↔ Bottom (White ↔ Yellow)

This creates a single connected manifold with genuine non-orientability: closed paths can reverse handedness, and the configuration space contains parity states unreachable on the ordinary cube.

## Core Distinguishing Features

### Antipodal Flip Mechanics

Rotating or flipping any sticker immediately affects its antipodal counterpart through a visualized wormhole connection. These tunnels are not decorative; they are the geometric realization of the quotient map S² / ℤ₂ ≅ RP². Every action on one face propagates instantaneously to its identified partner.

### Topology-Aware Chaos Propagation

Instability spreads along manifold paths rather than Euclidean adjacency. Flip tallies accumulate on stickers, triggering chain reactions when thresholds are exceeded. Four chaos levels control propagation intensity:

- Level 1: Slow propagation, low chain probability
- Level 2: Moderate speed, increased likelihood
- Level 3: Fast waves, high instability
- Level 4: Maximum chaos with auto-rotation

Heat maps visualize accumulated flip counts, and timed activation windows (5-8 seconds) create urgency.

### Inherent Non-Orientable Parity

Real-time parity indicators distinguish even (cyan glow) from odd/fundamental-twist (purple glow) states. Certain configurations require sequences that correct projective twists — standard Rubik's algorithms may not suffice. The sledgehammer sequence (R' F R F') addresses common parity issues.

### Dual-Constraint Solving

Classic mode (color matching) can be combined with Sudokube mode (Latin squares per face), forcing simultaneous satisfaction of two independent algebraic structures on a non-orientable surface. Ultimate mode requires both constraints to be solved together.

### Black Hole Visual Environment

Custom GLSL shaders provide gravitational lensing, accretion disk, photon sphere, and Hawking radiation effects. The environment pulses in response to flip actions, creating a coherent aesthetic link between high chaos and the event horizon metaphor. Additional environment options include starfield and nebula themes.

No other known puzzle or simulator offers real-time visualization and interaction with Rubik's-style mechanics on a non-orientable manifold.

## Level System

WORM-3 features a 10-level progression system designed as a structured topology curriculum. Each level introduces one new concept, building player understanding from basic cube mechanics to full RP² mastery.

### Level Progression

| Level | Name | Size | Chaos | New Mechanic | Win Condition |
|-------|------|------|-------|--------------|---------------|
| 1 | Baby Cube | 2×2 | 0 | Basic slice rotations (WASD) | Classic |
| 2 | Twin Paradox | 2×2 | 0 | Wormhole tunnel visualization (T) | Classic |
| 3 | Flip Gateway | 3×3 | 0 | Antipodal flip mechanic (click) | Classic |
| 4 | Chaos Ripple | 3×3 | 1 | Chaos propagation mode (C) | Classic |
| 5 | Parity Gate | 3×3 | 1 | Parity indicators (even/odd) | Classic |
| 6 | Manifold Axes | 4×4 | 2 | Explode view (X), projective planes | Classic |
| 7 | Sudokube Veil | 4×4 | 2 | Sudokube mode (Latin squares) | Sudokube |
| 8 | Ultimate Seam | 4×4 | 3 | Ultimate mode (colors + numbers) | Ultimate |
| 9 | Quotient Collapse | 5×5 | 3 | Net view (N), full RP² topology | Ultimate |
| 10 | Black Hole | 5×5 | 4 | Epic cutscene, maximum chaos | Ultimate |

### Progressive Unlock System

- Level 1 and Level 10 are always available
- Completing a level unlocks the next in sequence
- Progress is saved to localStorage
- Completed levels display a green checkmark
- Locked levels show a padlock icon

### Level Tutorial System

Each level begins with an instructional overlay that explains:

- The new mechanic being introduced
- How it relates to RP² topology
- Practical tips for success
- Level statistics (cube size, chaos level, game mode)

Tutorials can be dismissed with the "Got it! Start Level" button or by pressing Space/Enter.

### Level 10: Singularity Cutscene

Level 10 features a 15-second cinematic introduction sequence:

**Phase 1 (0-3s): Emergence**
- Close-up on a solved 5×5 cube
- Title "SINGULARITY" reveals with purple gradient
- Slow rotation and camera pull-back

**Phase 2 (3-8s): Hyperspace Flight**
- Cube launches into the void
- 300 star streaks create hyperspace effect
- Five wormhole tunnels spawn with colored trails
- Text: "SEAMS TEAR... SYMMETRY BREAKS"
- Chromatic aberration distortion overlay

**Phase 3 (8-12s): Event Horizon**
- Black hole environment intensifies
- Cube spirals toward the singularity
- Text: "APPROACHING EVENT HORIZON"
- Haptic feedback on mobile devices

**Phase 4 (12-15s): Ignition**
- Cube snaps to gameplay position
- Text: "MASTER THE MANIFOLD / SURVIVE THE SINGULARITY"
- Seamless transition to shuffled game state

The cutscene can be skipped after 2 seconds via the Skip button.

## Solving Modes

### Classic Mode

Uniform color matching on the projective surface. Each face must display a single color when solved. The antipodal constraint means solving one face affects its opposite.

### Sudokube Mode

Each face must contain digits 1-9 (or 1-16 for 4×4, 1-25 for 5×5) without repetition in any row or column. This adds Latin square constraints on top of the manifold topology.

### Ultimate Mode

Both color and Sudokube constraints must be satisfied simultaneously. This is the most challenging mode, requiring management of two independent algebraic structures across antipodal identifications.

## Controls

### Keyboard Controls

| Action | Key | Description |
|--------|-----|-------------|
| Move cursor | Arrow keys | Navigate between stickers |
| Rotate slice up | W | Rotate the column slice upward |
| Rotate slice down | S | Rotate the column slice downward |
| Rotate slice left | A | Rotate the row slice leftward |
| Rotate slice right | D | Rotate the row slice rightward |
| Rotate face CCW | Q | Counter-clockwise face rotation |
| Rotate face CW | E | Clockwise face rotation |
| Flip sticker | F | Flip sticker at cursor (when flip mode active) |
| Toggle tunnels | T | Show/hide wormhole connections |
| Toggle flip mode | G | Enable/disable sticker flipping |
| Toggle chaos | C | Activate chaos propagation |
| Toggle explode | X | Expand cube to reveal structure |
| Toggle net view | N | Show unfolded cube net |
| Cycle visual mode | V | Classic → Grid → Sudokube → Wireframe |
| Show help | H or ? | Display controls reference |
| Escape | Esc | Close menus, hide cursor |

### Mouse Controls

- **Left-click drag on cube edge**: Rotate the corresponding slice
- **Left-click on sticker**: Select sticker (shows cursor)
- **Left-click on sticker (flip mode)**: Flip sticker and its antipode
- **Right-click drag**: Rotate camera view
- **Scroll**: Zoom in/out

### Mobile / Touch Controls

- **Swipe on cube**: Rotate slices
- **Tap sticker**: Flip (when flip mode active)
- **Pinch**: Zoom
- **Two-finger rotate**: Orbit camera
- **Bottom toolbar**: Access all toggle functions

## Feature Reference

### Wormhole Tunnels

Bezier curve visualizations connecting antipodal sticker pairs. Toggle with T key or TUNNELS button. Tunnels pulse when flips propagate and use smart routing to avoid visual clutter.

### Explode View

Separates cubies to reveal internal structure and wormhole network. Toggle with X key or EXPLODE button. Useful for understanding how the three manifold axes (X, Y, Z) create the RP² topology.

### Net View

Displays the cube unfolded as a 2D net with all antipodal connections visible. Toggle with N key or NET button. Click stickers in net view to flip them.

### Chaos Mode

Activates instability propagation. Stickers with high flip tallies can trigger chain reactions. Four intensity levels available. Auto-rotate mode adds automatic slice rotations based on disparity levels.

### Solve Mode

Provides CFOP-style tutorial hints and algorithm suggestions. Highlights relevant stickers for each solving step. Includes cross, F2L, OLL, and PLL guidance adapted for the projective surface.

### WORM Mode

Alternative gameplay mode where a "worm" creature navigates the cube surface. The worm moves along stickers and must collect targets while avoiding obstacles. Demonstrates manifold connectivity through gameplay.

## Visual Modes

- **Classic**: Standard solid-color stickers
- **Grid**: Numbered grid overlay showing position indices
- **Sudokube**: Large centered numbers for Latin square solving
- **Wireframe**: Minimalist edge-only rendering with glow effects

## Settings

Accessible via the gear icon, settings include:

- Color scheme customization for all six faces
- Background theme selection (Dark, Midnight, Black Hole, Starfield, Nebula)
- Manifold style options for tunnel rendering
- Toggle for statistics display
- Toggle for face progress indicators
- Toggle for manifold footer

Settings persist to localStorage.

## Technical Implementation

### Stack

- React 18 with functional components and hooks
- Vite for development and production builds
- Three.js via @react-three/fiber for 3D rendering
- @react-three/drei for camera controls and helpers
- GSAP for cutscene animations
- Custom GLSL shaders for visual effects

### Architecture
src/
├── App.jsx                 # Main component, state management
├── game/                   # Core puzzle logic
│   ├── cubeState.js       # Cubie generation
│   ├── cubeRotation.js    # Slice rotation algorithms
│   ├── manifoldLogic.js   # Antipodal flip mechanics
│   ├── winDetection.js    # Victory condition checking
│   └── coordinates.js     # Position calculations
├── 3d/                     # Three.js components
│   ├── CubeAssembly.jsx   # Main cube with interactions
│   ├── Cubie.jsx          # Individual cube pieces
│   ├── StickerPlane.jsx   # Clickable sticker surfaces
│   └── BlackHoleEnvironment.jsx
├── components/
│   ├── menus/             # UI menu system
│   ├── screens/           # Full-screen overlays
│   │   ├── LevelSelectScreen.jsx
│   │   ├── Level10Cutscene.jsx
│   │   ├── LevelTutorial.jsx
│   │   └── VictoryScreen.jsx
│   └── overlays/          # HUD elements
├── manifold/              # Wormhole visualizations
├── worm/                  # WORM mode gameplay
└── utils/
├── levels.js          # Level definitions
├── constants.js       # Color mappings
└── colorSchemes.js    # Theme configurations
### Key Algorithms

**Antipodal Mapping**: O(1) lookup via manifoldMap for any sticker's antipodal partner based on grid coordinates.

**Chaos Propagation**: Chain-based system where flips increment tallies, and probability of propagation scales with accumulated tally and chaos level.

**Win Detection**: Checks both Rubik's condition (uniform face colors) and Sudokube condition (Latin squares) with short-circuit evaluation.

## Getting Started

```bash
git clone https://github.com/MacMayo1993/WORM-3.git
cd WORM-3
npm install
npm run dev
Build for production:
npm run build
npm run preview
Deploy to GitHub Pages:
npm run deploy
Live Demo
https://macmayo1993.github.io/WORM-3/
License
MIT License
Author
Mac Mayo
macmayo@mayomanifoldresearch.org
https://mayomanifoldresearch.org
WORM-3 exists to make non-orientable geometry tangible and playable.