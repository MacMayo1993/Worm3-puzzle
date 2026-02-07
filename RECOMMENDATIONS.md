# Improvement Recommendations for WORM-3

After reviewing the codebase, here are prioritized recommendations organized by impact and effort.

---

## 1. Critical: Decompose `App.jsx` (God Component)

**File:** `src/App.jsx` — 2,343 lines, 53 `useState` calls

This is the highest-impact improvement. The main component manages all game state, UI state, animation state, settings, and input handling in a single file. This makes the code difficult to reason about, test, and extend.

**Recommended decomposition:**

| Extracted Module | Responsibility | Approximate State Count |
|---|---|---|
| `useCubeState` hook | Cube data, rotations, flips, undo history | ~10 states |
| `useGameSession` hook | Level, victory, timer, shuffle tracking | ~8 states |
| `useSettings` hook | Persisted settings, color schemes, face images | ~5 states |
| `useUIState` hook | Menu visibility, tutorial flags, mobile hints | ~10 states |
| `useHandsMode` hook | Hands mode, move queue, TPS tracking | ~5 states |
| `useChaosMode` hook | Chaos level, cascades, auto-rotate, wave origins | ~6 states |
| `useAnimations` hook | Animation state, explosion, countdown | ~5 states |

The chaos mode logic alone (lines 346–534) is nearly 200 lines of complex `requestAnimationFrame` loop logic that could be extracted into its own hook with clear inputs/outputs.

**Alternative:** Introduce a state management library like Zustand. Its lightweight API maps well to game state (slices, subscriptions, no boilerplate) and would eliminate prop-drilling through 20+ component layers.

---

## 2. High Priority: Add Test Infrastructure and Coverage

**Current state:** Vitest is referenced but not installed. One test file (`src/__tests__/cubeState.test.js`) with 6 basic tests. The CI pipeline deploys without running any tests.

**Recommended actions:**

1. **Install Vitest:**
   ```bash
   npm install -D vitest @vitest/ui @vitest/coverage-v8
   ```

2. **Add test scripts to `package.json`:**
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

3. **Priority test targets** (pure logic, high complexity, no DOM needed):
   - `cubeRotation.js` — Verify rotation math is correct for all axes/directions
   - `manifoldLogic.js` — Antipodal mapping, flip propagation, neighbor detection
   - `winDetection.js` — All win conditions (rubiks, sudokube, ultimate, worm)
   - `coordinates.js` — Grid position calculations, world position conversions
   - `solveDetection.js` — CFOP algorithm detection

4. **Add test step to CI pipeline** (`.github/workflows/deploy.yml`):
   ```yaml
   - name: Run tests
     run: npm test
   ```

These game logic modules are pure functions with no DOM dependencies — ideal for unit testing.

---

## 3. High Priority: Add Lint Step to CI Pipeline

**Current state:** ESLint is configured in `eslint.config.js` but the CI pipeline does not run linting. Broken code can be deployed without any static analysis.

**Recommended additions to `package.json`:**
```json
"lint": "eslint src/",
"lint:fix": "eslint src/ --fix",
"format": "prettier --write \"src/**/*.{js,jsx}\"",
"format:check": "prettier --check \"src/**/*.{js,jsx}\""
```

**Add to CI pipeline before build:**
```yaml
- name: Lint
  run: npm run lint

- name: Check formatting
  run: npm run format:check
```

ESLint itself also needs to be installed — it's configured but not in `devDependencies`.

---

## 4. High Priority: Eliminate Duplicated Logic

The "onEdge" boundary check pattern is copy-pasted at least 4 times across the codebase:

- `src/App.jsx` lines 381–387 (chaos mode chain start)
- `src/App.jsx` lines 453–459 (chaos mode propagation)
- `src/App.jsx` lines 547–553 (disparity counter)
- `src/game/manifoldLogic.js` (implicit in neighbor logic)

**Recommendation:** Extract a shared utility:
```js
// src/utils/cubeHelpers.js
export const isOnEdge = (x, y, z, dirKey, size) =>
  (dirKey === 'PX' && x === size - 1) ||
  (dirKey === 'NX' && x === 0) ||
  (dirKey === 'PY' && y === size - 1) ||
  (dirKey === 'NY' && y === 0) ||
  (dirKey === 'PZ' && z === size - 1) ||
  (dirKey === 'NZ' && z === 0);
```

