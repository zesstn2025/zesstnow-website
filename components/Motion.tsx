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

    /* ── magnetic buttons ─────────────────────────────────────
       The pull has to stay small. An earlier version used 0.28 of
       the distance from centre with no clamp, which let a 154px
       button slide ~21px away from the cursor — far enough that
       pointerdown landed outside it and the click never reached the
       link. So: a gentle factor, a hard clamp well inside the
       button's own bounds, and a reset on pointerdown so the target
       is always at rest at the moment of the click. */
    if (fine) {
      const PULL = 0.12;
      const MAX = 5; // px — small enough that the cursor stays over the button

      const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));

      document.querySelectorAll<HTMLElement>(".pill").forEach((el) => {
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = clamp((e.clientX - (r.left + r.width / 2)) * PULL);
          const dy = clamp((e.clientY - (r.top + r.height / 2)) * PULL);
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        };
        const rest = () => {
          el.style.transform = "";
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", rest);
        // Settle before the click resolves — never let the button move away
        // from a press that has already started.
        el.addEventListener("pointerdown", rest);

        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", rest);
          el.removeEventListener("pointerdown", rest);
          rest();
        });
      });
    }

    /* ── scroll-driven card motion ────────────────────────────
       Cards do not just fade in once and freeze — they travel. A card
       approaches slightly small and pitched back, settles upright as it
       reaches the middle of the viewport, then recedes as it leaves.
       `data-s3d="left"` / `"right"` add a yaw so a card also swings in
       from its side.

       The value goes into a `--s3d` custom property, never `style.transform`,
       so it composes with TiltCard's `--tilt` instead of overwriting it. */
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-s3d]"));

    if (cards.length) {
      let raf = 0;
      let queued = false;

      const paint = () => {
        queued = false;
        const vh = window.innerHeight;

        for (const el of cards) {
          const r = el.getBoundingClientRect();
          if (r.bottom < -240 || r.top > vh + 240) continue;

          // -1 just below the fold, 0 dead centre, +1 just above the top.
          const centre = r.top + r.height / 2;
          const t = Math.max(-1, Math.min(1, (vh / 2 - centre) / (vh / 2 + r.height / 2)));
          const away = Math.abs(t);

          const scale = 1 - away * 0.07;
          const lift = t * -22;
          const pitch = t * -7;
          const dir = el.dataset.s3d;
          const yaw = dir === "left" ? away * 9 : dir === "right" ? away * -9 : 0;
          const slide = dir === "left" ? away * -26 : dir === "right" ? away * 26 : 0;

          el.style.setProperty(
            "--s3d",
            `translate3d(${slide.toFixed(1)}px, ${lift.toFixed(1)}px, 0)` +
              ` rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)` +
              ` scale(${scale.toFixed(4)})`
          );
          el.style.setProperty("--s3d-o", String((1 - away * 0.35).toFixed(3)));
        }
      };

      const onScroll = () => {
        if (queued) return;
        queued = true;
        raf = requestAnimationFrame(paint);
      };

      paint();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        cancelAnimationFrame(raf);
        cards.forEach((el) => {
          el.style.removeProperty("--s3d");
          el.style.removeProperty("--s3d-o");
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
