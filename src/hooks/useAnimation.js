/**
 * useAnimation Hook
 *
 * Manages animation state and completion callbacks.
 * Includes support for Antipodal Mode (Mirror Quotient).
 */

import { useCallback, useRef } from 'react';
import { useGameStore } from './useGameStore.js';
import { rotateSliceCubies } from '../game/cubeRotation.js';
import { play } from '../utils/audio.js';
import gsap from 'gsap';
import {
  getAntipodalSliceIndex,
  getReverseDirection,
  shouldTriggerEcho,
  generateEchoId,
  getAntipodalFaceInfo,
} from '../game/antipodalMode.js';

/**
 * Hook for animation management
 */
export function useAnimation() {
  const size = useGameStore((state) => state.size);
  const setCubies = useGameStore((state) => state.setCubies);
  const setMoves = useGameStore((state) => state.setMoves);
  const animState = useGameStore((state) => state.animState);
  const pendingMove = useGameStore((state) => state.pendingMove);
  const setAnimState = useGameStore((state) => state.setAnimState);
  const setPendingMove = useGameStore((state) => state.setPendingMove);
  const clearAnimation = useGameStore((state) => state.clearAnimation);
  const addToHistory = useGameStore((state) => state.addToHistory);

  // Antipodal Mode state
  const antipodalMode = useGameStore((state) => state.antipodalMode);
  const echoDelay = useGameStore((state) => state.echoDelay);
  const incrementReversalCount = useGameStore((state) => state.incrementReversalCount);
  const addPendingEchoRotation = useGameStore((state) => state.addPendingEchoRotation);
  const removePendingEchoRotation = useGameStore((state) => state.removePendingEchoRotation);

  const pendingMoveRef = useRef(null);
  const echoTimeoutsRef = useRef([]);

  // Start a new animation
  const startAnimation = useCallback((axis, dir, sliceIndex) => {
    setAnimState({ axis, dir, sliceIndex, t: 0 });
    const move = { axis, dir, sliceIndex };
    setPendingMove(move);
    pendingMoveRef.current = move;
  }, [setAnimState, setPendingMove]);

  // Handle animation completion
  const handleAnimComplete = useCallback(() => {
    const pm = pendingMoveRef.current;
    if (pm) {
      const { axis, dir, sliceIndex } = pm;
      setCubies((prev) => rotateSliceCubies(prev, size, axis, sliceIndex, dir));
      setMoves((m) => m + 1);
      play('/sounds/rotate.mp3');
      addToHistory({ type: 'rotation', axis, dir, sliceIndex, timestamp: Date.now() });

      // Trigger antipodal echo rotation if mode is enabled
      if (antipodalMode && shouldTriggerEcho(axis, sliceIndex, size)) {
        const antipodalSlice = getAntipodalSliceIndex(axis, sliceIndex, size);
        const reverseDir = getReverseDirection(dir);
        const echoId = generateEchoId();
        const faceInfo = getAntipodalFaceInfo(axis, sliceIndex, size);

        // Add to pending echo rotations (for visualization)
        addPendingEchoRotation({
          id: echoId,
          axis,
          dir: reverseDir,
          sliceIndex: antipodalSlice,
          originalSlice: sliceIndex,
          faceInfo,
          startTime: Date.now(),
        });

        // Schedule echo rotation with delay
        const timeoutId = gsap.delayedCall(echoDelay, () => {
          // Apply the antipodal rotation
          setCubies((prev) => rotateSliceCubies(prev, size, axis, antipodalSlice, reverseDir));
          play('/sounds/rotate.mp3', 0.7); // Slightly quieter for echo
          incrementReversalCount();
          removePendingEchoRotation(echoId);

          // Remove from timeouts list
          echoTimeoutsRef.current = echoTimeoutsRef.current.filter(t => t !== timeoutId);
        });

        echoTimeoutsRef.current.push(timeoutId);
      }
    }
    clearAnimation();
    pendingMoveRef.current = null;
  }, [
    size,
    setCubies,
    setMoves,
    clearAnimation,
    addToHistory,
    antipodalMode,
    echoDelay,
    incrementReversalCount,
    addPendingEchoRotation,
    removePendingEchoRotation,
  ]);

  // Handle move initiation (from UI interactions)
  const onMove = useCallback((axis, dir, sel) => {
    const sliceIndex = axis === 'col' ? sel.x : axis === 'row' ? sel.y : sel.z;
    startAnimation(axis, dir, sliceIndex);
  }, [startAnimation]);

  return {
    // State
    animState,
    pendingMove,

    // Refs
    pendingMoveRef,

    // Actions
    startAnimation,
    handleAnimComplete,
    onMove,
    setAnimState,
    setPendingMove,
    clearAnimation,
  };
}
