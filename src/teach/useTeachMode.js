// src/teach/useTeachMode.js
// Hook to manage Teach Mode state and step-by-step algorithm execution

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore.js';
import { BEGINNER_METHOD_3x3, parseAlgorithm } from './algorithms.js';
import { analyzeState } from './solver3x3.js';

export function useTeachMode() {
  const cubies = useGameStore((s) => s.cubies);
  const size = useGameStore((s) => s.size);
  const animState = useGameStore((s) => s.animState);
  const setAnimState = useGameStore((s) => s.setAnimState);
  const setPendingMove = useGameStore((s) => s.setPendingMove);
  const setSolveHighlights = useGameStore((s) => s.setSolveHighlights);

  // Teach mode state
  const [active, setActive] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedAlgo, setSelectedAlgo] = useState(null); // { stageIndex, algoIndex }
  const [algoMoves, setAlgoMoves] = useState([]); // parsed moves for current algorithm
  const [currentStep, setCurrentStep] = useState(0); // which move we're on
  const [isPlaying, setIsPlaying] = useState(false); // auto-play mode
  const [layerHighlight, setLayerHighlight] = useState(null); // { axis, sliceIndex, dir }

  const isPlayingRef = useRef(false);
  const pendingNextRef = useRef(false);

  // Analyze cube state whenever cubies change and teach mode is active
  useEffect(() => {
    if (!active || size !== 3) return;
    const result = analyzeState(cubies);
    setAnalysis(result);
    setSolveHighlights(result.highlights || []);
  }, [active, cubies, size, setSolveHighlights]);

  // When animation finishes and we're auto-playing, advance to next step
  useEffect(() => {
    if (pendingNextRef.current && !animState) {
      pendingNextRef.current = false;
      if (isPlayingRef.current) {
        // Small delay for user to see the result
        const timer = setTimeout(() => {
          if (isPlayingRef.current) {
            advanceStep();
          }
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [animState]);

  // Enter teach mode
  const enterTeachMode = useCallback(() => {
    if (size !== 3) return;
    setActive(true);
    const result = analyzeState(cubies);
    setAnalysis(result);
    setSolveHighlights(result.highlights || []);
    setSelectedAlgo(null);
    setAlgoMoves([]);
    setCurrentStep(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setLayerHighlight(null);
  }, [cubies, size, setSolveHighlights]);

  // Exit teach mode
  const exitTeachMode = useCallback(() => {
    setActive(false);
    setAnalysis(null);
    setSelectedAlgo(null);
    setAlgoMoves([]);
    setCurrentStep(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setLayerHighlight(null);
    setSolveHighlights([]);
  }, [setSolveHighlights]);

  // Select an algorithm to practice
  const selectAlgorithm = useCallback((stageIndex, algoIndex) => {
    const stage = BEGINNER_METHOD_3x3.stages[stageIndex];
    if (!stage) return;
    const algo = stage.algorithms[algoIndex];
    if (!algo) return;

    const moves = parseAlgorithm(algo.notation, 3);
    setSelectedAlgo({ stageIndex, algoIndex });
    setAlgoMoves(moves);
    setCurrentStep(0);
    setIsPlaying(false);
    isPlayingRef.current = false;

    // Highlight the first move's layer
    if (moves.length > 0) {
      setLayerHighlight({
        axis: moves[0].axis,
        sliceIndex: moves[0].sliceIndex,
        dir: moves[0].dir,
      });
    }
  }, []);

  // Execute the current step (one move)
  const executeStep = useCallback(() => {
    if (!algoMoves.length || currentStep >= algoMoves.length) return;
    if (animState) return; // wait for current animation

    const move = algoMoves[currentStep];
    setAnimState({ axis: move.axis, dir: move.dir, sliceIndex: move.sliceIndex, t: 0 });
    setPendingMove({ axis: move.axis, dir: move.dir, sliceIndex: move.sliceIndex });
    pendingNextRef.current = true;

    // Advance step counter
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Update layer highlight for next move
    if (nextStep < algoMoves.length) {
      setLayerHighlight({
        axis: algoMoves[nextStep].axis,
        sliceIndex: algoMoves[nextStep].sliceIndex,
        dir: algoMoves[nextStep].dir,
      });
    } else {
      setLayerHighlight(null);
    }
  }, [algoMoves, currentStep, animState, setAnimState, setPendingMove]);

  // Advance step (for auto-play)
  const advanceStep = useCallback(() => {
    if (currentStep < algoMoves.length && !animState) {
      executeStep();
    } else {
      // Algorithm complete
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [currentStep, algoMoves, animState, executeStep]);

  // Toggle auto-play
  const toggleAutoPlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      // Start immediately if not animating
      if (!animState && currentStep < algoMoves.length) {
        executeStep();
      }
    }
  }, [isPlaying, animState, currentStep, algoMoves, executeStep]);

  // Reset algorithm to start
  const resetAlgorithm = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (algoMoves.length > 0) {
      setLayerHighlight({
        axis: algoMoves[0].axis,
        sliceIndex: algoMoves[0].sliceIndex,
        dir: algoMoves[0].dir,
      });
    }
  }, [algoMoves]);

  // Get current stage data from the method
  const getCurrentStageData = useCallback(() => {
    if (!analysis) return null;
    return BEGINNER_METHOD_3x3.stages[analysis.stageIndex] || null;
  }, [analysis]);

  // Get the currently selected algorithm info
  const getSelectedAlgoInfo = useCallback(() => {
    if (!selectedAlgo) return null;
    const stage = BEGINNER_METHOD_3x3.stages[selectedAlgo.stageIndex];
    if (!stage) return null;
    return stage.algorithms[selectedAlgo.algoIndex] || null;
  }, [selectedAlgo]);

  return {
    // State
    active,
    analysis,
    selectedAlgo,
    algoMoves,
    currentStep,
    isPlaying,
    layerHighlight,
    stages: BEGINNER_METHOD_3x3.stages,
    methodName: BEGINNER_METHOD_3x3.name,

    // Actions
    enterTeachMode,
    exitTeachMode,
    selectAlgorithm,
    executeStep,
    toggleAutoPlay,
    resetAlgorithm,

    // Derived
    getCurrentStageData,
    getSelectedAlgoInfo,
    canExecute: algoMoves.length > 0 && currentStep < algoMoves.length && !animState,
    isAlgoComplete: algoMoves.length > 0 && currentStep >= algoMoves.length,
  };
}
