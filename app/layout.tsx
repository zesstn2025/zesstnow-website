import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import { company } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
    "Cognitive Capital Suite",
    "GST software",
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
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%236D3BF5'/%3E%3Cstop offset='1' stop-color='%2322D3EE'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='16' fill='url(%23g)'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='sans-serif' font-size='36' font-weight='700' fill='%2305060F'%3EZ%3C/text%3E%3C/svg%3E",
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
        <SmoothScroll />
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
