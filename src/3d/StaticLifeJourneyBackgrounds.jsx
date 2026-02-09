/**
 * Static Life Journey Background Environments for Free Play
 *
 * Performance-optimized versions of the Life Journey 3D scenes.
 * All useFrame hooks are removed - objects are placed at fixed positions
 * producing beautiful still 3D pictures without per-frame CPU/GPU cost.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { ContactShadows, Text } from '@react-three/drei';

// ───────────────────────────────────────────
// DAYCARE - Static version
// ───────────────────────────────────────────
export function StaticDaycareEnvironment() {
  const tileCount = 36;
  const tileRef = useRef();

  const cubeFaceColors = useMemo(() => [
    new THREE.Color('#ef4444'),
    new THREE.Color('#22c55e'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#f97316'),
    new THREE.Color('#3b82f6'),
    new THREE.Color('#eab308'),
  ], []);

  const crayonData = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.3;
      const r = 3 + (i % 3) * 1.5;
      positions.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r + 2,
        rotY: angle + 0.5,
        tiltX: (i * 0.12) - 0.2,
        tiltZ: (i * 0.08) - 0.15,
      });
    }
    return positions;
  }, []);

  useLayoutEffect(() => {
    if (!tileRef.current) return;
    const tempObject = new THREE.Object3D();
    const tileSize = 4.5;
    const gap = 0.3;
    const step = tileSize + gap;

    const faceOffsets = [
      { fx: 0, fz: -2 },
      { fx: -2, fz: -2 },
      { fx: 0, fz: -4 },
      { fx: 2, fz: -2 },
      { fx: 4, fz: -2 },
      { fx: 0, fz: 0 },
    ];

    let idx = 0;
    for (let face = 0; face < 6; face++) {
      const { fx, fz } = faceOffsets[face];
      for (let sub = 0; sub < 6; sub++) {
        const lx = sub % 2;
        const lz = Math.floor(sub / 2);
        const x = (fx + lx) * step - 4;
        const z = (fz + lz) * step + 8;
        tempObject.position.set(x, -7.95, z);
        tempObject.rotation.set(-Math.PI / 2, 0, 0);
        tempObject.scale.set(1, 1, 1);
        tempObject.updateMatrix();
        tileRef.current.setMatrixAt(idx, tempObject.matrix);

        const baseColor = cubeFaceColors[face].clone();
        const variation = 0.03 * ((sub % 3) - 1);
        baseColor.offsetHSL(0, variation, variation * 0.5);
        tileRef.current.setColorAt(idx, baseColor);
        idx++;
      }
    }
    tileRef.current.instanceMatrix.needsUpdate = true;
    if (tileRef.current.instanceColor) tileRef.current.instanceColor.needsUpdate = true;
  }, [cubeFaceColors]);

  const axisColors = ['#ef4444', '#22c55e', '#3b82f6'];

  return (
    <group>
      <color attach="background" args={['#FFF5E6']} />
      <fog attach="fog" args={['#FFF5E6', 45, 150]} />

      <directionalLight position={[20, 25, 10]} intensity={1.8} color="#FFF8DC" castShadow />
      <ambientLight intensity={0.4} color="#FFF0DB" />
      <pointLight position={[40, 12, 0]} intensity={0.6} color="#FFE4B5" distance={60} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#D4B896" roughness={0.7} metalness={0.05} />
      </mesh>

      <group position={[0, 12, -45]}>
        <mesh>
          <planeGeometry args={[100, 50]} />
          <meshStandardMaterial color="#FFF5E6" roughness={0.95} />
        </mesh>
        <mesh position={[0, -24.5, 0.5]}>
          <boxGeometry args={[100, 1.5, 0.4]} />
          <meshStandardMaterial color="#C4956A" roughness={0.6} metalness={0.05} />
        </mesh>
      </group>

      <mesh position={[-50, 12, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[100, 50]} />
        <meshStandardMaterial color="#FFF0DB" roughness={0.95} />
      </mesh>
      <mesh position={[50, 12, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[100, 50]} />
        <meshStandardMaterial color="#FFF0DB" roughness={0.95} />
      </mesh>
      <mesh position={[0, 37, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#FFFEFA" roughness={1} />
      </mesh>

      <instancedMesh ref={tileRef} args={[null, null, tileCount]}>
        <planeGeometry args={[4.3, 4.3]} />
        <meshStandardMaterial transparent opacity={0.6} roughness={0.85} />
      </instancedMesh>

      <group position={[-10, 8, -44.5]}>
        <mesh>
          <planeGeometry args={[22, 6]} />
          <meshStandardMaterial color="#FFFEF5" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[23, 7]} />
          <meshStandardMaterial color="#C4956A" roughness={0.5} />
        </mesh>
        {cubeFaceColors.map((color, i) => (
          <mesh key={i} position={[-8.5 + i * 3.5, 0, 0.05]}>
            <planeGeometry args={[2.8, 3.5]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        ))}
      </group>

      <group position={[10, -6.5, 8]}>
        <mesh castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} metalness={0.02} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[4.2, 0.2, 4.2]} />
          <meshStandardMaterial color="#C4956A" roughness={0.5} />
        </mesh>
        <mesh position={[-1.1, 1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.55, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.6} />
        </mesh>
        <mesh position={[1.1, 1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.55, 3]} />
          <meshStandardMaterial color="#22c55e" roughness={0.6} />
        </mesh>
        <mesh position={[-2.5, -1.1, 1]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[3, -1.0, -0.5]} rotation={[0.2, 0.5, 0.1]} castShadow>
          <boxGeometry args={[0.85, 0.85, 0.85]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
        <mesh position={[2.8, -0.7, 2]} rotation={[0.3, 0.8, 0]} castShadow>
          <tetrahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#22c55e" roughness={0.4} />
        </mesh>
      </group>

      {/* Mobile - fixed position, no animation */}
      <group position={[0, 28, 0]}>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 10]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 12, 8]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
            <mesh position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 6, 8]} />
              <meshStandardMaterial color="#DEB887" roughness={0.5} />
            </mesh>
            <mesh position={[5.5, -1.5, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 3]} />
              <meshStandardMaterial color="#AAA" />
            </mesh>
            <group position={[5.5, -3.5, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.8, 0.08, 8, 24, Math.PI * 1.5]} />
                <meshStandardMaterial color={axisColors[i]} roughness={0.3} metalness={0.1} />
              </mesh>
              <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.2, 0.4, 8]} />
                <meshStandardMaterial color={axisColors[i]} roughness={0.3} metalness={0.1} />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <sphereGeometry args={[0.25, 12, 12]} />
                <meshStandardMaterial color={axisColors[i]} roughness={0.5} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      <group position={[48, 15, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 18, 22]} />
          <meshStandardMaterial color="#FFFEFA" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <planeGeometry args={[0.1, 16, 20]} />
          <meshStandardMaterial color="#E8F4FD" transparent opacity={0.3} roughness={0.1} metalness={0.2} />
        </mesh>
        <mesh position={[-0.2, 0, 0]}>
          <boxGeometry args={[0.15, 18, 0.3]} />
          <meshStandardMaterial color="#FFFEFA" roughness={0.8} />
        </mesh>
        <mesh position={[-0.2, 0, 0]}>
          <boxGeometry args={[0.15, 0.3, 22]} />
          <meshStandardMaterial color="#FFFEFA" roughness={0.8} />
        </mesh>
        <mesh position={[-24, -10, 0]} rotation={[0, 0, Math.PI / 5]}>
          <boxGeometry args={[40, 0.05, 22]} />
          <meshBasicMaterial color="#FFF8DC" transparent opacity={0.06} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[1, 0, 0]}>
          <planeGeometry args={[0.1, 16, 20]} />
          <meshBasicMaterial color="#87CEEB" />
        </mesh>
      </group>

      {crayonData.map((c, i) => (
        <group key={`crayon-${i}`}>
          <mesh position={[c.x, -7.92, c.z]} rotation={[Math.PI / 2 + c.tiltX, c.rotY, c.tiltZ]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.4, 8]} />
            <meshStandardMaterial color={cubeFaceColors[i]} roughness={0.5} />
          </mesh>
          <mesh position={[c.x + Math.cos(c.rotY) * 0.7, -7.88, c.z + Math.sin(c.rotY) * 0.7]} rotation={[Math.PI / 2 + c.tiltX, c.rotY, c.tiltZ]}>
            <coneGeometry args={[0.1, 0.25, 8]} />
            <meshStandardMaterial color={cubeFaceColors[i]} roughness={0.4} metalness={0.05} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.9, 2]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#F5C6D0" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.89, 2]}>
        <ringGeometry args={[13.2, 14, 64]} />
        <meshStandardMaterial color="#E8A0B0" roughness={1} />
      </mesh>

      {cubeFaceColors.map((color, i) => (
        <group key={`frame-${i}`} position={[20 + i * 4.5, 18, -44.5]}>
          <mesh>
            <boxGeometry args={[3.5, 3.5, 0.3]} />
            <meshStandardMaterial color="#C4956A" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.2]}>
            <planeGeometry args={[2.8, 2.8]} />
            <meshStandardMaterial color={color} roughness={0.8} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}

      <group position={[-48, -2, -20]}>
        <mesh castShadow>
          <boxGeometry args={[2, 14, 8]} />
          <meshStandardMaterial color="#C4956A" roughness={0.5} />
        </mesh>
        {[-3, 0, 3].map((sy, si) => (
          <mesh key={si} position={[0.2, sy, 0]}>
            <boxGeometry args={[0.3, 0.2, 8.2]} />
            <meshStandardMaterial color="#B8865A" roughness={0.5} />
          </mesh>
        ))}
        {[
          { y: -1.5, z: -2.5, color: '#ef4444', h: 2.5, w: 0.3 },
          { y: -1.5, z: -1.8, color: '#3b82f6', h: 2.3, w: 0.4 },
          { y: -1.5, z: -1.0, color: '#22c55e', h: 2.6, w: 0.3 },
          { y: -1.5, z: -0.3, color: '#f97316', h: 2.2, w: 0.35 },
          { y: -1.5, z: 0.5, color: '#eab308', h: 2.4, w: 0.3 },
          { y: 1.5, z: -2.2, color: '#8B5CF6', h: 2.3, w: 0.35 },
          { y: 1.5, z: -1.4, color: '#ef4444', h: 2.5, w: 0.3 },
          { y: 1.5, z: -0.5, color: '#3b82f6', h: 2.1, w: 0.4 },
        ].map((book, bi) => (
          <mesh key={bi} position={[0.6, book.y, book.z]} castShadow>
            <boxGeometry args={[book.w, book.h, 1.2]} />
            <meshStandardMaterial color={book.color} roughness={0.7} />
          </mesh>
        ))}
      </group>

      <group position={[10, -7, 8]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[3.5, 3.5, 0.3, 16]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} />
        </mesh>
        {[[1.5, 0, 1.5], [-1.5, 0, 1.5], [1.5, 0, -1.5], [-1.5, 0, -1.5]].map((pos, li) => (
          <mesh key={li} position={pos} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 3, 8]} />
            <meshStandardMaterial color="#C4956A" roughness={0.5} />
          </mesh>
        ))}
      </group>

      <ContactShadows position={[0, -7.99, 0]} opacity={0.5} scale={80} blur={1.5} far={20} />
    </group>
  );
}

