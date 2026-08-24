/**
 * One health-check pass over the Zesst Now site.
 *
 * Everything here is a measurement rather than a look, because the failures
 * this project has actually had were all invisible: a WebGL context silently
 * evicted, a shader uniform written to the wrong object, a starfield frozen for
 * weeks while looking exactly like a starfield meant to be still.
 *
 * Prints one line per check and a summary. Exit code is the number of failures.
 *
 * BASE=https://…  points it at a deployment instead of localhost. That needs
 * direct network access: behind a proxy that intercepts outbound requests, the
 * API checks come back 403 and the browser navigation is reset, neither of
 * which says anything about the site. Verified by hand that the same requests
 * answer correctly over curl from the same machine — so a wall of failures
 * against a remote BASE is worth checking with curl before believing.
 */
import { createRequire } from "node:module";

// Playwright is CommonJS and lives outside this project, so it is reached
// through createRequire rather than a bare import: this file is an ES module,
// and the browser it drives is the one the environment already provides rather
// than a dependency this site would otherwise have no reason to carry.
const require = createRequire(import.meta.url);
const PLAYWRIGHT =
  process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright";
const { chromium } = require(PLAYWRIGHT);

const CHROMIUM =
  process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const BASE = process.env.BASE || "http://127.0.0.1:3111";
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name.padEnd(42)} ${detail}`);
}

async function api(path, init = {}) {
  const res = await fetch(BASE + path, init);
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

(async () => {
  /* ── Routes ─────────────────────────────────────────────────────── */
  const routes = [
    "/", "/services", "/services/ai-agents", "/services/fintech",
    "/services/saas-development", "/services/digital-marketing",
    "/services/ecommerce", "/products", "/work", "/about", "/contact",
    "/blog", "/announcements",
  ];
  const bad = [];
  for (const r of routes) {
    const res = await fetch(BASE + r, { redirect: "manual" });
    if (res.status !== 200) bad.push(`${r}=${res.status}`);
  }
  record("routes return 200", bad.length === 0, bad.length ? bad.join(" ") : `${routes.length} routes`);

  // The two renamed slugs must keep redirecting.
  const oldSlugs = ["/services/saas", "/services/marketing"];
  const redirBad = [];
  for (const r of oldSlugs) {
    const res = await fetch(BASE + r, { redirect: "manual" });
    if (res.status !== 308 && res.status !== 301) redirBad.push(`${r}=${res.status}`);
  }
  record("renamed slugs still redirect", redirBad.length === 0, redirBad.join(" ") || "308 both");

  /* ── Security headers ───────────────────────────────────────────── */
  const home = await fetch(BASE + "/");
  const want = [
    "content-security-policy", "x-frame-options", "x-content-type-options",
    "referrer-policy", "permissions-policy", "strict-transport-security",
  ];
  const missing = want.filter((h) => !home.headers.get(h));
  record("security headers present", missing.length === 0, missing.join(" ") || `${want.length} headers`);

  const csp = home.headers.get("content-security-policy") || "";
  const cspOk = csp.includes("frame-ancestors 'none'") && csp.includes("object-src 'none'") &&
                csp.includes("base-uri 'self'") && csp.includes("form-action 'self'");
  record("CSP keeps its load-bearing directives", cspOk, cspOk ? "frame-ancestors, object-src, base-uri, form-action" : csp.slice(0, 90));

  const cookie = (home.headers.get("set-cookie") || "");
  record("CSRF cookie issued, SameSite=Strict", cookie.includes("zn.csrf=") && /samesite=strict/i.test(cookie),
         cookie ? cookie.split(";")[0].slice(0, 24) + "…" : "none");

  /* ── The admin ──────────────────────────────────────────────────────
     Here because /admin was unopenable for its entire existence and nothing
     noticed. The site's CSP refused the editor's own script, so the page sat
     on "Loading the editor" forever — which is what a slow load looks like.
     Both halves are checked: that the policy still permits the editor to
     reach GitHub, and that the bundle it needs is actually being served. */
  const admin = await fetch(BASE + "/admin");
  const adminCsp = admin.headers.get("content-security-policy") || "";
  record("admin page is served", admin.status === 200, `HTTP ${admin.status}`);
  record(
    "admin CSP still lets the editor reach GitHub",
    adminCsp.includes("https://api.github.com"),
    adminCsp.includes("https://api.github.com") ? "connect-src includes api.github.com" : "api.github.com MISSING from connect-src"
  );

  const bundle = await fetch(BASE + "/admin/sveltia-cms.js");
  const bundleType = bundle.headers.get("content-type") || "";
  record(
    "admin editor bundle is served as script",
    bundle.status === 200 && /javascript|ecmascript/i.test(bundleType),
    `HTTP ${bundle.status}, ${bundleType || "no content-type"}`
  );

  /* ── Enquiry endpoint rejections ────────────────────────────────── */
  const body = JSON.stringify({ name: "Health", phone: "+911234567890", service: "x", message: "health check message" });

  const noCsrf = await api("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body });
  record("POST without CSRF is refused", noCsrf.status === 403, `HTTP ${noCsrf.status}`);

  const get = await api("/api/enquiry");
  record("GET is refused", get.status === 405, `HTTP ${get.status}`);

  const big = await api("/api/enquiry", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "a", phone: "b", service: "c", message: "z".repeat(20000) }),
  });
  record("oversized body is refused", big.status === 413, `HTTP ${big.status}`);

  const token = (cookie.match(/zn\.csrf=([^;]+)/) || [])[1];
  let limited = 0, lastStatus = 0;
  for (let i = 0; i < 5; i++) {
    const r = await api("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-zn-csrf": token, Cookie: `zn.csrf=${token}` },
      body,
    });
    lastStatus = r.status;
    if (r.status === 429) limited++;
  }
  record("rate limit engages", limited > 0, `${limited} of 5 refused, last HTTP ${lastStatus}`);

  const leaked = [noCsrf, get, big].some((r) => /at \w+ \(|\.ts:\d+|node_modules|Error:/.test(r.text));
  record("no stack trace in any rejection", !leaked, leaked ? "TRACE LEAKED" : "clean");

  /* ── The 3D, measured ───────────────────────────────────────────── */
  const b = await chromium.launch({
    executablePath: CHROMIUM,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"],
  });

  const scenes = [
    ["hero", "/", ".hero-view"],
    ["portal", "/", ".portal-view"],
    ["vault", "/services/fintech", ".pillar-view"],
  ];

  for (const [name, url, sel] of scenes) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(BASE + url, { waitUntil: "networkidle", timeout: 60000 });
    await p.waitForTimeout(5500);
    await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel);
    await p.waitForTimeout(2500);

    // Two screenshots of the same rectangle two seconds apart.
    //
    // Reading the canvas back would be neater and does not work: without
    // preserveDrawingBuffer the drawing buffer is cleared after each
    // composite, so a readback returns an empty image. Screenshotting the
    // page goes through the compositor and sees what a person sees.
    const rect = await p.evaluate((s) => {
      const r = document.querySelector(s)?.getBoundingClientRect();
      if (!r) return null;
      return {
        x: Math.max(0, Math.round(r.x)),
        y: Math.max(0, Math.round(r.y)),
        width: Math.round(Math.min(r.width, 1440 - Math.max(0, r.x))),
        height: Math.round(Math.min(r.height, 900 - Math.max(0, r.y))),
      };
    }, sel);

    let changed = -1;
    if (rect && rect.width > 20 && rect.height > 20) {
      const a = await p.screenshot({ clip: rect });
      await p.waitForTimeout(2000);
      const c = await p.screenshot({ clip: rect });
      // PNGs of identical frames are byte-identical; different frames are not.
      // Cheap, and enough to answer "did anything move".
      changed = Buffer.compare(a, c) === 0 ? 0 : Math.abs(a.length - c.length) + 1000;
    }

    record(`${name} scene is animating`, changed > 0, changed < 0 ? "probe could not find the view" : changed === 0 ? "FROZEN — two frames identical" : "frames differ");
    await p.close();
  }

  await b.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed` +
              (failed.length ? ` — FAILING: ${failed.map((f) => f.name).join(", ")}` : ""));
  process.exit(failed.length);
})();
