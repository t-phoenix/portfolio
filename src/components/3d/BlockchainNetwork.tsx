import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface NodeProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
}

const BlockchainNode = ({ position, color = '#F46C38', scale = 0.15 }: NodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[scale, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

interface ConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
}

const Connection = ({ start, end }: ConnectionProps) => {
  return (
    <Line
      points={[start, end]}
      color="#F46C38"
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
};

const NetworkScene = () => {
  const nodes = useMemo(() => {
    const positions: [number, number, number][] = [
      [-2, 1, 0],
      [2, 1.5, -1],
      [0, -1, 1],
      [-1.5, -0.5, -0.5],
      [1.5, 0, 0.5],
      [0, 2, -0.5],
      [-2.5, 0, 0.5],
      [2.5, -1, -0.5],
      [0.5, 0.5, 1.5],
      [-1, 1.5, 1],
    ];
    return positions;
  }, []);

  const connections = useMemo(() => {
    const conns: { start: [number, number, number]; end: [number, number, number] }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i][0] - nodes[j][0], 2) +
          Math.pow(nodes[i][1] - nodes[j][1], 2) +
          Math.pow(nodes[i][2] - nodes[j][2], 2)
        );
        if (dist < 2.5) {
          conns.push({ start: nodes[i], end: nodes[j] });
        }
      }
    }
    return conns;
  }, [nodes]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#F46C38" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6CE3B6" />

      {nodes.map((pos, i) => (
        <BlockchainNode
          key={i}
          position={pos}
          color={i % 3 === 0 ? '#F46C38' : i % 3 === 1 ? '#6CE3B6' : '#FFFFFF'}
          scale={0.1 + Math.random() * 0.1}
        />
      ))}

      {connections.map((conn, i) => (
        <Connection key={i} start={conn.start} end={conn.end} />
      ))}
    </>
  );
};

interface BlockchainNetworkProps {
  className?: string;
}

const BlockchainNetwork = ({ className }: BlockchainNetworkProps) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <NetworkScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default BlockchainNetwork;
