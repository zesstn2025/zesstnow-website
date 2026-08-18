"use client";

import { useEffect, useState } from "react";
import { company } from "@/content/site";
import Mark from "@/components/Mark";

const MIN_MS = 650; // don't flash on a fast connection
const MAX_MS = 2600; // never hold the page hostage

/**
 * Gates on real readiness — webfonts resolved and the window load event — with
 * a hard ceiling so a stalled resource can't trap anyone behind it.
 */
export default function Preloader() {
  const [pct, setPct] = useState(4);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const start = performance.now();
    let raf = 0;
    let settled = false;

    // Creep toward 92% while we wait, then let readiness carry it home.
    const tick = () => {
      if (!settled) {
        const elapsed = performance.now() - start;
        setPct(Math.min(92, 4 + (elapsed / MAX_MS) * 100));
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      if (settled) return;
      settled = true;
      cancelAnimationFrame(raf);
      setPct(100);
      window.setTimeout(() => setDone(true), 420);
    };

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const fonts = document.fonts?.ready ?? Promise.resolve();

    const ceiling = window.setTimeout(finish, MAX_MS);

    Promise.all([loaded, fonts]).then(() => {
      const remaining = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(finish, remaining);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(ceiling);
    };
  }, []);

  return (
    <div className="preloader" data-done={done} role="status" aria-live="polite">
      <div className="brand" style={{ fontSize: 17 }}>
        <Mark size={32} />
        {company.wordmark}
      </div>
      <div className="pre-bar">
        <div className="pre-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pre-pct">{Math.round(pct)}%</div>
      <span className="sr-only">Loading {company.shortName}</span>
    </div>
  );
}
