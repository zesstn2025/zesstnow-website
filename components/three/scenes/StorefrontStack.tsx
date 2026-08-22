"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  MathUtils,
  TubeGeometry,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * E-commerce — a catalogue, one item leaving it, and the invoice behind it.
 *
 * A grid of chrome tiles assembles into a storefront. One tile lifts out of the
 * grid, travels along a lit arc and lands on a slab standing off to the side:
 * the order, and the compliant invoice raised against it. That last step is the
 * whole argument of the page — anyone can render a catalogue, and the work is
 * what happens after the tile leaves it.
 *
 * Same rules as every other scene here. Chrome takes no hue; the only colour is
 * the arc, because it is light tracing a path rather than a surface. Materials
 * carry the shared roughness map so reflections break up the way they do on a
 * milled part, and everything is driven by one damped progress value read
 * inside the frame loop rather than by React state.
 */

/** The storefront grid: x, y, width, height. Three across, two down. */
const TILES: [number, number, number, number][] = [
  [-0.86, 0.52, 0.68, 0.68],
  [0, 0.52, 0.68, 0.68],
  [0.86, 0.52, 0.68, 0.68],
  [-0.86, -0.3, 0.68, 0.68],
  [0, -0.3, 0.68, 0.68],
  [0.86, -0.3, 0.68, 0.68],
];

/** The tile that leaves. Middle of the top row — the eye is already there. */
const PICKED = 1;

function seeded(i: number) {
  const x = Math.sin(i * 219.3) * 43758.5453;
  return x - Math.floor(x);
}

