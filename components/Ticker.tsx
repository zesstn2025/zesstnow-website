import { ticker } from "@/content/site";

/**
 * The announcement strip from the reference, repurposed as a corporate-identity
 * ribbon. The list is rendered twice so the CSS marquee can loop seamlessly.
 */
export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((pass) => (
          <div key={pass} style={{ display: "flex" }}>
            {ticker.map((item, i) => (
              <span className="ticker-item" key={`${pass}-${i}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
