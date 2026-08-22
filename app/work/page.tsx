import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import WorkCard from "@/components/WorkCard";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { portfolio, verticals } from "@/content/site";

const title = "Our work — products and client sites we've shipped";
const description =
  "Everything Zesst Now has built and still runs: BizGST Pro, our GST-compliant SaaS ERP, and adnitinkumar.in, a full practice website with a custom CMS and client dues portal. Real screenshots of the live sites.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: { title, description, url: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <RevealObserver />

      <main>
        <PageHero
          eyebrow={portfolio.eyebrow}
          title={
            <>
              Everything we&apos;ve{" "}
              <span className="grad-text">shipped.</span>
            </>
          }
          sub={portfolio.sub}
          accent="#e8eef6"
        />

        <section className="section" id="portfolio">
          <div className="shell">
            <div className="work-list">
              {portfolio.items.map((item, i) => (
                <WorkCard key={item.domain} work={item} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* The service verticals are part of the record of what this company
            does, so they belong on the work page and not only under services. */}
        <section className="section section-alt">
          <div className="shell">
            <div className="section-head reveal">
              <span className="eyebrow">BEYOND THE STUDIO</span>
              <h2 className="section-title">
                The desk behind the <span className="grad-text">software.</span>
              </h2>
              <p className="section-sub">{verticals.sub}</p>
            </div>

            <div className="vert-strip">
              {verticals.items.map((v, i) => (
                <div className="glass vert-mini reveal" key={v.no} data-delay={i * 70}>
                  <span className="svc-no">{v.no}</span>
                  <h3 className="svc-t">{v.title}</h3>
                  <p className="svc-b">{v.lead}</p>
                </div>
              ))}
            </div>

            <p className="reveal note-line">{verticals.note}</p>

            <div className="reveal" style={{ marginTop: 28 }}>
              <Link href="/services" className="pill pill-ghost">
                All services →
              </Link>
            </div>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
