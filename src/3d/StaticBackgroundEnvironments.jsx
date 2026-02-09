import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Static Background Environments for Free Play
 *
 * These are performance-optimized versions of the animated backgrounds.
 * All useFrame hooks are removed - shaders render with a fixed time value
 * producing a beautiful still 3D picture without per-frame GPU cost.
 */

// Shared vertex shader used by all backgrounds
const VERTEX_SHADER = `
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * StaticStarfieldEnvironment - Frozen starfield snapshot
 */
export function StaticStarfieldEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 12.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
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
          float zenith = dir.y * 0.5 + 0.5;
          vec3 bgTop = vec3(0.0, 0.01, 0.04);
          vec3 bgBot = vec3(0.01, 0.0, 0.02);
          vec3 color = mix(bgBot, bgTop, zenith);

          float s1 = starLayer(dir, 30.0, 1.0);
          float s2 = starLayer(dir, 60.0, 0.6);
          float s3 = starLayer(dir, 120.0, 0.3);

          vec3 warmStar = vec3(1.0, 0.9, 0.7);
          vec3 coolStar = vec3(0.7, 0.85, 1.0);
          float colorMix = hash(dir.xy * 50.0);
          vec3 starColor = mix(warmStar, coolStar, colorMix);
          color += starColor * (s1 + s2 + s3);

          float nebula = 0.0;
          vec3 np = dir * 3.0;
          nebula += sin(np.x * 2.0 + time * 0.1) * sin(np.y * 2.5 + time * 0.07) * sin(np.z * 1.8) * 0.5 + 0.5;
          nebula *= 0.04;
          color += vec3(0.1, 0.05, 0.15) * nebula;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticAuroraEnvironment - Frozen northern lights snapshot
 */
export function StaticAuroraEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 8.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;
        varying vec2 vUv;

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
          float f = 0.0;
          f += 0.5 * noise(p); p *= 2.01;
          f += 0.25 * noise(p); p *= 2.02;
          f += 0.125 * noise(p); p *= 2.03;
          f += 0.0625 * noise(p);
          return f;
        }

        void main() {
          vec3 dir = normalize(vPosition);
          float t = time * 0.15;

          float zenith = dir.y * 0.5 + 0.5;
          vec3 skyDark = vec3(0.0, 0.02, 0.08);
          vec3 skyHorizon = vec3(0.02, 0.04, 0.1);
          vec3 color = mix(skyHorizon, skyDark, pow(zenith, 0.5));

          if (dir.y > -0.1) {
            vec2 aurorauv = vec2(atan(dir.x, dir.z) * 2.0, dir.y * 3.0);
            float curtain1 = fbm(aurorauv * vec2(3.0, 1.0) + vec2(t, t * 0.5));
            float curtain2 = fbm(aurorauv * vec2(2.5, 0.8) + vec2(-t * 0.7, t * 0.3));
            float curtain3 = fbm(aurorauv * vec2(4.0, 1.2) + vec2(t * 0.5, -t * 0.4));

            float streaks = sin(aurorauv.x * 15.0 + t * 2.0 + curtain1 * 5.0) * 0.5 + 0.5;
            streaks *= sin(aurorauv.x * 8.0 - t * 1.5 + curtain2 * 3.0) * 0.5 + 0.5;

            float heightMask = smoothstep(-0.1, 0.2, dir.y) * smoothstep(0.9, 0.5, dir.y);
            float intensity = (curtain1 * 0.5 + curtain2 * 0.3 + curtain3 * 0.2) * heightMask * streaks;

            vec3 green = vec3(0.1, 0.8, 0.3);
            vec3 teal = vec3(0.1, 0.6, 0.7);
            vec3 purple = vec3(0.5, 0.2, 0.8);
            vec3 pink = vec3(0.8, 0.2, 0.5);

            vec3 auroraColor = mix(green, teal, curtain1);
            auroraColor = mix(auroraColor, purple, curtain2 * 0.5);
            auroraColor = mix(auroraColor, pink, pow(curtain3, 2.0) * 0.3);

            color += auroraColor * intensity * 0.8;
            float edge = pow(intensity, 3.0);
            color += vec3(0.8, 1.0, 0.9) * edge * 0.3;
          }

          // Stars
          vec3 sp = dir * 60.0;
          vec3 cell = floor(sp);
          for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
              for (int dz = -1; dz <= 1; dz++) {
                vec3 neighbor = cell + vec3(float(dx), float(dy), float(dz));
                float h = hash(neighbor.xy + neighbor.z * 100.0);
                vec3 starPos = neighbor + vec3(h, hash(neighbor.yz), hash(neighbor.xz));
                float d = length(sp - starPos);
                float twinkle = 0.5 + 0.5 * sin(time * (1.0 + h * 3.0) + h * 6.28);
                float star = smoothstep(0.03, 0.0, d) * twinkle * 0.7;
                color += vec3(0.9, 0.95, 1.0) * star;
              }
            }
          }

          // Mountains
          float angle = atan(dir.x, dir.z);
          float mountainHeight = 0.0;
          mountainHeight += sin(angle * 3.0) * 0.08;
          mountainHeight += sin(angle * 7.0 + 1.0) * 0.05;
          mountainHeight += sin(angle * 13.0 + 2.0) * 0.03;
          mountainHeight += sin(angle * 23.0) * 0.02;
          mountainHeight = mountainHeight * 0.5 - 0.35;

          if (dir.y < mountainHeight + 0.02) {
            float snowLine = smoothstep(mountainHeight - 0.05, mountainHeight + 0.02, dir.y);
            vec3 mountainColor = mix(vec3(0.02, 0.03, 0.05), vec3(0.6, 0.65, 0.75), snowLine);
            color = mix(mountainColor, color, smoothstep(mountainHeight, mountainHeight + 0.01, dir.y));
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticDeepOceanEnvironment - Frozen deep sea snapshot
 */
export function StaticDeepOceanEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 15.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float a = hash(i);
          float b = hash(i + vec3(1,0,0));
          float c = hash(i + vec3(0,1,0));
          float d = hash(i + vec3(1,1,0));
          float e = hash(i + vec3(0,0,1));
          float f1 = hash(i + vec3(1,0,1));
          float g = hash(i + vec3(0,1,1));
          float h = hash(i + vec3(1,1,1));

          return mix(
            mix(mix(a,b,f.x), mix(c,d,f.x), f.y),
            mix(mix(e,f1,f.x), mix(g,h,f.x), f.y),
            f.z
          );
        }

        void main() {
          vec3 dir = normalize(vPosition);
          float t = time * 0.1;

          float depth = dir.y * 0.5 + 0.5;
          vec3 deepBlue = vec3(0.0, 0.02, 0.08);
          vec3 abyssBlack = vec3(0.0, 0.005, 0.02);
          vec3 color = mix(abyssBlack, deepBlue, depth);

          if (dir.y > 0.3) {
            vec2 causticUV = dir.xz * 5.0;
            float caustic1 = sin(causticUV.x * 3.0 + t * 2.0) * sin(causticUV.y * 3.0 + t * 1.5);
            float caustic2 = sin(causticUV.x * 5.0 - t * 1.8) * sin(causticUV.y * 4.0 + t * 2.2);
            float caustic = (caustic1 + caustic2) * 0.25 + 0.5;
            caustic *= smoothstep(0.3, 0.8, dir.y);
            color += vec3(0.05, 0.15, 0.2) * caustic * 0.5;
          }

          // Bioluminescent particles (static positions)
          for (float i = 0.0; i < 3.0; i++) {
            vec3 particleSpace = dir * (20.0 + i * 15.0);
            vec3 cell = floor(particleSpace);

            for (int dx = -1; dx <= 1; dx++) {
              for (int dy = -1; dy <= 1; dy++) {
                for (int dz = -1; dz <= 1; dz++) {
                  vec3 neighbor = cell + vec3(float(dx), float(dy), float(dz));
                  float h = hash(neighbor);

                  vec3 drift = vec3(
                    sin(t * 0.5 + h * 6.28) * 0.3,
                    sin(t * 0.3 + h * 3.14) * 0.2 + t * 0.1,
                    cos(t * 0.4 + h * 4.0) * 0.3
                  );
                  vec3 particlePos = neighbor + vec3(h, hash(neighbor + 100.0), hash(neighbor + 200.0)) + drift;
                  float d = length(particleSpace - particlePos);

                  float pulse = 0.5 + 0.5 * sin(t * (2.0 + h * 3.0) + h * 6.28);
                  float glow = smoothstep(0.5, 0.0, d) * pulse;

                  vec3 bioColor;
                  if (h < 0.6) bioColor = vec3(0.0, 0.8, 1.0);
                  else if (h < 0.85) bioColor = vec3(0.2, 0.5, 1.0);
                  else if (h < 0.95) bioColor = vec3(0.0, 1.0, 0.5);
                  else bioColor = vec3(1.0, 0.2, 0.3);

                  color += bioColor * glow * 0.15;
                }
              }
            }
          }

          // Larger jellyfish-like creatures (static)
          for (float j = 0.0; j < 2.0; j++) {
            vec3 jellySpace = dir * (8.0 + j * 5.0);
            float jh = hash(vec3(j * 100.0));
            vec3 jellyPos = vec3(
              sin(t * 0.2 + jh * 6.28) * 3.0,
              sin(t * 0.15 + jh * 3.14) * 2.0,
              cos(t * 0.18 + jh * 4.0) * 3.0
            );
            float jd = length(jellySpace - jellyPos);
            float jellyGlow = smoothstep(2.0, 0.0, jd) * (0.5 + 0.5 * sin(t * 1.5 + jh * 6.28));
            color += vec3(0.3, 0.6, 1.0) * jellyGlow * 0.3;
          }

          float murk = noise(dir * 10.0 + t * 0.5) * 0.03;
          color += vec3(0.02, 0.04, 0.05) * murk;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticCrystalCaveEnvironment - Frozen crystal cave snapshot
 */
export function StaticCrystalCaveEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 10.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float hash3(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        float crystal(vec3 p, vec3 dir, float size) {
          vec3 d = p - dir * dot(p, dir);
          float dist = length(d);
          float height = dot(p, dir);
          float taper = 1.0 - smoothstep(0.0, size, abs(height));
          return smoothstep(size * 0.3 * taper, 0.0, dist);
        }

        void main() {
          vec3 dir = normalize(vPosition);
          float t = time * 0.1;

          vec3 color = vec3(0.03, 0.02, 0.04);

          float crystalGlow = 0.0;
          vec3 crystalColor = vec3(0.0);

          for (float i = 0.0; i < 12.0; i++) {
            float angle1 = hash(vec2(i, 0.0)) * 6.28;
            float angle2 = hash(vec2(i, 1.0)) * 3.14 - 1.57;
            vec3 crystalDir = vec3(
              cos(angle1) * cos(angle2),
              sin(angle2),
              sin(angle1) * cos(angle2)
            );

            float size = 0.3 + hash(vec2(i, 2.0)) * 0.4;
            float offset = hash(vec2(i, 3.0)) * 0.5;

            vec3 crystalPos = crystalDir * (0.7 + offset);
            float c = crystal(dir - crystalPos * 0.3, crystalDir, size);

            vec3 cColor;
            float colorSeed = hash(vec2(i, 4.0));
            if (colorSeed < 0.5) cColor = vec3(1.0, 0.9, 0.7);
            else if (colorSeed < 0.8) cColor = vec3(0.9, 0.7, 0.4);
            else cColor = vec3(0.7, 0.85, 1.0);

            float pulse = 0.6 + 0.4 * sin(t * (1.0 + hash(vec2(i, 5.0))) + i);

            crystalGlow += c * pulse;
            crystalColor += cColor * c * pulse;
          }

          if (crystalGlow > 0.01) {
            crystalColor /= crystalGlow;
            color += crystalColor * min(crystalGlow, 1.0) * 0.6;
            color += vec3(1.0, 0.95, 0.9) * pow(min(crystalGlow, 1.0), 3.0) * 0.4;
          }

          float rays = 0.0;
          for (float r = 0.0; r < 5.0; r++) {
            float rayAngle = r * 1.256 + t * 0.2;
            vec3 rayDir = vec3(cos(rayAngle), sin(rayAngle) * 0.5, sin(rayAngle));
            float rayDot = max(0.0, dot(dir, normalize(rayDir)));
            rays += pow(rayDot, 20.0) * 0.15;
          }
          color += vec3(1.0, 0.9, 0.7) * rays;

          // Sparkles (static)
          vec3 sparkleSpace = dir * 100.0;
          vec3 sparkleCell = floor(sparkleSpace);
          float sparkle = 0.0;
          for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
              for (int dz = -1; dz <= 1; dz++) {
                vec3 neighbor = sparkleCell + vec3(float(dx), float(dy), float(dz));
                vec3 sparklePos = neighbor + vec3(hash3(neighbor), hash3(neighbor + 100.0), hash3(neighbor + 200.0));
                float d = length(sparkleSpace - sparklePos);
                float twinkle = pow(0.5 + 0.5 * sin(t * 5.0 + hash3(neighbor) * 20.0), 4.0);
                sparkle += smoothstep(0.1, 0.0, d) * twinkle;
              }
            }
          }
          color += vec3(1.0, 0.98, 0.95) * sparkle * 0.8;

          float ambient = 0.5 + 0.5 * dir.y;
          color += vec3(0.05, 0.03, 0.02) * ambient;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticBambooForestEnvironment - Frozen bamboo forest snapshot
 */
export function StaticBambooForestEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 6.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;

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

        void main() {
          vec3 dir = normalize(vPosition);
          float t = time * 0.3;

          float zenith = max(0.0, dir.y);
          vec3 skyBlue = vec3(0.4, 0.6, 0.9);
          vec3 skyWhite = vec3(0.85, 0.9, 0.95);
          vec3 sky = mix(skyBlue, skyWhite, pow(zenith, 0.5));

          vec3 color = vec3(0.1, 0.15, 0.08);

          float angle = atan(dir.x, dir.z);
          float bambooPattern = 0.0;

          for (float i = 0.0; i < 30.0; i++) {
            float bambooAngle = (i / 30.0) * 6.28 + hash(vec2(i, 0.0)) * 0.2;
            float angleDiff = abs(mod(angle - bambooAngle + 3.14, 6.28) - 3.14);

            float width = 0.015 + hash(vec2(i, 1.0)) * 0.02;
            float dist = 0.5 + hash(vec2(i, 2.0)) * 0.5;
            width *= dist;

            float stalk = smoothstep(width, width * 0.3, angleDiff);

            float segmentHeight = 0.15 + hash(vec2(i, 3.0)) * 0.1;
            float segments = mod(dir.y * 5.0 + hash(vec2(i, 4.0)) * 2.0, segmentHeight);
            float node = smoothstep(0.01, 0.005, abs(segments - segmentHeight * 0.5));

            vec3 bambooColor = mix(
              vec3(0.3, 0.5, 0.15),
              vec3(0.15, 0.35, 0.1),
              hash(vec2(i, 5.0))
            );
            bambooColor = mix(bambooColor, bambooColor * 0.7, node);

            float visibility = dist;

            if (stalk > 0.01 && abs(dir.y) < 0.85) {
              color = mix(color, bambooColor, stalk * visibility);
            }

            bambooPattern += stalk * visibility;
          }

          if (dir.y > 0.3) {
            float leafNoise = noise(vec2(angle * 10.0, dir.y * 5.0) + t * 0.5);
            leafNoise += noise(vec2(angle * 20.0, dir.y * 10.0) + t * 0.3) * 0.5;
            float canopy = smoothstep(0.3, 0.7, dir.y) * leafNoise;

            vec3 leafColor = mix(vec3(0.2, 0.4, 0.1), vec3(0.3, 0.5, 0.15), leafNoise);
            color = mix(color, leafColor, canopy * 0.8);

            float gaps = smoothstep(0.4, 0.6, leafNoise);
            color = mix(color, sky * 0.6, gaps * smoothstep(0.5, 0.9, dir.y) * 0.5);
          }

          // Dappled sunlight (static)
          float sunAngle = t * 0.1;
          vec3 sunDir = normalize(vec3(cos(sunAngle), 0.8, sin(sunAngle)));
          float sunDot = max(0.0, dot(dir, sunDir));

          float rays = pow(sunDot, 50.0) * 0.8;
          rays += pow(sunDot, 10.0) * 0.3;

          float lightPatch = noise(vec2(angle * 5.0 + t * 0.5, dir.y * 3.0));
          lightPatch = smoothstep(0.5, 0.7, lightPatch) * smoothstep(-0.5, 0.3, dir.y);

          vec3 sunlight = vec3(1.0, 0.95, 0.8);
          color += sunlight * (rays + lightPatch * 0.3) * (1.0 - bambooPattern * 0.5);

          if (dir.y < -0.3) {
            float fog = smoothstep(-0.3, -0.8, dir.y);
            vec3 fogColor = vec3(0.2, 0.25, 0.2);
            color = mix(color, fogColor, fog * 0.7);
          }

          color = mix(color, vec3(0.25, 0.3, 0.22), 0.15);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticVolcanicEnvironment - Frozen volcanic caldera snapshot
 */
export function StaticVolcanicEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 9.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float hash3(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
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
          float f = 0.0;
          f += 0.5 * noise(p); p *= 2.01;
          f += 0.25 * noise(p); p *= 2.02;
          f += 0.125 * noise(p);
          return f;
        }

        void main() {
          vec3 dir = normalize(vPosition);
          float t = time * 0.2;

          float zenith = dir.y * 0.5 + 0.5;
          vec3 skyDark = vec3(0.05, 0.02, 0.02);
          vec3 skyGlow = vec3(0.15, 0.05, 0.02);
          vec3 color = mix(skyGlow, skyDark, pow(zenith, 0.7));

          vec2 smokeUV = vec2(atan(dir.x, dir.z) * 2.0, dir.y * 2.0);
          float smoke = fbm(smokeUV * 3.0 + vec2(t * 0.3, t * 0.5));
          smoke *= smoothstep(-0.2, 0.5, dir.y);
          color += vec3(0.08, 0.06, 0.05) * smoke;

          float angle = atan(dir.x, dir.z);
          float rockHeight = -0.2 + sin(angle * 5.0) * 0.15 + sin(angle * 13.0) * 0.08;
          rockHeight += fbm(vec2(angle * 3.0, 0.0)) * 0.2;

          if (dir.y < rockHeight + 0.3) {
            float rockBlend = smoothstep(rockHeight + 0.3, rockHeight, dir.y);
            vec3 rockColor = vec3(0.08, 0.05, 0.04);

            float rockTex = fbm(vec2(angle * 10.0, dir.y * 10.0));
            rockColor = mix(rockColor, vec3(0.12, 0.08, 0.06), rockTex);

            float cracks = smoothstep(0.55, 0.6, noise(vec2(angle * 20.0, dir.y * 15.0) + t * 0.1));
            vec3 hotColor = vec3(1.0, 0.3, 0.0);
            rockColor = mix(rockColor, hotColor, cracks * 0.8);

            color = mix(color, rockColor, rockBlend);
          }

          if (dir.y < -0.4) {
            float lavaDepth = smoothstep(-0.4, -0.9, dir.y);
            vec2 lavaUV = vec2(atan(dir.x, dir.z), dir.y * 2.0);

            float lavaFlow = fbm(lavaUV * 4.0 + vec2(t * 0.5, t * 0.3));
            float lavaFlow2 = fbm(lavaUV * 6.0 - vec2(t * 0.3, t * 0.4));
            float lavaMix = lavaFlow * 0.6 + lavaFlow2 * 0.4;

            vec3 lavaHot = vec3(1.0, 0.8, 0.2);
            vec3 lavaMed = vec3(1.0, 0.4, 0.0);
            vec3 lavaCool = vec3(0.6, 0.1, 0.0);
            vec3 lavaCrust = vec3(0.15, 0.05, 0.02);

            vec3 lavaColor = mix(lavaCrust, lavaCool, smoothstep(0.3, 0.5, lavaMix));
            lavaColor = mix(lavaColor, lavaMed, smoothstep(0.5, 0.7, lavaMix));
            lavaColor = mix(lavaColor, lavaHot, smoothstep(0.7, 0.9, lavaMix));

            float bubbles = smoothstep(0.8, 0.85, noise(lavaUV * 15.0 + t * 2.0));
            lavaColor += vec3(0.3, 0.2, 0.0) * bubbles;

            color = mix(color, lavaColor, lavaDepth);
            color += vec3(0.3, 0.1, 0.0) * (1.0 - lavaDepth) * 0.5;
          }

          // Static embers (no animation loop)
          for (float i = 0.0; i < 4.0; i++) {
            vec3 emberSpace = dir * (15.0 + i * 8.0);
            vec3 cell = floor(emberSpace);
            for (int dx = -1; dx <= 1; dx++) {
              for (int dy = -1; dy <= 1; dy++) {
                for (int dz = -1; dz <= 1; dz++) {
                  vec3 neighbor = cell + vec3(float(dx), float(dy), float(dz));
                  float h = hash3(neighbor);
                  vec3 rise = vec3(
                    sin(t * 2.0 + h * 6.28) * 0.5,
                    mod(t * (0.5 + h * 0.5) + h * 10.0, 3.0) - 1.5,
                    cos(t * 1.5 + h * 4.0) * 0.5
                  );
                  vec3 emberPos = neighbor + vec3(h, hash3(neighbor + 100.0), hash3(neighbor + 200.0)) + rise;
                  float d = length(emberSpace - emberPos);
                  float flicker = 0.5 + 0.5 * sin(t * 10.0 + h * 30.0);
                  float ember = smoothstep(0.3, 0.0, d) * flicker;
                  vec3 emberColor = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.2, 0.0), h);
                  color += emberColor * ember * 0.4;
                }
              }
            }
          }

          color += vec3(0.08, 0.02, 0.0);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticNebulaSkyEnvironment - Frozen nebula snapshot
 */
export function StaticNebulaSkyEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 20.0 },
        pulseIntensity: { value: 0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: `
        uniform float time;
        uniform float pulseIntensity;
        varying vec3 vPosition;
        varying vec2 vUv;

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

          vec3 np1 = dir * 2.0 + vec3(t, t * 0.7, t * 0.3);
          vec3 np2 = dir * 3.5 + vec3(-t * 0.5, t * 0.4, -t * 0.6);
          vec3 np3 = dir * 1.5 + vec3(t * 0.3, -t * 0.2, t * 0.8);

          float n1 = fbm(np1) * 0.5 + 0.5;
          float n2 = fbm(np2) * 0.5 + 0.5;
          float n3 = fbm(np3) * 0.5 + 0.5;

          vec3 magenta = vec3(0.6, 0.05, 0.3);
          vec3 teal = vec3(0.0, 0.3, 0.4);
          vec3 purple = vec3(0.2, 0.05, 0.4);
          vec3 orange = vec3(0.5, 0.15, 0.0);

          vec3 nebula = vec3(0.0);
          nebula += magenta * n1 * 0.4;
          nebula += teal * n2 * 0.3;
          nebula += purple * pow(n3, 2.0) * 0.5;
          nebula += orange * pow(n1 * n2, 2.0) * 0.3;

          vec3 color = vec3(0.005, 0.0, 0.015);
          color += nebula;

          // Stars (static twinkle)
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

          float core = pow(max(0.0, n1 * n2), 3.0);
          color += vec3(0.8, 0.6, 0.9) * core * 0.2;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

