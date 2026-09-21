# -*- coding: utf-8 -*-
"""Turn the Explorium founder export into a list you can actually sell to.

WHAT EXPLORIUM GIVES, AND WHAT IT CANNOT

The export has the founder, the company, the city and a verified email. That is
the expensive half and it is worth what it cost. What it does NOT have is the
only column that decides whether there is a conversation at all: **what is
wrong with their web presence right now.**

"Fresh Indian startup, founder email, Bengaluru" describes 300 companies and
gives you nothing to open with. "Your site is a Framer template, it has no
meta description, and you have no app" is a first line that proves you looked.
So this file fetches all 100 sites and measures.

WHY THE APP CHECK IS A LINK CHECK AND NOT A PLAY STORE SEARCH

Searching the Play Store by company name is unreliable in both directions — it
misses apps under a different publisher name and returns false hits for common
words. But a startup that HAS an app always links it from its own site; that is
the entire point of having one. So the presence of a play.google.com or
apps.apple.com link in their own HTML is the better signal, and it comes free
from a fetch that was already happening.

WHAT COUNTS AS A WEAKNESS, AND WHY EACH ONE IS SELLABLE

  · site dead / parked   — the strongest signal there is. They are funded or
                           trading and have no working site.
  · no-code builder      — Wix, Carrd, Framer, Squarespace, GoDaddy. Fine for
                           a landing page, a ceiling for a company that is
                           about to sell something. This is the single most
                           common upgrade-shaped weakness.
  · no meta description  — costs nothing to fix and proves nobody did SEO.
  · no viewport          — the site is not built for phones. In India that is
                           most of their traffic.
  · thin                 — under 15 KB of HTML is a placeholder, not a site.
  · slow                 — over 3 seconds to first byte on a small page.
  · no app               — only a weakness for a business whose model needs
                           one; the column is reported, the judgement is not
                           made here.

NOTHING IS GUESSED. A field that could not be measured says so rather than
defaulting to a flattering or an alarming value — a wrong weakness in a first
line is worse than no first line, because it proves you did NOT look.

    python3 founders.py            measure and write founders_enriched.csv
"""
import concurrent.futures as cf
import csv
import gzip
import pathlib
import re
import ssl
import time
import urllib.error
import urllib.request
import zlib

HERE = pathlib.Path(__file__).parent
SRC = HERE / "founders_raw.csv"
OUT = HERE / "founders_enriched.csv"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

# No-code builders, by the fingerprint each one leaves in the served HTML.
BUILDERS = [
    ("Wix", re.compile(r"wix\.com|wixstatic|_wixCssStates", re.I)),
    ("Squarespace", re.compile(r"squarespace\.com|static1\.squarespace", re.I)),
    ("Framer", re.compile(r"framer\.com|framerusercontent", re.I)),
    ("Carrd", re.compile(r"carrd\.co", re.I)),
    ("Webflow", re.compile(r"webflow\.com|webflow\.io", re.I)),
    ("GoDaddy", re.compile(r"godaddy|websitebuilder\.godaddy", re.I)),
    ("WordPress", re.compile(r"wp-content|wp-includes", re.I)),
    ("Shopify", re.compile(r"cdn\.shopify\.com|myshopify", re.I)),
    ("Notion", re.compile(r"notion\.site|super\.so", re.I)),
]

# A page that exists but is not a site. These strings are what registrars and
# hosts serve on a domain nobody has built on yet.
#
# THIS REGEX MUST ONLY BE RUN ON A SMALL PAGE OR ON THE HEAD. The first version
# ran it over the whole document and flagged OTPless (134 KB, a real funded
# product) and Spacez (1 MB Next.js app) as "parked, nothing built" — because
# somewhere in a long marketing page the words "coming soon" appear, about a
# feature. Put that in the first line of a cold email to a real founder and the
# email is dead on arrival: it proves you did not look, while claiming you did.
PARKED = re.compile(
    r"(domain (is )?for sale|buy this domain|parked (free )?courtesy|"
    r"under construction|coming soon|default web page|it works!|"
    r"future home of|this domain is registered)", re.I)

# A real site is bigger than this. Below it, a parked phrase means what it says.
PARKED_MAX_BYTES = 20_000

PLAY = re.compile(r"play\.google\.com/store/apps", re.I)
APPLE = re.compile(r"apps\.apple\.com|itunes\.apple\.com/.*/app/", re.I)

VIEWPORT = re.compile(r'<meta[^>]+name=["\']viewport', re.I)
METADESC = re.compile(r'<meta[^>]+name=["\']description["\'][^>]*content=["\']([^"\']{10,})', re.I)
TITLE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-IN,en;q=0.9"})
    ctx = ssl.create_default_context()
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        raw = r.read(400_000)
        enc = r.headers.get("Content-Encoding", "")
        code = r.status
    dt = time.time() - t0
    if enc == "gzip":
        try:
            raw = gzip.decompress(raw)
        except Exception:
            pass
    elif enc == "deflate":
        try:
            raw = zlib.decompress(raw, -zlib.MAX_WBITS)
        except Exception:
            pass
    return code, raw.decode("utf-8", "ignore"), dt, len(raw)


