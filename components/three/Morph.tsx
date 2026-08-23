"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  DoubleSide,
  MathUtils,
  Vector4,
  type Group,
  type ShaderMaterial,
} from "three";
import { palette } from "./palette";

/**
 * One geometry that becomes six different objects.
 *
 * Every discipline the company sells gets its own form, and hovering a
 * discipline morphs the shape into it — so the section answers "what are you
 * looking for?" with something that visibly changes, rather than with a grid of
 * cards that all look the same.
 *
 * It really is one mesh. Morphing between six separately-modelled objects would
 * need six vertex buffers with matching counts and a lot of authoring; instead a
 * single sphere is displaced in the vertex shader by the Gielis superformula,
 * whose four parameters produce a screen, a lattice, a prism, a pill, a rosette
 * and a monolith. Morphing is then just interpolating four numbers, which is
 * both cheaper and genuinely continuous — you see the shape travel, not
 * cross-fade.
 *
 * It has no canvas of its own. It is drawn into the site's one shared canvas
 * through a `<View>`, like every other scene here — a browser keeps only a
 * handful of live WebGL contexts and silently kills the oldest when the limit
 * is passed, so a canvas per section would blank the earlier ones as you
 * scroll.
 */

/**
 * m, n1, n2, n3 — the superformula's shape parameters, one set per discipline.
 *
 * Two things about these that cost a pass each to learn. The exponents work the
 * opposite way round to how they read: all three LARGE flattens the form into a
 * polygon, all three SMALL pulls it out into a star. And they only do anything
 * together — raising n1 alone while n2 and n3 stay near 1 leaves the radius
 * varying by a few per cent, which is why an early set produced six shapes that
 * were all the same rounded box.
 *
 * m sets how many lobes or sides there are, so it carries most of the
 * difference between one discipline and the next.
 */
const SHAPES: [number, number, number, number][] = [
  [4, 10, 10, 10], // Web Experiences — a flat screen with hard corners
  [12, 0.8, 0.8, 0.8], // AI Automations — a twelve-lobed node cluster
  [6, 6, 6, 6], // Product Engineering — an assembled hexagonal prism
  [4, 1.2, 1.2, 1.2], // Apps — a held object, turned on its corner
  [8, 0.75, 0.75, 0.75], // Social automation — one post radiating outward
  [2, 4, 4, 4], // Brand Identity — a single smooth monolith
];

/**
 * A size correction per shape, so all six occupy roughly the same area.
 *
 * A lobed form's average radius is far below its peak, so left alone the two
 * bursts read as small, weak objects next to the cube — the section looked like
 * the object was retreating rather than changing. This is composition, not
 * geometry, which is why it is a separate number rather than another exponent.
 */
const SCALES = [1.0, 1.42, 1.05, 1.24, 1.36, 1.12];

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec4 uShape;      // m, n1, n2, n3 — already interpolated on the CPU
  uniform float uScale;
  varying vec3 vPos;

  // Gielis superformula. Returns the radius of the shape in a given direction.
  float super(float angle, float m, float n1, float n2, float n3) {
    float t = m * angle * 0.25;
    float a = pow(abs(cos(t)), n2);
    float b = pow(abs(sin(t)), n3);
    // The sum can reach zero at a cusp; clamp before the negative power so the
    // vertex does not fly to infinity and tear the mesh open.
    return pow(max(a + b, 1e-4), -1.0 / n1);
  }

  void main() {
    vec3 dir = normalize(position);

    float theta = atan(dir.z, dir.x);        // around the equator
    float phi = asin(clamp(dir.y, -1.0, 1.0)); // up from the equator

    float r1 = super(theta, uShape.x, uShape.y, uShape.z, uShape.w);
    float r2 = super(phi,   uShape.x, uShape.y, uShape.z, uShape.w);

    // Clamped at both ends, and the floor matters as much as the ceiling. The
    // radius is unbounded at low exponents, so without a ceiling one vertex
    // shoots off and spikes through the whole composition. But the two profiles
    // multiply, so a shape that dips in longitude AND latitude collapses toward
    // zero over most of the sphere — the lobed forms came out as thin crosses
    // with no volume at all until the floor was added.
    r1 = clamp(r1, 0.5, 2.0);
    r2 = clamp(r2, 0.5, 2.0);

    vec3 p = vec3(
      r1 * cos(theta) * r2 * cos(phi),
      r2 * sin(phi),
      r1 * sin(theta) * r2 * cos(phi)
    );

    // A slow breath, so a shape at rest is still alive.
    p *= uScale * (0.92 + sin(uTime * 0.7) * 0.015);

    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec3 uKey;
  uniform vec3 uFill;
  uniform float uWire;
  varying vec3 vPos;

  void main() {
    // The vertex shader moves every point, so the attribute normals no longer
    // describe the surface. Recovering the normal from screen-space derivatives
    // gives the true faceted normal of the displaced form for free.
    vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));

    vec3 keyDir = normalize(vec3(-0.7, 0.8, 0.5));
    float key = max(dot(n, keyDir), 0.0);
    float fill = max(dot(n, -keyDir), 0.0);

    // Rim: the edge that turns away from the camera catches the most light.
    float rim = pow(1.0 - abs(n.z), 2.6);

    // The form is dark and the light is on its edge. Lighting the faces at full
    // strength blew the whole shape out to near-white and lost every facet in
    // it — on a page built around a single rim light, the object has to be
    // mostly in shadow or there is no rim to see.
    vec3 col = uKey * (key * 0.16 + rim * 0.55) + uFill * fill * 0.07;

    // The wireframe pass is drawn additively and unlit, so it reads as an edge
    // rather than as a second surface. It sits on top of everything, so it has
    // to be faint or it becomes the object.
    if (uWire > 0.5) {
      // Fainter than it was. The wireframe pass used to be driven with stale
      // parameters, so it drew a different form from the solid and read as a
      // soft halo around it. Now that both passes get the same numbers the
      // edges land exactly on top of each other, and at the old alpha the
      // object came out hot enough to lose its facets.
      gl_FragColor = vec4(uKey * 0.8, 0.10);
      return;
    }

    gl_FragColor = vec4(col, 0.72);
  }
