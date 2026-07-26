"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import type { Group } from "three";

/**
 * The hero object: a refractive glass polyhedron with a glowing core and a
 * wireframe shell around it. This is the analogue of the floating product in
 * the reference — the one thing the whole composition orbits.
 */
export default function Core({ accent = "#a78bfa" }: { accent?: string }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.13;
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.24) * 0.14;
  });

  return (
    <Float speed={1.05} rotationIntensity={0.22} floatIntensity={0.75}>
      <group ref={group}>
        {/* Refractive shell */}
        <mesh castShadow>
          <icosahedronGeometry args={[1.34, 0]} />
          <MeshTransmissionMaterial
            samples={3}
            resolution={128}
            transmission={1}
            thickness={1.1}
            roughness={0.08}
            ior={1.46}
            chromaticAberration={0.28}
            anisotropy={0.24}
            distortion={0.32}
            distortionScale={0.36}
            temporalDistortion={0.08}
            color="#cfd4ff"
            attenuationColor="#8b6bff"
            attenuationDistance={2.4}
          />
        </mesh>

        {/* Inner emissive heart — reads as light trapped in the glass */}
        <mesh scale={0.4}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>

        {/* Outer wireframe cage */}
        <mesh scale={1.66}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#67e8f9"
            wireframe
            transparent
            opacity={0.085}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}
