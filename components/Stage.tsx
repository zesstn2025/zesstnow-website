"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useAllow3D, useIsActive } from "@/lib/motion";

const Scene = dynamic(() => import("./three/Scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Hosts the WebGL canvas.
 *
 * The poster underneath is not a placeholder — it renders on every device and
 * stays visible behind the canvas. On machines that fail `useAllow3D` (reduced
 * motion, no WebGL, weak hardware) it is the entire background, and the page is
 * designed to look finished with nothing but it.
 */
export default function Stage({
  scroll,
  variant = "hero",
  accent = "#a78bfa",
  className = "hero-canvas",
}: {
  scroll: React.RefObject<number>;
  variant?: "hero" | "product";
  accent?: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const allow3D = useAllow3D();
  const active = useIsActive(host);

  return (
    <div ref={host} className={className} aria-hidden="true">
      {/* Static atmosphere — always rendered */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            variant === "hero"
              ? "radial-gradient(ellipse 70% 55% at 62% 42%, rgba(109,59,245,.20), transparent 68%)"
              : "radial-gradient(ellipse 60% 60% at 50% 45%, rgba(34,211,238,.14), transparent 70%)",
        }}
      />
      <div
        className="aurora aurora-violet aurora-drift"
        style={{ width: "46vw", height: "46vw", top: "-8%", right: "-6%" }}
      />
      <div
        className="aurora aurora-cyan aurora-drift"
        style={{
          width: "34vw",
          height: "34vw",
          bottom: "-12%",
          left: "-8%",
          animationDelay: "-7s",
        }}
      />

      {allow3D && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Scene
            variant={variant}
            accent={accent}
            scroll={scroll}
            active={active}
          />
        </div>
      )}
    </div>
  );
}
