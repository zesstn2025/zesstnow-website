# -*- coding: utf-8 -*-
"""Pull real, named businesses around Kaushambi-Prayagraj out of OpenStreetMap.

Why OSM and not a lead database: the funnel targets shopkeepers and small traders
in a district that LinkedIn-derived data does not cover at all, and every name
here can be checked against a public map before anyone is messaged. Nothing in
this file is generated — a row exists only because somebody surveyed it.

Why per-key queries: `nwr["phone"](bbox)` has no index to start from, so Overpass
scans the whole box and the public mirrors answer 504. `shop`, `office`, `craft`
and the rest are indexed, so the same ground costs a fraction and comes back.
"""
import json
import pathlib
import time
import urllib.error
import urllib.parse
import urllib.request

OUT = pathlib.Path(__file__).with_name("osm")
OUT.mkdir(exist_ok=True)

MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# Kaushambi (Manjhanpur ~25.45,81.35) through Prayagraj (~25.44,81.85), plus the
# ring of qasbas either side that a one-hour drive covers.
BBOX = "25.05,81.05,25.80,82.25"

SELECTORS = [
    'nwr["shop"]["name"]',
    'nwr["office"]["name"]',
    'nwr["craft"]["name"]',
    'nwr["healthcare"]["name"]',
    'nwr["tourism"~"^(hotel|guest_house|motel|resort)$"]["name"]',
    'nwr["amenity"~"^(restaurant|cafe|fast_food|pharmacy|clinic|doctors|dentist|'
    'veterinary|driving_school|training|coaching)$"]["name"]',
]


def fetch(selector, attempt_budget=6):
    q = f'[out:json][timeout:120];({selector}({BBOX}););out center tags;'
    body = urllib.parse.urlencode({"data": q}).encode()
    for i in range(attempt_budget):
        url = MIRRORS[i % len(MIRRORS)]
        try:
            req = urllib.request.Request(url, data=body,
                                         headers={"User-Agent": "zesstnow-funnel/1.0"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read().decode())
        except Exception as e:                      # 504, reset, timeout alike
            wait = 5 * (i + 1)
            print(f"    attempt {i+1} on {url.split('/')[2]}: {type(e).__name__} "
                  f"{getattr(e, 'code', '')} — retry in {wait}s", flush=True)
            time.sleep(wait)
    return None


for sel in SELECTORS:
    key = sel.split('"')[1]
    dest = OUT / f"{key}.json"
    if dest.exists():
        print(f"{key}: already have {dest.stat().st_size/1024:.0f} KB")
        continue
    print(f"{key}: fetching…", flush=True)
    d = fetch(sel)
    if d is None:
        print(f"{key}: FAILED after all retries")
        continue
    dest.write_text(json.dumps(d), encoding="utf-8")
    n = len(d["elements"])
    withphone = sum(1 for e in d["elements"]
                    if e.get("tags", {}).get("phone")
                    or e.get("tags", {}).get("contact:phone"))
    print(f"{key}: {n} named, {withphone} with a phone", flush=True)
    time.sleep(3)
