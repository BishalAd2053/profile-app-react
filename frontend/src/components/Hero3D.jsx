import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const nebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec3 pos = vPosition * 0.8;
    float t = uTime * 0.03;

    float n1 = fbm(pos + vec3(t, t * 0.3, t * 0.15));
    float n2 = fbm(pos * 1.5 + vec3(-t * 0.35, t * 0.2, -t * 0.1) + n1 * 0.5);
    float n3 = fbm(pos * 2.0 + vec3(t * 0.15, -t * 0.3, t * 0.25) + n2 * 0.3);

    vec3 deepPurple = vec3(0.15, 0.0, 0.3);
    vec3 blue = vec3(0.05, 0.15, 0.5);
    vec3 magenta = vec3(0.5, 0.05, 0.4);
    vec3 cyan = vec3(0.1, 0.4, 0.6);
    vec3 brightCore = vec3(0.6, 0.3, 0.8);

    float blend1 = smoothstep(-0.3, 0.5, n1);
    float blend2 = smoothstep(-0.2, 0.6, n2);
    float blend3 = smoothstep(0.0, 0.8, n3);

    vec3 color = mix(deepPurple, blue, blend1);
    color = mix(color, magenta, blend2 * 0.6);
    color = mix(color, cyan, blend3 * 0.4);
    color += brightCore * smoothstep(0.3, 0.8, n3) * 0.4;

    float dist = length(vUv - 0.5);
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    color *= 0.6 + glow * 0.8;

    float alpha = smoothstep(-0.1, 0.4, n1 + n2 * 0.5) * (0.7 + glow * 0.3);
    alpha *= smoothstep(0.5, 0.3, dist);

    gl_FragColor = vec4(color * 1.5, alpha);
  }
`;

function NebulaCloud({ position = [0, 0, 0], scale = 4 }) {
  const mesh = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.z += 0.0002;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <planeGeometry args={[3, 3, 1, 1]} />
      <shaderMaterial
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function GlowParticles({ count = 200 }) {
  const points = useRef();

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pos[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * Math.sin(theta) * 0.5;
      pos[i * 3 + 2] = r * Math.sin(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        col[i * 3] = 0.5; col[i * 3 + 1] = 0.2; col[i * 3 + 2] = 0.8;
      } else if (colorChoice < 0.6) {
        col[i * 3] = 0.2; col[i * 3 + 1] = 0.3; col[i * 3 + 2] = 0.9;
      } else {
        col[i * 3] = 0.8; col[i * 3 + 1] = 0.2; col[i * 3 + 2] = 0.6;
      }
      siz[i] = 0.5 + Math.random() * 2;
    }
    return [pos, col, siz];
  }, [count]);

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.005;
      points.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        map={circleTexture}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Nebula() {
  return (
    <group>
      <NebulaCloud position={[0, 0, -1]} scale={5} />
      <NebulaCloud position={[1.5, 0.5, -2]} scale={3.5} />
      <NebulaCloud position={[-1.5, -0.5, -1.5]} scale={3} />
      <GlowParticles count={300} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0e1a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 5]} intensity={0.8} />
        <pointLight position={[-3, -2, 3]} intensity={0.4} color="#38bdf8" />

        <Suspense fallback={null}>
          <Nebula />
          <Stars radius={80} depth={50} count={2000} factor={3} saturation={0.2} fade speed={0.08} />
        </Suspense>
      </Canvas>
    </div>
  );
}
