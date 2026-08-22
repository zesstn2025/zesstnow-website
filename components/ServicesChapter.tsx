"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import { services } from "@/content/site";
import { useAllow3D } from "@/lib/motion";

const Morph = dynamic(() => import("./three/Morph"), { ssr: false, loading: () => null });

/**
 * "What are you looking for?" — the disciplines as an answer, not a grid.
 *
 * Six cards that differ only in their text are six cards a visitor skims. Here
 * the list is the control and the form beside it is the readout: point at a
 * discipline and the shape becomes that discipline. Nothing is hidden behind
 * the interaction — every card's full copy is on the page and readable with no
 * pointer, no JavaScript and no WebGL — but a visitor who does move the pointer
 * gets told the company builds things by watching a thing get built.
 */
export default function ServicesChapter() {
  const [index, setIndex] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const allow3D = useAllow3D();

  return (
    <section className="section" id="services">
      <div className="shell">
        <div className="section-head reveal">
          <span className="eyebrow">{services.eyebrow}</span>
          <h2 className="section-title">{services.title}</h2>
          <p className="section-sub">{services.sub}</p>
        </div>

        <div className="svc-chapter">
          <div className="svc-list">
            {services.items.map((item, i) => (
              <article
                key={item.no}
                className="svc-row"
                data-on={i === index}
                // Pointer and keyboard both drive it. The row is not a button:
                // there is nothing to activate, so making it one would promise a
                // destination that does not exist.
                onMouseEnter={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                tabIndex={0}
              >
                <span className="svc-no">{item.no}</span>
                <div className="svc-row-body">
                  <h3 className="svc-t">{item.title}</h3>
                  <p className="svc-b">{item.body}</p>
                  <div className="svc-pts">
                    {item.points.map((p) => (
                      <span className="chip" key={p}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sticky, so the form stays with you while the list scrolls past. */}
          <div className="svc-form" ref={host} aria-hidden="true">
            <div className="svc-form-inner">
              {allow3D && (
                // Drawn into the site's one shared canvas. The form is unlit —
                // its shading is computed in its own fragment shader — so this
                // view needs a camera and nothing else.
                <View className="svc-view">
                  <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={45} />
                  <Morph index={index} />
                </View>
              )}
              <span className="svc-form-label mono-label">
                {services.items[index]?.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
