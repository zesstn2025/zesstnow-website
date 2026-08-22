"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type Points,
  type ShaderMaterial,
} from "three";
import { palette } from "./palette";

/**
 * The ambient field that sits behind the whole site.
 *
 * Deliberately cheap: points and unlit meshes only, no transmission, no
 * postprocessing, no environment map. The hero canvas carries the expensive
 * glass; this one only has to make the page feel like it is moving, on every
 * route, for the entire scroll.
 */

const COUNT = 1500;
const SPREAD = 26;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aSpeed;
  attribute vec3 aTint;
  varying float vFade;
  varying vec3 vTint;

  void main() {
    vec3 p = position;

    // Slow vertical drift, wrapped so the field never empties out.
    p.y = mod(p.y + uTime * aSpeed * 0.35 + uScroll * 9.0, ${SPREAD.toFixed(1)}) - ${(SPREAD / 2).toFixed(1)};
    p.x += sin(uTime * 0.22 * aSpeed + p.y * 0.35) * 0.42;
    p.z += cos(uTime * 0.18 * aSpeed + p.x * 0.3) * 0.32;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (34.0 / -mv.z);

    // Fade at both ends of the depth range so nothing pops in or out.
    vFade = smoothstep(0.0, 6.0, -mv.z) * (1.0 - smoothstep(20.0, 34.0, -mv.z));
    vTint = aTint;
  }
`;

const fragment = /* glsl */ `
  varying float vFade;
  varying vec3 vTint;

  void main() {
    // Round, soft-edged sprite — no texture fetch needed.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = pow(1.0 - d * 2.0, 2.2) * vFade;
    gl_FragColor = vec4(vTint, alpha * 0.85);
  }
`;

function Starfield({ scroll }: { scroll: React.RefObject<number> }) {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pos: number[] = [];
    const scale: number[] = [];
    const speed: number[] = [];
    const tint: number[] = [];

    // Two tints drawn from the one accent and separated by value, not by hue —
    // most points sit at a dim ember, a minority catch the champagne highlight.
    // A starfield carrying two different colours reads as a screensaver.
    const ember = [0.62, 0.5, 0.3];
    const champagne = [0.91, 0.85, 0.66];

    for (let i = 0; i < COUNT; i++) {
      pos.push(
        MathUtils.randFloatSpread(SPREAD * 1.5),
        MathUtils.randFloatSpread(SPREAD),
        MathUtils.randFloat(-18, 2)
      );
      scale.push(MathUtils.randFloat(0.5, 2.4));
      speed.push(MathUtils.randFloat(0.4, 1.6));
      tint.push(...(i % 4 === 0 ? champagne : ember));
    }

    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("aScale", new Float32BufferAttribute(scale, 1));
    g.setAttribute("aSpeed", new Float32BufferAttribute(speed, 1));
    g.setAttribute("aTint", new Float32BufferAttribute(tint, 3));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!material.current) return;
    uniforms.uTime.value += delta;
    uniforms.uScroll.value = scroll.current;
    uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    if (points.current) {
      points.current.rotation.z = MathUtils.damp(
        points.current.rotation.z,
        state.pointer.x * 0.06,
        1.5,
        delta
      );
    }
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

/** Big, dim wireframe solids drifting far behind the content. */
function Solids({ scroll }: { scroll: React.RefObject<number> }) {
  const group = useRef<Group>(null);

  const shapes = useMemo(
    () =>
      [
        { pos: [-10.5, 2.2, -22], size: 3.4, color: palette.gold, detail: 0 },
        { pos: [11.5, -2.6, -26], size: 4.2, color: palette.bronze, detail: 1 },
        { pos: [6.5, 5.4, -19], size: 2.0, color: palette.goldLight, detail: 0 },
      ] as const,
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.03;
    // Scroll pulls the whole cluster upward, so the page reads as travelling
    // through the field rather than past a backdrop.
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      scroll.current * 7,
      1.6,
      delta
    );
    group.current.position.x = MathUtils.damp(
      group.current.position.x,
      state.pointer.x * -0.8,
      1.2,
      delta
    );
  });

  return (
    <group ref={group}>
      {shapes.map((s, i) => (
        <mesh key={i} position={s.pos as unknown as [number, number, number]}>
          <icosahedronGeometry args={[s.size, s.detail]} />
          <meshBasicMaterial
            color={s.color}
            wireframe
            transparent
            opacity={0.07}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Field({
  scroll,
  active = true,
}: {
  scroll: React.RefObject<number>;
  active?: boolean;
}) {
  const dprCap = useRef(1.25);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, dprCap.current]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        stencil: false,
        depth: false,
      }}
      camera={{ position: [0, 0, 9], fov: 55 }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => {
          dprCap.current = 1;
        }}
      />
      <AdaptiveDpr pixelated={false} />
      <Starfield scroll={scroll} />
      <Solids scroll={scroll} />
    </Canvas>
  );
}
