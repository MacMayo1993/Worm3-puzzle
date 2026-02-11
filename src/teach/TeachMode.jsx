// src/teach/TeachMode.jsx
// Teach Mode UI — step-by-step algorithm teaching panel

import React, { useState } from 'react';

const TeachMode = ({
  analysis,
  stages,
  methodName,
  selectedAlgo,
  algoMoves,
  currentStep,
  isPlaying,
  canExecute,
  isAlgoComplete,
  onSelectAlgorithm,
  onExecuteStep,
  onToggleAutoPlay,
  onResetAlgorithm,
  onClose,
}) => {
  const [expandedStage, setExpandedStage] = useState(null);

  if (!analysis) return null;

  const currentStage = stages[analysis.stageIndex] || null;
  const isSolved = analysis.stageId === 'solved';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '340px',
      maxWidth: 'calc(100vw - 20px)',
      height: '100%',
      maxHeight: '100dvh',
      background: 'rgba(10, 12, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(0, 217, 255, 0.2)',
      zIndex: 600,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00d9ff' }}>TEACH MODE</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            {methodName}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Progress Overview */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
          SOLVE PROGRESS
        </div>
        <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
          {stages.map((stage, i) => (
            <div
              key={stage.id}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: i < analysis.stageIndex
                  ? '#00ff88'
                  : i === analysis.stageIndex
                    ? 'linear-gradient(90deg, #00d9ff, rgba(0, 217, 255, 0.3))'
                    : 'rgba(255, 255, 255, 0.1)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        {isSolved ? (
          <div style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '14px' }}>
            Cube is solved!
          </div>
        ) : (
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#00d9ff' }}>{currentStage?.name}</span>
            {analysis.progress.stepProgress && (
              <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>
                ({analysis.progress.stepProgress} pieces)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {/* Current Stage Guidance */}
        {currentStage && !isSolved && (
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              {currentStage.goal}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
              {currentStage.explanation}
            </div>

            {/* Tips */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '10px', color: '#00d9ff', fontWeight: 'bold', marginBottom: '4px' }}>
                TIPS:
              </div>
              {currentStage.tips.map((tip, i) => (
                <div key={i} style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '2px 0 2px 12px',
                  position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: 'rgba(0, 217, 255, 0.5)' }}>·</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Algorithm Cards for Current Stage */}
        {currentStage && !isSolved && (
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              ALGORITHMS FOR THIS STEP
            </div>
            {currentStage.algorithms.map((algo, algoIdx) => {
              const isSelected = selectedAlgo?.stageIndex === analysis.stageIndex && selectedAlgo?.algoIndex === algoIdx;
              return (
                <AlgorithmCard
                  key={algoIdx}
                  algo={algo}
                  isSelected={isSelected}
                  onSelect={() => onSelectAlgorithm(analysis.stageIndex, algoIdx)}
                  algoMoves={isSelected ? algoMoves : []}
                  currentStep={isSelected ? currentStep : 0}
                  isPlaying={isSelected ? isPlaying : false}
                  canExecute={isSelected ? canExecute : false}
                  isAlgoComplete={isSelected ? isAlgoComplete : false}
                  onExecuteStep={onExecuteStep}
                  onToggleAutoPlay={onToggleAutoPlay}
                  onResetAlgorithm={onResetAlgorithm}
                />
              );
            })}
          </div>
        )}

        {/* All Stages Reference */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
            ALL STAGES
          </div>
          {stages.map((stage, i) => {
            const isDone = i < analysis.stageIndex;
            const isCurrent = i === analysis.stageIndex;
            const isExpanded = expandedStage === i;

            return (
              <div key={stage.id} style={{ marginBottom: '4px' }}>
                <div
                  onClick={() => setExpandedStage(isExpanded ? null : i)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isCurrent
                      ? 'rgba(0, 217, 255, 0.1)'
                      : isDone
                        ? 'rgba(0, 255, 136, 0.05)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isCurrent ? 'rgba(0, 217, 255, 0.3)' : isDone ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isDone ? '#00ff88' : isCurrent ? '#00d9ff' : 'rgba(255,255,255,0.1)',
                    color: isDone || isCurrent ? '#000' : 'rgba(255,255,255,0.3)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isDone ? '✓' : i + 1}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: isDone ? '#00ff88' : isCurrent ? '#00d9ff' : 'rgba(255,255,255,0.4)',
                    flex: 1,
                  }}>
                    {stage.name}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.3)',
                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}>
                    ▼
                  </span>
                </div>

                {/* Expanded stage details */}
                {isExpanded && (
                  <div style={{
                    padding: '8px 10px 8px 36px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: '1.4',
                  }}>
                    <div style={{ marginBottom: '6px' }}>{stage.goal}</div>
                    {stage.algorithms.map((algo, j) => (
                      <div key={j} style={{
                        padding: '4px 8px',
                        margin: '4px 0',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '4px',
                        borderLeft: '2px solid rgba(0, 217, 255, 0.3)',
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#00d9ff', fontSize: '10px' }}>
                          {algo.name}
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#fbbf24',
                          margin: '2px 0',
                        }}>
                          {algo.notation}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                          {algo.when}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Algorithm Card sub-component
// ---------------------------------------------------------------------------
const AlgorithmCard = ({
  algo,
  isSelected,
  onSelect,
  algoMoves,
  currentStep,
  isPlaying,
  canExecute,
  isAlgoComplete,
  onExecuteStep,
  onToggleAutoPlay,
  onResetAlgorithm,
}) => {
  return (
    <div style={{
      marginBottom: '10px',
      borderRadius: '8px',
      border: `1px solid ${isSelected ? 'rgba(0, 217, 255, 0.4)' : 'rgba(255,255,255,0.1)'}`,
      background: isSelected ? 'rgba(0, 217, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        onClick={onSelect}
        style={{
          padding: '10px 12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
          {algo.name}
        </div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#fbbf24',
          margin: '4px 0',
          letterSpacing: '1px',
        }}>
          {algo.notation}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
          {algo.when}
        </div>
      </div>

      {/* Execution controls (only when selected) */}
      {isSelected && algoMoves.length > 0 && (
        <div style={{
          padding: '8px 12px 12px',
          borderTop: '1px solid rgba(0, 217, 255, 0.15)',
        }}>
          {/* Move sequence visualization */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '10px',
          }}>
            {algoMoves.map((move, i) => (
              <span
                key={i}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  background: i < currentStep
                    ? 'rgba(0, 255, 136, 0.2)'
                    : i === currentStep
                      ? 'rgba(0, 217, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: i < currentStep
                    ? '#00ff88'
                    : i === currentStep
                      ? '#00d9ff'
                      : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${
                    i < currentStep
                      ? 'rgba(0, 255, 136, 0.3)'
                      : i === currentStep
                        ? 'rgba(0, 217, 255, 0.5)'
                        : 'rgba(255,255,255,0.08)'
                  }`,
                }}
              >
                {move.notation}
              </span>
            ))}
          </div>

          {/* Progress indicator */}
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '8px',
          }}>
            {isAlgoComplete
              ? 'Algorithm complete — tap Reset to try again'
              : `Move ${currentStep + 1} of ${algoMoves.length}`
            }
          </div>

          {/* Control buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Step button */}
            <button
              onClick={onExecuteStep}
              disabled={!canExecute}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 217, 255, 0.4)',
                background: canExecute ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                color: canExecute ? '#00d9ff' : 'rgba(255,255,255,0.2)',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: "'Courier New', monospace",
                cursor: canExecute ? 'pointer' : 'default',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              STEP ▶
            </button>

            {/* Auto-play button */}
            <button
              onClick={onToggleAutoPlay}
              disabled={isAlgoComplete && !isPlaying}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${isPlaying ? 'rgba(255, 165, 0, 0.5)' : 'rgba(0, 255, 136, 0.4)'}`,
                background: isPlaying ? 'rgba(255, 165, 0, 0.2)' : 'rgba(0, 255, 136, 0.15)',
                color: isPlaying ? '#ffa500' : '#00ff88',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: "'Courier New', monospace",
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isPlaying ? '⏸' : '▶▶'}
            </button>

            {/* Reset button */}
            <button
              onClick={onResetAlgorithm}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: "'Courier New', monospace",
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachMode;
