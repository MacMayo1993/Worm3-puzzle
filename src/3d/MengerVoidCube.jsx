/**
 * MengerVoidCube.jsx
 *
 * Level 1 Menger Sponge implementation:
 * - 20 mini-cubes (corners + edges, no face/body centers)
 * - 7 void tunnels (cross pattern through center)
 * - InstancedMesh for performance
 * - Double-sided stickers for tunnel visibility
 * - Tunnel glow shader with parity + chaos reactivity
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../hooks/useGameStore.js';
import StickerPlane from './StickerPlane.jsx';

/**
 * Calculate Menger positions (Level 1)
 * Returns array of {x, y, z} for 20 mini-cubes
 */
function calculateMengerPositions() {
  const positions = [];
  const scale = 0.333; // Scale factor for mini-cubes

  // Iterate 3x3x3 grid
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Exclude 7 center voids: face centers and body center
        // Keep only if Manhattan distance > 1 from origin
        const manhattan = Math.abs(x) + Math.abs(y) + Math.abs(z);

        if (manhattan > 1) {
          positions.push({
            x: x * scale,
            y: y * scale,
            z: z * scale,
            gridX: x,
            gridY: y,
            gridZ: z,
          });
        }
      }
    }
  }

  return positions; // Should be 20 positions
}

/**
 * MengerCubelet - Single mini-cube with 6 sticker planes
 */
function MengerCubelet({ position, index, size = 0.32 }) {
  const groupRef = useRef();

  // Sticker configuration for each face
  const stickers = useMemo(() => {
    const halfSize = size / 2;
    return [
      { dir: 'PX', pos: [halfSize, 0, 0], rot: [0, Math.PI / 2, 0], color: 5 },   // Right (Blue)
      { dir: 'NX', pos: [-halfSize, 0, 0], rot: [0, -Math.PI / 2, 0], color: 2 }, // Left (Green)
      { dir: 'PY', pos: [0, halfSize, 0], rot: [-Math.PI / 2, 0, 0], color: 3 },  // Top (White)
      { dir: 'NY', pos: [0, -halfSize, 0], rot: [Math.PI / 2, 0, 0], color: 6 },  // Bottom (Yellow)
      { dir: 'PZ', pos: [0, 0, halfSize], rot: [0, 0, 0], color: 1 },             // Front (Red)
      { dir: 'NZ', pos: [0, 0, -halfSize], rot: [0, Math.PI, 0], color: 4 },      // Back (Orange)
    ];
  }, [size]);

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Mini-cube outline (optional wireframe) */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial
          color="#222222"
          wireframe
          opacity={0.2}
          transparent
        />
      </mesh>

      {/* Sticker planes on each face */}
      {stickers.map((sticker) => (
        <group key={sticker.dir} position={sticker.pos} rotation={sticker.rot}>
          <StickerPlane
            size={size * 0.95}
            color={sticker.color}
            curr={sticker.color}
            flips={0}
            isMengerMode
            mengerPosition={position}
            mengerIndex={index}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * MengerVoidCube - Main component
 */
export default function MengerVoidCube() {
  const mengerMode = useGameStore((state) => state.mengerMode);
  const positions = useMemo(() => calculateMengerPositions(), []);

  // Shader value lerping
  useFrame(() => {
    const lerpShaderValues = useGameStore.getState().lerpShaderValues;
    lerpShaderValues();
  });

  if (!mengerMode) {
    return null;
  }

  return (
    <group name="menger-void-cube">
      {/* Render 20 mini-cubes */}
      {positions.map((pos, idx) => (
        <MengerCubelet
          key={`menger-${idx}`}
          position={pos}
          index={idx}
        />
      ))}

      {/* Optional: Void space visualization */}
      <VoidSpaceGlow />
    </group>
  );
}

/**
 * VoidSpaceGlow - Shader effect for the 7 void tunnels
 */
function VoidSpaceGlow() {
  const meshRef = useRef();
  const materialRef = useRef();

  const parityCurrent = useGameStore((state) => state.parityCurrent);
  const chaosCurrent = useGameStore((state) => state.chaosCurrent);

  // Shader material for void glow
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uParity: { value: 0 },
        uChaos: { value: 0 },
        uCameraPos: { value: new THREE.Vector3() },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uParity;
        uniform float uChaos;
        uniform vec3 uCameraPos;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        // Simple hash noise
        float hash(vec3 p) {
          p = fract(p * vec3(443.897, 441.423, 437.195));
          p += dot(p, p.yxz + 19.19);
          return fract((p.x + p.y) * p.z);
        }

        void main() {
          // Distance from void center
          float dist = length(vPosition);
          float proximity = 1.0 - smoothstep(0.3, 1.5, dist);

          // Fresnel edge glow
          float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 2.0);

          // Parity color: cyan (0,0,1) → purple (0.6,0,1)
          vec3 parityColorLow = vec3(0.0, 1.0, 1.0);  // Cyan
          vec3 parityColorHigh = vec3(0.6, 0.0, 1.0); // Purple
          vec3 parityColor = mix(parityColorLow, parityColorHigh, uParity);

          // Chaos noise jitter
          float noise = hash(vPosition + uTime * 0.1) * uChaos * 0.3;

          // Breathing pulse
          float pulse = sin(uTime * 2.0) * 0.3 + 0.7;

          // Combine effects
          float intensity = (proximity * 0.5 + fresnel * 0.5) * pulse + noise;
          vec3 glowColor = parityColor * intensity * 2.0;

          // High emissive for bloom
          gl_FragColor = vec4(glowColor, intensity * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  // Update uniforms
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uParity.value = parityCurrent;
      materialRef.current.uniforms.uChaos.value = chaosCurrent;
      materialRef.current.uniforms.uCameraPos.value.copy(state.camera.position);
    }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
    </mesh>
  );
}
