// src/App.jsx
/**
 * WORM-3 Main Application
 *
 * Refactored to use Zustand state management and custom hooks.
 * Original 2343 lines reduced to ~700 lines with modular architecture.
 */

import React, { useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import './App.css';

// Utils
import { completeLevel } from './utils/levels.js';
import { keyToMove } from './game/handsInput.js';
import { makeCubies } from './game/cubeState.js';
import { rotateSliceCubies } from './game/cubeRotation.js';
import { buildManifoldGridMap, flipStickerPair } from './game/manifoldLogic.js';

// Hooks
import {
  useGameStore,
  useCubeState,
  useGameSession,
  useAnimation,
  useChaosMode,
  useCursor,
  useLevelSystem,
  useSettings,
  useHandsMode,
  useUndo,
} from './hooks/index.js';

// 3D components
import CubeAssembly from './3d/CubeAssembly.jsx';
import BlackHoleEnvironment from './3d/BlackHoleEnvironment.jsx';
import { getLevelBackground } from './3d/LifeJourneyBackgrounds.jsx';

// Photo environment presets available from @react-three/drei (real HDR panoramas)
const PHOTO_PRESETS = new Set([
  'sunset', 'forest', 'city', 'dawn', 'night',
  'apartment', 'studio', 'park', 'warehouse', 'lobby',
]);

// UI components
import TopMenuBar from './components/menus/TopMenuBar.jsx';
import MainMenu from './components/menus/MainMenu.jsx';
import SettingsMenu from './components/menus/SettingsMenu.jsx';
import HelpMenu from './components/menus/HelpMenu.jsx';
import MobileControls from './components/menus/MobileControls.jsx';
import WelcomeScreen from './components/screens/WelcomeScreen.jsx';
import VictoryScreen from './components/screens/VictoryScreen.jsx';
import Tutorial from './components/screens/Tutorial.jsx';
import FirstFlipTutorial from './components/screens/FirstFlipTutorial.jsx';
import LevelSelectScreen from './components/screens/LevelSelectScreen.jsx';
import Level10Cutscene from './components/screens/Level10Cutscene.jsx';
import LevelTutorial from './components/screens/LevelTutorial.jsx';
import RotationPreview from './components/overlays/RotationPreview.jsx';
import FaceRotationButtons from './components/overlays/FaceRotationButtons.jsx';
import TileRotationSelector from './components/overlays/TileRotationSelector.jsx';
import HandsOverlay from './components/overlays/HandsOverlay.jsx';
import CubeNet from './components/CubeNet.jsx';
import SolveMode from './components/SolveMode.jsx';
import DevConsole from './components/menus/DevConsole.jsx';

// Mobile detection
const isMobile = typeof window !== 'undefined' && (
  window.innerWidth <= 768 ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0
);

export default function WORM3() {
  // ========================================================================
  // STATE FROM ZUSTAND STORE
  // ========================================================================
  const showWelcome = useGameStore((state) => state.showWelcome);
  const setShowWelcome = useGameStore((state) => state.setShowWelcome);
  const showTutorial = useGameStore((state) => state.showTutorial);
  const setShowTutorial = useGameStore((state) => state.setShowTutorial);
  const showFirstFlipTutorial = useGameStore((state) => state.showFirstFlipTutorial);
  const setShowFirstFlipTutorial = useGameStore((state) => state.setShowFirstFlipTutorial);
  const showHelp = useGameStore((state) => state.showHelp);
  const setShowHelp = useGameStore((state) => state.setShowHelp);
  const showSettings = useGameStore((state) => state.showSettings);
  const setShowSettings = useGameStore((state) => state.setShowSettings);
  const showMainMenu = useGameStore((state) => state.showMainMenu);
  const showLevelSelect = useGameStore((state) => state.showLevelSelect);
  const setShowLevelSelect = useGameStore((state) => state.setShowLevelSelect);
  const showCutscene = useGameStore((state) => state.showCutscene);
  const showLevelTutorial = useGameStore((state) => state.showLevelTutorial);
  const showNetPanel = useGameStore((state) => state.showNetPanel);
  const setShowNetPanel = useGameStore((state) => state.setShowNetPanel);
  const showMobileTouchHint = useGameStore((state) => state.showMobileTouchHint);
  const markMobileHintShown = useGameStore((state) => state.markMobileHintShown);
  const markIntroSeen = useGameStore((state) => state.markIntroSeen);
  const markTutorialDone = useGameStore((state) => state.markTutorialDone);

  const flipMode = useGameStore((state) => state.flipMode);
  const setFlipMode = useGameStore((state) => state.setFlipMode);
  const visualMode = useGameStore((state) => state.visualMode);
  const setVisualMode = useGameStore((state) => state.setVisualMode);
  const exploded = useGameStore((state) => state.exploded);
  const setExploded = useGameStore((state) => state.setExploded);
  const explosionT = useGameStore((state) => state.explosionT);
  const setExplosionT = useGameStore((state) => state.setExplosionT);
  const showTunnels = useGameStore((state) => state.showTunnels);
  const setShowTunnels = useGameStore((state) => state.setShowTunnels);
  const blackHolePulse = useGameStore((state) => state.blackHolePulse);
  const flipWaveOrigins = useGameStore((state) => state.flipWaveOrigins);
  const setFlipWaveOrigins = useGameStore((state) => state.setFlipWaveOrigins);

  const faceRotationTarget = useGameStore((state) => state.faceRotationTarget);
  const setFaceRotationTarget = useGameStore((state) => state.setFaceRotationTarget);
  const selectedTileForRotation = useGameStore((state) => state.selectedTileForRotation);
  const setSelectedTileForRotation = useGameStore((state) => state.setSelectedTileForRotation);

  const showDevConsole = useGameStore((state) => state.showDevConsole);
  const setShowDevConsole = useGameStore((state) => state.setShowDevConsole);
  const savedCubeState = useGameStore((state) => state.savedCubeState);
  const setSavedCubeState = useGameStore((state) => state.setSavedCubeState);

  const solveModeActive = useGameStore((state) => state.solveModeActive);
  const setSolveModeActive = useGameStore((state) => state.setSolveModeActive);
  const solveFocusedStep = useGameStore((state) => state.solveFocusedStep);
  const setSolveFocusedStep = useGameStore((state) => state.setSolveFocusedStep);
  const solveHighlights = useGameStore((state) => state.solveHighlights);
  const setSolveHighlights = useGameStore((state) => state.setSolveHighlights);

  // ========================================================================
  // CUSTOM HOOKS
  // ========================================================================
  const {
    size, cubies, manifoldMap, metrics, resolvedColors,
    setCubies, changeSize, shuffle, reset, flipSticker
  } = useCubeState();

  const { moves, gameTime, victory, achievedWins, setVictory } = useGameSession();

  const {
    animState, startAnimation, handleAnimComplete, onMove
  } = useAnimation();

  const {
    chaosLevel, chaosMode, autoRotateEnabled, cascades,
    upcomingRotation, rotationCountdown, setChaosLevel,
    setAutoRotateEnabled, onCascadeComplete
  } = useChaosMode();

  const { cursor, showCursor, setShowCursor, moveCursor, cursorToCubePos, cubePosToCursor, getRotationParams } = useCursor();

  const {
    currentLevel, currentLevelData, handleLevelSelect,
    handleCutsceneComplete, handleTutorialClose: levelTutorialClose,
    handleBackToMainMenu, handleNextLevel: levelHandleNextLevel
  } = useLevelSystem();

  const { settings, faceImages, faceTextures, handleFaceImage, setSettings } = useSettings();

  const {
    handsMode, handsMoveHistory, handsTps, executeHandsMove,
    setHandsMode, setHandsMoveHistory, setHandsMoveQueue, setHandsTps
  } = useHandsMode();
  const handsMoveTimestamps = useRef([]);

  const { moveHistory, undo } = useUndo();

  // ========================================================================
  // EXPLOSION ANIMATION
  // ========================================================================
  const explosionTRef = useRef(0);
  useEffect(() => {
    if (exploded && explosionTRef.current >= 1) return;
    if (!exploded && explosionTRef.current <= 0) return;

    let raf;
    const animate = () => {
      setExplosionT((t) => {
        let next = t;
        if (exploded && t < 1) next = Math.min(1, t + 0.05);
        else if (!exploded && t > 0) next = Math.max(0, t - 0.05);
        explosionTRef.current = next;
        return next;
      });
      const curr = explosionTRef.current;
      if ((exploded && curr < 1) || (!exploded && curr > 0)) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [exploded, setExplosionT]);

  // Dismiss mobile touch hint after delay
  useEffect(() => {
    if (!showMobileTouchHint) return;
    const timer = setTimeout(() => markMobileHintShown(), 4500);
    return () => clearTimeout(timer);
  }, [showMobileTouchHint, markMobileHintShown]);

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
    markIntroSeen();
    // Show main menu after intro (not tutorial)
    useGameStore.getState().setShowMainMenu(true);
  }, [setShowWelcome, markIntroSeen]);

  // Main menu action handlers
  const handleMenuPlay = useCallback(() => {
    useGameStore.getState().setShowMainMenu(false);
    handleLevelSelect(1); // Start at level 1
  }, [handleLevelSelect]);

  const handleMenuLevels = useCallback(() => {
    useGameStore.getState().setShowMainMenu(false);
    setShowLevelSelect(true);
  }, [setShowLevelSelect]);

  const handleMenuFreeplay = useCallback(() => {
    useGameStore.getState().setShowMainMenu(false);
    useGameStore.getState().clearLevel();
    shuffle();
  }, [shuffle]);

  const handleMenuSettings = useCallback(() => {
    setShowSettings(true);
  }, [setShowSettings]);

  const handleMenuHelp = useCallback(() => {
    useGameStore.getState().setShowMainMenu(false);
    setShowTutorial(true);
  }, [setShowTutorial]);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    markTutorialDone();
  }, [setShowTutorial, markTutorialDone]);

  // Tap flip handler
  const onTapFlip = useCallback((pos, dirKey) => {
    flipSticker(pos, dirKey);
  }, [flipSticker]);

  const onFlipWaveComplete = useCallback(() => {
    setFlipWaveOrigins([]);
  }, [setFlipWaveOrigins]);

  // Handle tile selection
  const handleSelectTile = useCallback((pos, dirKey) => {
    const newCursor = cubePosToCursor(pos, dirKey);
    useGameStore.getState().setCursor(newCursor);
    setShowCursor(true);
    setSelectedTileForRotation({ pos, dirKey, cursor: newCursor });
  }, [cubePosToCursor, setShowCursor, setSelectedTileForRotation]);

  // Face rotation handlers
  const handleFaceRotationMode = useCallback((target) => {
    setFaceRotationTarget(target);
  }, [setFaceRotationTarget]);

  const handleFaceRotate = useCallback((direction) => {
    if (!faceRotationTarget) return;
    const { pos, dirKey } = faceRotationTarget;
    const dir = direction === 'cw' ? -1 : 1;

    let axis, sliceIndex;
    switch (dirKey) {
      case 'PZ': case 'NZ': axis = 'depth'; sliceIndex = pos.z; break;
      case 'PX': case 'NX': axis = 'col'; sliceIndex = pos.x; break;
      case 'PY': case 'NY': axis = 'row'; sliceIndex = pos.y; break;
      default: return;
    }

    let adjustedDir = dir;
    if (dirKey === 'NZ' || dirKey === 'NX' || dirKey === 'NY') {
      adjustedDir = -dir;
    }

    startAnimation(axis, adjustedDir, sliceIndex);
    setFaceRotationTarget(null);
  }, [faceRotationTarget, startAnimation, setFaceRotationTarget]);

  // Tile rotation handlers
  const handleTileRotation = useCallback((direction) => {
    if (!selectedTileForRotation) return;
    const { cursor: cur } = selectedTileForRotation;
    const { face } = cur;
    const pos = cursorToCubePos(cur);

    const directionMap = {
      up: { PZ: ['col', -1], NZ: ['col', 1], PX: ['depth', 1], NX: ['depth', -1], PY: ['depth', -1], NY: ['depth', 1] },
      down: { PZ: ['col', 1], NZ: ['col', -1], PX: ['depth', -1], NX: ['depth', 1], PY: ['depth', 1], NY: ['depth', -1] },
      left: { PZ: ['row', -1], NZ: ['row', -1], PX: ['row', -1], NX: ['row', -1], PY: ['col', -1], NY: ['col', 1] },
      right: { PZ: ['row', 1], NZ: ['row', 1], PX: ['row', 1], NX: ['row', 1], PY: ['col', 1], NY: ['col', -1] },
    };

    const [axis, dir] = directionMap[direction]?.[face] || [];
    if (axis && dir !== undefined) {
      onMove(axis, dir, pos);
    }
    setSelectedTileForRotation(null);
  }, [selectedTileForRotation, cursorToCubePos, onMove, setSelectedTileForRotation]);

  const handleTileFaceRotation = useCallback((direction) => {
    if (!selectedTileForRotation) return;
    const { cursor: cur } = selectedTileForRotation;
    const { face } = cur;
    const pos = cursorToCubePos(cur);
    const dir = direction === 'cw' ? -1 : 1;

    let axis;
    switch (face) {
      case 'PZ': case 'NZ': axis = 'depth'; break;
      case 'PX': case 'NX': axis = 'col'; break;
      case 'PY': case 'NY': axis = 'row'; break;
    }

    let adjustedDir = dir;
    if (face === 'NZ' || face === 'NX' || face === 'NY') {
      adjustedDir = -dir;
    }

    if (axis) {
      const sliceIndex = axis === 'col' ? pos.x : axis === 'row' ? pos.y : pos.z;
      startAnimation(axis, adjustedDir, sliceIndex);
    }
    setSelectedTileForRotation(null);
  }, [selectedTileForRotation, cursorToCubePos, startAnimation, setSelectedTileForRotation]);

  // Cursor-based rotation
  const performCursorRotation = useCallback((rotationType) => {
    if (animState) return;
    const { axis, dir, pos } = getRotationParams(rotationType);
    if (axis && dir !== undefined) {
      onMove(axis, dir, pos);
    }
    setShowCursor(true);
  }, [animState, getRotationParams, onMove, setShowCursor]);

  const performCursorFlip = useCallback(() => {
    const pos = cursorToCubePos(cursor);
    onTapFlip({ x: pos.x, y: pos.y, z: pos.z }, pos.dirKey);
    setShowCursor(true);
  }, [cursor, cursorToCubePos, onTapFlip, setShowCursor]);

  // Level-specific shuffle
  const shuffleForLevel = useCallback(() => {
    const levelSize = currentLevelData?.cubeSize || size;
    let state = makeCubies(levelSize);
    const shuffleCount = currentLevelData ? Math.min(25, 10 + currentLevel * 2) : 25;
    for (let i = 0; i < shuffleCount; i++) {
      const ax = ['row', 'col', 'depth'][Math.floor(Math.random() * 3)];
      const slice = Math.floor(Math.random() * levelSize);
      const dir = Math.random() > 0.5 ? 1 : -1;
      state = rotateSliceCubies(state, levelSize, ax, slice, dir);
    }
    setCubies(state);
    useGameStore.getState().resetGame();
    useGameStore.getState().setHasShuffled(true);
  }, [currentLevelData, currentLevel, size, setCubies]);

  // Tutorial close handler
  const handleTutorialClose = useCallback(() => {
    levelTutorialClose();
    shuffleForLevel();
  }, [levelTutorialClose, shuffleForLevel]);

  // Victory handlers
  const handleVictoryContinue = useCallback(() => {
    if (currentLevel) completeLevel(currentLevel);
    setVictory(null);
  }, [currentLevel, setVictory]);

  const handleVictoryNewGame = useCallback(() => {
    if (currentLevel) completeLevel(currentLevel);
    setVictory(null);
    if (currentLevelData) shuffleForLevel();
    else shuffle();
  }, [currentLevel, currentLevelData, setVictory, shuffleForLevel, shuffle]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel) completeLevel(currentLevel);
    levelHandleNextLevel();
    setVictory(null);
  }, [currentLevel, levelHandleNextLevel, setVictory]);

  // Dev console handlers
  const handlePreset = useCallback((presetId) => {
    let state = makeCubies(size);
    let moveCount = 0;

    const applyRandomMoves = (count) => {
      for (let i = 0; i < count; i++) {
        const ax = ['row', 'col', 'depth'][Math.floor(Math.random() * 3)];
        const slice = Math.floor(Math.random() * size);
        const dir = Math.random() > 0.5 ? 1 : -1;
        state = rotateSliceCubies(state, size, ax, slice, dir);
      }
      return count;
    };

    switch (presetId) {
      case 'solved': break;
      case 'near-solved': moveCount = applyRandomMoves(3); break;
      case 'scrambled-10': moveCount = applyRandomMoves(10); break;
      case 'scrambled-25': moveCount = applyRandomMoves(25); break;
      case 'scrambled-50': moveCount = applyRandomMoves(50); break;
      default: break;
    }

    setCubies(state);
    useGameStore.getState().setMoves(moveCount);
    useGameStore.getState().clearHistory();
    useGameStore.getState().setHasShuffled(true);
  }, [size, setCubies]);

  const handleInstantChaos = useCallback((targetDisparity) => {
    const totalStickers = size * size * 6;
    const targetFlips = Math.floor((totalStickers * targetDisparity) / 100);
    let state = cubies;
    let flippedCount = 0;

    while (flippedCount < targetFlips) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const z = Math.floor(Math.random() * size);
      const dirs = ['PX', 'NX', 'PY', 'NY', 'PZ', 'NZ'];
      const dirKey = dirs[Math.floor(Math.random() * dirs.length)];
      const onEdge =
        (dirKey === 'PX' && x === size - 1) || (dirKey === 'NX' && x === 0) ||
        (dirKey === 'PY' && y === size - 1) || (dirKey === 'NY' && y === 0) ||
        (dirKey === 'PZ' && z === size - 1) || (dirKey === 'NZ' && z === 0);

      if (onEdge) {
        const freshManifoldMap = buildManifoldGridMap(state, size);
        state = flipStickerPair(state, size, x, y, z, dirKey, freshManifoldMap);
        flippedCount++;
      }
    }
    setCubies(state);
    useGameStore.getState().setHasShuffled(true);
  }, [cubies, size, setCubies]);

  const handleSaveState = useCallback(() => {
    setSavedCubeState({
      cubies: JSON.parse(JSON.stringify(cubies)),
      moves,
      size,
      timestamp: Date.now()
    });
    alert('State saved! Use Ctrl+L to load it back.');
  }, [cubies, moves, size, setSavedCubeState]);

  const handleLoadState = useCallback(() => {
    if (!savedCubeState) return;
    if (savedCubeState.size !== size) {
      alert(`Saved state is for ${savedCubeState.size}×${savedCubeState.size} cube.`);
      return;
    }
    setCubies(savedCubeState.cubies);
    useGameStore.getState().setMoves(savedCubeState.moves);
    useGameStore.getState().clearHistory();
  }, [savedCubeState, size, setCubies]);

  // ========================================================================
  // KEYBOARD HANDLER
  // ========================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (showLevelTutorial && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleTutorialClose();
        return;
      }

      const key = e.key.toLowerCase();

      // Hands mode keyboard handler
      if (handsMode) {
        if (!['escape', 'h', '?', '`', 'r', 'z', 'v', 'x', 't', 'c', 'p', 'b'].includes(key) && !e.ctrlKey && !e.metaKey) {
          const moveName = keyToMove(e);
          if (moveName) {
            e.preventDefault();
            executeHandsMove(moveName);
            return;
          }
        }
      }

      // Arrow keys
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        moveCursor(e.key.replace('Arrow', '').toLowerCase());
        return;
      }

      // WASDQE rotation
      if ('wasdqe'.includes(key)) {
        e.preventDefault();
        const rotMap = { w: 'up', s: 'down', a: 'left', d: 'right', q: 'ccw', e: 'cw' };
        performCursorRotation(rotMap[key]);
        return;
      }

      // F - flip
      if (key === 'f') {
        e.preventDefault();
        if (flipMode && (!currentLevelData || currentLevelData.features.flips)) {
          performCursorFlip();
        }
        return;
      }

      // Z - undo
      if (key === 'z' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Backtick - dev console
      if (e.key === '`') {
        e.preventDefault();
        setShowDevConsole(!showDevConsole);
        return;
      }

      // R - reset
      if (key === 'r') {
        e.preventDefault();
        if (e.shiftKey) {
          reset();
          setTimeout(() => shuffle(), 100);
        } else {
          reset();
        }
        return;
      }

      // Ctrl+S - save
      if (key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSaveState();
        return;
      }

      // Ctrl+L - load
      if (key === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleLoadState();
        return;
      }

      // Shift+number - jump to level
      if (e.shiftKey && /[0-9]/.test(key)) {
        e.preventDefault();
        const level = key === '0' ? 10 : parseInt(key);
        handleLevelSelect(level);
        return;
      }

      // Other shortcuts
      switch (key) {
        case 'h': case '?': setShowHelp(h => !h); break;
        case 'g': if (!currentLevelData || currentLevelData.features.flips) setFlipMode(f => !f); break;
        case 't': if (!currentLevelData || currentLevelData.features.tunnels) setShowTunnels(t => !t); break;
        case 'x': if (!currentLevelData || currentLevelData.features.explode) setExploded(ex => !ex); break;
        case 'n': if (!currentLevelData || currentLevelData.features.net) setShowNetPanel(p => !p); break;
        case 'v': setVisualMode(v => {
          const modes = ['classic', 'grid', 'sudokube', 'wireframe', 'glass'];
          return modes[(modes.indexOf(v) + 1) % modes.length];
        }); break;
        case 'c': if (!currentLevelData || currentLevelData.features.chaos) setChaosLevel(l => l > 0 ? 0 : 1); break;
        case 'p':
          setHandsMode(!handsMode);
          if (!handsMode) {
            setHandsMoveHistory([]);
            setHandsMoveQueue([]);
            setHandsTps(0);
            handsMoveTimestamps.current = [];
          }
          break;
        case 'escape':
          setShowHelp(false);
          setShowSettings(false);
          setShowCursor(false);
          if (handsMode) setHandsMode(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cursor, animState, flipMode, showLevelTutorial, currentLevelData, handsMode,
    moveCursor, performCursorRotation, performCursorFlip, undo, executeHandsMove,
    handleSaveState, handleLoadState, handleLevelSelect, handleTutorialClose,
    reset, shuffle, showDevConsole, setShowDevConsole, setShowHelp, setFlipMode,
    setShowTunnels, setExploded, setShowNetPanel, setVisualMode, setChaosLevel,
    setHandsMode, setHandsMoveHistory, setHandsMoveQueue, setHandsTps, setShowCursor, setShowSettings
  ]);

  // ========================================================================
  // RENDER
  // ========================================================================
  const cameraZ = { 2: 10, 3: 14, 4: 20, 5: 26 }[size] || 14;

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleWelcomeComplete} />;
  }

  return (
    <div className={`full-screen${settings.backgroundTheme === 'dark' ? ' bg-dark' : settings.backgroundTheme === 'midnight' ? ' bg-midnight' : ''}`}>
      {showTutorial && <Tutorial onClose={closeTutorial} />}

      <div className="canvas-container" onContextMenu={(e) => e.preventDefault()}>
        <Canvas camera={{ position: [0, 0, cameraZ], fov: 40 }}>
          <ambientLight intensity={visualMode === 'wireframe' ? 0.2 : visualMode === 'glass' ? 0.5 : 0.8} />
          <directionalLight position={[5, 8, 5]} intensity={visualMode === 'wireframe' ? 0.3 : visualMode === 'glass' ? 1.6 : 1.2} castShadow />
          <pointLight position={[10, 10, 10]} intensity={visualMode === 'wireframe' ? 0.3 : visualMode === 'glass' ? 1.0 : 0.8} />
          <pointLight position={[-10, -10, -10]} intensity={visualMode === 'wireframe' ? 0.2 : visualMode === 'glass' ? 0.5 : 0.6} />
          {visualMode === 'wireframe' && (
            <>
              <pointLight position={[0, 0, 0]} intensity={0.5} color="#fefae0" distance={15} decay={2} />
              <pointLight position={[5, 5, 5]} intensity={0.25} color="#dda15e" />
              <pointLight position={[-5, -5, -5]} intensity={0.2} color="#bc6c25" />
            </>
          )}
          {visualMode === 'glass' && (
            <>
              <pointLight position={[-8, 6, 8]} intensity={0.6} color="#ffffff" />
              <pointLight position={[8, -4, -6]} intensity={0.3} color="#e0e8ff" />
            </>
          )}
          <Suspense fallback={null}>
            {currentLevelData?.background === 'blackhole' && <BlackHoleEnvironment flipTrigger={blackHolePulse} />}
            {currentLevelData?.background && currentLevelData.background !== 'blackhole' && getLevelBackground(currentLevelData.background, blackHolePulse)}
            {/* Free play: real photo panorama backgrounds via HDR environment presets */}
            {!currentLevelData && PHOTO_PRESETS.has(settings.backgroundTheme) ? (
              <Environment preset={settings.backgroundTheme} background />
            ) : (
              <Environment preset="city" />
            )}

            <CubeAssembly
              size={size}
              cubies={cubies}
              onMove={onMove}
              onTapFlip={onTapFlip}
              visualMode={visualMode}
              animState={animState}
              onAnimComplete={handleAnimComplete}
              showTunnels={showTunnels}
              explosionFactor={explosionT}
              cascades={cascades}
              onCascadeComplete={onCascadeComplete}
              manifoldMap={manifoldMap}
              showInvitation={!useGameStore.getState().hasFlippedOnce}
              cursor={cursor}
              showCursor={showCursor}
              flipMode={flipMode}
              onSelectTile={handleSelectTile}
              onClearTileSelection={() => setSelectedTileForRotation(null)}
              flipWaveOrigins={flipWaveOrigins}
              onFlipWaveComplete={onFlipWaveComplete}
              faceColors={resolvedColors}
              faceTextures={faceTextures}
              manifoldStyles={settings.manifoldStyles}
              solveHighlights={solveModeActive ? solveHighlights : []}
              onFaceRotationMode={handleFaceRotationMode}
              handsMode={handsMode}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="ui-layer">
        <TopMenuBar
          moves={moves}
          metrics={metrics}
          size={size}
          visualMode={visualMode}
          flipMode={flipMode}
          chaosMode={chaosMode}
          chaosLevel={chaosLevel}
          cubies={cubies}
          onShowHelp={() => setShowHelp(true)}
          onShowSettings={() => setShowSettings(true)}
          achievedWins={achievedWins}
          faceColors={resolvedColors}
          faceTextures={faceTextures}
          showStats={settings.showStats}
          showFaceProgress={settings.showFaceProgress}
        />

        {/* Undo Indicator */}
        {moveHistory.length > 0 && (
          <div
            style={{
              position: 'fixed', bottom: '20px', left: '20px',
              background: 'rgba(0, 217, 255, 0.15)', border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '8px', padding: '8px 16px', color: '#00d9ff',
              fontFamily: "'Courier New', monospace", fontSize: '14px', fontWeight: 'bold',
              zIndex: 100, backdropFilter: 'blur(10px)', cursor: 'pointer',
            }}
            onClick={undo}
            title="Click or press Z to undo"
          >
            Z: Undo ({moveHistory.length})
          </div>
        )}

        {/* Auto-rotate Preview */}
        {autoRotateEnabled && chaosMode && (
          <RotationPreview upcomingRotation={upcomingRotation} countdown={rotationCountdown} maxCountdown={10000} size={size} />
        )}

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="controls-compact ui-element">
            <div className="controls-row">
              <button className={`btn-compact text ${flipMode ? 'active' : ''} ${currentLevelData && !currentLevelData.features.flips ? 'locked' : ''}`}
                onClick={() => { if (!currentLevelData || currentLevelData.features.flips) setFlipMode(!flipMode); }}
                disabled={currentLevelData && !currentLevelData.features.flips}>
                {currentLevelData && !currentLevelData.features.flips && <span className="lock-icon">🔒</span>}FLIP
              </button>
              <button className={`btn-compact text ${chaosMode ? 'chaos' : ''} ${currentLevelData && !currentLevelData.features.chaos ? 'locked' : ''}`}
                onClick={() => { if (!currentLevelData || currentLevelData.features.chaos) setChaosLevel(l => l > 0 ? 0 : 1); }}
                disabled={currentLevelData && !currentLevelData.features.chaos}>
                {currentLevelData && !currentLevelData.features.chaos && <span className="lock-icon">🔒</span>}CHAOS
              </button>
              {chaosMode && currentLevelData?.features.chaos !== false && (
                <>
                  <div className="chaos-levels">
                    {[1, 2, 3, 4].map((l) => {
                      const maxChaos = currentLevelData?.chaosLevel || 4;
                      const isLocked = currentLevelData && l > maxChaos;
                      return (
                        <button key={l} className={`btn-level ${chaosLevel === l ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                          onClick={() => !isLocked && setChaosLevel(l)} disabled={isLocked}>
                          {isLocked && <span className="lock-icon-small">🔒</span>}L{l}
                        </button>
                      );
                    })}
                  </div>
                  <button className={`btn-compact text ${autoRotateEnabled ? 'active' : ''}`}
                    onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}>AUTO</button>
                </>
              )}
              <button className={`btn-compact text ${exploded ? 'active' : ''} ${currentLevelData && !currentLevelData.features.explode ? 'locked' : ''}`}
                onClick={() => { if (!currentLevelData || currentLevelData.features.explode) setExploded(!exploded); }}
                disabled={currentLevelData && !currentLevelData.features.explode}>
                {currentLevelData && !currentLevelData.features.explode && <span className="lock-icon">🔒</span>}EXPLODE
              </button>
              <button className={`btn-compact text ${showTunnels ? 'active' : ''} ${currentLevelData && !currentLevelData.features.tunnels ? 'locked' : ''}`}
                onClick={() => { if (!currentLevelData || currentLevelData.features.tunnels) setShowTunnels(!showTunnels); }}
                disabled={currentLevelData && !currentLevelData.features.tunnels}>
                {currentLevelData && !currentLevelData.features.tunnels && <span className="lock-icon">🔒</span>}TUNNELS
              </button>
              <button className={`btn-compact text ${showNetPanel ? 'active' : ''} ${currentLevelData && !currentLevelData.features.net ? 'locked' : ''}`}
                onClick={() => { if (!currentLevelData || currentLevelData.features.net) setShowNetPanel(!showNetPanel); }}
                disabled={currentLevelData && !currentLevelData.features.net}>
                {currentLevelData && !currentLevelData.features.net && <span className="lock-icon">🔒</span>}NET
              </button>
              <button className="btn-compact text"
                onClick={() => setVisualMode(v => {
                  const modes = ['classic', 'grid', 'sudokube', 'wireframe', 'glass'];
                  return modes[(modes.indexOf(v) + 1) % modes.length];
                })}>
                {visualMode.toUpperCase()}
              </button>
              <select className={`btn-compact ${currentLevelData ? 'locked' : ''}`} value={size}
                onChange={(e) => { if (!currentLevelData) changeSize(Number(e.target.value)); }}
                disabled={!!currentLevelData} style={{ fontFamily: "'Courier New', monospace" }}>
                {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}×{n}</option>)}
              </select>
              <button className="btn-compact shuffle text" onClick={currentLevelData ? shuffleForLevel : shuffle}>SHUFFLE</button>
              <button className="btn-compact reset text" onClick={reset}>RESET</button>
              <button className={`btn-compact text ${solveModeActive ? 'active' : ''}`}
                onClick={() => { setSolveModeActive(!solveModeActive); if (!solveModeActive) setSolveFocusedStep(null); else setSolveHighlights([]); }}
                style={{ color: solveModeActive ? '#00ff88' : undefined, borderColor: solveModeActive ? '#00ff88' : undefined }}>
                SOLVE
              </button>
              <button className={`btn-compact text ${handsMode ? 'active' : ''}`}
                onClick={() => { setHandsMode(!handsMode); if (!handsMode) { setHandsMoveHistory([]); setHandsMoveQueue([]); setHandsTps(0); handsMoveTimestamps.current = []; } }}
                style={{ color: handsMode ? '#ff6b35' : undefined, borderColor: handsMode ? '#ff6b35' : undefined }}>
                HANDS
              </button>
              {currentLevelData && (
                <>
                  <button className="btn-compact text" onClick={() => setShowLevelSelect(true)}
                    style={{ color: '#9370DB', borderColor: '#9370DB' }}>LEVELS</button>
                  <button className="btn-compact text freeplay"
                    onClick={() => { useGameStore.getState().clearLevel(); }}>FREEPLAY</button>
                </>
              )}
            </div>
          </div>

          {settings.showManifoldFooter && (
            <div className="manifold-selector" style={{ fontFamily: 'Georgia, serif', fontSize: '10px', color: '#9c6644', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
              Standard Euclidean ——— <span style={{ color: '#bc6c25', fontWeight: 600 }}>Antipodal Projection</span> ——— Real Projective Plane
            </div>
          )}
        </div>
      </div>

      {/* Level Badge */}
      {currentLevelData && !showMainMenu && !showLevelSelect && !victory && (
        <div className="level-badge">
          <span className="level-badge-number">{currentLevel}</span>
          <span className="level-badge-name">{currentLevelData.name}</span>
        </div>
      )}

      {showMainMenu && (
        <MainMenu
          onPlay={handleMenuPlay}
          onLevels={handleMenuLevels}
          onFreeplay={handleMenuFreeplay}
          onSettings={handleMenuSettings}
          onHelp={handleMenuHelp}
        />
      )}
      {showLevelSelect && <LevelSelectScreen onSelectLevel={handleLevelSelect} onBack={handleBackToMainMenu} />}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={setSettings} faceImages={faceImages} onFaceImage={handleFaceImage} />}
      {showHelp && <HelpMenu onClose={() => setShowHelp(false)} />}
      {showFirstFlipTutorial && <FirstFlipTutorial onClose={() => setShowFirstFlipTutorial(false)} />}

      {solveModeActive && (
        <SolveMode cubies={cubies} size={size} onClose={() => { setSolveModeActive(false); setSolveHighlights([]); }}
          onHighlightChange={setSolveHighlights} focusedStep={solveFocusedStep} onFocusStep={setSolveFocusedStep} />
      )}

      {victory && (
        <VictoryScreen winType={victory} moves={moves} time={gameTime}
          onContinue={handleVictoryContinue} onNewGame={handleVictoryNewGame}
          currentLevel={currentLevel} levelData={currentLevelData}
          onNextLevel={handleNextLevel} hasNextLevel={currentLevel && currentLevel < 10} />
      )}

      {showCutscene && currentLevel === 10 && <Level10Cutscene onComplete={handleCutsceneComplete} onSkip={handleCutsceneComplete} />}
      {showLevelTutorial && currentLevelData && <LevelTutorial level={currentLevelData} onClose={handleTutorialClose} />}
      {showNetPanel && <CubeNet cubies={cubies} size={size} onTapFlip={onTapFlip} flipMode={flipMode} onClose={() => setShowNetPanel(false)} faceColors={resolvedColors} faceTextures={faceTextures} />}

      {isMobile && !showWelcome && !showTutorial && (
        <MobileControls onShowSettings={() => setShowSettings(true)} onShowHelp={() => setShowHelp(true)}
          flipMode={flipMode} onToggleFlip={() => setFlipMode(!flipMode)} exploded={exploded}
          onToggleExplode={() => setExploded(!exploded)} showTunnels={showTunnels}
          onToggleTunnels={() => setShowTunnels(!showTunnels)} onShuffle={shuffle} onReset={reset}
          showNetPanel={showNetPanel} onToggleNet={() => setShowNetPanel(!showNetPanel)}
          onRotateCW={() => performCursorRotation('cw')} onRotateCCW={() => performCursorRotation('ccw')} />
      )}

      {showMobileTouchHint && !showWelcome && !showTutorial && !showMainMenu && (
        <div className="mobile-touch-hint">Swipe to rotate • Tap tile for options</div>
      )}

      {faceRotationTarget && <FaceRotationButtons onRotateCW={() => handleFaceRotate('cw')} onRotateCCW={() => handleFaceRotate('ccw')} onCancel={() => setFaceRotationTarget(null)} />}
      {selectedTileForRotation && !flipMode && <TileRotationSelector onRotate={handleTileRotation} onRotateFaceCW={() => handleTileFaceRotation('cw')} onRotateFaceCCW={() => handleTileFaceRotation('ccw')} onCancel={() => setSelectedTileForRotation(null)} />}
      {handsMode && <HandsOverlay recentMoves={handsMoveHistory} lastMove={handsMoveHistory.length > 0 ? handsMoveHistory[handsMoveHistory.length - 1] : null} tps={handsTps} />}
      {showDevConsole && <DevConsole onClose={() => setShowDevConsole(false)} onPreset={handlePreset} onSaveState={handleSaveState} onLoadState={handleLoadState} hasSavedState={!!savedCubeState} size={size} onJumpToLevel={handleLevelSelect} onInstantChaos={handleInstantChaos} moveHistory={moveHistory} />}
    </div>
  );
}
