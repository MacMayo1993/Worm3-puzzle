import React, { useRef, useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import Cubie from './Cubie.jsx';
// DragGuide removed - real-time rotation provides visual feedback
import CursorHighlight from '../components/overlays/CursorHighlight.jsx';
import SolveHighlight from '../components/overlays/SolveHighlight.jsx';
import WormholeNetwork from '../manifold/WormholeNetwork.jsx';
import ChaosWave from '../manifold/ChaosWave.jsx';
import FlipPropagationWave from '../manifold/FlipPropagationWave.jsx';
import { vibrate } from '../utils/audio.js';
import { updateSharedTime } from './TileStyleMaterials.jsx';

// Reusable axis vectors and quaternion (allocated once, never recreated)
const _axisCol = new THREE.Vector3(1, 0, 0);
const _axisRow = new THREE.Vector3(0, 1, 0);
const _axisDepth = new THREE.Vector3(0, 0, 1);
const _rotQuat = new THREE.Quaternion();

// Mobile detection
const isTouchDevice = typeof window !== 'undefined' && (
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia('(pointer: coarse)').matches
);

// Drag threshold - small for immediate response
const DRAG_THRESHOLD = isTouchDevice ? 8 : 5;

// Pixels of drag to complete a 90° rotation
const PIXELS_PER_90DEG = 100;

// Long-press disabled - was too sensitive on mobile
// const LONG_PRESS_DURATION = 500;

const CubeAssembly = React.memo(({
  size, cubies, onMove, onTapFlip, visualMode, animState, onAnimComplete,
  showTunnels, explosionFactor, cascades, onCascadeComplete, manifoldMap,
  cursor, showCursor, flipMode, onSelectTile, onClearTileSelection, flipWaveOrigins, onFlipWaveComplete,
  faceColors, faceTextures, manifoldStyles, solveHighlights,
  onFaceRotationMode
}) => {
  const cubieRefs = useRef([]);
  const controlsRef = useRef();
  const cubeGroupRef = useRef(null);
  const gsapAnimRef = useRef(null);
  const animProgressRef = useRef({ value: 0 });
  const { camera } = useThree();
  const [dragStart, setDragStart] = useState(null);
  const dragStartRef = useRef(null); // Ref version for immediate access in listeners
  const [activeDir, setActiveDir] = useState(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  // Live drag rotation state - tracks real-time rotation as user drags
  const liveDragRef = useRef(null); // { axis, sliceIndex, angle, dir, basePositions, baseRotations }
  const [liveDragAngle, setLiveDragAngle] = useState(0); // Triggers re-render for useFrame
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const skipNextAnimRef = useRef(false); // Skip animState animation after live drag

  // Pre-computed set of ref indices that belong to the current animation slice.
  // Computed ONCE when animation starts from the canonical grid positions,
  // so it's immune to floating-point drift from incremental rotations.
  const sliceIndicesRef = useRef(null);

  const getBasis = () => {
    const f = new THREE.Vector3();
    camera.getWorldDirection(f).normalize();
    const r = new THREE.Vector3().crossVectors(camera.up, f).normalize();
    const u = new THREE.Vector3().crossVectors(f, r).normalize();
    return { right: r, upScreen: u };
  };

  const normalFromEvent = e => {
    const n = (e?.face?.normal || new THREE.Vector3(0, 0, 1)).clone();
    const nm = new THREE.Matrix3().getNormalMatrix(e?.object?.matrixWorld ?? new THREE.Matrix4());
    n.applyNormalMatrix(nm).normalize();
    return n;
  };

  const sgn = v => v >= 0 ? 1 : -1;

  const mapSwipe = (faceN, dx, dy, isFaceTwist = false) => {
    // If face twist mode, rotate around the face normal itself
    if (isFaceTwist) {
      const ax = Math.abs(faceN.x), ay = Math.abs(faceN.y), az = Math.abs(faceN.z);
      const m = Math.max(ax, ay, az);
      let axis, twistDir;
      if (m === ax) { axis = 'col'; twistDir = -sgn(faceN.x) * sgn(dx); } // Flipped
      else if (m === ay) { axis = 'row'; twistDir = -sgn(faceN.y) * sgn(-dy); } // Flipped
      else { axis = 'depth'; twistDir = -sgn(faceN.z) * sgn(dx); } // Flipped
      return { axis, dir: twistDir };
    }
    // Normal slice rotation
    const { right, upScreen } = getBasis();
    const sw = new THREE.Vector3().addScaledVector(right, dx).addScaledVector(upScreen, dy);
    const t = sw.clone().projectOnPlane(faceN);
    if (t.lengthSq() < 1e-6) return null;
    const ra = new THREE.Vector3().crossVectors(t, faceN).normalize();
    const ax = Math.abs(ra.x), ay = Math.abs(ra.y), az = Math.abs(ra.z);
    if (ax >= ay && ax >= az) return { axis: 'col', dir: sgn(ra.x) };
    if (ay >= ax && ay >= az) return { axis: 'row', dir: sgn(ra.y) };
    return { axis: 'depth', dir: sgn(ra.z) };
  };

  const dirFromNormal = n => {
    const a = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)], m = Math.max(...a);
    if (m === a[0]) return n.x >= 0 ? 'PX' : 'NX';
    if (m === a[1]) return n.y >= 0 ? 'PY' : 'NY';
    return n.z >= 0 ? 'PZ' : 'NZ';
  };

  // Stable callback ref pattern: avoids recreating the function on every render,
  // which would defeat React.memo on all Cubie children.
  const animStateRef = useRef(animState);
  animStateRef.current = animState;
  const flipModeRef = useRef(flipMode);
  flipModeRef.current = flipMode;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onTapFlipRef = useRef(onTapFlip);
  onTapFlipRef.current = onTapFlip;
  const onSelectTileRef = useRef(onSelectTile);
  onSelectTileRef.current = onSelectTile;
  const onFaceRotationModeRef = useRef(onFaceRotationMode);
  onFaceRotationModeRef.current = onFaceRotationMode;
  const onClearTileSelectionRef = useRef(onClearTileSelection);
  onClearTileSelectionRef.current = onClearTileSelection;

  const onPointerDown = useCallback(({ pos, worldPos, event }) => {
    if (animStateRef.current) return;

    // Get the native event - R3F wraps it
    const nativeEvent = event.nativeEvent || event;

    // Get coordinates - try multiple sources for compatibility
    let screenX, screenY;
    if (nativeEvent.touches && nativeEvent.touches.length > 0) {
      screenX = nativeEvent.touches[0].clientX;
      screenY = nativeEvent.touches[0].clientY;
    } else if (nativeEvent.clientX !== undefined) {
      screenX = nativeEvent.clientX;
      screenY = nativeEvent.clientY;
    } else if (event.clientX !== undefined) {
      screenX = event.clientX;
      screenY = event.clientY;
    } else {
      // Fallback to pointer coordinates from R3F event
      screenX = event.pointer?.x * window.innerWidth / 2 + window.innerWidth / 2;
      screenY = -event.pointer?.y * window.innerHeight / 2 + window.innerHeight / 2;
    }

    // Prevent default to stop touch scrolling and other gestures
    if (nativeEvent.preventDefault) nativeEvent.preventDefault();
    if (event.stopPropagation) event.stopPropagation();

    // Immediately clear any tile selection UI when touching the cube
    if (onClearTileSelectionRef.current) onClearTileSelectionRef.current();

    const n = normalFromEvent(event);
    const dragData = {
      pos, worldPos, event,
      screenX,
      screenY,
      n,
      shiftKey: nativeEvent.shiftKey || event.shiftKey,
      isRightClick: (nativeEvent.button === 2) || (event.button === 2)
    };

    dragStartRef.current = dragData; // Set ref immediately for listeners
    setDragStart(dragData);
    longPressTriggeredRef.current = false;

    if (controlsRef.current) controlsRef.current.enabled = false;
  }, []);

  // Helper to get slice index from cubie position (pos is {x, y, z} grid coords)
  const getSliceIndex = useCallback((pos, axis) => {
    if (axis === 'col') return pos.x;
    if (axis === 'row') return pos.y;
    return pos.z; // depth
  }, []);

  // Helper to compute slice indices for a given axis and sliceIndex
  const computeSliceIndices = useCallback((axis, sliceIndex) => {
    const indices = new Set();
    const n = size * size * size;
    for (let idx = 0; idx < n; idx++) {
      const z = idx % size;
      const y = Math.floor(idx / size) % size;
      const x = Math.floor(idx / (size * size));
      const inSlice = (axis === 'col' && x === sliceIndex) ||
                      (axis === 'row' && y === sliceIndex) ||
                      (axis === 'depth' && z === sliceIndex);
      if (inSlice) indices.add(idx);
    }
    return indices;
  }, [size]);

  // Store base positions/rotations for live drag
  const storeBaseTransforms = useCallback((sliceIndices) => {
    const basePositions = new Map();
    const baseRotations = new Map();
    sliceIndices.forEach(idx => {
      const g = cubieRefs.current[idx];
      if (g) {
        basePositions.set(idx, g.position.clone());
        baseRotations.set(idx, g.quaternion.clone());
      }
    });
    return { basePositions, baseRotations };
  }, []);

  // Set up global move/up listeners once - use refs for immediate access
  useEffect(() => {
    const getClientCoords = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    };

    const move = e => {
      const ds = dragStartRef.current;
      if (!ds) return;
      e.preventDefault();
      const { clientX, clientY } = getClientCoords(e);
      const dx = clientX - ds.screenX, dy = clientY - ds.screenY;
      const dist = Math.hypot(dx, dy);

      if (dist > DRAG_THRESHOLD && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Start live drag if threshold exceeded
      if (!liveDragRef.current && dist >= DRAG_THRESHOLD) {
        const m = mapSwipe(ds.n, dx, dy, ds.shiftKey);
        if (m) {
          if (onClearTileSelectionRef.current) onClearTileSelectionRef.current();
          const sliceIndex = ds.pos[m.axis === 'col' ? 'x' : m.axis === 'row' ? 'y' : 'z'];
          const sliceIndices = new Set();
          const n = sizeRef.current * sizeRef.current * sizeRef.current;
          for (let idx = 0; idx < n; idx++) {
            const z = idx % sizeRef.current;
            const y = Math.floor(idx / sizeRef.current) % sizeRef.current;
            const x = Math.floor(idx / (sizeRef.current * sizeRef.current));
            if ((m.axis === 'col' && x === sliceIndex) ||
                (m.axis === 'row' && y === sliceIndex) ||
                (m.axis === 'depth' && z === sliceIndex)) {
              sliceIndices.add(idx);
            }
          }
          const basePositions = new Map();
          const baseRotations = new Map();
          sliceIndices.forEach(idx => {
            const g = cubieRefs.current[idx];
            if (g) {
              basePositions.set(idx, g.position.clone());
              baseRotations.set(idx, g.quaternion.clone());
            }
          });
          liveDragRef.current = {
            axis: m.axis, sliceIndex, sliceIndices, basePositions, baseRotations,
            startDx: dx, startDy: dy, dir: -m.dir // Negate dir to fix backwards rotation
          };
          sliceIndicesRef.current = sliceIndices;
        }
      }

      // Update angle during live drag
      if (liveDragRef.current) {
        const ld = liveDragRef.current;
        const dragDist = Math.abs(dx) > Math.abs(dy)
          ? (dx - ld.startDx) * ld.dir
          : -(dy - ld.startDy) * ld.dir;
        ld.angle = (dragDist / PIXELS_PER_90DEG) * (Math.PI / 2);
        setLiveDragAngle(ld.angle);
      }
    };

    const up = e => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        dragStartRef.current = null;
        setDragStart(null);
        if (controlsRef.current) controlsRef.current.enabled = true;
        return;
      }

      const ds = dragStartRef.current;
      if (!ds) return;

      // Handle live drag release
      if (liveDragRef.current) {
        const ld = liveDragRef.current;
        const currentAngle = ld.angle || 0;
        const quarterTurn = Math.PI / 2;
        const shouldComplete = Math.abs(currentAngle) > quarterTurn * 0.33;

        if (shouldComplete) {
          const snapDir = currentAngle > 0 ? 1 : -1;
          const savedPos = ds.pos;
          const savedAxis = ld.axis;
          animProgressRef.current.value = currentAngle / quarterTurn;
          gsapAnimRef.current = gsap.to(animProgressRef.current, {
            value: snapDir,
            duration: 0.15,
            ease: "back.out(1.4)",
            onComplete: () => {
              gsapAnimRef.current = null;
              liveDragRef.current = null;
              sliceIndicesRef.current = null;
              setLiveDragAngle(0);
              vibrate(14);
              onMoveRef.current(savedAxis, snapDir, savedPos);
            }
          });
        } else {
          // Snap back
          const snapBackData = { ...ld };
          animProgressRef.current.value = currentAngle / quarterTurn;
          gsapAnimRef.current = gsap.to(animProgressRef.current, {
            value: 0,
            duration: 0.15,
            ease: "back.out(1.4)",
            onUpdate: () => {
              const progress = animProgressRef.current.value;
              const angle = progress * quarterTurn;
              const worldAxis = snapBackData.axis === 'col' ? _axisCol :
                               snapBackData.axis === 'row' ? _axisRow : _axisDepth;
              snapBackData.sliceIndices.forEach(idx => {
                const g = cubieRefs.current[idx];
                if (g && snapBackData.basePositions.has(idx)) {
                  g.position.copy(snapBackData.basePositions.get(idx)).applyAxisAngle(worldAxis, angle);
                  g.quaternion.copy(snapBackData.baseRotations.get(idx));
                  _rotQuat.setFromAxisAngle(worldAxis, angle);
                  g.quaternion.premultiply(_rotQuat);
                }
              });
            },
            onComplete: () => {
              snapBackData.sliceIndices.forEach(idx => {
                const g = cubieRefs.current[idx];
                if (g && snapBackData.basePositions.has(idx)) {
                  g.position.copy(snapBackData.basePositions.get(idx));
                  g.quaternion.copy(snapBackData.baseRotations.get(idx));
                }
              });
              gsapAnimRef.current = null;
              liveDragRef.current = null;
              sliceIndicesRef.current = null;
              setLiveDragAngle(0);
            }
          });
        }
        dragStartRef.current = null;
        setDragStart(null);
        if (controlsRef.current) controlsRef.current.enabled = true;
        return;
      }

      // Handle tap
      const { clientX, clientY } = getClientCoords(e);
      const dx = clientX - ds.screenX, dy = clientY - ds.screenY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD && flipModeRef.current) {
        onTapFlipRef.current(ds.pos, dirFromNormal(ds.n));
      }

      dragStartRef.current = null;
      setDragStart(null);
      if (controlsRef.current) controlsRef.current.enabled = true;
    };

    // Use pointer events only - they handle mouse, touch, and pen uniformly
    // Adding both pointer and touch events causes double-firing on touch devices
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []); // Run once - use refs for all state

  // Store refs for values accessed in useFrame to avoid stale closures
  const onAnimCompleteRef = useRef(onAnimComplete);
  onAnimCompleteRef.current = onAnimComplete;
  const explosionFactorRef = useRef(explosionFactor);
  explosionFactorRef.current = explosionFactor;

  // Track the previous animation progress for incremental rotation
  const prevProgressRef = useRef(0);

  // Start GSAP animation when animState changes
  useEffect(() => {
    if (!animState) {
      // Reset progress refs when animation ends
      animProgressRef.current.value = 0;
      prevProgressRef.current = 0;
      return;
    }

    // Kill any existing animation
    if (gsapAnimRef.current) {
      gsapAnimRef.current.kill();
    }

    // Reset progress for new animation
    animProgressRef.current.value = 0;
    prevProgressRef.current = 0;

    // Use GSAP to animate the progress value with snappy easing
    gsapAnimRef.current = gsap.to(animProgressRef.current, {
      value: 1,
      duration: 0.35,
      ease: "back.out(1.4)", // Snappy bounce effect - overshoots slightly then settles
      onComplete: () => {
        gsapAnimRef.current = null;
        sliceIndicesRef.current = null;
        vibrate(14);
        onAnimCompleteRef.current();
      }
    });

    return () => {
      if (gsapAnimRef.current) {
        gsapAnimRef.current.kill();
        gsapAnimRef.current = null;
      }
    };
  }, [animState]);

  // useFrame applies live drag rotation and GSAP-driven animations
  useFrame((state) => {
    // Update shared time uniform for animated tile styles
    updateSharedTime(state.clock.elapsedTime);

    // Apply live drag rotation - instant, follows finger
    if (liveDragRef.current && liveDragRef.current.basePositions) {
      const ld = liveDragRef.current;
      const worldAxis = ld.axis === 'col' ? _axisCol : ld.axis === 'row' ? _axisRow : _axisDepth;
      const angle = ld.angle || 0;

      ld.sliceIndices.forEach(idx => {
        const g = cubieRefs.current[idx];
        if (g && ld.basePositions.has(idx)) {
          const basePos = ld.basePositions.get(idx);
          const baseRot = ld.baseRotations.get(idx);
          // Apply rotation from base position (not incremental)
          g.position.copy(basePos).applyAxisAngle(worldAxis, angle);
          g.quaternion.copy(baseRot);
          _rotQuat.setFromAxisAngle(worldAxis, angle);
          g.quaternion.premultiply(_rotQuat);
        }
      });
      return; // Skip animState processing during live drag
    }

    // Handle GSAP snap animation (completing rotation after release)
    if (!animState) return;

    const { axis, dir, sliceIndex } = animState;
    const worldAxis = axis === 'col' ? _axisCol : axis === 'row' ? _axisRow : _axisDepth;

    // On animation start, pre-compute which ref indices are in the slice
    if (!sliceIndicesRef.current) {
      const kOffset = (size - 1) / 2;
      const indices = new Set();
      const n = size * size * size;
      for (let idx = 0; idx < n; idx++) {
        const z = idx % size;
        const y = Math.floor(idx / size) % size;
        const x = Math.floor(idx / (size * size));
        const inSlice = (axis === 'col' && x === sliceIndex) ||
                        (axis === 'row' && y === sliceIndex) ||
                        (axis === 'depth' && z === sliceIndex);
        if (inSlice) indices.add(idx);
      }
      sliceIndicesRef.current = indices;
    }

    // Calculate incremental rotation from GSAP progress
    const currentProgress = animProgressRef.current.value;
    const deltaProgress = currentProgress - prevProgressRef.current;
    prevProgressRef.current = currentProgress;

    const dRot = deltaProgress * (Math.PI / 2);

    // Apply rotation to cubies in the slice
    const sliceSet = sliceIndicesRef.current;
    if (sliceSet && Math.abs(dRot) > 0.0001) {
      cubieRefs.current.forEach((g, idx) => {
        if (!g || !sliceSet.has(idx)) return;
        g.position.applyAxisAngle(worldAxis, dRot * dir);
        g.rotateOnWorldAxis(worldAxis, dRot * dir);
      });
    }
  });

  // Stable ref callbacks so that passing ref={fn} doesn't defeat React.memo on Cubie.
  // We create one callback per index, memoized by size.
  const maxCubies = size * size * size;
  const cubieRefCallbacks = useMemo(() => {
    return Array.from({ length: maxCubies }, (_, idx) => (el) => {
      cubieRefs.current[idx] = el;
    });
  }, [maxCubies]);

  const k = (size - 1) / 2;

  // Cache position arrays so they're stable references across cubies updates.
  // Only recomputed when size changes, not on every rotation.
  const positionCache = useMemo(() => {
    const cache = [];
    for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) for (let z = 0; z < size; z++) {
      cache.push([x - k, y - k, z - k]);
    }
    return cache;
  }, [size, k]);

  const items = useMemo(() => {
    // Guard against size/cubies mismatch during size transitions
    if (cubies.length !== size) return [];
    const arr = []; let i = 0;
    for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) for (let z = 0; z < size; z++) {
      arr.push({ key: i, pos: positionCache[i], cubie: cubies[x][y][z] });
      i++;
    }
    return arr;
  }, [cubies, size, k, positionCache]);

  // Reset cubie positions/rotations when animation ends or cubies change.
  // Uses useLayoutEffect so the reset happens BEFORE the browser paints,
  // preventing a 1-frame glitch where cubies show new colors at old positions.
  useLayoutEffect(() => {
    if (!animState) {
      sliceIndicesRef.current = null;
      const expansionFactor = 1 + explosionFactor * 1.8;
      items.forEach((it, idx) => {
        const g = cubieRefs.current[idx];
        if (g) {
          g.position.set(
            it.pos[0] * expansionFactor,
            it.pos[1] * expansionFactor,
            it.pos[2] * expansionFactor
          );
          g.rotation.set(0, 0, 0);
        }
      });
    }
  }, [animState, items, explosionFactor]);

  return (
    <group ref={cubeGroupRef}>
      <WormholeNetwork
        cubies={cubies}
        size={size}
        showTunnels={showTunnels}
        manifoldMap={manifoldMap}
        cubieRefs={cubieRefs.current}
        faceColors={faceColors}
      />
      {cascades.map(c => (
        <ChaosWave
          key={c.id}
          from={c.from}
          to={c.to}
          onComplete={() => onCascadeComplete(c.id)}
        />
      ))}
      {flipWaveOrigins && flipWaveOrigins.length > 0 && (
        <FlipPropagationWave
          origins={flipWaveOrigins}
          onComplete={onFlipWaveComplete}
        />
      )}
      {items.map((it, idx) => (
        <Cubie
          key={it.key}
          ref={cubieRefCallbacks[idx]}
          position={it.pos}
          cubie={it.cubie}
          size={size}
          visualMode={visualMode}
          onPointerDown={onPointerDown}
          explosionFactor={explosionFactor}
          faceColors={faceColors}
          faceTextures={faceTextures}
          manifoldStyles={manifoldStyles}
        />
      ))}
      {showCursor && cursor && (
        <CursorHighlight
          cursor={cursor}
          size={size}
          explosionFactor={explosionFactor}
        />
      )}
      {solveHighlights && solveHighlights.length > 0 && (
        <SolveHighlight
          highlights={solveHighlights}
          size={size}
          explosionFactor={explosionFactor}
        />
      )}
      {/* DragGuide removed - real-time cube rotation provides visual feedback */}
      <TrackballControls
        ref={controlsRef}
        noPan={true}
        noZoom={false}
        minDistance={5}
        maxDistance={28}
        enabled={!animState && !dragStart}
        staticMoving={false}
        dynamicDampingFactor={isTouchDevice ? 0.12 : 0.05}
        rotateSpeed={isTouchDevice ? 1.2 : 1.6}
      />
    </group>
  );
});

export default CubeAssembly;
