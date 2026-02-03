// Color scheme presets and settings utilities

export const COLOR_SCHEMES = {
  standard: { 1: '#ef4444', 2: '#22c55e', 3: '#ffffff', 4: '#f97316', 5: '#3b82f6', 6: '#eab308' },
  neon:     { 1: '#ff0055', 2: '#00ff88', 3: '#ffffff', 4: '#ff6600', 5: '#0088ff', 6: '#ffee00' },
  pastel:   { 1: '#f9a8b8', 2: '#a8f0c8', 3: '#f0f0f0', 4: '#ffc89a', 5: '#a8c8f0', 6: '#f0e8a0' },
  mono:     { 1: '#e0e0e0', 2: '#a0a0a0', 3: '#ffffff', 4: '#808080', 5: '#606060', 6: '#404040' },
};

export const DEFAULT_SETTINGS = {
  colorScheme: 'standard',
  customColors: null,
  backgroundTheme: 'blackhole',
  showStats: true,
  showManifoldFooter: true,
  showFaceProgress: true,
};

export function resolveColors(settings) {
  if (settings.colorScheme === 'custom' && settings.customColors) {
    return { ...COLOR_SCHEMES.standard, ...settings.customColors };
  }
  return COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.standard;
}
