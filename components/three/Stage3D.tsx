"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  View,
  Preload,
} from "@react-three/drei";
import { useAllow3D } from "@/lib/motion";
import CanvasHost from "./CanvasHost";

/**
 * One canvas for the whole page, and a viewport per section.
 *
 * The obvious way to give four services and a product showcase their own 3D
 * scene is five `<Canvas>` elements. It does not work: a browser keeps only a
 * handful of live WebGL contexts — around eight on desktop, fewer on a phone —
 * and silently discards the oldest when the limit is passed, so the scenes you
 * scrolled past go black and never come back. drei's `View` solves it properly.
 * A single fixed, full-screen canvas sits behind the page, and each section
 * declares a `<View>` that tracks one of its DOM elements; the renderer draws
 * every view into that one context using scissor rectangles, in one frame.
 *
 * The consequence worth knowing: a View gives its children their own scene, so
 * anything scene-level — lighting above all — has to be declared inside each
 * View rather than here. See components/three/Studio.tsx.
 */

export default function Stage3D({ children }: { children?: ReactNode }) {
  const allow3D = useAllow3D();
  const dprCap = useRef(1.5);
  // R3F needs a real DOM element to attach pointer events to, and `document`
  // does not exist until the client runs.
  const [source, setSource] = useState<HTMLElement | null>(null);

  useEffect(() => setSource(document.body), []);

  /**
   * Memoised, and it matters more than it looks.
   *
   * R3F watches the `gl` and `camera` props and rebuilds when they change. An
   * inline object literal is a new reference on every render, so each re-render
   * of this component handed R3F a "new" configuration. Measured across eight
   * page views that produced twenty-seven WebGL contexts where a handful was
   * expected, and a browser keeps only about sixteen before it starts silently
   * discarding the oldest.
   */
  const glOptions = useMemo(
    () =>
      ({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance" as const,
        stencil: false,
      }),
    []
  );
  // Views each carry their own camera; this one is only a default.
  const cameraOptions = useMemo(() => ({ position: [0, 0, 6] as [number, number, number], fov: 40 }), []);

  if (!allow3D || !source) return null;

  return (
    <CanvasHost className="stage3d-host">
    <Canvas
      className="stage3d"
      // Views are scattered across the document, so events have to be tracked
      // from a common ancestor rather than from the canvas itself.
      eventSource={source}
      eventPrefix="client"
      dpr={[1, dprCap.current]}
      gl={glOptions}
      /* Filmic rather than linear. A polished surface returns more light than a
         screen can show, and linear mapping clips every one of those highlights
         to the same flat white — which is exactly what makes rendered chrome
         look like grey plastic with a hot spot on it. ACES rolls the top end
         off instead, so a specular hit keeps its shape and its falloff. */
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        // ACES trades midtone brightness for highlight rolloff, so the same
        // scene comes out darker than it did under linear mapping. The exposure
        // has to be raised to put the midtones back where they were.
        gl.toneMappingExposure = 1.75;
        gl.outputColorSpace = SRGBColorSpace;
      }}
      camera={cameraOptions}
    >
      <PerformanceMonitor
        onDecline={() => {
          dprCap.current = 1;
        }}
      />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />

      <Suspense fallback={null}>
        {children}
        <View.Port />
      </Suspense>

      {/* Compiles every material once, up front, so the first scene to scroll
          into view does not stall the frame while its shader is built. */}
      <Preload all />
    </Canvas>
    </CanvasHost>
  );
}
