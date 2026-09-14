# -*- coding: utf-8 -*-
"""Is this agency still trading, or is its website just still paid for?

THE MISTAKE THIS FILE EXISTS TO FIX

On 14 September sixteen agencies were emailed after being checked for exactly
one thing: whether their site would give up a contact address. That proves the
DNS is paid and a server answers. It does not prove anybody reads the inbox.

A dormant agency's site looks identical to a live one's. The founder moved
in-house two years ago, the domain auto-renews, the contact page still lists
hello@. Mail to it is not rejected — it is simply never read, and the day's
send looks like a send while producing nothing. Worse, it is invisible: no
bounce, no reply, indistinguishable from being ignored by a live agency. A
funnel that cannot tell those two apart cannot be improved.

WHAT ACTUALLY SIGNALS LIFE, RANKED BY WHAT IT COSTS TO FAKE

  1. A copyright year on the site. Nearly every agency site has one, and a
     stale one is the single loudest signal available — an agency that has not
     updated its own footer since 2022 is not fighting for work in 2026.
  2. Dates in the page: a blog post, a case study, a news item. A site with no
     date later than 2023 is a brochure nobody has touched.
  3. A Last-Modified header, when the server sends one.
  4. Whether the site still mentions hiring, current year campaigns, or a
     technology that did not exist three years ago.

None of these is proof. A busy two-person studio may not have touched its own
site in a year — that is the classic cobbler's-children case and it is common
among exactly the agencies we want. So this returns a SCORE and a reason, not
a verdict, and the reason is printed so a human can overrule it.

WHAT IT DELIBERATELY DOES NOT DO

It does not try to verify the mailbox by connecting to the mail server. That
is technically possible and it is how spammers validate lists; most providers
now answer everything to defeat it, so it produces false confidence, and being
seen doing it is a reputation risk against the one sending channel we have.

    python3 active.py <domain>          check one
    python3 active.py --batch           check everything in batch.py
"""
import datetime as dt
import re
import sys
import pathlib

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
from agencymail import get, host_of          # noqa: E402  (same fetch stack)

THIS_YEAR = dt.date.today().year

# © 2026 / Copyright 2026 / &copy; 2025-2026 — the last number is what counts.
COPYRIGHT = re.compile(
    r"(?:©|&copy;|\(c\)|copyright)[^0-9]{0,20}((?:19|20)\d{2})"
    r"(?:\s*[-–—]\s*((?:19|20)\d{2}))?", re.I)

# Any plausible year mentioned anywhere — blog dates, case studies, "since".
YEAR = re.compile(r"\b(20[12]\d)\b")

# Pages most likely to carry a recent date.
PATHS = ["", "/blog", "/news", "/insights", "/work", "/case-studies"]


def years_in(html):
    """Every year mentioned, capped at this one. A site claiming 2027 is a
    typo or a schedule, not evidence of life."""
    return sorted({int(y) for y in YEAR.findall(html) if int(y) <= THIS_YEAR})


def check(site):
    """Returns (score 0-100, list of reasons). Higher is more likely alive."""
    if not site.startswith("http"):
        site = "https://" + site
    reasons, best_copyright, latest_year, reachable = [], None, None, False

    for path in PATHS:
        try:
            html = get(site.rstrip("/") + path, timeout=18)
        except Exception:
            continue
        reachable = True
        for m in COPYRIGHT.finditer(html):
            # A range "2019-2026" is current; take the later end.
            y = int(m.group(2) or m.group(1))
            if y <= THIS_YEAR and (best_copyright is None or y > best_copyright):
                best_copyright = y
        ys = years_in(html)
        if ys and (latest_year is None or ys[-1] > latest_year):
            latest_year = ys[-1]
        # The home page plus one content page is enough; every extra request
        # is a second of someone else's bandwidth for a signal we already have.
        if path and best_copyright and latest_year and latest_year >= THIS_YEAR - 1:
            break

    if not reachable:
        return 0, ["site did not respond on any of %d paths" % len(PATHS)]

    score = 30
    reasons.append("site responds")

    if best_copyright is None:
        reasons.append("no copyright year found")
    elif best_copyright >= THIS_YEAR:
        score += 40
        reasons.append(f"copyright {best_copyright} — current")
    elif best_copyright == THIS_YEAR - 1:
        score += 25
        reasons.append(f"copyright {best_copyright} — last year")
    else:
        score -= 15
        reasons.append(f"copyright {best_copyright} — STALE by "
                       f"{THIS_YEAR - best_copyright} years")

    if latest_year is None:
        reasons.append("no dates on the pages checked")
    elif latest_year >= THIS_YEAR:
        score += 30
        reasons.append(f"content dated {latest_year}")
    elif latest_year == THIS_YEAR - 1:
        score += 15
        reasons.append(f"newest date {latest_year}")
    else:
        score -= 10
        reasons.append(f"newest date anywhere is {latest_year}")

    return max(0, min(100, score)), reasons


def verdict(score):
    if score >= 70:
        return "ACTIVE"
    if score >= 45:
        return "probably"
    if score >= 25:
        return "UNSURE"
    return "DORMANT?"


def main():
    if "--batch" in sys.argv:
        from batch import BATCH
        rows = []
        for b in BATCH:
            s, why = check(b["site"])
            rows.append((s, b, why))
            print(f"  {verdict(s):9} {s:3}  {b['id']}  {b['site'][:30]:30} "
                  f"{'; '.join(why)[:64]}")
        live = [r for r in rows if r[0] >= 45]
        print(f"\n{len(live)} of {len(rows)} look active (score 45+)")
        weak = [r for r in rows if r[0] < 45]
        if weak:
            print("\nNOT confident about these — do not re-mail without a look:")
            for s, b, why in weak:
                print(f"  {b['id']}  {b['name']}  ({s}) {'; '.join(why)}")
        return

    site = sys.argv[1] if len(sys.argv) > 1 else None
    if not site:
        print(__doc__)
        return
    s, why = check(site)
    print(f"{verdict(s)}  {s}/100  {'; '.join(why)}")


if __name__ == "__main__":
    main()
