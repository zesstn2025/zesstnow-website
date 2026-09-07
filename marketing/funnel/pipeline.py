# -*- coding: utf-8 -*-
"""The pipeline. A CSV, on purpose.

A CRM was the obvious choice and is the wrong one at this size. The pipeline
holds a few hundred rows, one person works it, and the thing that actually kills
a small pipeline is not missing features — it is a follow-up nobody was reminded
about. A file that opens in any spreadsheet, syncs through git, and can be read
by the daily job is enough, and it is one fewer login to abandon in month two.

    python3 pipeline.py init                     create the file
    python3 pipeline.py add "Name" 98xxxxxxxx signal trade town [email]
    python3 pipeline.py due                      what to send today
    python3 pipeline.py touch <id> <stage> [note]
    python3 pipeline.py week                     the two Friday numbers
"""
import csv, datetime as dt, pathlib, sys, zoneinfo

IST = zoneinfo.ZoneInfo("Asia/Kolkata")
F = pathlib.Path("/home/user/funnel/pipeline.csv")

COLS = ["id", "business", "phone", "email", "trade", "town",
        "signal", "stage", "first_touch", "last_touch", "next_due", "note"]

STAGES = ["new", "touched", "replied", "call_booked", "quoted", "won", "lost"]

# The four touches from section 05, in days after the first one. The whole point
# of the file is that these dates exist somewhere other than somebody's memory.
CADENCE = {0: 2, 2: 5, 5: 12}


def today():
    return dt.datetime.now(IST).date()


def load():
    if not F.exists():
        return []
    with F.open(encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def save(rows):
    with F.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLS)
        w.writeheader()
        w.writerows(rows)


def cmd_init():
    if F.exists():
        print(f"{F} already exists, {len(load())} rows — not overwriting")
        return
    save([])
    print(f"created {F}")


def cmd_add(args):
    business, phone, signal, trade, town = args[:5]
    email = args[5] if len(args) > 5 else ""
    rows = load()
    # A business already on the list must not be added twice: the second entry
    # would get its own cadence and the owner would be messaged in duplicate.
    key = (business.strip().lower(), phone.strip())
    for r in rows:
        if (r["business"].strip().lower(), r["phone"].strip()) == key:
            print(f"already on the list as {r['id']} ({r['stage']}) — skipped")
            return
    rid = f"L{len(rows) + 1:04d}"
    rows.append(dict(id=rid, business=business, phone=phone, email=email,
                     trade=trade, town=town, signal=signal, stage="new",
                     first_touch="", last_touch="", next_due="", note=""))
    save(rows)
    print(f"{rid}  {business}  [{signal}]")


def cmd_touch(args):
    rid, stage = args[0], args[1]
    note = " ".join(args[2:]) if len(args) > 2 else ""
    if stage not in STAGES:
        sys.exit(f"stage must be one of: {', '.join(STAGES)}")
    rows = load()
    for r in rows:
        if r["id"] != rid:
            continue
        d = today()
        r["stage"] = stage
        r["last_touch"] = d.isoformat()
        if not r["first_touch"]:
            r["first_touch"] = d.isoformat()
        if note:
            r["note"] = (r["note"] + " | " if r["note"] else "") + f"{d}: {note}"

        if stage in ("won", "lost", "call_booked", "quoted"):
            r["next_due"] = ""          # a person owns it now, not the cadence
        else:
            since = (d - dt.date.fromisoformat(r["first_touch"])).days
            nxt = next((v for k, v in sorted(CADENCE.items()) if since < v), None)
            r["next_due"] = (dt.date.fromisoformat(r["first_touch"])
                             + dt.timedelta(days=nxt)).isoformat() if nxt else ""
        save(rows)
        print(f"{rid} -> {stage}" + (f", next due {r['next_due']}" if r["next_due"] else ""))
        return
    sys.exit(f"no row {rid}")


def cmd_due():
    d = today()
    rows = load()
    fresh = [r for r in rows if r["stage"] == "new"][:15]
    due = [r for r in rows if r["next_due"] and r["next_due"] <= d.isoformat()
           and r["stage"] not in ("won", "lost")]

    print(f"\n{d}  ({d.strftime('%A')})\n")
    print(f"── send the first message to {len(fresh)} (cap is 10-15 a day) ──")
    for r in fresh:
        who = f"{r['business']} · {r['trade']} · {r['town']}"
        print(f"  {r['id']}  {who:52} {r['signal']:10} {r['email'] or r['phone']}")

    print(f"\n── {len(due)} follow-ups due ──")
    for r in sorted(due, key=lambda r: r["next_due"]):
        since = (d - dt.date.fromisoformat(r["first_touch"])).days
        step = ("WhatsApp" if since < 4 else "CALL" if since < 9 else "last email")
        print(f"  {r['id']}  {r['business']:34} day {since:2}  ->  {step}")
    if not due:
        print("  none")
    print()


def cmd_week():
    d = today()
    rows = load()
    monday = d - dt.timedelta(days=d.weekday())
    added = [r for r in rows if r["first_touch"] and r["first_touch"] >= monday.isoformat()]
    calls = [r for r in rows if r["stage"] in ("call_booked", "quoted", "won")
             and r["last_touch"] >= monday.isoformat()]
    by = {s: sum(1 for r in rows if r["stage"] == s) for s in STAGES}

    print(f"\nweek of {monday}\n")
    print(f"  names touched this week   {len(added):3}   target 100-120")
    print(f"  calls held this week      {len(calls):3}   target 8-10")
    print("\n  pipeline:")
    for s in STAGES:
        print(f"    {s:12} {by[s]:4}")
    lost = [r for r in rows if r["stage"] == "lost" and r["note"]]
    if lost:
        print("\n  why the last few were lost:")
        for r in lost[-6:]:
            print(f"    {r['business']}: {r['note'].split(': ', 1)[-1][:70]}")
    print()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    c, rest = sys.argv[1], sys.argv[2:]
    {"init": lambda: cmd_init(), "add": lambda: cmd_add(rest),
     "touch": lambda: cmd_touch(rest), "due": lambda: cmd_due(),
     "week": lambda: cmd_week()}.get(c, lambda: sys.exit(__doc__))()
