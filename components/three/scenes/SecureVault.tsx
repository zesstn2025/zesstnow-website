"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Points,
  type ShaderMaterial,
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
 *
 * And a handshake runs on a loop while it is engaged: streams of ones and zeros
 * fall inward from beyond the frame, arrive at the surface, and set into a
 * faceted silver shell that holds for a beat before the next round begins. It
 * is the one animation on the site that is an argument rather than an
 * ornament — the page it sits on is about a company handling somebody\'s loan
 * file, and this says that what arrives as data leaves as something sealed.
 *
 * The cycle is driven by the clock, not by a tween, so it is continuous and
 * costs nothing to interrupt: `handshake` simply fades the whole layer in and
 * out around a loop that never stops running underneath.
 */

/* ── The handshake layer ────────────────────────────────────────────── */

const STREAM_COUNT = 120;

const streamVertex = /* glsl */ `
  uniform float uCycle;   // 0..1, the current round
  uniform float uOn;      // 0..1, how engaged the vault is
  attribute vec3 aDir;    // the ray this bit falls along, normalised
  attribute float aPhase; // where in the queue it sits
  attribute float aSize;
  varying float vAlpha;

  void main() {
    // Each bit starts at its own point in the round, so they arrive as a
    // stream rather than as a single ring closing in.
    float t = fract(uCycle + aPhase);

    // Far to near, easing in: data accelerating toward the thing it is
    // addressed to.
    float travel = t * t;
    float radius = mix(2.95, 1.84, travel);
    vec3 p = aDir * radius;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (34.0 / -mv.z) * (0.7 + uOn * 0.6);


    // Fades in as it appears and out as it lands, so nothing pops — and
    // brightens as it closes, so the eye is pulled toward the vault rather
    // than spread across a field of equally lit squares.
    vAlpha =
      smoothstep(0.0, 0.28, t) *
      (1.0 - smoothstep(0.86, 1.0, t)) *
      (0.25 + travel * 0.75) *
      uOn;
  }
`;

const streamFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Square, not round. A circular sprite reads as a spark; a hard-edged one
    // reads as a bit — which is the whole point of the image.
    vec2 c = abs(gl_PointCoord - 0.5);
    if (max(c.x, c.y) > 0.5) discard;

    // Colour in rgb, coverage in alpha — the form every other additive
    // material on this site uses. Premultiplying instead and writing 1.0 to the
    // alpha channel rendered these as opaque black squares: with an alpha of
    // one they stop being blended at all and simply paint their own colour,
    // which for a bit that has barely faded in is very nearly black.
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

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

  const streams = useRef<Points>(null);
  const streamMaterial = useRef<ShaderMaterial>(null);
  const shield = useRef<Mesh>(null);
  const shieldEdges = useRef<Mesh>(null);

  const dial = useMemo(() => DIAL, []);

  /** One ray per bit, spread over the sphere rather than over a disc. */
  const streamGeometry = useMemo(() => {
    const dir: number[] = [];
    const phase: number[] = [];
    const size: number[] = [];

    for (let i = 0; i < STREAM_COUNT; i++) {
      // Evenly distributed directions: acos of a uniform value, not a uniform
      // angle, or everything crowds the poles.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dir.push(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
      phase.push(Math.random());
      size.push(MathUtils.randFloat(0.5, 1.35));
    }

    const g = new BufferGeometry();
    // `position` is required by three even though the shader ignores it; the
    // ray and the phase are what place each bit.
    g.setAttribute("position", new Float32BufferAttribute(new Array(STREAM_COUNT * 3).fill(0), 3));
    g.setAttribute("aDir", new Float32BufferAttribute(dir, 3));
    g.setAttribute("aPhase", new Float32BufferAttribute(phase, 1));
    g.setAttribute("aSize", new Float32BufferAttribute(size, 1));
    return g;
  }, []);

  const streamUniforms = useMemo(
    () => ({
      uCycle: { value: 0 },
      uOn: { value: 0 },
      uColor: { value: hexToRgb(palette.signal) },
    }),
    []
  );

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

    /* ── The handshake ───────────────────────────────────────────────
       One round every 3.6 seconds, running on the clock whether anything is
       watching or not, with `o` fading the whole layer in. Driving it from a
       tween instead would mean a half-finished round left frozen the moment
       the pointer leaves. */
    const cycle = (t / 3.6) % 1;
    // Written through the material's own uniforms rather than through the
    // object handed to it as a prop. They are usually the same object, and
    // when they are not — a re-render replacing the prop, a clone on the way
    // in — every write lands on something the GPU never reads, and the effect
    // is invisible with no error anywhere.
    const uniforms = streamMaterial.current?.uniforms;
    if (uniforms) {
      uniforms.uCycle.value = cycle;
      uniforms.uOn.value = o;
    }

    if (streams.current) {
      // Turns slowly against the vault, so successive rounds do not arrive
      // down the same corridors.
      streams.current.rotation.y = t * 0.08;
    }

    // The shell sets as the bits land, holds, then releases just before the
    // next round — the beat that makes it read as a handshake completing
    // rather than as a shield fading in and out.
    const set = MathUtils.clamp((cycle - 0.42) / 0.22, 0, 1);
    const release = MathUtils.clamp((cycle - 0.86) / 0.14, 0, 1);
    const solid = (1 - Math.pow(1 - set, 3)) * (1 - release) * o;

    if (shield.current) {
      shield.current.rotation.y = -t * 0.12;
      shield.current.rotation.x = t * 0.05;
      shield.current.scale.setScalar(1 + (1 - solid) * 0.06);
      const m = shield.current.material as MeshStandardMaterial;
      m.opacity = solid * 0.34;
    }
    if (shieldEdges.current) {
      shieldEdges.current.rotation.y = -t * 0.12;
      shieldEdges.current.rotation.x = t * 0.05;
      const m = shieldEdges.current.material as MeshStandardMaterial;
      // The facet lines carry most of the read, so they run brighter than the
      // surface between them and arrive a fraction earlier.
      m.opacity = Math.min(solid * 1.35, 1) * 0.5;
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
        {/* Rougher than a mirror, and that is what makes it read as milled
            metal. A broad flat face at mirror smoothness pointed at the camera
            reflects the space behind the camera, which is empty — the block
            rendered as a black square with a lit outline. Scattering the
            reflection gathers the studio's strip lights across the whole
            face. */}
        <meshStandardMaterial
          color={palette.chrome}
          metalness={1}
          roughness={0.34}
          roughnessMap={rough}
          envMapIntensity={2.3}
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
          roughness={0.5}
          envMapIntensity={1.9}
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

      {/* The bits falling in. Cyan, because this is light in motion rather than
          a surface — the one thing on the site permitted a colour. */}
      <points ref={streams} geometry={streamGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={streamMaterial}
          uniforms={streamUniforms}
          vertexShader={streamVertex}
          fragmentShader={streamFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      {/* What they set into: a faceted silver shell around the vault. Flat
          shading rather than smooth, so it reads as plated sections rather than
          as a soap bubble. */}
      <mesh ref={shield} scale={1}>
        <icosahedronGeometry args={[1.78, 1]} />
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.24}
          roughnessMap={rough}
          envMapIntensity={2}
          flatShading
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={shieldEdges} scale={1.004}>
        <icosahedronGeometry args={[1.78, 1]} />
        <meshBasicMaterial
          color={palette.specular}
          wireframe
          transparent
          opacity={0}
          depthWrite={false}
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
