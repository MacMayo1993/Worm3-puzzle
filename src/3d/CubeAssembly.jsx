import React, { useRef, useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import Cubie from './Cubie.jsx';
import DragGuide from './DragGuide.jsx';
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

// Drag threshold - larger on touch devices for better precision
const DRAG_THRESHOLD = isTouchDevice ? 25 : 10;

// Long-press disabled - was too sensitive on mobile
// const LONG_PRESS_DURATION = 500;

const CubeAssembly = React.memo(({
  size, cubies, onMove, onTapFlip, visualMode, animState, onAnimComplete,
  showTunnels, explosionFactor, cascades, onCascadeComplete, manifoldMap,
  cursor, showCursor, flipMode, onSelectTile, flipWaveOrigins, onFlipWaveComplete,
  faceColors, faceTextures, manifoldStyles, solveHighlights,
  onFaceRotationMode
}) => {
  const cubieRefs = useRef([]);
  const controlsRef = useRef();
  const cubeGroupRef = useRef(null);
  const pivotRef = useRef(null);
  const gsapAnimRef = useRef(null);
  const { camera } = useThree();
  const [dragStart, setDragStart] = useState(null);
  const [activeDir, setActiveDir] = useState(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

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

  const onPointerDown = useCallback(({ pos, worldPos, event }) => {
    if (animStateRef.current) return;
    if (event.button === 2) event.preventDefault();

    const n = normalFromEvent(event);
    const dragData = {
      pos, worldPos, event,
      screenX: event.clientX,
      screenY: event.clientY,
      n,
      shiftKey: event.shiftKey,
      isRightClick: event.button === 2
    };

    setDragStart(dragData);
    longPressTriggeredRef.current = false;

    // Long-press disabled - was too sensitive on mobile
    // Timer logic removed

    if (controlsRef.current) controlsRef.current.enabled = false;
  }, []);

  useEffect(() => {
    const move = e => {
      if (!dragStart) return;
      const dx = e.clientX - dragStart.screenX, dy = e.clientY - dragStart.screenY;

      // Cancel long-press timer if user moves significantly
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        setActiveDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      } else {
        setActiveDir(null);
      }
    };
    const up = e => {
      // Cancel long-press timer on release
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // If long-press was triggered, don't do normal actions
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return;
      }

      if (!dragStart) return;
      const dx = e.clientX - dragStart.screenX, dy = e.clientY - dragStart.screenY;
      const dist = Math.hypot(dx, dy);
      if (dist >= DRAG_THRESHOLD) {
        const m = mapSwipe(dragStart.n, dx, dy, dragStart.shiftKey);
        if (m) onMoveRef.current(m.axis, m.dir, dragStart.pos);
      } else {
        const dirKey = dirFromNormal(dragStart.n);
        if (dragStart.isRightClick) {
          if (flipModeRef.current) onTapFlipRef.current(dragStart.pos, dirKey);
        } else {
          if (flipModeRef.current) {
            onTapFlipRef.current(dragStart.pos, dirKey);
          } else {
            if (onSelectTileRef.current) onSelectTileRef.current(dragStart.pos, dirKey);
          }
        }
      }
      setDragStart(null);
      setActiveDir(null);
      if (controlsRef.current) controlsRef.current.enabled = true;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragStart]);

  // Store refs for values accessed in useFrame to avoid stale closures
  const onAnimCompleteRef = useRef(onAnimComplete);
  onAnimCompleteRef.current = onAnimComplete;
  const explosionFactorRef = useRef(explosionFactor);
  explosionFactorRef.current = explosionFactor;

  // Update shared time uniform for animated tile styles
  useFrame((state) => {
    updateSharedTime(state.clock.elapsedTime);
  });

  // GSAP Pivot-based rotation animation
  // Creates a temporary pivot group, attaches cubies, animates with snappy easing, then cleans up
  useEffect(() => {
    if (!animState || !cubeGroupRef.current) return;

    // Kill any existing animation
    if (gsapAnimRef.current) {
      gsapAnimRef.current.kill();
      gsapAnimRef.current = null;
    }

    const cubeGroup = cubeGroupRef.current;
    const { axis, dir, sliceIndex } = animState;
    const targetAngle = (Math.PI / 2) * dir;

    // Pre-compute which ref indices are in the slice from canonical grid positions
    const kOffset = (size - 1) / 2;
    const indices = new Set();
    items.forEach((it, idx) => {
      const gx = Math.round(it.pos[0] + kOffset);
      const gy = Math.round(it.pos[1] + kOffset);
      const gz = Math.round(it.pos[2] + kOffset);
      const inSlice = (axis === 'col' && gx === sliceIndex) ||
                      (axis === 'row' && gy === sliceIndex) ||
                      (axis === 'depth' && gz === sliceIndex);
      if (inSlice) indices.add(idx);
    });
    sliceIndicesRef.current = indices;

    // Create pivot group at the center of the cube
    const pivot = new THREE.Group();
    pivot.position.set(0, 0, 0);
    cubeGroup.add(pivot);
    pivotRef.current = pivot;

    // Collect cubies in the slice and attach them to the pivot
    const movingCubies = [];
    cubieRefs.current.forEach((g, idx) => {
      if (g && indices.has(idx)) {
        movingCubies.push(g);
        pivot.attach(g);
      }
    });

    // Animate the pivot with snappy back.out easing for that tactile "bounce" feel
    const rotationProp = axis === 'col' ? 'x' : axis === 'row' ? 'y' : 'z';
    const animTarget = { [rotationProp]: targetAngle };

    gsapAnimRef.current = gsap.to(pivot.rotation, {
      ...animTarget,
      duration: 0.35,
      ease: "back.out(1.4)", // Snappy bounce effect - overshoots slightly then settles
      onComplete: () => {
        // Detach cubies from pivot back to the cube group
        movingCubies.forEach((cubie) => {
          cubeGroup.attach(cubie);
        });

        // Clean up pivot
        cubeGroup.remove(pivot);
        pivotRef.current = null;
        sliceIndicesRef.current = null;
        gsapAnimRef.current = null;

        // Notify parent that animation is complete
        vibrate(14);
        onAnimCompleteRef.current();
      }
    });

    // Cleanup function if component unmounts or animState changes mid-animation
    return () => {
      if (gsapAnimRef.current) {
        gsapAnimRef.current.kill();
        gsapAnimRef.current = null;
      }
      if (pivotRef.current && cubeGroupRef.current) {
        // Detach all children back to cube group before removing pivot
        while (pivotRef.current.children.length > 0) {
          cubeGroupRef.current.attach(pivotRef.current.children[0]);
        }
        cubeGroupRef.current.remove(pivotRef.current);
        pivotRef.current = null;
      }
    };
  }, [animState, size, items]);

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
      {dragStart && !animState && <DragGuide position={dragStart.worldPos} activeDir={activeDir} />}
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
