"use client";

import { useRef, type ReactNode } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import Studio from "../three/Studio";
import { useSectionProgress } from "@/lib/scroll";
import { useAllow3D } from "@/lib/motion";

/**
 * One service, told twice: in words on one side, and as a moving object on the
 * other.
 *
 * The 3D half is a `<View>` — a div in this markup whose contents are drawn by
 * the page's single shared canvas, into the rectangle this div occupies. So
 * each pillar composes like an ordinary two-column section while costing no
 * extra WebGL context.
 *
 * The words are never inside the canvas. Everything a visitor needs to
 * understand the service is real DOM text: it is indexed, selectable, readable
 * by a screen reader, and complete on a device that gets no 3D at all.
 */
export default function ServicePillar({
  no,
  eyebrow,
  title,
  lead,
  body,
  points,
  stages,
  stats,
  flip = false,
  scene,
  id,
}: {
  no: string;
  eyebrow: string;
  title: string;
  lead: string;
  body: string;
  points: string[];
  /** Named steps, shown beside the object and lit as the scroll reaches them. */
  stages?: string[];
  /** Two or three figures under the copy. Every one has to be verifiable. */
  stats?: { value: string; label: string }[];
  flip?: boolean;
  /** Rendered inside the shared canvas, given this section's scroll progress. */
  scene: (progress: React.RefObject<number>) => ReactNode;
  id: string;
}) {
  const section = useRef<HTMLElement>(null);
  const progress = useSectionProgress(section);
  const allow3D = useAllow3D();

  return (
    <section className="section pillar" id={id} ref={section} data-flip={flip}>
      <div className="shell pillar-grid">
        <div className="pillar-copy">
          <span className="eyebrow reveal">
            {no} — {eyebrow}
          </span>
          <h2 className="section-title reveal" data-delay={80}>
            {title}
          </h2>
          <p className="pillar-lead reveal" data-delay={140}>
            {lead}
          </p>
          <p className="svc-b reveal" data-delay={200}>
            {body}
          </p>

          {stages && (
            <ol className="pillar-stages reveal" data-delay={240}>
              {stages.map((stage, i) => (
                <li key={stage} style={{ "--i": i } as React.CSSProperties}>
                  <span className="pillar-stage-n">{String(i + 1).padStart(2, "0")}</span>
                  {stage}
                </li>
              ))}
            </ol>
          )}

          {stats && (
            <dl className="pillar-stats reveal" data-delay={260}>
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="svc-pts reveal" data-delay={280}>
            {points.map((p) => (
              <span className="chip" key={p}>
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="pillar-stage">
          {allow3D ? (
            <View className="pillar-view">
              <PerspectiveCamera makeDefault position={[0, 0, 6.4]} fov={38} />
              <Studio />
              {scene(progress)}
            </View>
          ) : (
            // No canvas on this device. Rather than a hole in the layout, the
            // slot becomes a plain frame — the section still reads as designed.
            <div className="pillar-view pillar-view-static" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
