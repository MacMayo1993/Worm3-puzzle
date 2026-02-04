/**
 * Life Journey Background Environments - Realistic 3D Scenes
 * Daycare → Elementary → Middle → High → College → Job → NASA → Rocket → Moon
 * Actual 3D environments you can look around in!
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// 1. DAYCARE - Colorful playroom
// ============================================
export function DaycareEnvironment({ flipTrigger = 0 }) {
  const toysRef = useRef();

  useFrame((state) => {
    if (toysRef.current) {
      toysRef.current.children.forEach((toy, i) => {
        toy.rotation.y = state.clock.elapsedTime * 0.2 + i;
        toy.position.y = toy.userData.baseY + Math.sin(state.clock.elapsedTime + i) * 0.1;
      });
    }
  });

  const blockColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#FF8C42', '#A8E6CF'];

  return (
    <group>
      {/* Room - soft pastel walls */}
      {/* Floor - colorful play mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#98D8C8" />
      </mesh>

      {/* Colorful floor tiles */}
      {Array.from({ length: 8 }).map((_, i) =>
        Array.from({ length: 8 }).map((_, j) => (
          <mesh key={`tile-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[-28 + i * 8, -7.9, -28 + j * 8]}>
            <planeGeometry args={[7.5, 7.5]} />
            <meshStandardMaterial color={blockColors[(i + j) % blockColors.length]} opacity={0.3} transparent />
          </mesh>
        ))
      )}

      {/* Walls */}
      <mesh position={[0, 12, -40]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#FFF5E6" />
      </mesh>
      <mesh position={[-40, 12, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#FFE4E1" />
      </mesh>
      <mesh position={[40, 12, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#E6F3FF" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 32, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#FFFAF0" />
      </mesh>

      {/* Floating toy blocks */}
      <group ref={toysRef}>
        {Array.from({ length: 20 }).map((_, i) => {
          const baseY = 2 + Math.random() * 8;
          return (
            <mesh
              key={`block-${i}`}
              position={[
                (Math.random() - 0.5) * 50,
                baseY,
                (Math.random() - 0.5) * 50 - 10
              ]}
              userData={{ baseY }}
            >
              <boxGeometry args={[1.5 + Math.random(), 1.5 + Math.random(), 1.5 + Math.random()]} />
              <meshStandardMaterial color={blockColors[i % blockColors.length]} />
            </mesh>
          );
        })}
      </group>

      {/* Toy shelves on walls */}
      {[-25, 0, 25].map((x, i) => (
        <group key={`shelf-${i}`} position={[x, 5, -38]}>
          <mesh>
            <boxGeometry args={[12, 0.5, 3]} />
            <meshStandardMaterial color="#DEB887" />
          </mesh>
          {/* Toys on shelf */}
          {Array.from({ length: 4 }).map((_, j) => (
            <mesh key={j} position={[-4 + j * 2.5, 1, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color={blockColors[(i + j) % blockColors.length]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Soft area rug in center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.8, 5]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* Ceiling lights */}
      {[[-15, 0], [15, 0], [0, -15], [0, 15]].map(([x, z], i) => (
        <group key={`light-${i}`}>
          <mesh position={[x, 30, z]}>
            <cylinderGeometry args={[2, 2, 0.5, 16]} />
            <meshBasicMaterial color="#FFFACD" />
          </mesh>
          <pointLight position={[x, 28, z]} color="#FFF8DC" intensity={0.8} distance={40} />
        </group>
      ))}

      {/* Window with sunlight */}
      <group position={[38, 15, 0]}>
        <mesh>
          <boxGeometry args={[1, 12, 16]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[5, 0, 0]} color="#FFF8DC" intensity={1} distance={30} />
      </group>

      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
    </group>
  );
}

// ============================================
// 2. ELEMENTARY - Classroom
// ============================================
export function ElementaryEnvironment({ flipTrigger = 0 }) {
  const starsRef = useRef();

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.children.forEach((star, i) => {
        star.rotation.z = state.clock.elapsedTime * 0.5 + i;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
        star.scale.setScalar(scale);
      });
    }
  });

  return (
    <group>
      {/* Floor - classroom tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#C4A484" />
      </mesh>

      {/* Chalkboard wall */}
      <mesh position={[0, 10, -38]}>
        <planeGeometry args={[80, 36]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Actual chalkboard */}
      <mesh position={[0, 12, -37]}>
        <boxGeometry args={[35, 15, 0.5]} />
        <meshStandardMaterial color="#2D5A27" />
      </mesh>
      {/* Chalkboard frame */}
      <mesh position={[0, 12, -36.7]}>
        <boxGeometry args={[36, 16, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 12, -36.5]}>
        <boxGeometry args={[35, 15, 0.3]} />
        <meshStandardMaterial color="#2D5A27" />
      </mesh>

      {/* Chalk tray */}
      <mesh position={[0, 4, -36]}>
        <boxGeometry args={[30, 0.5, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Side walls */}
      <mesh position={[-40, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[80, 36]} />
        <meshStandardMaterial color="#FAFAD2" />
      </mesh>
      <mesh position={[40, 10, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[80, 36]} />
        <meshStandardMaterial color="#FAFAD2" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 28, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#FFFFF0" />
      </mesh>

      {/* Student desks in rows */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <group key={`desk-${row}-${col}`} position={[-16 + col * 8, -5, 5 + row * 8]}>
            {/* Desk top */}
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[5, 0.3, 4]} />
              <meshStandardMaterial color="#DEB887" />
            </mesh>
            {/* Desk legs */}
            {[[-2, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5]].map(([x, z], i) => (
              <mesh key={i} position={[x, 0, z]}>
                <boxGeometry args={[0.3, 4, 0.3]} />
                <meshStandardMaterial color="#4A4A4A" />
              </mesh>
            ))}
            {/* Chair */}
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

      {/* Teacher's desk */}
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

      {/* Gold stars floating around */}
      <group ref={starsRef}>
        {Array.from({ length: 15 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 60,
              10 + Math.random() * 15,
              (Math.random() - 0.5) * 60
            ]}
          >
            <cylinderGeometry args={[0.8, 0.8, 0.1, 5]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Alphabet banner on wall */}
      <mesh position={[0, 22, -37]}>
        <boxGeometry args={[40, 3, 0.1]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* Windows on side wall */}
      {[-20, 0, 20].map((z, i) => (
        <group key={i} position={[39, 12, z]}>
          <mesh>
            <boxGeometry args={[0.5, 10, 8]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.2} />
          </mesh>
          <pointLight position={[3, 0, 0]} color="#FFFACD" intensity={0.5} distance={20} />
        </group>
      ))}

      {/* Fluorescent lights */}
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

// ============================================
// 3. MIDDLE SCHOOL - Hallway with lockers
// ============================================
export function MiddleSchoolEnvironment({ flipTrigger = 0 }) {
  const papersRef = useRef();

  useFrame((state) => {
    if (papersRef.current) {
      papersRef.current.children.forEach((paper, i) => {
        paper.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.2;
        paper.rotation.z = Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.1;
        paper.position.y = paper.userData.baseY + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.5;
      });
    }
  });

  const lockerColors = ['#4169E1', '#4682B4', '#5F9EA0', '#6495ED'];

  return (
    <group>
      {/* Floor - linoleum tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[30, 100]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>

      {/* Tile pattern */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i % 2) * 2 - 1, -7.9, -45 + Math.floor(i / 2) * 4]}>
          <planeGeometry args={[1.9, 3.9]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#C0C0C0' : '#E8E8E8'} />
        </mesh>
      ))}

      {/* Left wall with lockers */}
      <mesh position={[-14, 8, 0]}>
        <boxGeometry args={[1, 32, 100]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Left side lockers */}
      {Array.from({ length: 25 }).map((_, i) => (
        <group key={`locker-l-${i}`} position={[-13, 2, -46 + i * 4]}>
          {/* Locker body */}
          <mesh>
            <boxGeometry args={[1, 18, 3.5]} />
            <meshStandardMaterial color={lockerColors[i % lockerColors.length]} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Locker vent */}
          <mesh position={[0.6, 6, 0]}>
            <boxGeometry args={[0.1, 3, 2]} />
            <meshStandardMaterial color="#2F4F4F" />
          </mesh>
          {/* Locker handle */}
          <mesh position={[0.6, 0, 1]}>
            <boxGeometry args={[0.2, 0.5, 0.3]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Right wall with lockers */}
      <mesh position={[14, 8, 0]}>
        <boxGeometry args={[1, 32, 100]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Right side lockers */}
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

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 24, 0]}>
        <planeGeometry args={[30, 100]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>

      {/* Ceiling tiles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 23.9, -46 + i * 4]}>
          <planeGeometry args={[28, 3.8]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
      ))}

      {/* Fluorescent lights */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} position={[0, 22, -44 + i * 8]}>
          <mesh>
            <boxGeometry args={[3, 0.3, 1.5]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <pointLight color="#F0F8FF" intensity={0.8} distance={15} />
        </group>
      ))}

      {/* Floating notebook papers */}
      <group ref={papersRef}>
        {Array.from({ length: 12 }).map((_, i) => {
          const baseY = 5 + Math.random() * 10;
          return (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 20,
                baseY,
                (Math.random() - 0.5) * 80
              ]}
              userData={{ baseY }}
            >
              <planeGeometry args={[1.5, 2]} />
              <meshStandardMaterial color="#FFFEF0" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>

      {/* Exit sign */}
      <mesh position={[0, 20, -48]}>
        <boxGeometry args={[4, 1.5, 0.3]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>

      {/* Water fountain */}
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

// ============================================
// 4. HIGH SCHOOL - Chaotic cafeteria
// ============================================
export function HighSchoolEnvironment({ flipTrigger = 0 }) {
  const traysRef = useRef();

  useFrame((state) => {
    if (traysRef.current) {
      traysRef.current.children.forEach((tray, i) => {
        tray.rotation.y = state.clock.elapsedTime * 0.3 + i;
        tray.position.y = tray.userData.baseY + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
      });
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#8B8682" />
      </mesh>

      {/* Walls - darker, moodier */}
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

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 32, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>

      {/* Cafeteria tables */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 3 }).map((_, col) => (
          <group key={`table-${row}-${col}`} position={[-20 + col * 20, -6, -15 + row * 12]}>
            {/* Table top */}
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[14, 0.5, 4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Bench seats */}
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

      {/* Floating food trays - chaos! */}
      <group ref={traysRef}>
        {Array.from({ length: 15 }).map((_, i) => {
          const baseY = 8 + Math.random() * 12;
          return (
            <group
              key={i}
              position={[
                (Math.random() - 0.5) * 50,
                baseY,
                (Math.random() - 0.5) * 50
              ]}
              userData={{ baseY }}
            >
              <mesh>
                <boxGeometry args={[2, 0.2, 1.5]} />
                <meshStandardMaterial color="#CD853F" />
              </mesh>
              {/* Food on tray */}
              <mesh position={[-0.5, 0.3, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial color="#FF6347" />
              </mesh>
              <mesh position={[0.5, 0.3, 0]}>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#FFD700" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Vending machines */}
      {[-30, 30].map((x, i) => (
        <group key={i} position={[x, 0, -35]}>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[5, 10, 3]} />
            <meshStandardMaterial color={i === 0 ? '#FF0000' : '#0000FF'} />
          </mesh>
          {/* Display window */}
          <mesh position={[0, 5, 1.6]}>
            <boxGeometry args={[4, 6, 0.1]} />
            <meshStandardMaterial color="#333333" emissive="#222222" />
          </mesh>
        </group>
      ))}

      {/* Chaotic lighting - some flickering */}
      {[[-20, -10], [0, -10], [20, -10], [-20, 15], [0, 15], [20, 15]].map(([x, z], i) => (
        <pointLight
          key={i}
          position={[x, 28, z]}
          color={['#FF6B6B', '#4ECDC4', '#FFE66D'][i % 3]}
          intensity={0.6}
          distance={25}
        />
      ))}

      {/* Warning/exit lights */}
      <pointLight position={[0, 30, 0]} color="#FF4444" intensity={0.5} distance={40} />

      <ambientLight intensity={0.3} />
    </group>
  );
}

// ============================================
// 5. COLLEGE - Dorm room / study space
// ============================================
export function CollegeEnvironment({ flipTrigger = 0 }) {
  const booksRef = useRef();
  const steamRef = useRef();

  useFrame((state) => {
    if (booksRef.current) {
      booksRef.current.children.forEach((book, i) => {
        book.position.y = book.userData.baseY + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.2;
        book.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.1;
      });
    }
    if (steamRef.current) {
      steamRef.current.children.forEach((particle, i) => {
        particle.position.y = ((state.clock.elapsedTime * 2 + i) % 5) - 2;
        particle.position.x = Math.sin(state.clock.elapsedTime + i) * 0.3;
        particle.material.opacity = 0.3 - (particle.position.y + 2) / 5 * 0.3;
      });
    }
  });

  return (
    <group>
      {/* Floor - carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2F4F4F" />
      </mesh>

      {/* Walls - dark for late night */}
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

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 24, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0F0F1A" />
      </mesh>

      {/* Desk with lamp */}
      <group position={[10, -6, -18]}>
        {/* Desk */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[12, 0.5, 6]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
        {/* Desk drawers */}
        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[3, 4, 5]} />
          <meshStandardMaterial color="#3D2914" />
        </mesh>

        {/* Desk lamp */}
        <group position={[-4, 2.5, -1]}>
          <mesh position={[0, 0, 0]}>
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

        {/* Laptop */}
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

      {/* Coffee mug with steam */}
      <group position={[15, -3, -16]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.4, 1.2, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
          <meshStandardMaterial color="#3D2914" />
        </mesh>
        {/* Steam particles */}
        <group ref={steamRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0, 1 + i * 0.3, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Bookshelf */}
      <group position={[-20, 0, -20]}>
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[8, 16, 2]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
        {/* Books on shelves */}
        {[2, 6, 10, 14].map((y, shelf) => (
          <group key={shelf}>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[-2.5 + i * 0.9, y - 5, 0]}>
                <boxGeometry args={[0.7, 2 + Math.random(), 1.5]} />
                <meshStandardMaterial color={['#8B0000', '#00008B', '#006400', '#4B0082', '#8B4513', '#2F4F4F'][i]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Floating books/papers - studying */}
      <group ref={booksRef}>
        {Array.from({ length: 10 }).map((_, i) => {
          const baseY = 5 + Math.random() * 10;
          return (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 30,
                baseY,
                (Math.random() - 0.5) * 30
              ]}
              userData={{ baseY }}
            >
              <boxGeometry args={[1.5, 0.2, 2]} />
              <meshStandardMaterial color={['#8B0000', '#00008B', '#006400'][i % 3]} />
            </mesh>
          );
        })}
      </group>

      {/* Window with moonlight */}
      <group position={[24, 8, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 12, 10]} />
          <meshStandardMaterial color="#1a1a3a" emissive="#1a1a3a" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[3, 0, 0]} color="#B0C4DE" intensity={0.3} distance={20} />
      </group>

      {/* Bed */}
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

// ============================================
// 6. FIRST JOB - Office cubicles
// ============================================
export function JobEnvironment({ flipTrigger = 0 }) {
  const chartsRef = useRef();

  useFrame((state) => {
    if (chartsRef.current) {
      chartsRef.current.children.forEach((chart, i) => {
        chart.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.1;
      });
    }
  });

  return (
    <group>
      {/* Floor - office carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 6, -40]}>
        <planeGeometry args={[80, 28]} />
        <meshStandardMaterial color="#CBD5E0" />
      </mesh>

      {/* Cubicle farm */}
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <group key={`cubicle-${row}-${col}`} position={[-24 + col * 16, -6, -20 + row * 16]}>
            {/* Cubicle walls */}
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

            {/* Desk */}
            <mesh position={[0, 1, -2]}>
              <boxGeometry args={[9, 0.3, 5]} />
              <meshStandardMaterial color="#718096" />
            </mesh>

            {/* Monitor */}
            <mesh position={[0, 4, -3]}>
              <boxGeometry args={[4, 3, 0.2]} />
              <meshStandardMaterial color="#1A202C" emissive="#2D3748" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 2, -3]}>
              <boxGeometry args={[0.5, 2, 0.5]} />
              <meshStandardMaterial color="#2D3748" />
            </mesh>

            {/* Office chair */}
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

      {/* Floating charts/graphs */}
      <group ref={chartsRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <group
            key={i}
            position={[
              (Math.random() - 0.5) * 50,
              10 + Math.random() * 8,
              (Math.random() - 0.5) * 50
            ]}
          >
            <mesh>
              <planeGeometry args={[4, 3]} />
              <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
            </mesh>
            {/* Bar chart */}
            {Array.from({ length: 5 }).map((_, j) => (
              <mesh key={j} position={[-1.2 + j * 0.6, -1 + Math.random() * 1.5, 0.1]}>
                <boxGeometry args={[0.4, 0.5 + Math.random() * 1.5, 0.1]} />
                <meshStandardMaterial color={['#3182CE', '#38A169', '#E53E3E', '#DD6B20', '#805AD5'][j]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Water cooler */}
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

      {/* Fluorescent lights */}
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

// ============================================
// 7. NASA - Mission Control
// ============================================
export function NasaEnvironment({ flipTrigger = 0 }) {
  const screensRef = useRef();
  const dataRef = useRef();

  useFrame((state) => {
    if (screensRef.current) {
      screensRef.current.children.forEach((screen, i) => {
        if (screen.material && screen.material.emissiveIntensity !== undefined) {
          screen.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.1;
        }
      });
    }
    if (dataRef.current) {
      dataRef.current.children.forEach((particle, i) => {
        particle.position.y = 20 - ((state.clock.elapsedTime * 5 + i * 2) % 30);
      });
    }
  });

  return (
    <group>
      {/* Floor - dark tech */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#0A0A1A" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 12, -30]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#0D0D1A" />
      </mesh>

      {/* Main display wall - huge screens */}
      <group position={[0, 10, -28]}>
        {/* Giant center screen */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[30, 15, 0.5]} />
          <meshStandardMaterial color="#001122" emissive="#003366" emissiveIntensity={0.3} />
        </mesh>
        {/* Side screens */}
        <mesh position={[-22, 5, 2]}>
          <boxGeometry args={[12, 12, 0.5]} />
          <meshStandardMaterial color="#001122" emissive="#006633" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[22, 5, 2]}>
          <boxGeometry args={[12, 12, 0.5]} />
          <meshStandardMaterial color="#001122" emissive="#660033" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Control consoles - tiered */}
      {[0, 8, 16].map((z, tier) => (
        <group key={tier} position={[0, -6 + tier * 0.5, z]}>
          {Array.from({ length: 6 - tier }).map((_, i) => (
            <group key={i} position={[-20 + tier * 5 + i * (10 - tier), 0, 0]}>
              {/* Console desk */}
              <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[8, 3, 4]} />
                <meshStandardMaterial color="#1A1A2E" />
              </mesh>
              {/* Screens on console */}
              <group ref={tier === 0 && i === 2 ? screensRef : null}>
                <mesh position={[-2, 4, -1]}>
                  <boxGeometry args={[3, 2.5, 0.2]} />
                  <meshStandardMaterial color="#000510" emissive="#00BFFF" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[2, 4, -1]}>
                  <boxGeometry args={[3, 2.5, 0.2]} />
                  <meshStandardMaterial color="#000510" emissive="#00FF88" emissiveIntensity={0.3} />
                </mesh>
              </group>
              {/* Chair */}
              <mesh position={[0, 0, 4]}>
                <boxGeometry args={[3, 0.5, 3]} />
                <meshStandardMaterial color="#2D2D44" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Data stream particles */}
      <group ref={dataRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 60,
              Math.random() * 30,
              (Math.random() - 0.5) * 40
            ]}
          >
            <boxGeometry args={[0.1, 0.5 + Math.random() * 0.5, 0.1]} />
            <meshBasicMaterial color="#00FF88" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* NASA logo area */}
      <mesh position={[0, 22, -29]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color="#0B3D91" />
      </mesh>

      {/* Ceiling - dark with tech panels */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 28, 0]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#050510" />
      </mesh>

      {/* Blue ambient tech lighting */}
      <pointLight position={[0, 20, -20]} color="#00BFFF" intensity={1} distance={40} />
      <pointLight position={[-30, 10, 0]} color="#00FF88" intensity={0.5} distance={30} />
      <pointLight position={[30, 10, 0]} color="#FF6B00" intensity={0.5} distance={30} />

      <ambientLight intensity={0.15} />
    </group>
  );
}

// ============================================
// 8. ROCKET - Launch pad
// ============================================
export function RocketEnvironment({ flipTrigger = 0 }) {
  const flameRef = useRef();
  const smokeRef = useRef();

  useFrame((state) => {
    if (flameRef.current) {
      flameRef.current.children.forEach((flame, i) => {
        flame.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10 + i) * 0.3;
        flame.position.y = -12 + Math.sin(state.clock.elapsedTime * 8 + i) * 0.5;
      });
    }
    if (smokeRef.current) {
      smokeRef.current.children.forEach((cloud, i) => {
        const t = (state.clock.elapsedTime * 0.5 + i * 0.2) % 4;
        cloud.position.y = -10 + t * 10;
        cloud.position.x = cloud.userData.startX + Math.sin(t * 2 + i) * 5;
        cloud.scale.setScalar(1 + t * 0.5);
        cloud.material.opacity = Math.max(0, 0.5 - t * 0.12);
      });
    }
  });

  return (
    <group>
      {/* Ground - launch pad concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3A3A3A" />
      </mesh>

      {/* Launch pad platform */}
      <mesh position={[0, -14, 0]}>
        <cylinderGeometry args={[15, 15, 2, 32]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>

      {/* Night sky dome */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#0A0A1A" side={THREE.BackSide} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 200 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5;
        const r = 75;
        return (
          <mesh
            key={i}
            position={[
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.cos(phi) + 10,
              r * Math.sin(phi) * Math.sin(theta)
            ]}
          >
            <sphereGeometry args={[0.1 + Math.random() * 0.2, 4, 4]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}

      {/* Rocket */}
      <group position={[0, 10, 0]}>
        {/* Rocket body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[3, 3, 25, 32]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 15, 0]}>
          <coneGeometry args={[3, 8, 32]} />
          <meshStandardMaterial color="#FF4500" />
        </mesh>
        {/* Fins */}
        {[0, 120, 240].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(angle * Math.PI / 180) * 3,
              -10,
              Math.cos(angle * Math.PI / 180) * 3
            ]}
            rotation={[0, -angle * Math.PI / 180, 0]}
          >
            <boxGeometry args={[0.5, 8, 4]} />
            <meshStandardMaterial color="#FF4500" />
          </mesh>
        ))}
        {/* Engine nozzles */}
        <mesh position={[0, -13, 0]}>
          <cylinderGeometry args={[2.5, 3.5, 3, 32]} />
          <meshStandardMaterial color="#333333" metalness={0.8} />
        </mesh>
      </group>

      {/* Launch tower/gantry */}
      <group position={[12, 0, 0]}>
        {/* Main tower */}
        <mesh position={[0, 15, 0]}>
          <boxGeometry args={[4, 50, 4]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        {/* Cross beams */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-4, -10 + i * 6, 0]}>
            <boxGeometry args={[8, 0.5, 1]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
        ))}
        {/* Arm to rocket */}
        <mesh position={[-6, 20, 0]}>
          <boxGeometry args={[10, 2, 3]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </group>

      {/* Flames */}
      <group ref={flameRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 4,
              -12,
              (Math.random() - 0.5) * 4
            ]}
          >
            <coneGeometry args={[0.8 + Math.random() * 0.5, 5 + Math.random() * 3, 8]} />
            <meshBasicMaterial
              color={['#FFFF00', '#FF8C00', '#FF4500', '#FF0000'][i % 4]}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Smoke clouds */}
      <group ref={smokeRef}>
        {Array.from({ length: 25 }).map((_, i) => {
          const startX = (Math.random() - 0.5) * 20;
          return (
            <mesh
              key={i}
              position={[startX, -10, (Math.random() - 0.5) * 10]}
              userData={{ startX }}
            >
              <sphereGeometry args={[2 + Math.random() * 2, 8, 8]} />
              <meshBasicMaterial color="#888888" transparent opacity={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* Fire lighting */}
      <pointLight position={[0, -10, 0]} color="#FF4500" intensity={3} distance={50} />
      <pointLight position={[0, -15, 0]} color="#FFD700" intensity={2} distance={40} />

      <ambientLight intensity={0.2} />
    </group>
  );
}

// ============================================
// 9. MOON - Lunar surface
// ============================================
export function MoonEnvironment({ flipTrigger = 0 }) {
  const earthRef = useRef();
  const flagRef = useRef();

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group>
      {/* Lunar surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#808080" roughness={1} />
      </mesh>

      {/* Space sky dome */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial color="#000005" side={THREE.BackSide} />
      </mesh>

      {/* Dense starfield */}
      {Array.from({ length: 500 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 95;
        return (
          <mesh
            key={i}
            position={[
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.cos(phi),
              r * Math.sin(phi) * Math.sin(theta)
            ]}
          >
            <sphereGeometry args={[0.05 + Math.random() * 0.1, 4, 4]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}

      {/* Earth in the sky */}
      <group ref={earthRef} position={[40, 40, -50]}>
        <mesh>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        {/* Continents */}
        <mesh>
          <sphereGeometry args={[12.1, 32, 32]} />
          <meshStandardMaterial color="#228B22" transparent opacity={0.5} />
        </mesh>
        {/* Atmosphere */}
        <mesh>
          <sphereGeometry args={[13, 32, 32]} />
          <meshBasicMaterial color="#87CEEB" transparent opacity={0.15} />
        </mesh>
        <pointLight color="#87CEEB" intensity={0.5} distance={100} />
      </group>

      {/* Craters */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        const size = 2 + Math.random() * 8;
        return (
          <group key={i} position={[x, -8, z]}>
            {/* Crater rim */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
              <ringGeometry args={[size * 0.7, size, 32]} />
              <meshStandardMaterial color="#909090" />
            </mesh>
            {/* Crater floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
              <circleGeometry args={[size * 0.7, 32]} />
              <meshStandardMaterial color="#606060" />
            </mesh>
          </group>
        );
      })}

      {/* Lunar module */}
      <group position={[15, -5, -20]}>
        {/* Body */}
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[5, 4, 5]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Legs */}
        {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
        ))}
        {/* Foot pads */}
        {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([x, z], i) => (
          <mesh key={i} position={[x, -2, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1, 16]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
        ))}
      </group>

      {/* American flag */}
      <group position={[10, -6, -15]}>
        {/* Pole */}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        {/* Flag */}
        <group ref={flagRef} position={[1.5, 6, 0]}>
          <mesh>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial color="#BF0A30" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Astronaut footprints trail */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, Math.random() * 0.3]}
          position={[5 + i * 2, -7.9, -10 + Math.sin(i) * 2]}
        >
          <planeGeometry args={[0.4, 0.8]} />
          <meshStandardMaterial color="#707070" />
        </mesh>
      ))}

      {/* Sun light from the side */}
      <directionalLight position={[50, 30, 30]} intensity={1.5} color="#FFFACD" />

      <ambientLight intensity={0.1} />
    </group>
  );
}

// ============================================
// Helper: Get background component by name
// ============================================
export function getLevelBackground(backgroundName, flipTrigger) {
  switch (backgroundName) {
    case 'daycare':
      return <DaycareEnvironment flipTrigger={flipTrigger} />;
    case 'elementary':
      return <ElementaryEnvironment flipTrigger={flipTrigger} />;
    case 'middleschool':
      return <MiddleSchoolEnvironment flipTrigger={flipTrigger} />;
    case 'highschool':
      return <HighSchoolEnvironment flipTrigger={flipTrigger} />;
    case 'college':
      return <CollegeEnvironment flipTrigger={flipTrigger} />;
    case 'job':
      return <JobEnvironment flipTrigger={flipTrigger} />;
    case 'nasa':
      return <NasaEnvironment flipTrigger={flipTrigger} />;
    case 'rocket':
      return <RocketEnvironment flipTrigger={flipTrigger} />;
    case 'moon':
      return <MoonEnvironment flipTrigger={flipTrigger} />;
    // 'blackhole' is handled separately by existing BlackHoleEnvironment
    default:
      return null;
  }
}
