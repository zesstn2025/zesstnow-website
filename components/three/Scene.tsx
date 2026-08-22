"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Lightformer,
  PerformanceMonitor,
} from "@react-three/drei";
import { MathUtils } from "three";
import Core from "./Core";
import Satellites from "./Satellites";
import AuroraRibbons from "./AuroraRibbons";
import Effects from "./Effects";
import CanvasHost from "./CanvasHost";
import { palette } from "./palette";

type Variant = "hero" | "product";

/**
 * Drifts the camera with the pointer and pulls it back as the page scrolls, so
 * the composition opens up instead of staying pinned behind the hero copy.
 */
function CameraRig({
  scroll,
  variant,
}: {
  scroll: React.RefObject<number>;
  variant: Variant;
}) {
  useFrame((state, delta) => {
    const p = variant === "hero" ? Math.min(scroll.current * 2.4, 1) : 0;

    const targetX = state.pointer.x * 0.75;
    const targetY = 0.2 + state.pointer.y * 0.4 - p * 0.9;
    const targetZ = (variant === "hero" ? 6.6 : 5.8) + p * 2.2;

    state.camera.position.x = MathUtils.damp(state.camera.position.x, targetX, 2.6, delta);
    state.camera.position.y = MathUtils.damp(state.camera.position.y, targetY, 2.6, delta);
    state.camera.position.z = MathUtils.damp(state.camera.position.z, targetZ, 2.2, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/**
 * Lightformers instead of an HDRI preset — drei's presets are fetched from a
 * CDN at runtime, and the scene must not depend on a third-party host being up.
 *
 * One key, one fill, one kicker. The key is the only bright source and the only
 * saturated one; the fill exists solely to keep the shadow side of the glass
 * from going flat black, and stays desaturated so it never reads as a second
 * colour. This is the whole idea the design rests on — a subject is lit when
 * the light has a direction, and it has no direction when it comes from
 * everywhere at once.
 */
function Studio({ variant }: { variant: Variant }) {
  return (
    <Environment resolution={128}>
      {/* Key — upper left, dominant. The brightest thing in the scene. */}
      <Lightformer
        intensity={3.6}
        color={palette.silver}
        position={[-4.5, 3.2, 2]}
        scale={[8, 6, 1]}
        form="rect"
      />
      {/* Fill — opposite side, weak and near-neutral. */}
      <Lightformer
        intensity={0.85}
        color={palette.fill}
        position={[5, -2, 1]}
        scale={[7, 5, 1]}
        form="rect"
      />
      {/* Kicker — a thin line from behind that separates the form from the
          void. Dim; it defines an edge, it does not illuminate. */}
      <Lightformer
        intensity={1.5}
        color={palette.chrome}
        position={[0, 4.5, -4]}
        scale={[10, 1.6, 1]}
        form="rect"
      />
      {variant === "hero" && (
        <Lightformer
          intensity={0.9}
          color={palette.slate}
          position={[0, -4, 2]}
          scale={[8, 2, 1]}
          form="circle"
        />
      )}
    </Environment>
  );
}

export default function Scene({
  variant = "hero",
  accent = palette.silver,
  scroll,
  active = true,
}: {
  variant?: Variant;
  accent?: string;
  scroll: React.RefObject<number>;
  /** False when the canvas is off-screen or the tab is hidden — parks the loop. */
  active?: boolean;
}) {
  // The transmission material re-renders the scene into a buffer every frame, so
  // pixel count is the dominant cost. 1.5 is plenty for a soft, glassy subject.
  const dprCap = useRef(1.5);

  // Stable references. A fresh `gl` object literal on a re-render can make R3F
  // rebuild the renderer, and a rebuilt renderer is a brand-new WebGL context —
  // which the browser will not hand back on its own.
  const glOptions = useMemo(
    () => ({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance" as const,
      stencil: false,
      depth: true,
    }),
    []
  );

  const cameraOptions = useMemo(
    () => ({
      position: [0, 0.2, variant === "hero" ? 6.6 : 5.8] as [number, number, number],
      fov: 42,
    }),
    [variant]
  );

  return (
    <CanvasHost className="canvas-host">
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, dprCap.current]}
      gl={glOptions}
      camera={cameraOptions}
      // The canvas is decoration; screen readers and pointers should ignore it.
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => {
          dprCap.current = 1;
        }}
      />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />

      {/* Ambient is kept low on purpose: it is the one light with no direction,
          so every unit of it flattens the subject. */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[-4, 5, 3]} intensity={1.5} color={palette.silver} />
      <pointLight position={[-4, -1.5, 2]} intensity={14} color={palette.chrome} distance={14} />
      <pointLight position={[4, 2, -1]} intensity={6} color={palette.fill} distance={14} />

      <Suspense fallback={null}>
        <Studio variant={variant} />
        <AuroraRibbons />

        {/* On the home page the subject sits to the right of the headline —
            the copy owns the left half, exactly as in the reference layout. */}
        {/* The copy owns the left half on every page, so the subject sits to
            the right of it — centred, it renders straight through the headline
            and the scrim has to work far too hard. */}
        <group
          position={variant === "hero" ? [2.25, 0.15, 0] : [1.75, 0.1, 0]}
          scale={variant === "hero" ? 0.82 : 0.9}
        >
          <Core accent={accent} />
          {variant === "hero" && <Satellites />}
        </group>

        <Effects />
      </Suspense>

      <CameraRig scroll={scroll} variant={variant} />
    </Canvas>
    </CanvasHost>
  );
}
