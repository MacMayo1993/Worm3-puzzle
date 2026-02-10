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
 */
const IntroCubie = React.forwardRef(({ position, size, explosionFactor = 0, faceStyles = {}, cubieFlips = {} }, ref) => {
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

  return (
    <group position={position} ref={ref}>
      {/* Cubie body — sleek dark with subtle metallic sheen */}
      <RoundedBox args={[0.98, 0.98, 0.98]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.45} />
      </RoundedBox>

      {/* Front (PZ) */}
      {(showAllFaces || isOuterPZ) && (
        <IntroSticker
          pos={[0, 0, 0.51]}
          rot={[0, 0, 0]}
          color={FACE_COLORS[1]}
          styleKey={isOuterPZ ? faceStyles.PZ : undefined}
          isBack={!isOuterPZ && showAllFaces}
          flipRotation={cubieFlips.PZ || 0}
        />
      )}

      {/* Back (NZ) */}
      {(showAllFaces || isOuterNZ) && (
        <IntroSticker
          pos={[0, 0, -0.51]}
          rot={[0, Math.PI, 0]}
          color={FACE_COLORS[4]}
          styleKey={isOuterNZ ? faceStyles.NZ : undefined}
          isBack={!isOuterNZ && showAllFaces}
          flipRotation={cubieFlips.NZ || 0}
        />
      )}

      {/* Right (PX) */}
      {(showAllFaces || isOuterPX) && (
        <IntroSticker
          pos={[0.51, 0, 0]}
          rot={[0, Math.PI / 2, 0]}
          color={FACE_COLORS[5]}
          styleKey={isOuterPX ? faceStyles.PX : undefined}
          isBack={!isOuterPX && showAllFaces}
          flipRotation={cubieFlips.PX || 0}
        />
      )}

      {/* Left (NX) */}
      {(showAllFaces || isOuterNX) && (
        <IntroSticker
          pos={[-0.51, 0, 0]}
          rot={[0, -Math.PI / 2, 0]}
          color={FACE_COLORS[2]}
          styleKey={isOuterNX ? faceStyles.NX : undefined}
          isBack={!isOuterNX && showAllFaces}
          flipRotation={cubieFlips.NX || 0}
        />
      )}

      {/* Top (PY) */}
      {(showAllFaces || isOuterPY) && (
        <IntroSticker
          pos={[0, 0.51, 0]}
          rot={[-Math.PI / 2, 0, 0]}
          color={FACE_COLORS[3]}
          styleKey={isOuterPY ? faceStyles.PY : undefined}
          isBack={!isOuterPY && showAllFaces}
          flipRotation={cubieFlips.PY || 0}
        />
      )}

      {/* Bottom (NY) */}
      {(showAllFaces || isOuterNY) && (
        <IntroSticker
          pos={[0, -0.51, 0]}
          rot={[Math.PI / 2, 0, 0]}
          color={FACE_COLORS[6]}
          styleKey={isOuterNY ? faceStyles.NY : undefined}
          isBack={!isOuterNY && showAllFaces}
          flipRotation={cubieFlips.NY || 0}
        />
      )}
    </group>
  );
});

export default IntroCubie;
