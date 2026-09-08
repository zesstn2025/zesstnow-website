import type { Metadata } from "next";
import { brand, company } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

/**
 * The brand object becomes CSS custom properties here, and nowhere else.
 *
 * Doing it at the root means the stylesheet can be written once, in plain CSS,
 * against names that never change — and a client's whole look is one file of
 * hex values rather than a search-and-replace through the styles.
 */
function themeVars() {
  return `:root{
  --ink:${brand.ink}; --surface:${brand.surface}; --surface-alt:${brand.surfaceAlt};
  --line:${brand.line}; --muted:${brand.muted}; --accent:${brand.accent};
  --accent-ink:${brand.accentInk}; --accent-soft:${brand.accentSoft};
  --radius:${brand.radius}; --max:${brand.maxWidth};
  --display:"${brand.displayFont}",${brand.fallback};
  --body:"${brand.bodyFont}",${brand.fallback};
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ink:${brand.darkInk}; --surface:${brand.darkSurface};
  --surface-alt:${brand.darkSurfaceAlt}; --line:${brand.darkLine};
  --muted:${brand.darkMuted}; --accent:${brand.darkAccent};
  --accent-ink:${brand.darkAccentInk}; --accent-soft:${brand.darkAccentSoft};
}}
:root[data-theme="dark"]{
  --ink:${brand.darkInk}; --surface:${brand.darkSurface};
  --surface-alt:${brand.darkSurfaceAlt}; --line:${brand.darkLine};
  --muted:${brand.darkMuted}; --accent:${brand.darkAccent};
  --accent-ink:${brand.darkAccentInk}; --accent-soft:${brand.darkAccentSoft};
}`;
}

const fontHref =
  `https://fonts.googleapis.com/css2` +
  `?family=${brand.displayFont.replace(/ /g, "+")}:wght@${brand.displayWeights}` +
  `&family=${brand.bodyFont.replace(/ /g, "+")}:wght@${brand.bodyWeights}` +
  `&display=swap`;

export const metadata: Metadata = {
  title: { default: `${company.name} — ${company.address.town}`,
           template: `%s · ${company.name}` },
  description: company.tagline,
};

/**
 * Structured data. This is the part that makes the business appear properly in
 * a Google search rather than as a bare blue link, and it is the cheapest SEO
 * on a site this size — it is the same facts, marked up.
 */
function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.tagline,
    telephone: `+91${company.phone}`,
    ...(company.email ? { email: company.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.line,
      addressLocality: company.address.town,
      addressRegion: company.address.state,
      postalCode: company.address.pin,
      addressCountry: "IN",
    },
    openingHours: company.hours,
    ...(company.address.mapUrl ? { hasMap: company.address.mapUrl } : {}),
    ...(company.social.some((s) => s.url)
      ? { sameAs: company.social.filter((s) => s.url).map((s) => s.url) }
      : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fontHref} />
        <style dangerouslySetInnerHTML={{ __html: themeVars() }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
