import type { MetadataRoute } from "next";
import { company, products, legal, servicePages } from "@/content/site";
import { getPosts, getAnnouncements } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...["/services", "/products", "/work", "/blog", "/announcements", "/about", "/contact"].map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // The three service pages rank on their own terms, so they sit just below
    // the top-level sections rather than with the deep pages.
    ...servicePages.map((p) => ({
      url: `${base}/services/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getPosts().map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated || p.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...getAnnouncements().slice(0, 1).map(() => ({
      url: `${base}/announcements`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...legal.pages.map((p) => ({
      url: `${base}/legal/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
