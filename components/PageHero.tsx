import Link from "next/link";
import HeroStage from "./HeroStage";

/**
 * Shared hero for the interior pages, so every route opens with the same
 * canvas + scrim treatment as the homepage rather than dropping straight into
 * body copy.
 */
export default function PageHero({
  eyebrow,
  title,
  sub,
  accent = "#a78bfa",
  back,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  accent?: string;
  back?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="page-hero">
      <HeroStage variant="product" accent={accent} className="hero-canvas" />

      <div className="shell" style={{ position: "relative", zIndex: 2 }}>
        {back && (
          <Link href={back.href} className="back-link reveal">
            ← {back.label}
          </Link>
        )}

        <div style={{ marginTop: back ? 26 : 0, maxWidth: 820 }}>
          <span className="eyebrow reveal">{eyebrow}</span>

          <h1
            className="display reveal"
            data-delay={80}
            style={{ marginTop: 20, fontSize: "clamp(34px,5.4vw,66px)" }}
          >
            {title}
          </h1>

          {sub && (
            <p className="hero-sub reveal" data-delay={160}>
              {sub}
            </p>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
