# -*- coding: utf-8 -*-
"""The memory between days: who has been pitched, and who is owed a follow-up.

Without this the round has no memory at all. Tomorrow's search runs the same
queries against the same week and finds most of the same posts — and every one
of them comes back with a fresh LI0xx id, because the id is assigned when the
row is written, not by the post. So de-duplicating on the id would catch
nothing. The key has to be the thing that does not change, which is the post
itself.

LinkedIn post URLs are not stable strings either. The same post appears as
  .../posts/name_slug-words-activity-7501191314408058880-mIZY
  .../posts/name_slug-DIFFERENT-words-activity-7501191314408058880-AbCd
  .../feed/update/urn:li:activity:7501191314408058880/
because the slug is built from the post text and the trailing token varies.
The only invariant is the activity number, so that is what gets stored and
compared. For a profile or company URL, which is what a row falls back to when
there is no post link, the path itself is the key.

FOLLOW-UP IS A DATE, NOT AN INTENTION
Two touches, then stop:
  +3 days   one short nudge, never a second pitch
  +7 days   closed, and not pitched again
Both are computed on the day the row is first written, so a missed run does not
silently reset the clock — a follow-up that is four days late still shows as
due, and `closed` still arrives on day 7 rather than on day 7 of whenever we
next happened to look.

    python3 seen.py record     merge today's LEADS in (idempotent)
    python3 seen.py due        who needs a follow-up today
    python3 seen.py new <url>  1 if this post is unseen, 0 if already pitched
"""
import csv
import datetime as dt
import pathlib
import re
import sys
import zoneinfo

IST = zoneinfo.ZoneInfo("Asia/Kolkata")
HERE = pathlib.Path(__file__).parent
SEEN = HERE / "leads_seen.csv"

NUDGE_DAYS = 3
CLOSE_DAYS = 7

COLS = ["key", "id", "name", "track", "tier", "post_url", "first_pitched",
        "channel", "email", "wa", "nudge_due", "close_due", "status", "note"]

ACTIVITY = re.compile(r"(?:activity[-:]|update/urn:li:activity:)(\d{15,})")


def key(url):
    """The stable identity of a post. See the module docstring for why the
    whole URL is not it."""
    if not url:
        return ""
    m = ACTIVITY.search(url)
    if m:
        return "act:" + m.group(1)
    path = re.sub(r"^https?://(www\.)?linkedin\.com", "", url.strip())
    return "url:" + path.rstrip("/").lower()


def today():
    return dt.datetime.now(IST).date()


def load():
    if not SEEN.exists():
        return []
    rows = list(csv.DictReader(SEEN.open(encoding="utf-8")))
    # The file predates this module and has a different header. Anything
    # missing a key gets one computed now rather than being dropped — those are
    # real people who were really pitched, and forgetting them would pitch them
    # twice, which is the exact failure this file exists to prevent.
    for r in rows:
        r.setdefault("key", "")
        if not r.get("key"):
            r["key"] = key(r.get("post_url", ""))
        for c in COLS:
            r.setdefault(c, "")
        # The old header had no follow-up columns, so a migrated row would sit
        # with empty due dates and never come up in `due` — pitched once and
        # then silently dropped, which is worse than not tracking it at all.
        # The dates are derived from when it was actually pitched, so a row
        # migrated late is already overdue rather than starting its clock now.
        if r["first_pitched"] and not r["nudge_due"]:
            d = dt.date.fromisoformat(r["first_pitched"])
            r["nudge_due"] = (d + dt.timedelta(days=NUDGE_DAYS)).isoformat()
            r["close_due"] = (d + dt.timedelta(days=CLOSE_DAYS)).isoformat()
        if not r["status"]:
            r["status"] = "pitched"
    return rows


def save(rows):
    with SEEN.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLS, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def record():
    sys.path.insert(0, str(HERE))
    from leads import LEADS
    rows = load()
    have = {r["key"] for r in rows if r["key"]}
    t = today()
    added = skipped = 0
    for l in LEADS:
        k = key(l.get("li", ""))
        if not k:
            print(f"  ! {l['id']} has no post URL — cannot be de-duplicated")
            continue
        if k in have:
            skipped += 1
            continue
        have.add(k)
        added += 1
        rows.append(dict(
            key=k, id=l["id"], name=l["name"], track=l.get("track", "build"),
            tier=l["tier"], post_url=l["li"], first_pitched=t.isoformat(),
            channel=("email" if l.get("email") else
                     "whatsapp" if l.get("wa") else "linkedin"),
            email=l.get("email", ""), wa=l.get("wa", ""),
            nudge_due=(t + dt.timedelta(days=NUDGE_DAYS)).isoformat(),
            close_due=(t + dt.timedelta(days=CLOSE_DAYS)).isoformat(),
            status="pitched", note=l.get("note", "")))
    save(rows)
    print(f"{added} new, {skipped} already seen -> {SEEN} ({len(rows)} total)")


def due():
    """What today owes. `replied` and `closed` rows are never chased again."""
    rows, t = load(), today()
    nudge, close = [], []
    for r in rows:
        if r["status"] in ("replied", "closed", "won", "lost"):
            continue
        if r["close_due"] and r["close_due"] <= t.isoformat():
            close.append(r)
        elif (r["status"] == "pitched" and r["nudge_due"]
                and r["nudge_due"] <= t.isoformat()):
            nudge.append(r)

    if not nudge and not close:
        print(f"{t}: nothing due")
    for r in nudge:
        age = (t - dt.date.fromisoformat(r["first_pitched"])).days
        ch = r["email"] or r["wa"] or "LinkedIn"
        print(f"  NUDGE  {r['id']:6} {r['name'][:26]:26} {age}d  {r['track']:9} {ch}")
    for r in close:
        print(f"  CLOSE  {r['id']:6} {r['name'][:26]:26} no reply in "
              f"{CLOSE_DAYS} days — stop")
    if close:
        for r in rows:
            if r in close:
                r["status"] = "closed"
        save(rows)
        print(f"  ({len(close)} marked closed)")
    if nudge:
        for r in rows:
            if r in nudge:
                r["status"] = "nudged"
        save(rows)
        print(f"  ({len(nudge)} marked nudged — send the nudge, then it is done)")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "due"
    if cmd == "record":
        record()
    elif cmd == "due":
        due()
    elif cmd == "new":
        k = key(sys.argv[2])
        print(0 if k in {r["key"] for r in load()} else 1)
    else:
        print(__doc__)
