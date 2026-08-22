"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The navy wipe between pages.
 *
 * A route change in the App Router is fast enough that the new page is already
 * rendered by the time anything here can react to it — `usePathname` only
 * changes after the fact. So this does not try to cover the departure it cannot
 * see. It covers the arrival: the veil is opaque on the first frame of the new
 * page and sweeps off it, which is the same thing to look at and is honest
 * about when it actually happens. A veil that tried to delay the navigation to
 * animate first would be adding latency to a fast site in order to look busy.
 *
 * It is DOM rather than WebGL, and deliberately. The shared canvas sits at
 * `z-index: -1` behind every section — that is what lets each `<View>` draw
 * behind the copy — so nothing rendered into it can cover the page. A veil
 * drawn in its own canvas would mean another WebGL context created and thrown
 * away on every navigation, which is the exact failure this site has already
 * had once. The sweep is built from the same two ingredients as the metal:
 * deep navy, and one specular edge travelling across it.
 *
 * The first paint is skipped — the preloader owns the entrance, and two
 * curtains on top of each other is one too many.
 */
export default function PageTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const [wipe, setWipe] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // A new key restarts the CSS animation. Toggling a class would not: an
    // animation already running does not replay because the class came back.
    setWipe((n) => n + 1);
  }, [pathname]);

  if (wipe === 0) return null;

  return (
    <div key={wipe} className="wipe" aria-hidden="true">
      <span className="wipe-edge" />
    </div>
  );
}
