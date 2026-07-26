"use client";

import { useRef, type ReactNode } from "react";

/**
 * CSS-3D tilt for cards sitting outside the WebGL canvas — the same depth cue
 * the reference uses on its content cards, cheap enough to run everywhere.
 */
export default function TiltCard({
  children,
  className = "",
  max = 8,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  "data-delay"?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useRef<boolean | null>(null);

  const canTilt = () => {
    if (allowed.current === null) {
      allowed.current =
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        window.matchMedia("(hover: hover)").matches;
    }
    return allowed.current;
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !canTilt()) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * max;
    const y = -((e.clientY - r.top) / r.height - 0.5) * (max * 0.7);
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
