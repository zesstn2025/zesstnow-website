"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import type { Group } from "three";

type Sat = {
  position: [number, number, number];
  scale: number;
  color: string;
  emissive: string;
  shape: "chip" | "shard";
};

/**
 * The debris field. In the reference these were coffee beans and ice cubes
 * tumbling around the product and breaking the frame; here they're glass chips
 * and shards, which do the same job of selling depth.
 */
const SATELLITES: Sat[] = [
  { position: [2.75, 1.05, -0.5], scale: 0.5, color: "#1b1740", emissive: "#6d3bf5", shape: "chip" },
  { position: [-2.95, -0.7, 0.4], scale: 0.42, color: "#0f2733", emissive: "#22d3ee", shape: "chip" },
  { position: [2.15, -1.5, 0.9], scale: 0.3, color: "#171238", emissive: "#a78bfa", shape: "shard" },
  { position: [-2.2, 1.7, -1.2], scale: 0.26, color: "#0d2430", emissive: "#67e8f9", shape: "shard" },
  { position: [3.5, -0.35, -1.6], scale: 0.22, color: "#1b1740", emissive: "#6d3bf5", shape: "shard" },
  { position: [-3.6, 0.55, -0.9], scale: 0.34, color: "#111a3a", emissive: "#8b7bff", shape: "chip" },
  { position: [0.5, 2.25, -1.8], scale: 0.2, color: "#0f2733", emissive: "#22d3ee", shape: "shard" },
  { position: [-0.9, -2.15, 0.7], scale: 0.24, color: "#171238", emissive: "#a78bfa", shape: "shard" },
];

function Satellite({ sat, index }: { sat: Sat; index: number }) {
  return (
    <Float
      speed={1 + (index % 4) * 0.28}
      rotationIntensity={1.5}
      floatIntensity={1.7}
      position={sat.position}
    >
      {sat.shape === "chip" ? (
        <RoundedBox args={[1, 1.3, 0.16]} radius={0.09} smoothness={3} scale={sat.scale}>
          <meshPhysicalMaterial
            color={sat.color}
            emissive={sat.emissive}
            emissiveIntensity={0.55}
            metalness={0.35}
            roughness={0.14}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={0.92}
          />
        </RoundedBox>
      ) : (
        <mesh scale={sat.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={sat.color}
            emissive={sat.emissive}
            emissiveIntensity={0.8}
            metalness={0.2}
            roughness={0.06}
            transmission={0.55}
            thickness={0.6}
            ior={1.4}
          />
        </mesh>
      )}
    </Float>
  );
}

export default function Satellites() {
  const orbit = useRef<Group>(null);

  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.y += delta * 0.055;
  });

  return (
    <group ref={orbit}>
      {SATELLITES.map((sat, i) => (
        <Satellite key={i} sat={sat} index={i} />
      ))}
    </group>
  );
}
