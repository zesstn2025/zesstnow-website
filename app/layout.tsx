import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { company, social } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import FieldStage from "@/components/FieldStage";
import Motion from "@/components/Motion";
import AnnouncementBar from "@/components/AnnouncementBar";
import { activeAnnouncement } from "@/lib/content";
import "./globals.css";

/**
 * A high-contrast serif carries the headlines and a refined grotesque carries
 * the text. That pairing is what reads as expensive — the previous geometric
 * sans on its own read like every other SaaS template.
 *
 * Fraunces is variable on more than weight: SOFT 0 and WONK 0 keep the terminals
 * sharp and the italics upright, so it stays modern rather than turning
 * artisanal, and the optical size axis is what keeps a 70px headline from
 * looking like scaled-up body text.
 */
const display = Fraunces({
  subsets: ["latin"],
  // Loaded as a variable font — next/font rejects `axes` alongside a fixed
  // weight list, and the optical-size axis is the point of using Fraunces.
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.shortName} — Websites, AI Automations & SaaS Products`,
    template: `%s | ${company.shortName}`,
  },
  description: company.tagline,
  keywords: [
    "Zesst Now",
    "Zesst Now Services Private Limited",
    "web development company Kaushambi",
    "AI automation India",
    "SaaS product development India",
    "BizGST Pro",
    "GST billing software",
    "SaaS ERP India",
    "Next.js development India",
    "brand identity design India",
  ],
  authors: [{ name: company.legalName }],
  creator: company.legalName,
  publisher: company.legalName,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: company.shortName,
    title: `${company.shortName} — Websites, AI Automations & SaaS Products`,
    description: company.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.shortName} — Websites, AI Automations & SaaS Products`,
    description: company.tagline,
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2096%2096%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%236D3BF5%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2322D3EE%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2296%22%20height%3D%2296%22%20rx%3D%2222%22%20fill%3D%22url%28%23g%29%22%2F%3E%3Cpath%20d%3D%22M33.5%2C20%20H70%20V30%20L43%2C66%20H70%20L62.5%2C76%20H26%20V66%20L53%2C30%20H26%20Z%22%20fill%3D%22%2305060F%22%2F%3E%3C%2Fsvg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#04050D",
  colorScheme: "dark",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  alternateName: company.shortName,
  url: siteUrl,
  description: company.tagline,
  foundingDate: "2025-02-21",
  identifier: { "@type": "PropertyValue", propertyID: "CIN", value: company.cin },
  address: {
    "@type": "PostalAddress",
    addressLocality: company.registeredOffice.locality,
    addressRegion: company.registeredOffice.state,
    postalCode: company.registeredOffice.pin,
    addressCountry: "IN",
  },
  email: company.email,
  telephone: `+${company.phoneE164}`,
  sameAs: [
    ...social.company.filter((p) => p.url).map((p) => p.url),
    "https://bizgstpro.com",
  ],
  founder: { "@type": "Person", name: company.founder, jobTitle: company.founderRole },
  knowsAbout: [
    "Web development",
    "AI automation",
    "SaaS product engineering",
    "Brand identity design",
    "GST compliance software",
  ],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web design & development" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI workflow automation" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "SaaS product engineering" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Brand identity design" } },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read at build time from the pinned announcement, so a launch reaches every
  // page without touching a component.
  const ann = activeAnnouncement();

  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        {/* First in the DOM so it paints behind every positioned section. */}
        <FieldStage />
        <SmoothScroll />
        <Motion />
        {ann && (
          <AnnouncementBar
            id={ann.slug}
            kind={ann.kind}
            title={ann.title}
            href="/announcements"
            cta={ann.cta?.label ?? "Read more"}
          />
        )}
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
