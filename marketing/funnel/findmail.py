# -*- coding: utf-8 -*-
"""Find real email addresses for prospects that only have a phone number.

The hard part is not finding an email. It is being sure the email belongs to
*this* shop. "Sapna Hospital" is a name a dozen towns share, and a cold mail to
the wrong one is worse than sending nothing: a stranger gets a letter about
their website, and it is the company's own address that gets reported for it.

So an address is accepted on one of two proofs, never on resemblance:

  1. the page carrying the email ALSO carries the phone number we already hold
     for that business, or
  2. the email's domain is the page's own domain AND that domain contains two
     words of the business's name (or one word, with the town named on the
     page).

Proof 2 exists because proof 1 alone is too strict — tested against a known
site, it rejected info@williamjohnspizza.com sitting on williamjohnspizza.com.
Its two-word requirement exists because one word alone was too loose: it
accepted a bookshop, sapnaonline.com, for "Sapna Hospital" in Naini.

WHAT THIS FOUND, AND WHY IT MATTERS BEFORE YOU RUN IT AGAIN

On 12 September 2026 this was run over all 23 prospects that had no email, in
two passes, opening 362 pages between them. It found **nothing**. Not one of
those businesses publishes an email anywhere reachable.

That is not a bug in this file. Those rows all carry the signal `no_site`, and
a business with no website almost never has a published address either —
Facebook sits behind a login wall, IndiaMART storefronts show no email, and
Google Maps has no such field at all.

So: run this on `no_form` and `dead_site` rows, which have their own websites
and therefore something to find. Running it on `no_site` rows is half an hour
of requests for a result already known. For those, the email column fills from
replies — ask for the address when somebody answers on WhatsApp.

    python3 findmail.py            → dry run, prints what it would accept
    python3 findmail.py --write    → writes accepted emails into pipeline.csv
"""
import base64
import csv
import gzip
import pathlib
import re
import sys
import time
import urllib.parse
import urllib.request
import zlib
from html import unescape as html_unescape

HERE = pathlib.Path(__file__).parent
PIPE = HERE / "pipeline.csv"
LOG = HERE / "outbox" / "email-hunt.csv"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

# Addresses that appear on a page without belonging to the business on it:
# platform boilerplate, tracking, template leftovers, and the file extensions
# that the naive pattern reads as domains.
JUNK = re.compile(
    r"(noreply|no-reply|donotreply|example\.|sentry\.|wixpress|godaddy|"
    r"squarespace|shopify|facebook\.com|google\.com|gstatic|schema\.org|"
    r"w3\.org|jquery|bootstrap|cloudflare|yourdomain|domain\.com|email\.com|"
    r"\.(png|jpg|jpeg|gif|webp|svg|css|js|woff2?|ico)$)", re.I)

# Pages that list many businesses at once. Our phone number appearing there
# proves nothing about which of the fifty emails on the page is the right one.
DIRECTORY = re.compile(
    r"(justdial|indiamart|sulekha|tradeindia|exportersindia|yellowpages|"
    r"aajjo|indiabizlist|grotal|infoisinfo|cybo|tupalo|nearbuy|zaubacorp)",
    re.I)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-IN,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw, enc = r.read(600_000), r.headers.get("Content-Encoding", "")
    if enc == "gzip":
        raw = gzip.decompress(raw)
    elif enc == "deflate":
        raw = zlib.decompress(raw, -zlib.MAX_WBITS)
    return raw.decode("utf-8", "ignore")


def search(query):
    """Bing. DuckDuckGo's endpoints are unreachable from here and Mojeek
    answers 403 — both measured, not assumed.

    Two things had to be learned the hard way. Organic results are wrapped in
    bing.com/ck/a?...&u=a1<base64url>, so filtering out "bing.com" discards the
    entire result set. And the first links in document order are navigation,
    not results — taking them returned pages about Alaskan weather for a query
    about an Indian phone number. Results live inside <li class="b_algo">, so
    that is what gets parsed.
    """
    try:
        html = get("https://www.bing.com/search?q=" + urllib.parse.quote(query))
    except Exception:
        return []

    urls, seen = [], set()
    for block in re.findall(r'<li class="b_algo".*?</li>', html, re.S):
        m = re.search(r'<a[^>]+href="([^"]+)"', block)
        if not m:
            continue
        u = html_unescape(m.group(1))
        if "/ck/a" in u:
            enc = urllib.parse.parse_qs(
                urllib.parse.urlparse(u).query).get("u", [""])[0]
            if not enc.startswith("a1"):
                continue
            try:
                b = enc[2:]
                u = base64.urlsafe_b64decode(
                    b + "=" * (-len(b) % 4)).decode("utf-8", "ignore")
            except Exception:
                continue
        if not u.startswith("http") or "bing.com" in u or u in seen:
            continue
        seen.add(u)
        urls.append(u)
    return urls[:8]


