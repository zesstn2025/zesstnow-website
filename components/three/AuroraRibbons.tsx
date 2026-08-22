"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
  type Group,
} from "three";
import { palette } from "./palette";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    // A pulse of light travelling along the ribbon.
    float head  = fract(vUv.x - uTime * uSpeed);
    float glow  = smoothstep(0.0, 0.42, head) * smoothstep(1.0, 0.5, head);

    // Fade the tube's cross-section so the edges melt instead of ending hard.
    float waist = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);

    // Fade the ribbon's own ends.
    float ends  = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);

    vec3 color = mix(uColorA, uColorB, vUv.x);
    float alpha = glow * waist * ends * uOpacity;

    if (alpha < 0.002) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

type RibbonSpec = {
  points: [number, number, number][];
  radius: number;
  speed: number;
  colorA: string;
  colorB: string;
  opacity: number;
};

/**
 * The reference had gold ribbons swirling behind the product. These are the
 * same gesture in the brand's colours — sweeping tubes with a light pulse
 * running through them, blended additively so they read as atmosphere rather
 * than geometry.
 */
const RIBBONS: RibbonSpec[] = [
  {
    points: [
      [-7, -2.6, -7],
      [-3.2, 1.6, -5.4],
      [0.6, -1.3, -4.6],
      [4.2, 2.1, -5.6],
      [7.4, -0.8, -7.4],
    ],
    radius: 0.032,
    speed: 0.055,
    colorA: palette.chrome,
    colorB: palette.slate,
    opacity: 0.5,
  },
  {
    points: [
      [-7.5, 2.8, -8.2],
      [-2.6, -2.1, -6.4],
      [1.4, 2.3, -5.8],
      [5.1, -1.6, -6.8],
      [8, 1.4, -8.6],
    ],
    radius: 0.024,
    speed: 0.038,
    colorA: palette.silver,
    colorB: palette.slate,
    opacity: 0.38,
  },
  {
    points: [
      [-6.4, 0.4, -6],
      [-2.2, 3.1, -6.8],
      [2.4, -2.7, -6.2],
      [6.2, 1.1, -6.6],
    ],
    radius: 0.02,
    speed: 0.072,
    colorA: palette.silver,
    colorB: palette.chrome,
    opacity: 0.32,
  },
];

function Ribbon({ spec }: { spec: RibbonSpec }) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(
      spec.points.map(([x, y, z]) => new Vector3(x, y, z))
    );
    return new TubeGeometry(curve, 160, spec.radius, 10, false);
  }, [spec]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: spec.speed },
          uColorA: { value: new Color(spec.colorA) },
          uColorB: { value: new Color(spec.colorB) },
          uOpacity: { value: spec.opacity },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
      }),
    [spec]
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <mesh geometry={geometry} material={material} />;
}

export default function AuroraRibbons() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.07) * 0.08;
  });

  return (
    <group ref={group}>
      {RIBBONS.map((spec, i) => (
        <Ribbon key={i} spec={spec} />
      ))}
    </group>
  );
}
