import React, { useRef, useState } from 'react';
import { COLOR_SCHEMES } from '../../utils/colorSchemes.js';

const FACE_LABELS = { 1: 'Front', 2: 'Left', 3: 'Top', 4: 'Back', 5: 'Right', 6: 'Bottom' };

const SCHEME_LABELS = {
  standard: 'Standard',
  neon: 'Neon',
  pastel: 'Pastel',
  mono: 'Mono',
  custom: 'Custom',
};

const BG_OPTIONS = [
  { value: 'blackhole', label: 'Black Hole' },
  { value: 'starfield', label: 'Starfield' },
  { value: 'nebula', label: 'Nebula' },
  { value: 'dark', label: 'Dark' },
  { value: 'midnight', label: 'Midnight Blue' },
];

// Extract N dominant colors from an image using pixel sampling + median-cut-like bucketing
function extractColorsFromImage(img, count = 6) {
  const canvas = document.createElement('canvas');
  const size = 64; // downsample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  // Collect all pixels (skip very dark / very light)
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    if (brightness > 20 && brightness < 240) {
      pixels.push([r, g, b]);
    }
  }

  if (pixels.length < count) {
    // Not enough usable pixels, fall back to evenly spaced samples
    const fallback = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i / count) * data.length / 4) * 4;
      fallback.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
    return fallback.map(([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''));
  }

  // Simple k-means clustering
  // Initialize centroids by picking evenly spaced pixels
  let centroids = [];
  for (let i = 0; i < count; i++) {
    centroids.push([...pixels[Math.floor((i / count) * pixels.length)]]);
  }

  for (let iter = 0; iter < 10; iter++) {
    const clusters = Array.from({ length: count }, () => []);

    // Assign pixels to nearest centroid
    for (const px of pixels) {
      let minDist = Infinity, best = 0;
      for (let c = 0; c < count; c++) {
        const dr = px[0] - centroids[c][0];
        const dg = px[1] - centroids[c][1];
        const db = px[2] - centroids[c][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) { minDist = dist; best = c; }
      }
      clusters[best].push(px);
    }

    // Recompute centroids
    for (let c = 0; c < count; c++) {
      if (clusters[c].length === 0) continue;
      const sum = [0, 0, 0];
      for (const px of clusters[c]) {
        sum[0] += px[0]; sum[1] += px[1]; sum[2] += px[2];
      }
      centroids[c] = [
        Math.round(sum[0] / clusters[c].length),
        Math.round(sum[1] / clusters[c].length),
        Math.round(sum[2] / clusters[c].length),
      ];
    }
  }

  // Sort centroids by hue for a nicer palette order
  centroids.sort((a, b) => {
    const hueA = Math.atan2(Math.sqrt(3) * (a[1] - a[2]), 2 * a[0] - a[1] - a[2]);
    const hueB = Math.atan2(Math.sqrt(3) * (b[1] - b[2]), 2 * b[0] - b[1] - b[2]);
    return hueA - hueB;
  });

  return centroids.map(([r, g, b]) =>
    '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
  );
}

