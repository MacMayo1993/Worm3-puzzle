
# WORM-3  
**A Rubik's Cube Realized on the Real Projective Plane (RP²)**

WORM-3 is an interactive 3D puzzle that redefines the Rubik's Cube by embedding it on the **real projective plane (RP²)** — a compact, non-orientable 2-manifold obtained by identifying antipodal points on the 2-sphere.

Unlike conventional Rubik's Cube simulators, which operate on an orientable surface with six independent faces, WORM-3 enforces **antipodal identification** across three pairs of opposite faces:

- Front ↔ Back (Green ↔ Blue)
- Left ↔ Right (Orange ↔ Red)
- Top ↔ Bottom (White ↔ Yellow)

This identification produces a single connected manifold with profound topological consequences: the puzzle is **non-orientable**, meaning certain closed paths reverse handedness, and the group of reachable configurations includes parity cases impossible on the ordinary cube.

### Core Innovation

Any move that affects a sticker simultaneously affects its **antipodal counterpart** through a visualized wormhole connection. These connections are not cosmetic: they are the direct geometric realization of the quotient construction S² / ℤ₂ ≅ RP². Flipping a single sticker is therefore a global operation on the manifold, propagating effects in a manner dictated by projective geometry rather than Euclidean adjacency.

This design introduces entirely new solving mechanics:
- **Non-local flips** via wormhole tunnels
- **Topological chaos propagation** along manifold geodesics
- **Inherent parity anomalies** arising from non-orientability
- **Dual constraint solving** combining color matching with Latin-square (Sudokube) conditions on the twisted surface

No other publicly available puzzle implements a Rubik's-style mechanism on a non-orientable surface with real-time visualization of antipodal symmetry and manifold-aware dynamics.

### Key Features

- **Antipodal Wormhole Visualization**  
  Toggleable Bezier-curve tunnels with particle effects and color-gradient transitions connect each sticker to its antipode.

- **Chaos Propagation System**  
  Flip tallies drive instability levels. High activity triggers propagating waves, heat maps, and timed activation windows (5–8 seconds). Propagation follows manifold topology, not 3D distance.

- **Parity & Orientation Indicators**  
  Real-time display of even (cyan) or odd (purple) parity states, reflecting fundamental twists of the projective plane.

- **Exploded & Net Views**  
  Disassemble the cube to reveal the full manifold wiring; toggle wireframe or net overlays to inspect RP² structure.

- **Black Hole Environment**  
  Custom GLSL shader featuring gravitational lensing, accretion disk, and photon-sphere effects. The cube visually distorts as chaos intensity increases.

- **Solving Modes**  
  - Classic: uniform color matching  
  - Sudokube: Latin squares (1–9) per face  
  - Ultimate: simultaneous color and number constraints  

- **Algorithmic Assistance**  
  Tiles highlight when ready for known short sequences (sledgehammer, sexy move, anti-Sune variants adapted to antipodal symmetry).

- **Texture Customization**  
  Per-manifold material options (glossy, matte, metallic, holographic, carbon fiber, lava flow, circuit board, etc.) for visual personalization.

- **Performance & Accessibility**  
  Optimized for 60 fps on desktop and mobile. Full touch support with responsive layout.

### Pedagogical Design

WORM-3 is structured as a progressive 10-level curriculum that systematically introduces non-orientable topology through gameplay. Each level isolates and teaches one key concept, ensuring gradual mastery without requiring prior mathematical knowledge.

| Level | Title                  | Size   | Chaos Level | Primary Concept                          | Learning Outcome                                                                 |
|-------|------------------------|--------|-------------|------------------------------------------|----------------------------------------------------------------------------------|
| 1     | Elementary Cube        | 2×2    | 0           | Standard slice mechanics                 | Establish baseline Rubik's intuition                                             |
| 2     | Antipodal Identification | 2×2  | 0           | First antipodal pairs & wormholes        | Understand that opposites are topologically the same point                       |
| 3     | Inversion              | 3×3    | 0           | Single flips as ℤ₂ involutions           | Experience orientation reversal across seams                                     |
| 4     | Propagation            | 3×3    | 1           | Chaos waves & temporal seams             | Observe instability spreading along manifold paths                               |
| 5     | Parity                 | 3×3    | 1           | Even/odd parity & fundamental twists     | Recognize and correct non-orientable parity anomalies                            |
| 6     | Manifold Decomposition | 4×4    | 2           | Three independent axes (Z/X/Y)           | Map the three pairwise identifications that generate RP²                        |
| 7     | Dual Constraints       | 4×4    | 2           | Sudokube (Latin squares)                 | Solve under additional algebraic constraints on a twisted surface               |
| 8     | Composite Symmetry     | 4×4    | 3           | Combined color & number solving          | Manage conflicting symmetries across antipodes                                   |
| 9     | Non-Orientable Loops   | 5×5    | 3           | Full RP² topology & algorithmic resolution | Navigate closed paths that reverse handedness; master parity-correcting sequences |
| 10    | Singularity            | 5×5    | 4           | Complete system integration              | Solve under maximum chaos and visual immersion in the black-hole environment     |

Each level begins with a brief screen-recorded introduction that demonstrates the new mechanic. Winning a level unlocks the next, creating a clear path from basic cube-solving to confident manipulation of projective geometry.

### Technical Stack

- React + Vite
- Three.js (via react-three-fiber & drei)
- Custom GLSL shaders for wormholes, black-hole effects, and chaos displacement
- LocalStorage for progress persistence
- Mobile touch controls with responsive design

### Getting Started

```bash
git clone https://github.com/MacMayo1993/WORM-3.git
cd WORM-3
npm install
npm run dev
```

Build and preview:
```bash
npm run build
npm run preview
```

Deploy to GitHub Pages:
```bash
npm run deploy
```

Live version: https://macmayo1993.github.io/WORM-3/

### Roadmap

- Full 10-level progression with introductory sequences
- Advanced texture system with per-manifold selection
- Expanded algorithm library (antipodal sledgehammer variants, parity busters)
- Local leaderboard and achievement tracking
- Native ports (Godot) for desktop and mobile app stores

### Contribution

Contributions are welcome, particularly in the areas of:
- Additional topological variants (torus, Klein bottle)
- Performance optimizations for larger cubes
- Enhanced visual effects and shader work
- Bug reports on mobile devices

Please open an issue to discuss major changes before submitting a pull request.

### License

MIT License

### Author

Mac Mayo  
Independent Researcher  
macmayo@mayomanifoldresearch.org  
https://mayomanifoldresearch.org

WORM-3 was created to make non-orientable geometry tangible and playable.  
Solve the cube. Understand the manifold.
```
