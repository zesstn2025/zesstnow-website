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
from pitch import comment, email
from pricing import WEBSITE, APP, band

HERE = pathlib.Path(__file__).parent
TODAY = dt.date(2026, 9, 12)
SENT = {"LI001", "LI003", "LI017", "LI020"}   # emailed today

def age(d): return (TODAY - dt.date.fromisoformat(d)).days

def tiers_html():
    out = []
    for label, group in (("Website", WEBSITE), ("App — quoted separately", APP)):
        rows = "".join(
            f"<tr><td><b>{t['name']}</b><br><span class=fits>{html.escape(t['fits'])}</span></td>"
            f"<td class=num>{band(t['low'], t['high'])}</td>"
            f"<td class=num>{t['days']}d</td></tr>" for t in group)
        out.append(f"<h3 class=band>{label}</h3><table>{rows}</table>")
    return "".join(out)

TIER_LABEL = {t["id"]: f"{t['name']} · {band(t['low'], t['high'])} · {t['days']} working days"
              for t in WEBSITE + APP}

cards = []
for l in sorted(LEADS, key=lambda x: (bool(x.get("skip")), x["asked"]), reverse=False):
    a = age(l["asked"])
    if l.get("skip"):
        cards.append(f"""
<article class="card skip">
  <header><div><h2>{html.escape(l['name'])}</h2>
    <p class="meta"><span class="id">{l['id']}</span><i>·</i>{l['asked']} ({a}d)</p></div>
    <span class="chip s">not pitching</span></header>
  <p class="need">{html.escape(l['need'])}</p>
  <p class="flag">{html.escape(l['skip'])}</p>
  <div class="act"><a class="btn ghost" href="{l['li']}" target="_blank" rel="noopener">post देखें</a></div>
</article>""")
        continue
    fresh = "fresh" if a <= 14 else ("warm" if a <= 45 else "cold")
    c = comment(l)
    subj, body = email(l)
    acts = [f'<a class="btn li" href="{l["li"]}" target="_blank" rel="noopener">Open post → paste comment</a>']
    if l["id"] in SENT:
        acts.append(f'<span class="sent">✓ emailed · {l["email"]}</span>')
    if l["wa"]:
        acts.append(f'<a class="btn wa" href="https://wa.me/91{l["wa"]}?text='
                    f'{urllib.parse.quote(c)}" target="_blank" rel="noopener">WhatsApp {l["wa"]}</a>')
    cards.append(f"""
<article class="card">
  <header><div><h2>{html.escape(l['name'])}</h2>
    <p class="meta"><span class="id">{l['id']}</span><i>·</i>{html.escape(l['where'])}
    <i>·</i>{l['asked']} <b>({a}d old)</b>{'<i>·</i>' + html.escape(l['who']) if l['who'] else ''}</p></div>
    <span class="chip {fresh}">{ {'fresh':'fresh','warm':'warm','cold':'cold'}[fresh] }</span></header>
  <p class="need">{html.escape(l['need'])}</p>
  <p class="tier">Quote: <b>{TIER_LABEL[l['tier']]}</b></p>
  <details open><summary>Comment / DM — paste as is</summary>
    <pre class="msg">{html.escape(c)}</pre></details>
  <details><summary>Email version (subject: {html.escape(subj)})</summary>
    <pre class="msg">{html.escape(body)}</pre></details>
  <div class="act">{''.join(acts)}</div>
</article>""")

page = (HERE / "round_template.html").read_text(encoding="utf-8")
live = [l for l in LEADS if not l.get("skip")]
out = HERE / "outbox" / f"round-linkedin-{TODAY}.html"
out.write_text(page.replace("__CARDS__", "\n".join(cards))
                   .replace("__TIERS__", tiers_html())
                   .replace("__N__", str(len(live)))
                   .replace("__SKIP__", str(len(LEADS) - len(live)))
                   .replace("__MAILED__", str(len(SENT))), encoding="utf-8")
print(f"{len(live)} to pitch, {len(LEADS)-len(live)} skipped -> {out}")
