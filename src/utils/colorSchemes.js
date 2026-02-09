// Color scheme presets and settings utilities

export const COLOR_SCHEMES = {
  standard: { 1: '#ef4444', 2: '#22c55e', 3: '#ffffff', 4: '#f97316', 5: '#3b82f6', 6: '#eab308' },
  neon:     { 1: '#ff0055', 2: '#00ff88', 3: '#ffffff', 4: '#ff6600', 5: '#0088ff', 6: '#ffee00' },
  pastel:   { 1: '#f9a8b8', 2: '#a8f0c8', 3: '#f0f0f0', 4: '#ffc89a', 5: '#a8c8f0', 6: '#f0e8a0' },
  mono:     { 1: '#e0e0e0', 2: '#a0a0a0', 3: '#ffffff', 4: '#808080', 5: '#606060', 6: '#404040' },
};

// Available tile styles per manifold
export const TILE_STYLES = {
  solid:       { label: 'Solid', cost: 'low', type: 'static' },
  glossy:      { label: 'Glossy', cost: 'low', type: 'static' },
  matte:       { label: 'Matte', cost: 'low', type: 'static' },
  metallic:    { label: 'Metallic', cost: 'low', type: 'static' },
  carbonFiber: { label: 'Carbon Fiber', cost: 'low', type: 'pattern' },
  hexGrid:     { label: 'Hexagon Grid', cost: 'low', type: 'procedural' },
  circuit:     { label: 'Circuit Board', cost: 'med', type: 'procedural' },
  holographic: { label: 'Holographic', cost: 'med', type: 'animated' },
  pulse:       { label: 'Pulse', cost: 'med', type: 'animated' },
  lava:        { label: 'Lava', cost: 'med', type: 'animated' },
  galaxy:      { label: 'Galaxy', cost: 'med', type: 'animated' },
  comic:       { label: 'Comic Book', cost: 'low', type: 'pattern' },
};

export const DEFAULT_SETTINGS = {
  colorScheme: 'standard',
  customColors: null,
  backgroundTheme: 'sunset',
  showStats: true,
  showManifoldFooter: true,
  showFaceProgress: true,
  // Per-manifold tile styles
  manifoldStyles: {
    1: 'solid', // Front (Red)
    2: 'solid', // Left (Green)
    3: 'solid', // Top (White)
    4: 'solid', // Back (Orange)
    5: 'solid', // Right (Blue)
    6: 'solid', // Bottom (Yellow)
  },
};

export function resolveColors(settings) {
  if (settings.colorScheme === 'custom' && settings.customColors) {
    return { ...COLOR_SCHEMES.standard, ...settings.customColors };
  }
  return COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.standard;
}
