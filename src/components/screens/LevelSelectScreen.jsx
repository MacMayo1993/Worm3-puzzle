import React, { useState } from 'react';

const LEVELS = [
  { id: 1, name: 'First Steps', description: 'Learn basic rotations', unlocked: false, comingSoon: true },
  { id: 2, name: 'Color Match', description: 'Match two faces', unlocked: false, comingSoon: true },
  { id: 3, name: 'Cross Training', description: 'Form a cross pattern', unlocked: false, comingSoon: true },
  { id: 4, name: 'Corner Quest', description: 'Solve the corners', unlocked: false, comingSoon: true },
  { id: 5, name: 'Edge Master', description: 'Master the edges', unlocked: false, comingSoon: true },
  { id: 6, name: 'Two Faces', description: 'Complete two sides', unlocked: false, comingSoon: true },
  { id: 7, name: 'Flip Zone', description: 'Introduction to flipping', unlocked: false, comingSoon: true },
  { id: 8, name: 'Wormhole', description: 'Navigate the tunnels', unlocked: false, comingSoon: true },
  { id: 9, name: 'Chaos Theory', description: 'Embrace instability', unlocked: false, comingSoon: true },
  { id: 10, name: 'Black Hole', description: 'Full antipodal topology', unlocked: true, comingSoon: false, isBlackHole: true },
];

const LevelSelectScreen = ({ onSelectLevel, onBack }) => {
  const [hoveredLevel, setHoveredLevel] = useState(null);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      height: '100dvh',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '700px',
        width: '95%',
        padding: '36px',
        maxHeight: 'calc(100dvh - 40px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
        background: 'rgba(20, 25, 40, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 100px rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '42px',
          fontWeight: 700,
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: '"Product Sans", "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: '0.05em'
        }}>Select Level</h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '28px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          Master each level to unlock the mysteries of topology
        </p>

        {/* Level Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '28px'
        }}>
          {LEVELS.map((level) => {
            const isHovered = hoveredLevel === level.id;
            const canPlay = level.unlocked && !level.comingSoon;

            return (
              <button
                key={level.id}
                onClick={() => canPlay && onSelectLevel(level.id)}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  background: level.isBlackHole
                    ? 'radial-gradient(circle at center, #1a0a2e 0%, #0d0015 50%, #000 100%)'
                    : level.comingSoon
                      ? 'rgba(40, 45, 60, 0.6)'
                      : isHovered
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(50, 55, 70, 0.8)',
                  border: level.isBlackHole
                    ? '2px solid #8b5cf6'
                    : level.comingSoon
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : isHovered
                        ? '2px solid rgba(96, 165, 250, 0.8)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  cursor: canPlay ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  transform: isHovered && canPlay ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: level.isBlackHole
                    ? '0 0 30px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.8)'
                    : isHovered && canPlay
                      ? '0 4px 20px rgba(59, 130, 246, 0.4)'
                      : 'none',
                  opacity: level.comingSoon ? 0.5 : 1,
                  overflow: 'hidden'
                }}
              >
                {/* Black hole animated ring effect */}
                {level.isBlackHole && (
                  <div style={{
                    position: 'absolute',
                    inset: '3px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite',
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Level number */}
                <span style={{
                  fontSize: level.isBlackHole ? '28px' : '32px',
                  fontWeight: 700,
                  color: level.isBlackHole
                    ? '#c084fc'
                    : level.comingSoon
                      ? 'rgba(255, 255, 255, 0.3)'
                      : '#fff',
                  fontFamily: '"Courier New", monospace',
                  textShadow: level.isBlackHole ? '0 0 10px #8b5cf6' : 'none'
                }}>
                  {level.isBlackHole ? '\u221E' : level.id}
                </span>

                {/* Lock icon or status */}
                {level.comingSoon && (
                  <span style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginTop: '4px',
                    fontFamily: '-apple-system, sans-serif'
                  }}>
                    SOON
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Level Info Panel */}
        {hoveredLevel && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '24px',
            textAlign: 'left',
            minHeight: '60px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: LEVELS[hoveredLevel - 1].isBlackHole ? '#c084fc' : '#60a5fa',
                fontFamily: '-apple-system, sans-serif'
              }}>
                Level {hoveredLevel}: {LEVELS[hoveredLevel - 1].name}
              </span>
              {LEVELS[hoveredLevel - 1].comingSoon && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  COMING SOON
                </span>
              )}
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: '-apple-system, sans-serif',
              lineHeight: 1.5
            }}>
              {LEVELS[hoveredLevel - 1].description}
            </p>
          </div>
        )}

        {/* Placeholder info when nothing hovered */}
        {!hoveredLevel && (
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '24px',
            textAlign: 'center',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: '-apple-system, sans-serif'
            }}>
              Hover over a level to see details. Level 10 (Black Hole) is unlocked!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              fontWeight: 500,
              padding: '12px 32px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            Back
          </button>

          <button
            onClick={() => onSelectLevel(10)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 600,
              padding: '12px 32px',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.2s',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
            }}
          >
            Enter Black Hole
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontStyle: 'normal',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          More levels coming soon! For now, dive into the full experience.
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
};

export default LevelSelectScreen;