def phone_on_page(html, phone):
    """The number may be written 9580217260, +91 95802 17260, 095802-17260…
    Strip every non-digit from the page once and look for the ten digits."""
    return phone in re.sub(r"\D", "", html)


def emails_on_page(html):
    out = []
    for e in {m.group(0) for m in EMAIL.finditer(html)}:
        if JUNK.search(e) or len(e) > 80:
            continue
        out.append(e.lower())
    return sorted(out)


def own_domain_match(url, emails, business, town='', page=''):
    """An email whose domain is this page's own domain AND recognisably the
    business's name. Returns the address, or None.

    The name check is what stops a shared host or an agency footer from being
    read as the business's own address: the domain has to contain a real word
    from the business name, not merely be the site we happened to land on.
    """
    host = urllib.parse.urlparse(url).netloc.lower().removeprefix("www.")
    if not host:
        return None
    stem = host.split(".")[0]
    words = [w for w in re.split(r"[^a-z0-9]+", business.lower())
             if len(w) > 3 and w not in {"hotel", "clinic", "store", "shop",
                                         "centre", "center", "india", "services"}]
    hits = [w for w in words if w in stem]
    # One shared word is not identity. "Sapna Hospital" matched sapnaonline.com
    # — a bookshop — the first time this was tested, which is precisely the
    # wrong-business mail this whole file exists to prevent. Two words, or one
    # word plus the town named on the page.
    if len(hits) < 2 and not (hits and town and town.lower() in page.lower()):
        return None
    for e in emails:
        if e.split("@")[1].lower().removeprefix("www.") == host:
            return e
    return None


def hunt(row):
    """Returns (email, evidence_url) or (None, reason)."""
    phone, name, town = row["phone"], row["business"], row["town"]
    queries = [
        f'"{phone}" email',
        f'"{name}" {town} email',
    ]
    tried = set()
    for q in queries:
        for url in search(q):
            if url in tried or DIRECTORY.search(url):
                continue
            tried.add(url)
            try:
                html = get(url, timeout=18)
            except Exception:
                continue
            found = emails_on_page(html)
            if not found:
                time.sleep(0.3)
                continue
            if phone_on_page(html, phone):
                return found[0], url
            # Second proof, and it matters: a business's own domain identifies
            # it as surely as its number does. info@williamjohnspizza.com on
            # williamjohnspizza.com is that pizzeria, whether or not the page
            # happens to repeat the phone — and the phone-only rule rejected
            # exactly that case when it was tested against a known-good site.
            own = own_domain_match(url, found, name, town, html)
            if own:
                return own, url
            time.sleep(0.3)
        time.sleep(1.0)
    return None, f"{len(tried)} pages checked, none carried the number + an email"


def main():
    write = "--write" in sys.argv
    rows = list(csv.DictReader(PIPE.open(encoding="utf-8")))
    todo = [r for r in rows if not r["email"]]
    print(f"{len(todo)} rows without an email\n")

    log, hits = [], 0
    for r in todo:
        email, why = hunt(r)
        if email:
            hits += 1
            print(f"  ✓ {r['id']}  {r['business'][:32]:32} {email}")
            print(f"       proof: {why[:88]}")
            r["email"] = email
        else:
            print(f"  — {r['id']}  {r['business'][:32]:32} {why}")
        log.append(dict(id=r["id"], business=r["business"], phone=r["phone"],
                        email=email or "", evidence=why))

    print(f"\n{hits} of {len(todo)} found")

    LOG.parent.mkdir(exist_ok=True)
    with LOG.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["id", "business", "phone",
                                           "email", "evidence"])
        w.writeheader()
        w.writerows(log)
    print(f"evidence -> {LOG}")

    if write and hits:
        with PIPE.open("w", encoding="utf-8", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(rows[0]))
            w.writeheader()
            w.writerows(rows)
        print(f"pipeline.csv updated")
    elif hits:
        print("dry run — re-run with --write to save")


if __name__ == "__main__":
    main()
