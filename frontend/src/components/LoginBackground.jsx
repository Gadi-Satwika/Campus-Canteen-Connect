import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function FloatingStructure({ position, args, color, opacity = 0.4 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const { x, y } = state.pointer;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.5, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.5, 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} wireframe wireframeLineWidth={1.2} transparent opacity={opacity} />
      </mesh>
    </Float>
  );
}

export default function LoginBackground() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundColor: '#fdfcfb' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#800000" />
        
        {/* If Mobile, we center a small version. If Desktop, we push it to the right. */}
        <FloatingStructure 
          position={isMobile ? [0, 4, -2] : [4.5, 0, 0]} 
          args={isMobile ? [2, 2, 2] : [3, 3, 3]} 
          color="#800000" 
          opacity={0.6} 
        />
        
        {!isMobile && (
          <>
            <FloatingStructure position={[6.5, 2.5, -2]} args={[1.5, 1.5, 1.5]} color="#facc15" />
            <FloatingStructure position={[5.5, -2.5, 1]} args={[0.8, 0.8, 0.8]} color="#800000" />
          </>
        )}
      </Canvas>
    </div>
  );
}