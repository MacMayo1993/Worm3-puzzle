/**
 * Life Journey Background Environments
 * Daycare → Elementary → Middle → High → College → Job → NASA → Rocket → Moon → Black Hole
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// 1. DAYCARE - Soft pastels, floating shapes
// ============================================
export function DaycareEnvironment() {
  const groupRef = useRef();

  // Pastel colors matching cube faces but softer
  const colors = useMemo(() => [
    '#FFB5B5', // soft red
    '#B5FFB5', // soft green
    '#FFE5B5', // soft cream/white
    '#FFCFA5', // soft orange
    '#B5D4FF', // soft blue
    '#FFFFA5', // soft yellow
  ], []);

  // Floating building blocks
  const blocks = useMemo(() => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          -15 - Math.random() * 20
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.3 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.1 + Math.random() * 0.2,
        offset: Math.random() * Math.PI * 2
      });
    }
    return items;
  }, [colors]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Soft gradient background */}
      <mesh position={[0, 0, -50]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#FFF5E6" />
      </mesh>

      {/* Floating blocks */}
      {blocks.map((block, i) => (
        <FloatingBlock key={i} {...block} />
      ))}

      {/* Soft ambient stars (like ceiling lights) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`star-${i}`} position={[
          (Math.random() - 0.5) * 30,
          10 + Math.random() * 10,
          -10 - Math.random() * 10
        ]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ))}
    </group>
  );
}

function FloatingBlock({ position, rotation, scale, color, speed, offset }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.5;
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

// ============================================
// 2. ELEMENTARY - Chalkboard with stars
// ============================================
export function ElementaryEnvironment() {
  const starsRef = useRef();

  // Gold star positions
  const stars = useMemo(() => {
    const items = [];
    for (let i = 0; i < 25; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 25,
          -15 - Math.random() * 10
        ],
        scale: 0.3 + Math.random() * 0.4,
        rotationSpeed: 0.5 + Math.random() * 0.5
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.children.forEach((star, i) => {
        star.rotation.z = state.clock.elapsedTime * stars[i].rotationSpeed;
      });
    }
  });

  return (
    <group>
      {/* Chalkboard green background */}
      <mesh position={[0, 0, -25]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#2D5A27" roughness={0.9} />
      </mesh>

      {/* Chalk dust effect */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          -20 + Math.random() * 5
        ]}>
          <sphereGeometry args={[0.02 + Math.random() * 0.03, 4, 4]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3 + Math.random() * 0.3} />
        </mesh>
      ))}

      {/* Gold stars */}
      <group ref={starsRef}>
        {stars.map((star, i) => (
          <GoldStar key={i} position={star.position} scale={star.scale} />
        ))}
      </group>
    </group>
  );
}

function GoldStar({ position, scale }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const outerRadius = 1;
    const innerRadius = 0.4;
    const spikes = 5;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  return (
    <mesh position={position} scale={scale}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ============================================
// 3. MIDDLE SCHOOL - Lockers and notebooks
// ============================================
export function MiddleSchoolEnvironment() {
  const lockersRef = useRef();

  // Locker colors
  const lockerColors = ['#4A6FA5', '#5B7BB0', '#3D5A8C', '#6B8BBF'];

  useFrame((state) => {
    if (lockersRef.current) {
      lockersRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <group ref={lockersRef}>
      {/* Hallway background - bluish gray */}
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#3A4A5A" />
      </mesh>

      {/* Lockers on sides */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`locker-l-${i}`}
          position={[-18, -8 + i * 2.5, -20]}
        >
          <boxGeometry args={[2, 2, 0.5]} />
          <meshStandardMaterial
            color={lockerColors[i % lockerColors.length]}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`locker-r-${i}`}
          position={[18, -8 + i * 2.5, -20]}
        >
          <boxGeometry args={[2, 2, 0.5]} />
          <meshStandardMaterial
            color={lockerColors[i % lockerColors.length]}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Floating notebook pages */}
      {Array.from({ length: 15 }).map((_, i) => (
        <FloatingPaper key={i} index={i} />
      ))}
    </group>
  );
}

function FloatingPaper({ index }) {
  const meshRef = useRef();
  const offset = index * 0.5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3 + offset) * 2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 + offset) * 0.3;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2 + offset) * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -15 - Math.random() * 10
      ]}
    >
      <planeGeometry args={[1.5, 2]} />
      <meshStandardMaterial color="#F5F5DC" side={THREE.DoubleSide} />
    </mesh>
  );
}

