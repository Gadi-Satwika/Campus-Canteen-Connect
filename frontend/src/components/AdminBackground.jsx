import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function MovingShape() {
  const meshRef = useRef();
  useFrame((state) => {
    const { x, y } = state.pointer;
    meshRef.current.rotation.y = x * 0.5;
    meshRef.current.rotation.x = -y * 0.5;
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[5, 0, -5]}>
        <icosahedronGeometry args={[4, 15]} />
        <meshStandardMaterial color="#800000" wireframe opacity={0.1} transparent />
      </mesh>
    </Float>
  );
}

export default function AdminBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, backgroundColor: '#F8FAFC' }}>
      <Canvas>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} color="#800000" />
        <MovingShape />
      </Canvas>
    </div>
  );
}