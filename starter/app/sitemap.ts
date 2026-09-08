import type { MetadataRoute } from "next";
import { services, legal } from "@/content/site";

/** Set SITE_URL in the environment at deploy time; Vercel supplies the host. */
const base = process.env.SITE_URL || "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    "", "/services", "/about", "/contact",
    ...services.map((s) => `/services/${s.slug}`),
    ...legal.map((l) => `/legal/${l.slug}`),
  ].map((p) => ({ url: `${base}${p}`, lastModified: now }));
}
