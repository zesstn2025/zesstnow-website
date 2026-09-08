/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Most client sites are one town's worth of traffic on a phone. Everything
  // that is not needed for that is left out on purpose — no image CDN, no
  // analytics bundle, no 3D. The site loading fast on a weak signal is worth
  // more to these businesses than any feature that would slow it down.
};
