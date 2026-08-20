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
};

export default nextConfig;
