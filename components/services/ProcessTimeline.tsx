"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import Studio from "../three/Studio";
import { useSectionProgress } from "@/lib/scroll";
import { useAllow3D } from "@/lib/motion";

/**
 * The process, walked stage by stage, with the object assembling alongside it.
 *
 * The object is sticky and the stages scroll past it, so one continuous scroll
 * both advances the reading and advances the scene — the orb is at planning
 * while you are reading planning, and has unfolded into execution by the time
 * you get there. Three separate canvases side by side would have said the same
 * thing while costing three contexts and losing the connection between them.
 *
 * The stage highlight comes from the same damped progress value the scene reads,
 * sampled on a frame loop rather than from a scroll listener, so the text and
 * the geometry can never disagree about which stage it is. State is set only
 * when the index actually changes — twice over the whole section, not once a
 * frame.
 *
 * Every word is DOM text outside the canvas. With no WebGL at all this is a
 * numbered list of stages, which is exactly what it is meant to communicate.
 */
export default function ProcessTimeline({
  eyebrow,
  title,
  sub,
  stages,
  scene,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  stages: { no: string; title: string; body: string; output: string }[];
  scene: (progress: React.RefObject<number>) => ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const progress = useSectionProgress(section);
  const allow3D = useAllow3D();
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      // The last stage should own the end of the section rather than a sliver
      // of it, so the range is divided evenly and clamped rather than floored
      // off the top.
      const i = Math.min(
        stages.length - 1,
        Math.max(0, Math.floor(progress.current * stages.length))
      );
      setActive((prev) => (prev === i ? prev : i));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, stages.length]);

  return (
    <section className="section timeline-section" ref={section}>
      <div className="shell">
        <div className="section-head reveal">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-sub">{sub}</p>
        </div>

        <div className="timeline-grid">
          <div className="timeline-stage">
            <div className="timeline-sticky">
              {allow3D ? (
                <View className="timeline-view">
                  <PerspectiveCamera makeDefault position={[0, 0, 6.4]} fov={38} />
                  <Studio />
                  {scene(progress)}
                </View>
              ) : (
                <div className="timeline-view pillar-view-static" aria-hidden="true" />
              )}
              <span className="timeline-now mono-label" aria-hidden="true">
                {stages[active].no} · {stages[active].title}
              </span>
            </div>
          </div>

          <ol className="timeline-list">
            {stages.map((stage, i) => (
              <li
                key={stage.no}
                className="timeline-item"
                data-active={i === active ? "true" : "false"}
                aria-current={i === active ? "step" : undefined}
              >
                <span className="timeline-no">{stage.no}</span>
                <div className="timeline-body">
                  <h3 className="timeline-t">{stage.title}</h3>
                  <p className="svc-b">{stage.body}</p>
                  <p className="timeline-out">
                    <span className="mono-label">Output</span>
                    {stage.output}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