// ───────────────────────────────────────────
// ELEMENTARY - Static version
// ───────────────────────────────────────────
export function StaticElementaryEnvironment() {
  // Gold star positions are deterministic (seeded)
  const starPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 15; i++) {
      // Use deterministic hash instead of Math.random()
      const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const hy = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
      positions.push([
        (hx - Math.floor(hx) - 0.5) * 60,
        10 + (hy - Math.floor(hy)) * 15,
        (hz - Math.floor(hz) - 0.5) * 60,
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#C4A484" />
      </mesh>

      <mesh position={[0, 10, -38]}>
        <planeGeometry args={[80, 36]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      <group position={[0, 12, -37]}>
        <mesh>
          <boxGeometry args={[35, 15, 0.5]} />
          <meshStandardMaterial color="#2D5A27" />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[36, 16, 0.3]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <group>
          <Text position={[0, 0, 0.6]} fontSize={2.2} color="#e8e8d0" maxWidth={30} textAlign="center" anchorX="center" anchorY="middle">
            Welcome to{"\n"}Miss Cole's Class
          </Text>
        </group>
      </group>

      <mesh position={[0, 4, -36]}>
        <boxGeometry args={[30, 0.5, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[-40, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[80, 36]} />
        <meshStandardMaterial color="#FAFAD2" />
      </mesh>
      <mesh position={[40, 10, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[80, 36]} />
        <meshStandardMaterial color="#FAFAD2" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 28, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#FFFFF0" />
      </mesh>

      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <group key={`desk-${row}-${col}`} position={[-16 + col * 8, -5, 5 + row * 8]}>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[5, 0.3, 4]} />
              <meshStandardMaterial color="#DEB887" />
            </mesh>
            {[[-2, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5]].map(([x, z], i) => (
              <mesh key={i} position={[x, 0, z]}>
                <boxGeometry args={[0.3, 4, 0.3]} />
                <meshStandardMaterial color="#4A4A4A" />
              </mesh>
            ))}
            <mesh position={[0, 0, 3.5]}>
              <boxGeometry args={[2.5, 0.3, 2.5]} />
              <meshStandardMaterial color="#FF6347" />
            </mesh>
            <mesh position={[0, 2, 4.5]}>
              <boxGeometry args={[2.5, 4, 0.3]} />
              <meshStandardMaterial color="#FF6347" />
            </mesh>
          </group>
        ))
      )}

      <group position={[0, -5, -25]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[12, 0.5, 5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[11, 4, 4]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>

      {/* Gold stars - fixed positions */}
      {starPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 5]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}

      <mesh position={[0, 22, -37]}>
        <boxGeometry args={[40, 3, 0.1]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {[-20, 0, 20].map((z, i) => (
        <group key={i} position={[39, 12, z]}>
          <mesh>
            <boxGeometry args={[0.5, 10, 8]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.2} />
          </mesh>
          <pointLight position={[3, 0, 0]} color="#FFFACD" intensity={0.5} distance={20} />
        </group>
      ))}

      {[-15, 15].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 27, 0]}>
            <boxGeometry args={[4, 0.3, 30]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <pointLight position={[x, 25, 0]} color="#FFFFFF" intensity={0.6} distance={30} />
        </group>
      ))}

      <ambientLight intensity={0.5} />
    </group>
  );
}

