"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, RoundedBox, useCursor } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Vector3,
  type Group,
  type PerspectiveCamera,
  type Mesh,
  type MeshStandardMaterial,
  type Points,
  type ShaderMaterial,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * Four spheres, one per service, floating in a two-by-two constellation.
 *
 * Each one is a translucent shell with a different mechanism suspended inside
 * it, and the mechanism is the argument: a pulsing core for the agents, a solid
 * chrome block for the money, interlocking frames for software being assembled,
 * a ring of particles in orbit for demand. Four identical orbs with four labels
 * would have been a navigation menu wearing a costume.
 *
 * The shells are `meshPhysicalMaterial` with clearcoat rather than real
 * transmission. Refraction costs a scene render per material, and four of those
 * on the home page — behind everything else this site already draws — is a
 * frame budget spent on an effect nobody would be able to name. Low opacity, a
 * hard clearcoat and a Fresnel rim give the same read of "glass with something
 * suspended in it" for almost nothing.
 *
 * The rim is a shader rather than an emissive material because emission is
 * uniform across a surface and a rim is not: the edge that turns away from the
 * camera is the part that should light up. That is also what makes the hover
 * state legible from across the page.
 */

export type PortalKind = "core" | "cube" | "lattice" | "ring";

/** Where the four sit, before the whole group is scaled to fit the viewport. */
const SLOTS: [number, number, number][] = [
  [-1.62, 0.98, 0],
  [1.62, 0.98, -0.4],
  [-1.62, -0.98, -0.4],
  [1.62, -0.98, 0],
];

const R = 0.86;

const rimVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    // Fresnel: nothing at the centre, everything at the silhouette.
    float f = pow(1.0 - max(dot(normalize(vNormalV), normalize(vViewDir)), 0.0), 2.4);
    gl_FragColor = vec4(uColor, f * uStrength);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ── The four mechanisms ─────────────────────────────────────────── */

/** AI agents — a core that breathes. */
function Core({ hot }: { hot: React.RefObject<number> }) {
  const mesh = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Two beats of different lengths, so it never settles into a metronome.
    const pulse = 0.5 + Math.sin(t * 1.9) * 0.28 + Math.sin(t * 0.7) * 0.12;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.4;
      mesh.current.rotation.x = t * 0.22;
      const m = mesh.current.material as MeshStandardMaterial;
      m.emissiveIntensity = 1.6 + pulse * 1.5 + hot.current * 2.2;
    }
    if (halo.current) {
      const s = 1 + pulse * 0.22 + hot.current * 0.18;
      halo.current.scale.setScalar(s);
      // Kept low deliberately. Turned up to where the glow reads as impressive
      // on its own, the halo floods the whole shell and the core inside it —
      // the thing the sphere is actually about — disappears into the wash.
      (halo.current.material as MeshStandardMaterial).opacity =
        0.05 + pulse * 0.05 + hot.current * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color={palette.signal}
          emissive={palette.signal}
          emissiveIntensity={2}
          roughness={0.35}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
      {/* The light the core throws, rather than the core itself. */}
      <mesh ref={halo}>
        <sphereGeometry args={[0.46, 24, 16]} />
        <meshStandardMaterial
          color={palette.signal}
          emissive={palette.signal}
          emissiveIntensity={1.4}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Fintech — one solid block of chrome, turning slowly. Nothing hollow. */
function Block({ hot }: { hot: React.RefObject<number> }) {
  const group = useRef<Group>(null);
  const rough = useMemo(() => metalRoughnessMap(), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Speeds up under the pointer, which is most of what makes a static object
    // feel like it noticed you.
    group.current.rotation.y += delta * (0.25 + hot.current * 0.5);
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      0.32 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08,
      2,
      delta
    );
  });

  return (
    <group ref={group}>
      <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.045} smoothness={4}>
        {/* Rougher than a mirror, deliberately. A flat face at mirror
            smoothness pointed at the camera reflects the empty space behind
            the camera and renders black — the cube read as a dark hole with a
            lit outline. Scattering the reflection gathers the studio's strip
            lights across the whole face instead. */}
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.3}
          roughnessMap={rough}
          envMapIntensity={2.4}
        />
      </RoundedBox>
    </group>
  );
}

/** SaaS — frames interlocking. Software being assembled, not delivered whole. */
function Lattice({ hot }: { hot: React.RefObject<number> }) {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const c = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const k = 1 + hot.current * 1.4;
    if (a.current) {
      a.current.rotation.y += delta * 0.36 * k;
      a.current.rotation.x += delta * 0.14 * k;
    }
    if (b.current) {
      b.current.rotation.x -= delta * 0.3 * k;
      b.current.rotation.z += delta * 0.2 * k;
    }
    if (c.current) {
      c.current.rotation.z -= delta * 0.24 * k;
      c.current.rotation.y -= delta * 0.18 * k;
      c.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.04);
    }
  });

  return (
    <group>
      <mesh ref={a}>
        <boxGeometry args={[0.52, 0.52, 0.52]} />
        <meshBasicMaterial
          color={palette.silver}
          wireframe
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={b}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial
          color={palette.chrome}
          wireframe
          transparent
          opacity={0.42}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={c}>
        <torusGeometry args={[0.42, 0.012, 6, 40]} />
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.2}
          envMapIntensity={2}
        />
      </mesh>
    </group>
  );
}

