import type { MetadataRoute } from "next";
import { company } from "@/content/site";

const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin is the owner's editor and /api/admin is its OAuth handshake —
    // neither is a page, and neither should appear in results.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
