"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial scrolling, plus anchor links routed through Lenis so in-page jumps
 * glide instead of teleporting. Skipped entirely for reduced-motion users, who
 * keep native scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

    // Native smooth scrolling would fight Lenis for control of the same gesture.
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Handles both "#services" and "/#services" from another route.
      const hash = href.startsWith("#")
        ? href
        : href.startsWith("/#") && window.location.pathname === "/"
          ? href.slice(1)
          : null;
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
      history.replaceState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.documentElement.style.scrollBehavior = previous;
    };
  }, []);

  return null;
}