// ───────────────────────────────────────────
// MIDDLE SCHOOL - Static version
// ───────────────────────────────────────────
export function StaticMiddleSchoolEnvironment() {
  const lockerColors = ['#4169E1', '#4682B4', '#5F9EA0', '#6495ED'];

  const paperPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 12; i++) {
      const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const hy = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
      positions.push([
        (hx - Math.floor(hx) - 0.5) * 20,
        5 + (hy - Math.floor(hy)) * 10,
        (hz - Math.floor(hz) - 0.5) * 80,
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[30, 100]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>

      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i % 2) * 2 - 1, -7.9, -45 + Math.floor(i / 2) * 4]}>
          <planeGeometry args={[1.9, 3.9]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#C0C0C0' : '#E8E8E8'} />
        </mesh>
      ))}

      <mesh position={[-14, 8, 0]}>
        <boxGeometry args={[1, 32, 100]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {Array.from({ length: 25 }).map((_, i) => (
        <group key={`locker-l-${i}`} position={[-13, 2, -46 + i * 4]}>
          <mesh>
            <boxGeometry args={[1, 18, 3.5]} />
            <meshStandardMaterial color={lockerColors[i % lockerColors.length]} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.6, 6, 0]}>
            <boxGeometry args={[0.1, 3, 2]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
          <mesh position={[0.6, 0, 1]}>
            <boxGeometry args={[0.2, 0.5, 0.3]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
          </mesh>
        </group>
      ))}

      <mesh position={[14, 8, 0]}>
        <boxGeometry args={[1, 32, 100]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {Array.from({ length: 25 }).map((_, i) => (
        <group key={`locker-r-${i}`} position={[13, 2, -46 + i * 4]}>
          <mesh>
            <boxGeometry args={[1, 18, 3.5]} />
            <meshStandardMaterial color={lockerColors[(i + 2) % lockerColors.length]} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[-0.6, 6, 0]}>
            <boxGeometry args={[0.1, 3, 2]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
          <mesh position={[-0.6, 0, -1]}>
            <boxGeometry args={[0.2, 0.5, 0.3]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 24, 0]}>
        <planeGeometry args={[30, 100]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>

      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 23.9, -46 + i * 4]}>
          <planeGeometry args={[28, 3.8]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
      ))}

      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} position={[0, 22, -44 + i * 8]}>
          <mesh>
            <boxGeometry args={[3, 0.3, 1.5]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <pointLight color="#F0F8FF" intensity={0.8} distance={15} />
        </group>
      ))}

      {/* Papers - fixed in place */}
      {paperPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#FFFEF0" side={THREE.DoubleSide} />
        </mesh>
      ))}

      <mesh position={[0, 20, -48]}>
        <boxGeometry args={[4, 1.5, 0.3]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>

      <group position={[12, -2, 20]}>
        <mesh>
          <boxGeometry args={[1.5, 6, 2]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.5} />
        </mesh>
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[1.2, 0.5, 1.8]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
      </group>

      <ambientLight intensity={0.4} />
    </group>
  );
}

