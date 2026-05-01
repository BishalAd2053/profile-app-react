import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';

function FloatingShape() {
  const mesh = useRef();
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.25;
    mesh.current.rotation.x += delta * 0.08;
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    mesh.current.position.x += (pointer.current.x * 0.5 - mesh.current.position.x) * 0.05;
    mesh.current.position.y += (pointer.current.y * 0.3 - mesh.current.position.y) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh} scale={1.6}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.6}
          distort={0.45}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function OrbitingDots() {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.4;
  });
  const dots = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const r = 2.6;
    return [Math.cos(angle) * r, Math.sin(angle * 0.6) * 0.4, Math.sin(angle) * r];
  });
  return (
    <group ref={group}>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0b1020']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color="#38bdf8" />

        <Suspense fallback={null}>
          <FloatingShape />
          <OrbitingDots />
          <Stars radius={50} depth={30} count={1500} factor={3} saturation={0} fade speed={0.5} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
