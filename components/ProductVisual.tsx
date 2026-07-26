import type { Product } from "@/content/site";

/**
 * A CSS-3D abstraction of the product UI. Deliberately not a screenshot — we
 * don't have verified product imagery yet, and an honest abstraction beats a
 * fabricated interface. Drop real captures in here when they're available.
 */
export default function ProductVisual({ product }: { product: Product }) {
  const accent = product.accent === "cyan" ? "var(--electric)" : "var(--violet-lt)";

  return (
    <div className="pv">
      <div className="pv-window" style={{ ["--pv-accent" as string]: accent }}>
        <div className="pv-bar">
          <span />
          <span />
          <span />
          <div className="pv-url">{product.domain}</div>
        </div>

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
      </div>

      <div className="pv-chip pv-chip-a" aria-hidden="true" />
      <div className="pv-chip pv-chip-b" aria-hidden="true" />
    </div>
  );
}
