import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { about, company, process, social } from "@/content/site";
import SocialLinks from "@/components/SocialLinks";
import Leadership from "@/components/Leadership";

const title = "About Zesst Now Services Private Limited";
const description =
  "Incorporated in February 2025 in Kaushambi, Uttar Pradesh. Bootstrapped. A software studio that ships its own SaaS, and a compliance and growth desk for the businesses around it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <RevealObserver />
      <Nav />

      <main>
        <PageHero
          eyebrow={about.eyebrow}
          title={
            <>
              A studio and a service desk, in the{" "}
              <span className="grad-text">same building.</span>
            </>
          }
          sub={about.sub}
          accent="#e8eef6"
        />

        <section className="section">
          <div className="shell">
            <div className="about-grid">
              <div className="about-body">
                {about.body.map((p, i) => (
                  <p className="reveal" key={i} data-delay={i * 70}>
                    {p}
                  </p>
                ))}
              </div>

              <aside className="glass about-facts reveal" data-delay={140}>
                <h3 className="mono-label">ON RECORD</h3>
                <dl>
                  {about.facts.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="about-facts-note">
                  Registered with the Registrar of Companies, Kanpur. Full
                  directorship details are on the public MCA record against the
                  CIN above.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <Leadership />

        <section className="section section-alt">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">HOW WE OPERATE</span>
              <h2 className="section-title">
                Four things we don&apos;t{" "}
                <span className="grad-text">negotiate on.</span>
              </h2>
            </div>

            <div className="grid-services">
              {about.values.map((v, i) => (
                <div className="glass svc reveal" key={v.title} data-delay={i * 80}>
                  <h3 className="svc-t">{v.title}</h3>
                  <p className="svc-b">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
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

        <section className="section section-alt">
          <div className="shell shell-narrow">
            <div className="glass office reveal">
              <span className="eyebrow">REGISTERED OFFICE</span>
              <address>
                {company.legalName}
                <br />
                {company.registeredOffice.line1}
                <br />
                {company.registeredOffice.line2}
                <br />
                {company.registeredOffice.district}, {company.registeredOffice.state} –{" "}
                {company.registeredOffice.pin}
                <br />
                {company.registeredOffice.country}
              </address>
              <p className="mono-label">CIN {company.cin}</p>
              <p className="mono-label">{company.hours}</p>

              <div style={{ marginTop: 26 }}>
                <SocialLinks profiles={social.company} label="FOLLOW THE COMPANY" />
                <SocialLinks
                  profiles={social.founder}
                  label={`${company.founder.toUpperCase()} — ${company.founderRole.toUpperCase()}`}
                />
              </div>
            </div>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
