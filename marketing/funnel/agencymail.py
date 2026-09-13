# -*- coding: utf-8 -*-
"""Find the email address of a web agency. Not the same problem as findmail.py.

findmail.py hunts shopkeepers, and everything hard about that is proving the
address belongs to THIS shop — "Sapna Hospital" is a name a dozen towns share,
so it accepts an address only on the evidence of a matching phone number or a
two-word domain match. Careful, slow, and mostly it finds nothing.

An agency is the opposite problem in almost every respect:

  · It HAS a website. That is the business it is in. A web agency without a
    site is not a lead, it is a red flag.
  · The site has a /contact page with a real address on it, because the
    agency's own lead generation depends on that address working.
  · The name is usually distinctive — "3i Web Experts" is not "Sapna".
  · The address is almost always info@ / hello@ / contact@ on their own
    domain, and an address on the agency's own domain IS the agency. There is
    no wrong-Sapna problem to solve.

So the work is not verification, it is FINDING THE DOMAIN. Once the domain is
right the address is trivial, and getting the domain right is what this file
spends its effort on.

The bar that still has to be met: the address must live on the agency's own
domain, and the domain has to be reachable from the LinkedIn page or match the
agency name. A gmail.com address scraped off a directory is rejected — not
because it is wrong, but because we cannot tell whose it is, which is the same
reason findmail.py exists.

WHY THIS MATTERS MORE THAN FINDING MORE AGENCIES
Email is the only channel that actually sends from this container. On
12 September the agency round found seven agencies and could email three —
43%. The search was not the bottleneck; the address was. Doubling coverage
doubles the day's real output without finding a single extra agency.

    python3 agencymail.py                      one agency, from its site
    python3 agencymail.py --from-leads         fill in every partner row
    python3 agencymail.py --from-leads --write save them into leads.py
"""
import pathlib
import re
import sys
import urllib.parse
import urllib.request
import gzip
import zlib

HERE = pathlib.Path(__file__).parent

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

# Pages an agency puts its address on, in the order worth trying. /contact
# first because that is where the address is meant to be found; the home page
# often carries only a form.
PATHS = ["/contact", "/contact-us", "/contact.html", "/about", "/about-us",
         "", "/get-in-touch", "/reach-us"]

# Boilerplate that looks like an address and is not the agency's.
JUNK = re.compile(
    r"(noreply|no-reply|donotreply|example\.|sentry\.|wixpress|godaddy|"
    r"squarespace|shopify|facebook\.com|google\.com|gstatic|schema\.org|"
    r"w3\.org|jquery|bootstrap|cloudflare|yourdomain|domain\.com|email\.com|"
    r"sentry\.io|wordpress|elementor|\.(png|jpg|jpeg|gif|webp|svg|css|js|"
    r"woff2?|ico)$)", re.I)

# A free-mail address cannot be attributed to a company. It may well be the
# right person, but there is no way to prove it from the page, and a cold mail
# to the wrong person is the thing this whole funnel is built to avoid.
FREEMAIL = re.compile(
    r"@(gmail|yahoo|hotmail|outlook|rediffmail|live|icloud|protonmail|aol)\.",
    re.I)

# Ranked: which local-part we would rather write to. A named person beats a
# role address for a reply rate, but a role address is safer for a cold first
# contact to a company — nobody's personal inbox is being mined.
PREFER = ["info", "hello", "contact", "sales", "business", "enquiry",
          "enquiries", "inquiry", "team", "connect", "hi", "support"]


def get(url, timeout=20):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-IN,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw, enc = r.read(500_000), r.headers.get("Content-Encoding", "")
    if enc == "gzip":
        raw = gzip.decompress(raw)
    elif enc == "deflate":
        raw = zlib.decompress(raw, -zlib.MAX_WBITS)
    return raw.decode("utf-8", "ignore")


def host_of(url):
    return urllib.parse.urlparse(url).netloc.lower().removeprefix("www.")


def cf_decode(html):
    """Decode Cloudflare's email obfuscation.

    Web agencies sit behind Cloudflare more than most businesses do — it is
    their own trade — and Cloudflare rewrites every mailto into
    `data-cfemail="<hex>"`, leaving no @ anywhere in the markup. A plain regex
    sweep then reports "no address" on a page whose contact address is right
    there, which is exactly what happened to krishaweb.com on the first run of
    this file.

    The encoding is not a secret and is meant to be reversed by the browser:
    the first byte is the XOR key, every following byte is a character of the
    address XORed with it.
    """
    out = []
    for hexs in re.findall(r'data-cfemail="([0-9a-fA-F]+)"', html):
        try:
            b = bytes.fromhex(hexs)
            key = b[0]
            out.append("".join(chr(c ^ key) for c in b[1:]))
        except Exception:
            continue
    return out


