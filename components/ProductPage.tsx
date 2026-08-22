import Link from "next/link";
import Footer from "@/components/Footer";
import Faq from "@/components/Faq";
import HeroStage from "@/components/HeroStage";
import TiltCard from "@/components/TiltCard";
import ProductVisual from "@/components/ProductVisual";
import RevealObserver from "@/components/RevealObserver";
import { company, type Product } from "@/content/site";
import { ldJson } from "@/lib/security/jsonld";

export default function ProductPage({ product }: { product: Product }) {
  const accent = product.accent === "cyan" ? "#f6f9fd" : "#e8eef6";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    ...(product.url ? { url: product.url } : {}),
    description: product.sub,
    publisher: { "@type": "Organization", name: company.legalName },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
      />
      <RevealObserver />

      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="page-hero">
          <HeroStage
            variant="product"
            accent={accent}
            className="hero-canvas"
          />

          <div className="shell" style={{ position: "relative", zIndex: 2 }}>
            <Link href="/#products" className="back-link reveal">
              ← All products
            </Link>

            <div style={{ marginTop: 26, maxWidth: 760 }}>
              <span className="eyebrow reveal">{product.kicker}</span>

              <h1
                className="display reveal"
                data-delay={80}
                style={{ marginTop: 20, fontSize: "clamp(34px,5.6vw,68px)" }}
              >
                {product.headline}
              </h1>

              <p className="hero-sub reveal" data-delay={160}>
                {product.sub}
              </p>

              <div className="hero-ctas reveal" data-delay={230}>
                {/* Products that live on this domain have nowhere external to
                    send the visitor, so the enquiry becomes the primary action. */}
                {product.url ? (
                  <>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill pill-primary"
                    >
                      Visit {product.domain} ↗
                    </a>
                    <Link href="/contact" className="pill pill-ghost">
                      Talk to us
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/contact" className="pill pill-primary">
                      Request access
                    </Link>
                    <Link href="/work" className="pill pill-ghost">
                      See our work
                    </Link>
                  </>
                )}
              </div>

              <div
                className="reveal"
                data-delay={300}
                style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}
              >
                <span className="status" data-live={product.status === "Live"}>
                  <span className="status-dot" />
                  {product.status}
                </span>
                <span className="status">Built by {company.shortName}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO IT'S FOR ─────────────────────────────────────── */}
        <section className="section" style={{ paddingBlock: "clamp(40px,6vw,80px)" }}>
          <div className="shell">
            <div className="glass reveal" style={{ padding: "clamp(28px,3.4vw,44px)" }}>
              <span className="eyebrow">WHO IT&rsquo;S FOR</span>
              <p
                style={{
                  marginTop: 20,
                  fontSize: "clamp(18px,2.3vw,26px)",
                  lineHeight: 1.45,
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-display), sans-serif",
                  maxWidth: "44ch",
                }}
              >
                {product.audience}
              </p>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">CAPABILITIES</span>
              <h2 className="section-title">What it does.</h2>
            </div>

            <div className="feat-grid feat-grid-3">
              {product.features.map((f, i) => (
                <TiltCard
                  key={f.title}
                  className="glass feat reveal"
                  max={6}
                  data-delay={i * 60}
                >
                  <h3 className="feat-t">{f.title}</h3>
                  <p className="feat-b">{f.body}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">HOW IT WORKS</span>
              <h2 className="section-title">Four moves, end to end.</h2>
            </div>

            <div className="prod" data-flip="false">
              <div className="steps reveal" style={{ borderTop: "none" }}>
                {product.steps.map((s, i) => (
                  <div className="step" key={s.title} style={{ gridTemplateColumns: "60px 1fr" }}>
                    <span className="step-no">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="step-t">{s.title}</h3>
                      <p className="step-b" style={{ marginTop: 8 }}>
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="prod-visual reveal" data-accent={product.accent} data-delay={120}>
                <ProductVisual product={product} />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        {product.pricing && (
          <section className="section" style={{ paddingTop: 0 }} id="pricing">
            <div className="shell">
              <div className="section-head reveal">
                <span className="eyebrow">PRICING</span>
                <h2 className="section-title">{product.pricing.title}</h2>
                <p className="section-sub">{product.pricing.sub}</p>
              </div>

              <div className="tier-grid">
                {product.pricing.tiers.map((tier, i) => (
                  <div
                    key={tier.name}
                    className="glass tier reveal"
                    data-highlight={!!tier.highlight}
                    data-delay={i * 70}
                  >
                    {tier.highlight && <span className="tier-flag">Most popular</span>}

                    <h3 className="tier-name">{tier.name}</h3>

                    <div className="tier-price">
                      {tier.price}
                      {tier.period && <span className="tier-period">{tier.period}</span>}
                    </div>

                    <p className="tier-note">{tier.note}</p>

                    <ul className="tier-list">
                      {tier.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {product.url ? (
                <p className="tier-foot">
                  Prices are {product.name}&rsquo;s published rates and may change —{" "}
                  <a
                    href={`${product.url}/pricing`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    check {product.domain}/pricing
                  </a>{" "}
                  for what&rsquo;s current.
                </p>
              ) : (
                <p className="tier-foot">
                  Every engagement is quoted after a call, in writing, before any
                  work starts. <Link href="/contact">Tell us what you need</Link>{" "}
                  and we&rsquo;ll come back with a number and a timeline.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell" style={{ maxWidth: 900 }}>
            <div className="section-head reveal">
              <span className="eyebrow">QUESTIONS</span>
              <h2 className="section-title">Before you ask.</h2>
            </div>
            <div className="reveal">
              <Faq items={product.faq} />
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div
              className="glass reveal"
              style={{ padding: "clamp(36px,5vw,72px)", textAlign: "center" }}
            >
              <h2 className="section-title" style={{ marginTop: 0 }}>
                Want this for your practice?
              </h2>
              <p
                className="section-sub"
                style={{ marginInline: "auto", textAlign: "center" }}
              >
                Tell us how you work today and we&rsquo;ll show you what changes.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: 32,
                }}
              >
                <Link href="/#contact" className="pill pill-primary">
                  Start a conversation
                </Link>
                <a
                  href={`https://wa.me/${company.phoneE164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill-ghost"
                >
                  WhatsApp us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
