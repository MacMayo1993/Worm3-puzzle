# WORM-3 Optimization Quick Start Guide

This guide provides step-by-step instructions to implement the highest-priority optimizations for WORM-3.

## 🎯 Quick Wins (1-2 hours total)

### 1. Lazy Metrics (15 minutes)

**File**: `src/App.jsx:253-270`

**Change**:
```javascript
// Before
const metrics = useMemo(() => {
  let flips = 0, wormholes = 0, off = 0, total = 0;
  // ... iteration ...
  return { flips, wormholes, entropy };
}, [cubies]);

// After
const [showMetrics, setShowMetrics] = useState(false);

const metrics = useMemo(() => {
  if (!showMetrics) return null; // Skip computation!

  let flips = 0, wormholes = 0, off = 0, total = 0;
  // ... iteration ...
  return { flips, wormholes, entropy };
}, [cubies, showMetrics]);
```

**Expected Impact**: Eliminates 5-10ms per frame when metrics hidden

---

### 2. Manifold Map Caching (1 hour)

**Step 1**: Copy example file to src
```bash
cp docs/examples/manifold-cache.js src/utils/manifoldCache.js
```

**Step 2**: Update `src/game/manifoldLogic.js`
```javascript
// Add at top
import { buildManifoldGridMapCached } from '../utils/manifoldCache.js';

// Keep original function
const buildManifoldGridMapOriginal = function(cubies, size) {
  const map = new Map();
  // ... existing implementation ...
  return map;
};

// Replace export with cached version
export function buildManifoldGridMap(cubies, size) {
  return buildManifoldGridMapCached(cubies, size, buildManifoldGridMapOriginal);
}
```

**Step 3**: Add monitoring (optional, for development)
```javascript
// In App.jsx
import { logManifoldCacheStats } from './utils/manifoldCache.js';

useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const timer = setInterval(logManifoldCacheStats, 10000);
    return () => clearInterval(timer);
  }
}, []);
```

**Expected Impact**: 10-20x speedup in chaos mode (90% cache hit rate)

---

### 3. Copy-on-Write Cube Rotation (30 minutes)

**File**: `src/game/cubeRotation.js:25-76`

**Change**: Replace initial cloning logic
```javascript
// Before
export function rotateSliceCubies(cubies, size, axis, sliceIndex, dir) {
  const next = cubies.map(plane => plane.map(row => [...row])); // Full clone
  // ...
}

// After
export function rotateSliceCubies(cubies, size, axis, sliceIndex, dir) {
  // Copy-on-write: reuse unchanged planes/rows
  const next = cubies.map((plane, x) => {
    if (axis === 'x' && x !== sliceIndex) return plane; // Reuse plane

    return plane.map((row, y) => {
      if (axis === 'y' && y !== sliceIndex) return row; // Reuse row

      if (axis === 'z') {
        return row.map((cubie, z) => {
          if (z !== sliceIndex) return cubie; // Reuse cubie
          return { ...cubie };
        });
      }

      return [...row]; // Clone affected row
    });
  });

  // ... rest of function unchanged ...
}
```

**Expected Impact**: ~40-50% reduction in rotation time (40ms → 20ms on 5×5×5)

---

## 🚀 Advanced Optimizations (3-4 hours)

### 4. Chaos Neighbor Graph

**Step 1**: Copy example file
```bash
cp docs/examples/chaos-neighbor-graph.js src/game/chaosNeighborGraph.js
```

**Step 2**: Integrate in App.jsx
```javascript
import { useChaosNeighborGraph, createOptimizedChaosSystem } from './game/chaosNeighborGraph.js';

// In component
const neighborGraph = useChaosNeighborGraph(size);
const chaosSystem = useMemo(
  () => createOptimizedChaosSystem(neighborGraph),
  [neighborGraph]
);

// Replace existing chaos cascade logic with:
const stepChaos = useCallback(() => {
  const neighbors = neighborGraph.getNeighbors(
    currentTile.x,
    currentTile.y,
    currentTile.z,
    currentTile.dirKey
  );

  // ... rest of cascade logic using neighbors array ...
}, [neighborGraph, currentTile]);
```

**Expected Impact**: ~70% reduction in chaos cascade overhead (200ms → 60ms)

---

### 5. Throttled Win Detection

**File**: `src/App.jsx` (wherever detectWinConditions is called)

**During shuffle animation**:
```javascript
// Add throttle state
const [lastWinCheck, setLastWinCheck] = useState(0);
const WIN_CHECK_THROTTLE = 100; // ms

// In shuffle effect
useEffect(() => {
  if (!isShuffling) return;

  const timer = setInterval(() => {
    // ... shuffle logic ...

    // Throttled win check
    const now = Date.now();
    if (now - lastWinCheck > WIN_CHECK_THROTTLE) {
      const wins = detectWinConditions(cubies, size, flipMode);
      if (wins.rubiks || wins.sudokube || wins.worm) {
        setVictory(wins);
      }
      setLastWinCheck(now);
    }
  }, shuffleDelay);

  return () => clearInterval(timer);
}, [isShuffling, cubies, size, flipMode, lastWinCheck]);
```