def emails_on(html, domain):
    """Only addresses on the agency's OWN domain. An address on someone else's
    domain sitting on this page is a partner, a client, or a footer credit —
    all three are somebody we were not trying to write to."""
    out = set()
    for m in EMAIL.finditer(html):
        e = m.group(0).lower().rstrip(".")
        if JUNK.search(e) or FREEMAIL.search(e) or len(e) > 80:
            continue
        d = e.split("@")[1]
        if d == domain or d.endswith("." + domain):
            out.add(e)
    # Cloudflare-obfuscated addresses, decoded back into the same funnel and
    # held to the same own-domain rule as everything else.
    for e in cf_decode(html):
        e = e.lower().strip().rstrip(".")
        if EMAIL.fullmatch(e) and not JUNK.search(e) and not FREEMAIL.search(e):
            d = e.split("@")[1]
            if d == domain or d.endswith("." + domain):
                out.add(e)
    # mailto: links are more reliable than loose text — a string in the page
    # body can be an example; a mailto is something a human meant to be clicked.
    for m in re.finditer(r'mailto:([^"\'?>\s]+)', html, re.I):
        e = urllib.parse.unquote(m.group(1)).lower().strip().rstrip(".")
        if EMAIL.fullmatch(e) and not JUNK.search(e) and not FREEMAIL.search(e):
            d = e.split("@")[1]
            if d == domain or d.endswith("." + domain):
                out.add(e)
    return out


def rank(e):
    local = e.split("@")[0].lower()
    return PREFER.index(local) if local in PREFER else len(PREFER)


def from_site(site, verbose=True):
    """Walk an agency's own site for its address. Returns (email, page) or
    (None, reason)."""
    if not site.startswith("http"):
        site = "https://" + site
    domain = host_of(site)
    if not domain:
        return None, "no domain"
    tried, found = [], {}
    for path in PATHS:
        url = site.rstrip("/") + path
        try:
            html = get(url)
        except Exception as ex:
            tried.append(f"{path or '/'} ({type(ex).__name__})")
            continue
        tried.append(path or "/")
        hits = emails_on(html, domain)
        for e in hits:
            found.setdefault(e, url)
        if found:
            # Stop at the first page that yields anything. /contact is first
            # in PATHS precisely so the best page is also the cheapest.
            break
    if not found:
        return None, f"no own-domain address on {len(tried)} pages: {', '.join(tried[:6])}"
    best = sorted(found, key=lambda e: (rank(e), len(e)))[0]
    return best, found[best]


def main():
    if "--from-leads" in sys.argv:
        sys.path.insert(0, str(HERE))
        from leads import LEADS
        rows = [l for l in LEADS
                if l.get("track") == "partner" and not l.get("email")]
        print(f"{len(rows)} partner rows without an email\n")
        got = {}
        for l in rows:
            site = l.get("site") or ""
            if not site:
                print(f"  — {l['id']}  {l['name'][:28]:28} no site on the row "
                      f"— add `site=` and re-run")
                continue
            e, why = from_site(site)
            if e:
                got[l["id"]] = e
                print(f"  ✓ {l['id']}  {l['name'][:28]:28} {e}")
                print(f"       found on {why}")
            else:
                print(f"  — {l['id']}  {l['name'][:28]:28} {why}")
        print(f"\n{len(got)} of {len(rows)} found")
        if "--write" in sys.argv and got:
            src = (HERE / "leads.py").read_text(encoding="utf-8")
            for lid, e in got.items():
                # Only fills an email that is currently empty; never overwrites
                # an address somebody already verified by hand.
                src = re.sub(rf'(id="{lid}".*?)email=""', rf'\1email="{e}"',
                             src, count=1, flags=re.S)
            (HERE / "leads.py").write_text(src, encoding="utf-8")
            print(f"leads.py updated with {len(got)} addresses")
        elif got:
            print("dry run — re-run with --write to save")
        return

    site = sys.argv[1] if len(sys.argv) > 1 else None
    if not site:
        print(__doc__)
        return
    e, why = from_site(site)
    print(f"{e or '—'}   {why}")


if __name__ == "__main__":
    main()