const SettingsMenu = ({ onClose, settings, onSettingsChange, faceImages = {}, onFaceImage }) => {
  const fileInputRef = useRef(null);
  const faceFileInputRefs = useRef({});
  const [imagePreview, setImagePreview] = useState(null);

  const update = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateCustomColor = (faceId, color) => {
    const current = settings.customColors || { ...COLOR_SCHEMES.standard };
    onSettingsChange({
      ...settings,
      colorScheme: 'custom',
      customColors: { ...current, [faceId]: color },
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      setImagePreview(url);
      const colors = extractColorsFromImage(img, 6);
      const customColors = {};
      colors.forEach((c, i) => { customColors[i + 1] = c; });
      onSettingsChange({
        ...settings,
        colorScheme: 'custom',
        customColors,
      });
    };
    img.src = url;
  };

  const handleFaceImageUpload = (faceId, e) => {
    const file = e.target.files?.[0];
    if (!file || !onFaceImage) return;
    const url = URL.createObjectURL(file);
    onFaceImage(faceId, url);
  };

  const resolvedColors = settings.colorScheme === 'custom' && settings.customColors
    ? { ...COLOR_SCHEMES.standard, ...settings.customColors }
    : COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.standard;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-body">
          {/* Color Scheme */}
          <section className="settings-section">
            <h3 className="settings-section-title">Color Scheme</h3>
            <div className="settings-radio-group">
              {Object.keys(SCHEME_LABELS).map(key => (
                <label key={key} className={`settings-radio${settings.colorScheme === key ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="colorScheme"
                    value={key}
                    checked={settings.colorScheme === key}
                    onChange={() => update('colorScheme', key)}
                  />
                  <span className="settings-radio-label">{SCHEME_LABELS[key]}</span>
                  {key !== 'custom' && (
                    <span className="scheme-preview">
                      {Object.values(COLOR_SCHEMES[key]).map((c, i) => (
                        <span key={i} className="scheme-dot" style={{ background: c }} />
                      ))}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* Custom Colors */}
          {settings.colorScheme === 'custom' && (
            <section className="settings-section">
              <h3 className="settings-section-title">Custom Colors</h3>

              {/* Image upload */}
              <div className="image-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  className="image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Extract from Image
                </button>
                {imagePreview && (
                  <div className="image-preview-row">
                    <img src={imagePreview} alt="Source" className="image-preview-thumb" />
                    <span className="scheme-preview">
                      {[1,2,3,4,5,6].map(i => (
                        <span key={i} className="scheme-dot" style={{ background: resolvedColors[i] }} />
                      ))}
                    </span>
                  </div>
                )}
              </div>

              <div className="color-picker-grid">
                {[1, 2, 3, 4, 5, 6].map(faceId => (
                  <div key={faceId} className="color-picker-item">
                    <input
                      type="color"
                      value={resolvedColors[faceId]}
                      onChange={e => updateCustomColor(faceId, e.target.value)}
                      className="color-input"
                    />
                    <span className="color-picker-label">{FACE_LABELS[faceId]}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Face Textures */}
          <section className="settings-section">
            <h3 className="settings-section-title">Face Textures</h3>
            <p className="settings-hint">Upload an image to map onto a cube face</p>
            <div className="face-texture-grid">
              {[1, 2, 3, 4, 5, 6].map(faceId => (
                <div key={faceId} className="face-texture-item">
                  <input
                    ref={el => faceFileInputRefs.current[faceId] = el}
                    type="file"
                    accept="image/*"
                    onChange={e => handleFaceImageUpload(faceId, e)}
                    style={{ display: 'none' }}
                  />
                  {faceImages[faceId] ? (
                    <div className="face-texture-preview" onClick={() => faceFileInputRefs.current[faceId]?.click()}>
                      <img src={faceImages[faceId]} alt={FACE_LABELS[faceId]} className="face-texture-thumb" />
                      <button
                        className="face-texture-remove"
                        onClick={e => { e.stopPropagation(); onFaceImage?.(faceId, null); }}
                      >&times;</button>
                    </div>
                  ) : (
                    <div
                      className="face-texture-upload"
                      style={{ borderColor: resolvedColors[faceId] + '66' }}
                      onClick={() => faceFileInputRefs.current[faceId]?.click()}
                    >
                      <span className="face-texture-plus">+</span>
                    </div>
                  )}
                  <span className="color-picker-label">{FACE_LABELS[faceId]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Background Theme */}
          <section className="settings-section">
            <h3 className="settings-section-title">Background</h3>
            <div className="settings-radio-group">
              {BG_OPTIONS.map(opt => (
                <label key={opt.value} className={`settings-radio${settings.backgroundTheme === opt.value ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="backgroundTheme"
                    value={opt.value}
                    checked={settings.backgroundTheme === opt.value}
                    onChange={() => update('backgroundTheme', opt.value)}
                  />
                  <span className="settings-radio-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* UI Layout Toggles */}
          <section className="settings-section">
            <h3 className="settings-section-title">UI Layout</h3>
            <div className="settings-toggles">
              {[
                { key: 'showStats', label: 'Stats Bar' },
                { key: 'showManifoldFooter', label: 'Manifold Footer' },
                { key: 'showFaceProgress', label: 'Face Progress Bars' },
              ].map(item => (
                <label key={item.key} className="settings-toggle-row">
                  <span className="toggle-label">{item.label}</span>
                  <div
                    className={`toggle-switch${settings[item.key] ? ' on' : ''}`}
                    onClick={() => update(item.key, !settings[item.key])}
                  >
                    <div className="toggle-knob" />
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
