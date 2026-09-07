# -*- coding: utf-8 -*-
"""Freeze the whole posting plan into one static JSON on the company's site.

The daily Routine fires a session that starts from nothing: no repository, no
Python, no memory of this conversation. Making that session clone a repo and run
a script to work out what to post is three things that can break before a single
post goes out. So it fetches one URL instead.

Two shapes, because the two halves of the day rotate differently:

  `weekday`  — the video posts. Monday's Reel is always Monday's Reel, so these
               are keyed by weekday and are fully baked.

  `services` — the Google Business post. A different service every day on a
               25-long cycle, so this is a list plus the rule for indexing into
               it. Baking a single day's card into the file would freeze the
               rotation on whatever date the file happened to be generated.

    python3 makeplan.py   →  ../zesstnow-website/public/reels/plan.json
"""
import datetime as dt
import json
import pathlib

from post import CYCLE_EPOCH, plan, service_post
from servicecards import CARDS

DEST = pathlib.Path("/home/user/zesstnow-website/public/reels/plan.json")

DAYS = ["monday", "tuesday", "wednesday", "thursday",
        "friday", "saturday", "sunday"]

doc = {
    "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
    "company": "Zesst Now Services Private Limited",
    "timezone": "Asia/Kolkata",

    "how_to_use": {
        "1": ("Work out today's date in Asia/Kolkata. If it is Sunday, post "
              "nothing and stop."),
        "2": ("Google Business, 08:00 IST. Count posting days since "
              "`services.epoch`: full weeks since then x 6, plus however many "
              "days into the current week (capped at 6). Take that number "
              "modulo the length of `services.rotation`. Post that entry. It "
              "is a different service every day and it never repeats inside a "
              "month."),
        "3": ("The video posts, from 19:00 IST. Look up today's weekday under "
              "`weekday` and run every entry in `evening` in `order`."),
        "4": ("Each entry names the Zapier action and the exact params. Pass "
              "them through unchanged — the text is written per platform on "
              "purpose, and the account ids are fixed so a post cannot land on "
              "the wrong page."),
        "5": ("Instagram often answers the first attempt with 'Video is still "
              "processing'. That is Meta finishing its own encode, not a "
              "failure. Wait ninety seconds and try once more; check the "
              "account's recent media before a third attempt so a slow publish "
              "does not become two Reels."),
        "6": ("A Google Business post returns PROCESSING and turns LIVE or "
              "REJECTED a minute later. Read it back. A rejected post is "
              "invisible rather than an error, so nothing surfaces unless the "
              "state is checked."),
    },

    "services": {
        "epoch": CYCLE_EPOCH.isoformat(),
        "posting_days": "Monday to Saturday",
        "count": len(CARDS),
        "rotation": [service_post(c) for c in CARDS],
    },

    "weekday": {name: plan(i, video_only=True) for i, name in enumerate(DAYS)},
}

DEST.parent.mkdir(parents=True, exist_ok=True)
DEST.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

print(f"wrote {DEST}  ({DEST.stat().st_size/1024:.0f} KB)")
print(f"{len(CARDS)} services in the Google Business rotation")
for name, d in doc["weekday"].items():
    if d.get("rest_day"):
        print(f"  {name:10} rest day")
    else:
        where = ", ".join(p["platform"] for p in d["evening"])
        print(f"  {name:10} {len(d['evening'])}  {where}")
