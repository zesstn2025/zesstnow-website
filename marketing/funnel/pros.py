# -*- coding: utf-8 -*-
"""CAs and advocates in Prayagraj, Kaushambi and Kanpur — with real numbers.

WHY NOT A LEAD DATABASE

Explorium was tried first and is the wrong tool for this, which is worth
writing down so nobody pays for it again. Filtering its Indian legal and
accounting firms returned 3,025 matches and every one in the sample sat in
Bengaluru, Delhi, Pune or Mumbai. A sole-practitioner CA in Kaushambi has no
LinkedIn company page, so a LinkedIn-derived database cannot see him — and he
is precisely the target. Paying credits for metro law firms would have bought
the opposite of what was asked for.

OpenStreetMap is the opposite trade-off and the right one here: thinner, but
every row was surveyed by a person, carries the real published phone number
rather than a routing proxy, and can be checked on a public map before anyone
is called.

TWO WAYS OF FINDING THEM, BECAUSE ONE IS NOT ENOUGH

  1. The tag. `office=lawyer`, `office=accountant`, `office=tax_advisor`,
     `office=notary` are the correct OSM tags and the mappers who use them use
     them properly.
  2. The name. Indian practices are mapped far more often as a bare
     `office=company` or with no office tag at all, but they are almost always
     NAMED for what they are — "Advocate", "Chartered Accountant", "&
     Associates", "Law Chamber", "Tax Consultant". A name regex catches the
     ones the tag misses, and in this district that is most of them.

Both are needed. Tag-only would return a handful; name-only would drag in
unrelated businesses. Rows found by name carry how they were found so a human
can discard a bad guess rather than call it.

WHY TWO BOUNDING BOXES

Kanpur is 150 km from Prayagraj. One box covering both would span most of
central UP and Overpass would refuse it, so they are fetched separately and
merged.

    python3 pros.py            fetch, classify, write ca.csv and advocates.csv
"""
import csv
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request

HERE = pathlib.Path(__file__).parent
CACHE = HERE / "osm"
CACHE.mkdir(exist_ok=True)

MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# Kaushambi (Manjhanpur) through Prayagraj, and Kanpur Nagar + Dehat.
BOXES = {
    "prayagraj_kaushambi": "25.05,81.05,25.80,82.25",
    "kanpur": "26.20,79.85,26.75,80.65",
}

# The correct tags. Few practices carry them, but the ones that do are certain.
TAGGED = ('nwr["office"~"^(lawyer|accountant|tax_advisor|notary|financial)$"]'
          '["name"]')

# The name sweep. Anchored on words an Indian practice actually puts on its
# board. "Associates" alone is too loose on its own, so it is paired below with
# a second test against the legal/accounting vocabulary before a row is kept.
NAMED = ('nwr["name"~"advocate|chartered|law |lawyer|legal|notary|'
         'tax consultant|tax advisor|income tax|associates|& co|'
         'solicitor|counsel|audit",i]')

CA_WORDS = re.compile(
    r"(chartered\s*account|\bca\b|c\.a\.|account|audit|tax|gst|income.?tax|"
    r"financial|finance|book.?keep)", re.I)
ADV_WORDS = re.compile(
    r"(advocate|adv\.|lawyer|law\b|legal|notary|solicitor|counsel|"
    r"chamber|court|litigation|vakil)", re.I)

# Names that match the loose sweep and are not what we are looking for.
NOT_US = re.compile(
    r"(law college|law university|faculty of law|police|court complex|"
    r"bar association|tehsil|collector|municipal|university|school|"
    r"hospital|medical|pharma|hotel|restaurant|dhaba)", re.I)


def fetch(selector, bbox, budget=6):
    q = f'[out:json][timeout:180];({selector}({bbox}););out center tags;'
    body = urllib.parse.urlencode({"data": q}).encode()
    for i in range(budget):
        url = MIRRORS[i % len(MIRRORS)]
        try:
            req = urllib.request.Request(
                url, data=body, headers={"User-Agent": "zesstnow-funnel/1.0"})
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            wait = 5 * (i + 1)
            print(f"      attempt {i+1} {url.split('/')[2]}: "
                  f"{type(e).__name__} {getattr(e, 'code', '')} — {wait}s",
                  flush=True)
            time.sleep(wait)
    return None


