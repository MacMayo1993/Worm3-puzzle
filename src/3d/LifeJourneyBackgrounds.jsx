/**
 * Life Journey Background Environments - 3D Spherical Wrap-Around
 * Daycare → Elementary → Middle → High → College → Job → NASA → Rocket → Moon → Black Hole
 * All backgrounds wrap around the viewer like BlackHoleEnvironment
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// BASE SPHERICAL ENVIRONMENT COMPONENT
// ============================================
function SphericalEnvironment({ fragmentShader, uniforms = {}, flipTrigger = 0 }) {
  const materialRef = useRef();
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (flipTrigger > 0) {
      setPulseIntensity(1.0);
    }
  }, [flipTrigger]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 0 },
        pulseIntensity: { value: 0 },
        ...uniforms
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
      fragmentShader
    });
  }, [fragmentShader, uniforms]);

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
      <sphereGeometry args={[100, 64, 64]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

// Common shader functions
const SHADER_COMMON = `
  // Noise functions
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 getSphericalCoord(vec3 pos) {
    vec3 dir = normalize(pos);
    float theta = atan(dir.z, dir.x);
    float phi = acos(dir.y);
    return vec2(theta / (2.0 * 3.14159) + 0.5, phi / 3.14159);
  }
`;

// ============================================
// 1. DAYCARE - Soft pastels, floating shapes
// ============================================
export function DaycareEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Soft warm cream background
      vec3 bgColor = vec3(1.0, 0.96, 0.9);

      // Soft pastel gradient waves
      float wave1 = sin(coord.x * 8.0 + time * 0.3) * 0.5 + 0.5;
      float wave2 = sin(coord.y * 6.0 + time * 0.2) * 0.5 + 0.5;

      // Pastel colors matching cube faces
      vec3 softPink = vec3(1.0, 0.71, 0.71);
      vec3 softGreen = vec3(0.71, 1.0, 0.71);
      vec3 softBlue = vec3(0.71, 0.83, 1.0);
      vec3 softYellow = vec3(1.0, 1.0, 0.65);
      vec3 softOrange = vec3(1.0, 0.81, 0.65);

      // Blend pastels based on position
      vec3 color = bgColor;
      color = mix(color, softPink, wave1 * 0.15);
      color = mix(color, softBlue, wave2 * 0.12);

      // Floating building blocks (soft squares)
      for (int i = 0; i < 15; i++) {
        vec2 blockPos = vec2(
          hash(vec2(float(i), 1.0)),
          hash(vec2(float(i), 2.0))
        );
        float blockMove = sin(time * 0.5 + float(i)) * 0.02;
        vec2 diff = coord - blockPos - vec2(0.0, blockMove);
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        float blockSize = 0.03 + hash(vec2(float(i), 3.0)) * 0.02;
        float block = smoothstep(blockSize, blockSize - 0.005, max(abs(diff.x), abs(diff.y)));

        vec3 blockColor = softPink;
        float colorSelect = hash(vec2(float(i), 4.0));
        if (colorSelect > 0.8) blockColor = softGreen;
        else if (colorSelect > 0.6) blockColor = softBlue;
        else if (colorSelect > 0.4) blockColor = softYellow;
        else if (colorSelect > 0.2) blockColor = softOrange;

        color = mix(color, blockColor, block * 0.7);
      }

      // Soft ceiling light dots
      for (int i = 0; i < 10; i++) {
        vec2 lightPos = vec2(hash(vec2(float(i), 10.0)), 0.1 + hash(vec2(float(i), 11.0)) * 0.3);
        vec2 diff = coord - lightPos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
        float light = smoothstep(0.02, 0.0, length(diff));
        float twinkle = 0.7 + 0.3 * sin(time * 2.0 + float(i));
        color += vec3(1.0, 0.95, 0.6) * light * twinkle * 0.5;
      }

      // Pulse effect
      color += vec3(1.0, 0.9, 0.8) * pulseIntensity * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 2. ELEMENTARY - Chalkboard with gold stars
// ============================================
export function ElementaryEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Chalkboard green background
      vec3 chalkboard = vec3(0.18, 0.35, 0.15);
      vec3 color = chalkboard;

      // Chalk texture noise
      float chalkNoise = fbm(coord * 50.0) * 0.1;
      color += vec3(chalkNoise);

      // Chalk dust particles
      for (int i = 0; i < 30; i++) {
        vec2 dustPos = vec2(hash(vec2(float(i), 20.0)), hash(vec2(float(i), 21.0)));
        float drift = sin(time * 0.5 + float(i)) * 0.01;
        vec2 diff = coord - dustPos - vec2(drift, drift * 0.5);
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
        float dust = smoothstep(0.003, 0.0, length(diff));
        color += vec3(1.0) * dust * 0.5;
      }

      // Gold stars
      for (int i = 0; i < 20; i++) {
        vec2 starPos = vec2(hash(vec2(float(i), 30.0)), hash(vec2(float(i), 31.0)));
        vec2 diff = coord - starPos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        // Star shape using distance
        float angle = atan(diff.y, diff.x);
        float radius = length(diff);
        float starShape = 0.015 + 0.01 * sin(angle * 5.0 + 1.57);
        float star = smoothstep(starShape, starShape - 0.005, radius);

        // Rotation animation
        float rotSpeed = hash(vec2(float(i), 32.0)) * 0.5;
        float twinkle = 0.7 + 0.3 * sin(time * 2.0 + float(i));

        vec3 goldColor = vec3(1.0, 0.84, 0.0);
        color = mix(color, goldColor, star * twinkle);

        // Star glow
        float glow = smoothstep(0.04, 0.0, radius) * 0.3;
        color += vec3(1.0, 0.9, 0.5) * glow * twinkle;
      }

      // Faint ABC letters suggestion
      float letterHint = fbm(coord * 5.0 + time * 0.1);
      color += vec3(0.9, 0.9, 0.8) * letterHint * 0.05;

      // Pulse
      color += vec3(1.0, 0.95, 0.7) * pulseIntensity * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 3. MIDDLE SCHOOL - Lockers and hallway
// ============================================
export function MiddleSchoolEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Hallway blue-gray background
      vec3 hallway = vec3(0.23, 0.29, 0.35);
      vec3 color = hallway;

      // Locker pattern on sides
      vec3 lockerBlue = vec3(0.29, 0.44, 0.65);
      vec3 lockerDark = vec3(0.24, 0.35, 0.55);

      // Left wall lockers
      if (coord.x < 0.15 || coord.x > 0.85) {
        float lockerY = mod(coord.y * 12.0, 1.0);
        float lockerLine = smoothstep(0.02, 0.0, abs(lockerY - 0.5));
        float lockerShade = step(0.5, lockerY);
        color = mix(lockerBlue, lockerDark, lockerShade);
        color -= vec3(0.1) * lockerLine;

        // Locker vents
        float vent = step(0.4, mod(coord.y * 48.0, 1.0)) * step(mod(coord.y * 48.0, 1.0), 0.6);
        color -= vec3(0.05) * vent;
      }

      // Fluorescent light strips
      float lightStrip = smoothstep(0.02, 0.0, abs(coord.y - 0.15));
      lightStrip += smoothstep(0.02, 0.0, abs(coord.y - 0.85));
      float flicker = 0.9 + 0.1 * sin(time * 30.0 + coord.x * 10.0);
      color += vec3(0.9, 0.95, 1.0) * lightStrip * 0.5 * flicker;

      // Floating notebook pages
      for (int i = 0; i < 12; i++) {
        vec2 pagePos = vec2(hash(vec2(float(i), 40.0)), hash(vec2(float(i), 41.0)));
        float flutter = sin(time * 2.0 + float(i)) * 0.03;
        vec2 diff = coord - pagePos - vec2(flutter, flutter * 0.5);
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        // Rectangular page
        float pageW = 0.025;
        float pageH = 0.035;
        float page = smoothstep(pageW, pageW - 0.003, abs(diff.x)) *
                     smoothstep(pageH, pageH - 0.003, abs(diff.y));

        // Lined paper
        vec3 paperColor = vec3(0.96, 0.96, 0.86);
        float lines = step(0.7, mod(diff.y * 200.0, 1.0));
        paperColor -= vec3(0.0, 0.0, 0.15) * lines;

        color = mix(color, paperColor, page * 0.8);
      }

      // Pulse
      color += vec3(0.5, 0.7, 1.0) * pulseIntensity * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 4. HIGH SCHOOL - Chaotic energy
// ============================================
export function HighSchoolEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Dark dramatic background
      vec3 darkBg = vec3(0.1, 0.1, 0.18);
      vec3 color = darkBg;

      // Swirling chaos vortex
      vec2 center = vec2(0.5, 0.5);
      vec2 toCenter = coord - center;
      toCenter.x = mod(toCenter.x + 0.5, 1.0) - 0.5;
      float dist = length(toCenter);
      float angle = atan(toCenter.y, toCenter.x);

      // Spiral distortion
      float spiral = sin(angle * 3.0 - dist * 10.0 + time * 2.0);
      float vortex = smoothstep(0.5, 0.0, dist) * spiral * 0.5;

      // Chaotic color mixing
      vec3 chaos1 = vec3(1.0, 0.42, 0.42); // Red
      vec3 chaos2 = vec3(0.31, 0.8, 0.77);  // Teal
      vec3 chaos3 = vec3(1.0, 0.9, 0.43);   // Yellow
      vec3 chaos4 = vec3(0.58, 0.88, 0.83); // Mint

      float colorMix = fbm(coord * 5.0 + time * 0.5);
      vec3 chaosColor = mix(chaos1, chaos2, colorMix);
      chaosColor = mix(chaosColor, chaos3, fbm(coord * 7.0 - time * 0.3));
      chaosColor = mix(chaosColor, chaos4, fbm(coord * 3.0 + time * 0.2));

      color = mix(color, chaosColor, vortex * 0.6 + 0.1);

      // Swirling particles
      for (int i = 0; i < 40; i++) {
        float particleSpeed = 0.5 + hash(vec2(float(i), 50.0)) * 1.5;
        float particleRadius = 0.1 + hash(vec2(float(i), 51.0)) * 0.3;
        float particleAngle = time * particleSpeed + float(i) * 0.3;

        vec2 particlePos = center + vec2(
          cos(particleAngle) * particleRadius,
          sin(particleAngle * 0.7) * particleRadius * 0.8
        );

        vec2 diff = coord - particlePos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
        float particle = smoothstep(0.008, 0.0, length(diff));

        vec3 pColor = chaos1;
        if (i % 4 == 1) pColor = chaos2;
        else if (i % 4 == 2) pColor = chaos3;
        else if (i % 4 == 3) pColor = chaos4;

        color += pColor * particle * 0.8;
      }

      // Warning lights pulsing
      float warning1 = sin(time * 3.0) * 0.5 + 0.5;
      float warning2 = sin(time * 3.0 + 2.0) * 0.5 + 0.5;

      vec2 light1 = vec2(0.2, 0.3);
      vec2 light2 = vec2(0.8, 0.3);
      vec2 light3 = vec2(0.5, 0.8);

      float l1 = smoothstep(0.15, 0.0, length(coord - light1));
      float l2 = smoothstep(0.15, 0.0, length(vec2(mod(coord.x + 0.5, 1.0) - 0.5, coord.y) - vec2(0.3, 0.3)));
      float l3 = smoothstep(0.12, 0.0, length(coord - light3));

      color += vec3(1.0, 0.2, 0.2) * l1 * warning1 * 0.4;
      color += vec3(1.0, 0.2, 0.2) * l2 * warning2 * 0.4;
      color += vec3(1.0, 0.5, 0.0) * l3 * warning1 * 0.3;

      // Pulse
      color += vec3(1.0, 0.6, 0.4) * pulseIntensity * 0.4;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 5. COLLEGE - Late night academic vibes
// ============================================
export function CollegeEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Dark blue/purple - late night study
      vec3 nightBg = vec3(0.1, 0.1, 0.23);
      vec3 color = nightBg;

      // Subtle gradient
      color += vec3(0.05, 0.0, 0.1) * (1.0 - coord.y);

      // Floating math symbols / equations
      for (int i = 0; i < 25; i++) {
        vec2 symPos = vec2(hash(vec2(float(i), 60.0)), hash(vec2(float(i), 61.0)));
        float drift = sin(time * 0.3 + float(i)) * 0.02;
        vec2 diff = coord - symPos - vec2(drift, drift * 0.3);
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        // Symbol as glowing dot
        float sym = smoothstep(0.015, 0.0, length(diff));
        float glow = smoothstep(0.04, 0.0, length(diff));

        vec3 symColor = vec3(0.0, 0.81, 0.82); // Cyan
        if (i % 3 == 1) symColor = vec3(0.58, 0.44, 0.86); // Purple
        else if (i % 3 == 2) symColor = vec3(1.0, 0.84, 0.0); // Gold

        color += symColor * sym * 0.8;
        color += symColor * glow * 0.2;
      }

      // Desk lamp warm glow (bottom right area)
      vec2 lampPos = vec2(0.75, 0.7);
      float lampDist = length(coord - lampPos);
      float lampGlow = smoothstep(0.4, 0.0, lampDist);
      color += vec3(1.0, 0.9, 0.7) * lampGlow * 0.25;

      // Coffee steam effect (bottom left)
      vec2 coffeePos = vec2(0.2, 0.75);
      for (int i = 0; i < 8; i++) {
        float steamT = mod(time * 0.5 + float(i) * 0.3, 2.0);
        vec2 steamPos = coffeePos + vec2(sin(steamT * 3.0 + float(i)) * 0.02, -steamT * 0.1);
        vec2 diff = coord - steamPos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
        float steam = smoothstep(0.015, 0.0, length(diff));
        float fade = 1.0 - steamT / 2.0;
        color += vec3(0.8, 0.85, 0.9) * steam * fade * 0.4;
      }

      // Window with moonlight (upper area)
      float window = smoothstep(0.3, 0.25, abs(coord.x - 0.5)) *
                     smoothstep(0.35, 0.3, abs(coord.y - 0.2));
      color += vec3(0.2, 0.25, 0.4) * window * 0.3;

      // Stars through window
      for (int i = 0; i < 15; i++) {
        vec2 starPos = vec2(0.35 + hash(vec2(float(i), 70.0)) * 0.3,
                            0.05 + hash(vec2(float(i), 71.0)) * 0.25);
        vec2 diff = coord - starPos;
        float star = smoothstep(0.004, 0.0, length(diff));
        float twinkle = 0.6 + 0.4 * sin(time * 3.0 + float(i) * 2.0);
        color += vec3(1.0) * star * twinkle * window;
      }

      // Pulse
      color += vec3(0.6, 0.5, 1.0) * pulseIntensity * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 6. FIRST JOB - Corporate office
// ============================================
export function JobEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Corporate blue-gray
      vec3 officeBg = vec3(0.17, 0.24, 0.31);
      vec3 color = officeBg;

      // Grid pattern - corporate structure
      float gridX = smoothstep(0.02, 0.0, abs(mod(coord.x * 12.0, 1.0) - 0.5));
      float gridY = smoothstep(0.02, 0.0, abs(mod(coord.y * 10.0, 1.0) - 0.5));
      vec3 gridColor = vec3(0.2, 0.47, 0.69);
      color += gridColor * (gridX + gridY) * 0.15;

      // Floating charts/graphs
      for (int i = 0; i < 8; i++) {
        vec2 chartPos = vec2(hash(vec2(float(i), 80.0)), hash(vec2(float(i), 81.0)));
        float wobble = sin(time * 0.5 + float(i)) * 0.01;
        vec2 diff = coord - chartPos - vec2(wobble, 0.0);
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        // Chart background
        float chartW = 0.06;
        float chartH = 0.04;
        float chart = smoothstep(chartW, chartW - 0.005, abs(diff.x)) *
                      smoothstep(chartH, chartH - 0.005, abs(diff.y));

        vec3 chartBg = vec3(0.2, 0.29, 0.37);
        color = mix(color, chartBg, chart * 0.8);

        // Bar chart bars
        for (int j = 0; j < 5; j++) {
          float barX = -0.04 + float(j) * 0.02;
          float barH = 0.01 + hash(vec2(float(i), float(j) + 100.0)) * 0.025;
          float bar = smoothstep(0.006, 0.003, abs(diff.x - barX)) *
                      step(-chartH + 0.005, diff.y) *
                      step(diff.y, -chartH + 0.005 + barH);

          vec3 barColors[5];
          barColors[0] = vec3(0.2, 0.47, 0.69);
          barColors[1] = vec3(0.18, 0.8, 0.44);
          barColors[2] = vec3(0.91, 0.3, 0.24);
          barColors[3] = vec3(0.95, 0.61, 0.07);
          barColors[4] = vec3(0.61, 0.35, 0.71);

          color = mix(color, barColors[j], bar * chart);
        }
      }

      // Office ceiling lights
      for (int i = 0; i < 6; i++) {
        vec2 lightPos = vec2(0.1 + float(i) * 0.16, 0.15);
        vec2 diff = coord - lightPos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
        float light = smoothstep(0.08, 0.0, length(diff * vec2(1.0, 2.0)));
        color += vec3(1.0, 0.98, 0.95) * light * 0.2;
      }

      // Pulse
      color += vec3(0.3, 0.6, 1.0) * pulseIntensity * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 7. NASA LAB - Tech screens, data streams
// ============================================
export function NasaEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Dark tech background
      vec3 techBg = vec3(0.04, 0.04, 0.1);
      vec3 color = techBg;

      // Control room screens grid
      for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 4; col++) {
          vec2 screenPos = vec2(0.15 + float(col) * 0.2, 0.2 + float(row) * 0.25);
          vec2 diff = coord - screenPos;
          diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

          float screenW = 0.07;
          float screenH = 0.05;
          float screen = smoothstep(screenW, screenW - 0.003, abs(diff.x)) *
                         smoothstep(screenH, screenH - 0.003, abs(diff.y));

          // Screen glow and flicker
          float flicker = 0.8 + 0.2 * sin(time * 5.0 + float(row * 4 + col) * 2.0);
          vec3 screenColor = vec3(0.0, 0.07, 0.13);
          vec3 screenGlow = vec3(0.0, 0.75, 1.0);

          color = mix(color, screenColor, screen);
          color += screenGlow * screen * 0.15 * flicker;

          // Scan line on screen
          float scanLine = step(0.9, mod(coord.y * 100.0 + time * 10.0, 1.0));
          color += vec3(0.0, 0.5, 0.7) * scanLine * screen * 0.1;
        }
      }

      // Data stream particles (falling matrix style)
      for (int i = 0; i < 50; i++) {
        float streamX = hash(vec2(float(i), 90.0));
        float speed = 2.0 + hash(vec2(float(i), 91.0)) * 3.0;
        float streamY = mod(1.0 - (time * speed * 0.1 + hash(vec2(float(i), 92.0))), 1.0);

        vec2 diff = coord - vec2(streamX, streamY);
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        float particle = smoothstep(0.008, 0.0, abs(diff.x)) *
                         smoothstep(0.02, 0.0, abs(diff.y));

        // Trail
        float trail = smoothstep(0.003, 0.0, abs(diff.x)) *
                      step(0.0, diff.y) * step(diff.y, 0.05) * (1.0 - diff.y / 0.05);

        color += vec3(0.0, 1.0, 0.53) * (particle + trail * 0.5) * 0.6;
      }

      // Ambient tech glow spots
      vec2 glow1 = vec2(0.3, 0.5);
      vec2 glow2 = vec2(0.7, 0.5);
      float g1 = smoothstep(0.4, 0.0, length(coord - glow1));
      float g2 = smoothstep(0.35, 0.0, length(vec2(mod(coord.x + 0.5, 1.0) - 0.5, coord.y) - vec2(0.2, 0.5)));

      color += vec3(0.0, 0.75, 1.0) * g1 * 0.1;
      color += vec3(1.0, 0.42, 0.0) * g2 * 0.08;

      // Pulse
      color += vec3(0.0, 0.8, 1.0) * pulseIntensity * 0.4;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 8. ROCKET LAUNCH - Fire and smoke
// ============================================
export function RocketEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Night sky gradient
      vec3 nightSky = mix(vec3(0.04, 0.04, 0.16), vec3(0.02, 0.02, 0.05), coord.y);
      vec3 color = nightSky;

      // Stars in the sky
      for (int i = 0; i < 100; i++) {
        vec2 starPos = vec2(hash(vec2(float(i), 100.0)), hash(vec2(float(i), 101.0)) * 0.6);
        vec2 diff = coord - starPos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
        float star = smoothstep(0.003, 0.0, length(diff));
        float twinkle = 0.6 + 0.4 * sin(time * 2.0 + float(i));
        color += vec3(1.0) * star * twinkle * 0.8;
      }

      // Ground/launchpad (bottom portion)
      float ground = smoothstep(0.72, 0.75, coord.y);
      color = mix(color, vec3(0.12, 0.12, 0.12), ground);

      // Rocket exhaust flames (center bottom)
      vec2 flameBase = vec2(0.5, 0.78);
      for (int i = 0; i < 25; i++) {
        float flameX = (hash(vec2(float(i), 110.0)) - 0.5) * 0.15;
        float flameSpeed = 5.0 + hash(vec2(float(i), 111.0)) * 5.0;
        float flameY = mod(time * flameSpeed * 0.02 + hash(vec2(float(i), 112.0)), 0.2);

        vec2 flamePos = flameBase + vec2(flameX, flameY);
        vec2 diff = coord - flamePos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        float flameW = 0.01 + flameY * 0.1;
        float flame = smoothstep(flameW, 0.0, length(diff * vec2(1.0, 0.5)));

        // Color gradient: white core -> yellow -> orange -> red
        vec3 flameColor = vec3(1.0, 0.95, 0.8);
        if (flameY > 0.05) flameColor = vec3(1.0, 0.8, 0.2);
        if (flameY > 0.1) flameColor = vec3(1.0, 0.5, 0.1);
        if (flameY > 0.15) flameColor = vec3(1.0, 0.27, 0.0);

        color += flameColor * flame * (1.0 - flameY / 0.2) * 0.8;
      }

      // Main flame glow
      vec2 diff = coord - flameBase;
      diff.x = mod(diff.x + 0.5, 1.0) - 0.5;
      float mainGlow = smoothstep(0.25, 0.0, length(diff * vec2(1.0, 0.5)));
      color += vec3(1.0, 0.4, 0.1) * mainGlow * 0.5;

      // Smoke clouds billowing out
      for (int i = 0; i < 20; i++) {
        float smokeT = mod(time * 0.3 + float(i) * 0.2, 3.0);
        float smokeX = (hash(vec2(float(i), 120.0)) - 0.5) * 0.4;
        smokeX += sin(smokeT * 2.0 + float(i)) * 0.1;

        vec2 smokePos = vec2(0.5 + smokeX, 0.8 + smokeT * 0.15);
        vec2 diff = coord - smokePos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        float smokeSize = 0.02 + smokeT * 0.03;
        float smoke = smoothstep(smokeSize, 0.0, length(diff));
        float fade = 1.0 - smokeT / 3.0;

        color = mix(color, vec3(0.5, 0.5, 0.55), smoke * fade * 0.6);
      }

      // Pulse - bright flash
      color += vec3(1.0, 0.7, 0.3) * pulseIntensity * 0.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// 9. MOON - Lunar surface with Earth
// ============================================
export function MoonEnvironment({ flipTrigger = 0 }) {
  const fragmentShader = `
    uniform float time;
    uniform float pulseIntensity;
    varying vec3 vPosition;

    ${SHADER_COMMON}

    void main() {
      vec2 coord = getSphericalCoord(vPosition);

      // Deep space black
      vec3 space = vec3(0.0, 0.0, 0.02);
      vec3 color = space;

      // Dense starfield
      for (int layer = 0; layer < 3; layer++) {
        for (int i = 0; i < 80; i++) {
          vec2 starPos = vec2(
            hash(vec2(float(i + layer * 80), 130.0)),
            hash(vec2(float(i + layer * 80), 131.0))
          );
          vec2 diff = coord - starPos;
          diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

          float starSize = 0.002 + hash(vec2(float(i), 132.0)) * 0.003;
          if (layer == 0) starSize *= 1.5; // Bright stars

          float star = smoothstep(starSize, 0.0, length(diff));
          float twinkle = 0.7 + 0.3 * sin(time * (1.0 + hash(vec2(float(i), 133.0)) * 2.0) + float(i));

          // Star color variation
          vec3 starColor = vec3(1.0);
          float colorVar = hash(vec2(float(i), 134.0));
          if (colorVar > 0.9) starColor = vec3(0.7, 0.85, 1.0); // Blue
          else if (colorVar > 0.8) starColor = vec3(1.0, 0.9, 0.7); // Yellow

          color += starColor * star * twinkle * (layer == 0 ? 0.9 : 0.4);
        }
      }

      // Earth in the distance (upper right area)
      vec2 earthPos = vec2(0.75, 0.25);
      vec2 earthDiff = coord - earthPos;
      earthDiff.x = mod(earthDiff.x + 0.5, 1.0) - 0.5;
      float earthDist = length(earthDiff);

      // Earth sphere
      float earthRadius = 0.08;
      float earth = smoothstep(earthRadius, earthRadius - 0.005, earthDist);

      // Earth colors
      vec3 oceanBlue = vec3(0.12, 0.56, 1.0);
      vec3 landGreen = vec3(0.13, 0.55, 0.13);
      float landMask = fbm(earthDiff * 30.0 + 5.0) > 0.5 ? 1.0 : 0.0;
      vec3 earthColor = mix(oceanBlue, landGreen, landMask);

      // Cloud layer
      float clouds = fbm(earthDiff * 40.0 + time * 0.1);
      earthColor = mix(earthColor, vec3(1.0), clouds * 0.4);

      color = mix(color, earthColor, earth);

      // Earth atmosphere glow
      float atmosphere = smoothstep(earthRadius + 0.03, earthRadius, earthDist) *
                         (1.0 - smoothstep(earthRadius - 0.01, earthRadius, earthDist));
      color += vec3(0.53, 0.81, 0.98) * atmosphere * 0.5;

      // Lunar surface (bottom half)
      float lunarY = smoothstep(0.55, 0.65, coord.y);
      vec3 lunarGray = vec3(0.35, 0.35, 0.37);

      // Lunar texture
      float lunarNoise = fbm(coord * 20.0) * 0.15;
      lunarGray += vec3(lunarNoise - 0.075);

      color = mix(color, lunarGray, lunarY);

      // Craters
      for (int i = 0; i < 12; i++) {
        vec2 craterPos = vec2(
          hash(vec2(float(i), 140.0)),
          0.6 + hash(vec2(float(i), 141.0)) * 0.35
        );
        vec2 diff = coord - craterPos;
        diff.x = mod(diff.x + 0.5, 1.0) - 0.5;

        float craterSize = 0.02 + hash(vec2(float(i), 142.0)) * 0.04;
        float crater = smoothstep(craterSize, craterSize - 0.01, length(diff));
        float craterRim = smoothstep(craterSize - 0.008, craterSize - 0.012, length(diff));

        color = mix(color, vec3(0.25, 0.25, 0.27), crater * lunarY);
        color = mix(color, vec3(0.45, 0.45, 0.47), craterRim * crater * lunarY);
      }

      // Moonlight / sun reflection
      vec2 sunDir = vec2(-0.3, -0.2);
      float sunlight = smoothstep(0.0, 1.0, dot(normalize(coord - vec2(0.5)), normalize(sunDir)));
      color += vec3(1.0, 0.98, 0.9) * sunlight * lunarY * 0.15;

      // Pulse
      color += vec3(0.8, 0.9, 1.0) * pulseIntensity * 0.3;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return <SphericalEnvironment fragmentShader={fragmentShader} flipTrigger={flipTrigger} />;
}

// ============================================
// Helper: Get background component by name
// ============================================
export function getLevelBackground(backgroundName, flipTrigger) {
  switch (backgroundName) {
    case 'daycare':
      return <DaycareEnvironment flipTrigger={flipTrigger} />;
    case 'elementary':
      return <ElementaryEnvironment flipTrigger={flipTrigger} />;
    case 'middleschool':
      return <MiddleSchoolEnvironment flipTrigger={flipTrigger} />;
    case 'highschool':
      return <HighSchoolEnvironment flipTrigger={flipTrigger} />;
    case 'college':
      return <CollegeEnvironment flipTrigger={flipTrigger} />;
    case 'job':
      return <JobEnvironment flipTrigger={flipTrigger} />;
    case 'nasa':
      return <NasaEnvironment flipTrigger={flipTrigger} />;
    case 'rocket':
      return <RocketEnvironment flipTrigger={flipTrigger} />;
    case 'moon':
      return <MoonEnvironment flipTrigger={flipTrigger} />;
    // 'blackhole' is handled separately by existing BlackHoleEnvironment
    default:
      return null;
  }
}
