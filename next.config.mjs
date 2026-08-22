/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM examples; let Next handle them.
  transpilePackages: ["three"],

  async rewrites() {
    return [
      // The CMS is a static page in public/admin. Next serves that at
      // /admin/index.html but not at /admin, which 404s — this maps the
      // address people actually type onto the file.
      { source: "/admin", destination: "/admin/index.html" },
    ];
  },

  /**
   * The two service pages that were published under shorter slugs.
   *
   * They were live, linked and crawlable, so the old addresses cannot simply
   * stop existing — a 301 moves whatever ranking and whatever links they picked
   * up onto the new address instead of dropping them on the floor. Permanent,
   * because the move is permanent.
   */
  async redirects() {
    return [
      { source: "/services/saas", destination: "/services/saas-development", permanent: true },
      { source: "/services/marketing", destination: "/services/digital-marketing", permanent: true },
    ];
  },
};

export default nextConfig;
