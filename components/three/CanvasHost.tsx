"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps a `<Canvas>` and gives its WebGL context back when it unmounts.
 *
 * Dropping a canvas from the DOM does not release its context. The browser
 * holds it until garbage collection gets round to it, which on a single-page
 * app is effectively never — and a browser keeps only a handful of live
 * contexts, silently discarding the oldest once the cap is passed. Measured
 * before this existed: nine client-side navigations created twelve contexts and
 * released none. A few clicks further and the browser starts dropping the ones
 * still in use, so every canvas on the page goes black with no error logged
 * anywhere. It is completely silent, and it only bites after someone has been
 * browsing for a minute — exactly when nobody is watching a console.
 *
 * The release is done from the DOM rather than from a component inside the
 * canvas. The obvious version — a child of `<Canvas>` calling
 * `gl.forceContextLoss()` from an effect cleanup — never ran at all: R3F tears
 * its root down through its own reconciler, and the cleanup simply did not
 * fire. Instrumenting it produced no output on unmount, which is what sent this
 * out here. A plain effect on a plain div is guaranteed to run, and reaching
 * the canvas through the DOM does not depend on any of R3F's internals.
 *
 * `WEBGL_lose_context` is the only way to hand a context back on demand instead
 * of waiting for the collector.
 */
export default function CanvasHost({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    return () => {
      // Every canvas under this host — normally one, but the query costs
      // nothing and a future scene may add a second.
      node.querySelectorAll("canvas").forEach((canvas) => {
        try {
          const gl =
            canvas.getContext("webgl2") ??
            (canvas.getContext("webgl") as WebGLRenderingContext | null);
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
          // A context already lost throws on a second release. The goal was for
          // it to be gone, and it is.
        }
      });
    };
  }, []);

  return (
    <div ref={host} className={className} {...rest}>
      {children}
    </div>
  );
}
