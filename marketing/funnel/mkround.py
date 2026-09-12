# -*- coding: utf-8 -*-
"""The day's LinkedIn round as one page: comment text, DM text, and the links.

Comments and DMs cannot be sent from here — there is no LinkedIn tool in this
session and the only route that ever existed (Zapier) is out of tasks. So the
page hands over finished text and the link to the post. That is the honest
division: the writing is done, the clicking is not.
"""
import datetime as dt, html, pathlib, sys, urllib.parse
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from leads import LEADS
from pitch import (comment, email, partner_comment, partner_email,
                   equity_comment, equity_email, freelance_comment,
                   budget_comment)
from pricing import WEBSITE, APP, PARTNER, EQUITY, band, rate

HERE = pathlib.Path(__file__).parent
TODAY = dt.date(2026, 9, 12)
SENT = {"LI001", "LI003", "LI017", "LI020",   # build track, emailed earlier
        "LI030", "LI031", "LI032"}            # partner track, emailed today

# Which writer each track uses. A track with no email writer is comment-only —
# not an oversight: Shivani asked for no agencies and Daya's is a correction to
# a public thread, and both belong in the thread they were posted in rather
# than in an inbox.
TRACK = {
    "partner":   (partner_comment,   partner_email),
    "equity":    (equity_comment,    equity_email),
    "freelance": (freelance_comment, None),
    "budget":    (budget_comment,    None),
}
TRACK_CHIP = {"partner": "white-label", "equity": "co-founder",
              "freelance": "no agencies", "budget": "budget gap"}

def age(d): return (TODAY - dt.date.fromisoformat(d)).days

def tiers_html():
    out = []
    for label, group in (("Website", WEBSITE), ("App — quoted separately", APP)):
        rows = "".join(
            f"<tr><td><b>{t['name']}</b><br><span class=fits>{html.escape(t['fits'])}</span></td>"
            f"<td class=num>{band(t['low'], t['high'])}</td>"
            f"<td class=num>{t['days']}d</td></tr>" for t in group)
        out.append(f"<h3 class=band>{label}</h3><table>{rows}</table>")
    # The partner and equity books have no working-days column — they are priced
    # per hour, per month or in percent — so the third column carries the unit.
    for label, group in (("Agency / white-label", PARTNER),
                         ("Founder / equity", EQUITY)):
        rows = "".join(
            f"<tr><td><b>{html.escape(t['name'])}</b><br>"
            f"<span class=fits>{html.escape(t['fits'])}</span></td>"
            f"<td class=num colspan=2>{html.escape(rate(t))}</td></tr>"
            for t in group)
        out.append(f"<h3 class=band>{label}</h3><table>{rows}</table>")
    return "".join(out)

TIER_LABEL = {t["id"]: f"{t['name']} · {band(t['low'], t['high'])} · {t['days']} working days"
              for t in WEBSITE + APP}

cards = []
# Grouped by track, freshest first inside each group, because the round is
# worked one track at a time — the partner messages read as a set and switching
# between a white-label pitch and a retail quote every card is how the wrong
# text gets pasted into the wrong thread.
TRACK_ORDER = {"build": 0, "partner": 1, "equity": 2, "freelance": 3, "budget": 4}
for l in sorted(LEADS, key=lambda x: (TRACK_ORDER[x.get("track", "build")],
                                      x["asked"]), reverse=False):
    a = age(l["asked"])
    track = l.get("track", "build")
    fresh = "fresh" if a <= 14 else ("warm" if a <= 45 else "cold")
    cwrite, ewrite = TRACK.get(track, (comment, email))
    c = cwrite(l)
    acts = [f'<a class="btn li" href="{l["li"]}" target="_blank" rel="noopener">Open post → paste comment</a>']
    if l["id"] in SENT:
        acts.append(f'<span class="sent">✓ emailed · {l["email"]}</span>')
    if l["wa"]:
        acts.append(f'<a class="btn wa" href="https://wa.me/91{l["wa"]}?text='
                    f'{urllib.parse.quote(c)}" target="_blank" rel="noopener">WhatsApp {l["wa"]}</a>')

    quote = (TIER_LABEL[l["tier"]] if track == "build"
             else {"partner": "White-label rate card — hours, retainer or per build",
                   "equity": "Three shapes — cash first, then hybrid, then equity",
                   "freelance": TIER_LABEL[l["tier"]] + " · answered as a named person",
                   "budget": "Budget gap — the three real numbers, not a refusal"}[track])

    blocks = [f"""<details open><summary>Comment / DM — paste as is</summary>
    <pre class="msg">{html.escape(c)}</pre></details>"""]
    if ewrite:
        subj, body = ewrite(l)
        blocks.append(f"""<details><summary>Email version (subject: {html.escape(subj)})</summary>
    <pre class="msg">{html.escape(body)}</pre></details>""")

    chips = f'<span class="chip {fresh}">{fresh}</span>'
    if track != "build":
        chips = f'<span class="chip t">{TRACK_CHIP[track]}</span>' + chips
    chips = f'<div class="chips">{chips}</div>'
    note = f'<p class="flag">{html.escape(l["note"])}</p>' if l.get("note") else ""

    cards.append(f"""
<article class="card">
  <header><div><h2>{html.escape(l['name'])}</h2>
    <p class="meta"><span class="id">{l['id']}</span><i>·</i>{html.escape(l['where'])}
    <i>·</i>{l['asked']} <b>({a}d old)</b>{'<i>·</i>' + html.escape(l['who']) if l['who'] else ''}</p></div>
    {chips}</header>
  <p class="need">{html.escape(l['need'])}</p>
  {note}
  <p class="tier">Quote: <b>{html.escape(quote)}</b></p>
  {''.join(blocks)}
  <div class="act">{''.join(acts)}</div>
</article>""")

page = (HERE / "round_template.html").read_text(encoding="utf-8")
out = HERE / "outbox" / f"round-linkedin-{TODAY}.html"
out.write_text(page.replace("__CARDS__", "\n".join(cards))
                   .replace("__TIERS__", tiers_html())
                   .replace("__N__", str(len(LEADS)))
                   .replace("__SKIP__", "0")
                   .replace("__MAILED__", str(len(SENT))), encoding="utf-8")
by = {}
for l in LEADS:
    by[l.get("track", "build")] = by.get(l.get("track", "build"), 0) + 1
print(f"{len(LEADS)} to pitch, 0 skipped -> {out}")
print("  " + " · ".join(f"{k} {v}" for k, v in sorted(by.items())))
