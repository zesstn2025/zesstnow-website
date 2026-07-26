"use client";

import { Suspense, useRef } from "react";
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
 */
function Studio({ variant }: { variant: Variant }) {
  return (
    <Environment resolution={128}>
      <Lightformer
        intensity={2.6}
        color="#a78bfa"
        position={[-4, 3, 2]}
        scale={[8, 6, 1]}
        form="rect"
      />
      <Lightformer
        intensity={2.2}
        color="#22d3ee"
        position={[5, -2, 1]}
        scale={[7, 5, 1]}
        form="rect"
      />
      <Lightformer
        intensity={1.1}
        color="#ffffff"
        position={[0, 5, -4]}
        scale={[10, 3, 1]}
        form="rect"
      />
      {variant === "hero" && (
        <Lightformer
          intensity={1.4}
          color="#6d3bf5"
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
  accent = "#a78bfa",
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

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, dprCap.current]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 0.2, variant === "hero" ? 6.6 : 5.8], fov: 42 }}
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

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} color="#c4b5fd" />
      <pointLight position={[-4, -2, 2]} intensity={22} color="#22d3ee" distance={14} />
      <pointLight position={[4, 2, -1]} intensity={16} color="#6d3bf5" distance={14} />

      <Suspense fallback={null}>
        <Studio variant={variant} />
        <AuroraRibbons />

        {/* On the home page the subject sits to the right of the headline —
            the copy owns the left half, exactly as in the reference layout. */}
        <group
          position={variant === "hero" ? [2.25, 0.15, 0] : [0, 0, 0]}
          scale={variant === "hero" ? 0.82 : 1}
        >
          <Core accent={accent} />
          {variant === "hero" && <Satellites />}
        </group>

        <Effects />
      </Suspense>

      <CameraRig scroll={scroll} variant={variant} />
    </Canvas>
  );
}
