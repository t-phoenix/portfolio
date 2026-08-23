import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GradientPlane = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color('#0a0a0a') },
          uColor2: { value: new THREE.Color('#1a1a2e') },
          uColor3: { value: new THREE.Color('#F46C38') },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          varying vec2 vUv;
          
          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }
          
          void main() {
            vec2 uv = vUv;
            
            float wave1 = sin(uv.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
            float wave2 = sin(uv.y * 4.0 + uTime * 0.3) * 0.5 + 0.5;
            float wave3 = sin((uv.x + uv.y) * 2.0 + uTime * 0.4) * 0.5 + 0.5;
            
            float pattern = (wave1 + wave2 + wave3) / 3.0;
            
            float n = noise(uv * 100.0 + uTime * 0.1) * 0.05;
            pattern += n;
            
            vec3 color = mix(uColor1, uColor2, uv.y);
            color = mix(color, uColor3, pattern * 0.15 * (1.0 - uv.y));
            
            float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.5);
            color *= vignette * 0.3 + 0.7;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

interface ShaderGradientProps {
  className?: string;
}

const ShaderGradient = ({ className }: ShaderGradientProps) => {
  return (
    <div className={`absolute inset-0 -z-20 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: '#0a0a0a' }}
      >
        <GradientPlane />
      </Canvas>
    </div>
  );
};

export default ShaderGradient;
