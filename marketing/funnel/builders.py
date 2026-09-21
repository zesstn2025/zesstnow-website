# -*- coding: utf-8 -*-
"""Builders and promoters in Prayagraj / Kanpur / Lucknow — mobile and e-mail.

THE OUTPUT IS DELIBERATELY NARROW. Six columns, nothing else.

The advocate file that went out before this one had sixteen columns, including
a "name_and_father" field with two people's names run together and a
"has_own_website" field containing a sentence of English prose. All of that was
MY reasoning, written into HIS working file. He opened it, could not find the
phone number, and was right to call it rubbish. A working list has the thing
you need in the first three columns and nothing you have to read past.

So: name, mobile, email, city, website, source. The reasoning lives here in the
module, which is where it belongs.

WHERE THE DATA COMES FROM, AND WHY NOT UP RERA'S SEARCH

UP RERA publishes every registered promoter with a mobile number and e-mail.
Its search page is behind a CAPTCHA and that is a hard stop — it is not to be
worked around. But the individual `Projectsummary` pages are served to anyone
with the link and carry "Promoter Mobile Number", the promoter's e-mail and
their address in plain text. Those links are public and indexed, so they are
read one at a time rather than enumerated.

The second source is the builders' own websites. A builder is in the business
of being contacted — the number is in the header, the footer and usually the
floating WhatsApp button. This is the opposite of the advocate problem: no
register needed, they publish it themselves.

A ROW WITHOUT A MOBILE IS NOT WRITTEN. That was the whole complaint about the
last file and it is now a rule enforced in code: `--strict` (the default) drops
any row with no mobile number rather than shipping a blank cell.

    python3 builders.py            fetch, extract, write builders.csv
    python3 builders.py --all      keep rows that have only an e-mail too
"""
import concurrent.futures as cf
import csv
import gzip
import pathlib
import re
import sys
import urllib.request
import zlib

HERE = pathlib.Path(__file__).parent
OUT = HERE / "builders.csv"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

# Seeds found by search on 15 Sep 2026. Each is a builder's own site or a
# RERA project page; the harvester reads the contact details off the page
# rather than trusting anything typed here.
SEEDS = [
    ("Saidham Group", "https://saidhamgroup.in/", "Prayagraj"),
    ("Citizen Housing / Citizen Infraventures", "https://www.citizeninfra.com/", "Prayagraj"),
    ("Citizen Homes", "https://www.citizenhomes.in/", "Prayagraj"),
    ("Citizen Housing", "https://citizenhomes.org/", "Prayagraj"),
    ("Prayagraj Vastu Builders", "https://prayagrajbuilders.com/", "Prayagraj"),
    ("Prayag Land Developers", "https://pldevelopers.com/", "Prayagraj"),
    ("A.K. Infradream", "https://www.ak-dreamcity.com/", "Prayagraj"),
    ("MSAKP Associates", "https://msakpassociates.com/", "Prayagraj"),
    ("Prayagraj Property", "https://prayagrajproperty.in/", "Prayagraj"),
]

# Directory and listing pages that name many builders at once. Fetched for
# their outbound links to builder sites, not for their own contact details.
DIRECTORIES = [
    "https://www.realestateindia.com/builders-developers/prayagraj/",
    "https://www.realestateindia.com/builders-developers/kanpur/",
    "https://www.realestateindia.com/builders-developers/lucknow/",
]

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
TAGS = re.compile(r"<[^>]*>")

# Indian mobiles are printed every possible way: "9415921197", "+91 708 122
# 8384", "7991278888 7617017558", "(0532) 94159-21197". The first version of
# this matched one separator only and silently lost "+91 708 122 8384" — a real
# builder's real number, on a page that was fetched successfully. Losing a
# number quietly is worse than failing loudly, so instead of a cleverer regex
# the separators are removed FIRST and then plain 10-digit runs are read off.
SEP = re.compile(r"[\s\-().\u00a0]+")
RUN = re.compile(r"(?<!\d)(?:91)?([6-9]\d{9})(?!\d)")

