"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import { showcase } from "@/content/site";
import Studio from "./three/Studio";
import { useSectionProgress } from "@/lib/scroll";
import { useAllow3D } from "@/lib/motion";

const ProductModel = dynamic(() => import("./three/scenes/ProductModel"), { ssr: false });

/**
 * The product, taken apart.
 *
 * Three things can open the stack, and all three write to the same ref: the
 * section's own scroll, hovering a layer in the list, and the explode button.
 * Keeping them on one value means they can never disagree — an earlier version
 * with separate state for hover and scroll would snap between them whenever
 * both were active.
 *
 * The value is a ref rather than state on purpose. It changes on every frame of
 * a scroll, and putting that through React would re-render this subtree sixty
 * times a second to move a number the GPU could have read directly.
 */
export default function ProductShowcase() {
  const section = useRef<HTMLElement>(null);
  const progress = useSectionProgress(section);
  const allow3D = useAllow3D();

  // What the model actually uses. Combined every frame from the sources below.
  const exploded = useRef(0);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  // Written on render rather than in an effect: this runs whenever any input
  // changes, and the model reads it on its next frame either way.
  exploded.current = pinned ? 1 : Math.max(hovered !== null ? 0.72 : 0, progress.current);

  return (
    <section className="section showcase" id="showcase" ref={section}>
      <div className="shell">
        <div className="section-head reveal">
          <span className="eyebrow">{showcase.eyebrow}</span>
          <h2 className="section-title">{showcase.title}</h2>
          <p className="section-sub">{showcase.sub}</p>
        </div>

        <div className="showcase-grid">
          <div className="showcase-stage">
            {allow3D ? (
              <>
                <View className="showcase-view">
                  <PerspectiveCamera makeDefault position={[0, 4.6, 7]} fov={40} />
                  <Studio />
                  <ProductModel exploded={exploded} />
                </View>
                <span className="showcase-hint mono-label">{showcase.hint}</span>
              </>
            ) : (
              <div className="showcase-view showcase-view-static" aria-hidden="true" />
            )}
          </div>

          <div className="showcase-legend">
            <ol>
              {showcase.layers.map((layer, i) => (
                <li
                  key={layer.label}
                  data-on={hovered === i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                >
                  <span className="showcase-n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{layer.label}</h3>
                    <p>{layer.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {allow3D && (
              <button
                type="button"
                className="pill pill-ghost showcase-btn"
                aria-pressed={pinned}
                onClick={() => setPinned((v) => !v)}
              >
                {pinned ? "Close the stack" : "Exploded view"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