// ───────────────────────────────────────────
// HIGH SCHOOL - Static version
// ───────────────────────────────────────────
export function StaticHighSchoolEnvironment() {
  const trayPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 15; i++) {
      const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const hy = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
      positions.push([
        (hx - Math.floor(hx) - 0.5) * 50,
        8 + (hy - Math.floor(hy)) * 12,
        (hz - Math.floor(hz) - 0.5) * 50,
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#8B8682" />
      </mesh>

      <mesh position={[0, 12, -40]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
      <mesh position={[-40, 12, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#363636" />
      </mesh>
      <mesh position={[40, 12, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#363636" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 32, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>

      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 3 }).map((_, col) => (
          <group key={`table-${row}-${col}`} position={[-20 + col * 20, -6, -15 + row * 12]}>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[14, 0.5, 4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 0.5, 3]}>
              <boxGeometry args={[14, 0.5, 1.5]} />
              <meshStandardMaterial color="#FF6B6B" />
            </mesh>
            <mesh position={[0, 0.5, -3]}>
              <boxGeometry args={[14, 0.5, 1.5]} />
              <meshStandardMaterial color="#4ECDC4" />
            </mesh>
          </group>
        ))
      )}

      {/* Food trays - fixed positions */}
      {trayPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <boxGeometry args={[2, 0.2, 1.5]} />
            <meshStandardMaterial color="#CD853F" />
          </mesh>
          <mesh position={[-0.5, 0.3, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#FF6347" />
          </mesh>
          <mesh position={[0.5, 0.3, 0]}>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      ))}

      {[-30, 30].map((x, i) => (
        <group key={i} position={[x, 0, -35]}>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[5, 10, 3]} />
            <meshStandardMaterial color={i === 0 ? '#FF0000' : '#0000FF'} />
          </mesh>
          <mesh position={[0, 5, 1.6]}>
            <boxGeometry args={[4, 6, 0.1]} />
            <meshStandardMaterial color="#333333" emissive="#222222" />
          </mesh>
        </group>
      ))}

      {[[-20, -10], [0, -10], [20, -10], [-20, 15], [0, 15], [20, 15]].map(([x, z], i) => (
        <pointLight key={i} position={[x, 28, z]} color={['#FF6B6B', '#4ECDC4', '#FFE66D'][i % 3]} intensity={0.6} distance={25} />
      ))}

      <pointLight position={[0, 30, 0]} color="#FF4444" intensity={0.5} distance={40} />
      <ambientLight intensity={0.3} />
    </group>
  );
}

