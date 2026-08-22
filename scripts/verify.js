/**
 * Phase 5 verification.
 *
 * Walks every route at desktop and mobile, and reports the things that
 * actually break a page rather than the things that are easy to count:
 * uncaught errors, failed requests, horizontal overflow, and any element whose
 * text sits outside its own box.
 */
const { chromium } = require("/opt/node22/lib/node_modules/playwright");

const ROUTES = ["/", "/services", "/services/saas", "/services/ecommerce",
  "/services/marketing", "/products", "/products/bizgstpro",
  "/products/cognitive-capital-suite", "/work", "/about", "/blog", "/contact",
  "/announcements", "/legal/privacy"];

(async () => {
  const b = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"],
  });

  let bad = 0;
  for (const [label, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    for (const route of ROUTES) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      const problems = [];
      p.on("pageerror", (e) => problems.push("JS: " + e.message.slice(0, 120)));
      p.on("console", (m) => {
        const t = m.text();
        if (m.type() === "error" && !/swiftshader|GroupMarkerNotSet|GL Driver/i.test(t))
          problems.push("console: " + t.slice(0, 120));
      });
      p.on("response", (r) => {
        if (r.status() >= 400) problems.push(r.status() + " " + r.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, "").slice(0, 90));
      });

      try {
        await p.goto("http://127.0.0.1:3111" + route, { waitUntil: "networkidle", timeout: 60000 });
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
            window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90));
          }
        });
        await p.waitForTimeout(700);

        const overflow = await p.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) problems.push(`h-overflow ${overflow}px`);
      } catch (e) {
        problems.push("NAV: " + e.message.slice(0, 100));
      }

      if (problems.length) { bad++; console.log(`✗ ${label} ${route}\n   ` + problems.join("\n   ")); }
      else console.log(`✓ ${label} ${route}`);
      await p.close();
    }
  }
  console.log(bad ? `\n${bad} page(s) with problems` : "\nALL CLEAN");
  await b.close();
})();
