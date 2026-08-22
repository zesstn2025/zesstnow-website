"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import gsap from "gsap";
import { Vector3, type PerspectiveCamera as PerspectiveCameraImpl } from "three";
import Studio from "../three/Studio";
import { useAllow3D } from "@/lib/motion";
import { servicePages } from "@/content/site";
import type { PortalKind } from "../three/scenes/PortalSpheres";
import { PORTAL_SLOTS } from "../three/scenes/PortalSpheres";

const PortalSpheres = dynamic(() => import("../three/scenes/PortalSpheres"), {
  ssr: false,
});

/**
 * The hub: four spheres you fly into.
 *
 * Clicking one does not cut to the page. The camera is driven into the sphere
 * first, the frame goes to navy at the end of the travel, and only then does the
 * route change — so the arrival wipe on the other side is the same movement
 * continuing rather than a second, unrelated animation. Roughly three quarters
 * of a second, which is about as long as a transition can be before it starts
 * costing the visitor something.
 *
 * Underneath the canvas is a list of ordinary links, and it is not a fallback.
 * It is how this section is navigated with a keyboard, how it is read by a
 * screen reader, and how a crawler finds five service pages. The spheres are
 * the pleasure; the list is the navigation, and both go to the same places.
 *
 * E-commerce is in the list but has no sphere. Four is the composition — a
 * fifth breaks the two-by-two and the constellation stops reading as
 * deliberate — and a link that is present and honest beats a fifth orb wedged
 * into a grid built for four.
 */

/** Which mechanism belongs in which sphere. Order is the order on screen. */
const SPHERES: { slug: string; kind: PortalKind }[] = [
  { slug: "ai-agents", kind: "core" },
  { slug: "fintech", kind: "cube" },
  { slug: "saas-development", kind: "lattice" },
  { slug: "digital-marketing", kind: "ring" },
];

/** Where the camera rests, and how close it gets before the route changes. */
const HOME = new Vector3(0, 0, 6.6);

