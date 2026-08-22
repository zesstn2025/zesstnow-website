"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { MathUtils, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * Fintech — a solid silver monolith that opens its security layers.
 *
 * Loans and insurance are sold on the belief that the counterparty will still
 * be there in three years, so this is the one object on the site that is
 * deliberately heavy: a single milled block, turning slowly, with no
 * transparency and no particles. Weight is the message.
 *
 * On hover — or when the section reaches the bottom of its scroll — three
 * concentric rings lift off the face and turn against each other, the way a
 * vault door does. It reads as the block having depth and mechanism rather than
 * being a decorative slab.
 *
 * The rings never fully separate. A vault that comes apart is not reassuring.
 */

const RINGS = [
  { radius: 0.86, tube: 0.055, lift: 0.42, speed: 0.9 },
  { radius: 0.62, tube: 0.045, lift: 0.3, speed: -1.35 },
  { radius: 0.38, tube: 0.04, lift: 0.2, speed: 1.8 },
];

export default function SecureVault({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  // Shared across every metal surface on the page; generated once.
  const rough = useMemo(() => metalRoughnessMap(), []);
  const rings = useRef<(Mesh | null)[]>([]);
  const bolt = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  // The blend between shut and open, eased in the frame loop so hover in and
  // out both have travel rather than snapping.
  const openness = useRef(0);

  const ringGeometry = useMemo(() => RINGS, []);

  useFrame((state, delta) => {
    const p = progress.current;
    // Two ways in: reaching the end of the section, or pointing at it. Hover
    // alone would mean a touch device never sees the mechanism at all.
    const target = Math.max(hovered ? 1 : 0, MathUtils.clamp((p - 0.45) / 0.4, 0, 1));
    // Slow on purpose. A vault mechanism that snaps open is a toy.
    openness.current = MathUtils.damp(openness.current, target, 1.8, delta);
    const o = openness.current;

    if (group.current) {
      // Swings through a narrow arc rather than turning continuously. A block
      // that keeps rotating spends most of its time edge-on, showing a thin
      // sliver instead of the face — and a monolith that never settles reads
      // as light, which is the opposite of the point.
      group.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.32) * 0.42 + state.pointer.x * 0.16;
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        -0.1 + state.pointer.y * 0.12,
        2,
        delta
      );
    }

    for (let i = 0; i < ringGeometry.length; i++) {
      const mesh = rings.current[i];
      if (!mesh) continue;
      const ring = ringGeometry[i];
      mesh.position.z = 0.16 + ring.lift * o;
      // Only turns while it is lifted. A ring spinning flush against the face
      // would look like a texture sliding, not a part moving.
      mesh.rotation.z += delta * ring.speed * o;
      const material = mesh.material as MeshStandardMaterial;
      material.emissiveIntensity = 0.05 + o * 0.5;
    }

    if (bolt.current) {
      bolt.current.position.z = 0.16 + 0.1 * o;
      bolt.current.rotation.z -= delta * 2.2 * o;
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* The block. High metalness and low roughness means almost everything you
          see on it is the studio reflected — which is what makes it read as
          milled metal rather than as grey plastic. */}
      <RoundedBox args={[2.3, 2.3, 0.34]} radius={0.05} smoothness={4}>
        <meshStandardMaterial
          color={palette.chrome}
          metalness={1}
          roughness={0.26}
          roughnessMap={rough}
          envMapIntensity={1.6}
        />
      </RoundedBox>

      {/* A recessed face, a shade darker, so the rings sit in a well. */}
      <mesh position={[0, 0, 0.172]}>
        <circleGeometry args={[1.02, 64]} />
        {/* The recess is machined, not painted — lower metalness and higher
            roughness so it reads as a brushed well rather than a black hole
            cut in the face. */}
        <meshStandardMaterial
          color={palette.slate}
          metalness={0.7}
          roughness={0.55}
          envMapIntensity={1.2}
        />
      </mesh>

      {ringGeometry.map((ring, i) => (
        <mesh
          key={i}
          ref={(node: Mesh | null) => {
            rings.current[i] = node;
          }}
          position={[0, 0, 0.16]}
        >
          <torusGeometry args={[ring.radius, ring.tube, 14, 64]} />
          <meshStandardMaterial
            color={palette.silver}
            metalness={1}
            roughness={0.14}
            roughnessMap={rough}
            emissive={palette.chrome}
            emissiveIntensity={0.05}
            envMapIntensity={1.85}
          />
        </mesh>
      ))}

      {/* The handle at the centre. */}
      <mesh ref={bolt} position={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 6]} />
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.1}
          envMapIntensity={1.8}
        />
      </mesh>
    </group>
  );
}
