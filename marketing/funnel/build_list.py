# -*- coding: utf-8 -*-
"""Turn the OSM harvest into pipeline rows, with the signal already measured.

The funnel's whole list-building rule is that a name earns its place by carrying
a *signal* — a reason this particular business would benefit, visible before
anyone is contacted. Three signals, in the order they are worth calling:

  no_site    the business has a phone and no website at all
  dead_site  it has a website that does not answer
  no_form    the site answers but has no way to enquire from it

`no_site` is decided by the map data. The other two require actually fetching
the site, which is done here rather than guessed — a site that was dead a year
ago may be fine today, and opening a call with a wrong claim ends it.

A row is written only if it has a name, a phone, and a signal. No phone means no
way to follow up, and the funnel's whole cadence is built on the follow-up.
"""
import csv
import json
import math
import pathlib
import re
import ssl
import urllib.error
import urllib.request

HERE = pathlib.Path(__file__).parent
OSM = HERE / "osm"
DEST = HERE / "prospects.csv"

# Chains and institutions. A branch manager cannot buy a website, and a bank or
# a government hospital is not a prospect however good the row looks.
SKIP = re.compile(
    r"state bank|punjab national|bank of |icici|hdfc|axis bank|union bank|canara|"
    r"indian bank|bank of baroda|kotak|yes bank|idbi|post office|kfc|domino|"
    r"pizza hut|mcdonald|subway|cafe coffee day|reliance |vodafone|airtel|jio|"
    r"life insurance corporation|lic |railway|police|municipal|nagar palika|"
    r"government|govt|district hospital|medical college|university|patanjali|"
    r"amul |dell |samsung |vivo |oppo |realme |xiaomi|mi store|lenovo|hp world|"
    r"^madame$|by the park|the park |vidyut|upkendra|bijli|jal nigam|tehsil|"
    r"collectorate|^seo |seo services|digital marketing|web design|software sol",
    re.I)

# Some rows are disqualified by what they *are*, not by what they are called.
# A substation and a tehsil office both look like ordinary named POIs.
SKIP_TAGS = {
    ("office", "government"), ("office", "administrative"),
    ("office", "political_party"), ("office", "ngo"),
    ("amenity", "townhall"), ("amenity", "courthouse"),
    ("amenity", "police"), ("amenity", "fire_station"),
    ("amenity", "school"), ("amenity", "college"), ("amenity", "university"),
    ("power", "substation"), ("office", "telecommunication"),
}

# OSM spells the city several ways and both of its names; the pipeline should
# not treat them as different towns when the day's route is planned.
TOWN_FIX = {
    "pryagraj": "Prayagraj", "allahabad": "Prayagraj", "prayagraj": "Prayagraj",
    "civil lines": "Prayagraj", "allahpur": "Prayagraj", "naini": "Naini",
    "chheoki": "Naini", "kharkauni": "Kaushambi", "manjhanpur": "Kaushambi",
}

TRADE = {
    "clothes": "कपड़े", "general": "जनरल स्टोर", "convenience": "किराना",
    "hardware": "हार्डवेयर", "electronics": "इलेक्ट्रॉनिक्स", "mobile_phone": "मोबाइल",
    "computer": "कंप्यूटर", "furniture": "फ़र्नीचर", "jewelry": "ज्वेलरी",
    "shoes": "जूते", "bakery": "बेकरी", "sweets": "मिठाई", "confectionery": "मिठाई",
    "car_repair": "गैराज", "motorcycle": "बाइक", "car": "कार", "tyres": "टायर",
    "paint": "पेंट", "electrical": "इलेक्ट्रिकल", "stationery": "स्टेशनरी",
    "books": "बुक्स", "optician": "चश्मा", "chemist": "मेडिकल", "beauty": "ब्यूटी",
    "hairdresser": "सैलून", "tailor": "टेलर", "photo": "फ़ोटो", "florist": "फूल",
    "agrarian": "कृषि", "doityourself": "बिल्डिंग मटीरियल", "supermarket": "सुपरमार्केट",
    "restaurant": "रेस्टोरेंट", "cafe": "कैफ़े", "fast_food": "फ़ास्ट फ़ूड",
    "pharmacy": "मेडिकल", "clinic": "क्लिनिक", "doctors": "डॉक्टर",
    "dentist": "डेंटिस्ट", "veterinary": "पशु चिकित्सा",
    "driving_school": "ड्राइविंग स्कूल", "training": "कोचिंग", "coaching": "कोचिंग",
    "hotel": "होटल", "guest_house": "गेस्ट हाउस", "resort": "रिज़ॉर्ट",
    "estate_agent": "प्रॉपर्टी", "insurance": "बीमा", "travel_agent": "ट्रैवल",
    "lawyer": "वकील", "accountant": "अकाउंटेंट", "financial": "फ़ाइनेंस",
    "educational_institution": "कोचिंग", "company": "कंपनी",
    "bed": "गद्दे/फ़ोम", "dairy": "डेयरी", "hospital": "अस्पताल",
    "cosmetics": "कॉस्मेटिक्स", "travel_agency": "ट्रैवल",
    "financial_advisor": "फ़ाइनेंस", "laboratory": "लैब", "yes": "अन्य",
    "butcher": "मीट", "greengrocer": "सब्ज़ी", "seafood": "मछली",
    "variety_store": "जनरल स्टोर", "department_store": "डिपार्टमेंट स्टोर",
    "gift": "गिफ़्ट", "toys": "खिलौने", "sports": "स्पोर्ट्स",
    "music": "म्यूज़िक", "watches": "घड़ी", "bag": "बैग", "fabric": "कपड़ा",
    "boutique": "बुटीक", "carpet": "कारपेट", "curtain": "पर्दे",
    "kitchen": "किचन", "trade": "ट्रेडिंग", "wholesale": "थोक",
}

