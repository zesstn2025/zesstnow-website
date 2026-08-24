/**
 * Walks every page and checks every link on it.
 *
 * This matters more now than it used to. Blog posts and announcements are
 * edited through /admin by someone who is not going to run a build, and a
 * mistyped internal link produces a 404 that nothing else on this site would
 * ever report.
 *
 * Internal links are fetched and their status recorded. External links are
 * listed by host rather than fetched: a CI runner or a sandboxed environment
 * can have outbound requests blocked or rate-limited, and a failure there says
 * nothing about whether the link is good — Instagram answers 429 to a
 * datacentre IP whether or not the profile exists. Listing them puts them in
 * front of a person, which is the only reliable check.
 *
 * What IS checked on every link regardless of destination is the shape of the
 * href. Empty, "#", "undefined", and in-page anchors pointing at an id that is
 * not on the page are all real bugs, and not one of them would show up as a
 * bad status code.
 *
 * Exit code is the number of problems found.
 *
 *   npm run links                 against a local server
 *   BASE=https://... npm run links
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright");

const BASE = process.env.BASE || "http://127.0.0.1:3111";
const CHROMIUM = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const PAGES = [
  "/", "/services", "/services/ai-agents", "/services/fintech",
  "/services/saas-development", "/services/digital-marketing",
  "/services/ecommerce", "/products", "/products/bizgstpro",
  "/products/cognitive-capital-suite", "/work", "/about", "/contact",
  "/blog", "/announcements",
];

const b = await chromium.launch({
  executablePath: CHROMIUM,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"],
});

const internal = new Map();
const external = new Map();
const problems = [];

for (const page of PAGES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + page, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(1200);

  const links = await p.evaluate(() =>
    Array.from(document.querySelectorAll("a")).map((a) => ({
      raw: a.getAttribute("href"),
      href: a.href,
      text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 40),
    }))
  );
  const ids = await p.evaluate(() => Array.from(document.querySelectorAll("[id]")).map((n) => n.id));

  for (const l of links) {
    if (l.raw === null || l.raw.trim() === "") {
      problems.push(`${page}  EMPTY href  "${l.text}"`);
    } else if (/^(undefined|null|#)$/.test(l.raw.trim())) {
      problems.push(`${page}  placeholder href "${l.raw}"  "${l.text}"`);
    } else if (l.raw.startsWith("#")) {
      if (!ids.includes(l.raw.slice(1))) problems.push(`${page}  anchor ${l.raw} has no target  "${l.text}"`);
    } else if (l.href.startsWith(BASE)) {
      const path = l.href.slice(BASE.length) || "/";
      if (!internal.has(path)) internal.set(path, new Set());
      internal.get(path).add(page);
    } else if (/^https?:/.test(l.href)) {
      if (!external.has(l.href)) external.set(l.href, new Set());
      external.get(l.href).add(page);
    }
  }
  await p.close();
}
await b.close();

for (const [path, from] of internal) {
  const res = await fetch(BASE + path.split("#")[0], { redirect: "manual" });
  if (res.status >= 400) problems.push(`${path}  HTTP ${res.status}  (linked from ${[...from].join(", ")})`);
}

console.log(`${PAGES.length} pages, ${internal.size} internal targets, ${external.size} external links\n`);

console.log("── external links, for a person to eyeball ──");
const hosts = new Map();
for (const [url] of external) {
  const h = new URL(url).host;
  if (!hosts.has(h)) hosts.set(h, []);
  hosts.get(h).push(url);
}
for (const [h, list] of [...hosts].sort()) {
  console.log(`  ${h}`);
  for (const u of list) console.log(`      ${u}`);
}

if (problems.length === 0) {
  console.log("\nno broken, empty or placeholder links");
} else {
  console.log(`\n── ${problems.length} problems ──`);
  problems.forEach((x) => console.log("  " + x));
}
process.exit(problems.length);
