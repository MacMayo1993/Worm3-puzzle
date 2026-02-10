import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import IntroCubie from './IntroCubie.jsx';
import IntroTunnel from '../../manifold/IntroTunnel.jsx';
import WormParticle from '../../manifold/WormParticle.jsx';
import ArrivalBurst from '../../manifold/ArrivalBurst.jsx';
import { FACE_COLORS } from '../../utils/constants.js';
import { play, vibrate } from '../../utils/audio.js';
import { updateSharedTime } from '../../3d/TileStyleMaterials.jsx';

// ─── Tile style assignment for each cube face ─────────────────────────────────
// Six visually distinct living styles — one per face colour.
const FACE_STYLES = {
  PZ: 'lava',        // Front  — red    — molten drama
  NX: 'circuit',     // Left   — green  — techy PCB traces
  PY: 'holographic', // Top    — white  — rainbow iridescence
  NZ: 'galaxy',      // Back   — orange — deep-space starfield
  PX: 'neural',      // Right  — blue   — firing neuron web
  NY: 'pulse',       // Bottom — yellow — radial energy wave
};

// ─── Timing constants ─────────────────────────────────────────────────────────
// Phase 1  0 – 3.6 s  Four sharp 90° face-flips showcase the flip mechanic
// Phase 2  3.6 – 4 s  Cube at rest, all styles animated, camera orbiting close
// Phase 3  4 – 6 s    Explosion → tunnels appear (antipodality reveal)
// Phase 4  6 – 9 s    Tunnel groups highlighted in sequence, worms traverse
// Phase 5  9 – 10 s   Cube implodes, camera returns

// Four flips that cancel out so the cube is back at (0,0,0) by t=3.6
const FLIPS = [
  { start: 0.4, dur: 0.45, axis: 'y', delta:  Math.PI / 2 },  // +Y 90°
  { start: 1.3, dur: 0.45, axis: 'x', delta:  Math.PI / 2 },  // +X 90°
  { start: 2.2, dur: 0.45, axis: 'y', delta: -Math.PI / 2 },  // -Y 90°  → Y back to 0
  { start: 3.0, dur: 0.45, axis: 'x', delta: -Math.PI / 2 },  // -X 90°  → X back to 0
];

const EXPLOSION_START = 4;
const EXPLOSION_END   = 6;
const WORM_START      = 7;
const IMPLODE_START   = 9;
const IMPLODE_END     = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ease = t => t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;

const getStickerWorldPos = (x, y, z, dirKey, size, ef = 0) => {
  const k = (size - 1) / 2;
  const ex = (x - k) * (1 + ef * 1.8);
  const ey = (y - k) * (1 + ef * 1.8);
  const ez = (z - k) * (1 + ef * 1.8);
  const o = 0.51;
  if (dirKey === 'PZ') return [ex,      ey,      ez + o];
  if (dirKey === 'NZ') return [ex,      ey,      ez - o];
  if (dirKey === 'PX') return [ex + o,  ey,      ez    ];
  if (dirKey === 'NX') return [ex - o,  ey,      ez    ];
  if (dirKey === 'PY') return [ex,      ey + o,  ez    ];
  if (dirKey === 'NY') return [ex,      ey - o,  ez    ];
  return [ex, ey, ez];
};

// ─── Component ───────────────────────────────────────────────────────────────

