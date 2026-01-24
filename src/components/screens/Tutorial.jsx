import React, { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants.js';

const Tutorial = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const stepContent = {
    1: {
      title: "Welcome to WORM³",
      content: (
        <>
          <p><b>WORM³</b> is a Rubik's Cube puzzle exploring <b>antipodal topology</b> on the real projective plane.</p>
          <p>Each sticker has a <b>permanent antipodal twin</b> on the opposite side that flips with it through wormholes!</p>
          <p>Look for the <b>wiggling worms</b> on flipped stickers—they show disparity that needs fixing!</p>
          <p style={{ fontSize: '13px', marginTop: '12px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.7)' }}>
            This is a topological puzzle where manifold geometry meets classic cubing!
          </p>
        </>
      )
    },
    2: {
      title: "Basic Controls",
      content: (
        <>
          <p><b>Rotate Cube:</b> Drag anywhere to rotate freely in any direction (360° rotation!)</p>
          <p><b>Twist Slices:</b> Drag on a face to rotate rows, columns, or depth slices</p>
          <p><b>Face Twist:</b> Hold <b>Shift</b> while dragging to rotate the entire face clockwise/counter-clockwise</p>
          <p><b>On Mobile:</b> Simply tap and drag—full touch support with responsive UI!</p>
          <p style={{ fontSize: '13px', marginTop: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <b>Tip:</b> You can drag in any direction continuously without hitting rotation limits
          </p>
        </>
      )
    },
    3: {
      title: "Flipping Through Wormholes",
      content: (
        <>
          <p><b>Enable FLIP mode</b> (blue button at bottom), then tap/click any sticker to flip it!</p>
          <p>Watch the <b>colored tunnels</b> that connect antipodal pairs:</p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px' }}>
            <li><span style={{ color: COLORS.blue, fontWeight: 600 }}>Blue ↔ Green</span></li>
            <li><span style={{ color: COLORS.red, fontWeight: 600 }}>Red ↔ Orange</span></li>
            <li><span style={{ color: COLORS.yellow, fontWeight: 600 }}>Yellow ↔ White</span></li>
          </ul>
          <p>Tunnels get <b>thicker and brighter</b> with more flips, and occasionally spark with electricity!</p>
          <p><b>Worms appear</b> on stickers in disparity—flip them back to remove the worms!</p>
        </>
      )
    },
    4: {
      title: "Visual Modes",
      content: (
        <>
          <p>Press the <b>CLASSIC</b> button or press <b>V</b> to cycle through visual modes:</p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
            <li><b>Classic:</b> Traditional Rubik's Cube appearance with solid colors</li>
            <li><b>Grid:</b> Wireframe overlay showing the cube's structure</li>
            <li><b>Sudokube:</b> Latin square numbers (1-3 for 3×3) on each face</li>
            <li><b>Wireframe:</b> Skeletal view with enhanced lighting for topology visualization</li>
          </ul>
          <p style={{ fontSize: '13px', marginTop: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Each mode helps you see different aspects of the puzzle's topology!
          </p>
        </>
      )
    },
    5: {
      title: "Chaos Mode & Special Features",
      content: (
        <>
          <p><b>CHAOS Mode</b> (red button): Unstable flipped stickers randomly spread to N-S-E-W neighbors!</p>
          <ul style={{ margin: '6px 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7' }}>
            <li><b>Level 1:</b> Gentle chaos, good for learning</li>
            <li><b>Level 2:</b> Moderate spread rate</li>
            <li><b>Level 3:</b> Fast chaos propagation</li>
            <li><b>Level 4:</b> Extreme chaos—fight back quickly!</li>
          </ul>
          <p><b>EXPLODE:</b> Spread the cube apart to see internal structure and wormhole connections</p>
          <p><b>TUNNELS:</b> Toggle visibility of antipodal wormhole connections (press <b>T</b>)</p>
          <p><b>Cube Sizes:</b> Try 3×3, 4×4, or 5×5 cubes for different difficulty levels!</p>
        </>
      )
    },
    6: {
      title: "Stats & Parity System",
      content: (
        <>
          <p>Track your progress with the stats panel:</p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
            <li><b>Moves:</b> Total rotations and flips performed</li>
            <li><b>Flips:</b> Total number of wormhole traversals</li>
            <li><b>Pairs:</b> Active wormhole connections (stickers in disparity)</li>
            <li><b>Time:</b> Session timer showing minutes:seconds</li>
          </ul>
          <p><b>Parity Tracker (EVEN/ODD):</b> Shows whether total flips are even or odd</p>
          <ul style={{ margin: '6px 0', paddingLeft: '20px', fontSize: '13px' }}>
            <li><span style={{ color: '#06b6d4', fontWeight: 600 }}>EVEN</span>: Even number of flips (cyan)</li>
            <li><span style={{ color: '#8b5cf6', fontWeight: 600 }}>ODD</span>: Odd number of flips (purple)</li>
          </ul>
          <p style={{ fontSize: '13px', marginTop: '8px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.7)' }}>
            Parity affects solvability in certain configurations!
          </p>
        </>
      )
    },
    7: {
      title: "Keyboard Controls (Speedcubing)",
      content: (
        <>
          <p><b>Arrow Keys:</b> Move cursor across faces (wraps around edges!)</p>
          <p><b>Slice Rotations:</b></p>
          <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '13px' }}>
            <li><b>W/S:</b> Rotate column slice up/down</li>
            <li><b>A/D:</b> Rotate row slice left/right</li>
            <li><b>Q/E:</b> Rotate face counter-clockwise/clockwise</li>
          </ul>
          <p><b>F:</b> Flip sticker at cursor (when FLIP mode is enabled)</p>
          <p><b>Other Shortcuts:</b></p>
          <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '13px' }}>
            <li><b>H or ?</b> - Open help menu</li>
            <li><b>V</b> - Cycle visual modes</li>
            <li><b>C</b> - Toggle chaos mode</li>
            <li><b>X</b> - Toggle explode view</li>
            <li><b>T</b> - Toggle tunnels</li>
            <li><b>G</b> - Toggle flip mode</li>
            <li><b>Esc</b> - Close menus / hide cursor</li>
          </ul>
        </>
      )
    },
    8: {
      title: "Victory Conditions & Goals",
      content: (
        <>
          <p>Four different ways to win—each more challenging!</p>
          <p><b>Classic Victory:</b> Solve all faces to uniform colors (like traditional Rubik's)</p>
          <p><b>Sudokube Victory:</b> Create valid Latin squares on all faces—no repeated numbers in any row or column!</p>
          <p><b>Ultimate Victory:</b> Achieve BOTH Classic AND Sudokube victories simultaneously! The ultimate challenge.</p>
          <p><b>Secret WORM³ Victory:</b> Solve the cube where EVERY single sticker has traveled through a wormhole at least once!</p>
          <p style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <b>Pro Tip:</b> Use <b>SHUFFLE</b> to start a new game, <b>RESET</b> to return to solved state.
            Achievement badges appear at the top when you complete each victory type!
          </p>
          <p style={{ marginTop: '12px', fontStyle: 'italic', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
            Good luck, topologist! Press SHUFFLE to begin your journey.
          </p>
        </>
      )
    }
  };

  const currentStep = stepContent[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card" style={{ maxWidth: '620px' }}>
        <h2 style={{ marginBottom: '4px', color: 'rgba(255, 255, 255, 0.95)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{currentStep.title}</h2>
        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '16px', letterSpacing: '0.08em', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Step {step} of {totalSteps}
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.9)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          {currentStep.content}
        </div>
        <div className="tutorial-actions" style={{ marginTop: '20px' }}>
          <button className="bauhaus-btn" onClick={onClose}>Skip Tutorial</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {step > 1 && (
              <button className="bauhaus-btn" onClick={() => setStep(s => s - 1)}>
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button className="bauhaus-btn" onClick={() => setStep(s => s + 1)}>
                Next
              </button>
            ) : (
              <button className="bauhaus-btn" onClick={onClose} style={{
                background: 'rgba(16, 185, 129, 0.85)',
                borderColor: 'rgba(52, 211, 153, 0.5)',
                fontWeight: 700
              }}>
                Start Playing!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
