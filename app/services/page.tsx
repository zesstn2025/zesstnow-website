import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import TiltCard from "@/components/TiltCard";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import Faq from "@/components/Faq";
import { services, verticals, process, faq, usps } from "@/content/site";

const title = "Services — engineering, AI, compliance, funding and growth";
const description =
  "Websites, AI automations, SaaS product engineering and brand identity — plus GST and tax compliance, loan facilitation, business registration, leads and marketing. Both halves of what Zesst Now does.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: { title, description, url: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <RevealObserver />
      <Nav />

      <main>
        <PageHero
          eyebrow="SERVICES"
          title={
            <>
              Two halves of one{" "}
              <span className="grad-text">business.</span>
            </>
          }
          sub="A software studio that ships its own products, and a compliance and growth desk that keeps businesses running. Most clients end up using both."
        />


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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIGITAL ──────────────────────────────────────────── */}
        <section className="section" id="digital">
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
                  className="glass svc"
                  data-s3d={i % 2 === 0 ? "left" : "right"}
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
                </TiltCard>
              ))}
            </div>

            <p className="reveal note-line">{verticals.note}</p>
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
                </div>
              ))}
            </div>
          </div>
        </section>

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
