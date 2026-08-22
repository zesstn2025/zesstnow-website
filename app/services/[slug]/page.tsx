import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import ServiceDetail from "@/components/services/ServiceDetail";
import { company, servicePages } from "@/content/site";

/**
 * The five service pages: /services/ai-agents, /services/saas-development,
 * /services/ecommerce, /services/digital-marketing and /services/fintech.
 *
 * Statically generated from content/site.ts — there is no database behind them
 * and no reason for them to be rendered per request. Adding a sixth service is
 * an entry in that array and nothing else; the navigation menu, the home page
 * portal, the sitemap and the cross-links at the foot of every service page all
 * read from the same list.
 *
 * Two of these slugs were shorter when they were first published. The old
 * addresses are 301'd in next.config.mjs rather than deleted — they were live
 * and crawlable, and a moved page keeps what it earned.
 */
export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/services/${page.slug}`,
    },
  };
}

export default async function ServiceRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) notFound();

  /**
   * Structured data, per page.
   *
   * The FAQ block is what search engines and AI assistants quote directly, and
   * the questions here are the ones people actually ask before they write in —
   * so they are worth marking up properly rather than leaving as prose.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: page.metaTitle,
        description: page.metaDescription,
        serviceType: page.eyebrow,
        provider: {
          "@type": "Organization",
          name: company.legalName,
          url: `https://${company.domain}`,
        },
        areaServed: "IN",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: page.navLabel,
          itemListElement: page.capabilities.map((c) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: c.title, description: c.body },
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Services", item: `https://${company.domain}/services` },
          { "@type": "ListItem", position: 2, name: page.navLabel, item: `https://${company.domain}/services/${page.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RevealObserver />

      <main>
        <ServiceDetail page={page} />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