// ============================================
// 4. HIGH SCHOOL - Chaotic energy
// ============================================
export function HighSchoolEnvironment({ flipTrigger }) {
  const groupRef = useRef();
  const chaosRef = useRef(0);

  useFrame((state) => {
    // Increase visual chaos over time
    chaosRef.current = Math.min(1, chaosRef.current + 0.001);

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 * chaosRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dramatic gradient background */}
      <mesh position={[0, 0, -35]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>

      {/* Swirling chaos particles */}
      {Array.from({ length: 80 }).map((_, i) => (
        <ChaosParticle key={i} index={i} />
      ))}

      {/* Pulsing warning lights */}
      <PulsingLight position={[-15, 10, -20]} color="#FF4444" />
      <PulsingLight position={[15, 10, -20]} color="#FF4444" />
      <PulsingLight position={[0, -10, -20]} color="#FF8800" />
    </group>
  );
}

function ChaosParticle({ index }) {
  const meshRef = useRef();
  const speed = 0.5 + Math.random() * 1.5;
  const radius = 10 + Math.random() * 15;
  const offset = index * 0.3;

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed + offset;
      meshRef.current.position.x = Math.sin(t) * radius;
      meshRef.current.position.y = Math.cos(t * 0.7) * radius * 0.6;
      meshRef.current.position.z = -20 + Math.sin(t * 0.5) * 5;
    }
  });

  const color = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'][index % 4];

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.1 + Math.random() * 0.15, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function PulsingLight({ position, color }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }
  });

  return (
    <pointLight ref={lightRef} position={position} color={color} intensity={1.5} distance={30} />
  );
}

// ============================================
// 5. COLLEGE - Academic late night vibes
// ============================================
export function CollegeEnvironment() {
  const equationsRef = useRef();

  useFrame((state) => {
    if (equationsRef.current) {
      equationsRef.current.children.forEach((eq, i) => {
        eq.position.y += Math.sin(state.clock.elapsedTime + i) * 0.002;
      });
    }
  });

  return (
    <group>
      {/* Dark blue/purple background - late night study */}
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[70, 50]} />
        <meshStandardMaterial color="#1A1A3A" />
      </mesh>

      {/* Floating equation symbols */}
      <group ref={equationsRef}>
        {Array.from({ length: 30 }).map((_, i) => (
          <FloatingSymbol key={i} index={i} />
        ))}
      </group>

      {/* Desk lamp glow effect */}
      <pointLight position={[5, 5, -10]} color="#FFE4B5" intensity={2} distance={25} />
      <pointLight position={[-8, -3, -15]} color="#87CEEB" intensity={1} distance={20} />

      {/* Coffee cup steam particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <SteamParticle key={i} basePosition={[-10, -8, -15]} index={i} />
      ))}
    </group>
  );
}

function FloatingSymbol({ index }) {
  const symbols = ['∫', '∑', '∂', '∇', 'π', 'θ', 'λ', '∞', '≈', '±'];
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.005;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + index) * 0.1;
    }
  });

  // Create a simple glow sphere to represent the symbol
  return (
    <mesh
      ref={meshRef}
      position={[
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 25,
        -18 - Math.random() * 10
      ]}
    >
      <sphereGeometry args={[0.2 + Math.random() * 0.3, 8, 8]} />
      <meshBasicMaterial
        color={['#00CED1', '#9370DB', '#FFD700'][index % 3]}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function SteamParticle({ basePosition, index }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + index * 0.3;
      meshRef.current.position.y = basePosition[1] + (t % 3) * 2;
      meshRef.current.position.x = basePosition[0] + Math.sin(t * 2) * 0.5;
      meshRef.current.material.opacity = Math.max(0, 0.5 - ((t % 3) / 3) * 0.5);
    }
  });

  return (
    <mesh ref={meshRef} position={basePosition}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
    </mesh>
  );
}

// ============================================
// 6. FIRST JOB - Office/professional
// ============================================
export function JobEnvironment() {
  return (
    <group>
      {/* Corporate blue-gray background */}
      <mesh position={[0, 0, -35]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* Grid pattern - corporate structure */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, -20 + i * 5, -30]}>
          <boxGeometry args={[60, 0.05, 0.1]} />
          <meshBasicMaterial color="#3498DB" transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[-30 + i * 5, 0, -30]}>
          <boxGeometry args={[0.05, 50, 0.1]} />
          <meshBasicMaterial color="#3498DB" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Floating charts/graphs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <FloatingChart key={i} index={i} />
      ))}

      {/* Office lights */}
      <pointLight position={[0, 15, -15]} color="#FFFFFF" intensity={1.5} distance={40} />
    </group>
  );
}

