"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  MathUtils,
  type Points,
  type ShaderMaterial,
  type Group,
} from "three";
import { palette } from "../palette";
import { metalRoughnessMap } from "../metal";

/**
 * Automation and marketing — a glass funnel with a live data stream.
 *
 * Three frosted cones nested inside one another, and a stream of silver
 * particles pouring through them. Scroll depth is the flow rate: at the top of
 * the section the funnel is idle, and by the bottom it is running at full rate
 * with particles emerging from the neck.
 *
 * The particles are one `Points` object with 320 vertices, not 320 meshes. A
 * mesh per particle would be 320 draw calls a frame and would make a mid-range
 * phone audibly work; this is one call, and the movement happens in the vertex
 * shader where the GPU is already going to be.
 */

const COUNT = 320;
const TOP = 2.1;
const NECK = -1.5;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uFlow;      // 0 idle, 1 running — the section's scroll progress
  uniform float uPixelRatio;
  attribute float aOffset;  // where this particle starts in the cycle
  attribute float aSpeed;
  attribute float aRadius;
  attribute float aAngle;
  varying float vFade;

  void main() {
    // Each particle runs its own loop from the mouth to the neck. Adding the
    // per-particle offset and taking the fraction means they are spread through
    // the fall at all times rather than released in visible waves.
    float cycle = fract(aOffset + uTime * aSpeed * (0.15 + uFlow * 0.55));

    float y = mix(${TOP.toFixed(1)}, ${NECK.toFixed(1)}, cycle);

    // The funnel narrows toward the neck, so the stream has to narrow with it,
    // or particles pour straight through the glass wall.
    float taper = mix(1.0, 0.12, smoothstep(0.0, 0.86, cycle));
    float r = aRadius * taper;
    float a = aAngle + uTime * 0.5 + cycle * 2.4;

    vec3 p = vec3(cos(a) * r, y, sin(a) * r);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + uFlow * 1.6) * uPixelRatio * (26.0 / -mv.z);

    // Fades in as it enters and out as it leaves, so nothing appears or
    // vanishes at a hard edge.
    vFade = smoothstep(0.0, 0.12, cycle) * (1.0 - smoothstep(0.86, 1.0, cycle)) * (0.25 + uFlow * 0.75);
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, pow(1.0 - d * 2.0, 2.0) * vFade);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function Stream({ progress }: { progress: React.RefObject<number> }) {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pos: number[] = [];
    const offset: number[] = [];
    const speed: number[] = [];
    const radius: number[] = [];
    const angle: number[] = [];

    for (let i = 0; i < COUNT; i++) {
      // Position is written entirely by the vertex shader; this attribute only
      // has to exist so three knows how many vertices there are.
      pos.push(0, 0, 0);
      offset.push(Math.random());
      speed.push(MathUtils.randFloat(0.5, 1.35));
      // Square root keeps the distribution even across the disc — a plain
      // random radius crowds everything into the centre.
      radius.push(Math.sqrt(Math.random()) * 1.5);
      angle.push(Math.random() * Math.PI * 2);
    }

    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("aOffset", new Float32BufferAttribute(offset, 1));
    g.setAttribute("aSpeed", new Float32BufferAttribute(speed, 1));
    g.setAttribute("aRadius", new Float32BufferAttribute(radius, 1));
    g.setAttribute("aAngle", new Float32BufferAttribute(angle, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: hexToRgb(palette.specular) },
    }),
    []
  );

  useFrame((state, delta) => {
    /**
     * Written through the material's own uniform map rather than through the
     * object this component passed in as a prop.
     *
     * The two are not reliably the same object, and when they differ every
     * write lands somewhere the GPU never reads — the particles freeze while
     * the cones around them keep turning, so the scene looks alive and the
     * thing it is actually about does not move. The ambient starfield sat
     * frozen on exactly this for weeks before it was caught by diffing two
     * frames.
     */
    const u = material.current?.uniforms;
    if (!u) return;

    u.uTime.value += delta;
    u.uFlow.value = MathUtils.damp(u.uFlow.value, progress.current, 1.5, delta);
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function DataFunnel({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const rough = useMemo(() => metalRoughnessMap(), []);

  // Three shells, each slightly larger and fainter than the last. One cone
  // reads as a paper cutout; nested ones read as thick glass.
  const shells = useMemo(
    () => [
      { top: 1.55, bottom: 0.2, height: 3.6, opacity: 0.14 },
      { top: 1.72, bottom: 0.27, height: 3.6, opacity: 0.09 },
      { top: 1.9, bottom: 0.34, height: 3.6, opacity: 0.055 },
    ],
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      0.08 + state.pointer.y * 0.1,
      2,
      delta
    );
  });

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      {shells.map((s, i) => (
        <mesh key={i} position={[0, 0.3, 0]}>
          <cylinderGeometry args={[s.top, s.bottom, s.height, 48, 1, true]} />
          <meshPhysicalMaterial
            color={palette.chrome}
            metalness={0.1}
            roughness={0.14}
            transmission={0.82}
            thickness={0.4}
            ior={1.42}
            transparent
            opacity={s.opacity}
            side={DoubleSide}
            depthWrite={false}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}

      {/* The neck: a solid ring, so the narrow end has an edge to catch light. */}
      <mesh position={[0, NECK - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.028, 12, 40]} />
        <meshStandardMaterial
          color={palette.silver}
          metalness={1}
          roughness={0.14}
          roughnessMap={rough}
          envMapIntensity={1.8}
        />
      </mesh>

      <Stream progress={progress} />
    </group>
  );
}
