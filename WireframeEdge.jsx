import React from 'react';
import { Line } from '@react-three/drei';

// Removed per-edge useFrame callback. At 5x5 wireframe mode there are ~3,000 edges,
// each registering its own useFrame was the single biggest performance killer.
// The pulse effect is now a static opacity which looks nearly identical.
const WireframeEdge = ({ start, end, color, intensity = 1, pulsePhase = 0 }) => {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={2.5}
      transparent
      opacity={intensity * 0.85}
    />
  );
};

export default React.memo(WireframeEdge);
