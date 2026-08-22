"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  MathUtils,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * Fintech — a solid silver vault inside its security layers.
 *
 * Loans and insurance are sold on a belief that the counterparty will still be
 * there in three years, so this is the one object on the site that is
 * deliberately heavy: a massive milled cube, swinging through a narrow arc, no
 * transparency and no particles on the block itself. Weight is the message.
 *
 * Two rings orbit it on opposing axes — an inner lit one and an outer
 * translucent one. Counter-rotation is what makes them read as a mechanism
 * rather than as decoration: matched rotation looks like a single rigid cage,
 * where two axes turning against each other looks engineered.
 *
 * On hover, or when the section reaches the reader, the face opens: three
 * concentric rings lift off it and turn against one another the way a vault
 * door does, and the orbital rings brighten and pick up speed. They never fully
 * separate — a vault that comes apart is not reassuring.
 */

/**
 * The dial rings set into the face.
 *
 * FACE_Z is the front plane of the block plus a hair. It has to be derived from
 * the block's depth rather than typed in: these were left at the slab's old
 * offset when the block became a cube, which buried the entire dial half a unit
 * inside solid metal — it lifted on hover and still never cleared the surface.
 */
const FACE_Z = 1.01;
const WELL_R = 0.62;

const DIAL = [
  { radius: 0.5, tube: 0.032, lift: 0.34, speed: 0.9 },
  { radius: 0.36, tube: 0.026, lift: 0.24, speed: -1.35 },
  { radius: 0.22, tube: 0.022, lift: 0.16, speed: 1.8 },
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
  const orbitInner = useRef<Mesh>(null);
  const orbitOuter = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  // The blend between shut and open, eased in the frame loop so hover in and
  // out both have travel rather than snapping.
  const openness = useRef(0);

  const dial = useMemo(() => DIAL, []);

  useFrame((state, delta) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    // Two ways in: the section reaching the reader, or pointing at it. Hover
    // alone would mean a touch device never sees the mechanism at all.
    const target = Math.max(hovered ? 1 : 0, MathUtils.clamp((p - 0.5) / 0.35, 0, 1));
    // Slow on purpose. A vault mechanism that snaps open is a toy.
    openness.current = MathUtils.damp(openness.current, target, 1.8, delta);
    const o = openness.current;

    if (group.current) {
      // Swings through a narrow arc rather than turning continuously. A block
      // that keeps rotating spends most of its time edge-on, showing a sliver
      // instead of the face — and a monolith that never settles reads as light,
      // which is the opposite of the point.
      group.current.rotation.y = Math.sin(t * 0.2) * 0.3 + state.pointer.x * 0.14;
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        -0.08 + state.pointer.y * 0.1,
        2,
        delta
      );
      // A slow float, so the mass is suspended rather than sitting on nothing.
      group.current.position.y = Math.sin(t * 0.5) * 0.1;
    }

    for (let i = 0; i < dial.length; i++) {
      const mesh = rings.current[i];
      if (!mesh) continue;
      const ring = dial[i];
      mesh.position.z = FACE_Z + ring.lift * o;
      // Only turns while it is lifted. A ring spinning flush against the face
      // would look like a texture sliding, not a part moving.
      mesh.rotation.z += delta * ring.speed * o;
      (mesh.material as MeshStandardMaterial).emissiveIntensity = 0.05 + o * 0.5;
    }

    if (bolt.current) {
      bolt.current.position.z = FACE_Z + 0.08 * o;
      bolt.current.rotation.z -= delta * 2.2 * o;
    }

    // The orbital layers. Always turning, so the vault is never inert, but they
    // accelerate and brighten as the layers engage.
    if (orbitInner.current) {
      orbitInner.current.rotation.x = t * (0.3 + o * 0.5);
      orbitInner.current.rotation.y = t * 0.1;
      const m = orbitInner.current.material as MeshStandardMaterial;
      m.emissiveIntensity = 0.3 + o * 0.9;
    }
    if (orbitOuter.current) {
      orbitOuter.current.rotation.y = -t * (0.2 + o * 0.35);
      orbitOuter.current.rotation.z = t * 0.4;
      const m = orbitOuter.current.material as MeshStandardMaterial;
      m.opacity = 0.28 + o * 0.34;
    }
  });

  return (
    <group
      ref={group}
      // Scaled to fit. The outer ring spans 4.6 units and the shared pillar
      // camera frames 4.4, so at full size the security layers are cropped by
      // the edge of the view — which is the one thing they must not be.
      scale={0.84}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* The block — a cube rather than a slab. Depth is most of what reads as
          weight; a thin panel of the same material reads as a plate. High
          metalness with low roughness means nearly everything visible on it is
          the studio reflected, which is what makes it milled metal rather than
          grey plastic. */}
      <RoundedBox args={[2, 2, 2]} radius={0.045} smoothness={4}>
        <meshStandardMaterial
          color={palette.chrome}
          metalness={1}
          roughness={0.2}
          roughnessMap={rough}
          envMapIntensity={1.7}
        />
      </RoundedBox>

      {/* A recessed face, machined rather than painted: lower metalness and
          higher roughness, so it reads as a brushed well and not as a black
          hole cut in the front. */}
      <mesh position={[0, 0, 1.002]}>
        <circleGeometry args={[WELL_R, 64]} />
        <meshStandardMaterial
          color={palette.slate}
          metalness={0.7}
          roughness={0.55}
          envMapIntensity={1.2}
        />
      </mesh>

      {dial.map((ring, i) => (
        <mesh
          key={i}
          ref={(node: Mesh | null) => {
            rings.current[i] = node;
          }}
          position={[0, 0, FACE_Z]}
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
      <mesh ref={bolt} position={[0, 0, FACE_Z]}>
        <cylinderGeometry args={[0.07, 0.07, 0.22, 6]} />
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.1}
          envMapIntensity={1.9}
        />
      </mesh>

      {/* Inner security layer. Emissive, and the one place a colour is allowed
          near this object: it is light, not a surface. The vault itself stays
          untinted, because a metallic surface carrying a hue stops reading as
          metal. */}
      <mesh ref={orbitInner}>
        <torusGeometry args={[1.72, 0.018, 12, 96]} />
        <meshStandardMaterial
          color={palette.signal}
          emissive={palette.signal}
          emissiveIntensity={0.3}
          metalness={0.2}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Outer layer — translucent chrome, turning on a different axis. */}
      <mesh ref={orbitOuter}>
        <torusGeometry args={[2.3, 0.018, 8, 96]} />
        <meshStandardMaterial
          color={palette.chrome}
          metalness={1}
          roughness={0.22}
          transparent
          opacity={0.28}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
}