function FloatingChart({ index }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + index) * 0.1;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -20 - Math.random() * 8
      ]}
    >
      {/* Chart background */}
      <mesh>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#34495E" transparent opacity={0.8} />
      </mesh>
      {/* Bar chart bars */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-1 + i * 0.5, -0.5 + Math.random() * 0.8, 0.1]}>
          <boxGeometry args={[0.3, 0.5 + Math.random() * 1, 0.1]} />
          <meshStandardMaterial color={['#3498DB', '#2ECC71', '#E74C3C', '#F39C12', '#9B59B6'][i]} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// 7. NASA LAB - Tech screens, science
// ============================================
export function NasaEnvironment() {
  const screensRef = useRef();

  useFrame((state) => {
    if (screensRef.current) {
      screensRef.current.children.forEach((screen, i) => {
        // Flickering effect
        if (screen.material) {
          screen.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.1;
        }
      });
    }
  });

  return (
    <group>
      {/* Dark tech background */}
      <mesh position={[0, 0, -35]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#0A0A1A" />
      </mesh>

      {/* Control room screens */}
      <group ref={screensRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ControlScreen key={i} index={i} />
        ))}
      </group>

      {/* Data streams */}
      {Array.from({ length: 40 }).map((_, i) => (
        <DataParticle key={i} index={i} />
      ))}

      {/* Blue tech lighting */}
      <pointLight position={[0, 0, -10]} color="#00BFFF" intensity={2} distance={30} />
      <pointLight position={[-15, 10, -15]} color="#00FF88" intensity={1} distance={25} />
      <pointLight position={[15, -10, -15]} color="#FF6B00" intensity={0.8} distance={20} />
    </group>
  );
}

function ControlScreen({ index }) {
  const row = Math.floor(index / 4);
  const col = index % 4;

  return (
    <mesh position={[-12 + col * 8, 8 - row * 6, -25]}>
      <planeGeometry args={[5, 3]} />
      <meshStandardMaterial
        color="#001122"
        emissive="#00BFFF"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function DataParticle({ index }) {
  const meshRef = useRef();
  const speed = 2 + Math.random() * 3;
  const xPos = (Math.random() - 0.5) * 40;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 20 - ((state.clock.elapsedTime * speed + index) % 40);
      meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[xPos, 0, -20 - Math.random() * 10]}>
      <boxGeometry args={[0.05, 0.3 + Math.random() * 0.5, 0.05]} />
      <meshBasicMaterial color="#00FF88" transparent opacity={0.5} />
    </mesh>
  );
}

// ============================================
// 8. ROCKET LAUNCH - Fire, countdown
// ============================================
export function RocketEnvironment({ flipTrigger }) {
  const flamesRef = useRef();
  const shakeRef = useRef(0);

  useFrame((state) => {
    // Increase shake intensity
    shakeRef.current = Math.min(1, shakeRef.current + 0.002);

    if (flamesRef.current) {
      flamesRef.current.children.forEach((flame, i) => {
        flame.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10 + i) * 0.3;
        flame.position.y = -15 + Math.sin(state.clock.elapsedTime * 8 + i) * 0.5;
      });
    }
  });

  return (
    <group>
      {/* Night sky gradient */}
      <mesh position={[0, 10, -40]}>
        <planeGeometry args={[100, 80]} />
        <meshBasicMaterial color="#0A0A2A" />
      </mesh>

      {/* Ground/launch pad */}
      <mesh position={[0, -20, -30]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#2A2A2A" />
      </mesh>

      {/* Rocket flames */}
      <group ref={flamesRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <RocketFlame key={i} index={i} />
        ))}
      </group>

      {/* Smoke clouds */}
      {Array.from({ length: 30 }).map((_, i) => (
        <SmokeCloud key={i} index={i} />
      ))}

      {/* Fire lighting */}
      <pointLight position={[0, -10, -15]} color="#FF4500" intensity={3} distance={40} />
      <pointLight position={[0, -15, -10]} color="#FFD700" intensity={2} distance={30} />
    </group>
  );
}