const IntroScene = ({ time, onComplete: _onComplete }) => {
  const cubeGroupRef = useRef();
  const cubieRefs    = useRef([]);
  const { camera }   = useThree();
  const size = 3;

  const [wormComplete, setWormComplete] = useState({});
  const [showBurst,    setShowBurst]    = useState({});
  const [burstTimes,   setBurstTimes]   = useState({});

  // ── Explosion factor ────────────────────────────────────────────────────────
  let explosionFactor = 0;
  if (time >= EXPLOSION_START && time < EXPLOSION_END) {
    explosionFactor = ease((time - EXPLOSION_START) / (EXPLOSION_END - EXPLOSION_START)) * 1.5;
  } else if (time >= EXPLOSION_END && time < IMPLODE_START) {
    explosionFactor = 1.5;
  } else if (time >= IMPLODE_START && time < IMPLODE_END) {
    explosionFactor = (1 - ease((time - IMPLODE_START) / (IMPLODE_END - IMPLODE_START))) * 1.5;
  }

  // ── Camera + cube rotation ──────────────────────────────────────────────────
  useFrame(({ clock }) => {
    // Keep tile shaders animated during the intro
    updateSharedTime(clock.getElapsedTime());

    // ── Camera path ──
    let radius  = 12;
    let camY    = 4;
    let speed   = 0.18;

    if (time < 0.8) {
      // Swoop-in: start far above, pull down to close orbit
      const t    = time / 0.8;
      const e    = 1 - Math.pow(1 - t, 3);
      radius     = 20 - e * 9;   // 20 → 11
      camY       = 8  - e * 5;   // 8  → 3
      speed      = 0.10;
    } else if (time < EXPLOSION_START) {
      // Close, slightly elevated orbit — good angle to watch the flips
      radius     = 11;
      camY       = 3 + Math.sin((time - 0.8) * 1.1) * 1.8;
      speed      = 0.20;
    } else if (time < EXPLOSION_START + 1.5) {
      // Pull back as the cube explodes
      const t    = (time - EXPLOSION_START) / 1.5;
      const e    = ease(t);
      radius     = 11 + e * 11;  // 11 → 22
      camY       = 3  + e * 4;   // 3  → 7
      speed      = 0.14;
    } else if (time < IMPLODE_START) {
      // Wide orbit watching tunnels + worms
      radius     = 22;
      camY       = 7;
      speed      = 0.10;
    } else if (time < IMPLODE_END) {
      // Glide back in as cube reassembles
      const t    = (time - IMPLODE_START) / (IMPLODE_END - IMPLODE_START);
      const e    = ease(t);
      radius     = 22 - e * 10;  // 22 → 12
      camY       = 7  - e * 3;   // 7  → 4
      speed      = 0.16;
    } else {
      radius     = 12;
      camY       = 4;
      speed      = 0.18;
    }

    const angle        = time * speed;
    camera.position.x  = Math.sin(angle) * radius;
    camera.position.z  = Math.cos(angle) * radius;
    camera.position.y  = camY;
    camera.lookAt(0, 0, 0);

    // ── Cube group rotation (flip animations) ──
    if (!cubeGroupRef.current) return;
    // Accumulate completed + in-progress flip rotations
    let rx = 0, ry = 0;
    FLIPS.forEach(flip => {
      const elapsed = time - flip.start;
      if (elapsed <= 0) return;
      const progress = elapsed >= flip.dur ? 1 : ease(elapsed / flip.dur);
      if (flip.axis === 'y') ry += flip.delta * progress;
      if (flip.axis === 'x') rx += flip.delta * progress;
    });
    // After explosion starts (t≥4), all flips have completed and sum to 0
    cubeGroupRef.current.rotation.x = rx;
    cubeGroupRef.current.rotation.y = ry;
  });

  // ── Cubies layout ───────────────────────────────────────────────────────────
  const items = useMemo(() => {
    const k = (size - 1) / 2;
    const arr = [];
    let i = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          arr.push({ key: i++, pos: [x - k, y - k, z - k] });
        }
      }
    }
    return arr;
  }, [size]);

  // ── Tunnels ─────────────────────────────────────────────────────────────────
  const tunnels = useMemo(() => {
    const pairs = [];
    for (let x = 0; x < size; x++)
      for (let y = 0; y < size; y++)
        pairs.push({ id: `z-${x}-${y}`, group: 0,
          start: getStickerWorldPos(x, y, size-1, 'PZ', size, explosionFactor),
          end:   getStickerWorldPos(x, y, 0,      'NZ', size, explosionFactor),
          color1: FACE_COLORS[1], color2: FACE_COLORS[4] });
    for (let y = 0; y < size; y++)
      for (let z = 0; z < size; z++)
        pairs.push({ id: `x-${y}-${z}`, group: 1,
          start: getStickerWorldPos(size-1, y, z, 'PX', size, explosionFactor),
          end:   getStickerWorldPos(0,      y, z, 'NX', size, explosionFactor),
          color1: FACE_COLORS[5], color2: FACE_COLORS[2] });
    for (let x = 0; x < size; x++)
      for (let z = 0; z < size; z++)
        pairs.push({ id: `y-${x}-${z}`, group: 2,
          start: getStickerWorldPos(x, size-1, z, 'PY', size, explosionFactor),
          end:   getStickerWorldPos(x, 0,      z, 'NY', size, explosionFactor),
          color1: FACE_COLORS[3], color2: FACE_COLORS[6] });
    return pairs;
  }, [explosionFactor, size]);

  const tunnelOpacity = useMemo(() => {
    if (time < EXPLOSION_START)             return 0;
    if (time < EXPLOSION_START + 0.5)       return (time - EXPLOSION_START) / 0.5;
    if (time >= IMPLODE_START)              return 1 - (time - IMPLODE_START) / (IMPLODE_END - IMPLODE_START) * 0.7;
    return 1;
  }, [time]);

  // Highlight one axis group at a time during the worm phase
  const highlightedGroup = useMemo(() => {
    if (time >= 6.5 && time < 7.5) return 0;
    if (time >= 7.5 && time < 8.5) return 1;
    if (time >= 8.5 && time < 9.5) return 2;
    return -1;
  }, [time]);

  // ── Worm paths ──────────────────────────────────────────────────────────────
  const wormPaths = useMemo(() => {
    const paths = [];
    for (let x = 0; x < size; x++)
      for (let y = 0; y < size; y++)
        paths.push({
          id:     `${x}-${y}`,
          start:  getStickerWorldPos(x, y, size-1, 'PZ', size, explosionFactor),
          end:    getStickerWorldPos(x, y, 0,      'NZ', size, explosionFactor),
          color1: FACE_COLORS[1],
          color2: FACE_COLORS[4],
        });
    return paths;
  }, [explosionFactor]);

  const handleWormComplete = (id) => {
    if (wormComplete[id]) return;
    setWormComplete(prev => ({ ...prev, [id]: true }));
    setShowBurst(prev   => ({ ...prev, [id]: true }));
    setBurstTimes(prev  => ({ ...prev, [id]: time }));
    if (id === '1-1') { play('/sounds/flip.mp3'); vibrate(20); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <group>
      {/* Cube group — rotation applied here, tunnels/worms are in world space */}
      <group ref={cubeGroupRef}>
        {items.map((it, idx) => {
          const ef = explosionFactor;
          const explodedPos = [
            it.pos[0] * (1 + ef * 1.8),
            it.pos[1] * (1 + ef * 1.8),
            it.pos[2] * (1 + ef * 1.8),
          ];
          return (
            <IntroCubie
              key={it.key}
              ref={el => (cubieRefs.current[idx] = el)}
              position={explodedPos}
              size={size}
              explosionFactor={ef}
              faceStyles={FACE_STYLES}
            />
          );
        })}
      </group>

      {/* Antipodal tunnel connections */}
      {time >= EXPLOSION_START && tunnels.map(t => (
        <IntroTunnel
          key={t.id}
          start={t.start}
          end={t.end}
          color1={t.color1}
          color2={t.color2}
          opacity={tunnelOpacity * (highlightedGroup === t.group ? 1.0
                                 : highlightedGroup >= 0        ? 0.22
                                 : 0.75)}
          groupId={t.group}
        />
      ))}

      {/* Worms traversing antipodal tunnels */}
      {time >= WORM_START && wormPaths.map(path => (
        !wormComplete[path.id] && (
          <WormParticle
            key={path.id}
            start={path.start}
            end={path.end}
            color1={path.color1}
            color2={path.color2}
            startTime={WORM_START}
            currentTime={time}
            onComplete={() => handleWormComplete(path.id)}
          />
        )
      ))}

      {/* Arrival bursts when worms exit */}
      {wormPaths.map(path => {
        const bt = burstTimes[path.id];
        return (showBurst[path.id] && bt && time < bt + 0.5) ? (
          <ArrivalBurst
            key={`burst-${path.id}`}
            position={path.end}
            color={path.color2}
            startTime={bt}
            currentTime={time}
          />
        ) : null;
      })}
    </group>
  );
};

export default IntroScene;
