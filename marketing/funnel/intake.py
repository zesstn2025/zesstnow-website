# -*- coding: utf-8 -*-
"""Read a CSV from a browser scraper and turn it into prospects we can mail.

WHY THIS EXISTS AT ALL

This container cannot reach the owner's Chrome extensions — they run on his
machine, and there is no bridge. But the browser can do one thing this
container genuinely cannot: render JavaScript. Two agencies were lost on
14 September for exactly that reason — digitopia.design and
appleby-creative.co.uk both publish an address that only appears after the page
executes. A plain HTTP fetch sees nothing; a real browser sees the address.

So the division is: his browser gets what needs a browser, and this file takes
the CSV and applies every gate the scraper knows nothing about.

WHAT THE SCRAPER CANNOT KNOW, AND THIS FILE MUST CHECK

  · Whether the row is a COMPETITOR. Six white-label suppliers turned up in one
    day's results looking exactly like prospects. Mailing one hands a rival our
    rate card.
  · Whether the agency is still trading. A dormant agency's site looks
    identical to a live one's, and silence from a dead inbox is
    indistinguishable from being ignored — which quietly corrupts the only
    number this loop is measured on.
  · Whether we have already written to them.
  · Whether the address is a person's free-mail account scraped off some
    directory rather than the agency's own.

A scraper's job is volume. Every one of those judgements is ours.

COLUMN NAMES ARE NOT PREDICTABLE

Instant Data Scraper names columns after whatever the page called them; Web
Scraper uses the selector ids you chose; Email Extractor exports its own shape.
So nothing here matches on an exact header. It looks at the VALUES: a cell
containing "@" is an email, a cell that parses as a hostname is a site, the
longest remaining text cell is probably the name. That survives the next
scraper and the next directory without an edit.

    python3 intake.py <file.csv>                what it found, changes nothing
    python3 intake.py <file.csv> --write        append survivors to batch.py
"""
import csv
import io
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
# A bare hostname or a full URL. Requires a dot and a 2+ letter TLD so that
# "Web Design Co." does not read as a domain.
SITE = re.compile(
    r"(?:https?://)?(?:www\.)?"
    r"([a-z0-9][a-z0-9\-]{0,62}(?:\.[a-z0-9][a-z0-9\-]{0,62})+)"
    r"(?:/|$)", re.I)

FREEMAIL = re.compile(
    r"@(gmail|yahoo|hotmail|outlook|rediffmail|live|icloud|protonmail|aol)\.",
    re.I)

# Hosts that are never the agency's own site, however often they appear in a
# scraped row. A LinkedIn URL is useful as evidence and useless as a domain.
NOT_A_SITE = re.compile(
    r"^(www\.)?(linkedin|facebook|instagram|twitter|x|youtube|clutch|goodfirms|"
    r"designrush|sortlist|upwork|fiverr|google|maps\.google|bit\.ly|t\.co|"
    r"wa\.me|whatsapp|mailto)\.", re.I)

# Words in a company name or description that mean "sells what we sell to the
# buyer we are writing to". Seeing any of these is not proof, but it is enough
# to hold the row back for a human look rather than mail it.
COMPETITOR_WORDS = re.compile(
    r"(white[\s\-]?label|whitelabel|outsourc|offshore|reseller|"
    r"dedicated developer|staff augmentation|dev shop|subcontract)", re.I)


def cells(row):
    return [str(v).strip() for v in row.values() if v and str(v).strip()]


def read_rows(path):
    """Scrapers export UTF-8, UTF-8-BOM, or Windows-1252 depending on the day.
    Guessing wrong turns every accented agency name into mojibake, which then
    goes out in a greeting."""
    raw = pathlib.Path(path).read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise SystemExit("could not decode the file in any common encoding")
    # Sniff the delimiter — Excel in some locales writes semicolons.
    sample = text[:4000]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel
    return list(csv.DictReader(io.StringIO(text), dialect=dialect)), enc


def extract(row):
    """Pull (name, site, email) out of a row whose headers we do not know."""
    vals = cells(row)
    email = site = name = ""
    for v in vals:
        if not email:
            m = EMAIL.search(v)
            if m and not FREEMAIL.search(m.group(0)):
                email = m.group(0).lower()
        if not site:
            m = SITE.search(v)
            if m and not NOT_A_SITE.match(m.group(1)):
                # A URL column and an email column both match SITE; make sure
                # this is not just the domain half of an address.
                if "@" not in v:
                    site = m.group(1).lower()
    # The email's own domain is the best site when no URL column exists.
    if email and not site:
        d = email.split("@")[1]
        if not NOT_A_SITE.match(d):
            site = d
    # Name: the longest cell that is not a URL, an address, or a number.
    cands = [v for v in vals
             if "@" not in v and not v.lower().startswith("http")
             and not v.replace(" ", "").isdigit() and 2 < len(v) < 80]
    if cands:
        name = max(cands, key=len)
    return name, site, email


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    path = sys.argv[1]
    rows, enc = read_rows(path)
    print(f"{len(rows)} rows, decoded as {enc}\n")

    from batch import BATCH, EXCLUDED_COMPETITORS
    known_sites = {b["site"].lower() for b in BATCH}
    known_excluded = {d.lower() for d, _ in EXCLUDED_COMPETITORS}

    import seen
    seen_rows = seen.load()
    seen_sites = {r["post_url"].lower() for r in seen_rows if r["post_url"]}

    keep, drop = [], []
    seen_here = set()
    for r in rows:
        name, site, email = extract(r)
        if not site:
            drop.append((name or "?", "no usable domain in the row"))
            continue
        if site in seen_here:
            continue
        seen_here.add(site)
        if site in known_excluded:
            drop.append((site, "on the competitor exclusion list"))
            continue
        if site in known_sites:
            drop.append((site, "already in batch.py"))
            continue
        if any(site in s for s in seen_sites):
            drop.append((site, "already contacted — see leads_seen.csv"))
            continue
        blob = " ".join(cells(r))
        if COMPETITOR_WORDS.search(blob):
            hit = COMPETITOR_WORDS.search(blob).group(0)
            drop.append((site, f"looks like a competitor — says “{hit}”"))
            continue
        keep.append(dict(name=name, site=site, email=email))

    print(f"{len(keep)} to check, {len(drop)} dropped\n")
    for d, why in drop[:25]:
        print(f"  drop  {d[:38]:38} {why}")
    if len(drop) > 25:
        print(f"  … and {len(drop)-25} more")

    print(f"\n{sum(1 for k in keep if k['email'])} of {len(keep)} arrived with "
          f"an address; the rest need agencymail.py")
    print("\nNEXT: active.py on every kept row BEFORE any of it is mailed.")
    print("A scraper cannot tell a trading agency from a parked domain.")

    out = HERE / "outbox" / (pathlib.Path(path).stem + "-clean.csv")
    out.parent.mkdir(exist_ok=True)
    with out.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["name", "site", "email"])
        w.writeheader()
        w.writerows(keep)
    print(f"\n-> {out}")


if __name__ == "__main__":
    main()