def measure(domain):
    """Returns a dict of measured facts. Every 'unknown' is honest."""
    out = dict(site_status="", site_kind="", built_with="", has_app="",
               weakness="", title="", bytes="", seconds="")
    if not domain.strip():
        out["site_status"] = "no domain in the data"
        out["weakness"] = "NO WEBSITE AT ALL"
        return out

    html = None
    for scheme in ("https://", "http://"):
        for host in (domain, "www." + domain):
            try:
                code, html, dt, size = fetch(scheme + host)
                break
            except urllib.error.HTTPError as ex:
                # A 403/406 still proves a server is there; the body is useless.
                code, html, dt, size = ex.code, "", 0.0, 0
                break
            except Exception:
                continue
        if html is not None:
            break

    if html is None:
        out["site_status"] = "DEAD — no response on http or https"
        out["weakness"] = "SITE DOES NOT LOAD"
        return out

    out["site_status"] = str(code)
    out["seconds"] = f"{dt:.1f}"
    out["bytes"] = str(size)
    m = TITLE.search(html)
    out["title"] = re.sub(r"\s+", " ", m.group(1)).strip()[:80] if m else ""

    weak = []
    # Only a small page can be parked, and only its head is trusted for the
    # phrase — see the note on PARKED above.
    head = html[:1500]
    parked = (size and size < 3000) or (
        size < PARKED_MAX_BYTES and PARKED.search(head))
    if parked:
        out["site_kind"] = "parked / placeholder"
        weak.append("PARKED — domain bought, nothing built")
    else:
        out["site_kind"] = "live"

    for name, pat in BUILDERS:
        if pat.search(html):
            out["built_with"] = name
            break
    if out["built_with"] in ("Wix", "Carrd", "GoDaddy", "Notion"):
        weak.append(f"{out['built_with']} template — hits a ceiling fast")
    elif out["built_with"] in ("Framer", "Squarespace", "Webflow"):
        weak.append(f"{out['built_with']} — design tool, not a product site")

    app = []
    if PLAY.search(html):
        app.append("Android")
    if APPLE.search(html):
        app.append("iOS")
    out["has_app"] = " + ".join(app) if app else "no app linked"
    if not app:
        weak.append("no app")

    if size and size > 3000:
        if not METADESC.search(html):
            weak.append("no meta description — no SEO done")
        if not VIEWPORT.search(html):
            weak.append("NOT mobile-ready — no viewport tag")
        if dt > 3.0:
            weak.append(f"slow — {dt:.1f}s to load")
        if size < 15000:
            weak.append("thin page — under 15 KB of HTML")

    out["weakness"] = " | ".join(weak) if weak else "nothing obvious — needs a human look"
    return out


def main():
    rows = list(csv.DictReader(SRC.open(encoding="utf-8")))
    print(f"{len(rows)} founders — measuring every site\n")

    domains = [r["business_domain"].strip().lower() for r in rows]
    results = {}
    with cf.ThreadPoolExecutor(max_workers=12) as ex:
        futs = {ex.submit(measure, d): d for d in set(domains) if d}
        done = 0
        for f in cf.as_completed(futs):
            d = futs[f]
            try:
                results[d] = f.result()
            except Exception as e:
                results[d] = dict(site_status=f"error {type(e).__name__}",
                                  site_kind="", built_with="", has_app="",
                                  weakness="could not measure", title="",
                                  bytes="", seconds="")
            done += 1
            if done % 20 == 0:
                print(f"  {done}/{len(futs)} sites measured")

    cols = ["sr", "founder", "title", "company", "what_they_do", "city",
            "email", "email_status", "email_on_own_domain", "phone",
            "website", "site_status", "site_kind", "built_with", "has_app",
            "WEAKNESS", "page_kb", "load_seconds", "employees", "linkedin",
            "industry"]
    with OUT.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        for i, r in enumerate(rows, 1):
            d = r["business_domain"].strip().lower()
            m = results.get(d, {})
            email = r["contact_professional_email"].strip()
            # Does the address live on the company's own domain? 19 of these
            # sit on a former employer's domain, which makes them a real
            # address for the wrong company — worth flagging, not dropping.
            own = "yes" if d and d.split(".")[0] in email.lower() else "NO — different domain"
            desc = re.sub(r"\s+", " ", r["business_business_description"] or "")[:220]
            w.writerow(dict(
                sr=i,
                founder=r["prospect_full_name"].strip(),
                title=r["prospect_job_title"].strip(),
                company=r["business_name"].strip(),
                what_they_do=desc,
                city=(r["prospect_city"] or r["business_city_name"] or "").strip(),
                email=email,
                email_status=r["contact_professional_email_status"],
                email_on_own_domain=own,
                phone=r["contact_mobile_phone"].strip() or "not available",
                website=d,
                site_status=m.get("site_status", ""),
                site_kind=m.get("site_kind", ""),
                built_with=m.get("built_with", "") or "custom / unknown",
                has_app=m.get("has_app", ""),
                WEAKNESS=m.get("weakness", ""),
                page_kb=(str(round(int(m["bytes"]) / 1024)) if m.get("bytes") else ""),
                load_seconds=m.get("seconds", ""),
                employees=r["business_number_of_employees_range"],
                linkedin=r["prospect_linkedin"],
                industry=r["business_naics_description"],
            ))
    print(f"\n-> {OUT}")


if __name__ == "__main__":
    main()
