"use client";

import { useEffect, useRef, useState } from "react";
import { chapters } from "@/content/site";

/**
 * The scroll rail: a numbered index of the page, pinned to the left edge, with
 * the current chapter lit.
 *
 * It does two jobs at once. It tells a visitor how long the page is and where
 * they are in it — a long scroll with no landmarks feels endless — and it makes
 * the page read as a sequence rather than as a stack of unrelated sections,
 * which is the thing the reference films do that ordinary sites do not.
 *
 * Numbering is meaningful here: the chapters genuinely are ordered. If this
 * were an unordered list of links, numbers would be decoration and the labels
 * alone would be the honest treatment.
 */
export default function ChapterRail() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  // Which chapters actually exist on this page. State, not a ref: the rail
  // renders from it, so discovering the sections has to cause a render. Held in
  // a ref this list was invisible on first paint and only appeared later, when
  // an unrelated scroll update happened to re-render the component.
  const [found, setFound] = useState<string[]>([]);
  const targets = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // A chapter whose section is not on this page is skipped entirely, so the
    // rail can be mounted on any route without listing links that go nowhere.
    const present = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    targets.current = present;
    if (present.length < 3) return; // Not a page with a narrative; stay hidden.
    setFound(present.map((el) => el.id));

    // The chapter that owns the upper third of the viewport is the active one.
    // Using a band rather than a single line stops the highlight flickering
    // between two sections when a short one is halfway up the screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = present.indexOf(entry.target as HTMLElement);
          if (i !== -1) setActive(i);
        }
      },
      { rootMargin: "-32% 0px -60% 0px", threshold: 0 }
    );

    present.forEach((el) => io.observe(el));

    // The rail appears once the hero is behind you — over the hero it would
    // compete with the headline, which is the one thing that should be alone.
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (index: number) => {
    const el = targets.current[index];
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const shown = chapters.filter((c) => found.includes(c.id));
  if (shown.length < 3) return null;

  return (
    <nav
      className="rail"
      data-on={visible}
      aria-label="Page sections"
      // Hidden from the tab order until it is on screen; a link you cannot see
      // should not be the next thing the keyboard lands on.
      inert={!visible}
    >
      <ol>
        {shown.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => go(i)}
              data-on={i === active}
              aria-current={i === active ? "true" : undefined}
            >
              <span className="rail-n">{String(i).padStart(2, "0")}</span>
              <span className="rail-l">{c.label}</span>
              <span className="rail-tick" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
