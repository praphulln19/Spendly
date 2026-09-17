'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/*
 * The rings spin at slightly different speeds/axes forever, which is what
 * reads as "gyroscope" rather than three flat circles -- their precession
 * drifts in and out of alignment instead of settling into a repeating loop.
 */
const RING_CONFIGS = [
  { radius: 1.85, tube: 0.032, rotation: [0.5, 0.15, 0] as const, speed: 0.09, axis: 'y' as const },
  { radius: 2.15, tube: 0.026, rotation: [-0.25, 0.6, 0.3] as const, speed: -0.065, axis: 'x' as const },
  { radius: 1.55, tube: 0.022, rotation: [1.3, 0.9, 0] as const, speed: 0.12, axis: 'z' as const },
];

function GyroRing({
  radius,
  tube,
  rotation,
  speed,
  axis,
}: {
  radius: number;
  tube: number;
  rotation: readonly [number, number, number];
  speed: number;
  axis: 'x' | 'y' | 'z';
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation[axis] += speed * delta;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, tube, 24, 160]} />
      <meshStandardMaterial color="#e7ebf2" metalness={1} roughness={0.16} envMapIntensity={1.4} />
    </mesh>
  );
}

function CoreSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.05, 64, 64]} />
      <meshPhysicalMaterial
        color="#dbe7ff"
        transmission={0.94}
        thickness={0.85}
        roughness={0.03}
        ior={1.3}
        metalness={0}
        envMapIntensity={1.2}
        clearcoat={1}
        attenuationColor="#2563eb"
        attenuationDistance={1.1}
      />
    </mesh>
  );
}

type Coin = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  /** Float's bob speed, fixed at scatter time so a re-render can't reshuffle it mid-animation */
  floatSpeed: number;
};

function scatterCoins(count: number): Coin[] {
  const coins: Coin[] = [];
  for (let i = 0; i < count; i++) {
    // Sweep along a broad diagonal arc so the coins read as a single stream
    // crossing the frame, with enough jitter that no two land on the curve exactly.
    const t = i / (count - 1);
    const angle = -0.55 + t * 1.5;
    const arcRadius = 3.3 + Math.sin(t * Math.PI) * 0.5;
    const jitterX = (Math.random() - 0.5) * 0.45;
    const jitterY = (Math.random() - 0.5) * 0.5;
    coins.push({
      position: [
        Math.cos(angle) * arcRadius + jitterX,
        Math.sin(angle) * arcRadius * 0.5 + 0.7 + jitterY,
        (Math.random() - 0.5) * 2.2 - 1,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: 0.55 + Math.random() * 0.55,
      floatSpeed: 1.2 + Math.random(),
    });
  }
  return coins;
}

function Coins() {
  const coins = useMemo(() => scatterCoins(34), []);

  return (
    <>
      {coins.map((coin, i) => (
        <Float key={i} speed={coin.floatSpeed} rotationIntensity={0.8} floatIntensity={1.1}>
          <mesh position={coin.position} rotation={coin.rotation} scale={coin.scale}>
            <cylinderGeometry args={[0.11, 0.11, 0.018, 32]} />
            <meshStandardMaterial color="#dbe4f7" metalness={1} roughness={0.22} envMapIntensity={1.3} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export function MoneyOrbit({ scale = 1, position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group scale={scale} position={position}>
      <CoreSphere />
      {RING_CONFIGS.map((ring, i) => (
        <GyroRing key={i} {...ring} />
      ))}
      <Coins />
    </group>
  );
}