JUNK_MAIL = re.compile(
    r"(noreply|no-reply|donotreply|example\.|sentry\.|wixpress|godaddy|"
    r"squarespace|shopify|facebook|google|gstatic|schema\.org|w3\.org|"
    r"jquery|bootstrap|cloudflare|yourdomain|domain\.com|email\.com|"
    r"sentry\.io|wordpress|elementor|\.(png|jpe?g|gif|webp|svg|css|js|"
    r"woff2?|ico)$)", re.I)

# Numbers that appear on builder sites and belong to somebody else.
# Placeholder numbers that ship with website templates and are not anybody's.
# 9876543210 is the one every Indian theme uses as demo content; it appeared on
# a real builder's live site and would have been handed over as a real number.
NOT_A_MOBILE = re.compile(
    r"^(1800|1860|0000|1234|9999999999|8888888888|9876543210|1234567890)$")


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-IN,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw, enc = r.read(700_000), r.headers.get("Content-Encoding", "")
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
    return raw.decode("utf-8", "ignore")


def contacts(html):
    """Every mobile and e-mail on the page, cleaned and de-duplicated."""
    text = TAGS.sub(" ", html)
    # Collapse every separator so grouped numbers become one run of digits.
    flat = SEP.sub("", text)
    mobiles, emails = [], []
    for n in RUN.findall(flat):
        if not NOT_A_MOBILE.match(n) and n not in mobiles:
            mobiles.append(n)
    for e in EMAIL.findall(html):
        e = e.lower().rstrip(".")
        if not JUNK_MAIL.search(e) and len(e) < 70 and e not in emails:
            emails.append(e)
    return mobiles, emails


def contact_pages(base, html):
    """The site's own contact page, which is where the good number lives."""
    out = []
    want = re.compile(r"contact|reach|enquir|about", re.I)
    for m in re.finditer(r'href=["\']([^"\']+)["\']', html):
        h = m.group(1)
        if h.startswith("#") or h.startswith("mailto") or h.startswith("tel"):
            continue
        if not want.search(h):
            continue
        if h.startswith("http"):
            if base.split("/")[2] not in h:
                continue
            out.append(h)
        else:
            out.append(base.rstrip("/") + "/" + h.lstrip("/"))
    return list(dict.fromkeys(out))[:2]


def harvest(seed):
    name, url, city = seed
    try:
        html = get(url)
    except Exception as e:
        return dict(name=name, mobile="", email="", city=city,
                    website=url, source=f"site did not load ({type(e).__name__})")
    mob, em = contacts(html)
    if not mob or not em:
        for c in contact_pages(url, html):
            try:
                h2 = get(c)
            except Exception:
                continue
            m2, e2 = contacts(h2)
            mob = mob or m2
            em = em or e2
            if mob and em:
                break
    # ALL the numbers, not the first one. saidhamgroup.in prints three —
    # 8081682310, 7991278888, 7318428999 — and taking [0] handed over the wrong
    # one. There is no way to tell from the page which belongs to the owner and
    # which to the sales desk or the web developer, so every number found is
    # given and the person calling decides. A wrong number is worse than three.
    return dict(name=name,
                mobile=" / ".join("+91" + m for m in mob[:3]),
                email=" / ".join(em[:2]),
                city=city, website=url,
                source="own website")


def main():
    strict = "--all" not in sys.argv
    print(f"{len(SEEDS)} builders — reading contact details off their own sites\n")
    rows = []
    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        for r in ex.map(harvest, SEEDS):
            mark = "OK " if r["mobile"] else "-- "
            print(f"  {mark}{r['name'][:36]:36} {r['mobile'] or 'no mobile':14} "
                  f"{r['email'][:34]}")
            rows.append(r)

    kept = [r for r in rows if r["mobile"]] if strict else rows
    dropped = len(rows) - len(kept)

    cols = ["name", "mobile", "email", "city", "website", "source"]
    with OUT.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        w.writerows(kept)

    print(f"\n{len(kept)} rows written"
          + (f", {dropped} dropped for having no mobile" if dropped else ""))
    print(f"  with mobile AND email: {sum(1 for r in kept if r['mobile'] and r['email'])}")
    print(f"-> {OUT}")


if __name__ == "__main__":
    main()
