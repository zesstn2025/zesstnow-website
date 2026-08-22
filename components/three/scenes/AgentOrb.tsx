"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, PointMaterial, Points, Sphere } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  MathUtils,
  Object3D,
  Vector3,
  type Group,
  type InstancedMesh,
  type LineBasicMaterial,
  type Points as ThreePoints,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * AI Agents — a liquid silver core that resolves into the agent loop.
 *
 * At rest it is a single mass of molten metal, restless and unformed, with a
 * field of data circling it: a model, holding everything at once and committed
 * to nothing. As the section scrolls the core calms and contracts, and the
 * nodes that were bound up inside it travel out to three tiers — Planning,
 * Knowledge synthesis, Execution.
 *
 * Nothing is added or removed across that move, which is the point: an agent is
 * not a different thing from a model, it is a model given an order of
 * operations.
 *
 * The three tier labels are DOM, not 3D text. Text in a canvas needs a font
 * atlas fetched at runtime, renders blurrier, and cannot be read by a screen
 * reader — so the words live in the section markup beside this.
 */

const NODES = 42;
const TIERS = 3;
const PARTICLES = 520;

/** Deterministic, so the layout is identical on server and client. */
function seeded(i: number) {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The molten core.
 *
 * Distortion is driven every frame rather than left at a constant: a fixed
 * `distort` is just a lumpy ball, and it is the change over time that reads as
 * liquid. It settles as the section scrolls — agitated while the agent is still
 * deciding, nearly smooth by the time it is executing.
 */
function LiquidCore({ progress }: { progress: React.RefObject<number> }) {
  // Typed loosely because drei does not export DistortMaterialImpl.
  const material = useRef<{ distort: number; time: number } | null>(null);
  const shell = useRef<Group>(null);
  const rough = useMemo(() => metalRoughnessMap(), []);

  useFrame((state, delta) => {
    const p = progress.current;
    const m = material.current;
    // Guarded: for a frame after a dynamic import the ref can still be empty,
    // and reaching through it throws inside the render loop.
    if (m) {
      // The property is `distort`. There is no `distortion` on this material,
      // and assigning one is a silent no-op — the surface simply never moves.
      const agitation = 0.52 - p * 0.42;
      m.distort = MathUtils.damp(
        m.distort,
        agitation + Math.sin(state.clock.elapsedTime * 1.3) * 0.06 * (1 - p),
        2.2,
        delta
      );
      m.time = state.clock.elapsedTime;
    }

    if (shell.current) {
      // Contracts as the tiers form: the mass becomes the process.
      const target = MathUtils.lerp(1, 0.26, p);
      const next = MathUtils.damp(shell.current.scale.x, target, 2, delta);
      shell.current.scale.setScalar(next);
      shell.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <group ref={shell}>
      <Sphere args={[1.05, 64, 64]}>
        <MeshDistortMaterial
          ref={material as never}
          color={palette.silver}
          metalness={1}
          roughness={0.14}
          roughnessMap={rough}
          // Clearcoat lays a second, sharper reflection over the first, the way
          // a liquid surface has a skin. Available because MeshDistortMaterial
          // extends MeshPhysicalMaterial.
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.9}
          distort={0.5}
          speed={1.6}
        />
      </Sphere>
    </group>
  );
}

/**
 * The data field.
 *
 * One `Points` object, not five hundred meshes — that would be five hundred
 * draw calls a frame and would make a mid-range phone audibly work. Additively
 * blended, so overlapping particles accumulate into brighter cores instead of
 * flatly covering one another.
 *
 * The only saturated colour on the site, and deliberately not a surface: these
 * are information in motion, and information is the one thing allowed a colour
 * of its own. Metal never takes it.
 */
function NeuralField({ progress }: { progress: React.RefObject<number> }) {
  const points = useRef<ThreePoints>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      // A shell, not a cube. A cube of random points shows flat faces and
      // corners the moment it turns, and its centre is denser than its edges,
      // which reads as a blob rather than as a field.
      const u = seeded(i * 3.1);
      const v = seeded(i * 7.7 + 11);
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 2.1 + seeded(i * 13.3 + 5) * 2.6;

      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.72; // flattened, so it reads as orbit
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const node = points.current;
    if (!node) return;
    const p = progress.current;
    node.rotation.y += delta * (0.14 - p * 0.09);
    node.rotation.x = MathUtils.damp(node.rotation.x, 0.1 + state.pointer.y * 0.1, 1.5, delta);

    // Thins as the agent commits to a plan. A field this dense over a finished
    // flowchart only obscures it.
    const material = node.material as { opacity: number };
    material.opacity = MathUtils.damp(material.opacity, 0.85 - p * 0.45, 2, delta);
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={palette.signal}
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
        opacity={0.85}
      />
    </Points>
  );
}

export default function AgentOrb({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  // The free-running spin, kept separately from the group's actual rotation so
  // it can be blended out rather than merely stopped.
  const spin = useRef(0);
  const rough = useMemo(() => metalRoughnessMap(), []);
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
      orb.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(1.2));

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

  /** Which nodes are wired together. */
  const links = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < NODES; i++) {
      pairs.push([i, Math.floor(seeded(i) * NODES)]);
      pairs.push([i, Math.floor(seeded(i + 99) * NODES)]);
    }
    return pairs.filter(([a, b]) => a !== b);
  }, []);

  const linePositions = useMemo(() => new Float32Array(links.length * 6), [links.length]);

  const colors = useMemo(
    () => ({ chrome: new Color(palette.chrome), silver: new Color(palette.silver) }),
    []
  );

  useFrame((state, delta) => {
    const p = progress.current;
    // Eased so the unfold has weight — it accelerates out of the core and
    // settles into the tiers rather than tracking the scrollbar linearly.
    const t = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    if (group.current) {
      // Turns while it is still a mass, and squares up to face the reader as it
      // becomes a diagram.
      //
      // The spin is accumulated separately and then scaled by how far the
      // unfold has got, so at the end it is multiplied by zero and the tiers
      // are always seen straight on. Simply stopping the rotation — which is
      // what `rotation.y += …` on its own does — leaves it frozen at whatever
      // angle it happened to reach, and a flowchart parked edge-on is three
      // rows collapsed into one unreadable line.
      spin.current += delta * 0.3;
      group.current.rotation.y = (spin.current + state.pointer.x * 0.2) * (1 - t);
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        state.pointer.y * 0.18 * (1 - t),
        1.4,
        delta
      );
    }

    if (!mesh.current) return;

    for (let i = 0; i < NODES; i++) {
      const from = layout.orb[i];
      const to = layout.flow[i];
      // Each node leaves on its own beat, so the mass unravels instead of
      // snapping. The spread is wide — the first nodes have arrived before the
      // last have left, which is what makes it read as an unfolding rather than
      // as forty-two things moving together.
      const lag = seeded(i + 7) * 0.5;
      const local = MathUtils.clamp((t - lag) / (1 - lag || 1), 0, 1);

      live[i].lerpVectors(from, to, local);
      live[i].y += Math.sin(state.clock.elapsedTime * 0.9 + i) * 0.018;

      dummy.position.copy(live[i]);
      // Held small until they start to leave, so the nodes and the core do not
      // read as a field of beads embedded in a ball.
      dummy.scale.setScalar((0.055 + (i % TIERS === 0 ? 0.02 : 0)) * (0.25 + local * 0.75));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, i % 5 === 0 ? colors.silver : colors.chrome);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;

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
      linesRef.current.getAttribute("position").needsUpdate = true;
    }

    // The wires fade as the diagram forms. Left at full strength the mesh of
    // cross-links stays drawn over the finished tiers and the flowchart cannot
    // be read through it. A trace is kept so the tiers still look connected.
    if (lineMaterial.current) {
      lineMaterial.current.opacity = 0.28 * (1 - t) + 0.05;
    }
  });

  return (
    <group ref={group}>
      <LiquidCore progress={progress} />
      <NeuralField progress={progress} />

      <instancedMesh ref={mesh} args={[undefined, undefined, NODES]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          metalness={1}
          roughness={0.22}
          roughnessMap={rough}
          envMapIntensity={1.55}
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
          opacity={0.28}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