/**
 * StaticBlackHoleEnvironment - Frozen black hole snapshot
 */
export function StaticBlackHoleEnvironment() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: { value: 7.0 },
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

        void main() {
          vec3 dir = normalize(vPosition);

          // Black hole center
          float centerDist = length(dir.xz);
          float blackHoleSize = 0.15;

          // Accretion disk
          float diskAngle = atan(dir.x, dir.z);
          float diskRadius = centerDist;
          float diskHeight = abs(dir.y);

          // Background stars
          vec3 color = vec3(0.0);
          vec3 sp = dir * 80.0;
          vec3 cell = floor(sp);
          for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
              for (int dz = -1; dz <= 1; dz++) {
                vec3 neighbor = cell + vec3(float(dx), float(dy), float(dz));
                float h = hash(neighbor.xy + neighbor.z * 100.0);
                vec3 starPos = neighbor + vec3(h, hash(neighbor.yz + 50.0), hash(neighbor.xz + 80.0));
                float d = length(sp - starPos);
                float star = smoothstep(0.03, 0.0, d) * 0.8;
                color += vec3(0.9, 0.92, 1.0) * star;
              }
            }
          }

          // Gravitational lensing - warp stars near black hole
          float lensStrength = smoothstep(0.6, 0.2, centerDist) * 0.5;
          color *= (1.0 - lensStrength * 0.8);

          // Accretion disk glow
          if (diskHeight < 0.15) {
            float diskMask = smoothstep(0.15, 0.02, diskHeight);
            float innerRing = smoothstep(blackHoleSize, blackHoleSize + 0.1, diskRadius);
            float outerRing = smoothstep(0.7, 0.3, diskRadius);
            float disk = diskMask * innerRing * outerRing;

            // Disk color - hot orange/white in center, red at edges
            float diskNoise = noise(vec2(diskAngle * 5.0 + time * 0.3, diskRadius * 10.0));
            vec3 diskHot = vec3(1.0, 0.9, 0.7);
            vec3 diskWarm = vec3(1.0, 0.5, 0.1);
            vec3 diskCool = vec3(0.8, 0.15, 0.05);

            vec3 diskColor = mix(diskCool, diskWarm, smoothstep(0.5, 0.3, diskRadius));
            diskColor = mix(diskColor, diskHot, smoothstep(0.3, 0.18, diskRadius));
            diskColor *= (0.7 + diskNoise * 0.3);

            color += diskColor * disk * 1.5;
          }

          // Event horizon - pure black center
          float horizon = smoothstep(blackHoleSize + 0.02, blackHoleSize, centerDist);
          color *= (1.0 - horizon);

          // Photon ring - bright ring at event horizon
          float photonRing = smoothstep(blackHoleSize + 0.03, blackHoleSize + 0.01, centerDist) *
                            smoothstep(blackHoleSize - 0.01, blackHoleSize + 0.01, centerDist);
          color += vec3(1.0, 0.85, 0.6) * photonRing * 2.0;

          // Ambient glow around disk
          float halo = smoothstep(0.8, 0.1, centerDist) * smoothstep(0.0, 0.3, centerDist);
          color += vec3(0.15, 0.05, 0.02) * halo * 0.3;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