// ───────────────────────────────────────────
// COLLEGE - Static version
// ───────────────────────────────────────────
export function StaticCollegeEnvironment() {
  const bookPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 10; i++) {
      const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const hy = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
      positions.push([
        (hx - Math.floor(hx) - 0.5) * 30,
        5 + (hy - Math.floor(hy)) * 10,
        (hz - Math.floor(hz) - 0.5) * 30,
      ]);
    }
    return positions;
  }, []);

  const bookColors = ['#8B0000', '#00008B', '#006400'];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2F4F4F" />
      </mesh>

      <mesh position={[0, 8, -25]}>
        <planeGeometry args={[50, 32]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>
      <mesh position={[-25, 8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[50, 32]} />
        <meshStandardMaterial color="#16213E" />
      </mesh>
      <mesh position={[25, 8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[50, 32]} />
        <meshStandardMaterial color="#16213E" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 24, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0F0F1A" />
      </mesh>

      <group position={[10, -6, -18]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[12, 0.5, 6]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[3, 4, 5]} />
          <meshStandardMaterial color="#3D2914" />
        </mesh>

        <group position={[-4, 2.5, -1]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.8, 0.3, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, 2, 0]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, 4, 0.5]} rotation={[0.8, 0, 0]}>
            <coneGeometry args={[1.5, 2, 16, 1, true]} />
            <meshStandardMaterial color="#FFD700" side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 3, 1]} color="#FFE4B5" intensity={2} distance={15} />
        </group>

        <group position={[0, 2.5, 0]}>
          <mesh>
            <boxGeometry args={[3, 0.1, 2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, 1.2, -1]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[3, 2, 0.1]} />
            <meshStandardMaterial color="#222222" emissive="#1a1a2e" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>

      <group position={[15, -3, -16]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.4, 1.2, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
          <meshStandardMaterial color="#3D2914" />
        </mesh>
      </group>

      <group position={[-20, 0, -20]}>
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[8, 16, 2]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
        {[2, 6, 10, 14].map((y, shelf) => (
          <group key={shelf}>
            {Array.from({ length: 6 }).map((_, i) => {
              const h = Math.sin((shelf * 6 + i) * 127.1) * 43758.5453;
              const bookH = 2 + (h - Math.floor(h));
              return (
                <mesh key={i} position={[-2.5 + i * 0.9, y - 5, 0]}>
                  <boxGeometry args={[0.7, bookH, 1.5]} />
                  <meshStandardMaterial color={['#8B0000', '#00008B', '#006400', '#4B0082', '#8B4513', '#2F4F4F'][i]} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>

      {/* Books - fixed positions */}
      {bookPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[1.5, 0.2, 2]} />
          <meshStandardMaterial color={bookColors[i % 3]} />
        </mesh>
      ))}

      <group position={[24, 8, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 12, 10]} />
          <meshStandardMaterial color="#1a1a3a" emissive="#1a1a3a" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[3, 0, 0]} color="#B0C4DE" intensity={0.3} distance={20} />
      </group>

      <group position={[-10, -6, 10]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[8, 2, 12]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        <mesh position={[0, 2.5, -5]}>
          <boxGeometry args={[7, 2, 2]} />
          <meshStandardMaterial color="#F0F8FF" />
        </mesh>
      </group>

      <ambientLight intensity={0.15} />
    </group>
  );
}

// ───────────────────────────────────────────
// JOB - Static version
// ───────────────────────────────────────────
export function StaticJobEnvironment() {
  const chartPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const hy = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
      positions.push([
        (hx - Math.floor(hx) - 0.5) * 50,
        10 + (hy - Math.floor(hy)) * 8,
        (hz - Math.floor(hz) - 0.5) * 50,
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>
      <mesh position={[0, 6, -40]}>
        <planeGeometry args={[80, 28]} />
        <meshStandardMaterial color="#CBD5E0" />
      </mesh>

      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <group key={`cubicle-${row}-${col}`} position={[-24 + col * 16, -6, -20 + row * 16]}>
            <mesh position={[0, 3, -4]}>
              <boxGeometry args={[10, 8, 0.3]} />
              <meshStandardMaterial color="#A0AEC0" />
            </mesh>
            <mesh position={[-5, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[8, 8, 0.3]} />
              <meshStandardMaterial color="#A0AEC0" />
            </mesh>
            <mesh position={[5, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[8, 8, 0.3]} />
              <meshStandardMaterial color="#A0AEC0" />
            </mesh>
            <mesh position={[0, 1, -2]}>
              <boxGeometry args={[9, 0.3, 5]} />
              <meshStandardMaterial color="#718096" />
            </mesh>
            <mesh position={[0, 4, -3]}>
              <boxGeometry args={[4, 3, 0.2]} />
              <meshStandardMaterial color="#1A202C" emissive="#2D3748" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 2, -3]}>
              <boxGeometry args={[0.5, 2, 0.5]} />
              <meshStandardMaterial color="#2D3748" />
            </mesh>
            <mesh position={[0, 0, 2]}>
              <boxGeometry args={[3, 0.5, 3]} />
              <meshStandardMaterial color="#2B6CB0" />
            </mesh>
            <mesh position={[0, 2, 3]}>
              <boxGeometry args={[3, 4, 0.5]} />
              <meshStandardMaterial color="#2B6CB0" />
            </mesh>
          </group>
        ))
      )}

      {/* Charts - fixed positions */}
      {chartPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <planeGeometry args={[4, 3]} />
            <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 5 }).map((_, j) => {
            const h = Math.sin((i * 5 + j) * 127.1) * 43758.5453;
            const barH = 0.5 + (h - Math.floor(h)) * 1.5;
            return (
              <mesh key={j} position={[-1.2 + j * 0.6, -1 + barH * 0.5, 0.1]}>
                <boxGeometry args={[0.4, barH, 0.1]} />
                <meshStandardMaterial color={['#3182CE', '#38A169', '#E53E3E', '#DD6B20', '#805AD5'][j]} />
              </mesh>
            );
          })}
        </group>
      ))}

      <group position={[35, -4, 0]}>
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 8, 16]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        <mesh position={[0, 8, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 3, 16]} />
          <meshStandardMaterial color="#63B3ED" transparent opacity={0.5} />
        </mesh>
      </group>

      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <group key={`light-${row}-${col}`} position={[-24 + col * 16, 19, -24 + row * 16]}>
            <mesh>
              <boxGeometry args={[6, 0.3, 2]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <pointLight color="#FFFFFF" intensity={0.5} distance={20} />
          </group>
        ))
      )}

      <ambientLight intensity={0.4} />
    </group>
  );
}

