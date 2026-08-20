"use client";

import { useEffect } from "react";

/**
 * Pointer-level motion: a cursor glow, magnetic buttons, and scroll parallax on
 * anything marked `data-parallax`.
 *
 * All of it is opt-in per device. Coarse pointers get nothing (there is no
 * cursor to follow and magnetism has no meaning on touch), and reduced-motion
 * disables the lot. Every effect writes to a transform on a leaf element, never
 * on an ancestor — a transform on a container would break the `position: sticky`
 * panels on the about page.
 */
export default function Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    /* ── cursor glow ─────────────────────────────────────────── */
    if (fine) {
      const glow = document.createElement("div");
      glow.className = "cursor-glow";
      document.body.appendChild(glow);

      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let gx = x;
      let gy = y;
      let raf = 0;

      const onMove = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
      };
      const tick = () => {
        gx += (x - gx) * 0.12;
        gy += (y - gy) * 0.12;
        glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        raf = requestAnimationFrame(tick);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(tick);

      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(raf);
        glow.remove();
      });
    }

    /* ── magnetic buttons ────────────────────────────────────── */
    if (fine) {
      const magnets = document.querySelectorAll<HTMLElement>(".pill");

      magnets.forEach((el) => {
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.34;
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.transform = "";
        });
      });
    }

    /* ── scroll parallax ─────────────────────────────────────── */
    const layers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );

    if (layers.length) {
      let raf = 0;
      let queued = false;

      const apply = () => {
        queued = false;
        const mid = window.innerHeight / 2;
        for (const el of layers) {
          const r = el.getBoundingClientRect();
          // Skip anything far off-screen — no point paying for it.
          if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
          const depth = Number(el.dataset.parallax) || 1;
          const offset = ((r.top + r.height / 2 - mid) / mid) * depth * -18;
          el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        }
      };

      const onScroll = () => {
        if (queued) return;
        queued = true;
        raf = requestAnimationFrame(apply);
      };

      apply();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        cancelAnimationFrame(raf);
        layers.forEach((el) => (el.style.transform = ""));
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
