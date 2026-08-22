"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll progress for a section, as a ref rather than as state.
 *
 * Every 3D scene on this site is driven by how far its own section has
 * travelled through the viewport. That value changes on every frame, so it must
 * never become React state — a `setState` per frame would re-render the tree
 * sixty times a second and hand the work to the reconciler instead of the GPU.
 * A ref is read directly inside `useFrame`, which is where the value is
 * actually needed.
 *
 * ScrollTrigger owns the measurement because it already handles the parts that
 * are tedious to get right: resize, refresh after images load, and reversing
 * cleanly when you scroll back up.
 */

let registered = false;

function ensureRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Returns a ref holding 0 → 1 as `el` crosses the viewport.
 *
 * 0 when the section's top reaches the bottom of the screen, 1 when its bottom
 * reaches the top — so a scene has finished its move while it is still being
 * looked at, rather than completing as it leaves.
 */
export function useSectionProgress(el: React.RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    const node = el.current;
    if (!node) return;

    ensureRegistered();

    // Reduced motion gets the finished state, not a frozen empty one. A scene
    // that never assembles is worse than one that was never animated.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.current = 1;
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [el]);

  return progress;
}

/**
 * Hands Lenis's virtual scroll position to ScrollTrigger.
 *
 * Lenis animates a transform rather than moving the real scroll position on
 * every frame, so ScrollTrigger — which reads `window.scrollY` — would lag
 * behind it and every scene would trail the content by a few frames. Calling
 * `ScrollTrigger.update` from inside Lenis's own loop keeps them on the same
 * clock. Called once, from the smooth-scroll component.
 */
export function bindScrollTrigger(onFrame: (fn: () => void) => void) {
  ensureRegistered();
  onFrame(() => ScrollTrigger.update());
}

export { gsap, ScrollTrigger };
