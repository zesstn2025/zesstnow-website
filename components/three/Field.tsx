"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
  type ShaderMaterial,
} from "three";
import { palette } from "./palette";

/**
 * The ambient field that sits behind the whole site.
 *
 * Deliberately cheap: points and unlit meshes only, no transmission, no
 * postprocessing, no environment map. It only has to make the page feel like it
 * is moving, on every route, for the entire scroll.
 *
 * This has no `<Canvas>` of its own. It lives in the one shared canvas in the
 * root layout, filling the frame behind every `<View>` rather than owning a
 * second WebGL context for the whole life of the site. Fading in is therefore a
 * There is no fade-in any more. It used to come free from the CSS wrapper's
 * opacity animation, and reimplementing it as a shader uniform cost most of a
 * day: a starfield multiplied by a uniform that never left zero renders as
 * nothing at all, silently, while the wireframe solids in the same scene render
 * perfectly — so the bug looks like "the move broke rendering" rather than
 * "one number is wrong". The field is subtle enough to simply be there.
 *
 * It also has to draw itself. drei's `View` subscribes to the frame loop with a
 * render priority, and any priority above zero switches off R3F's automatic
 * render of the root scene — so a plain child of the canvas is simply never
 * drawn. Moved in without this pass, the whole starfield vanished and the site
 * came back with a flat navy background and no error anywhere. `FieldPass`
 * renders the root scene at a priority below the views, so the field goes down
 * first and every view is drawn over it. Views render with `autoClear` off, so
 * they never punch a hole in it.
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

    // 1.15 rather than the 0.85 this used to carry. The old canvas was
    // rendered without multisampling and sat under a wrapper at 0.9 opacity;
    // the shared canvas has antialiasing on, and a two-pixel point covers only
    // part of each pixel's samples, so the resolve scales its contribution
    // down. Measured against the previous build at the same scroll position,
    // this puts the brightest star pixels back where they were.
    gl_FragColor = vec4(vTint, alpha * 1.15);
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

    // Two tints separated by value, not by hue — most points sit at slate, a
    // minority catch a silver highlight. A starfield carrying two different
    // colours reads as a screensaver; one that varies only in brightness reads
    // as depth.
    const slate = [0.36, 0.43, 0.52];
    const silver = [0.91, 0.93, 0.96];

    for (let i = 0; i < COUNT; i++) {
      pos.push(
        MathUtils.randFloatSpread(SPREAD * 1.5),
        MathUtils.randFloatSpread(SPREAD),
        MathUtils.randFloat(-18, 2)
      );
      scale.push(MathUtils.randFloat(0.5, 2.4));
      speed.push(MathUtils.randFloat(0.4, 1.6));
      tint.push(...(i % 4 === 0 ? silver : slate));
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
    // No guard on the material ref: there used to be one, and it guarded
    // nothing this callback actually touches.
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
  const fade = useRef(0);

  const shapes = useMemo(
    () =>
      [
        { pos: [-10.5, 2.2, -22], size: 3.4, color: palette.chrome, detail: 0 },
        { pos: [11.5, -2.6, -26], size: 4.2, color: palette.slate, detail: 1 },
        { pos: [6.5, 5.4, -19], size: 2.0, color: palette.silver, detail: 0 },
      ] as const,
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    fade.current = Math.min(fade.current + delta / 1.6, 1);
    group.current.traverse((child) => {
      const m = (child as Mesh).material as MeshBasicMaterial | undefined;
      if (m && "opacity" in m) m.opacity = 0.07 * fade.current;
    });
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
            opacity={0}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Mounted once, inside the shared canvas. `scroll` is site-wide progress, so
 * the field keeps travelling across a route change instead of restarting.
 */
/**
 * Draws the root scene full-frame, ahead of the views.
 *
 * Priority 0.5: above zero, so it runs in the ordered bucket rather than the
 * default one, and below the 1 that `View` uses by default, so it is first.
 * The scissor test has to be turned off explicitly — a view that rendered
 * earlier in the same frame leaves it on.
 */
function FieldPass() {
  useFrame(({ gl, scene, camera, size }) => {
    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
    gl.render(scene, camera);
  }, 0.5);
  return null;
}

export default function Field({ scroll }: { scroll: React.RefObject<number> }) {
  return (
    <>
      <Starfield scroll={scroll} />
      <Solids scroll={scroll} />
      <FieldPass />
    </>
  );
}
