import Link from "next/link";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import HeroStage from "@/components/HeroStage";
import TiltCard from "@/components/TiltCard";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import ProductVisual from "@/components/ProductVisual";
import {
  hero,
  services,
  products,
  productsSection,
  process,
  work,
} from "@/content/site";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <RevealObserver />
      <Nav />

      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="hero" id="top">
          <HeroStage />

          <div className="hero-inner">
            <div className="shell">
              <div className="hero-copy">
                <span className="eyebrow reveal">{hero.eyebrow}</span>

                <h1 className="display reveal" data-delay={90} style={{ marginTop: 22 }}>
                  {hero.titleLead}{" "}
                  <span className="grad-text">{hero.titleEm}</span>
                </h1>

                <p className="hero-sub reveal" data-delay={180}>
                  {hero.sub}
                </p>

                <div className="hero-ctas reveal" data-delay={260}>
                  <Link href={hero.primaryCta.href} className="pill pill-primary">
                    {hero.primaryCta.label}
                  </Link>
                  <Link href={hero.secondaryCta.href} className="pill pill-ghost">
                    {hero.secondaryCta.label}
                  </Link>
                </div>

                <div className="hero-stats reveal" data-delay={340}>
                  {hero.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="hero-stat-v">{stat.value}</div>
                      <div className="hero-stat-l">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-cue" aria-hidden="true">
            <div className="scroll-cue-line" />
            <span className="mono-label">Scroll</span>
          </div>
        </section>

        <Ticker />

        {/* ── SERVICES ─────────────────────────────────────────── */}
        <section className="section" id="services">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{services.eyebrow}</span>
              <h2 className="section-title">{services.title}</h2>
              <p className="section-sub">{services.sub}</p>
            </div>

            <div className="grid-services">
              {services.items.map((item, i) => (
                <TiltCard
                  key={item.no}
                  className="glass svc reveal"
                  data-delay={i * 80}
                >
                  <span className="svc-no">{item.no}</span>
                  <h3 className="svc-t">{item.title}</h3>
                  <p className="svc-b">{item.body}</p>
                  <div className="svc-pts">
                    {item.points.map((p) => (
                      <span className="chip" key={p}>
                        {p}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ─────────────────────────────────────────── */}
        <section className="section" id="products">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{productsSection.eyebrow}</span>
              <h2 className="section-title">{productsSection.title}</h2>
              <p className="section-sub">{productsSection.sub}</p>
            </div>

            {products.map((product, i) => (
              <article
                className="prod"
                data-flip={i % 2 === 1}
                key={product.slug}
              >
                <div className="reveal">
                  <span className="status" data-live={product.status === "Live"}>
                    <span className="status-dot" />
                    {product.status}
                  </span>

                  <h3 className="prod-name">{product.name}</h3>

                  <p
                    className="mono-label"
                    style={{ marginTop: 10, color: "var(--electric)" }}
                  >
                    {product.domain}
                  </p>

                  <p className="prod-sub">{product.sub}</p>

                  <div className="svc-pts" style={{ marginTop: 26 }}>
                    {product.features.slice(0, 4).map((f) => (
                      <span className="chip" key={f.title}>
                        {f.title}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
                    <Link
                      href={`/products/${product.slug}`}
                      className="pill pill-primary"
                    >
                      Explore {product.name}
                    </Link>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill pill-ghost"
                    >
                      Visit site ↗
                    </a>
                  </div>
                </div>

                <div className="prod-visual reveal" data-accent={product.accent} data-delay={120}>
                  <ProductVisual product={product} />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── PROCESS ──────────────────────────────────────────── */}
        <section className="section" id="process">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{process.eyebrow}</span>
              <h2 className="section-title">{process.title}</h2>
              <p className="section-sub">{process.sub}</p>
            </div>

            <div className="steps">
              {process.steps.map((step, i) => (
                <div className="step reveal" key={step.no} data-delay={i * 70}>
                  <span className="step-no">{step.no}</span>
                  <h3 className="step-t">{step.title}</h3>
                  <p className="step-b">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORK ─────────────────────────────────────────────── */}
        <section className="section" id="work">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{work.eyebrow}</span>
              <h2 className="section-title">{work.title}</h2>
              <p className="section-sub">{work.sub}</p>
            </div>

            {work.items.map((item) => (
              <a
                key={item.domain}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass work-card reveal"
                style={{ display: "grid" }}
              >
                <div>
                  <span className="mono-label">{item.year}</span>
                  <h3 className="svc-t" style={{ marginTop: 12 }}>
                    {item.client}
                  </h3>
                  <p className="work-domain" style={{ marginTop: 10 }}>
                    {item.domain} ↗
                  </p>
                </div>
                <div>
                  <p className="svc-b" style={{ marginTop: 0 }}>
                    {item.body}
                  </p>
                  <div className="svc-pts">
                    {item.tags.map((t) => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
