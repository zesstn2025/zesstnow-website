"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MathUtils } from "three";

/**
 * Scroll progress for a section, as a ref rather than as state.
 *
 * Every 3D scene on this site is driven by how far its own section has
 * travelled through the viewport. That value changes on every frame, so it must
 * never become React state — a `setState` per frame would re-render the tree
 * sixty times a second and hand the work to the reconciler instead of the GPU.
 * A ref is read directly inside `useFrame`, which is where the value is needed.
 *
 * A note on ScrollTrigger, which this used to use and no longer does.
 *
 * ScrollTrigger records each trigger's start and end once and caches them, and
 * on this page those numbers do not stay true: webfonts swap and reflow every
 * heading, `next/image` resolves placeholders, the preloader is removed, and
 * the pillar scenes arrive by dynamic import — all after the triggers are
 * created. Refreshing on `load`, on `fonts.ready` and on a late timer still did
 * not line them up. Measured, parking the agent section at 88% of its own
 * travel reported a progress of 0.31, so the core never contracted and the
 * tiers never formed. The failure is quiet, which is what made it expensive:
 * nothing errors, every trigger keeps firing, the numbers are simply wrong.
 *
 * Reading the bounding rect each frame is a handful of cheap numbers and cannot
 * go stale, because nothing is cached to go stale. It is the same measurement
 * the SVG motifs use, and those have been correct since the first run.
 *
 * gsap still drives it — one shared ticker for every section on the page — but
 * the plugin is gone rather than left registered and unused, along with the
 * per-frame `ScrollTrigger.update()` that went with it.
 */

/**
 * Returns a ref holding 0 → 1 as `el` comes into view.
 *
 * 0 when the top edge reaches the bottom of the screen, 1 when the element's
 * centre reaches the centre of the screen — and it stays at 1 from there on.
 *
 * The obvious range is entry to exit: 0 at "top edge hits the bottom", 1 at
 * "bottom edge hits the top". It is also wrong, and quietly so. For a section
 * taller than the viewport, progress only reaches 1 once the section has almost
 * entirely scrolled off the top, so the finished state is reached at the moment
 * it stops being visible. Standing in front of the agent section and looking
 * straight at it, that mapping gives 0.5 — the core half-contracted and the
 * tiers half-formed — and the completed flowchart it was all building toward
 * could not be seen at any scroll position at all.
 *
 * Finishing at centre means the assembly completes exactly when the thing is
 * squarely in front of the reader, and then holds while they read it.
 */
export function useSectionProgress(
  el: React.RefObject<HTMLElement | null>,
  /**
   * How hard the value is pulled toward the scroll position, per second.
   * Lower is slower and heavier. Around 1.6 an object still feels connected to
   * the wheel; below about 1 it starts to feel disconnected from it.
   */
  smoothing = 1.6
) {
  const progress = useRef(0);

  useEffect(() => {
    const node = el.current;
    if (!node) return;

    // Reduced motion gets the finished state, not a frozen empty one. A scene
    // that never assembles is worse than one that was never animated.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.current = 1;
      return;
    }

    const measure = (dt: number) => {
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // Travel from "top edge at the bottom of the screen" to "centre on
      // centre". Guarded against a zero span for an element with no height,
      // which would otherwise divide by zero and produce NaN for every frame
      // afterwards — and NaN in a transform silently removes the object.
      const span = Math.max(vh / 2 + r.height / 2, 1);
      const target = MathUtils.clamp((vh - r.top) / span, 0, 1);

      // Ease toward it rather than snapping. Bound directly, an assembling
      // object tracks the wheel one to one: it jumps in the steps the wheel
      // reports, stops dead the instant scrolling stops, and reverses with no
      // weight at all. Damping gives every scene inertia, so parts keep
      // travelling for a moment after the scroll settles.
      //
      // Frame-rate independent: the same curve at 60fps and at 144fps.
      progress.current += (target - progress.current) * (1 - Math.exp(-smoothing * dt));
    };

    const tick = (_time: number, deltaMs: number) => {
      measure(Math.min(deltaMs, 64) / 1000); // clamp, or a background tab jumps
    };

    // Seeded so the first painted frame is already correct rather than zero.
    measure(1);
    gsap.ticker.add(tick);

    return () => gsap.ticker.remove(tick);
  }, [el, smoothing]);

  return progress;
}

export { gsap };
