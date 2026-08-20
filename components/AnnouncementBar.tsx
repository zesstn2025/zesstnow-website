"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * The site-wide announcement strip.
 *
 * Rendered from the pinned announcement in content/announcements, so publishing
 * a launch to every page is a one-line frontmatter change rather than a code
 * change. Dismissal is remembered per announcement id — a new announcement
 * shows again even to someone who closed the last one.
 *
 * It mounts hidden and reveals after checking storage, so a returning visitor
 * never sees a bar flash in and out.
 */
export default function AnnouncementBar({
  id,
  kind,
  title,
  href,
  cta,
}: {
  id: string;
  kind: string;
  title: string;
  href: string;
  cta: string;
}) {
  const [state, setState] = useState<"checking" | "open" | "closed">("checking");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setState(localStorage.getItem(`ann:${id}`) === "closed" ? "closed" : "open");
    } catch {
      // Private mode or blocked storage — showing it is the safer default.
      setState("open");
    }
  }, [id]);

  // The nav is fixed at top:0. Publishing the bar's height as a variable is what
  // moves the nav below it — measured rather than hard-coded, because the title
  // wraps to two lines on a narrow screen.
  useEffect(() => {
    const root = document.documentElement;
    if (state !== "open") {
      root.style.removeProperty("--annbar-h");
      return;
    }

    const el = barRef.current;
    if (!el) return;

    const sync = () => root.style.setProperty("--annbar-h", `${el.offsetHeight}px`);
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--annbar-h");
    };
  }, [state]);

  const dismiss = () => {
    setState("closed");
    try {
      localStorage.setItem(`ann:${id}`, "closed");
    } catch {
      /* nothing to remember it with; it will show again next visit */
    }
  };

  if (state !== "open") return null;

  return (
    <div className="annbar" ref={barRef}>
      <Link href={href} className="annbar-link">
        <span className="annbar-kind">{kind}</span>
        <span className="annbar-title">{title}</span>
        <span className="annbar-cta">{cta} →</span>
      </Link>
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement">
        ×
      </button>
    </div>
  );
}
