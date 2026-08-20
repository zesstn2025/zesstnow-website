import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProductVisual from "@/components/ProductVisual";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { products, productsSection, roadmap } from "@/content/site";

const title = "Products — BizGST Pro and what's next";
const description =
  "BizGST Pro is our live GST-compliant SaaS ERP for Indian MSMEs. Zesst AI Academy and the Cognitive Capital Suite are in development.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/products" },
  openGraph: { title, description, url: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <RevealObserver />
      <Nav />

      <main>
        <PageHero
          eyebrow={productsSection.eyebrow}
          title={
            <>
              We don&apos;t just build{" "}
              <span className="grad-text">for clients.</span>
            </>
          }
          sub={productsSection.sub}
        />

        <section className="section" id="live">
          <div className="shell">
            {products.map((product, i) => (
              <article className="prod" data-flip={i % 2 === 1} key={product.slug}>
                <div className="reveal">
                  <span className="status" data-live={product.status === "Live"}>
                    <span className="status-dot" />
                    {product.status}
                  </span>

                  <h2 className="prod-name">{product.name}</h2>

                  <p className="mono-label" style={{ marginTop: 10, color: "var(--electric)" }}>
                    {product.domain}
                  </p>

                  <p className="prod-sub">{product.sub}</p>

                  <div className="svc-pts" style={{ marginTop: 26 }}>
                    {product.features.slice(0, 5).map((f) => (
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
                    <p className="mono-label" style={{ marginTop: 10, color: "var(--electric)" }}>
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
                        <p className="svc-b">{c.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <p className="reveal note-line">
              Want a seat when the Academy opens? Say so in the form below and
              we&apos;ll put you on the waitlist.
            </p>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
