/**
 * Deliberately empty, and it has to exist.
 *
 * This starter uses plain CSS — no Tailwind, no framework. But Next.js looks
 * for a PostCSS config by walking UP the directory tree, so when the template
 * is built while it still sits inside zesstnow-website/, it finds the parent
 * repo's postcss.config.mjs, tries to load `tailwindcss` out of this project's
 * node_modules, does not find it, and dies on the first CSS import.
 *
 * That was not theoretical: the Vercel project pointed at starter/ failed
 * twelve builds in a row, once per push, and never succeeded a single time.
 *
 * An empty config here stops the upward search. Do not "tidy it away" —
 * deleting this file brings the failure straight back.
 */
export default { plugins: {} };