// ───────────────────────────────────────────
// NASA - Static version
// ───────────────────────────────────────────
export function StaticNasaEnvironment() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#0A0A1A" />
      </mesh>

      <mesh position={[0, 12, -30]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#0D0D1A" />
      </mesh>

      <group position={[0, 10, -28]}>
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[30, 15, 0.5]} />
          <meshStandardMaterial color="#001122" emissive="#003366" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-22, 5, 2]}>
          <boxGeometry args={[12, 12, 0.5]} />
          <meshStandardMaterial color="#001122" emissive="#006633" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[22, 5, 2]}>
          <boxGeometry args={[12, 12, 0.5]} />
          <meshStandardMaterial color="#001122" emissive="#660033" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {[0, 8, 16].map((z, tier) => (
        <group key={tier} position={[0, -6 + tier * 0.5, z]}>
          {Array.from({ length: 6 - tier }).map((_, i) => (
            <group key={i} position={[-20 + tier * 5 + i * (10 - tier), 0, 0]}>
              <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[8, 3, 4]} />
                <meshStandardMaterial color="#1A1A2E" />
              </mesh>
              <mesh position={[-2, 4, -1]}>
                <boxGeometry args={[3, 2.5, 0.2]} />
                <meshStandardMaterial color="#000510" emissive="#00BFFF" emissiveIntensity={0.3} />
              </mesh>
              <mesh position={[2, 4, -1]}>
                <boxGeometry args={[3, 2.5, 0.2]} />
                <meshStandardMaterial color="#000510" emissive="#00FF88" emissiveIntensity={0.3} />
              </mesh>
              <mesh position={[0, 0, 4]}>
                <boxGeometry args={[3, 0.5, 3]} />
                <meshStandardMaterial color="#2D2D44" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      <mesh position={[0, 22, -29]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color="#0B3D91" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 28, 0]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#050510" />
      </mesh>

      <pointLight position={[0, 20, -20]} color="#00BFFF" intensity={1} distance={40} />
      <pointLight position={[-30, 10, 0]} color="#00FF88" intensity={0.5} distance={30} />
      <pointLight position={[30, 10, 0]} color="#FF6B00" intensity={0.5} distance={30} />
      <ambientLight intensity={0.15} />
    </group>
  );
}

// ───────────────────────────────────────────
// ROCKET - Static version
// ───────────────────────────────────────────
export function StaticRocketEnvironment() {
  const starPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 200; i++) {
      const theta = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const phi = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const t = (theta - Math.floor(theta)) * Math.PI * 2;
      const p = (phi - Math.floor(phi)) * Math.PI * 0.5;
      const r = 75;
      positions.push([
        r * Math.sin(p) * Math.cos(t),
        r * Math.cos(p) + 10,
        r * Math.sin(p) * Math.sin(t),
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3A3A3A" />
      </mesh>
      <mesh position={[0, -14, 0]}>
        <cylinderGeometry args={[15, 15, 2, 32]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>

      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#0A0A1A" side={THREE.BackSide} />
      </mesh>

      {starPositions.map((pos, i) => {
        const h = Math.sin(i * 419.2) * 43758.5453;
        const size = 0.1 + (h - Math.floor(h)) * 0.2;
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[size, 4, 4]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}

      <group position={[0, 10, 0]}>
        <mesh>
          <cylinderGeometry args={[3, 3, 25, 32]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
        <mesh position={[0, 15, 0]}>
          <coneGeometry args={[3, 8, 32]} />
          <meshStandardMaterial color="#FF4500" />
        </mesh>
        {[0, 120, 240].map((angle, i) => (
          <mesh key={i} position={[Math.sin(angle * Math.PI / 180) * 3, -10, Math.cos(angle * Math.PI / 180) * 3]} rotation={[0, -angle * Math.PI / 180, 0]}>
            <boxGeometry args={[0.5, 8, 4]} />
            <meshStandardMaterial color="#FF4500" />
          </mesh>
        ))}
        <mesh position={[0, -13, 0]}>
          <cylinderGeometry args={[2.5, 3.5, 3, 32]} />
          <meshStandardMaterial color="#333333" metalness={0.8} />
        </mesh>
      </group>

      <group position={[12, 0, 0]}>
        <mesh position={[0, 15, 0]}>
          <boxGeometry args={[4, 50, 4]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-4, -10 + i * 6, 0]}>
            <boxGeometry args={[8, 0.5, 1]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
        ))}
        <mesh position={[-6, 20, 0]}>
          <boxGeometry args={[10, 2, 3]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </group>

      {/* Static flame cones (no animation) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
        const hs = Math.sin(i * 269.5 + 183.3) * 43758.5453;
        return (
          <mesh key={i} position={[(hx - Math.floor(hx) - 0.5) * 4, -12, (hz - Math.floor(hz) - 0.5) * 4]}>
            <coneGeometry args={[0.8 + (hs - Math.floor(hs)) * 0.5, 5 + (hs - Math.floor(hs)) * 3, 8]} />
            <meshBasicMaterial color={['#FFFF00', '#FF8C00', '#FF4500', '#FF0000'][i % 4]} transparent opacity={0.8} />
          </mesh>
        );
      })}

      <pointLight position={[0, -10, 0]} color="#FF4500" intensity={3} distance={50} />
      <pointLight position={[0, -15, 0]} color="#FFD700" intensity={2} distance={40} />
      <ambientLight intensity={0.2} />
    </group>
  );
}

// ───────────────────────────────────────────
// MOON - Static version
// ───────────────────────────────────────────
export function StaticMoonEnvironment() {
  const starPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 500; i++) {
      const theta = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const phi = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const t = (theta - Math.floor(theta)) * Math.PI * 2;
      const p = (phi - Math.floor(phi)) * Math.PI;
      const r = 95;
      positions.push([
        r * Math.sin(p) * Math.cos(t),
        r * Math.cos(p),
        r * Math.sin(p) * Math.sin(t),
      ]);
    }
    return positions;
  }, []);

  const craterData = useMemo(() => {
    const craters = [];
    for (let i = 0; i < 20; i++) {
      const hx = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const hz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
      const hs = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      craters.push({
        x: (hx - Math.floor(hx) - 0.5) * 100,
        z: (hz - Math.floor(hz) - 0.5) * 100,
        size: 2 + (hs - Math.floor(hs)) * 8,
      });
    }
    return craters;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#808080" roughness={1} />
      </mesh>

      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial color="#000005" side={THREE.BackSide} />
      </mesh>

      {starPositions.map((pos, i) => {
        const h = Math.sin(i * 419.2) * 43758.5453;
        const size = 0.05 + (h - Math.floor(h)) * 0.1;
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[size, 4, 4]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}

      {/* Earth - fixed rotation */}
      <group position={[40, 40, -50]}>
        <mesh>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        <mesh>
          <sphereGeometry args={[12.1, 32, 32]} />
          <meshStandardMaterial color="#228B22" transparent opacity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[13, 32, 32]} />
          <meshBasicMaterial color="#87CEEB" transparent opacity={0.15} />
        </mesh>
        <pointLight color="#87CEEB" intensity={0.5} distance={100} />
      </group>

      {craterData.map((crater, i) => (
        <group key={i} position={[crater.x, -8, crater.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <ringGeometry args={[crater.size * 0.7, crater.size, 32]} />
            <meshStandardMaterial color="#909090" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
            <circleGeometry args={[crater.size * 0.7, 32]} />
            <meshStandardMaterial color="#606060" />
          </mesh>
        </group>
      ))}

      <group position={[15, -5, -20]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[5, 4, 5]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} />
        </mesh>
        {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
        ))}
        {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([x, z], i) => (
          <mesh key={i} position={[x, -2, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1, 16]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
        ))}
      </group>

      <group position={[10, -6, -15]}>
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        {/* Flag - fixed position */}
        <group position={[1.5, 6, 0]}>
          <mesh>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial color="#BF0A30" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0.1]} position={[5 + i * 2, -7.9, -10 + Math.sin(i) * 2]}>
          <planeGeometry args={[0.4, 0.8]} />
          <meshStandardMaterial color="#707070" />
        </mesh>
      ))}

      <directionalLight position={[50, 30, 30]} intensity={1.5} color="#FFFACD" />
      <ambientLight intensity={0.1} />
    </group>
  );
}

// ───────────────────────────────────────────
// Helper: Get static background component by name
// ───────────────────────────────────────────
export function getStaticLevelBackground(backgroundName) {
  switch (backgroundName) {
    case 'daycare':
      return <StaticDaycareEnvironment />;
    case 'elementary':
      return <StaticElementaryEnvironment />;
    case 'middleschool':
      return <StaticMiddleSchoolEnvironment />;
    case 'highschool':
      return <StaticHighSchoolEnvironment />;
    case 'college':
      return <StaticCollegeEnvironment />;
    case 'job':
      return <StaticJobEnvironment />;
    case 'nasa':
      return <StaticNasaEnvironment />;
    case 'rocket':
      return <StaticRocketEnvironment />;
    case 'moon':
      return <StaticMoonEnvironment />;
    default:
      return null;
  }
}
