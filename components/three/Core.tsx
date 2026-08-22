"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import type { Group } from "three";
import { palette } from "./palette";

/**
 * The hero object: a refractive glass polyhedron with a glowing core and a
 * wireframe shell around it. This is the analogue of the floating product in
 * the reference — the one thing the whole composition orbits.
 */
export default function Core({ accent = palette.silver }: { accent?: string }) {
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
            /* Off. It was halved when a post-processing pass was adding its own
               on top; with that pass gone this is the only source left, and it
               still manufactures hue — the blue and magenta speckle around the
               bright centre is exactly the thing the palette rules out. A
               refractive index and a rough surface are what make glass read as
               glass; splitting the spectrum is decoration. */
            chromaticAberration={0}
            anisotropy={0.24}
            distortion={0.32}
            distortionScale={0.36}
            temporalDistortion={0.08}
            color={palette.fill}
            /* Light is tinted as it travels through the glass. Chrome here
               keeps the interior neutral, so the object reads as optical glass
               over polished metal rather than as coloured resin. */
            attenuationColor={palette.chrome}
            attenuationDistance={2.1}
          />
        </mesh>

        {/* Inner emissive heart — reads as light trapped in the glass.
            Smaller than it was: the shell around it is a lens, and without the
            bloom pass to roll the highlight off, the old size came through
            magnified as a blown-out white disc rather than as a point of
            light. */}
        <mesh scale={0.3}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>

        {/* Outer wireframe cage */}
        <mesh scale={1.66}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={palette.chrome}
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
