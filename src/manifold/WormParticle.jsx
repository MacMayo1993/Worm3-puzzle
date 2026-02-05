import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Scratchpad to avoid GC thrash (keeps the game smooth)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _color = new THREE.Color();
const _quat = new THREE.Quaternion();
const _m1 = new THREE.Matrix4();

const WormParticle = ({ start, end, color1, color2, startTime, onComplete }) => {
  const headRef = useRef();
  const trailGeoRef = useRef();
  const segmentRefs = useRef([]);
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const tongueRef = useRef();

  const duration = 2.2;
  const trailLength = 25;
  const segmentCount = 8;

  // Personality randomization (per worm instance)
  const personality = useMemo(() => ({
    wiggleSpeed: 1.5 + Math.random() * 1.5,          // 1.5–3.0
    eyeSize: 0.05 + Math.random() * 0.03,           // slightly different sizes
    tongueLength: 0.08 + Math.random() * 0.06,      // longer or shorter tongue
    blinkChance: 0.008 + Math.random() * 0.01,      // how often it blinks
    squishAmount: 0.25 + Math.random() * 0.15,      // how bouncy the squish is
  }), []);

  // 1. Initialize stable data
  const points = useMemo(() => new Float32Array(trailLength * 3), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  // Blink state
  const isBlinking = useRef(false);
  const blinkTimer = useRef(0);

  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();
    if (currentTime < startTime) return;
    let elapsed = currentTime - startTime;
    if (elapsed >= duration) {
      if (onComplete) onComplete();
      return;
    }

    // 2. Comical "Inchworm" Progress (Custom Quintic Ease)
    let t = elapsed / duration;
    const progress = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    // 3. Slither Path Calculation
    const vStart = _v1.set(...start);
    const vEnd = _v2.set(...end);
    const dir = _v3.subVectors(vEnd, vStart).normalize();
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();

    // Create "Wormy" path using a Bezier control point that wiggles
    const wiggle = Math.sin(progress * Math.PI * 5 + currentTime * personality.wiggleSpeed) * 0.3;
    const mid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    const control = mid.add(right.clone().multiplyScalar(wiggle));
    const curve = new THREE.QuadraticBezierCurve3(vStart, control, vEnd);

    // 4. Update Trail and Head
    for (let i = 0; i < trailLength; i++) {
      const p = curve.getPoint((i / (trailLength - 1)) * progress);
      points[i * 3] = p.x;
      points[i * 3 + 1] = p.y;
      points[i * 3 + 2] = p.z;
    }
    trailGeoRef.current.attributes.position.needsUpdate = true;
    const headPos = curve.getPoint(progress);
    headRef.current.position.copy(headPos);

    // Dynamic Mascot Color
    _color.set(color1).lerp(_v1.set(color2), progress);
    _color.offsetHSL(0.15 * Math.sin(currentTime * 4), 0, 0);

    // 5. Animate Body Segments (The "Chubby" Look)
    segmentRefs.current.forEach((seg, i) => {
      if (!seg) return;
      const segLag = (i / segmentCount) * 0.15;
      const segProg = Math.max(0, progress - segLag);
      const pos = curve.getPoint(segProg);
      const sPulse = (1 + Math.sin(currentTime * 8 + i) * personality.squishAmount) * (1 - i / segmentCount * 0.5);
      seg.position.copy(pos);
      seg.position.y += Math.sin(currentTime * 10 + i) * 0.05; // Independent wiggle
      seg.scale.set(sPulse * 1.2, sPulse * 0.9, sPulse * 1.2); // Squishy
      seg.material.color.copy(_color).offsetHSL(i * 0.05, 0, 0);
    });

    // 6. Googly Eye Jitter + Random Blinking
    const eyeJitter = Math.sin(currentTime * 20) * 0.01;
    if (eyeLeftRef.current) eyeLeftRef.current.position.y += eyeJitter;
    if (eyeRightRef.current) eyeRightRef.current.position.y += eyeJitter;

    // Random blink
    if (!isBlinking.current && Math.random() < personality.blinkChance) {
      isBlinking.current = true;
      blinkTimer.current = currentTime;
      if (eyeLeftRef.current) eyeLeftRef.current.visible = false;
      if (eyeRightRef.current) eyeRightRef.current.visible = false;
    }
    if (isBlinking.current && currentTime - blinkTimer.current > 0.15) {
      isBlinking.current = false;
      if (eyeLeftRef.current) eyeLeftRef.current.visible = true;
      if (eyeRightRef.current) eyeRightRef.current.visible = true;
    }

    // 7. Tongue wiggle
    if (tongueRef.current) {
      tongueRef.current.scale.y = personality.tongueLength * (1 + Math.sin(currentTime * 12) * 0.3);
      tongueRef.current.rotation.z = Math.sin(currentTime * 6) * 0.15; // playful tilt
    }
  });

  return (
    <group>
      {/* Performance Trail */}
      <line>
        <bufferGeometry ref={trailGeoRef}>
          <bufferAttribute attach="attributes-position" count={trailLength} array={points} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </line>

      {/* Body Segments */}
      {Array.from({ length: segmentCount }).map((_, i) => (
        <mesh key={i} ref={(el) => (segmentRefs.current[i] = el)}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Mascot Head */}
      <group ref={headRef}>
        {/* Face Mesh */}
        <mesh>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Googly Eyes */}
        <group position={[0, 0.05, 0.15]}>
          <mesh ref={eyeLeftRef} name="eye" position={[-0.1, 0, 0]}>
            <sphereGeometry args={[personality.eyeSize * 1.2, 8, 8]} />
            <meshBasicMaterial color="white" />
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[personality.eyeSize * 0.4, 6, 6]} />
              <meshBasicMaterial color="black" />
            </mesh>
          </mesh>
          <mesh ref={eyeRightRef} name="eye" position={[0.1, 0, 0]}>
            <sphereGeometry args={[personality.eyeSize * 1.2, 8, 8]} />
            <meshBasicMaterial color="white" />
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[personality.eyeSize * 0.4, 6, 6]} />
              <meshBasicMaterial color="black" />
            </mesh>
          </mesh>
        </group>

        {/* Smile */}
        <mesh position={[0, -0.05, 0.18]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#222" />
        </mesh>

        {/* Silly tongue sticking out */}
        <mesh ref={tongueRef} position={[0, -0.12, 0.18]}>
          <coneGeometry args={[0.03, personality.tongueLength, 6]} />
          <meshBasicMaterial color="pink" />
        </mesh>
      </group>
    </group>
  );
};

export default WormParticle;