export default function StorefrontStack({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const tiles = useRef<(Mesh | null)[]>([]);
  const invoice = useRef<Group>(null);
  const arc = useRef<Mesh>(null);
  const rough = useMemo(() => metalRoughnessMap(), []);

  /** Where each tile starts, and how it is turned before it settles. */
  const scatter = useMemo(
    () =>
      TILES.map((_, i) => ({
        from: new Vector3(
          (seeded(i) - 0.5) * 7,
          (seeded(i + 30) - 0.5) * 5,
          -2.5 - seeded(i + 60) * 4
        ),
        spin: [
          (seeded(i + 90) - 0.5) * 3,
          (seeded(i + 120) - 0.5) * 3,
          (seeded(i + 150) - 0.5) * 2,
        ] as [number, number, number],
      })),
    []
  );

  /** Where the picked tile ends up: on the face of the invoice slab. */
  const destination = useMemo(() => new Vector3(1.95, -0.62, 0.28), []);

  /**
   * The path the order travels.
   *
   * A curve rather than a straight line, and bowed toward the camera, so it
   * reads as something moving through the space rather than as a rule drawn
   * across a flat picture.
   */
  const arcGeometry = useMemo(() => {
    const [tx, ty] = TILES[PICKED];
    const curve = new CatmullRomCurve3([
      new Vector3(tx, ty, 0.1),
      new Vector3(tx + 0.6, ty + 0.5, 0.9),
      new Vector3(1.5, 0.1, 0.7),
      destination.clone().add(new Vector3(0, 0.16, 0.05)),
    ]);
    return new TubeGeometry(curve, 48, 0.012, 8, false);
  }, [destination]);

  useFrame((state, delta) => {
    const p = progress.current;

    if (group.current) {
      // Held at an angle so the tiles have thickness, and squaring up as the
      // storefront completes — a finished shop is looked at straight on.
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        (0.38 - p * 0.3) + state.pointer.x * 0.1,
        1.3,
        delta
      );
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        -0.12 + p * 0.06 + state.pointer.y * 0.06,
        1.3,
        delta
      );
    }

    for (let i = 0; i < TILES.length; i++) {
      const mesh = tiles.current[i];
      if (!mesh) continue;
      const [x, y] = TILES[i];
      const { from, spin } = scatter[i];

      // The grid assembles over the first two thirds. Wide, overlapping windows,
      // so tiles drift in rather than arriving together.
      const assemble = MathUtils.clamp((p - i * 0.05) / 0.55, 0, 1);
      const eased = 1 - Math.pow(1 - assemble, 5);

      let px = MathUtils.lerp(from.x, x, eased);
      let py = MathUtils.lerp(from.y, y, eased);
      let pz = MathUtils.lerp(from.z, 0, eased);

      if (i === PICKED) {
        // Then one of them leaves. It only starts once the grid it is leaving
        // actually exists — an item cannot be picked out of a shop that has not
        // finished being built.
        const leave = MathUtils.clamp((p - 0.62) / 0.32, 0, 1);
        const lift = leave * leave * (3 - 2 * leave); // smoothstep

        // Follows the same bow as the arc, so the tile travels along the lit
        // path instead of cutting the corner it draws.
        const midX = MathUtils.lerp(x, destination.x, lift);
        const bow = Math.sin(lift * Math.PI);
        px = midX;
        py = MathUtils.lerp(y, destination.y, lift) + bow * 0.45;
        pz = MathUtils.lerp(0, destination.z, lift) + bow * 0.7;
        mesh.rotation.z = lift * 0.5;
      } else {
        mesh.rotation.set(
          spin[0] * (1 - eased),
          spin[1] * (1 - eased),
          spin[2] * (1 - eased)
        );
      }

      mesh.position.set(px, py, pz);
      (mesh.material as MeshStandardMaterial).opacity = MathUtils.clamp(eased * 1.6, 0, 1);
    }

    // The invoice arrives to receive the order, not before it.
    if (invoice.current) {
      const show = MathUtils.clamp((p - 0.58) / 0.3, 0, 1);
      const eased = 1 - Math.pow(1 - show, 4);
      invoice.current.position.x = MathUtils.lerp(3.6, 1.95, eased);
      invoice.current.scale.setScalar(0.4 + eased * 0.6);
      invoice.current.traverse((child) => {
        const m = (child as Mesh).material as MeshStandardMaterial | undefined;
        if (m && "opacity" in m) m.opacity = eased;
      });
    }

    // The path lights up as the order travels it, and dims once it has landed.
    if (arc.current) {
      const leave = MathUtils.clamp((p - 0.6) / 0.34, 0, 1);
      const m = arc.current.material as MeshStandardMaterial;
      // Brightest while the order is in flight, but never back to nothing. Fully
      // faded, the finished scene shows a catalogue and an invoice with no
      // visible relationship between them — and the relationship is the point.
      m.opacity = Math.sin(leave * Math.PI) * 0.75 + leave * 0.22;
    }
  });

  return (
    <group ref={group} scale={0.86}>
      {/* The storefront: a grid of product tiles. */}
      {TILES.map((tile, i) => {
        const [, , w, h] = tile;
        return (
          <RoundedBox
            key={i}
            ref={(node: Mesh | null) => {
              tiles.current[i] = node;
            }}
            args={[w, h, 0.07]}
            radius={0.022}
            smoothness={3}
          >
            <meshStandardMaterial
              color={i === PICKED ? palette.silver : palette.chrome}
              metalness={1}
              // The grid was reading almost black: a rough chrome face seen
              // straight on reflects the dim part of the studio and very little
              // else. Smoother, and turned up, so the tiles catch the strip
              // lights the way the rest of the site's metal does.
              roughness={i === PICKED ? 0.14 : 0.26}
              roughnessMap={rough}
              envMapIntensity={i === PICKED ? 1.9 : 1.6}
              transparent
              opacity={0}
            />
          </RoundedBox>
        );
      })}

      {/* The lit path the order travels. Light, not a surface — which is why it
          is the one element here allowed a colour. */}
      <mesh ref={arc} geometry={arcGeometry}>
        <meshStandardMaterial
          color={palette.signal}
          emissive={palette.signal}
          emissiveIntensity={1.6}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* The invoice: a slab standing off to the side, with the lines of a
          document ruled across it. */}
      <group ref={invoice} position={[1.95, -0.62, 0]}>
        <RoundedBox args={[1.15, 1.5, 0.06]} radius={0.02} smoothness={3}>
          <meshStandardMaterial
            color={palette.chrome}
            metalness={1}
            roughness={0.3}
            roughnessMap={rough}
            envMapIntensity={1.4}
            transparent
            opacity={0}
          />
        </RoundedBox>

        {[0.44, 0.26, 0.08, -0.1, -0.28].map((y, i) => (
          <mesh key={y} position={[i === 4 ? -0.2 : -0.06, y, 0.04]}>
            <boxGeometry args={[i === 4 ? 0.42 : 0.72, 0.038, 0.02]} />
            <meshStandardMaterial
              color={palette.slate}
              metalness={0.9}
              roughness={0.42}
              envMapIntensity={1.1}
              transparent
              opacity={0}
            />
          </mesh>
        ))}

        {/* The total, ruled off at the foot the way a tax invoice is. */}
        <mesh position={[0.2, -0.52, 0.04]}>
          <boxGeometry args={[0.5, 0.07, 0.02]} />
          <meshStandardMaterial
            color={palette.silver}
            metalness={1}
            roughness={0.16}
            envMapIntensity={1.7}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
    </group>
  );
}
