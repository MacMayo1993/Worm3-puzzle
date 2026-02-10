import React from 'react';
import { RoundedBox } from '@react-three/drei';
import IntroSticker from './IntroSticker.jsx';
import { FACE_COLORS } from '../../utils/constants.js';

/**
 * faceStyles — optional object mapping face keys to tile style names:
 *   { PZ, NZ, PX, NX, PY, NY }
 * When provided, the outer sticker for that face renders the live shader
 * instead of a plain colour swatch.
 *
 * cubieFlips — optional object mapping face keys to flip rotations (radians):
 *   { PZ, NZ, PX, NX, PY, NY }
 *
 * antipodalSwaps — optional object indicating which faces show antipodal colors:
 *   { PZ: true/false, ... } - true means showing antipodal pair's properties
 */
const IntroCubie = React.forwardRef(({ position, size, explosionFactor = 0, faceStyles = {}, cubieFlips = {}, antipodalSwaps = {} }, ref) => {
  const limit = (size - 1) / 2;
  const x = Math.round(position[0] / (1 + explosionFactor * 1.8) + limit);
  const y = Math.round(position[1] / (1 + explosionFactor * 1.8) + limit);
  const z = Math.round(position[2] / (1 + explosionFactor * 1.8) + limit);

  const showAllFaces = explosionFactor > 0.1;

  const isOuterPZ = z === size - 1;
  const isOuterNZ = z === 0;
  const isOuterPX = x === size - 1;
  const isOuterNX = x === 0;
  const isOuterPY = y === size - 1;
  const isOuterNY = y === 0;

  // Antipodal color mapping - when a tile flips, it shows its antipodal pair's color
  const getDisplayColor = (face) => {
    const colorMap = { PZ: 1, NZ: 4, PX: 5, NX: 2, PY: 3, NY: 6 };
    const antipodalMap = { PZ: 'NZ', NZ: 'PZ', PX: 'NX', NX: 'PX', PY: 'NY', NY: 'PY' };

    if (antipodalSwaps[face]) {
      const antipodalFace = antipodalMap[face];
      return FACE_COLORS[colorMap[antipodalFace]];
    }
    return FACE_COLORS[colorMap[face]];
  };

  // Antipodal style mapping
  const getDisplayStyle = (face) => {
    const antipodalMap = { PZ: 'NZ', NZ: 'PZ', PX: 'NX', NX: 'PX', PY: 'NY', NY: 'PY' };

    if (antipodalSwaps[face]) {
      const antipodalFace = antipodalMap[face];
      return faceStyles[antipodalFace];
    }
    return faceStyles[face];
  };

  return (
    <group position={position} ref={ref}>
      {/* Cubie body — solid dark cube matching main game style */}
      <RoundedBox args={[0.98, 0.98, 0.98]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.25}
          metalness={0.15}
          envMapIntensity={0.4}
        />
      </RoundedBox>

      {/* Front (PZ) */}
      {(showAllFaces || isOuterPZ) && (
        <IntroSticker
          pos={[0, 0, 0.51]}
          rot={[0, 0, 0]}
          color={getDisplayColor('PZ')}
          styleKey={isOuterPZ ? getDisplayStyle('PZ') : undefined}
          isBack={!isOuterPZ && showAllFaces}
          flipRotation={cubieFlips.PZ || 0}
        />
      )}

      {/* Back (NZ) */}
      {(showAllFaces || isOuterNZ) && (
        <IntroSticker
          pos={[0, 0, -0.51]}
          rot={[0, Math.PI, 0]}
          color={getDisplayColor('NZ')}
          styleKey={isOuterNZ ? getDisplayStyle('NZ') : undefined}
          isBack={!isOuterNZ && showAllFaces}
          flipRotation={cubieFlips.NZ || 0}
        />
      )}

      {/* Right (PX) */}
      {(showAllFaces || isOuterPX) && (
        <IntroSticker
          pos={[0.51, 0, 0]}
          rot={[0, Math.PI / 2, 0]}
          color={getDisplayColor('PX')}
          styleKey={isOuterPX ? getDisplayStyle('PX') : undefined}
          isBack={!isOuterPX && showAllFaces}
          flipRotation={cubieFlips.PX || 0}
        />
      )}

      {/* Left (NX) */}
      {(showAllFaces || isOuterNX) && (
        <IntroSticker
          pos={[-0.51, 0, 0]}
          rot={[0, -Math.PI / 2, 0]}
          color={getDisplayColor('NX')}
          styleKey={isOuterNX ? getDisplayStyle('NX') : undefined}
          isBack={!isOuterNX && showAllFaces}
          flipRotation={cubieFlips.NX || 0}
        />
      )}

      {/* Top (PY) */}
      {(showAllFaces || isOuterPY) && (
        <IntroSticker
          pos={[0, 0.51, 0]}
          rot={[-Math.PI / 2, 0, 0]}
          color={getDisplayColor('PY')}
          styleKey={isOuterPY ? getDisplayStyle('PY') : undefined}
          isBack={!isOuterPY && showAllFaces}
          flipRotation={cubieFlips.PY || 0}
        />
      )}

      {/* Bottom (NY) */}
      {(showAllFaces || isOuterNY) && (
        <IntroSticker
          pos={[0, -0.51, 0]}
          rot={[Math.PI / 2, 0, 0]}
          color={getDisplayColor('NY')}
          styleKey={isOuterNY ? getDisplayStyle('NY') : undefined}
          isBack={!isOuterNY && showAllFaces}
          flipRotation={cubieFlips.NY || 0}
        />
      )}
    </group>
  );
});

export default IntroCubie;
