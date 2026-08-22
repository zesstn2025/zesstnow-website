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
      {/*
        The liquid-metal filter. feTurbulence generates a noise field and
        feDisplacementMap pushes the wordmark's pixels around by it, so the
        letterforms arrive molten and settle into shape as the scale animates
        down to zero. It is done in SVG rather than WebGL deliberately: this
        runs before anything else on the page, and a preloader that has to boot
        a GL context first is not a preloader.

        The filter is applied to a normal <div> of real text, so the company
        name is still text — selectable, and read out by a screen reader.
      */}
      <svg className="pre-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="liquid-metal" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.045"
              numOctaves={3}
              seed={7}
              result="noise"
            >
              {/* Drifting the noise rather than regenerating it keeps the
                  surface moving without the flicker a changing seed gives. */}
              <animate
                attributeName="baseFrequency"
                dur="7s"
                values="0.012 0.045; 0.02 0.03; 0.012 0.045"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={done ? 0 : 26}
              xChannelSelector="R"
              yChannelSelector="G"
            >
              <animate
                attributeName="scale"
                dur="2.2s"
                values="34; 6; 18; 0"
                keyTimes="0; 0.45; 0.7; 1"
                fill="freeze"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      <div className="pre-brand">
        <Mark size={34} />
        <span className="pre-wordmark">{company.wordmark}</span>
      </div>

      <div className="pre-bar">
        <div className="pre-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pre-pct">{Math.round(pct)}%</div>
      <span className="sr-only">Loading {company.shortName}</span>
    </div>
  );
}
