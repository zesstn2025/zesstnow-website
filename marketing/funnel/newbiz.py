# -*- coding: utf-8 -*-
"""New Indian businesses that need a website or an app — with mobile and e-mail.

WHY THE CONTACT DETAILS DO NOT COME FROM LINKEDIN

The brief was 1,000 people with e-mail AND phone. Crustdata can sell exactly
that — and the arithmetic kills it: contact enrichment is 4 credits a head, the
account holds 197, so the honest ceiling is about 49 people. Not 1,000.

What Crustdata IS cheap at is the SEGMENT: 3 credits per 100 rows. So the
LinkedIn database is used for the half it is cheap at — finding brand-new,
small, non-technical Indian companies and their web domain — and the contact
details are read off the companies' own websites, which costs nothing.

That is not a workaround, it is the better source. A new business publishes its
owner's mobile in its own header because it WANTS to be called. Crustdata's
phone field is a third-party guess about a person; the number in the footer of
saree-shop.in is the number that gets answered.

WHY SOFTWARE COMPANIES ARE FILTERED OUT

The first 1,000 rows came back 39% "Software Development" and "IT Services".
Those are the worst possible leads here: they build websites themselves, and
several of them sell the same thing we do. The industry filter is a positive
list of trades that BUY websites — retail, apparel, clinics, restaurants,
real estate, schools, manufacturing, salons, transport.

WHAT "problem" MEANS, AND WHY IT IS A CODE AND NOT A SENTENCE

Every row carries one short code, never prose:

    NO-SITE   LinkedIn lists no domain at all
    DEAD      the domain does not resolve or does not answer
    PARKED    it answers, but with a registrar/coming-soon holding page
    BUILDER   built on a no-code host — a template anyone can spot
    THIN      under ~8 KB of markup; a single screen, not a website
    NO-HTTPS  http only, so the browser marks it "Not secure"
    OK        a real site; sell an app or a rebuild, not a first website

These are MEASURED on the live page, not guessed. A cell has to be readable at
a glance in a spreadsheet, so the reasoning lives here in the module.

    python3 newbiz.py              harvest, write NEWBIZ-leads.csv
    python3 newbiz.py --all        keep rows with only an e-mail too
"""
import concurrent.futures as cf
import csv
import gzip
import json
import pathlib
import re
import socket
import sys
import urllib.request
import zlib

HERE = pathlib.Path(__file__).parent
OUT = HERE / "NEWBIZ-leads.csv"
PAGES = sorted(pathlib.Path(
    "/root/.claude/projects/-home-user-advnitinkumar-website/"
    "4ba61bc9-9ff3-5346-80f4-3ca54a7cd7f4/tool-results"
).glob("mcp-Crustdata-crustdata_company_search_db-*.txt"))

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

# Industries that buy websites. A software house does not.
WANTED = {
    "Retail", "Retail Apparel and Fashion", "Real Estate",
    "Hospitals and Health Care", "Food and Beverage Services", "Restaurants",
    "Manufacturing", "Construction", "Wellness and Fitness Services",
    "Professional Training and Coaching", "Truck Transportation",
    "Higher Education", "Education Administration Programs", "Legal Services",
    "Accounting", "Hospitality", "Travel Arrangements", "Events Services",
    "Personal Care Product Manufacturing", "Textile Manufacturing", "Farming",
    "Furniture and Home Furnishings Manufacturing", "Motor Vehicle Manufacturing",
    "Wholesale", "Consumer Services", "Retail Groceries", "Automotive",
    "Beauty", "Interior Design", "Architecture and Planning",
    # Kept from the first, unfiltered page — these buy too, and that page is
    # already paid for.
    "Advertising Services", "Business Consulting and Services",
    "Staffing and Recruiting", "Human Resources Services", "Media Production",
    "Non-profit Organizations", "Individual and Family Services",
}
# Never pitch a website to somebody who sells websites.
BANNED = {
    "Software Development", "IT Services and IT Consulting",
    "Computer and Network Security", "Computer Games",
    "Technology, Information and Internet", "Data Infrastructure and Analytics",
    "Computer Hardware Manufacturing", "Venture Capital and Private Equity Principals",
}

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

