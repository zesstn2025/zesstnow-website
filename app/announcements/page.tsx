import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { getAnnouncements } from "@/lib/content";

const title = "Announcements — launches and updates from Zesst Now";
const description =
  "New products, beta openings and company updates from Zesst Now Services Private Limited.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/announcements" },
  openGraph: { title, description, url: "/announcements" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function AnnouncementsPage() {
  const items = getAnnouncements();

  return (
    <>
      <RevealObserver />

      <main>
        <PageHero
          eyebrow="ANNOUNCEMENTS"
          title={
            <>
              What&apos;s <span className="grad-text">new here.</span>
            </>
          }
          sub="Product launches, beta openings and company updates. The newest one also shows in the bar at the top of every page."
        />

        <section className="section">
          <div className="shell shell-narrow">
            {items.length === 0 ? (
              <p className="section-sub reveal">Nothing announced right now.</p>
            ) : (
              <div className="ann-list">
                {items.map((a, i) => (
                  <article
                    className="ann glass"
                    key={a.slug}
                    data-s3d={i % 2 === 0 ? "left" : "right"}
                  >
                    <div className="post-meta">
                      <span className="mono-label post-cat">{a.kind}</span>
                      <span className="mono-label">{fmt(a.date)}</span>
                      {a.pinned && <span className="mono-label ann-pin">Pinned</span>}
                    </div>

                    <h2 className="post-title">{a.title}</h2>
                    <p className="post-desc">{a.summary}</p>

                    <div
                      className="prose ann-body"
                      dangerouslySetInnerHTML={{ __html: a.html }}
                    />

                    {a.cta && (
                      <Link href={a.cta.href} className="pill pill-primary pill-sm">
                        {a.cta.label}
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