**Expected Impact**: Reduces win detection calls during shuffle by 90%

---

## 📊 Testing & Validation

### Performance Monitoring

Add this to App.jsx during development:

```javascript
const perfMonitor = useMemo(() => ({
  measurements: { rotations: [], manifoldBuilds: [], winChecks: [] },

  measure(category, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.measurements[category].push(duration);
    if (this.measurements[category].length > 100) {
      this.measurements[category].shift();
    }

    return result;
  },

  report() {
    const avg = (arr) =>
      arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'N/A';

    console.table({
      'Rotation (avg)': avg(this.measurements.rotations) + 'ms',
      'Manifold Build (avg)': avg(this.measurements.manifoldBuilds) + 'ms',
      'Win Check (avg)': avg(this.measurements.winChecks) + 'ms'
    });
  }
}), []);

// Use it
const handleMove = (axis, slice, dir) => {
  const newCubies = perfMonitor.measure('rotations', () =>
    rotateSliceCubies(cubies, size, axis, slice, dir)
  );
  setCubies(newCubies);
};

// Report every 10 seconds
useEffect(() => {
  const timer = setInterval(() => perfMonitor.report(), 10000);
  return () => clearInterval(timer);
}, [perfMonitor]);
```

### Benchmark Commands

Run these in the browser console:

```javascript
// Test manifold cache
window.__benchmarkManifoldCache()

// Test chaos system
window.__benchmarkChaos()

// Visualize neighbor graph
const graph = new ChaosNeighborGraph(5);
graph.build();
window.__visualizeNeighbors(graph, 0, 0, 0, 'PZ')
```

---

## ✅ Validation Checklist

After implementing optimizations, verify:

- [ ] Cube rotations feel smoother
- [ ] Chaos mode cascades don't cause UI lag
- [ ] Metrics panel doesn't impact performance when closed
- [ ] No visual glitches or incorrect behavior
- [ ] Win detection still works correctly
- [ ] Console shows performance improvements in dev mode

### Expected Performance Gains

| Cube Size | Rotation (before) | Rotation (after) | Improvement |
|-----------|-------------------|------------------|-------------|
| 3×3×3     | ~8ms             | ~4ms             | 50%         |
| 4×4×4     | ~20ms            | ~10ms            | 50%         |
| 5×5×5     | ~40ms            | ~18ms            | 55%         |

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Manifold Build (cached) | 5ms | <0.1ms | 98% |
| Chaos Cascade (full) | 200ms | 60ms | 70% |
| Metrics (when hidden) | 5ms | 0ms | 100% |

---

## 🐛 Troubleshooting

### Issue: Cache not working

**Symptoms**: `logManifoldCacheStats()` shows 0% hit rate

**Fix**: Ensure you're using immutable updates for cubies:
```javascript
// Good: new array reference
const newCubies = rotateSliceCubies(cubies, size, axis, slice, dir);
setCubies(newCubies);

// Bad: mutating in place (breaks WeakMap cache)
cubies[x][y][z] = newCubie;
setCubies(cubies);
```

### Issue: Neighbor graph missing edges

**Symptoms**: Chaos cascades don't propagate to expected neighbors

**Fix**: Rebuild graph after size change:
```javascript
useEffect(() => {
  neighborGraph.build();
}, [size, neighborGraph]);
```

### Issue: Performance regression

**Symptoms**: Game feels slower after optimization

**Fix**:
1. Check browser console for errors
2. Run `perfMonitor.report()` to identify slow operations
3. Verify you didn't accidentally create nested loops
4. Make sure memoization dependencies are correct

---

## 📚 Further Reading

- Full optimization details: [docs/OPTIMIZATION_RECOMMENDATIONS.md](./OPTIMIZATION_RECOMMENDATIONS.md)
- Example implementations: [docs/examples/](./examples/)
- React performance: https://react.dev/learn/render-and-commit
- Immer.js (advanced): https://immerjs.github.io/immer/

---

## 🎓 Next Steps

After completing quick wins:

1. **Measure baseline**: Run benchmarks before optimizing
2. **Implement P0 optimizations**: Lazy metrics + manifold cache (1 hour)
3. **Test thoroughly**: Verify no regressions (30 minutes)
4. **Deploy**: Push to production
5. **Monitor**: Collect user feedback on performance
6. **Plan P1 optimizations**: Schedule advanced optimizations based on profiling data

---

**Last Updated**: 2026-02-04
**Status**: Ready for implementation
**Estimated Total Time**: 2-3 hours for P0, 3-4 hours for P1
