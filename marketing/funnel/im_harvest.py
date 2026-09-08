# -*- coding: utf-8 -*-
"""Second source: businesses that already pay for leads and still have no site.

OSM gives real phone numbers but very few — in this district only about one
named shop in forty carries a `phone` tag. IndiaMART is the opposite trade-off:
hundreds of currently-trading businesses per town with a name, a town and a
trade, but the number shown is IndiaMART's own routing number, not the owner's.

Worth having anyway, for a reason that is not obvious: a business listed here is
already *paying somebody else* to bring it enquiries and has no website of its
own to send them to. It has agreed with our premise before we open our mouth.
Because the number is masked, these rows carry `phone_masked` and a
`source_url`, and nobody is contacted off this list until the real number has
been read off the storefront page.

Three things the site will not give up without them, all found by measuring:
`--compressed` (the body is gzip; read raw it looks like a corrupt download), a
browser User-Agent (the default gets 429), and the category slugs — the city
index renders its links in JavaScript, so the valid slugs were found by probing
candidates and keeping the 200s.
"""
import csv
import gzip
import pathlib
import re
import time
import urllib.request
import zlib
from collections import Counter

HERE = pathlib.Path(__file__).parent
DEST = HERE / "indiamart.csv"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

# Prayagraj is the hub; the rest are the districts a morning's drive covers.
# A 404 just means IndiaMART has no page for that pair — skipped, not an error.
CITIES = ["prayagraj", "allahabad", "kaushambi", "fatehpur", "pratapgarh",
          "mirzapur", "jaunpur", "bhadohi", "chitrakoot", "banda"]

# Probed, not guessed. Trades where a missing website costs money every day.
CATEGORIES = {
    "coaching-classes": "कोचिंग",
    "hospitals": "अस्पताल / क्लिनिक",
    "real-estate-agent": "प्रॉपर्टी",
    "chartered-accountant": "CA / टैक्स",
    "security-service": "सिक्योरिटी",
    "printing-services": "प्रिंटिंग",
    "wedding-planners": "वेडिंग प्लानर",
    "photography-services": "फ़ोटोग्राफ़ी",
    "catering-services": "कैटरिंग",
    "car-rental": "कार रेंटल",
    "car-dealers": "कार डीलर",
    "tent-house": "टेंट हाउस",
    "civil-contractors": "ठेकेदार",
    "cctv-camera": "CCTV",
}


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-IN,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw, enc = r.read(), r.headers.get("Content-Encoding", "")
    if enc == "gzip":
        raw = gzip.decompress(raw)
    elif enc == "deflate":
        raw = zlib.decompress(raw, -zlib.MAX_WBITS)
    return raw.decode("utf-8", "ignore")


# Pulled out by field name rather than by position, so a layout change breaks
# nothing as long as the data is still in the page.
LISTING = re.compile(
    r'"s_url":"(?P<store>https://www\.indiamart\.com/[^"]*)".{0,400}?'
    r'"CMP":"(?P<name>[^"]{2,80})".{0,60}?"c_ct":"(?P<phone>\d[\d,]*)"'
    r'.{0,600}?"city":"(?P<city>[^"]{2,40})"', re.S)

JUNK = re.compile(r"indiamart|verified|supplier|exporter", re.I)

# A category page for Prayagraj still returns a handful of Delhi and Mumbai
# sellers who ship nationally. They are not prospects for a company that sells
# on being local, and one of them in the list is enough to make a call awkward.
LOCAL = {"prayagraj", "allahabad", "kaushambi", "manjhanpur", "bharwari",
         "sirathu", "chail", "fatehpur", "pratapgarh", "mirzapur", "jaunpur",
         "bhadohi", "gyanpur", "chitrakoot", "karwi", "banda", "naini",
         "phulpur", "handia", "meja", "koraon", "shankargarh", "soraon"}



def main():
    rows, seen = [], set()
    for city in CITIES:
        hits = 0
        for cat, trade in CATEGORIES.items():
            try:
                html = fetch(f"https://dir.indiamart.com/{city}/{cat}.html")
            except Exception as e:
                if getattr(e, "code", None) != 404:
                    print(f"  {city}/{cat}: {type(e).__name__} "
                          f"{getattr(e, 'code', '')}")
                time.sleep(0.4)
                continue
            new = 0
            for m in LISTING.finditer(html):
                d = m.groupdict()
                name = d["name"].strip()
                key = name.lower()
                if key in seen or JUNK.search(name):
                    continue
                if d["city"].strip().lower() not in LOCAL:
                    continue
                seen.add(key)
                new += 1
                rows.append(dict(business=name,
                                 phone_masked=d["phone"].split(",")[0],
                                 trade=trade, town=d["city"].strip(),
                                 signal="pays_for_leads_no_site",
                                 source_url=d["store"]))
            hits += new
            if new:
                print(f"  {city}/{cat}: {new}", flush=True)
            time.sleep(1.0)
        print(f"{city}: {hits}", flush=True)

    with DEST.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["business", "phone_masked", "trade",
                                           "town", "signal", "source_url"])
        w.writeheader()
        w.writerows(rows)
    print(f"\n{len(rows)} businesses -> {DEST}")
    print(Counter(r["town"] for r in rows).most_common(15))
    print(Counter(r["trade"] for r in rows).most_common())


if __name__ == "__main__":
    main()
