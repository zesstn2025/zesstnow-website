import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import Faq from "@/components/Faq";
import { company, faq, social } from "@/content/site";
import SocialLinks from "@/components/SocialLinks";

const title = "Contact Zesst Now";
const description = `Talk to us about a website, an AI automation, a product build, GST and tax work, or a loan file. WhatsApp ${company.phone}, or email ${company.email}. ${company.hours}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title, description, url: "/contact" },
};

export default function ContactPage() {
  const channels = [
    {
      label: "WhatsApp",
      value: company.phone,
      note: "Fastest — usually a reply the same day",
      href: `https://wa.me/${company.phoneE164}`,
    },
    {
      label: "Email",
      value: company.email,
      note: "For briefs, documents and detailed questions",
      href: `mailto:${company.email}`,
    },
    {
      label: "Call",
      value: company.phone,
      note: company.hours,
      href: `tel:+${company.phoneE164}`,
    },
    {
      label: "Instagram",
      value: `@${company.instagram}`,
      note: "Product updates and GST deadline reminders",
      href: company.instagramUrl,
    },
  ];

  return (
    <>
      <RevealObserver />
      <Nav />

      <main>
        <PageHero
          eyebrow="GET IN TOUCH"
          title={
            <>
              Tell us what you&apos;re{" "}
              <span className="grad-text">building.</span>
            </>
          }
          sub="A short note is enough. We'll come back with what it would take, what it would cost and whether we're the right people for it."
          accent="#e8d9a8"
        />

        <section className="section">
          <div className="shell">
            <div className="channels">
              {channels.map((c, i) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="glass channel reveal"
                  data-delay={i * 70}
                >
                  <span className="mono-label">{c.label}</span>
                  <strong>{c.value}</strong>
                  <span className="channel-note">{c.note}</span>
                </a>
              ))}
            </div>

            <div className="glass office reveal" style={{ marginTop: 34 }}>
              <span className="eyebrow">WHERE WE ARE</span>
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
              <p className="about-facts-note" style={{ marginTop: 14 }}>
                Walk-in GST and ITR services run from Nitin GST Suvidha Kendra,
                in front of Axis Bank, Sirathu Road, Manjhanpur, Kaushambi.
              </p>

              <div style={{ marginTop: 24 }}>
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
      </main>

      <Footer />
    </>
  );
}
