import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BlackHoleEnvironment = ({ flipPulse = false }) => {
  const materialRef = useRef();
  const pulseTimeRef = useRef(0);

  const vertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vPosition = position;
      vNormal = normal;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uPulse;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    #define PI 3.14159265359

    // Noise function for texture
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vec3 pos = normalize(vPosition);

      // Spherical coordinates
      float theta = atan(pos.z, pos.x);
      float phi = acos(pos.y);

      // Distance from "event horizon" center (mapped to viewing direction)
      vec2 center = vec2(0.5, 0.5);
      vec2 uv = vec2(theta / (2.0 * PI) + 0.5, phi / PI);
      float dist = length(uv - center);

      // Create the black hole effect with accretion disk
      float eventHorizon = 0.15;
      float accretionDisk = smoothstep(eventHorizon, eventHorizon + 0.3, dist);

      // Swirling pattern for accretion disk
      float swirl = sin(theta * 5.0 + phi * 3.0 + uTime * 0.3) * 0.5 + 0.5;
      float swirlPattern = smoothstep(0.4, 0.6, swirl);

      // Color gradient for accretion disk (yellow to blue)
      vec3 yellow = vec3(1.0, 0.9, 0.6);
      vec3 blue = vec3(0.6, 0.7, 1.0);
      vec3 white = vec3(1.0, 1.0, 1.0);
      vec3 darkGray = vec3(0.2, 0.2, 0.2);
      vec3 black = vec3(0.0, 0.0, 0.0);

      // Accretion disk colors
      vec3 diskColor = mix(yellow, blue, sin(theta * 2.0 + uTime * 0.2) * 0.5 + 0.5);

      // Inner glow near event horizon
      float innerGlow = smoothstep(eventHorizon + 0.1, eventHorizon, dist);
      vec3 glowColor = mix(yellow, white, innerGlow * 0.5);

      // Outer fade to white/gray
      float outerFade = smoothstep(0.8, 0.5, dist);

      // Combine effects
      vec3 finalColor = white; // Start with white background

      // Add accretion disk
      if (dist > eventHorizon && dist < eventHorizon + 0.3) {
        float diskIntensity = accretionDisk * (1.0 - accretionDisk) * 4.0;
        finalColor = mix(finalColor, diskColor, diskIntensity * swirlPattern * 0.3);
      }

      // Add inner glow
      finalColor = mix(finalColor, glowColor, innerGlow * 0.4);

      // Add subtle gradient to white
      finalColor = mix(finalColor, darkGray, smoothstep(0.7, 0.3, dist) * 0.2);

      // Pulse effect
      if (uPulse > 0.0) {
        float pulseIntensity = uPulse * (1.0 - dist * 0.5);
        vec3 pulseColor = mix(yellow, blue, 0.5);
        finalColor = mix(finalColor, pulseColor, pulseIntensity * 0.3);
        finalColor *= 1.0 + uPulse * 0.5;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // Handle pulse animation
      if (flipPulse && pulseTimeRef.current < 1.0) {
        pulseTimeRef.current = Math.min(1.0, pulseTimeRef.current + delta * 3);
      } else if (!flipPulse && pulseTimeRef.current > 0) {
        pulseTimeRef.current = Math.max(0, pulseTimeRef.current - delta * 2);
      }

      // Eased pulse value
      const easedPulse = pulseTimeRef.current < 0.5
        ? 2 * pulseTimeRef.current * pulseTimeRef.current
        : 1 - Math.pow(-2 * pulseTimeRef.current + 2, 2) / 2;

      materialRef.current.uniforms.uPulse.value = easedPulse;
    }
  });

  return (
    <mesh renderOrder={-100} scale={[-1, 1, 1]}>
      <sphereGeometry args={[100, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uPulse: { value: 0 },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default BlackHoleEnvironment;
