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
// These will cycle through different styles during the animation
const STYLE_SEQUENCE = ['lava', 'circuit', 'holographic', 'galaxy', 'neural', 'pulse'];

const INITIAL_FACE_STYLES = {
  PZ: 'lava',        // Front  — red    — molten drama
  NX: 'circuit',     // Left   — green  — techy PCB traces
  PY: 'holographic', // Top    — white  — rainbow iridescence
  NZ: 'galaxy',      // Back   — orange — deep-space starfield
  PX: 'neural',      // Right  — blue   — firing neuron web
  NY: 'pulse',       // Bottom — yellow — radial energy wave
};

// ─── Timing constants ─────────────────────────────────────────────────────────
// Phase 1  0 – 4.5 s  Layer rotations (famous Rubik's algorithms) + tile flips
// Phase 2  4.5 – 5 s  Cube stabilizes, tunnels start forming
// Phase 3  5 – 7 s    Explosion → antipodal topology transformation
// Phase 4  7 – 9 s    Tunnel groups highlighted in sequence, worms traverse
// Phase 5  9 – 10 s   Cube implodes, camera returns

// Layer rotations — famous Rubik's cube algorithms
// Each targets specific cubies based on their position
const LAYER_ROTATIONS = [
  // R move (right face clockwise)
  { start: 0.3, dur: 0.4, layer: 'x', value: 1, angle: Math.PI / 2 },
  // U move (top face clockwise)
  { start: 0.9, dur: 0.4, layer: 'y', value: 1, angle: Math.PI / 2 },
  // F move (front face clockwise)
  { start: 1.5, dur: 0.4, layer: 'z', value: 1, angle: Math.PI / 2 },
  // R' (right face counter-clockwise)
  { start: 2.1, dur: 0.4, layer: 'x', value: 1, angle: -Math.PI / 2 },
  // U' (top face counter-clockwise)
  { start: 2.7, dur: 0.4, layer: 'y', value: 1, angle: -Math.PI / 2 },
  // F' (front face counter-clockwise)
  { start: 3.3, dur: 0.4, layer: 'z', value: 1, angle: -Math.PI / 2 },
  // Sexy move: R U R' U'
  { start: 3.9, dur: 0.25, layer: 'x', value: 1, angle: Math.PI / 2 },
  { start: 4.2, dur: 0.25, layer: 'y', value: 1, angle: Math.PI / 2 },
];

const TUNNEL_FORM_START = 4.5;
const EXPLOSION_START   = 5;
const EXPLOSION_END     = 7;
const WORM_START        = 7.5;
const IMPLODE_START     = 9;
const IMPLODE_END       = 10;

