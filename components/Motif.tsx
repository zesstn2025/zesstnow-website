"use client";

import { useEffect, useRef } from "react";

/**
 * The scroll-driven diagrams.
 *
 * Each service the company sells gets a small drawing that does the thing it
 * describes as it comes up the page — a filing calendar lighting its due dates,
 * a disbursement window filling in, a stack of documents collapsing into one
 * certificate, enquiries falling through a funnel. Telling a visitor "we handle
 * GST filing" is a claim; showing a calendar fill itself in is the claim
 * demonstrated, in the same second, for free.
 *
 * These are SVG, not WebGL, for two reasons that both matter. A browser keeps
 * only a handful of live WebGL contexts and drops the oldest without warning,
 * so ten canvases down one page would blank the ones you had already scrolled
 * past. And a calendar grid or a funnel is a diagram: it is sharper, lighter
 * and readable by a screen reader as SVG, and putting it in a 3D context would
 * cost more and say less.
 *
 * All motion is driven by a single custom property, `--p`, running 0 to 1 as
 * the element crosses the viewport. Writing one number per frame and letting
 * CSS derive everything from it keeps React out of the scroll path entirely.
 */

export type MotifKind = "calendar" | "window" | "stack" | "funnel" | "assemble";

function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Show the finished state rather than an empty frame. A diagram that
      // never draws is worse than one that was never animated.
      el.style.setProperty("--p", "1");
      return;
    }

    let frame = 0;
    let live = false;

    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Runs from the moment the element's top enters the lower third to the
      // moment its middle passes the upper third — so the drawing completes
      // while it is still comfortably on screen, not as it leaves.
      const start = vh * 0.85;
      const end = vh * 0.35;
      const p = (start - r.top) / (start - end);
      el.style.setProperty("--p", String(Math.max(0, Math.min(1, p))));
    };

    const onScroll = () => {
      if (frame || !live) return;
      frame = requestAnimationFrame(measure);
    };

    // Only listen while the element is anywhere near the viewport; ten of these
    // all reading getBoundingClientRect on every scroll event is the kind of
    // thing that makes a page feel heavy for no visible benefit.
    const io = new IntersectionObserver(
      ([entry]) => {
        live = entry.isIntersecting;
        if (live) measure();
      },
      { rootMargin: "120% 0px 120% 0px" }
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measure();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/** GST: a filing year, with the due dates lighting up in order. */
function Calendar() {
  // Twelve months across, four filing marks each. The lit ones are the dates a
  // business actually files on — GSTR-1 and GSTR-3B, monthly.
  const cells = Array.from({ length: 48 }, (_, i) => i);
  return (
    <svg viewBox="0 0 240 130" className="motif-svg" role="img" aria-label="A year of GST filings, month by month">
      {cells.map((i) => {
        const col = i % 12;
        const row = Math.floor(i / 12);
        const due = row === 1 || row === 3; // the two filings each month
        return (
          <rect
            key={i}
            x={8 + col * 19}
            y={16 + row * 24}
            width={13}
            height={13}
            rx={2}
            className={due ? "motif-cell motif-cell-due" : "motif-cell"}
            style={{ "--i": col + row * 0.4 } as React.CSSProperties}
          />
        );
      })}
      <text x="8" y="122" className="motif-cap">GSTR-1</text>
      <text x="196" y="122" className="motif-cap">GSTR-3B</text>
    </svg>
  );
}

/** Loans: the 25–45 day disbursement window, filling as you scroll. */
function Window_() {
  return (
    <svg viewBox="0 0 240 130" className="motif-svg" role="img" aria-label="Disbursement typically lands between day 25 and day 45">
      <line x1="14" y1="86" x2="226" y2="86" className="motif-axis" />
      {[0, 15, 30, 45, 60].map((d) => (
        <g key={d}>
          <line x1={14 + (d / 60) * 212} y1="82" x2={14 + (d / 60) * 212} y2="90" className="motif-axis" />
          <text x={14 + (d / 60) * 212} y="104" className="motif-tick">{d}</text>
        </g>
      ))}
      {/* The window itself: day 25 to day 45 of a 60-day axis. */}
      <rect x={14 + (25 / 60) * 212} y="46" width={(20 / 60) * 212} height="34" rx="3" className="motif-window" />
      <text x={14 + (35 / 60) * 212} y="34" className="motif-figure">25–45</text>
      <text x={14 + (35 / 60) * 212} y="122" className="motif-cap motif-cap-mid">DAYS TO DISBURSEMENT</text>
    </svg>
  );
}

/** Registration and insurance: a stack of documents becoming one certificate. */
function Stack() {
  const sheets = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 240 130" className="motif-svg" role="img" aria-label="Paperwork collapsing into a single certificate">
      {sheets.map((i) => (
        <rect
          key={i}
          x="86"
          y="18"
          width="68"
          height="88"
          rx="3"
          className="motif-sheet"
          style={{ "--i": sheets.length - 1 - i } as React.CSSProperties}
        />
      ))}
      <circle cx="120" cy="92" r="9" className="motif-seal" />
    </svg>
  );
}

/** Leads: enquiries in at the top, qualified leads out at the bottom. */
function Funnel() {
  const drops = Array.from({ length: 9 }, (_, i) => i);
  // 9 in at the mouth, 3 out at the neck.
  return (
    <svg viewBox="0 0 240 130" className="motif-svg" role="img" aria-label="Enquiries entering a funnel and leaving as qualified leads">
      <path d="M62 22 H178 L136 74 V104 H104 V74 Z" className="motif-funnel" />
      {drops.map((i) => {
        const cx = 62 + i * 14.5;
        // Three of nine come out the bottom. The rest fall partway and fade —
        // which is what a funnel is for, and is more honest than showing every
        // enquiry converting. The three that make it land side by side rather
        // than on the same point, or they render as a single dot.
        const qualified = i % 3 === 1;
        const lands = [104, 120, 136][Math.floor(i / 3)] ?? 120;
        return (
          <circle
            key={i}
            cx={cx}
            cy="14"
            r="2.6"
            className={qualified ? "motif-drop motif-drop-in" : "motif-drop motif-drop-out"}
            style={
              {
                "--i": i,
                "--dx": (qualified ? lands : 120) - cx,
              } as React.CSSProperties
            }
          />
        );
      })}
      <text x="120" y="124" className="motif-cap motif-cap-mid">QUALIFIED</text>
    </svg>
  );
}

/** Process: the same form drawn as an outline, then filled in. */
function Assemble() {
  return (
    <svg viewBox="0 0 240 130" className="motif-svg" role="img" aria-label="A wireframe becoming a finished object">
      <polygon points="120,20 186,58 186,102 120,116 54,102 54,58" className="motif-solid" />
      <polygon points="120,20 186,58 186,102 120,116 54,102 54,58" className="motif-wire" />
      <path d="M120 20 V116 M54 58 L186 102 M186 58 L54 102" className="motif-wire motif-wire-inner" />
    </svg>
  );
}

const MOTIFS: Record<MotifKind, () => React.JSX.Element> = {
  calendar: Calendar,
  window: Window_,
  stack: Stack,
  funnel: Funnel,
  assemble: Assemble,
};

export default function Motif({ kind }: { kind: MotifKind }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref);
  const Drawing = MOTIFS[kind];

  return (
    <div className="motif" data-kind={kind} ref={ref}>
      <Drawing />
    </div>
  );
}
