"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Vector3,
  type Group,
  type InstancedMesh,
  Object3D,
  Color,
  type LineBasicMaterial,
} from "three";
import { palette } from "../palette";

/**
 * AI Agents — a neural orb that unfolds into the agent loop.
 *
 * At rest it is a sphere of nodes wired to their neighbours: a model, holding
 * everything at once and doing nothing. As the section scrolls, the same nodes
 * travel to three stacked tiers — Planning, Knowledge Elicitation, Execution —
 * and the sphere becomes a flowchart. Nothing is added or removed; the nodes
 * you were looking at are the nodes that arrange themselves, which is the whole
 * point: an agent is not a different thing from a model, it is a model given an
 * order of operations.
 *
 * The three tier labels are DOM, not 3D text. Text in a canvas needs a font
 * atlas fetched at runtime, and it renders blurrier and cannot be read by a
 * screen reader — so the words live in the section markup beside this.
 */

const NODES = 42;
const TIERS = 3;

/** Deterministic, so the layout is identical on server and client. */
function seeded(i: number) {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export default function AgentOrb({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const linesRef = useRef<BufferGeometry>(null);
  const lineMaterial = useRef<LineBasicMaterial>(null);
  // Reused every frame rather than allocated: this runs 42 times per frame, and
  // a new Object3D each time would hand the garbage collector a steady stream
  // of work for no reason.
  const dummy = useMemo(() => new Object3D(), []);
  const live = useMemo(() => Array.from({ length: NODES }, () => new Vector3()), []);

  /**
   * Where each node sits in each of the two states.
   *
   * `orb` is a Fibonacci sphere — evenly spread, no clumping at the poles, which
   * a naive random distribution always gives you. `flow` is a tier: a shallow
   * arc of nodes at one of three heights.
   */
  const layout = useMemo(() => {
    const orb: Vector3[] = [];
    const flow: Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < NODES; i++) {
      const y = 1 - (i / (NODES - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      orb.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(1.35));

      const tier = i % TIERS;
      const withinTier = Math.floor(i / TIERS);
      const perTier = Math.ceil(NODES / TIERS);
      const t = perTier > 1 ? withinTier / (perTier - 1) : 0.5;
      flow.push(
        new Vector3(
          (t - 0.5) * 3.1,
          1.35 - tier * 1.35,
          // A slight bow toward the camera, so a tier reads as a row in space
          // rather than as a line on a flat plane.
          Math.sin(t * Math.PI) * 0.45 - 0.2
        )
      );
    }
    return { orb, flow };
  }, []);

  /** Which nodes are wired together, and in which state that wire exists. */
  const links = useMemo(() => {
    const pairs: [number, number][] = [];
    // Orb wiring: each node to two pseudo-random others. Enough to read as a
    // network, few enough that the line count stays trivial.
    for (let i = 0; i < NODES; i++) {
      pairs.push([i, Math.floor(seeded(i) * NODES)]);
      pairs.push([i, Math.floor(seeded(i + 99) * NODES)]);
    }
    return pairs.filter(([a, b]) => a !== b);
  }, []);

  const linePositions = useMemo(
    () => new Float32Array(links.length * 6),
    [links.length]
  );

  const colors = useMemo(
    () => ({ chrome: new Color(palette.chrome), silver: new Color(palette.silver) }),
    []
  );

  useFrame((state, delta) => {
    const p = progress.current;
    // Eased so the unfold has weight — it accelerates out of the orb and settles
    // into the tiers rather than tracking the scrollbar linearly.
    const t = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    if (group.current) {
      // Turns while it is still an orb, and squares up as it becomes a diagram —
      // a flowchart you are reading should not be spinning.
      group.current.rotation.y += delta * 0.32 * (1 - t);
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        group.current.rotation.y * (1 - t * 0.06),
        1.2,
        delta
      );
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        state.pointer.y * 0.18 * (1 - t),
        2,
        delta
      );
    }

    if (!mesh.current) return;

    for (let i = 0; i < NODES; i++) {
      const from = layout.orb[i];
      const to = layout.flow[i];
      // Each node leaves on its own beat, so the sphere unravels instead of
      // snapping. The stagger is small enough that the whole move still reads
      // as one gesture.
      const lag = seeded(i + 7) * 0.28;
      const local = MathUtils.clamp((t - lag) / (1 - lag || 1), 0, 1);

      live[i].lerpVectors(from, to, local);
      // A little drift so nothing is ever perfectly still.
      live[i].y += Math.sin(state.clock.elapsedTime * 0.9 + i) * 0.018;

      dummy.position.copy(live[i]);
      const scale = 0.055 + (i % TIERS === 0 ? 0.02 : 0) * local;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, i % 5 === 0 ? colors.silver : colors.chrome);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;

    // Wires follow the nodes. They fade out as the diagram forms: a network
    // drawn on top of a flowchart is noise, not information.
    if (linesRef.current) {
      for (let l = 0; l < links.length; l++) {
        const [a, b] = links[l];
        const o = l * 6;
        linePositions[o] = live[a].x;
        linePositions[o + 1] = live[a].y;
        linePositions[o + 2] = live[a].z;
        linePositions[o + 3] = live[b].x;
        linePositions[o + 4] = live[b].y;
        linePositions[o + 5] = live[b].z;
      }
      const attr = linesRef.current.getAttribute("position");
      attr.needsUpdate = true;
    }

    // …and fade as it forms. Left at full strength the mesh of cross-links
    // stays drawn over the finished tiers, and the flowchart cannot be read
    // through it. A trace is kept so the tiers still look connected.
    if (lineMaterial.current) {
      lineMaterial.current.opacity = 0.3 * (1 - t) + 0.05;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, NODES]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.4}
          toneMapped={false}
        />
      </instancedMesh>

      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={linesRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={links.length * 2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterial}
          color={palette.slate}
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