# Known endings, longest first. `[A-Za-z]{2,}` above is greedy, so when a page
# prints "…@gmail.comCall us on 98…" with no space after the address — which is
# exactly how a LinkedIn company description reads — the match runs straight on
# and yields "@gmail.comcall". 17 of the first 1,549 rows came out that way and
# every one of them was an unusable address.
TLDS = ("com", "in", "org", "net", "io", "ai", "co", "edu", "gov", "biz",
        "info", "me", "dev", "app", "store", "shop", "online", "site", "xyz",
        "tech", "live", "life", "world", "club", "pro", "tv", "cc", "name",
        "mobi", "asia", "coffee", "email", "agency", "studio", "design",
        "digital", "solutions", "services", "company", "care", "health",
        "clinic", "farm", "foundation", "academy", "school", "institute",
        # Real endings that genuinely turned up in this harvest. They look
        # wrong and are not: .homes, .beauty and .travel are exactly the kind
        # of domain a new Indian business buys.
        "homes", "global", "beauty", "works", "art", "center", "us",
        "partners", "events", "space", "fit", "travel", "one", "id", "uk",
        "int", "ac", "co.in", "org.in", "net.in", "ac.in", "gov.in", "edu.in",
        "consulting", "ventures", "capital", "finance", "money", "tours",
        "kitchen", "food", "fashion", "media", "news", "group", "world")
_TLD_BY_LEN = tuple(sorted(TLDS, key=len, reverse=True))

# Addresses that are not addresses. The e-mail regex runs over the page text,
# and minified JavaScript is full of things shaped exactly like one:
# "house.js@0.0.ls8mc93v.mjs" and "r@k.vgv" both came out of inline scripts,
# and "xxx@xxx.xxx" is a placeholder somebody shipped. A row carrying one of
# these looks usable in a spreadsheet and is not, which is the worst kind of
# bad row — so the address is rejected and the row falls out with it.
def valid_email(e):
    """The ending carries almost all of the signal, so almost nothing else is
    judged.

    A first version of this also rejected any domain label that mixed letters
    and digits, on the theory that "0.0.ls8mc93v" is a build hash. It threw out
    6sensemedia.co.in, cloud360.com, bhk4rent.com, join2campus.com and a dozen
    more — because mixing a number into the name is completely ordinary for an
    Indian business domain. The allowlist below already rejects .mjs, .zhb,
    .anaq and .please on its own, so that rule was doing no work and a lot of
    damage. It is gone, deliberately, and must not come back.
    """
    if e.count("@") != 1:
        return False
    local, _, dom = e.partition("@")
    if len(local) < 2:
        return False
    # "xxx@xxx.xxx" is a placeholder somebody shipped. "ss@a-real-studio.com" is a
    # real person's initials — so one repeated character only disqualifies a
    # local part from three characters up.
    if len(set(local)) == 1 and len(local) >= 3:
        return False
    labels = dom.split(".")
    if len(labels) < 2 or not all(labels):
        return False
    return labels[-1] in TLDS


def clean_email(e):
    """Cut a glued-on word off the end of an address, without breaking real ones.

    Three cases have to survive, and the rules below are what separate them:
      · "info@a-real-shop.coffee"   .coffee IS a real ending  -> untouched
      · "name@gmail.comcall"        a word ran into it        -> cut to .com
      · "someone@outlook.con"    THEIR typo, not our bug   -> left alone,
        because inventing "outlook.co" would be no more correct than what
        they published and would hide the fault.
    """
    last = e.rsplit(".", 1)[-1]
    if last in TLDS:
        return e
    for t in _TLD_BY_LEN:
        if last.startswith(t):
            # Only trim on a confident signal: a 3+ character ending, or a
            # leftover long enough to be a real word rather than a typo.
            if len(t) >= 3 or len(last) - len(t) >= 2:
                return e[:len(e) - (len(last) - len(t))]
            break
    return e
