import type { MetadataRoute } from "next";
import { company, products, legal } from "@/content/site";

const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...["/services", "/products", "/work", "/about", "/contact"].map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...legal.pages.map((p) => ({
      url: `${base}/legal/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
