// src/utils/constants.js
// Core game constants and color mappings

export const COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  white: '#ffffff',
  orange: '#f97316',
  green: '#22c55e',
  black: '#121212',
  wormhole: '#dda15e'
};

// Map face ID (1-6) to color
export const FACE_COLORS = {
  1: COLORS.red,      // PZ - Front (Red)
  2: COLORS.green,    // NX - Left (Green)
  3: COLORS.white,    // PY - Top (White)
  4: COLORS.orange,   // NZ - Back (Orange)
  5: COLORS.blue,     // PX - Right (Blue)
  6: COLORS.yellow    // NY - Bottom (Yellow)
};

// Antipodal color mapping for projective plane topology
// Maps each face to its opposite face
export const ANTIPODAL_COLOR = {
  1: 4,  // Red (PZ) ↔ Orange (NZ)
  4: 1,
  2: 5,  // Green (NX) ↔ Blue (PX)
  5: 2,
  3: 6,  // White (PY) ↔ Yellow (NY)
  6: 3
};

// Direction key to vector mapping
export const DIR_TO_VEC = {
  PX: [1, 0, 0],    // Right (+X)
  NX: [-1, 0, 0],   // Left (-X)
  PY: [0, 1, 0],    // Top (+Y)
  NY: [0, -1, 0],   // Bottom (-Y)
  PZ: [0, 0, 1],    // Front (+Z)
  NZ: [0, 0, -1]    // Back (-Z)
};

// Convert vector to direction key
export const VEC_TO_DIR = (x, y, z) => {
  if (x === 1 && y === 0 && z === 0) return 'PX';
  if (x === -1 && y === 0 && z === 0) return 'NX';
  if (x === 0 && y === 1 && z === 0) return 'PY';
  if (x === 0 && y === -1 && z === 0) return 'NY';
  if (x === 0 && y === 0 && z === 1) return 'PZ';
  return 'NZ';
};

// Quality settings for shader and rendering performance
export const QUALITY_PRESETS = {
  low: {
    // Black hole shader settings
    starLayers: 2,              // Reduce from 4 to 2
    starSegments: 32,            // Reduce from 64 to 32
    backgroundSphereSegments: 32, // Reduce from 64 to 32
    enableNebulae: false,        // Disable nebulae
    enableLensing: false,        // Disable gravitational lensing
    enableAccretionDisk: false,  // Disable accretion disk
    enableHawkingRadiation: false, // Disable Hawking radiation
    // Tile shader settings
    disableAnimatedShaders: true, // Disable animated shader styles
    // Cube settings
    cubieSmoothnessSegments: 2,  // Reduce rounded box smoothness
    particlesPerFlip: 6,         // Reduce from 12 to 6
    // Worm settings
    wormGeometryDetail: 4,       // Low detail for worm geometry
  },
  medium: {
    // Black hole shader settings
    starLayers: 3,               // Medium star layers
    starSegments: 48,            // Medium segments
    backgroundSphereSegments: 48,
    enableNebulae: true,         // Enable nebulae
    enableLensing: true,         // Enable lensing
    enableAccretionDisk: false,  // Disable accretion disk (expensive)
    enableHawkingRadiation: false, // Disable Hawking radiation
    // Tile shader settings
    disableAnimatedShaders: false,
    // Cube settings
    cubieSmoothnessSegments: 4,  // Standard smoothness
    particlesPerFlip: 12,        // Standard particle count
    // Worm settings
    wormGeometryDetail: 6,       // Medium detail
  },
  high: {
    // Black hole shader settings
    starLayers: 4,               // All star layers
    starSegments: 64,            // High detail
    backgroundSphereSegments: 64,
    enableNebulae: true,
    enableLensing: true,
    enableAccretionDisk: true,
    enableHawkingRadiation: true,
    // Tile shader settings
    disableAnimatedShaders: false,
    // Cube settings
    cubieSmoothnessSegments: 4,
    particlesPerFlip: 12,
    // Worm settings
    wormGeometryDetail: 8,       // High detail
  }
};

// Default quality level (auto-detect based on device)
export const getDefaultQuality = () => {
  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Check if low-end device (heuristic)
  const isLowEnd = isMobile && dpr < 2;

  if (isLowEnd) return 'low';
  if (isMobile) return 'medium';
  return 'high';
};
