"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import Faq from "../Faq";
import Studio from "../three/Studio";
import ProcessTimeline from "./ProcessTimeline";
import SecurityBadge from "./SecurityBadge";
import { useSectionProgress } from "@/lib/scroll";
import { useAllow3D } from "@/lib/motion";
import type { ServicePage } from "@/content/site";
import { servicePages } from "@/content/site";

/**
 * One service page: the argument in words, and the object that performs it.
 *
 * Five pages share this because they are the same page with different content —
 * five copies would drift apart within a month, and the first thing to drift
 * would be whichever one nobody looked at again. The two blocks that only some
 * pages have — the stage-by-stage process, and the deep dives with their tools
 * — are optional fields on the content rather than separate components, for the
 * same reason.
 *
 * The scenes are loaded on demand and drawn into the page's single shared
 * canvas, like every other 3D on the site. Nothing in the copy depends on them:
 * turn the canvas off and the page is still complete, still indexed, still
 * readable end to end.
 */
const SCENES = {
  agent: dynamic(() => import("../three/scenes/AgentOrb"), { ssr: false }),
  vault: dynamic(() => import("../three/scenes/SecureVault"), { ssr: false }),
  saas: dynamic(() => import("../three/scenes/DashboardAssembly"), { ssr: false }),
  storefront: dynamic(() => import("../three/scenes/StorefrontStack"), { ssr: false }),
  funnel: dynamic(() => import("../three/scenes/DataFunnel"), { ssr: false }),
} as const;

/**
 * The tools a deep-dive section can carry, split out so a page that has no
 * calculator never downloads one. Neither is load-bearing — the section makes
 * its argument in text, and the tool is there for the visitor who wants to put
 * their own numbers into it.
 */
const CALCULATORS = {
  emi: dynamic(() => import("./EmiCalculator"), { ssr: false }),
  cover: dynamic(() => import("./CoverEstimator"), { ssr: false }),
} as const;

export default function ServiceDetail({ page }: { page: ServicePage }) {
  const stage = useRef<HTMLElement>(null);
  const progress = useSectionProgress(stage);
  const allow3D = useAllow3D();
  const Scene = SCENES[page.scene];

  // The rest, for the foot of the page. A visitor who has read this far and it
  // was not the right service should be one click from the right one.
  const others = servicePages.filter((p) => p.slug !== page.slug);

  return (
    <>
      <section className="section pillar service-hero" ref={stage}>
        <div className="shell pillar-grid">
          <div className="pillar-copy">
            <span className="eyebrow reveal">{page.eyebrow}</span>
            <h1 className="section-title reveal" data-delay={80}>
              {page.title} <span className="grad-text">{page.titleEm}</span>
            </h1>
            <p className="pillar-lead reveal" data-delay={140}>
              {page.lead}
            </p>

            {page.intro.map((paragraph, i) => (
              <p className="svc-b reveal" key={i} data-delay={190 + i * 50}>
                {paragraph}
              </p>
            ))}

            <dl className="pillar-stats reveal" data-delay={300}>
              {page.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>

            <div className="hero-ctas reveal" data-delay={340} style={{ marginTop: 26 }}>
              <Link href="/contact" className="pill pill-primary">
                Start a project
              </Link>
              <Link href="/work" className="pill pill-ghost">
                See our work
              </Link>
            </div>

            {/* Only on the page where it is load-bearing. A security panel on
                the e-commerce page would be filler; on the page about handling
                somebody's loan file it is part of the argument, and it belongs
                in the reading order rather than laid over the object — floated
                across the stage it buried the vault it is meant to describe. */}
            {page.scene === "vault" && (
              <div className="reveal" data-delay={380}>
                <SecurityBadge />
              </div>
            )}
          </div>

          <div className="pillar-stage">
            {allow3D ? (
              <View className="pillar-view">
                <PerspectiveCamera makeDefault position={[0, 0, 6.4]} fov={38} />
                <Studio />
                <Scene progress={progress} />
              </View>
            ) : (
              <div className="pillar-view pillar-view-static" aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="shell">
          <div className="section-head reveal">
            <span className="eyebrow">WHAT YOU GET</span>
            <h2 className="section-title">Everything below is delivered.</h2>
            <p className="section-sub">
              Not a menu of things we could look into. Each one is scoped,
              priced and handed over.
            </p>
          </div>

          <div className="grid-services">
            {page.capabilities.map((cap, i) => (
              <div className="glass svc reveal" key={cap.no} data-delay={i * 70}>
                <span className="svc-no">{cap.no}</span>
                <h3 className="svc-t">{cap.title}</h3>
                <p className="svc-b">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {page.timeline && (
        <ProcessTimeline
          eyebrow="HOW AN AGENT WORKS"
          title="Three stages, in order."
          sub="Scroll and the object builds itself alongside the reading — planning first, then what it knows, then what it is allowed to do."
          stages={page.timeline}
          scene={(p) => <Scene progress={p} />}
        />
      )}

      {page.deepDives?.map((dive, i) => {
        const Tool = dive.calculator ? CALCULATORS[dive.calculator] : null;
        return (
          <section
            className="section deep-dive"
            id={dive.id}
            key={dive.id}
            data-alt={i % 2 === 1 ? "true" : "false"}
          >
            <div className="shell deep-grid">
              <div className="deep-copy">
                <span className="eyebrow reveal">{dive.eyebrow}</span>
                <h2 className="section-title reveal" data-delay={80}>
                  {dive.title}
                </h2>
                <p className="svc-b reveal" data-delay={140}>
                  {dive.body}
                </p>
                <ul className="deep-points reveal" data-delay={200}>
                  {dive.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* The tool sits beside the argument rather than replacing it —
                  the section has to make sense to somebody who never touches
                  a slider, and on a phone the copy is read first. */}
              {Tool && (
                <div className="deep-tool reveal" data-delay={120}>
                  <Tool />
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section className="section">
        <div className="shell">
          <div className="section-head reveal">
            <span className="eyebrow">HOW IT RUNS</span>
            <h2 className="section-title">Four steps, no mystery.</h2>
          </div>

          <div className="steps">
            {page.steps.map((step) => (
              <div className="step" key={step.no} data-s3d="up">
                <span className="step-no">{step.no}</span>
                <h3 className="step-t">{step.title}</h3>
                <p className="step-b">{step.body}</p>
              </div>
            ))}
          </div>

          {page.note && <p className="reveal note-line">{page.note}</p>}
        </div>
      </section>

      <section className="section section-alt">
        <div className="shell shell-narrow">
          <div className="section-head reveal">
            <span className="eyebrow">QUESTIONS</span>
            <h2 className="section-title">Before you write to us.</h2>
          </div>

          {/* The site's own accordion, not a fresh one — it already handles
              aria-expanded, the open/closed transition and the styling. */}
          <div className="reveal">
            <Faq items={page.faq} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head reveal">
            <span className="eyebrow">ALSO FROM US</span>
            <h2 className="section-title">Not what you came for?</h2>
          </div>

          <div className="grid-services">
            {others.map((other, i) => (
              <Link
                href={`/services/${other.slug}`}
                className="glass svc reveal service-next"
                key={other.slug}
                data-delay={i * 80}
              >
                <span className="svc-no">{other.eyebrow}</span>
                <h3 className="svc-t">
                  {other.title} {other.titleEm}
                </h3>
                <p className="svc-b">{other.lead}</p>
                <span className="mono-label service-next-go">Read on →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