def grab(name, selector, bbox):
    dest = CACHE / f"{name}.json"
    if dest.exists():
        print(f"  {name}: cached")
        return json.loads(dest.read_text())
    print(f"  {name}: fetching…", flush=True)
    d = fetch(selector, bbox)
    if d is None:
        print(f"  {name}: FAILED")
        return {"elements": []}
    dest.write_text(json.dumps(d), encoding="utf-8")
    print(f"  {name}: {len(d['elements'])} elements", flush=True)
    time.sleep(3)
    return d


def phone_of(t):
    for k in ("phone", "contact:phone", "contact:mobile", "mobile"):
        v = t.get(k)
        if v:
            # OSM writes numbers a dozen ways; keep digits, keep the last 10.
            digits = re.sub(r"\D", "", v)
            if len(digits) >= 10:
                return "+91" + digits[-10:]
    return ""


def site_of(t):
    for k in ("website", "contact:website", "url", "contact:facebook"):
        v = t.get(k)
        if v and "facebook" not in k:
            return v.strip()
    return ""


def town_of(t):
    for k in ("addr:city", "addr:town", "addr:village", "addr:suburb"):
        if t.get(k):
            return t[k]
    return ""


def main():
    rows = {}
    for region, bbox in BOXES.items():
        print(f"\n{region}  {bbox}")
        for label, sel in (("tag", TAGGED), ("name", NAMED)):
            d = grab(f"{region}_{label}", sel, bbox)
            for e in d.get("elements", []):
                t = e.get("tags", {})
                nm = (t.get("name") or "").strip()
                if not nm or NOT_US.search(nm):
                    continue
                office = t.get("office", "")
                is_ca = office in ("accountant", "tax_advisor", "financial") \
                    or bool(CA_WORDS.search(nm))
                is_adv = office in ("lawyer", "notary") \
                    or bool(ADV_WORDS.search(nm))
                if not (is_ca or is_adv):
                    continue
                # An office tag is evidence; a name match alone is a guess and
                # is labelled as one so a human can throw it out.
                how = "OSM office tag" if office else "name match — verify"
                key = (nm.lower(), round(e.get("lat") or e.get("center", {}).get("lat", 0), 4))
                if key in rows:
                    continue
                rows[key] = dict(
                    name=nm,
                    kind=("CA / tax" if is_ca and not is_adv else
                          "Advocate" if is_adv and not is_ca else "both — check"),
                    phone=phone_of(t),
                    email=(t.get("email") or t.get("contact:email") or "").strip(),
                    website=site_of(t),
                    town=town_of(t) or region.split("_")[0],
                    region=region,
                    street=(t.get("addr:street") or "").strip(),
                    office_tag=office,
                    found_by=how,
                    osm=f"https://www.openstreetmap.org/{e['type']}/{e['id']}",
                )

    allr = list(rows.values())
    ca = [r for r in allr if r["kind"].startswith("CA") or r["kind"] == "both — check"]
    adv = [r for r in allr if r["kind"] == "Advocate" or r["kind"] == "both — check"]
    cols = ["name", "kind", "phone", "email", "website", "has_own_site",
            "town", "street", "region", "office_tag", "found_by", "osm"]

    for fn, data in (("ca.csv", ca), ("advocates.csv", adv)):
        for r in data:
            r["has_own_site"] = "yes" if r["website"] else "NO"
        with (HERE / fn).open("w", encoding="utf-8", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=cols)
            w.writeheader()
            w.writerows(sorted(data, key=lambda x: (x["region"], x["town"], x["name"])))
        withph = sum(1 for r in data if r["phone"])
        nosite = sum(1 for r in data if not r["website"])
        print(f"\n{fn}: {len(data)} rows · {withph} with a phone · "
              f"{nosite} with NO website")


if __name__ == "__main__":
    main()
