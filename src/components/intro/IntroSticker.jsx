import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getTileStyleMaterial } from '../../3d/TileStyleMaterials.jsx';

// Module-level cache so all cubies sharing the same style+color reuse one material
const _matCache = new Map();
function getCachedMat(styleKey, colorHex) {
  const key = `${styleKey}__${colorHex}`;
  if (!_matCache.has(key)) {
    const mat = getTileStyleMaterial(styleKey, colorHex);
    mat.side = THREE.FrontSide;
    _matCache.set(key, mat);
  }
  return _matCache.get(key);
}

/**
 * IntroSticker — a single coloured tile sticker on a cubie face.
 *
 * When `styleKey` is supplied the sticker renders the live shader material
 * for that tile style (lava, galaxy, neural, …). Otherwise it falls back to
 * a plain meshStandardMaterial.
 */
const IntroSticker = ({ pos, rot, color, styleKey, isBack = false }) => {
  const shaderMat = useMemo(() => {
    // Inner (back) faces stay plain so they don't burn GPU for invisible geometry
    if (!styleKey || isBack) return null;
    return getCachedMat(styleKey, color);
  }, [styleKey, color, isBack]);

  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[0.82, 0.82]} />
      {shaderMat ? (
        <primitive object={shaderMat} attach="material" />
      ) : (
        <meshStandardMaterial
          color={color}
          roughness={isBack ? 0.5 : 0.2}
          metalness={isBack ? 0.05 : 0}
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={isBack ? 0.06 : 0.12}
          transparent={isBack}
          opacity={isBack ? 0.80 : 1}
        />
      )}
    </mesh>
  );
};

export default IntroSticker;
