"use client";

import { useRef, type ReactNode } from "react";

/**
 * Hover tilt for cards sitting outside the WebGL canvas.
 *
 * It writes a `--tilt` custom property rather than `style.transform`, because
 * the same elements also carry scroll-driven motion from Motion.tsx. Two writers
 * on one `transform` means whichever fires last wins and the other silently
 * disappears; two custom properties compose in a single transform instead.
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
} & React.HTMLAttributes<HTMLDivElement>) {
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
    el.style.setProperty("--tilt", `rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--tilt", "rotateX(0deg)");
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
