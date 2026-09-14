/**
 * Extract agency contact addresses using a REAL browser.
 *
 * WHY THIS EXISTS, AND WHY IT SHOULD HAVE EXISTED SOONER
 *
 * agencymail.py fetches raw HTML over HTTP. That misses every address a site
 * only writes into the page after JavaScript runs — which on a modern agency
 * site is most of them, because agencies build with Webflow, Wix, Squarespace
 * and React, and all of them assemble the contact section client-side.
 *
 * On 14 September that cost real prospects: digitopia.design,
 * appleby-creative.co.uk and guelphdigital.com all publish an address that a
 * plain fetch cannot see. The owner was asked to run a Chrome extension to
 * cover the gap, on the stated grounds that only his browser could execute
 * JavaScript. That was wrong. This container has Chromium and Playwright
 * installed and has already been used to screenshot a page. The gap was never
 * his to fill.
 *
 * WHAT IT DOES THAT THE HTTP FETCHER CANNOT
 *   · Runs the page, so client-rendered contact sections exist by the time we
 *     look at them.
 *   · Reads mailto: hrefs from the live DOM rather than from source text.
 *   · Follows the site's OWN "contact" link instead of guessing /contact,
 *     /contact-us, /get-in-touch — a guess that fails on /say-hello, /talk,
 *     /start, and every studio that thought it was being clever.
 *   · Sees text that CSS or JS assembles from fragments to defeat scrapers.
 *
 * WHAT IT DELIBERATELY KEEPS FROM THE PYTHON VERSION
 *   Only addresses on the agency's OWN domain count. An address on someone
 *   else's domain sitting on the page is a client, a partner, or a footer
 *   credit — three kinds of person we were not trying to write to.
 *
 *   node browsermail.js urls.txt out.json
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require(require('child_process')
  .execSync('npm root -g').toString().trim() + '/playwright');

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const JUNK = /(noreply|no-reply|donotreply|example\.|sentry\.|wixpress|godaddy|squarespace|shopify|facebook\.com|google\.com|gstatic|schema\.org|w3\.org|jquery|bootstrap|cloudflare|yourdomain|domain\.com|email\.com|wordpress|elementor|\.(png|jpe?g|gif|webp|svg|css|js|woff2?|ico)$)/i;

const FREEMAIL = /@(gmail|yahoo|hotmail|outlook|rediffmail|live|icloud|protonmail|aol)\./i;

// Which local-part we would rather write to. A role address is the safe choice
// for a cold first contact to a company — nobody's personal inbox is mined —
// but a named founder at a two-person studio reads as a person, not a list.
const PREFER = ['hello', 'info', 'contact', 'hi', 'team', 'studio', 'enquiries',
  'enquiry', 'inquiries', 'sales', 'newbusiness', 'business', 'connect', 'talk'];

const rank = (e) => {
  const l = e.split('@')[0].toLowerCase();
  const i = PREFER.indexOf(l);
  return i === -1 ? PREFER.length : i;
};

const root = (host) => host.toLowerCase().replace(/^www\./, '');

function keep(addr, domain) {
  const e = addr.toLowerCase().replace(/[.,;:]+$/, '');
  if (JUNK.test(e) || FREEMAIL.test(e) || e.length > 80) return null;
  const d = e.split('@')[1];
  if (d === domain || d.endsWith('.' + domain)) return e;
  return null;
}

/** Pull addresses out of a page that has finished rendering. */
async function harvest(page, domain) {
  const found = new Set();

  // mailto: from the live DOM. More reliable than text — a string in the body
  // can be an example; a mailto is something a person meant to be clickable.
  const hrefs = await page.$$eval('a[href^="mailto:"]',
    (as) => as.map((a) => a.getAttribute('href'))).catch(() => []);
  for (const h of hrefs) {
    const raw = decodeURIComponent((h || '').replace(/^mailto:/i, '').split('?')[0]).trim();
    const e = keep(raw, domain);
    if (e) found.add(e);
  }

  // Visible text. innerText rather than innerHTML so that an address split
  // across spans to defeat scrapers reads as one string, the way a human sees it.
  const text = await page.evaluate(() => document.body ? document.body.innerText : '')
    .catch(() => '');
  for (const m of text.match(EMAIL) || []) {
    const e = keep(m, domain);
    if (e) found.add(e);
  }
  return found;
}

