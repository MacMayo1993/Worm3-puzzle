/**
 * useAnimation Hook
 *
 * Manages animation state and completion callbacks.
 */

import { useCallback, useRef } from 'react';
import { useGameStore } from './useGameStore.js';
import { rotateSliceCubies } from '../game/cubeRotation.js';
import { play } from '../utils/audio.js';

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

  const pendingMoveRef = useRef(null);

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
    }
    clearAnimation();
    pendingMoveRef.current = null;
  }, [size, setCubies, setMoves, clearAnimation, addToHistory]);

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
