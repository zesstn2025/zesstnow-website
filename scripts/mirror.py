"""
Mirror a live site into a local directory so headless Chromium can screenshot it.

Chromium in this sandbox cannot use the egress proxy (every request dies with
ERR_CONNECTION_RESET before it reaches the proxy), but curl can. So: fetch with
curl, save the same-origin asset tree, and serve it from localhost instead.
"""

import os
import re
import subprocess
import sys
from urllib.parse import urljoin, urlparse

ORIGIN = sys.argv[1]
OUT = sys.argv[2]
PAGES = sys.argv[3:] or ["/"]

seen = set()


def fetch(url):
    r = subprocess.run(
        ["curl", "-sSL", "--compressed", "--max-time", "60", url],
        capture_output=True,
    )
    return r.stdout if r.returncode == 0 else None


def save(path, data):
    full = os.path.join(OUT, path.lstrip("/"))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as fh:
        fh.write(data)


def grab_assets(text, base):
    """Pull every same-origin asset the markup or CSS points at."""
    refs = set(re.findall(r'(?:src|href)="([^"]+)"', text))
    refs |= set(re.findall(r'url\(["\']?([^)"\']+)["\']?\)', text))
    refs |= set(re.findall(r'"(/_next/static/[^"]+)"', text))

    for ref in refs:
        if ref.startswith(("data:", "mailto:", "tel:", "#", "//")):
            continue
        url = urljoin(base, ref)
        if urlparse(url).netloc != urlparse(ORIGIN).netloc:
            continue
        path = urlparse(url).path
        if not re.search(r"\.(js|css|png|jpe?g|svg|webp|avif|woff2?|ico|json|webmanifest)$", path):
            continue
        if path in seen:
            continue
        seen.add(path)

        data = fetch(url)
        if data is None:
            print("  miss", path)
            continue
        save(path, data)
        # CSS and JS chunks reference further assets (fonts, images, more chunks).
        if path.endswith((".css", ".js")):
            grab_assets(data.decode("utf8", "replace"), url)


for page in PAGES:
    url = urljoin(ORIGIN, page)
    html = fetch(url)
    if html is None:
        print("FAILED", url)
        continue
    name = "index.html" if page in ("/", "") else page.strip("/") + ".html"
    save(name, html)
    print("page", name, len(html))
    grab_assets(html.decode("utf8", "replace"), url)

print("assets:", len(seen))