`;

function Shape({ index }: { index: number }) {
  const group = useRef<Group>(null);
  const solid = useRef<ShaderMaterial>(null);
  const wire = useRef<ShaderMaterial>(null);
  // The parameters currently on screen. Eased toward the target every frame, so
  // moving between two disciplines quickly overtakes rather than queues.
  const current = useRef<[number, number, number, number]>([...SHAPES[0]]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // A Vector4, not a plain array: three uploads a vec4 from an array
      // through a cache that compares it against a copy of itself, so mutating
      // the same array in place can silently never reach the GPU — which is
      // exactly why every discipline first rendered as the same rounded box.
      uShape: { value: new Vector4(...SHAPES[0]) },
      uScale: { value: SCALES[0] },
      uKey: { value: hexToRgb(palette.silver) },
      uFill: { value: hexToRgb(palette.fill) },
      uWire: { value: 0 },
    }),
    []
  );

  const wireUniforms = useMemo(
    () => ({
      uTime: uniforms.uTime,
      uShape: uniforms.uShape,
      uScale: uniforms.uScale,
      uKey: { value: hexToRgb(palette.chrome) },
      uFill: uniforms.uFill,
      uWire: { value: 1 },
    }),
    [uniforms]
  );

  useFrame((state, delta) => {
    /**
     * Written through the material's own uniform map rather than through the
     * object handed to it as a prop.
     *
     * This one was measured working either way — but the failure mode when it
     * is not is silent and total: the writes land somewhere the GPU never
     * reads, and the shape simply stops changing with no error anywhere. Two
     * scenes on this site had been frozen that way, one of them for weeks. A
     * pattern that happens to work is not worth keeping when the version that
     * always works is the same length.
     */
    const u = solid.current?.uniforms;
    const w = wire.current?.uniforms;
    if (!u) return;

    const target = SHAPES[index] ?? SHAPES[0];
    for (let i = 0; i < 4; i++) {
      current.current[i] = MathUtils.damp(current.current[i], target[i], 3.2, delta);
    }

    const shape = current.current as [number, number, number, number];
    const scale = MathUtils.damp(u.uScale.value, SCALES[index] ?? 1, 3.2, delta);

    u.uShape.value.set(...shape);
    u.uScale.value = scale;
    u.uTime.value += delta;

    // The wireframe shell runs the same vertex shader and must be given the
    // same numbers. Its uniform map was built to share the solid's entries by
    // reference, which works right up until the two materials end up with
    // separate maps — and then the cage stops following the form it is meant
    // to be drawn around, with nothing to indicate why.
    if (w) {
      w.uShape.value.set(...shape);
      w.uScale.value = scale;
      w.uTime.value = u.uTime.value;
    }

    // The whole form turns slowly, and leans toward the pointer.
    const g = group.current;
    if (g) {
      g.rotation.y += delta * 0.16;
      g.rotation.x = MathUtils.damp(g.rotation.x, state.pointer.y * 0.3, 2.4, delta);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 96, 64]} />
        <shaderMaterial
          ref={solid}
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.012}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial
          ref={wire}
          uniforms={wireUniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          wireframe
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** three's Color would do this, but the uniform only needs three floats. */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * The morphing form, for a `<View>` to render. The section owns the camera.
 */
export default function Morph({ index }: { index: number }) {
  return <Shape index={index} />;
}

export const SHAPE_COUNT = SHAPES.length;
