"use client";

import { useEffect, useState } from "react";
import { company } from "@/content/site";
import Mark from "@/components/Mark";

// Long enough for the liquid-metal reveal to actually finish. On a fast
// connection the load event fires almost immediately, and at the old 650ms the
// wordmark was pulled off screen mid-melt — the effect was built and then never
// seen. It still never delays anyone past MAX_MS.
const MIN_MS = 1500;
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
      {/* Unmounted the moment the preloader is done. The turbulence loops
          indefinitely by design, and the dismissed preloader stays in the DOM
          behind `visibility: hidden` — which stops it being painted but does
          not stop the SMIL timeline, so the filter would keep re-evaluating for
          the life of the page for something nobody can see. */}
      {!done && (
      <svg className="pre-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="liquid-metal" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              /* Stretched horizontally — far lower frequency across than down.
                 Equal frequencies give a bubbling, boiling surface; a wide,
                 shallow field gives the long horizontal draw of something
                 viscous running off a shape, which is what metal does. */
              baseFrequency="0.004 0.05"
              numOctaves={4}
              seed={7}
              result="noise"
            >
              {/* Drifting the noise rather than regenerating it keeps the
                  surface moving without the flicker a changing seed gives. */}
              <animate
                attributeName="baseFrequency"
                dur="11s"
                values="0.004 0.05; 0.009 0.032; 0.004 0.05"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={done ? 0 : 26}
              xChannelSelector="R"
              yChannelSelector="G"
              result="molten"
            >
              {/* Settles slowly, and overshoots twice on the way down rather
                  than easing straight to zero. Liquid finding its level wobbles
                  before it stops; a monotonic decay reads as a dissolve. */}
              <animate
                attributeName="scale"
                dur="1.75s"
                values="38; 11; 21; 5; 9; 0"
                keyTimes="0; 0.34; 0.5; 0.72; 0.86; 1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
            </feDisplacementMap>

            {/* A specular pass. The displaced shape is treated as a height
                field and lit from the upper left, which puts a real highlight
                on the ridges the turbulence just made — without it the letters
                deform but stay flat, and flat deformation reads as melting
                plastic rather than as metal. */}
            <feGaussianBlur in="molten" stdDeviation="1.4" result="heightfield" />
            <feSpecularLighting
              in="heightfield"
              surfaceScale={4}
              specularConstant={1.1}
              specularExponent={22}
              lightingColor="#ffffff"
              result="spec"
            >
              <feDistantLight azimuth={235} elevation={58} />
            </feSpecularLighting>
            {/* Clipped back to the letterforms, or the highlight spills into
                the space around them as a grey haze. */}
            <feComposite in="spec" in2="molten" operator="in" result="specClipped" />
            <feComposite in="specClipped" in2="molten" operator="arithmetic"
              k1={0} k2={1} k3={0.85} k4={0} />
          </filter>
        </defs>
      </svg>
      )}

      <div className="pre-brand" data-molten={!done}>
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