TAGS = re.compile(r"<[^>]*>")
SCRIPTS = re.compile(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>")

# Separators are stripped BEFORE matching. builders.py learned this the hard
# way: a regex that allowed one separator silently lost "+91 708 122 8384",
# a real number on a page that had loaded fine. Losing a number quietly is
# worse than failing loudly.
SEP = re.compile(r"[\s\-(). –—]+")
RUN = re.compile(r"(?<!\d)(?:0|91)?([6-9]\d{9})(?!\d)")

JUNK_MAIL = re.compile(
    r"(noreply|no-reply|donotreply|example\.|sentry\.|wixpress|godaddy|"
    r"squarespace|shopify|facebook|google|gstatic|schema\.org|w3\.org|"
    r"jquery|bootstrap|cloudflare|yourdomain|domain\.com|email\.com|"
    r"sentry\.io|wordpress|elementor|wix\.com|weebly|@2x|\.(png|jpe?g|gif|"
    r"webp|svg|css|js|woff2?|ico|mp4)$)", re.I)

# Numbers printed on Indian websites that belong to nobody. 9876543210 is the
# demo number shipped with nearly every Indian theme; it reached a real
# builder's live site and was handed over as real once already.
NOT_A_MOBILE = re.compile(
    r"^(1800|1860|0000|1234|9999999999|8888888888|7777777777|6666666666|"
    r"9876543210|9999999999|1234567890|9999900000|9000000000)$")

PARKED = re.compile(
    r"(?i)(coming\s+soon|under\s+construction|site\s+is\s+being|domain\s+"
    r"is\s+for\s+sale|buy\s+this\s+domain|parked\s+(free|domain)|"
    r"default\s+web\s+site\s+page|future\s+home\s+of|account\s+suspended|"
    r"this\s+domain\s+has\s+expired|website\s+coming)")
BUILDER = re.compile(
    r"(?i)(wix\.com|_wixCssImports|squarespace|weebly|godaddy\s*(site|studio)|"
    r"dudaone|d\.pr/site|sites\.google\.com|blogspot|wordpress\.com/|"
    r"instapage|carrd\.co|mystrikingly|webnode|business\.site)")
APPLINK = re.compile(r"(?i)(play\.google\.com/store/apps|apps\.apple\.com)")


def rows_from_pages():
    """Every company row from every saved Crustdata page, de-duplicated."""
    seen, out = set(), []
    for p in PAGES:
        try:
            d = json.load(p.open())
        except Exception:
            continue
        for c in d.get("companies", []):
            ind = c.get("linkedin_industries") or []
            ind = ind[0] if isinstance(ind, list) and ind else str(ind or "")
            if ind in BANNED or ind not in WANTED:
                continue
            key = (c.get("company_name") or "").strip().lower()
            if not key or key in seen:
                continue
            seen.add(key)
            c["_industry"] = ind
            out.append(c)
    return out


def get(url, timeout=11):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-IN,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read(600_000)
        enc = r.headers.get("Content-Encoding", "")
        final = r.geturl()
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
    return raw.decode("utf-8", "ignore"), final


def contacts(html):
    """Every mobile and e-mail on the page, cleaned and de-duplicated."""
    body = SCRIPTS.sub(" ", html)
    text = TAGS.sub(" ", body)
    flat = SEP.sub("", text)
    mobiles, emails = [], []
    for n in RUN.findall(flat):
        if not NOT_A_MOBILE.match(n) and n not in mobiles:
            mobiles.append(n)
    # tel: links are the most reliable of all — they are meant to be dialled.
    for m in re.finditer(r'href=["\']tel:([^"\']+)', html, re.I):
        for n in RUN.findall(SEP.sub("", m.group(1))):
            if not NOT_A_MOBILE.match(n) and n not in mobiles:
                mobiles.insert(0, n)
    for m in re.finditer(r'href=["\']mailto:([^"\'?]+)', html, re.I):
        e = m.group(1).strip().lower()
        if EMAIL.fullmatch(e) and not JUNK_MAIL.search(e) and e not in emails:
            emails.insert(0, e)
    for e in EMAIL.findall(body):
        e = clean_email(e.lower().rstrip("."))
        if (not JUNK_MAIL.search(e) and len(e) < 70 and valid_email(e)
                and e not in emails):
            emails.append(e)
    return mobiles, emails


# Paths that exist on most small-business sites even when the home page never
# links to them in plain HTML. The first pass followed only <a href> matches and
# lost every site whose menu is built by JavaScript — which, on a Wix or Shopify
# template, is most of them. Guessing four fixed paths costs four requests and
# recovered a large share of the misses.
GUESSES = ("/contact", "/contact-us", "/about-us", "/pages/contact")


def contact_pages(base, html):
    """The site's own contact page, which is where the good number lives."""
    out, host = [], base.split("/")[2]
    want = re.compile(r"contact|reach|enquir|about|connect", re.I)
    for m in re.finditer(r'href=["\']([^"\']+)["\']', html):
        h = m.group(1)
        if h[:1] == "#" or h.lower().startswith(("mailto", "tel", "javascript")):
            continue
        if not want.search(h):
            continue
        if h.startswith("http"):
            if host not in h:
                continue
            out.append(h)
        else:
            out.append("https://" + host + "/" + h.lstrip("/"))
    out += ["https://" + host + g for g in GUESSES]
    return list(dict.fromkeys(out))[:5]


def classify(html, final_url, mobiles):
    """One short code for what is wrong with the site. Measured, not guessed."""
    if final_url.startswith("http://"):
        return "NO-HTTPS"
    if BUILDER.search(html[:60_000]):
        return "BUILDER"
    # PARKED is decided by the TITLE, or by a page small enough that a holding
    # notice is all there is.
    #
    # The previous rule also accepted a match anywhere in any page under 40 KB,
    # and on re-checking the hot leads before mailing them, three of the four
    # PARKED rows turned out to be wrong: ecofeelia.com is a full shop,
    # naviget.in says "Coming Soon" about a City Rides FEATURE, and
    # scrideed.com says it about a COURSE. All three have working sites, and a
    # mail telling their owner the site is down would have been caught in one
    # click. Only thevadaco.com, whose <title> is literally "Coming soon", was
    # real. Ordinary marketing copy says "coming soon" constantly; a title and
    # a near-empty page do not.
    title = re.search(r"(?is)<title[^>]*>(.*?)</title>", html)
    if title and PARKED.search(title.group(1)):
        return "PARKED"
    if len(html) < 12_000 and PARKED.search(html):
        return "PARKED"
    if len(html) < 8_000:
        return "THIN"
    return "OK"


def harvest(c):
    name = (c.get("company_name") or "").strip()
    dom = (c.get("company_website_domain") or "").strip().lower()
    city = (c.get("hq_location") or "").replace(", India", "").strip()
    base = dict(company=name, mobile="", email="", city=city,
                industry=c.get("_industry", ""), founded=c.get("year_founded", ""),
                website=dom, problem="", has_app="",
                linkedin=c.get("linkedin_profile_url", ""))
    if not dom or "linkedin.com" in dom or "whatsapp.com" in dom:
        base["problem"] = "NO-SITE"
        m, e = contacts(c.get("linkedin_company_description") or "")
        base["mobile"] = " / ".join("+91" + x for x in m[:3])
        base["email"] = " / ".join(e[:2])
        return base

    # Bare domain, then www., then plain http. A surprising number of small
    # Indian sites answer on only one of the three, and the first pass tried
    # two of them and wrote the other off as DEAD.
    html = final = ""
    for url in ("https://" + dom, "https://www." + dom, "http://" + dom):
        try:
            html, final = get(url)
            break
        except (socket.timeout, TimeoutError):
            continue
        except Exception:
            continue
    if not html:
        base["problem"] = "DEAD"
        # The LinkedIn description is already paid for and small businesses
        # routinely write "call us on 98xxx" straight into it. It is the only
        # contact route left once the domain is gone, and it costs nothing.
        m, e = contacts(c.get("linkedin_company_description") or "")
        base["mobile"] = " / ".join("+91" + x for x in m[:3])
        base["email"] = " / ".join(e[:2])
        return base

    mob, em = contacts(html)
    base["problem"] = classify(html, final, mob)
    base["has_app"] = "yes" if APPLINK.search(html) else "no"

    if not mob or not em:
        for u in contact_pages(final or ("https://" + dom), html):
            try:
                h2, _ = get(u)
            except Exception:
                continue
            m2, e2 = contacts(h2)
            mob = mob or m2
            em = em or e2
            if mob and em:
                break

    # Last resort, and free: the LinkedIn description we already bought.
    if not mob or not em:
        m3, e3 = contacts(c.get("linkedin_company_description") or "")
        mob = mob or m3
        em = em or e3
    # An address on the company's own domain beats a gmail found in a footer
    # widget, so it is promoted to the front rather than left to page order.
    em.sort(key=lambda x: 0 if x.endswith("@" + dom) or dom.split(".")[0] in x
            else 1)

    # Every number found, not mobiles[0]. One site printed three numbers and
    # the first one was the web developer's, not the owner's. There is no way
    # to tell them apart from the page, so the person calling decides.
    base["mobile"] = " / ".join("+91" + m for m in mob[:3])
    base["email"] = " / ".join(em[:2])
    return base


def main():
    strict = "--all" not in sys.argv
    rows = rows_from_pages()
    print(f"{len(rows)} new Indian businesses in the target industries")
    print(f"reading contact details off their own sites "
          f"({len(PAGES)} Crustdata pages)\n", flush=True)

    got = []
    with cf.ThreadPoolExecutor(max_workers=44) as ex:
        for i, r in enumerate(ex.map(harvest, rows), 1):
            got.append(r)
            if i % 100 == 0:
                ok = sum(1 for x in got if x["mobile"] and x["email"])
                print(f"  {i}/{len(rows)} · {ok} with mobile AND email",
                      flush=True)

    kept = [r for r in got if r["mobile"] and r["email"]] if strict else \
           [r for r in got if r["mobile"] or r["email"]]
    # The hottest leads first: no site at all, then broken, then weak.
    rank = {"NO-SITE": 0, "DEAD": 1, "PARKED": 2, "THIN": 3, "BUILDER": 4,
            "NO-HTTPS": 5, "OK": 6}
    kept.sort(key=lambda r: (rank.get(r["problem"], 9), r["company"].lower()))

    cols = ["company", "mobile", "email", "city", "industry", "founded",
            "website", "problem", "has_app", "linkedin"]
    with OUT.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(kept)

    print(f"\n{len(kept)} rows written, every one with a mobile"
          + ("" if strict else " or an e-mail"))
    for k in ("NO-SITE", "DEAD", "PARKED", "THIN", "BUILDER", "NO-HTTPS", "OK"):
        n = sum(1 for r in kept if r["problem"] == k)
        if n:
            print(f"    {k:9} {n}")
    noapp = sum(1 for r in kept if r["has_app"] == "no")
    print(f"  no mobile app linked anywhere: {noapp}")
    print(f"-> {OUT}")


if __name__ == "__main__":
    main()
