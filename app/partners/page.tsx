import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import { company, partners } from "@/content/site";
import type { PartnerTier } from "@/content/site/partners";

const title = partners.meta.title;
const description = partners.meta.description;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/partners" },
  openGraph: { title, description, url: "/partners" },
};

function RateCard({
  eyebrow,
  heading,
  note,
  tiers,
}: {
  eyebrow: string;
  heading: string;
  note: string;
  tiers: readonly PartnerTier[];
}) {
  return (
    <div className="reveal" style={{ marginTop: 34 }}>
      <span className="eyebrow">{eyebrow}</span>
      <h3 className="section-title" style={{ fontSize: "1.5rem", marginTop: 6 }}>
        {heading}
      </h3>
      <p className="about-facts-note" style={{ marginTop: 8, maxWidth: "46rem" }}>
        {note}
      </p>
      <div className="channels" style={{ marginTop: 22 }}>
        {tiers.map((t, i) => (
          <div key={t.name} className="glass channel reveal" data-delay={i * 60}>
            <span className="mono-label">{t.name}</span>
            <strong>{t.rate}</strong>
            <span className="channel-note">{t.fits}</span>
            <ul style={{ marginTop: 12, paddingLeft: "1.1rem" }}>
              {t.has.map((h) => (
                <li key={h} className="channel-note" style={{ marginTop: 4 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <>
      <RevealObserver />

      <main>
        <PageHero
          eyebrow={partners.hero.eyebrow}
          title={
            <>
              The team behind{" "}
              <span className="grad-text">other people&apos;s agencies.</span>
            </>
          }
          sub={partners.hero.sub}
          accent="#e8eef6"
        />

        {/* The non-compete comes before the price. It is the only question an
            agency actually has about subcontracting, and answering it first is
            what separates this from every other rate card they have been sent. */}
        <section className="section">
          <div className="shell shell-narrow">
            <div className="glass office reveal">
              <span className="eyebrow">{partners.promise.eyebrow}</span>
              <h2 className="section-title" style={{ fontSize: "1.7rem", marginTop: 8 }}>
                {partners.promise.title}
              </h2>
              <p style={{ marginTop: 12 }}>{partners.promise.body}</p>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">RATES, UP FRONT</span>
              <h2 className="section-title">No &ldquo;custom quote in 48 hours&rdquo;</h2>
              <p className="about-facts-note" style={{ marginTop: 10, maxWidth: "46rem" }}>
                You cannot price a client proposal against a number you have not
                been given. Both rate cards are below. If your project does not
                fit either, say so and we will tell you plainly whether it is
                work we should take.
              </p>
            </div>

            <RateCard
              eyebrow={partners.india.eyebrow}
              heading={partners.india.title}
              note={partners.india.note}
              tiers={partners.india.tiers}
            />

            <RateCard
              eyebrow={partners.overseas.eyebrow}
              heading={partners.overseas.title}
              note={partners.overseas.note}
              tiers={partners.overseas.tiers}
            />
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{partners.how.eyebrow}</span>
              <h2 className="section-title">{partners.how.title}</h2>
            </div>
            <div className="channels">
              {partners.how.items.map((it, i) => (
                <div key={it.h} className="glass channel reveal" data-delay={i * 60}>
                  <strong>{it.h}</strong>
                  <span className="channel-note">{it.p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="shell shell-narrow">
            <div className="section-head reveal">
              <span className="eyebrow">{partners.notFor.eyebrow}</span>
              <h2 className="section-title">{partners.notFor.title}</h2>
            </div>
            <div className="glass office reveal">
              <ul style={{ paddingLeft: "1.1rem" }}>
                {partners.notFor.items.map((t) => (
                  <li key={t} style={{ marginTop: 10 }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">{partners.proof.eyebrow}</span>
              <h2 className="section-title">{partners.proof.title}</h2>
            </div>
            <div className="channels">
              {partners.proof.items.map((it, i) => (
                <a
                  key={it.h}
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass channel reveal"
                  data-delay={i * 70}
                >
                  <strong>{it.h}</strong>
                  <span className="channel-note">{it.p}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="shell shell-narrow">
            <div className="glass office reveal">
              <span className="eyebrow">{partners.cta.eyebrow}</span>
              <h2 className="section-title" style={{ fontSize: "1.7rem", marginTop: 8 }}>
                {partners.cta.title}
              </h2>
              <p style={{ marginTop: 12 }}>{partners.cta.sub}</p>
              <div className="channels" style={{ marginTop: 24 }}>
                <a
                  href={`https://wa.me/${company.phoneE164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass channel"
                >
                  <span className="mono-label">WhatsApp</span>
                  <strong>{company.phone}</strong>
                  <span className="channel-note">Usually a reply the same day</span>
                </a>
                <a href={`mailto:${company.email}`} className="glass channel">
                  <span className="mono-label">Email</span>
                  <strong>{company.email}</strong>
                  <span className="channel-note">Send the scope, get a number back</span>
                </a>
              </div>
              <p className="mono-label" style={{ marginTop: 22 }}>
                {company.legalName} · CIN {company.cin}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
