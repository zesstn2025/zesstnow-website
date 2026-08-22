import Image from "next/image";
import type { Product } from "@/content/site";

/**
 * The product, in a browser frame turned in space.
 *
 * When `product.shot` is set it is a real capture of the live interface, taken
 * by scripts/shots.js — the actual product, not a rendering of one. When it is
 * absent the frame falls back to an abstraction of a dashboard: for a product
 * still in development there is no interface to photograph, and inventing a
 * convincing screenshot of software nobody can log into is the one thing a
 * portfolio must never do.
 *
 * The frame is CSS 3D rather than WebGL. It is a rectangle with a perspective
 * on it; a canvas would spend a live GL context to draw the same thing less
 * sharply, and the page already holds three.
 */
export default function ProductVisual({ product }: { product: Product }) {
  return (
    <div className="pv" data-real={Boolean(product.shot)}>
      <div className="pv-window">
        <div className="pv-bar">
          <span />
          <span />
          <span />
          <div className="pv-url">{product.domain}</div>
        </div>

        {product.shot ? (
          <div className="pv-shot">
            <Image
              src={product.shot}
              alt={`${product.name} — the live interface at ${product.domain}`}
              width={2160}
              height={1350}
              sizes="(max-width: 900px) 92vw, 46vw"
              className="pv-shot-img"
            />
          </div>
        ) : (
          <div className="pv-body">
            <div className="pv-side">
              {[0, 1, 2, 3, 4].map((i) => (
                <div className="pv-nav-row" key={i} data-active={i === 1} />
              ))}
            </div>

            <div className="pv-main">
              <div className="pv-stats">
                {[0, 1, 2].map((i) => (
                  <div className="pv-stat" key={i}>
                    <div className="pv-stat-bar" style={{ animationDelay: `${i * 0.4}s` }} />
                  </div>
                ))}
              </div>

              <div className="pv-rows">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div className="pv-row" key={i} style={{ animationDelay: `${i * 0.18}s` }}>
                    <span style={{ width: `${52 - i * 6}%` }} />
                    <span style={{ width: `${18 + (i % 3) * 8}%`, opacity: 0.45 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pv-chip pv-chip-a" aria-hidden="true" />
      <div className="pv-chip pv-chip-b" aria-hidden="true" />
    </div>
  );
}