CTX = ssl.create_default_context()


def norm_phone(raw):
    """+91 98xxxxxxxx → 98xxxxxxxx. Anything that is not a reachable Indian
    mobile or landline is dropped rather than guessed at."""
    d = re.sub(r"\D", "", raw.split(";")[0])
    if d.startswith("91") and len(d) == 12:
        d = d[2:]
    if d.startswith("0"):
        d = d[1:]
    if len(d) == 10 and d[0] in "6789":
        return d                       # mobile
    if 8 <= len(d) <= 11:
        return d                       # landline, still callable
    return ""


def check_site(url):
    """Returns one of: '', 'dead_site', 'no_form'. Empty means the site is fine
    and the business is not a prospect on this signal."""
    if not url.startswith("http"):
        url = "http://" + url
    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "Mozilla/5.0 (compatible; site-check/1.0)"})
        with urllib.request.urlopen(req, timeout=12, context=CTX) as r:
            if r.status >= 400:
                return "dead_site"
            html = r.read(400_000).decode("utf-8", "ignore").lower()
    except Exception:
        return "dead_site"
    if "<form" in html or "mailto:" in html or "wa.me" in html or "api.whatsapp" in html:
        return ""
    return "no_form"


def haversine(a, b, c, d):
    return 2 * 6371 * math.asin(math.sqrt(
        math.sin((c - a) * math.pi / 360) ** 2
        + math.cos(a * math.pi / 180) * math.cos(c * math.pi / 180)
        * math.sin((d - b) * math.pi / 360) ** 2))


def load_places():
    f = OSM / "place.json"
    if not f.exists():
        return []
    return [(e["tags"]["name"], e.get("lat") or e["center"]["lat"],
             e.get("lon") or e["center"]["lon"])
            for e in json.load(f.open(encoding="utf-8"))["elements"]
            if e.get("tags", {}).get("name")]


def main():
    places = load_places()
    rows, seen = [], set()

    for f in sorted(OSM.glob("*.json")):
        if f.name == "place.json":
            continue
        for e in json.load(f.open(encoding="utf-8"))["elements"]:
            t = e.get("tags", {})
            name = (t.get("name") or "").strip()
            if not name or SKIP.search(name):
                continue
            if any(t.get(k) == v for k, v in SKIP_TAGS):
                continue
            phone = norm_phone(t.get("phone") or t.get("contact:phone") or "")
            if not phone:
                continue
            key = (name.lower(), phone)
            if key in seen:
                continue

            site = t.get("website") or t.get("contact:website") or t.get("url") or ""
            signal = "no_site" if not site else check_site(site)
            if not signal:
                continue

            lat = e.get("lat") or e.get("center", {}).get("lat")
            lon = e.get("lon") or e.get("center", {}).get("lon")
            town = (t.get("addr:city") or t.get("addr:village")
                    or t.get("addr:town") or "")
            if not town and places and lat:
                town = min(places, key=lambda p: haversine(lat, lon, p[1], p[2]))[0]
            town = TOWN_FIX.get(town.strip().lower(), town.strip())

            kind = (t.get("shop") or t.get("amenity") or t.get("office")
                    or t.get("craft") or t.get("healthcare") or t.get("tourism") or "")
            seen.add(key)
            rows.append(dict(business=name, phone=phone,
                             email=t.get("email") or t.get("contact:email") or "",
                             trade=TRADE.get(kind, kind or "अन्य"),
                             town=town or "?", signal=signal, site=site,
                             lat=round(lat, 5) if lat else "",
                             lon=round(lon, 5) if lon else ""))

    order = {"no_site": 0, "no_form": 1, "dead_site": 2}
    rows.sort(key=lambda r: (order[r["signal"]], r["town"], r["business"]))
    with DEST.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]) if rows else
                           ["business", "phone", "email", "trade", "town",
                            "signal", "site", "lat", "lon"])
        w.writeheader()
        w.writerows(rows)

    print(f"{len(rows)} prospects -> {DEST}")
    for s in order:
        print(f"  {s:10} {sum(1 for r in rows if r['signal'] == s)}")
    from collections import Counter
    print("  towns:", Counter(r["town"] for r in rows).most_common(12))


if __name__ == "__main__":
    main()
