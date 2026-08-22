import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import { legal } from "@/content/site";

export function generateStaticParams() {
  return legal.pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legal.pages.find((p) => p.slug === slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/legal/${page.slug}` },
    openGraph: { title: page.title, description: page.intro, url: `/legal/${page.slug}` },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legal.pages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <>
      <RevealObserver />

      <main>
        <PageHero
          eyebrow="LEGAL"
          title={page.title}
          sub={page.intro}
          back={{ label: "Home", href: "/" }}
        />

        <section className="section">
          <div className="shell shell-narrow">
            <p className="mono-label reveal">Last updated {legal.updated}</p>

            <div className="prose">
              {page.sections.map((section, i) => (
                <div className="reveal" key={section.heading} data-delay={i * 50}>
                  <h2>{section.heading}</h2>
                  {section.body.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
