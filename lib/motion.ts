"use client";

import { useEffect, useState } from "react";

/**
 * Does this browser give us a WebGL context at all?
 *
 * Asked once per session and remembered, and the probe hands its context
 * straight back. Both halves matter. Every component that hosts 3D calls
 * `useAllow3D`, so on a page with a field, a hero and a section scene this ran
 * three times per view; measured across seven client-side navigations it
 * created sixteen throwaway webgl2 contexts, none of them released. A browser
 * keeps only a handful of live contexts and silently kills the oldest to make
 * room — so a feature check for "can we render 3D?" was quietly evicting the 3D
 * it had just approved.
 *
 * `WEBGL_lose_context` is the only way to return a context on demand; without
 * it the canvas is unreferenced but the context lives until collection, which
 * on a single-page app is effectively never.
 */
let webglSupport: boolean | null = null;

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ||
      probe.getContext("webgl") ||
      probe.getContext("experimental-webgl");
    webglSupport = !!gl;
    (gl as WebGLRenderingContext | null)
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/**
 * Decides whether this device should get the full WebGL scene.
 *
 * Bails out for: reduced-motion users, low-core devices, small viewports and
 * anything without a working WebGL context. Callers render a static poster
 * instead — the page must be complete without the canvas.
 */
export function useAllow3D(): boolean {
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Phones do get a scene, but only if they look capable enough for it.
    const cores = navigator.hardwareConcurrency ?? 4;
    const narrow = window.innerWidth < 640;
    if (cores <= 2 || (narrow && cores < 4)) return;

    // Probe for an actual WebGL context before mounting anything heavy.
    if (!supportsWebGL()) return;

    // Never let GL compete with first paint. The scene mounts only once the page
    // has loaded and the main thread has gone quiet — the preloader, hero copy
    // and reveal animations all get a clear runway first.
    let idle = 0;
    let timer = 0;
    const arm = () => {
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(() => setAllow(true), { timeout: 1200 });
      else timer = window.setTimeout(() => setAllow(true), 300);
    };

    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    return () => {
      window.removeEventListener("load", arm);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return allow;
}

/**
 * True while the element is on screen and the tab is visible. Used to park the
 * render loop (`frameloop="never"`) whenever the scene isn't being looked at.
 */
export function useIsActive(ref: React.RefObject<HTMLElement | null>): boolean {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = true;
    const sync = () => setActive(onScreen && !document.hidden);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "160px" }
    );
    io.observe(el);

    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);

  return active;
}

/** Adds `.in` to `.reveal` elements as they scroll into view. */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? 0);
          window.setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

/** Normalised page scroll (0 → 1), updated on a rAF tick. */
export function useScrollProgress(): React.RefObject<number> {
  const [ref] = useState(() => ({ current: 0 }));

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current = max > 0 ? window.scrollY / max : 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref]);

  return ref;
}
