// TileStyleMaterials.jsx - Shared shader materials for tile styles
// Uses GPU-based procedural textures to avoid memory overhead

import * as THREE from 'three';

// Shared time uniform updated by useFrame in parent
export const sharedUniforms = {
  time: { value: 0 },
};

// Update time uniform (call from useFrame)
export function updateSharedTime(elapsed) {
  sharedUniforms.time.value = elapsed;
}

// Common vertex shader for all styles
const baseVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Utility functions shared across shaders
const shaderUtils = `
  // Hash functions for procedural patterns
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  // Simplex-style noise
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

  // FBM for organic patterns
  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5 * noise(p); p *= 2.01;
    f += 0.25 * noise(p); p *= 2.02;
    f += 0.125 * noise(p); p *= 2.03;
    f += 0.0625 * noise(p);
    return f;
  }
`;

// Style-specific fragment shaders
const fragmentShaders = {
  // Solid - simple flat color
  solid: `
    uniform vec3 baseColor;
    varying vec2 vUv;

    void main() {
      gl_FragColor = vec4(baseColor, 1.0);
    }
  `,

  // Glossy - specular highlights
  glossy: `
    uniform vec3 baseColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fake specular highlight
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

      vec3 color = baseColor + vec3(spec * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Matte - soft diffuse
  matte: `
    uniform vec3 baseColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vec3 normal = normalize(vNormal);
      float diffuse = max(dot(normal, normalize(vec3(0.5, 1.0, 0.5))), 0.3);
      vec3 color = baseColor * (0.7 + diffuse * 0.3);
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Metallic - brushed metal with anisotropic highlight
  metallic: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    ${shaderUtils}

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Brushed metal streaks
      float brushed = noise(vUv * vec2(50.0, 5.0)) * 0.1;

      // Anisotropic-style highlight
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      float NdotL = max(dot(normal, lightDir), 0.0);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);

      vec3 color = baseColor * (0.6 + NdotL * 0.3) + brushed;
      color += vec3(spec * 0.8);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Carbon Fiber - woven pattern
  carbonFiber: `
    uniform vec3 baseColor;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 8.0;

      // Woven pattern
      float weave1 = step(0.5, fract(uv.x)) * step(0.5, fract(uv.y + 0.5 * floor(uv.x)));
      float weave2 = step(0.5, fract(uv.x + 0.5)) * step(0.5, fract(uv.y + 0.5 * floor(uv.x + 0.5)));
      float pattern = weave1 + weave2 * 0.5;

      vec3 darkColor = baseColor * 0.3;
      vec3 color = mix(darkColor, baseColor, pattern * 0.7 + 0.3);

      // Subtle sheen
      color += vec3(0.05) * (1.0 - abs(vUv.x - 0.5) * 2.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Hexagon Grid - honeycomb pattern
  hexGrid: `
    uniform vec3 baseColor;
    varying vec2 vUv;

    float hexDistance(vec2 p) {
      p = abs(p);
      return max(p.x * 0.866025 + p.y * 0.5, p.y);
    }

    void main() {
      vec2 uv = vUv * 6.0;

      // Hex grid
      vec2 r = vec2(1.0, 1.732);
      vec2 h = r * 0.5;
      vec2 a = mod(uv, r) - h;
      vec2 b = mod(uv - h, r) - h;
      vec2 gv = length(a) < length(b) ? a : b;

      float d = hexDistance(gv);
      float edge = smoothstep(0.4, 0.45, d);

      vec3 edgeColor = baseColor * 0.4;
      vec3 color = mix(baseColor, edgeColor, edge);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Circuit Board - tech traces
  circuit: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;

    ${shaderUtils}

    void main() {
      vec2 uv = vUv * 10.0;

      // Grid lines
      vec2 grid = abs(fract(uv) - 0.5);
      float lines = step(0.45, max(grid.x, grid.y));

      // Random traces
      vec2 cell = floor(uv);
      float r = hash(cell);
      float trace = 0.0;
      if (r > 0.7) {
        trace = step(0.4, grid.x) * step(grid.y, 0.1);
      } else if (r > 0.4) {
        trace = step(0.4, grid.y) * step(grid.x, 0.1);
      }

      // Solder points
      float point = 1.0 - smoothstep(0.0, 0.15, length(fract(uv) - 0.5));
      point *= step(0.8, hash(cell + 100.0));

      // Animated pulse along traces
      float pulse = sin(time * 3.0 + cell.x * 2.0 + cell.y * 3.0) * 0.5 + 0.5;

      vec3 traceColor = baseColor * 1.5;
      vec3 bgColor = baseColor * 0.3;
      vec3 color = bgColor;
      color = mix(color, baseColor * 0.6, lines);
      color = mix(color, traceColor, trace);
      color = mix(color, traceColor * (1.0 + pulse * 0.5), point);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Holographic - rainbow iridescence
  holographic: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // View-dependent color shift
      float fresnel = 1.0 - abs(dot(viewDir, normal));

      // Rainbow based on UV and time
      float hue = fract(vUv.x * 2.0 + vUv.y + time * 0.3);
      vec3 rainbow;
      rainbow.r = abs(hue * 6.0 - 3.0) - 1.0;
      rainbow.g = 2.0 - abs(hue * 6.0 - 2.0);
      rainbow.b = 2.0 - abs(hue * 6.0 - 4.0);
      rainbow = clamp(rainbow, 0.0, 1.0);

      // Blend base color with rainbow
      vec3 color = mix(baseColor, rainbow, fresnel * 0.6);

      // Sparkle
      float sparkle = pow(fresnel, 4.0) * 0.5;
      color += vec3(sparkle);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Pulse - animated brightness wave
  pulse: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;

    void main() {
      // Radial pulse from center
      float dist = length(vUv - 0.5) * 2.0;
      float wave = sin(dist * 10.0 - time * 4.0) * 0.5 + 0.5;
      wave *= 1.0 - dist; // Fade at edges

      vec3 color = baseColor * (0.7 + wave * 0.5);

      // Bright center
      float center = 1.0 - smoothstep(0.0, 0.3, dist);
      color += baseColor * center * 0.3 * (sin(time * 2.0) * 0.5 + 0.5);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Lava - molten flow
  lava: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;

    ${shaderUtils}

    void main() {
      vec2 uv = vUv * 3.0;

      // Flowing lava pattern
      float n1 = fbm(uv + time * 0.2);
      float n2 = fbm(uv * 2.0 - time * 0.15);
      float lava = n1 * n2;

      // Hot spots
      float hot = pow(lava, 2.0);

      // Color gradient: dark crust to bright lava
      vec3 crustColor = baseColor * 0.2;
      vec3 hotColor = baseColor * 1.5 + vec3(0.3, 0.1, 0.0);
      vec3 brightColor = vec3(1.0, 0.8, 0.3);

      vec3 color = mix(crustColor, hotColor, lava);
      color = mix(color, brightColor, hot * 0.5);

      // Cracks
      float crack = smoothstep(0.4, 0.45, n1);
      color = mix(color, brightColor, crack * 0.3);

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Galaxy - stars and nebula
  galaxy: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;

    ${shaderUtils}

    void main() {
      vec2 uv = vUv;

      // Nebula background
      float nebula = fbm(uv * 4.0 + time * 0.05);
      vec3 nebulaColor = baseColor * nebula * 0.5;

      // Stars
      vec2 starUv = uv * 20.0;
      vec2 starCell = floor(starUv);
      float stars = 0.0;

      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          vec2 cell = starCell + vec2(float(x), float(y));
          vec2 starPos = cell + vec2(hash(cell), hash(cell + 50.0));
          float d = length(starUv - starPos);
          float twinkle = sin(time * (2.0 + hash(cell) * 3.0) + hash(cell) * 6.28) * 0.3 + 0.7;
          stars += smoothstep(0.15, 0.0, d) * twinkle * step(0.85, hash(cell + 100.0));
        }
      }

      vec3 color = nebulaColor + vec3(stars);

      // Central glow
      float glow = 1.0 - length(uv - 0.5) * 1.5;
      color += baseColor * glow * 0.2;

      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Glass - translucent with Fresnel edge glow and specular highlights
  glass: `
    uniform vec3 baseColor;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel: more reflective (brighter) at glancing angles, more transparent head-on
      float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);

      // Multiple specular highlights simulating light refraction
      vec3 light1 = normalize(vec3(1.0, 1.0, 1.0));
      vec3 light2 = normalize(vec3(-0.5, 0.8, 0.3));
      vec3 half1 = normalize(light1 + viewDir);
      vec3 half2 = normalize(light2 + viewDir);
      float spec1 = pow(max(dot(normal, half1), 0.0), 64.0);
      float spec2 = pow(max(dot(normal, half2), 0.0), 48.0);

      // Subtle color dispersion at edges (chromatic aberration hint)
      vec3 tint = baseColor;
      tint.r += fresnel * 0.08;
      tint.b += fresnel * 0.05;

      // Base glass color: tinted and translucent
      vec3 color = tint * (0.5 + fresnel * 0.6);

      // Add specular highlights (white glints like real glass)
      color += vec3(spec1 * 0.9 + spec2 * 0.4);

      // Bright edge rim like light catching glass edges
      float edgeX = smoothstep(0.0, 0.08, min(vUv.x, 1.0 - vUv.x));
      float edgeY = smoothstep(0.0, 0.08, min(vUv.y, 1.0 - vUv.y));
      float edgeFactor = 1.0 - edgeX * edgeY;
      color += vec3(edgeFactor * 0.6) * (baseColor * 0.5 + 0.5);

      // Alpha: more transparent in center, less at edges (Fresnel)
      float alpha = 0.25 + fresnel * 0.45 + edgeFactor * 0.3;

      gl_FragColor = vec4(color, alpha);
    }
  `,

  // Comic Book - bold outlines and halftone
  comic: `
    uniform vec3 baseColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vec3 normal = normalize(vNormal);
      float light = max(dot(normal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);

      // Halftone dots for shading
      vec2 uv = vUv * 20.0;
      float dot = length(fract(uv) - 0.5);
      float halftone = step(dot, 0.3 * (1.0 - light));

      vec3 color = baseColor;
      color = mix(color, baseColor * 0.5, halftone);

      // Edge darkening (fake outline)
      float edge = smoothstep(0.0, 0.1, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
      color *= edge * 0.3 + 0.7;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Cache for created materials (key: style_colorHex)
const materialCache = new Map();

/**
 * Get or create a shader material for a tile style
 * Materials are cached and shared across tiles with the same style+color
 */
export function getTileStyleMaterial(style, colorHex, useTexture = false, texture = null) {
  // If using a texture, return standard material
  if (useTexture && texture) {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: '#ffffff',
      metalness: 0.1,
      roughness: 0.8,
    });
  }

  // Validate inputs
  const safeStyle = style || 'solid';
  const safeColorHex = colorHex || '#888888';

  // Don't cache materials - color schemes can change dynamically
  // Creating new materials is fine since Three.js handles GPU resources efficiently
  const fragmentShader = fragmentShaders[safeStyle] || fragmentShaders.solid;

  let color;
  try {
    color = new THREE.Color(safeColorHex);
  } catch (_e) {
    console.warn('Invalid color:', safeColorHex, '- using fallback');
    color = new THREE.Color('#888888');
  }

  const isGlass = safeStyle === 'glass';

  const material = new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: color },
      time: sharedUniforms.time,
    },
    vertexShader: baseVertexShader,
    fragmentShader: fragmentShader,
    side: isGlass ? THREE.DoubleSide : THREE.FrontSide,
    transparent: isGlass,
    depthWrite: !isGlass,
    blending: isGlass ? THREE.NormalBlending : THREE.NormalBlending,
  });

  return material;
}

/**
 * Get a glass material for the glass visual mode.
 * This is a convenience wrapper that always returns a transparent glass shader.
 */
export function getGlassMaterial(colorHex) {
  return getTileStyleMaterial('glass', colorHex);
}

/**
 * Clear material cache (call on settings change)
 */
export function clearMaterialCache() {
  materialCache.forEach(mat => mat.dispose());
  materialCache.clear();
}

/**
 * Check if a style needs time updates (animated)
 */
export function isAnimatedStyle(style) {
  const animated = ['holographic', 'pulse', 'lava', 'galaxy', 'circuit'];
  return animated.includes(style);
}
