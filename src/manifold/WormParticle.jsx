import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

const WormParticle = ({ start, end, color1, color2, startTime, currentTime, onComplete }) => {
  const groupRef = useRef();
  const trailRef = useRef(); // For future trail mesh
  const duration = 1.8; // Slightly longer for smoother feel
  const trailLength = 20; // Particles for persistent trail

  // Enhanced progress with overshoot and bounce-back for organic feel
  const progress = useMemo(() => {
    if (currentTime < startTime) return 0;
    let elapsed = currentTime - startTime;
    if (elapsed >= duration) {
      if (onComplete && elapsed < duration + 0.2) onComplete();
      return 1;
    }
    let t = elapsed / duration;
    // Custom elastic ease-out for "wormy" whip/snap
    const c4 = (2 * Math.PI) / 3;
    const n = 0.5;
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) / n;
  }, [currentTime, startTime, duration, onComplete]);

  // Generate trail positions for a fading ribbon/tube effect
  const trailPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= trailLength; i++) {
      const trailProg = Math.max(0, (progress * trailLength - i) / trailLength);
      if (trailProg <= 0) continue;
      const vStart = new THREE.Vector3(...start);
      const vEnd = new THREE.Vector3(...end);
      const midPoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(vEnd, vStart).normalize();
      // Dynamic curve: S-curve with sine wiggle for worm-like undulation
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();
      const offset = right.multiplyScalar(Math.sin(trailProg * Math.PI * 4) * 0.15); // Wiggle!
      const control1 = midPoint.clone().add(offset.multiplyScalar(0.5));
      const control2 = midPoint.clone().sub(offset.multiplyScalar(0.5));
      const curve = new THREE.CubicBezierCurve3(vStart, control1, control2, vEnd);
      const point = curve.getPoint(trailProg);
      points.push(point);
    }
    return points;
  }, [start, end, progress]);

  // Head particle position (end of trail)
  const headPosition = trailPoints[trailPoints.length - 1]?.toArray() || [0, 0, 0];

  // Lerp color with hue shift for plasma effect
  const headColor = useMemo(() => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const mixed = new THREE.Color().lerpColors(c1, c2, progress);
    // Add dynamic hue shift + brightness pulse for energy feel
    mixed.offsetHSL(0.05 * Math.sin(currentTime * 5), 0, 0.1 * Math.sin(currentTime * 8));
    return mixed;
  }, [color1, color2, progress, currentTime]);

  const pulseScale = 1 + Math.sin(currentTime * 12 + progress * Math.PI * 2) * 0.25;
  const trailOpacity = 1 - progress * 0.3; // Fade trail head slightly

  if (progress >= 1) return null;

  return (
    <group ref={groupRef}>
      {/* Persistent fading trail as a tube */}
      {trailPoints.length > 1 && (
        <mesh ref={trailRef}>
          <tubeGeometry args={[trailPoints, 8, 0.08 * (1 - progress), 8, false]} /> {/* Tapered radius */}
          <meshStandardMaterial
            color={headColor.clone().multiplyScalar(0.8)}
            transparent
            opacity={0.6 * trailOpacity}
            emissive={headColor.clone().multiplyScalar(0.3)}
            emissiveIntensity={1.5 + Math.sin(currentTime * 3) * 0.5}
            roughness={0.1}
            metalness={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {/* Head: Larger, more detailed with inner core + outer corona */}
      <group position={headPosition}>
        {/* Corona glow (additive, flares outward) */}
        <mesh scale={[pulseScale * 2.2, pulseScale * 2.2, pulseScale * 1.8]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial
            color={headColor.clone().multiplyScalar(1.5)}
            transparent
            opacity={0.4 * pulseScale}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Main head body */}
        <mesh scale={[pulseScale * 1.3, pulseScale * 1.3, pulseScale * 1.3]}>
          <icosahedronGeometry args={[0.18, 1]} /> {/* More organic than sphere */}
          <meshStandardMaterial
            color={headColor}
            transparent
            opacity={0.95}
            emissive={headColor.clone().multiplyScalar(0.6)}
            emissiveIntensity={2}
            roughness={0.2}
            metalness={0.7}
            envMapIntensity={1.5} // Reacts to black-hole env
          />
        </mesh>
        
        {/* Inner core sparkle */}
        <mesh scale={[pulseScale * 0.6, pulseScale * 0.6, pulseScale * 0.6]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color={headColor.clone().multiplyScalar(3)}
            transparent
            opacity={0.8 + Math.sin(currentTime * 20) * 0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      
      {/* Orbiting sparkles for extra flair (2-3 tiny particles) */}
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (currentTime * 8 + i * Math.PI * 2 / 3) % (Math.PI * 2);
        const sparkleOffset = new THREE.Vector3(
          Math.cos(angle) * 0.4,
          Math.sin(angle) * 0.3,
          0
        ).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(...end).sub(new THREE.Vector3(...start)).normalize()));
        return (
          <mesh
            key={i}
            position={[
              headPosition[0] + sparkleOffset.x,
              headPosition[1] + sparkleOffset.y,
              headPosition[2] + sparkleOffset.z
            ]}
            scale={[0.12 + Math.sin(currentTime * 15 + i) * 0.06, 0.12 + Math.sin(currentTime * 15 + i) * 0.06, 0.12]}
          >
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial
              color={headColor.clone().multiplyScalar(2)}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default WormParticle;
