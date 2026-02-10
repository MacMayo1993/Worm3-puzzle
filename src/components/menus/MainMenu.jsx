import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import IntroCubie from '../intro/IntroCubie.jsx';

// Rotating cube background component
const MenuCubeBackground = () => {
  const size = 3;
  const items = [];
  const k = (size - 1) / 2;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        items.push({ key: `${x}-${y}-${z}`, pos: [x - k, y - k, z - k] });
      }
    }
  }

  return (
    <group rotation={[0.3, 0, 0]}>
      {items.map((it) => (
        <IntroCubie
          key={it.key}
          position={it.pos}
          size={size}
          explosionFactor={0}
        />
      ))}
    </group>
  );
};

// Animated rotating wrapper
const RotatingCube = () => {
  const groupRef = React.useRef();

  React.useEffect(() => {
    let animationId;
    const animate = () => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.003;
        groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1 + 0.3;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <group ref={groupRef}>
      <MenuCubeBackground />
    </group>
  );
};

const MenuButton = ({ children, onClick, delay, icon, primary }) => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '280px',
    padding: '18px 32px',
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: "'Courier New', monospace",
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    border: primary
      ? '2px solid rgba(59, 130, 246, 0.8)'
      : '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    background: hovered
      ? primary
        ? 'rgba(59, 130, 246, 0.4)'
        : 'rgba(255, 255, 255, 0.15)'
      : primary
        ? 'rgba(59, 130, 246, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
    color: primary ? '#60a5fa' : 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: visible ? 1 : 0,
    transform: visible
      ? hovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0)'
      : 'translateY(20px)',
    boxShadow: hovered
      ? primary
        ? '0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)'
        : '0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.05)'
      : 'none',
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
      {children}
    </button>
  );
};

const MainMenu = ({ onPlay, onLevels, onFreeplay, onCoop, onSettings, onHelp }) => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const titleTimer = setTimeout(() => setTitleVisible(true), 100);
    const subtitleTimer = setTimeout(() => setSubtitleVisible(true), 400);
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000000',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {/* 3D Cube Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.6,
      }}>
        <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <RotatingCube />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Menu Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'all 0.8s ease-out',
        }}>
          <h1 style={{
            fontSize: 'clamp(48px, 12vw, 96px)',
            fontWeight: 700,
            margin: 0,
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 40%, #93c5fd 70%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.15em',
            textShadow: '0 0 60px rgba(59, 130, 246, 0.5)',
            filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))',
          }}>
            WORM-3
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 3vw, 18px)',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '16px 0 0 0',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: subtitleVisible ? 1 : 0,
            transform: subtitleVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease-out',
          }}>
            A Manifold Puzzle Game
          </p>
        </div>

        {/* Menu Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}>
          <MenuButton onClick={onPlay} delay={600} icon="▶" primary>
            Play
          </MenuButton>
          <MenuButton onClick={onLevels} delay={750} icon="◈">
            Levels
          </MenuButton>
          <MenuButton onClick={onFreeplay} delay={900} icon="∞">
            Freeplay
          </MenuButton>
          <MenuButton onClick={onCoop} delay={1000} icon="&#9775;">
            Co-op Crawler
          </MenuButton>
          <MenuButton onClick={onSettings} delay={1150} icon="⚙">
            Settings
          </MenuButton>
          <MenuButton onClick={onHelp} delay={1300} icon="?">
            How to Play
          </MenuButton>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: 0.4,
          fontSize: '12px',
          fontFamily: "'Courier New', monospace",
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.1em',
        }}>
          Explore the topology of quotient spaces
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
