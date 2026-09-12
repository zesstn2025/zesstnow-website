# -*- coding: utf-8 -*-
"""Push every sitemap URL to IndexNow, so Bing and Yandex crawl on the same day.

WHAT THIS DOES AND, MORE IMPORTANTLY, WHAT IT DOES NOT

IndexNow is a push protocol: instead of waiting to be crawled, the site tells
the search engine which URLs changed. Bing, Yandex, Seznam and Naver consume it
and share submissions with each other. **Google does not participate.** Google
has said so publicly and has not changed position. So this file gets the site
into Bing and Yandex today; it does nothing whatsoever for Google rankings, and
saying otherwise would be the kind of claim this company's own pitch calls out
in other agencies.

Google needs Search Console, Search Console needs the domain verified, and
verification needs the owner's Google account. That step cannot be done from a
container and pretending it can is worse than leaving it undone.

HOW THE KEY WORKS

Ownership is proved by hosting a file at the domain root whose name is the key
and whose only content is the key:

    https://www.cognitivecapitalsuite.com/<key>.txt   →   <key>

That file lives in public/ so Next.js serves it from the root. The key is not a
secret — anyone can read it — it only proves that whoever submits URLs can also
write files to this domain. Losing it costs nothing; generate another.

A 200 or 202 means accepted, not indexed. The engines still decide.

    python3 indexnow.py            dry run — prints what it would submit
    python3 indexnow.py --submit   actually submits
"""
import json
import pathlib
import re
import sys
import urllib.request

SITE = "https://www.cognitivecapitalsuite.com"
HOST = "www.cognitivecapitalsuite.com"
SITEMAP = f"{SITE}/sitemap.xml"
ENDPOINT = "https://api.indexnow.org/indexnow"

# The key file's name IS the key. Reading it from public/ rather than repeating
# the value here means the two can never drift apart — a mismatch is rejected
# with a 403 that says nothing useful about which half is wrong.
PUBLIC = pathlib.Path(__file__).resolve().parents[2] / "public"

UA = "Mozilla/5.0 (compatible; ZesstNowIndexNow/1.0; +%s)" % SITE


def find_key():
    keys = [p for p in PUBLIC.glob("*.txt")
            if re.fullmatch(r"[0-9a-f]{8,128}", p.stem)
            and p.read_text(encoding="utf-8").strip() == p.stem]
    if not keys:
        raise SystemExit(
            f"No IndexNow key file in {PUBLIC}.\n"
            f"Create one: python3 -c \"import secrets,pathlib;"
            f"k=secrets.token_hex(16);"
            f"pathlib.Path('public/%s.txt'%k).write_text(k);print(k)\"")
    if len(keys) > 1:
        raise SystemExit(f"More than one key file: {[p.name for p in keys]}. "
                         f"Keep one — two keys means submissions silently use "
                         f"whichever sorted first.")
    return keys[0].stem


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")


def urls():
    return re.findall(r"<loc>([^<]+)</loc>", get(SITEMAP))


def check_key_is_live(key):
    """Submitting before the key file is deployed returns 403 and burns the
    submission. Checking first costs one request."""
    try:
        body = get(f"{SITE}/{key}.txt").strip()
    except Exception as e:
        return False, f"{SITE}/{key}.txt is not reachable ({e})"
    if body != key:
        return False, f"{SITE}/{key}.txt serves {body[:40]!r}, not the key"
    return True, "key file live and correct"


def submit(key, url_list):
    payload = json.dumps({
        "host": HOST, "key": key,
        "keyLocation": f"{SITE}/{key}.txt",
        "urlList": url_list,
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=payload, method="POST",
        headers={"Content-Type": "application/json; charset=utf-8",
                 "User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.read().decode("utf-8", "ignore")[:300]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "ignore")[:300]


def main():
    key = find_key()
    us = urls()
    print(f"key      {key}")
    print(f"sitemap  {len(us)} URLs")

    ok, why = check_key_is_live(key)
    print(f"keyfile  {why}")
    if not ok:
        raise SystemExit("Deploy the key file first, then re-run.")

    if "--submit" not in sys.argv:
        for u in us[:5]:
            print(f"  {u}")
        print(f"  … and {len(us) - 5} more")
        print("\ndry run — re-run with --submit to actually send")
        return

    status, body = submit(key, us)
    print(f"\nPOST {ENDPOINT} → {status}")
    if body:
        print(body)
    # 200 accepted, 202 accepted-pending-key-validation. Anything else is a
    # real failure and should not be reported as a success.
    if status in (200, 202):
        print(f"{len(us)} URLs accepted by IndexNow (Bing, Yandex, Seznam, Naver).")
        print("Accepted is not indexed — the engines still decide. "
              "Google does not use IndexNow.")
    else:
        raise SystemExit(f"IndexNow rejected the submission ({status}).")


if __name__ == "__main__":
    main()
