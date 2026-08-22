"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import Studio from "../three/Studio";
import { useAllow3D } from "@/lib/motion";
import { servicePages } from "@/content/site";

/**
 * The way into the service pages: a list you read, and one object that becomes
 * whatever you are pointing at.
 *
 * Five separate previews would mean five scenes on the home page, and the home
 * page already carries four. So there is one `<View>` here, and moving between
 * entries swaps what is rendered inside it — the object dismantles and
 * reassembles itself as the selection changes, which is the whole point: it
 * looks like a machine responding to you rather than five thumbnails.
 *
 * The scenes are the same ones the service pages use, driven by the same
 * progress ref. On a page that ref is filled by scrolling; here it is filled by
 * choosing, easing from nearly nothing back up to assembled so the change is
 * something you watch rather than something that has already happened.
 *
 * The links are ordinary anchors around ordinary text. With no WebGL, or before
 * the canvas mounts, this is a list of five services with a sentence each —
 * which is what a menu is supposed to be.
 */
const SCENES = {
  agent: dynamic(() => import("../three/scenes/AgentOrb"), { ssr: false }),
  vault: dynamic(() => import("../three/scenes/SecureVault"), { ssr: false }),
  saas: dynamic(() => import("../three/scenes/DashboardAssembly"), { ssr: false }),
  storefront: dynamic(() => import("../three/scenes/StorefrontStack"), { ssr: false }),
  funnel: dynamic(() => import("../three/scenes/DataFunnel"), { ssr: false }),
} as const;

/** Where the object restarts from on a switch. Not zero — a scene that begins
 *  completely scattered reads as broken rather than as assembling. */
const RESET = 0.12;

export default function ServicePortal() {
  const [active, setActive] = useState(0);
  const allow3D = useAllow3D();
  const progress = useRef(RESET);
  const page = servicePages[active];
  const Scene = SCENES[page.scene];

  // Reassembles on every change of selection. Frame-rate independent, so it
  // takes the same time on a 60Hz laptop and a 120Hz phone.
  useEffect(() => {
    progress.current = RESET;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      progress.current += (1 - progress.current) * (1 - Math.exp(-1.5 * dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <section className="section portal" id="portal">
      <div className="shell">
        <div className="section-head reveal">
          <span className="eyebrow">EVERY SERVICE, ITS OWN PAGE</span>
          <h2 className="section-title">Pick the one you came for.</h2>
          <p className="section-sub">
            Each of these is a full page — what is delivered, how it runs, what
            it costs you in time, and the questions people ask before they write
            to us.
          </p>
        </div>

        <div className="portal-grid">
          <ul className="portal-list">
            {servicePages.map((entry, i) => (
              <li key={entry.slug}>
                <Link
                  href={`/services/${entry.slug}`}
                  className="portal-row"
                  data-active={i === active ? "true" : "false"}
                  // Pointer and keyboard both select, so the object follows a
                  // tab through the list exactly as it follows the mouse.
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="portal-no mono-label">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="portal-body">
                    <span className="portal-t">{entry.navLabel}</span>
                    <span className="portal-lead">{entry.lead}</span>
                  </span>
                  <span className="portal-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="portal-stage" aria-hidden="true">
            {allow3D ? (
              <View className="portal-view">
                <PerspectiveCamera makeDefault position={[0, 0, 6.6]} fov={38} />
                <Studio />
                {/* Keyed on the slug so switching genuinely remounts the scene
                    and it starts from its own beginning rather than inheriting
                    the previous object's state. */}
                <Scene key={page.slug} progress={progress} />
              </View>
            ) : (
              <div className="portal-view pillar-view-static" />
            )}
            <span className="portal-caption mono-label">{page.eyebrow}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
