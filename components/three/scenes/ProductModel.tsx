"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import { palette } from "../palette";

/**
 * The product, as a stack of layers you can take apart.
 *
 * Every SaaS product is really a stack — a surface people touch, the logic
 * under it, the data under that, and the platform it all sits on. Assembled it
 * is one object. Pulled apart it is an architecture diagram you can walk
 * around, and that is the thing a client asking "what am I actually buying?"
 * needs to see.
 *
 * Orbiting is deliberately constrained. Full free rotation lets a visitor end
 * up underneath the model looking at nothing, and there is no way back except
 * reloading; the polar limits keep every angle a good one, and panning is off
 * because a model that can be dragged off screen is a model that will be.
 */

export type Layer = {
  label: string;
  /** How far this layer travels when the stack opens. */
  offset: number;
  /** Silver for the surface layer, charcoal for what is underneath. */
  bright?: boolean;
  /** Small blocks sitting on this layer's face — modules within a tier. */
  cells?: [number, number, number, number][];
};

const LAYERS: Layer[] = [
  {
    label: "Interface",
    offset: 1.5,
    bright: true,
    cells: [
      [-0.62, 0.34, 0.5, 0.34],
      [0.06, 0.34, 0.5, 0.34],
      [0.74, 0.34, 0.5, 0.34],
      [-0.62, -0.3, 0.62, 0.62],
      [0.28, -0.3, 1.1, 0.62],
    ],
  },
  {
    label: "Logic & automations",
    offset: 0.5,
    cells: [
      [-0.7, 0.1, 0.42, 0.9],
      [0.0, 0.1, 0.42, 0.9],
      [0.7, 0.1, 0.42, 0.9],
    ],
  },
  {
    label: "Data",
    offset: -0.5,
    cells: [
      [-0.5, 0, 1.6, 0.2],
      [-0.5, -0.34, 1.6, 0.2],
      [-0.5, 0.34, 1.6, 0.2],
    ],
  },
  { label: "Platform & hosting", offset: -1.5 },
];

export default function ProductModel({
  exploded,
  interactive = true,
}: {
  /** 0 assembled, 1 fully apart. Driven by scroll, hover, or a button. */
  exploded: React.RefObject<number>;
  interactive?: boolean;
}) {
  const group = useRef<Group>(null);
  const layers = useRef<(Group | null)[]>([]);
  const [dragging, setDragging] = useState(false);
  const current = useRef(0);

  const layout = useMemo(() => LAYERS, []);

  useFrame((state, delta) => {
    current.current = MathUtils.damp(current.current, exploded.current, 3.2, delta);
    const e = current.current;

    if (group.current) {
      // Idles with a slow turn, and stops the moment someone takes hold of it —
      // a model that keeps spinning under your cursor fights you.
      if (!dragging) group.current.rotation.y += delta * 0.16 * (1 - e * 0.5);
    }

    for (let i = 0; i < layout.length; i++) {
      const node = layers.current[i];
      if (!node) continue;
      const layer = layout[i];
      node.position.y = layer.offset * e * 0.62;
      // Fans out slightly as it lifts, so the layers do not hide behind each
      // other when the model is seen from straight on.
      node.position.z = layer.offset * e * 0.12;
      node.rotation.x = -0.05 * e * layer.offset;
    }
  });

  return (
    <>
      {interactive && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          minDistance={4}
          maxDistance={11}
          // Keeps the camera above the horizon and out of the model's underside.
          minPolarAngle={Math.PI * 0.22}
          maxPolarAngle={Math.PI * 0.62}
          onStart={() => setDragging(true)}
          onEnd={() => setDragging(false)}
          dampingFactor={0.08}
          rotateSpeed={0.55}
        />
      )}

      <group ref={group} rotation={[-0.32, 0.5, 0]}>
        {layout.map((layer, i) => (
          <group
            key={layer.label}
            ref={(node: Group | null) => {
              layers.current[i] = node;
            }}
          >
            <RoundedBox args={[3, 0.14, 2.1]} radius={0.03} smoothness={3}>
              <meshStandardMaterial
                color={layer.bright ? palette.silver : palette.chrome}
                metalness={1}
                roughness={layer.bright ? 0.14 : 0.38}
                envMapIntensity={layer.bright ? 1.6 : 1.25}
              />
            </RoundedBox>

            {layer.cells?.map((cell, c) => {
              const [x, z, w, d] = cell;
              return (
                <mesh key={c} position={[x, 0.1, z]}>
                  <boxGeometry args={[w, 0.05, d]} />
                  <meshStandardMaterial
                    color={palette.chrome}
                    metalness={1}
                    roughness={0.2}
                    envMapIntensity={1.6}
                  />
                </mesh>
              );
            })}

            {/* A hairline around the edge of each slab, so a layer still reads
                as a distinct plate when the stack is shut. */}
            <mesh position={[0, -0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.48, 1.5, 4]} />
              <meshBasicMaterial color={palette.slate} transparent opacity={0.32} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export { LAYERS };