// Individual tile flipping — random stickers flip throughout phase 1
const getTileFlips = () => {
  const flips = [];
  const numFlips = 18; // Random tiles flip
  for (let i = 0; i < numFlips; i++) {
    flips.push({
      start: 0.5 + Math.random() * 3.5,
      dur: 0.3 + Math.random() * 0.2,
      x: Math.floor(Math.random() * 3),
      y: Math.floor(Math.random() * 3),
      z: Math.floor(Math.random() * 3),
      face: ['PZ', 'NZ', 'PX', 'NX', 'PY', 'NY'][Math.floor(Math.random() * 6)],
    });
  }
  return flips;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ease = t => t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Calculate rotation for a specific cubie based on active layer rotations
const getCubieLayerRotation = (x, y, z, time, size) => {
  const k = (size - 1) / 2;
  const cubeX = x - k;
  const cubeY = y - k;
  const cubeZ = z - k;

  let rotX = 0, rotY = 0, rotZ = 0;

  LAYER_ROTATIONS.forEach(rot => {
    const elapsed = time - rot.start;
    if (elapsed <= 0 || elapsed > rot.dur) return;

    const progress = ease(elapsed / rot.dur);
    const angle = rot.angle * progress;

    // Check if this cubie is in the rotating layer
    let inLayer = false;
    if (rot.layer === 'x' && Math.abs(cubeX - rot.value) < 0.1) inLayer = true;
    if (rot.layer === 'y' && Math.abs(cubeY - rot.value) < 0.1) inLayer = true;
    if (rot.layer === 'z' && Math.abs(cubeZ - rot.value) < 0.1) inLayer = true;

    if (inLayer) {
      if (rot.layer === 'x') rotX += angle;
      if (rot.layer === 'y') rotY += angle;
      if (rot.layer === 'z') rotZ += angle;
    }
  });

  return { rotX, rotY, rotZ };
};

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

  // Generate tile flips once
  const tileFlips = useMemo(() => getTileFlips(), []);

  // Dynamic style cycling - styles rotate through the sequence
  const faceStyles = useMemo(() => {
    const cycleSpeed = 0.5; // Complete cycle every 2 seconds
    const cycleIndex = Math.floor(time * cycleSpeed) % STYLE_SEQUENCE.length;

    return {
      PZ: STYLE_SEQUENCE[(cycleIndex + 0) % STYLE_SEQUENCE.length],
      NX: STYLE_SEQUENCE[(cycleIndex + 1) % STYLE_SEQUENCE.length],
      PY: STYLE_SEQUENCE[(cycleIndex + 2) % STYLE_SEQUENCE.length],
      NZ: STYLE_SEQUENCE[(cycleIndex + 3) % STYLE_SEQUENCE.length],
      PX: STYLE_SEQUENCE[(cycleIndex + 4) % STYLE_SEQUENCE.length],
      NY: STYLE_SEQUENCE[(cycleIndex + 5) % STYLE_SEQUENCE.length],
    };
  }, [time]);

  // ── Explosion factor + topological twist ────────────────────────────────────
  let explosionFactor = 0;
  let antipodalTwist = 0; // Twist factor for antipodal pairs

  if (time >= EXPLOSION_START && time < EXPLOSION_END) {
    const t = (time - EXPLOSION_START) / (EXPLOSION_END - EXPLOSION_START);
    explosionFactor = ease(t) * 1.5;
    // During explosion, antipodal pairs twist through each other
    antipodalTwist = Math.sin(t * Math.PI) * Math.PI; // 0 → π → 0
  } else if (time >= EXPLOSION_END && time < IMPLODE_START) {
    explosionFactor = 1.5;
    antipodalTwist = 0;
  } else if (time >= IMPLODE_START && time < IMPLODE_END) {
    const t = (time - IMPLODE_START) / (IMPLODE_END - IMPLODE_START);
    explosionFactor = (1 - ease(t)) * 1.5;
    antipodalTwist = 0;
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

    // ── Cube group stays at identity — individual cubies rotate via layers ──
    if (cubeGroupRef.current) {
      cubeGroupRef.current.rotation.set(0, 0, 0);
    }
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

  // Tunnel formation animation - they grow from both endpoints
  const tunnelFormation = useMemo(() => {
    if (time < TUNNEL_FORM_START) return 0;
    if (time < EXPLOSION_START) {
      return ease((time - TUNNEL_FORM_START) / (EXPLOSION_START - TUNNEL_FORM_START));
    }
    return 1;
  }, [time]);

  const tunnelOpacity = useMemo(() => {
    if (time < TUNNEL_FORM_START)           return 0;
    if (time < EXPLOSION_START)             return (time - TUNNEL_FORM_START) / (EXPLOSION_START - TUNNEL_FORM_START) * 0.7;
    if (time < EXPLOSION_START + 0.5)       return 0.7 + (time - EXPLOSION_START) / 0.5 * 0.3;
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
      {/* Cube group — individual cubies rotate via layers */}
      <group ref={cubeGroupRef}>
        {items.map((it, idx) => {
          const k = (size - 1) / 2;
          const x = it.pos[0] + k;
          const y = it.pos[1] + k;
          const z = it.pos[2] + k;

          // Layer rotation for this cubie
          const layerRot = getCubieLayerRotation(x, y, z, time, size);

          // Antipodal topology transformation during explosion
          let topoPos = [...it.pos];
          let topoRot = 0;

          if (antipodalTwist > 0) {
            // Calculate antipodal pair (opposite corner)
            const antipodal = [-it.pos[0], -it.pos[1], -it.pos[2]];
            const dist = Math.sqrt(
              it.pos[0] ** 2 + it.pos[1] ** 2 + it.pos[2] ** 2
            );

            // Twist toward antipodal position based on distance from center
            const twistFactor = antipodalTwist * (dist / (k * Math.sqrt(3)));

            topoPos = [
              it.pos[0] * Math.cos(twistFactor) - antipodal[0] * Math.sin(twistFactor) * 0.3,
              it.pos[1] * Math.cos(twistFactor) - antipodal[1] * Math.sin(twistFactor) * 0.3,
              it.pos[2] * Math.cos(twistFactor) - antipodal[2] * Math.sin(twistFactor) * 0.3,
            ];

            // Add helical rotation
            topoRot = twistFactor * 2;
          }

          const ef = explosionFactor;
          const explodedPos = [
            topoPos[0] * (1 + ef * 1.8),
            topoPos[1] * (1 + ef * 1.8),
            topoPos[2] * (1 + ef * 1.8),
          ];

          // Calculate individual tile flips for this cubie
          const cubieFlips = {};
          tileFlips.forEach(flip => {
            if (flip.x === x && flip.y === y && flip.z === z) {
              const elapsed = time - flip.start;
              if (elapsed > 0 && elapsed < flip.dur) {
                const progress = ease(elapsed / flip.dur);
                cubieFlips[flip.face] = progress * Math.PI * 2; // Full 360° flip
              }
            }
          });

          return (
            <group
              key={it.key}
              position={explodedPos}
              rotation={[layerRot.rotX + topoRot, layerRot.rotY + topoRot, layerRot.rotZ + topoRot]}
            >
              <IntroCubie
                ref={el => (cubieRefs.current[idx] = el)}
                position={[0, 0, 0]}
                size={size}
                explosionFactor={ef}
                faceStyles={faceStyles}
                cubieFlips={cubieFlips}
                time={time}
              />
            </group>
          );
        })}
      </group>

      {/* Antipodal tunnel connections */}
      {time >= TUNNEL_FORM_START && tunnels.map(t => (
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
          formation={tunnelFormation}
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
