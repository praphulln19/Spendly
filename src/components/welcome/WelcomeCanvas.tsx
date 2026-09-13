'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { MoneyOrbit } from './MoneyOrbit';

/*
 * Mirrors Tailwind's `sm` breakpoint (640px) so the 3D composition and the
 * text overlay reshape at the same point -- without this the rig stays
 * desktop-sized on phones and a ring cuts straight through the headline.
 */
function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const update = () => setIsCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isCompact;
}

export function WelcomeCanvas() {
  const isCompact = useIsCompact();

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.5], fov: isCompact ? 48 : 42 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} color="#dce6ff" />
      <pointLight position={[-4, -2, -3]} intensity={6} color="#3b82f6" />

      <Suspense fallback={null}>
        <MoneyOrbit scale={isCompact ? 0.72 : 1} position={isCompact ? [0, 1.1, 0] : [0, 0, 0]} />
        <Environment preset="city" />
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

export default WelcomeCanvas;
