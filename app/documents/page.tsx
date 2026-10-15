import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { documents, identifiers } from "@/content/site/documents";
import { company } from "@/content/site/company";

const title = "Company documents — registration, GST, MSME and Startup India";
const description =
  "Every registration document for Zesst Now Services Private Limited, open to read: certificate of incorporation, GST, PAN, TAN, Udyam, DPIIT Startup India recognition and ESIC — with the portal links to verify each one independently.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/documents" },
  openGraph: { title, description, url: "/documents" },
};

export default function DocumentsPage() {
  return (
    <>
      <RevealObserver />

      <main>
        <PageHero
          eyebrow="COMPANY DOCUMENTS"
          title={
            <>
              Check us out <span className="grad-text">before you pay us.</span>
            </>
          }
          sub="Every registration the company holds, open to read and download. Most carry a number you can verify yourself on a government portal — which is the part that actually proves anything."
        />

        {/* The numbers first. Somebody doing due diligence wants the
            identifiers to copy into a portal; the PDFs are for the file. */}
        <section className="section">
          <div className="shell">
            <div className="doc-ids reveal">
              {identifiers.map((n) => (
                <div className="doc-id" key={n.label}>
                  <span className="mono-label">{n.label}</span>
                  <span className="doc-id-value">{n.value}</span>
                </div>
              ))}
            </div>

            <p className="doc-note reveal">
              {company.legalName} was incorporated on {company.incorporated} and is
              registered at {company.registeredOffice.locality},{" "}
              {company.registeredOffice.district}, {company.registeredOffice.state}.
              A certificate can be made to look like anything — a registry lookup
              cannot. Where a portal lets you check a number yourself, the link to
              it sits next to the document.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="doc-list">
              {documents.map((d, i) => (
                <article
                  className="doc glass"
                  key={d.id}
                  id={d.id}
                  data-s3d={i % 2 === 0 ? "left" : "right"}
                >
                  <div className="post-meta">
                    <span className="mono-label post-cat">{d.idLabel}</span>
                    <span className="mono-label">{d.issued}</span>
                  </div>

                  <h2 className="post-title">{d.name}</h2>
                  <p className="doc-value">{d.idValue}</p>
                  <p className="post-desc">{d.what}</p>
                  <p className="doc-authority">{d.authority}</p>

                  <div className="doc-actions">
                    <a
                      className="pill pill-primary pill-sm"
                      href={d.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {d.kind === "pdf" ? "Open PDF" : "Open image"}
                    </a>
                    {d.verifyUrl && (
                      <a
                        className="pill pill-sm"
                        href={d.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {d.verifyLabel}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <p className="doc-note reveal">
              Documents are re-issued from time to time as company details
              change. If a copy here looks out of date against what you find on
              the portal, the portal is right — tell us and we will replace it.
            </p>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