Similarly, the triple-nested `for (x) for (y) for (z)` iteration over cubies appears in many places and could use a helper like `forEachCubie(cubies, (cubie, x, y, z) => ...)`.

---

## 5. Medium Priority: Add React Error Boundaries

**Current state:** No error boundaries. A rendering error in any 3D component (shader compilation failure, WebGL context loss, malformed geometry) will crash the entire application with no recovery path.

**Recommendation:** Add error boundaries around:
- The `<Canvas>` component (Three.js / WebGL errors)
- Individual screen/overlay components
- The WORM mode game

This is particularly important for a WebGL application where GPU-related failures are common across different hardware.

---

## 6. Medium Priority: Fix Node.js Version Mismatch

**Current state:** `.nvmrc` specifies Node 18.x, but the CI pipeline uses Node 20. This means developers and CI may behave differently.

**Recommendation:** Align both to Node 20 (the version CI uses and the current LTS):
```
# .nvmrc
20
```

---

## 7. Medium Priority: Performance — Reduce Deep Cloning

**Current state:** Every rotation and flip calls `clone3D()`, which deep-copies the entire 3D cube state array. For a 5x5x5 cube, this clones 125 cubies with all their sticker objects on every single move.

**Recommendations:**
- **Structural sharing:** Only clone the cubies that actually change. For a slice rotation, only ~25 cubies move (one slice of a 5x5x5) — the other 100 can be shared by reference.
- **Immer:** Consider using Immer for immutable updates with structural sharing. It integrates well with React state and Zustand.
- **Benchmark first:** Profile with the React DevTools Profiler to confirm this is actually a bottleneck before optimizing.

---

## 8. Medium Priority: Accessibility

**Current state:** No accessibility considerations observed. No ARIA labels, no keyboard focus management for menus, no screen reader support, no reduced-motion media query support.

**Minimum recommendations:**
- Add `aria-label` attributes to interactive UI elements (buttons, menus)
- Respect `prefers-reduced-motion` for animations and particle effects
- Ensure keyboard navigation works for all menus (not just the cube cursor)
- Add focus trapping for modal dialogs (settings, help, tutorials)

---

## 9. Low Priority: Consider TypeScript Migration

**Current state:** Pure JavaScript with TypeScript `@types` packages installed as devDependencies (but unused). No JSDoc type annotations on most functions.

The game logic layer (`src/game/`) would benefit most from TypeScript. The cube state data model has complex shape requirements (nested 3D arrays, sticker objects with specific fields, direction enums) that are currently only documented in comments.

**Incremental approach:**
1. Enable `allowJs: true` and `checkJs: true` in a new `tsconfig.json`
2. Add JSDoc annotations to game logic functions first
3. Rename `.js` → `.ts` files one module at a time, starting with `src/game/`
4. Add a `CubeState`, `Sticker`, `Cubie`, and `Direction` type definitions

---

## 10. Low Priority: Add Error Tracking

**Current state:** Errors are silently caught and discarded (e.g., `catch {}` for localStorage, `catch(() => {})` for audio). No error reporting to any external service.

**Recommendation:** For a deployed application, consider adding lightweight error tracking (e.g., Sentry free tier) to catch WebGL crashes, unhandled promise rejections, and runtime errors in production. At minimum, the silent `catch {}` blocks should log to `console.warn` during development.

---

## Summary

| # | Area | Impact | Effort | Priority |
|---|------|--------|--------|----------|
| 1 | Decompose App.jsx | High | High | Critical |
| 2 | Add test coverage | High | Medium | High |
| 3 | Add lint/format to CI | High | Low | High |
| 4 | Eliminate duplicated logic | Medium | Low | High |
| 5 | React error boundaries | Medium | Low | Medium |
| 6 | Fix Node version mismatch | Low | Trivial | Medium |
| 7 | Reduce deep cloning | Medium | Medium | Medium |
| 8 | Accessibility | Medium | Medium | Medium |
| 9 | TypeScript migration | Medium | High | Low |
| 10 | Error tracking | Low | Low | Low |
