import React, { useState } from 'react';

/**
 * Mobile-optimized floating controls for touch devices
 * Provides quick access to settings, help, and essential game controls
 */
const MobileControls = ({
  onShowSettings,
  onShowHelp,
  flipMode,
  onToggleFlip,
  exploded,
  onToggleExplode,
  showTunnels,
  onToggleTunnels,
  onShuffle,
  onReset,
  showNetPanel,
  onToggleNet
}) => {
  const [expanded, setExpanded] = useState(false);

  const buttonStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(30, 35, 50, 0.9)',
    backdropFilter: 'blur(12px)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: 'rgba(59, 130, 246, 0.8)',
    borderColor: 'rgba(96, 165, 250, 0.5)'
  };

  const smallButtonStyle = {
    ...buttonStyle,
    width: '42px',
    height: '42px',
    fontSize: '14px'
  };

  const activeSmallButtonStyle = {
    ...smallButtonStyle,
    background: 'rgba(59, 130, 246, 0.8)',
    borderColor: 'rgba(96, 165, 250, 0.5)'
  };

  return (
    <>
      {/* Main FAB - Settings */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
        right: '16px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'auto'
      }}>
        {/* Expanded menu */}
        {expanded && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeInUp 0.2s ease'
          }}>
            {/* Help */}
            <button
              onClick={() => { onShowHelp(); setExpanded(false); }}
              style={smallButtonStyle}
              aria-label="Help"
            >
              ?
            </button>

            {/* Flip toggle */}
            <button
              onClick={onToggleFlip}
              style={flipMode ? activeSmallButtonStyle : smallButtonStyle}
              aria-label="Toggle flip mode"
            >
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>FLIP</span>
            </button>

            {/* Tunnels toggle */}
            <button
              onClick={onToggleTunnels}
              style={showTunnels ? activeSmallButtonStyle : smallButtonStyle}
              aria-label="Toggle tunnels"
            >
              <span style={{ fontSize: '16px' }}>&#8651;</span>
            </button>

            {/* Explode toggle */}
            <button
              onClick={onToggleExplode}
              style={exploded ? activeSmallButtonStyle : smallButtonStyle}
              aria-label="Toggle exploded view"
            >
              <span style={{ fontSize: '14px' }}>&#9881;</span>
            </button>

            {/* Net panel toggle */}
            <button
              onClick={onToggleNet}
              style={showNetPanel ? activeSmallButtonStyle : smallButtonStyle}
              aria-label="Toggle net view"
            >
              <span style={{ fontSize: '12px', fontWeight: 600 }}>NET</span>
            </button>

            {/* Shuffle */}
            <button
              onClick={onShuffle}
              style={{
                ...smallButtonStyle,
                background: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(74, 222, 128, 0.5)'
              }}
              aria-label="Shuffle"
            >
              <span style={{ fontSize: '16px' }}>&#8635;</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              style={{
                ...smallButtonStyle,
                background: 'rgba(100, 116, 139, 0.8)',
                borderColor: 'rgba(148, 163, 184, 0.5)'
              }}
              aria-label="Reset"
            >
              <span style={{ fontSize: '14px' }}>&#8634;</span>
            </button>
          </div>
        )}

        {/* Settings button (main FAB) */}
        <button
          onClick={() => { onShowSettings(); setExpanded(false); }}
          style={{
            ...buttonStyle,
            width: '56px',
            height: '56px',
            fontSize: '22px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
            borderColor: 'rgba(96, 165, 250, 0.5)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
          }}
          aria-label="Settings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Toggle expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            ...buttonStyle,
            width: '40px',
            height: '40px',
            fontSize: '18px',
            background: 'rgba(50, 55, 70, 0.9)'
          }}
          aria-label={expanded ? "Close menu" : "Open menu"}
        >
          {expanded ? '×' : '☰'}
        </button>
      </div>

      {/* Touch hint overlay - shown initially */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default MobileControls;
