// src/worm/WormTouchControls.jsx
// Touch controls overlay for mobile WORM mode
// Swipe gestures trigger cube rotations, tap buttons for camera toggle

import React, { useRef, useCallback, useState, useEffect } from 'react';

const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels
const SWIPE_TIMEOUT = 300;  // Max time for a swipe gesture

export default function WormTouchControls({
  onRotate,
  wormHead,
  onCameraToggle,
  wormCameraEnabled,
  gameState,
  onPause,
  onResume,
  onMoveForward,  // Turn-based: move worm forward
  onTurnLeft,     // Turn-based: turn worm left
  onTurnRight     // Turn-based: turn worm right
}) {
  const touchStartRef = useRef(null);
  const touchStartTimeRef = useRef(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Hide swipe hint after first swipe
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (gameState !== 'playing') return;

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartTimeRef.current = Date.now();
  }, [gameState]);

  const handleTouchEnd = useCallback((e) => {
    if (gameState !== 'playing') return;
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartTimeRef.current;

    // Reset
    touchStartRef.current = null;

    // Check if it's a valid swipe
    if (deltaTime > SWIPE_TIMEOUT) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return;

    // Determine swipe direction and trigger rotation
    if (!wormHead || !onRotate) return;

    setShowSwipeHint(false);

    if (absX > absY) {
      // Horizontal swipe - row rotation (like A/D keys)
      if (deltaX > 0) {
        // Swipe right -> D key -> row rotation positive
        onRotate('row', 1, wormHead.y);
      } else {
        // Swipe left -> A key -> row rotation negative
        onRotate('row', -1, wormHead.y);
      }
    } else {
      // Vertical swipe - column rotation (like W/S keys)
      if (deltaY < 0) {
        // Swipe up -> W key -> column rotation negative
        onRotate('col', -1, wormHead.x);
      } else {
        // Swipe down -> S key -> column rotation positive
        onRotate('col', 1, wormHead.x);
      }
    }
  }, [gameState, wormHead, onRotate]);

  const handleTouchMove = useCallback((e) => {
    // Prevent scrolling while swiping
    if (touchStartRef.current) {
      e.preventDefault();
    }
  }, []);

  // Face rotation buttons (Q/E equivalent)
  const handleFaceRotate = useCallback((dir) => {
    if (gameState !== 'playing') return;
    if (!wormHead || !onRotate) return;
    onRotate('depth', dir, wormHead.z);
  }, [gameState, wormHead, onRotate]);

  return (
    <div
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Swipe hint overlay */}
      {showSwipeHint && gameState === 'playing' && (
        <div style={styles.swipeHint}>
          <div style={styles.swipeIcon}>↔️ ↕️</div>
          <div>Swipe to rotate</div>
        </div>
      )}

      {/* Control buttons - bottom area */}
      <div style={styles.controlsContainer}>
        {/* Movement controls - for turn-based gameplay */}
        <div style={styles.movementRow}>
          <button
            style={styles.turnButton}
            onTouchStart={(e) => { e.stopPropagation(); onTurnLeft?.(); }}
            onClick={() => onTurnLeft?.()}
          >
            ↰
          </button>
          <button
            style={styles.forwardButton}
            onTouchStart={(e) => { e.stopPropagation(); onMoveForward?.(); }}
            onClick={() => onMoveForward?.()}
          >
            ▲
          </button>
          <button
            style={styles.turnButton}
            onTouchStart={(e) => { e.stopPropagation(); onTurnRight?.(); }}
            onClick={() => onTurnRight?.()}
          >
            ↱
          </button>
        </div>

        {/* Rotation & utility controls */}
        <div style={styles.buttonBar}>
          {/* Face rotation buttons */}
          <button
            style={styles.rotateButton}
            onTouchStart={(e) => { e.stopPropagation(); handleFaceRotate(1); }}
            onClick={() => handleFaceRotate(1)}
          >
            ↺ Q
          </button>

          {/* Pause/Resume button */}
          <button
            style={styles.pauseButton}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              if (gameState === 'playing') onPause?.();
              else if (gameState === 'paused') onResume?.();
            }}
          >
            {gameState === 'playing' ? '⏸' : '▶'}
          </button>

          {/* Camera toggle button */}
          <button
            style={{
              ...styles.cameraButton,
              ...(wormCameraEnabled ? styles.cameraButtonActive : {})
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={onCameraToggle}
          >
            {wormCameraEnabled ? '🎥' : '👁️'}
          </button>

          {/* Face rotation buttons */}
          <button
            style={styles.rotateButton}
            onTouchStart={(e) => { e.stopPropagation(); handleFaceRotate(-1); }}
            onClick={() => handleFaceRotate(-1)}
          >
            E ↻
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    pointerEvents: 'auto',
    touchAction: 'none' // Prevent browser gestures
  },
  swipeHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '20px 30px',
    borderRadius: '12px',
    border: '2px solid #00ff88',
    color: '#00ff88',
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    textAlign: 'center',
    pointerEvents: 'none',
    animation: 'pulse 2s infinite'
  },
  swipeIcon: {
    fontSize: '24px',
    marginBottom: '8px'
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center'
  },
  movementRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  forwardButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid #00ff88',
    background: 'rgba(0, 255, 136, 0.2)',
    color: '#00ff88',
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)'
  },
  turnButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '2px solid #00aaff',
    background: 'rgba(0, 170, 255, 0.15)',
    color: '#00aaff',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation'
  },
  buttonBar: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  rotateButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '2px solid #00ff88',
    background: 'rgba(0, 20, 10, 0.8)',
    color: '#00ff88',
    fontSize: '14px',
    fontFamily: "'Courier New', monospace",
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation'
  },
  pauseButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid #888',
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation'
  },
  cameraButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '2px solid #ffa500',
    background: 'rgba(255, 165, 0, 0.15)',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation',
    transition: 'all 0.2s ease'
  },
  cameraButtonActive: {
    border: '2px solid #ff6b6b',
    background: 'rgba(255, 107, 107, 0.3)',
    boxShadow: '0 0 15px rgba(255, 107, 107, 0.5)'
  }
};
