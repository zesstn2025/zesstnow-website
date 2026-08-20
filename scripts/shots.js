/**
 * Screenshot the locally mirrored sites for the portfolio.
 *
 * Chromium in this sandbox cannot use the egress proxy, so mirror.py pulls the
 * pages down with curl and these are served from localhost instead. Output is
 * JPEG — the portfolio shows these at card size, and PNG screenshots of a dark
 * gradient page run to 3 MB each.
 */
const { chromium } = require("playwright");
const path = require("path");
const OUT = process.argv[2] || ".";

const BIZ = "http://127.0.0.1:8801";
const ADV = "http://127.0.0.1:8802";

const jobs = [
  { url: `${BIZ}/`, name: "bizgstpro-home", tag: "desktop", w: 1440, h: 900 },
  { url: `${BIZ}/`, name: "bizgstpro-home", tag: "mobile", w: 390, h: 844, mobile: true },
  { url: `${BIZ}/pricing.html`, name: "bizgstpro-pricing", tag: "desktop", w: 1440, h: 900 },
  // The 12-module grid is the clearest single view of what the product does.
  { url: `${BIZ}/`, name: "bizgstpro-modules", tag: "desktop", w: 1440, h: 900, findText: "12 Powerful Modules" },
  { url: `${ADV}/`, name: "adnitinkumar-home", tag: "desktop", w: 1440, h: 900 },
  { url: `${ADV}/`, name: "adnitinkumar-home", tag: "mobile", w: 390, h: 844, mobile: true },
  { url: `${ADV}/`, name: "adnitinkumar-practice", tag: "desktop", w: 1440, h: 900, findText: "Legal Expertise" },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });

  for (const job of jobs) {
    const ctx = await browser.newContext({
      viewport: { width: job.w, height: job.h },
      deviceScaleFactor: 1.5,
      isMobile: !!job.mobile,
      hasTouch: !!job.mobile,
      userAgent: job.mobile
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : undefined,
    });
    const page = await ctx.newPage();
    await page.goto(job.url, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2500);

    // Both sites reveal content on scroll; walk the whole page once so nothing
    // stays stuck at opacity 0, then go to whatever this shot is aimed at.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.evaluate((needle) => {
      if (!needle) return window.scrollTo(0, 0);
      const el = [...document.querySelectorAll("h1,h2,h3,p,span,div")].find(
        (n) => n.children.length === 0 && n.textContent.trim().includes(needle)
      );
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90);
      else window.scrollTo(0, 0);
    }, job.findText || null);
    await page.waitForTimeout(1800);

    const file = path.join(OUT, `${job.name}-${job.tag}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 82 });
    console.log("ok", file);
    await ctx.close();
  }
  await browser.close();
})();
