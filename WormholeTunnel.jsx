import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FACE_COLORS } from '../utils/constants.js';
import { getStickerWorldPosFromMesh } from '../game/coordinates.js';
import { calculateSmartControlPoint } from '../utils/smartRouting.js';

// Cached vectors for reuse across all tunnel instances - avoids GC pressure
const _vStart = new THREE.Vector3();
const _vEnd = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();
const _trueUp = new THREE.Vector3();
const _offsetVec = new THREE.Vector3();
const _controlPoint = new THREE.Vector3();

// Cached control-point values for the two sides (avoids re-calling smartRouting per strand)
let _cpPosX = 0, _cpPosY = 0, _cpPosZ = 0;
let _cpNegX = 0, _cpNegY = 0, _cpNegZ = 0;

// Max strands per tunnel - balances visual richness vs per-frame cost
const MAX_STRANDS = 8;

const WormholeTunnel = ({ meshIdx1, meshIdx2, dirKey1, dirKey2, cubieRefs, intensity, flips, color1, color2, size }) => {
  const linesRef = useRef([]);
  const pulseT = useRef(Math.random() * Math.PI * 2);
  // Cache control-point vectors for the bezier (reuse, never recreate)
  const v0Ref = useRef(new THREE.Vector3());
  const v2Ref = useRef(new THREE.Vector3());

  const strandConfig = useMemo(() => {
    const count = Math.min(Math.max(1, flips), MAX_STRANDS);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 4;
      const radiusFactor = Math.sqrt(i / count);
      const side = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        angle,
        side,
        radius: (0.1 + radiusFactor * 0.25) * 1.25,
        baseOpacity: flips > 0 ? (0.4 + (1 - radiusFactor) * 0.6) : (0.2 + (1 - radiusFactor) * 0.4),
        lineWidth: Math.max(0.375, (1.5 - radiusFactor * 1.2) * 1.25),
        colors: new Float32Array(30 * 3),
        sparkOffset: Math.random() * Math.PI * 2
      };
    });
  }, [flips]);

  useMemo(() => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const tempColor = new THREE.Color();

    strandConfig.forEach(strand => {
      for (let j = 0; j < 30; j++) {
        const t = j / 29;
        tempColor.lerpColors(c1, c2, t);
        strand.colors[j * 3] = tempColor.r;
        strand.colors[j * 3 + 1] = tempColor.g;
        strand.colors[j * 3 + 2] = tempColor.b;
      }
    });
  }, [color1, color2, strandConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      linesRef.current.forEach(line => {
        if (line?.geometry) line.geometry.dispose();
        if (line?.material) line.material.dispose();
      });
    };
  }, []);

  useFrame((state, delta) => {
    const mesh1 = cubieRefs[meshIdx1];
    const mesh2 = cubieRefs[meshIdx2];
    if (!mesh1 || !mesh2) return;

    const pos1 = getStickerWorldPosFromMesh(mesh1, dirKey1);
    const pos2 = getStickerWorldPosFromMesh(mesh2, dirKey2);
    if (!pos1 || !pos2) return;

    // Reuse cached vectors instead of creating new ones
    _vStart.set(pos1[0], pos1[1], pos1[2]);
    _vEnd.set(pos2[0], pos2[1], pos2[2]);
    v0Ref.current.copy(_vStart);
    v2Ref.current.copy(_vEnd);

    pulseT.current += delta * (2 + intensity * 0.5);
    const pulse = Math.sin(pulseT.current) * 0.1 + 0.9;

    // --- Hoist per-tunnel calculations OUTSIDE the strand loop ---
    _dir.subVectors(_vEnd, _vStart).normalize();
    if (Math.abs(_dir.y) > 0.99) {
      _up.set(0, 0, 1);
    } else {
      _up.set(0, 1, 0);
    }
    _right.crossVectors(_dir, _up).normalize();
    _trueUp.crossVectors(_right, _dir).normalize();

    // Compute smart control points for both sides ONCE
    const cpPos = calculateSmartControlPoint(pos1, pos2, size, 1);
    _cpPosX = cpPos.x; _cpPosY = cpPos.y; _cpPosZ = cpPos.z;
    const cpNeg = calculateSmartControlPoint(pos1, pos2, size, -1);
    _cpNegX = cpNeg.x; _cpNegY = cpNeg.y; _cpNegZ = cpNeg.z;

    const v0x = _vStart.x, v0y = _vStart.y, v0z = _vStart.z;
    const v2x = _vEnd.x, v2y = _vEnd.y, v2z = _vEnd.z;

    linesRef.current.forEach((line, i) => {
      if (!line) return;
      const config = strandConfig[i];

      if (line.material) {
        const sparkPulse = Math.sin(pulseT.current * 3 + config.sparkOffset);
        const spark = sparkPulse > 0.9 ? (sparkPulse - 0.9) * 10 : 0;
        line.material.opacity = config.baseOpacity * pulse * (1 + spark * 0.5);
      }

      // Pick pre-computed control point based on side
      if (config.side === 1) {
        _controlPoint.set(_cpPosX, _cpPosY, _cpPosZ);
      } else {
        _controlPoint.set(_cpNegX, _cpNegY, _cpNegZ);
      }

      // Add per-strand offset using pre-computed direction basis
      const offsetX = Math.cos(config.angle) * config.radius;
      const offsetY = Math.sin(config.angle) * config.radius;
      _controlPoint.addScaledVector(_right, offsetX);
      _controlPoint.addScaledVector(_trueUp, offsetY);

      const v1x = _controlPoint.x, v1y = _controlPoint.y, v1z = _controlPoint.z;

      // Inline quadratic bezier evaluation directly into the position buffer.
      // Avoids getPoints() which allocates 30 new Vector3 objects per call.
      const positions = line.geometry.attributes.position.array;
      for (let j = 0; j < 30; j++) {
        const t = j / 29;
        const t1 = 1 - t;
        const a = t1 * t1;
        const b = 2 * t1 * t;
        const c = t * t;
        const idx = j * 3;
        positions[idx]     = a * v0x + b * v1x + c * v2x;
        positions[idx + 1] = a * v0y + b * v1y + c * v2y;
        positions[idx + 2] = a * v0z + b * v1z + c * v2z;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });
  });

  return (
    <group>
      {strandConfig.map((strand, i) => (
        <line key={strand.id} ref={el => linesRef.current[i] = el}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={30}
              array={new Float32Array(30 * 3)}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={30}
              array={strand.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={strand.baseOpacity}
            linewidth={strand.lineWidth}
          />
        </line>
      ))}
    </group>
  );
};

export default WormholeTunnel;