/** The site's own contact link, which beats guessing at URL paths. */
async function contactLinks(page, domain) {
  return page.$$eval('a[href]', (as) => as.map((a) => ({
    href: a.href, text: (a.innerText || '').toLowerCase().slice(0, 40),
  }))).then((links) => {
    const want = /contact|get.?in.?touch|say.?hello|talk|reach|enquir|inquir|work.?with/i;
    const out = [];
    for (const l of links) {
      if (!l.href || !l.href.startsWith('http')) continue;
      let h;
      try { h = new URL(l.href); } catch { continue; }
      if (h.hostname.toLowerCase().replace(/^www\./, '') !== domain) continue;
      if (want.test(l.text) || want.test(h.pathname)) out.push(h.origin + h.pathname);
    }
    return [...new Set(out)].slice(0, 3);
  }).catch(() => []);
}

async function one(browser, url) {
  const domain = root(new URL(url).hostname);
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      + '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  // Images and fonts are most of the bytes and none of the addresses.
  await page.route('**/*', (r) => {
    const t = r.request().resourceType();
    return ['image', 'media', 'font'].includes(t) ? r.abort() : r.continue();
  });

  const found = new Set();
  let note = '';
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Lazy-rendered footers are where contact details usually live.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      .catch(() => {});
    await page.waitForTimeout(1800);
    for (const e of await harvest(page, domain)) found.add(e);

    if (!found.size) {
      for (const link of await contactLinks(page, domain)) {
        try {
          await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
            .catch(() => {});
          await page.waitForTimeout(1500);
          for (const e of await harvest(page, domain)) found.add(e);
          if (found.size) { note = 'from ' + link; break; }
        } catch { /* try the next candidate */ }
      }
    }
  } catch (err) {
    note = 'page error: ' + String(err).split('\n')[0].slice(0, 80);
  }
  await ctx.close();

  const all = [...found].sort((a, b) => rank(a) - rank(b) || a.length - b.length);
  return { url, domain, email: all[0] || '', all, note };
}

(async () => {
  const [listFile, outFile] = process.argv.slice(2);
  if (!listFile) { console.error('usage: node browsermail.js urls.txt [out.json]'); process.exit(1); }
  const urls = fs.readFileSync(listFile, 'utf8').split('\n')
    .map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
    .map((s) => (s.startsWith('http') ? s : 'https://' + s));

  // This container reaches the internet only through an agent proxy. Chromium
  // does not read HTTPS_PROXY from the environment the way Python's urllib
  // does, so without this every single navigation dies with
  // ERR_CONNECTION_RESET — which looks exactly like 25 agencies blocking us,
  // and was briefly read that way. The proxy terminates TLS with its own CA,
  // hence ignoreHTTPSErrors on each context.
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    ...(proxy ? { proxy: { server: proxy } } : {}),
  });
  if (!proxy) console.log('  (no HTTPS_PROXY set — going direct)');

  const results = [];
  // Three at a time. Enough to finish 25 sites in a couple of minutes, gentle
  // enough not to look like an attack from one address.
  const QUEUE = [...urls];
  const worker = async () => {
    while (QUEUE.length) {
      const u = QUEUE.shift();
      const r = await one(browser, u);
      results.push(r);
      const mark = r.email ? '✓' : '—';
      console.log(`  ${mark} ${r.domain.padEnd(30)} ${r.email || r.note || 'nothing found'}`);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  await browser.close();

  const hit = results.filter((r) => r.email).length;
  console.log(`\n${hit} of ${results.length} (${Math.round(100 * hit / results.length)}%)`);
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
    console.log(`-> ${path.resolve(outFile)}`);
  }
})();