function RocketFlame({ index }) {
  const xOffset = (Math.random() - 0.5) * 8;
  const color = ['#FF4500', '#FF6B00', '#FFD700', '#FFFF00'][index % 4];

  return (
    <mesh position={[xOffset, -15, -20]}>
      <coneGeometry args={[0.5 + Math.random() * 0.5, 3 + Math.random() * 2, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function SmokeCloud({ index }) {
  const meshRef = useRef();
  const startX = (Math.random() - 0.5) * 20;

  useFrame((state) => {
    if (meshRef.current) {
      const t = (state.clock.elapsedTime * 0.5 + index * 0.1) % 5;
      meshRef.current.position.y = -18 + t * 8;
      meshRef.current.position.x = startX + Math.sin(t + index) * 5;
      meshRef.current.scale.setScalar(1 + t * 0.5);
      meshRef.current.material.opacity = Math.max(0, 0.4 - t * 0.08);
    }
  });

  return (
    <mesh ref={meshRef} position={[startX, -18, -22 - Math.random() * 5]}>
      <sphereGeometry args={[1 + Math.random(), 8, 8]} />
      <meshBasicMaterial color="#888888" transparent opacity={0.3} />
    </mesh>
  );
}

// ============================================
// 9. MOON - Lunar surface, Earth visible
// ============================================
export function MoonEnvironment() {
  const earthRef = useRef();
  const starsRef = useRef();

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      {/* Space background */}
      <mesh position={[0, 0, -60]}>
        <planeGeometry args={[150, 100]} />
        <meshBasicMaterial color="#000005" />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 200 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 70,
            -50 - Math.random() * 10
          ]}
        >
          <sphereGeometry args={[0.03 + Math.random() * 0.05, 4, 4]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Earth in the distance */}
      <group ref={earthRef} position={[20, 15, -45]}>
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        {/* Continents hint */}
        <mesh>
          <sphereGeometry args={[5.05, 32, 32]} />
          <meshStandardMaterial color="#228B22" transparent opacity={0.5} />
        </mesh>
        {/* Atmosphere glow */}
        <mesh>
          <sphereGeometry args={[5.3, 32, 32]} />
          <meshBasicMaterial color="#87CEEB" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Lunar surface (gray terrain) */}
      <mesh position={[0, -15, -20]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#808080" roughness={1} />
      </mesh>

      {/* Craters */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 40,
            -14 - Math.random() * 3,
            -15 - Math.random() * 10
          ]}
          rotation={[-1.5, 0, 0]}
        >
          <ringGeometry args={[0.5 + Math.random() * 1.5, 1 + Math.random() * 2, 16]} />
          <meshStandardMaterial color="#606060" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Moon ambient light */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 10]} intensity={1} color="#FFFACD" />
    </group>
  );
}

// ============================================
// Helper: Get background component by name
// ============================================
export function getLevelBackground(backgroundName, flipTrigger) {
  switch (backgroundName) {
    case 'daycare':
      return <DaycareEnvironment />;
    case 'elementary':
      return <ElementaryEnvironment />;
    case 'middleschool':
      return <MiddleSchoolEnvironment />;
    case 'highschool':
      return <HighSchoolEnvironment flipTrigger={flipTrigger} />;
    case 'college':
      return <CollegeEnvironment />;
    case 'job':
      return <JobEnvironment />;
    case 'nasa':
      return <NasaEnvironment />;
    case 'rocket':
      return <RocketEnvironment flipTrigger={flipTrigger} />;
    case 'moon':
      return <MoonEnvironment />;
    // 'blackhole' is handled separately by existing BlackHoleEnvironment
    default:
      return null;
  }
}
