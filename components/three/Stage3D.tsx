"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  View,
  Preload,
} from "@react-three/drei";
import { useAllow3D } from "@/lib/motion";

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

  if (!allow3D || !source) return null;

  return (
    <Canvas
      className="stage3d"
      // Views are scattered across the document, so events have to be tracked
      // from a common ancestor rather than from the canvas itself.
      eventSource={source}
      eventPrefix="client"
      dpr={[1, dprCap.current]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      // Views each carry their own camera; this one is only a default.
      camera={{ position: [0, 0, 6], fov: 40 }}
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
  );
}
