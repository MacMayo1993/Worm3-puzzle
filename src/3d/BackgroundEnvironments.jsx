import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * StarfieldEnvironment - Animated deep-space starfield with parallax layers and shooting stars
 */
export function StarfieldEnvironment({ flipTrigger = 0 }) {
  const materialRef = useRef();
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const prevFlipTriggerRef = useRef(flipTrigger);

  // Track flip trigger changes - update ref synchronously, trigger pulse in frame loop
  if (flipTrigger > 0 && flipTrigger !== prevFlipTriggerRef.current) {
    prevFlipTriggerRef.current = flipTrigger;
    // Schedule pulse for next frame to avoid setState during render
    queueMicrotask(() => setPulseIntensity(1.0));
  }

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float hash3(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        float starLayer(vec3 dir, float scale, float brightness) {
          vec3 p = dir * scale;
          vec3 cell = floor(p);
          float stars = 0.0;
          for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
              for (int dz = -1; dz <= 1; dz++) {
                vec3 neighbor = cell + vec3(float(dx), float(dy), float(dz));
                vec3 starPos = neighbor + vec3(hash3(neighbor), hash3(neighbor + 100.0), hash3(neighbor + 200.0));
                float d = length(p - starPos);
                float twinkle = 0.7 + 0.3 * sin(time * (1.5 + hash3(neighbor) * 3.0) + hash3(neighbor) * 6.28);
                float size = 0.015 + hash3(neighbor + 50.0) * 0.02;
                float star = smoothstep(size, size * 0.1, d) * brightness * twinkle;
                stars += star;
              }
            }
          }
          return stars;
        }

        void main() {
          vec3 dir = normalize(vPosition);

          // Deep space background gradient
          float zenith = dir.y * 0.5 + 0.5;
          vec3 bgTop = vec3(0.0, 0.01, 0.04);
          vec3 bgBot = vec3(0.01, 0.0, 0.02);
          vec3 color = mix(bgBot, bgTop, zenith);

          // Multiple star layers at different scales for depth
          float s1 = starLayer(dir, 30.0, 1.0);
          float s2 = starLayer(dir, 60.0, 0.6);
          float s3 = starLayer(dir, 120.0, 0.3);

          // Star color variation
          vec3 warmStar = vec3(1.0, 0.9, 0.7);
          vec3 coolStar = vec3(0.7, 0.85, 1.0);
          float colorMix = hash(dir.xy * 50.0);
          vec3 starColor = mix(warmStar, coolStar, colorMix);

          color += starColor * (s1 + s2 + s3);

          // Subtle nebula dust
          float nebula = 0.0;
          vec3 np = dir * 3.0;
          nebula += sin(np.x * 2.0 + time * 0.1) * sin(np.y * 2.5 + time * 0.07) * sin(np.z * 1.8) * 0.5 + 0.5;
          nebula *= 0.04;
          color += vec3(0.1, 0.05, 0.15) * nebula;

          // Shooting stars
          float shootingPhase = mod(time * 0.3, 6.28);
          vec3 shootDir = normalize(vec3(sin(shootingPhase * 2.7), cos(shootingPhase * 1.3), sin(shootingPhase * 0.8)));
          float shootDot = max(0.0, dot(dir, shootDir));
          float shootTrail = pow(shootDot, 800.0) * smoothstep(0.0, 0.3, fract(time * 0.3));
          color += vec3(1.0, 0.95, 0.8) * shootTrail * 2.0;

          // Pulse on flip
          if (pulseIntensity > 0.01) {
            color += starColor * (s1 + s2) * pulseIntensity * 0.8;
            color += vec3(0.05, 0.08, 0.15) * pulseIntensity * 0.3;
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.pulseIntensity.value = pulseIntensity;
    }
    if (pulseIntensity > 0) {
      setPulseIntensity(prev => Math.max(0, prev - delta * 2.5));
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

/**
 * NebulaSkyEnvironment - Colorful nebula clouds with flowing gas and embedded stars
 */
export function NebulaSkyEnvironment({ flipTrigger = 0 }) {
  const materialRef = useRef();
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const prevFlipTriggerRef = useRef(flipTrigger);

  // Track flip trigger changes - update ref synchronously, trigger pulse in frame loop
  if (flipTrigger > 0 && flipTrigger !== prevFlipTriggerRef.current) {
    prevFlipTriggerRef.current = flipTrigger;
    // Schedule pulse for next frame to avoid setState during render
    queueMicrotask(() => setPulseIntensity(1.0));
  }

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simplex-style noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float fbm(vec3 p) {
          float f = 0.0;
          f += 0.5 * snoise(p); p *= 2.01;
          f += 0.25 * snoise(p); p *= 2.02;
          f += 0.125 * snoise(p); p *= 2.03;
          f += 0.0625 * snoise(p);
          return f;
        }

        float hash3(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        void main() {
          vec3 dir = normalize(vPosition);
          float t = time * 0.05;

          // Flowing nebula layers
          vec3 np1 = dir * 2.0 + vec3(t, t * 0.7, t * 0.3);
          vec3 np2 = dir * 3.5 + vec3(-t * 0.5, t * 0.4, -t * 0.6);
          vec3 np3 = dir * 1.5 + vec3(t * 0.3, -t * 0.2, t * 0.8);

          float n1 = fbm(np1) * 0.5 + 0.5;
          float n2 = fbm(np2) * 0.5 + 0.5;
          float n3 = fbm(np3) * 0.5 + 0.5;

          // Nebula color palette
          vec3 magenta = vec3(0.6, 0.05, 0.3);
          vec3 teal = vec3(0.0, 0.3, 0.4);
          vec3 purple = vec3(0.2, 0.05, 0.4);
          vec3 orange = vec3(0.5, 0.15, 0.0);

          vec3 nebula = vec3(0.0);
          nebula += magenta * n1 * 0.4;
          nebula += teal * n2 * 0.3;
          nebula += purple * pow(n3, 2.0) * 0.5;
          nebula += orange * pow(n1 * n2, 2.0) * 0.3;

          // Background
          vec3 color = vec3(0.005, 0.0, 0.015);
          color += nebula;

          // Embedded stars
          vec3 sp = dir * 80.0;
          vec3 cell = floor(sp);
          float stars = 0.0;
          for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
              for (int dz = -1; dz <= 1; dz++) {
                vec3 neighbor = cell + vec3(float(dx), float(dy), float(dz));
                vec3 starPos = neighbor + vec3(hash3(neighbor), hash3(neighbor + 100.0), hash3(neighbor + 200.0));
                float d = length(sp - starPos);
                float twinkle = 0.6 + 0.4 * sin(time * (2.0 + hash3(neighbor) * 4.0) + hash3(neighbor) * 6.28);
                float star = smoothstep(0.025, 0.0, d) * twinkle;
                stars += star;
              }
            }
          }
          color += vec3(0.9, 0.92, 1.0) * stars;

          // Brighter core regions
          float core = pow(max(0.0, n1 * n2), 3.0);
          color += vec3(0.8, 0.6, 0.9) * core * 0.2;

          // Pulse on flip - nebula brightens
          if (pulseIntensity > 0.01) {
            color += nebula * pulseIntensity * 1.5;
            color += vec3(0.1, 0.05, 0.15) * pulseIntensity * 0.5;
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.pulseIntensity.value = pulseIntensity;
    }
    if (pulseIntensity > 0) {
      setPulseIntensity(prev => Math.max(0, prev - delta * 2.5));
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
