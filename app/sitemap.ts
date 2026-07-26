import type { MetadataRoute } from "next";
import { company, products } from "@/content/site";

const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
