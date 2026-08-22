"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  MathUtils,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * SaaS and web build — modules flying together into an interface.
 *
 * Fourteen metallic panels start scattered and turned at random angles, and
 * assemble into the layout of a real dashboard: a sidebar, a row of stat cards,
 * a chart, a table. The point is what building software actually is — the parts
 * exist separately and the work is making them one thing.
 *
 * Every panel's start and end are computed once. Nothing here allocates during
 * a frame; the loop only reads a table and interpolates.
 */

type Panel = {
  /** Where it ends up: x, y, width, height, depth in the assembled layout. */
  to: [number, number, number, number, number];
  /** Where it starts, and how it is turned before it settles. */
  from: Vector3;
  spin: [number, number, number];
  /** Sequencing, 0–1. The frame lands before the things inside it. */
  order: number;
  bright?: boolean;
};

function seeded(i: number) {
  const x = Math.sin(i * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** The layout, in the same units the mesh uses. Read it as a wireframe. */
const LAYOUT: Panel["to"][] = [
  [-1.5, 0.0, 0.62, 2.5, 0.07], // sidebar
  [-0.3, 1.05, 1.5, 0.34, 0.06], // top bar
  [0.42, 0.42, 0.62, 0.5, 0.07], // stat card
  [1.12, 0.42, 0.62, 0.5, 0.07], // stat card
  [1.82, 0.42, 0.62, 0.5, 0.07], // stat card
  [0.42, -0.42, 0.98, 1.06, 0.07], // chart panel
  [1.55, -0.42, 1.16, 1.06, 0.07], // table panel
  [-0.3, -1.16, 1.5, 0.3, 0.06], // footer strip
];

/** Small details that land last: rows in the table, bars in the chart. */
const DETAILS: Panel["to"][] = [
  [0.42, -0.16, 0.16, 0.36, 0.05],
  [0.62, -0.24, 0.16, 0.2, 0.05],
  [0.82, -0.05, 0.16, 0.58, 0.05],
  [1.3, -0.16, 0.6, 0.07, 0.05],
  [1.3, -0.34, 0.6, 0.07, 0.05],
  [1.3, -0.52, 0.42, 0.07, 0.05],
];

export default function DashboardAssembly({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  // Shared across every metal surface on the page; generated once.
  const rough = useMemo(() => metalRoughnessMap(), []);
  const refs = useRef<(Mesh | null)[]>([]);

  const panels = useMemo<Panel[]>(() => {
    const all = [
      ...LAYOUT.map((to, i) => ({ to, order: i / (LAYOUT.length * 2), bright: i === 0 })),
      ...DETAILS.map((to, i) => ({ to, order: 0.5 + i / (DETAILS.length * 2) })),
    ];
    return all.map((panel, i) => ({
      ...panel,
      // Scattered outward and behind, so assembly reads as parts arriving from
      // depth rather than sliding in from the sides of a flat plane.
      from: new Vector3(
        (seeded(i) - 0.5) * 9,
        (seeded(i + 40) - 0.5) * 6,
        -3 - seeded(i + 80) * 5
      ),
      spin: [
        (seeded(i + 120) - 0.5) * 3.4,
        (seeded(i + 160) - 0.5) * 3.4,
        (seeded(i + 200) - 0.5) * 2.2,
      ] as [number, number, number],
    }));
  }, []);

  useFrame((state, delta) => {
    const p = progress.current;

    if (group.current) {
      // Held at a slight angle so the panels have thickness. It straightens as
      // the interface completes — a finished screen is looked at square on.
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        (0.42 - p * 0.3) + state.pointer.x * 0.12,
        1.3,
        delta
      );
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        -0.16 + p * 0.1 + state.pointer.y * 0.06,
        1.3,
        delta
      );
    }

    for (let i = 0; i < panels.length; i++) {
      const mesh = refs.current[i];
      if (!mesh) return;
      const panel = panels[i];

      // Each panel has its own window inside the section's scroll. The frame
      // parts land first and the contents after, which is the order a screen is
      // actually built in. The windows overlap heavily and each one is long, so
      // panels drift into place over most of the section instead of snapping
      // into it in the first third.
      const span = 0.72;
      const local = MathUtils.clamp((p - panel.order * 0.34) / span, 0, 1);
      // Quintic rather than cubic: a longer, softer approach to rest.
      const eased = 1 - Math.pow(1 - local, 5);

      const [x, y] = panel.to;
      mesh.position.set(
        MathUtils.lerp(panel.from.x, x, eased),
        MathUtils.lerp(panel.from.y, y, eased),
        MathUtils.lerp(panel.from.z, 0, eased)
      );
      mesh.rotation.set(
        panel.spin[0] * (1 - eased),
        panel.spin[1] * (1 - eased),
        panel.spin[2] * (1 - eased)
      );
      // Fades in over the first part of its own travel, so nothing pops.
      const material = mesh.material as MeshStandardMaterial;
      material.opacity = MathUtils.clamp(eased * 1.6, 0, 1);
    }
  });

  return (
    <group ref={group} scale={1.02}>
      {panels.map((panel, i) => {
        const [, , w, h, d] = panel.to;
        return (
          <RoundedBox
            key={i}
            ref={(node: Mesh | null) => {
              refs.current[i] = node;
            }}
            args={[w, h, d]}
            radius={0.022}
            smoothness={3}
          >
            {/* Slate, not charcoal. A dark metal in a dark room is correctly
                black — there is nothing for it to reflect — so the fix is a
                lighter alloy rather than more light, which would flatten
                everything else in the scene. */}
            <meshStandardMaterial
              color={panel.bright ? palette.silver : palette.chrome}
              metalness={1}
              roughness={panel.bright ? 0.16 : 0.36}
              roughnessMap={rough}
              envMapIntensity={panel.bright ? 1.75 : 1.4}
              transparent
              opacity={0}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
}
