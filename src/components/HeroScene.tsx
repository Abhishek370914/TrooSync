"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars, Trail, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function AdOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[-2.5, 0, 0]}>
        <Sphere args={[0.9, 64, 64]}>
          <MeshDistortMaterial
            color="#00f5ff"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={0.8}
            emissive="#00b8ff"
            emissiveIntensity={0.6}
          />
        </Sphere>
        {/* Glow ring */}
        <mesh>
          <torusGeometry args={[1.2, 0.03, 16, 100]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.4} />
        </mesh>
      </mesh>
    </Float>
  );
}

function PageOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.4) * 0.3;
    meshRef.current.rotation.y = -state.clock.elapsedTime * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={[2.5, 0, 0]}>
        <Sphere args={[0.9, 64, 64]}>
          <MeshDistortMaterial
            color="#a855f7"
            attach="material"
            distort={0.35}
            speed={1.5}
            roughness={0}
            metalness={0.8}
            emissive="#9333ea"
            emissiveIntensity={0.6}
          />
        </Sphere>
        <mesh>
          <torusGeometry args={[1.2, 0.03, 16, 100]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
        </mesh>
      </mesh>
    </Float>
  );
}

function MergedOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !ringRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    ringRef.current.rotation.x = state.clock.elapsedTime * 0.8;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={[0, 0, 0]}>
        <mesh ref={meshRef}>
          <Sphere args={[1.1, 128, 128]}>
            <MeshDistortMaterial
              color="#6366f1"
              attach="material"
              distort={0.5}
              speed={3}
              roughness={0}
              metalness={0.9}
              emissive="#00f5ff"
              emissiveIntensity={0.5}
            />
          </Sphere>
        </mesh>
        {/* Double rotating rings */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.6, 0.04, 16, 200]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.9, 0.02, 16, 200]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

function ParticleField() {
  const count = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00f5ff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function ConnectionBeam({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = Math.abs(Math.sin(state.clock.elapsedTime * 1.5)) * 0.8 + 0.2;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = t;
  });

  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(50);
  }, [from, to]);

  return (
    <line>
      <bufferGeometry setFromPoints={points} />
      <lineBasicMaterial ref={ref} color="#00f5ff" transparent opacity={0.6} linewidth={2} />
    </line>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[-3, 3, 3]} color="#00f5ff" intensity={3} />
      <pointLight position={[3, -3, 3]} color="#ff00ff" intensity={2} />
      <pointLight position={[0, 0, 5]} color="#a855f7" intensity={2} />

      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      <ParticleField />

      <AdOrb />
      <MergedOrb />
      <PageOrb />

      <ConnectionBeam from={[-2.5, 0, 0]} to={[0, 0, 0]} />
      <ConnectionBeam from={[0, 0, 0]} to={[2.5, 0, 0]} />
    </Canvas>
  );
}
