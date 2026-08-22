import Link from "next/link";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import HeroStage from "@/components/HeroStage";
import TiltCard from "@/components/TiltCard";
import WorkCard from "@/components/WorkCard";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import ProductVisual from "@/components/ProductVisual";
import Leadership from "@/components/Leadership";
import ChapterRail from "@/components/ChapterRail";
import ServicesChapter from "@/components/ServicesChapter";
import Motif from "@/components/Motif";
import Pillars from "@/components/services/Pillars";
import ProductShowcase from "@/components/ProductShowcase";
import Faq from "@/components/Faq";
import {
  hero,
  verticals,
  products,
  productsSection,
  usps,
  roadmap,
  process,
  portfolio,
  faq,
} from "@/content/site";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <RevealObserver />
      <Nav />
      <ChapterRail />

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

        {/* ── USPs ─────────────────────────────────────────────── */}
        <section className="section" id="promise">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{usps.eyebrow}</span>
              <h2 className="section-title">{usps.title}</h2>
              <p className="section-sub">{usps.sub}</p>
            </div>

            <div className="usp-grid">
              {usps.items.map((u, i) => (
                <div className="usp" key={u.title} data-s3d={i % 2 === 0 ? "left" : "right"}>
                  <div className="usp-v">{u.value}</div>
                  <h3 className="usp-t">{u.title}</h3>
                  <p className="usp-b">{u.body}</p>
                  {"note" in u && u.note && <p className="usp-n">{u.note}</p>}
                  {/* Only the headline promise gets a diagram. Four of them
                      here would turn a set of commitments into wallpaper. */}
                  {i === 0 && <Motif kind="hours" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE FOUR PILLARS ─────────────────────────────────── */}
        <Pillars />

        {/* ── SERVICES ─────────────────────────────────────────── */}
        <ServicesChapter />

        {/* ── VERTICALS ────────────────────────────────────────── */}
        <section className="section section-alt" id="verticals">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{verticals.eyebrow}</span>
              <h2 className="section-title">{verticals.title}</h2>
              <p className="section-sub">{verticals.sub}</p>
            </div>

            <div className="grid-verticals">
              {verticals.items.map((v, i) => (
                <TiltCard
                  key={v.no}
                  className="glass vert"
                  max={6}
                  data-s3d={i % 2 === 0 ? "left" : "right"}
                >
                  <div className="vert-head">
                    <span className="svc-no">{v.no}</span>
                    <div>
                      <h3 className="svc-t">{v.title}</h3>
                      <p className="vert-lead">{v.lead}</p>
                    </div>
                  </div>

                  <p className="svc-b">{v.body}</p>

                  <ul className="vert-list">
                    {v.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>

                  {"disclaimer" in v && v.disclaimer && (
                    <p className="vert-note">{v.disclaimer}</p>
                  )}

                  {/* The diagram does what the copy above it describes. */}
                  <Motif kind={v.motif} />
                </TiltCard>
              ))}
            </div>

            <p className="reveal note-line">{verticals.note}</p>
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
              <article className="prod" data-flip={i % 2 === 1} key={product.slug}>
                <div className="reveal">
                  <span className="status" data-live={product.status === "Live"}>
                    <span className="status-dot" />
                    {product.status}
                  </span>

                  <h3 className="prod-name">{product.name}</h3>

                  <p className="mono-label" style={{ marginTop: 10, color: "var(--accent-2)" }}>
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
                    <Link href={`/products/${product.slug}`} className="pill pill-primary">
                      Explore {product.name}
                    </Link>
                    {product.url && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill pill-ghost"
                      >
                        Visit site ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="prod-visual reveal" data-accent={product.accent} data-delay={120}>
                  <ProductVisual product={product} />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── INTERACTIVE PRODUCT MODEL ────────────────────────── */}
        <ProductShowcase />

        {/* ── ROADMAP ──────────────────────────────────────────── */}
        <section className="section section-alt" id="roadmap">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{roadmap.eyebrow}</span>
              <h2 className="section-title">{roadmap.title}</h2>
              <p className="section-sub">{roadmap.sub}</p>
            </div>

            {roadmap.items.map((item, i) => (
              <div className="glass upcoming reveal" key={item.name} data-delay={i * 90}>
                <div className="upcoming-head">
                  <div>
                    <span className="status">
                      <span className="status-dot" />
                      {item.status}
                    </span>
                    <h3 className="prod-name" style={{ marginTop: 16 }}>
                      {item.name}
                    </h3>
                    <p className="mono-label" style={{ marginTop: 10, color: "var(--accent-2)" }}>
                      {item.kicker}
                    </p>
                  </div>
                  <p className="svc-b upcoming-body">{item.body}</p>
                </div>

                {item.courses.length > 0 && (
                  <div className="course-grid">
                    {item.courses.map((c) => (
                      <div className="course" key={c.no} data-s3d="up">
                        <span className="svc-no">{c.no}</span>
                        <h4 className="svc-t">{c.title}</h4>
                        {/* A course with no body is one whose syllabus isn't
                            written yet — say so rather than leaving a gap. */}
                        {c.body ? (
                          <p className="svc-b">{c.body}</p>
                        ) : (
                          <span className="course-soon">Coming soon</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                <div className="step" key={step.no} data-s3d="up">
                  <span className="step-no">{step.no}</span>
                  <h3 className="step-t">{step.title}</h3>
                  <p className="step-b">{step.body}</p>
                  {i === 0 && <Motif kind="assemble" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PORTFOLIO ────────────────────────────────────────── */}
        <section className="section section-alt" id="portfolio">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{portfolio.eyebrow}</span>
              <h2 className="section-title">{portfolio.title}</h2>
              <p className="section-sub">{portfolio.sub}</p>
            </div>

            <div className="work-list">
              {portfolio.items.map((item, i) => (
                <WorkCard key={item.domain} work={item} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── LEADERSHIP ───────────────────────────────────────────
            Placed after the work, not before it: a visitor who has just seen
            what was shipped is the one who cares who shipped it. */}
        <Leadership />

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="section section-alt">
          <div className="shell shell-narrow">
            <div className="section-head reveal">
              <span className="eyebrow">{faq.eyebrow}</span>
              <h2 className="section-title">{faq.title}</h2>
            </div>
            <div className="reveal">
              <Faq items={faq.items} />
            </div>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
