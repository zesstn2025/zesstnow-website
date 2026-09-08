#!/usr/bin/env node
/**
 * Stand up a new client site.
 *
 *   node scripts/new-client.mjs sharda-guest-house "शारदा गेस्ट हाउस" 9984155645
 *
 * Copies starter/ to ../<slug>/, fills in the three facts it was given, and
 * initialises a git repository. What is left is the four content modules and
 * a handful of photographs — which is the whole point: the layout, the enquiry
 * handling, the structured data and the launch check are already built and are
 * identical for every client, so the only work that scales with the number of
 * clients is the work that is genuinely different between them.
 *
 * The site is created *outside* this repository. Each client gets their own
 * repository and their own Vercel project, because they own it — and because
 * one client's site should never be able to break another's.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const STARTER = join(REPO, "starter");

const [slug, name, phone] = process.argv.slice(2);

if (!slug || !name) {
  console.error(`
  node scripts/new-client.mjs <slug> "<नाम>" [10-digit-phone]

    slug   folder and repository name, lowercase-with-hyphens
    नाम    the business name as it should appear on the site
    phone  optional; fill it in later in content/site/company.ts
`);
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`  slug must be lowercase letters, digits and hyphens — got "${slug}"`);
  process.exit(1);
}
if (phone && !/^[6-9]\d{9}$/.test(phone)) {
  console.error(`  phone must be 10 digits starting 6-9 — got "${phone}"`);
  process.exit(1);
}

const dest = resolve(REPO, "..", slug);
if (existsSync(dest)) {
  console.error(`  ${dest} already exists — refusing to overwrite it`);
  process.exit(1);
}

// node_modules and .next are the starter's build output, not part of it. Copying
// them would take minutes and produce a project pinned to this machine's install.
cpSync(STARTER, dest, {
  recursive: true,
  filter: (src) => !/[\\/](node_modules|\.next|graphify-out)([\\/]|$)/.test(src),
});
rmSync(join(dest, "package-lock.json"), { force: true });

const companyFile = join(dest, "content/site/company.ts");
let company = readFileSync(companyFile, "utf8");
company = company.replace('name: "CONFIRM: व्यवसाय का नाम"', `name: ${JSON.stringify(name)}`);
if (phone) {
  company = company
    .replace('phone: "CONFIRM"', `phone: "${phone}"`)
    .replace('whatsapp: "CONFIRM"', `whatsapp: "${phone}"`);
}
writeFileSync(companyFile, company);

const pkgFile = join(dest, "package.json");
const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
pkg.name = slug;
writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");

try {
  execFileSync("git", ["init", "-q"], { cwd: dest });
  execFileSync("git", ["add", "-A"], { cwd: dest });
  execFileSync("git", ["commit", "-qm", `${name} — site from the Zesst Now starter`],
               { cwd: dest });
} catch {
  console.log("  (git not initialised — do it by hand if you want it)");
}

console.log(`
  ${name} → ${dest}

  1. cd ${dest} && npm install
  2. content/site/brand.ts     रंग और फ़ॉन्ट
     content/site/company.ts   पता, समय, WhatsApp
     content/site/services.ts  सेवाएँ, और क्यों यही दुकान
     content/site/pages.ts     hero, गैलरी, about, सवाल-जवाब
  3. असली फ़ोटो public/gallery/ में — stock कभी नहीं
  4. npm run check   हर CONFIRM पकड़ेगा
  5. npm run build   फिर Vercel पर deploy
`);
