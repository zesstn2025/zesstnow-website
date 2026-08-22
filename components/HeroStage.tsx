"use client";

import Stage from "./Stage";
import { useScrollProgress } from "@/lib/motion";

/** Thin client boundary so the page itself can stay a server component. */
export default function HeroStage({
  variant = "hero",
  accent = "#e8eef6",
  className = "hero-canvas",
}: {
  variant?: "hero" | "product";
  accent?: string;
  className?: string;
}) {
  const scroll = useScrollProgress();
  return (
    <Stage scroll={scroll} variant={variant} accent={accent} className={className} />
  );
}