export default function Portal() {
  const router = useRouter();
  const allow3D = useAllow3D();
  const [hovered, setHovered] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);
  const camera = useRef<PerspectiveCameraImpl>(null);
  const label = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  const entries = SPHERES.map((s) => ({
    ...s,
    page: servicePages.find((p) => p.slug === s.slug)!,
  }));
  const rest = servicePages.filter((p) => !SPHERES.some((s) => s.slug === p.slug));

  /**
   * Moves the label to the hovered sphere. Called from inside the frame loop,
   * so it writes to the DOM node directly — putting a projected position into
   * React state would re-render this section sixty times a second.
   */
  const place = useCallback((x: number, visible: boolean) => {
    const el = label.current;
    if (!el) return;
    el.style.opacity = visible ? "1" : "0";
    if (!visible) return;
    // Kept inside the stage. A sphere near the edge would otherwise push half
    // the label past it, and on a narrow viewport most of it.
    const half = el.offsetWidth / 2;
    const limit = el.parentElement?.clientWidth ?? 0;
    const clamped = Math.min(Math.max(x, half + 8), Math.max(limit - half - 8, half + 8));
    el.style.transform = `translate(-50%, 0) translateX(${clamped}px)`;
  }, []);

  const onOver = useCallback((i: number) => {
    setHovered(i);
    // The page is one click away now, so fetch it now rather than after the
    // camera has finished travelling.
    router.prefetch(`/services/${SPHERES[i].slug}`);
  }, [router]);

  // Ignore an `out` for a sphere that is no longer the hovered one: moving
  // between two spheres can deliver the old sphere's `out` after the new one's
  // `over`, and acting on it blinks the label.
  const onOut = useCallback((i: number) => {
    setHovered((cur) => (cur === i ? null : cur));
  }, []);

  const onSelect = useCallback(
    (i: number) => {
      const href = `/services/${SPHERES[i].slug}`;
      const cam = camera.current;
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!cam || reduced || flying) {
        router.push(href);
        return;
      }

      setFlying(true);
      setHovered(null);

      const [x, y, z] = PORTAL_SLOTS[i];
      // The constellation is scaled to fit the viewport, so the sphere's world
      // position is not its slot. Reading the scale off the camera's parent
      // would couple this to the scene's internals; flying to a point on the
      // line between the camera and the slot, stopping short of it, lands
      // inside the sphere at any scale.
      const tl = gsap.timeline({
        onComplete: () => router.push(href),
      });

      tl.to(cam.position, {
        x: x * 0.62,
        y: y * 0.62,
        z: z * 0.5 + 1.15,
        duration: 0.72,
        ease: "power2.in",
        onUpdate: () => cam.lookAt(x * 0.7, y * 0.7, z),
      });

      // Navy takes the frame over the last third of the travel, so the route
      // change happens behind a covered screen and the wipe on the far side
      // reads as one continuous movement.
      if (veil.current) {
        tl.to(veil.current, { opacity: 1, duration: 0.34, ease: "power2.in" }, ">-0.34");
      }
    },
    [router, flying]
  );

  // Leaving mid-flight would otherwise leave a tween writing to a camera that
  // has been torn down, and the veil stuck at full opacity if we ever come back.
  useEffect(
    () => () => {
      gsap.killTweensOf(camera.current?.position ?? {});
      if (veil.current) gsap.killTweensOf(veil.current);
    },
    []
  );

  return (
    <section className="section portal" id="portal">
      <div className="shell">
        <div className="section-head reveal">
          <span className="eyebrow">EVERY SERVICE, ITS OWN PAGE</span>
          <h2 className="section-title">Pick the one you came for.</h2>
          <p className="section-sub">
            Four ways in. Each is a full page — what is delivered, how it runs,
            what it costs you in time, and the questions people ask before they
            write to us.
          </p>
        </div>

        <div className="portal-stage reveal" data-delay={120}>
          {allow3D ? (
            <>
              <View className="portal-view">
                <PerspectiveCamera
                  ref={camera}
                  makeDefault
                  position={[HOME.x, HOME.y, HOME.z]}
                  fov={40}
                />
                <Studio />
                <PortalSpheres
                  kinds={entries.map((e) => e.kind)}
                  hovered={hovered}
                  onOver={onOver}
                  onOut={onOut}
                  onSelect={onSelect}
                  place={place}
                />
              </View>

              {/* Follows the hovered sphere. `aria-hidden` because the same
                  words are already in the list below as real links — announcing
                  them twice would make the section harder to use, not easier. */}
              <div className="portal-label" ref={label} aria-hidden="true">
                <span className="portal-label-t">
                  {hovered === null ? "" : entries[hovered].page.navLabel}
                </span>
                <span className="portal-label-b">
                  {hovered === null ? "" : entries[hovered].page.lead}
                </span>
                <span className="portal-label-go mono-label">Enter →</span>
              </div>

              <div className="portal-veil" ref={veil} aria-hidden="true" />
            </>
          ) : (
            <div className="portal-view pillar-view-static" aria-hidden="true" />
          )}
        </div>

        {/* The navigation itself. */}
        <ul className="portal-links">
          {entries.map((entry, i) => (
            <li key={entry.slug}>
              <Link
                href={`/services/${entry.slug}`}
                className="portal-link"
                data-active={hovered === i ? "true" : "false"}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onMouseLeave={() => onOut(i)}
                onBlur={() => onOut(i)}
              >
                <span className="portal-link-n mono-label">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="portal-link-t">{entry.page.navLabel}</span>
                <span className="portal-link-b">{entry.page.lead}</span>
              </Link>
            </li>
          ))}
        </ul>

        {rest.length > 0 && (
          <p className="portal-rest">
            Also from the same studio:{" "}
            {rest.map((page, i) => (
              <span key={page.slug}>
                {i > 0 && ", "}
                <Link href={`/services/${page.slug}`}>{page.navLabel}</Link>
              </span>
            ))}
            .
          </p>
        )}
      </div>
    </section>
  );
}