/** Digital marketing — a ring of particles in orbit. Traffic, circulating. */
function Ring({ hot }: { hot: React.RefObject<number> }) {
  const points = useRef<Points>(null);
  const band = useRef<Mesh>(null);

  const geometry = useMemo(() => {
    const pos: number[] = [];
    const COUNT = 190;
    for (let i = 0; i < COUNT; i++) {
      // Scattered around the band rather than laid evenly on it, so it reads as
      // a stream rather than as a dotted line.
      const a = Math.random() * Math.PI * 2;
      const r = 0.42 + (Math.random() - 0.5) * 0.13;
      const y = (Math.random() - 0.5) * 0.1;
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    const k = 1 + hot.current * 1.6;
    if (points.current) {
      points.current.rotation.y += delta * 0.5 * k;
      points.current.rotation.z = 0.3 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
    if (band.current) {
      band.current.rotation.y -= delta * 0.2 * k;
      band.current.rotation.z = 0.3;
    }
  });

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          size={0.028}
          color={palette.signal}
          transparent
          opacity={0.95}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
      <mesh ref={band}>
        <torusGeometry args={[0.44, 0.008, 6, 48]} />
        <meshStandardMaterial
          color={palette.chrome}
          metalness={1}
          roughness={0.24}
          envMapIntensity={1.8}
        />
      </mesh>
    </group>
  );
}

const MECHANISMS = { core: Core, cube: Block, lattice: Lattice, ring: Ring } as const;

/* ── One sphere ──────────────────────────────────────────────────── */

function Sphere({
  index,
  kind,
  hovered,
  onOver,
  onOut,
  onSelect,
}: {
  index: number;
  kind: PortalKind;
  hovered: boolean;
  onOver: (i: number) => void;
  onOut: (i: number) => void;
  onSelect: (i: number) => void;
}) {
  const group = useRef<Group>(null);
  const rim = useRef<ShaderMaterial>(null);
  const shell = useRef<Mesh>(null);
  /**
   * How hot this sphere is, 0 to 1, eased.
   *
   * A ref rather than state so the mechanisms inside can read it every frame
   * without the section re-rendering sixty times a second. React only hears
   * about hover once, when it changes.
   */
  const hot = useRef(0);
  const Mechanism = MECHANISMS[kind];

  const rimUniforms = useMemo(
    () => ({
      uColor: { value: hexToRgb(palette.signal) },
      uStrength: { value: 0.35 },
    }),
    []
  );

  useFrame((state, delta) => {
    hot.current += ((hovered ? 1 : 0) - hot.current) * (1 - Math.exp(-7 * delta));

    if (group.current) {
      // Twenty per cent bigger under the pointer, damped so it swells rather
      // than snaps.
      const s = 1 + hot.current * 0.2;
      group.current.scale.setScalar(MathUtils.damp(group.current.scale.x, s, 8, delta));
    }
    if (rim.current) {
      // The hover state is carried by the silhouette, not by filling the sphere
      // with light. A Fresnel edge stays legible from across the page and still
      // lets you see what is suspended inside.
      rimUniforms.uStrength.value = 0.3 + hot.current * 0.95;
    }
    if (shell.current) {
      const m = shell.current.material as MeshStandardMaterial;
      m.opacity = 0.1 + hot.current * 0.05;
      // A slow turn, so the clearcoat highlight travels across the glass even
      // when nothing is being pointed at.
      shell.current.rotation.y = state.clock.elapsedTime * 0.12 + index;
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onOver(index);
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onOut(index);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(index);
  };

  return (
    <group ref={group}>
      {/* One invisible sphere carries every pointer event. Hanging them on the
          shell instead means the raycast has to pass through a transparent
          material and the hover flickers along the silhouette. */}
      <mesh onPointerOver={over} onPointerOut={out} onClick={click} visible={false}>
        <sphereGeometry args={[R * 1.02, 16, 12]} />
      </mesh>

      <mesh ref={shell}>
        <sphereGeometry args={[R, 48, 32]} />
        <meshPhysicalMaterial
          color={palette.chrome}
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.45}
          envMapIntensity={2.4}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.004}>
        <sphereGeometry args={[R, 48, 32]} />
        <shaderMaterial
          ref={rim}
          uniforms={rimUniforms}
          vertexShader={rimVertex}
          fragmentShader={rimFragment}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Mechanism hot={hot} />
    </group>
  );
}

/* ── The constellation ───────────────────────────────────────────── */

export default function PortalSpheres({
  kinds,
  hovered,
  onOver,
  onOut,
  onSelect,
  place,
}: {
  kinds: PortalKind[];
  /** Index of the sphere under the pointer, or null. */
  hovered: number | null;
  onOver: (i: number) => void;
  /**
   * Leaving one sphere for the next fires `out` on the old and `over` on the
   * new, and the order is not guaranteed. The index goes back to the section so
   * it can ignore an `out` for a sphere that is no longer the hovered one —
   * otherwise moving between two adjacent spheres flickers the label off.
   */
  onOut: (i: number) => void;
  onSelect: (i: number) => void;
  /**
   * Called every frame with where the hovered sphere is on screen, in pixels
   * relative to this view. The label is a DOM element positioned by the parent
   * — drei's `Html` portals into the canvas's own parent, and this canvas is
   * one shared full-screen surface behind the whole site, so an `Html` here
   * would be positioned against the window rather than against this section.
   *
   * Only the horizontal position is reported. Hung directly under its sphere
   * the label lands on the row below — the rows are two units apart and the
   * label is most of one — and hung above the top row it leaves the stage
   * entirely. Tracking the sphere sideways while sitting along the foot of the
   * stage collides with nothing at any aspect ratio, and still reads as a
   * caption belonging to the thing above it.
   */
  place: (x: number, visible: boolean) => void;
}) {
  const group = useRef<Group>(null);
  const { size, camera } = useThree();
  // Typed as a bare Camera by R3F; the view declares a perspective one, and
  // the frustum maths below needs its fov and aspect.
  const cam = camera as PerspectiveCamera;
  const projected = useMemo(() => new Vector3(), []);
  /**
   * The label's eased horizontal position, and whether it was on screen last
   * frame.
   *
   * The easing is done here rather than with a CSS transition, and that is not
   * a preference. `place` writes a transform every frame — the spheres float
   * and the constellation leans — and a CSS transition restarts on every write,
   * so the element spends its whole life chasing a target it never reaches.
   * Measured: the label sat a full sphere behind the pointer, on the wrong side
   * of the stage. Damping the number instead means one transform write per
   * frame with no transition on it at all.
   */
  const labelX = useRef(0);
  const wasVisible = useRef(false);

  useCursor(hovered !== null);

  /**
   * Scaled to whichever axis is tighter, so four spheres fill a wide desktop
   * stage and still fit a nearly square one on a phone — no second layout.
   *
   * Measured from the camera's own frustum rather than from `useThree().viewport`.
   * Inside a `View`, `viewport` describes the whole canvas, not the view's
   * rectangle: on a phone that canvas is 390 by 844, so the "width" it reported
   * was the width of a tall full-screen surface and the constellation shrank to
   * the 0.55 floor — tiny spheres marooned in a stage with room for four times
   * as much. `camera.aspect` is the number drei actually renders the view with,
   * which is why circles stay circles.
   *
   * The divisors are the span the four spheres occupy at full hover scale, plus
   * a little air: 2·1.62 + 2·0.86·1.2 across, 2·0.98 + 2·0.86·1.2 down.
   */
  const vFov = (cam.fov * Math.PI) / 180;
  const frustumH = 2 * Math.tan(vFov / 2) * Math.abs(cam.position.z);
  const frustumW = frustumH * cam.aspect;
  const fit = MathUtils.clamp(Math.min(frustumW / 5.4, frustumH / 4.2), 0.5, 1.1);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.scale.setScalar(MathUtils.damp(group.current.scale.x || fit, fit, 4, delta));
      // A slight lean toward the pointer — the whole constellation acknowledging
      // where you are, before any one sphere does.
      group.current.rotation.y = MathUtils.damp(
        group.current.rotation.y,
        state.pointer.x * 0.12,
        2,
        delta
      );
      group.current.rotation.x = MathUtils.damp(
        group.current.rotation.x,
        -state.pointer.y * 0.08,
        2,
        delta
      );
    }

    if (hovered === null) {
      wasVisible.current = false;
      place(labelX.current, false);
      return;
    }

    // The hovered sphere's centre, projected to this view's pixels. Taken from
    // the live world position rather than from the slot, so the label follows
    // the constellation's lean and the sphere's float instead of drifting off
    // it.
    const slot = SLOTS[hovered];
    projected.set(slot[0], slot[1], slot[2]);
    if (group.current) group.current.localToWorld(projected);
    projected.project(camera);
    const x = (projected.x * 0.5 + 0.5) * size.width;

    // Slides between spheres, but arrives instantly the first time — a label
    // that flies in from wherever it was last is a label that draws attention
    // to itself rather than to the sphere.
    labelX.current = wasVisible.current
      ? labelX.current + (x - labelX.current) * (1 - Math.exp(-9 * delta))
      : x;
    wasVisible.current = true;
    place(labelX.current, true);
  });

  return (
    <group ref={group}>
      {kinds.map((kind, i) => (
        <Float key={i} speed={1.1 + i * 0.22} rotationIntensity={0} floatIntensity={0.55}>
          <group position={SLOTS[i]}>
            <Sphere
              index={i}
              kind={kind}
              hovered={hovered === i}
              onOver={onOver}
              onOut={onOut}
              onSelect={onSelect}
            />
          </group>
        </Float>
      ))}
    </group>
  );
}

/** Where each sphere sits, so the section can aim the camera at one. */
export { SLOTS as PORTAL_SLOTS };
