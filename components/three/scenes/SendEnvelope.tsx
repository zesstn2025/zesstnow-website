"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  MathUtils,
  Shape,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * A silver envelope that forms, turns once, and leaves.
 *
 * Driven by one progress value the parent eases from 0 to 1, rather than by
 * GSAP reaching into the scene graph. Everything 3D on this site is animated
 * that way: the animation is then frame-rate independent, it survives the tab
 * being backgrounded, and there is exactly one thing writing to each transform.
 *
 * The three beats overlap on purpose. It grows while it is already starting to
 * turn, and it is still turning as it starts to climb — a strictly sequential
 * version reads as three separate animations played back to back.
 */
export default function SendEnvelope({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const flap = useRef<Mesh>(null);
  const rough = useMemo(() => metalRoughnessMap(), []);

  /** The triangular flap, as a flat shape rather than a modelled solid. */
  const flapShape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.75, 0.24);
    s.lineTo(0.75, 0.24);
    s.lineTo(0, -0.28);
    s.closePath();
    return s;
  }, []);

  useFrame((_, delta) => {
    const p = MathUtils.clamp(progress.current, 0, 1);
    const g = group.current;
    if (!g) return;

    // Forms.
    const grow = MathUtils.clamp(p / 0.3, 0, 1);
    const eased = 1 - Math.pow(1 - grow, 3);
    g.scale.setScalar(eased * (1 - MathUtils.clamp((p - 0.72) / 0.28, 0, 1) * 0.35));

    // Turns — two and a bit revolutions, decelerating, so it settles face-on
    // before it goes rather than tumbling away.
    const spin = MathUtils.clamp((p - 0.16) / 0.6, 0, 1);
    g.rotation.y = (1 - Math.pow(1 - spin, 2)) * Math.PI * 2.25;
    g.rotation.z = Math.sin(p * Math.PI) * 0.16;

    // Leaves. Accelerating, because something thrown upward at a constant speed
    // reads as being lifted rather than as being sent.
    const fly = MathUtils.clamp((p - 0.58) / 0.42, 0, 1);
    g.position.y = fly * fly * 5.4;
    g.position.z = fly * 1.2;

    // Held off-axis throughout.
    //
    // A flat mirror facing the camera reflects whatever is behind the camera,
    // and behind the camera is nothing — so the first version rendered as a
    // black card with a lit outline while every curved object on the site looks
    // like chrome. Tilting it means the face samples the studio's strip lights
    // instead of the void. (The same lesson as the storefront tiles, learned
    // again on a flat surface.)
    g.rotation.x = -0.26 + Math.sin(p * Math.PI) * 0.1;

    // The flap closes as it forms.
    if (flap.current) {
      flap.current.rotation.x = MathUtils.lerp(-1.5, 0, eased);
      (flap.current.material as MeshStandardMaterial).opacity = eased;
    }
  });

  return (
    <group ref={group} scale={0}>
      {/* The body. */}
      <RoundedBox args={[1.6, 1.02, 0.07]} radius={0.03} smoothness={4}>
        {/* Rougher than the rest of the metal on the site, and that is the
            point: a broad flat face at mirror smoothness returns one hard
            reflection of an empty room. Scattering it gathers light from a wide
            cone instead, which is what makes brushed sheet read as sheet. */}
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.34}
          roughnessMap={rough}
          envMapIntensity={2.4}
        />
      </RoundedBox>

      {/* The flap, hinged at the top edge and folding shut. */}
      <group position={[0, 0.51, 0.045]}>
        <mesh ref={flap} position={[0, -0.24, 0]}>
          <shapeGeometry args={[flapShape]} />
          <meshStandardMaterial
            color={palette.chrome}
            metalness={1}
            roughness={0.3}
            roughnessMap={rough}
            envMapIntensity={2.4}
            transparent
            opacity={0}
          />
        </mesh>
      </group>

      {/* The two seams a closed envelope shows, milled rather than drawn. */}
      {[
        { pos: [-0.4, -0.13, 0.04], rot: 0.58 },
        { pos: [0.4, -0.13, 0.04], rot: -0.58 },
      ].map((seam, i) => (
        <mesh
          key={i}
          position={seam.pos as [number, number, number]}
          rotation={[0, 0, seam.rot]}
        >
          <boxGeometry args={[0.9, 0.01, 0.02]} />
          {/* Bright, because the seams are what say "envelope". Without them a
              silver rectangle is a silver rectangle. */}
          <meshStandardMaterial
            color={palette.specular}
            metalness={1}
            roughness={0.18}
            envMapIntensity={2.2}
          />
        </mesh>
      ))}
    </group>
  );
}
