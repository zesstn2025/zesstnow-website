# -*- coding: utf-8 -*-
"""Build one day's round as a page of tap-to-send WhatsApp links.

Supersedes mkpage.py, which only knew about first messages. A real day is two
different jobs — the new names, and the people already waiting on a follow-up —
and they need different text and different handling, so the page separates them
instead of running them together as one undifferentiated list.

    python3 mkday.py          → outbox/round-YYYY-MM-DD.html
"""
import csv
import datetime as dt
import html
import pathlib
import sys
import zoneinfo

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from messages import whatsapp, followup2, link   # noqa: E402

IST = zoneinfo.ZoneInfo("Asia/Kolkata")
HERE = pathlib.Path(__file__).parent
PIPE = HERE / "pipeline.csv"
OUT = HERE / "outbox"
CAP = 10

HI_DAY = {"Monday": "सोमवार", "Tuesday": "मंगलवार", "Wednesday": "बुधवार",
          "Thursday": "गुरुवार", "Friday": "शुक्रवार", "Saturday": "शनिवार",
          "Sunday": "रविवार"}
HI_MONTH = {9: "सितम्बर", 10: "अक्टूबर", 11: "नवम्बर", 12: "दिसम्बर",
            1: "जनवरी", 2: "फ़रवरी", 3: "मार्च", 4: "अप्रैल", 5: "मई",
            6: "जून", 7: "जुलाई", 8: "अगस्त"}

SIGNAL = {
    "no_site": ("कोई website नहीं", "a"),
    "no_form": ("पूछताछ का रास्ता नहीं", "b"),
    "dead_site": ("website खुलती नहीं", "c"),
}


def card(r, text, kind, note=""):
    lab, tone = SIGNAL[r["signal"]]
    return f"""
<article class="card" data-id="{r['id']}">
  <header>
    <div>
      <h2>{html.escape(r['business'])}</h2>
      <p class="meta"><span>{html.escape(r['trade'])}</span><i>·</i>
         <span>{html.escape(r['town'])}</span><i>·</i>
         <span class="id">{r['id']}</span></p>
    </div>
    <span class="chip t{tone}">{lab}</span>
  </header>
  {f'<p class="note">{note}</p>' if note else ''}
  <pre class="msg">{html.escape(text)}</pre>
  <div class="act">
    <a class="wa" href="{link(r['phone'], text)}" target="_blank" rel="noopener"
       data-mark="{r['id']}">WhatsApp खोलें · {r['phone']}</a>
    <button class="done" data-mark="{r['id']}" type="button">भेज दिया</button>
  </div>
</article>"""


def main():
    today = dt.datetime.now(IST).date()
    rows = list(csv.DictReader(PIPE.open(encoding="utf-8")))

    due = [r for r in rows if r["stage"] == "touched" and r["next_due"]
           and r["next_due"] <= today.isoformat()]
    fresh = [r for r in rows if r["stage"] == "new"]
    fresh.sort(key=lambda r: (not r["email"], r["town"], r["business"]))
    batch = fresh[:CAP]

    blocks = []
    if due:
        blocks.append('<h3 class="band">पहले ये — इन्हें मेल जा चुका है, '
                      'अब दूसरा touch</h3>')
        for r in due:
            days = (today - dt.date.fromisoformat(r["first_touch"])).days
            blocks.append(card(r, followup2(r), "followup",
                               f"{r['first_touch']} को मेल गया था · आज दिन {days}"))
    if batch:
        blocks.append('<h3 class="band">नए — पहली बार</h3>')
        for r in batch:
            blocks.append(card(r, whatsapp(r), "first"))

    total = len(due) + len(batch)
    left = len(fresh) - len(batch)
    date_hi = f"{today.day} {HI_MONTH[today.month]} {today.year}"

    page = TEMPLATE
    for k, v in {
        "__CARDS__": "\n".join(blocks),
        "__DATE__": date_hi,
        "__DAY__": HI_DAY[today.strftime("%A")],
        "__TOTAL__": str(total),
        "__DUE__": str(len(due)),
        "__NEW__": str(len(batch)),
        "__LEFT__": str(left),
        "__KEY__": today.isoformat(),
    }.items():
        page = page.replace(k, v)

    OUT.mkdir(exist_ok=True)
    dest = OUT / f"round-{today}.html"
    dest.write_text(page, encoding="utf-8")
    print(f"{total} cards ({len(due)} follow-up + {len(batch)} new) -> {dest}")
    print(f"{left} new names still waiting")


TEMPLATE = """<title>आज का राउंड</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Noto+Sans+Devanagari:wght@400;500;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
:root{
  --paper:#f6f5f2; --sunk:#eceae4; --line:#d9d5cc;
  --ink:#1b1a17; --soft:#5f5b52; --faint:#8c877c;
  --accent:#0d5b52; --accent-ink:#f6f5f2;
  --a:#0d5b52; --b:#7a3b12; --c:#7a1230; --done:#e6ece7;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#14150f; --sunk:#1d1f17; --line:#33362a;
    --ink:#eceadf; --soft:#a8a496; --faint:#7b776b;
    --accent:#5fbfa8; --accent-ink:#10120c;
    --a:#5fbfa8; --b:#d9a274; --c:#e08a9e; --done:#1b241d;
  }
}
:root[data-theme="dark"]{
  --paper:#14150f; --sunk:#1d1f17; --line:#33362a;
  --ink:#eceadf; --soft:#a8a496; --faint:#7b776b;
  --accent:#5fbfa8; --accent-ink:#10120c;
  --a:#5fbfa8; --b:#d9a274; --c:#e08a9e; --done:#1b241d;
}
*{box-sizing:border-box}
body{background:var(--paper); color:var(--ink);
  font-family:"Noto Sans Devanagari","Segoe UI",system-ui,sans-serif;
  line-height:1.6; margin:0; padding:0 1rem 5rem; -webkit-text-size-adjust:100%}
.wrap{max-width:44rem; margin:0 auto}
header.top{padding:2.5rem 0 1.25rem; border-bottom:2px solid var(--ink)}
h1{font-family:"Bricolage Grotesque","Noto Sans Devanagari",sans-serif;
  font-weight:700; font-size:clamp(2rem,7vw,3rem); line-height:1.05;
  letter-spacing:-.02em; margin:0; text-wrap:balance}
.sub{color:var(--soft); margin:.5rem 0 0; font-size:.95rem}
.bar{position:sticky; top:0; z-index:5; background:var(--paper);
  border-bottom:1px solid var(--line); display:flex; align-items:center;
  gap:.75rem; padding:.7rem 0; margin-bottom:1.5rem}
.count{font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:.85rem;
  color:var(--soft); white-space:nowrap}
.track{flex:1; height:6px; background:var(--sunk); border-radius:99px; overflow:hidden}
.fill{height:100%; width:0; background:var(--accent); transition:width .35s ease}
.reset{background:none; border:none; color:var(--faint); font:inherit;
  font-size:.8rem; cursor:pointer; padding:.2rem .4rem; text-decoration:underline}
.band{font-family:"Bricolage Grotesque",sans-serif; font-size:.82rem;
  letter-spacing:.1em; text-transform:uppercase; color:var(--faint);
  border-bottom:1px solid var(--line); padding-bottom:.5rem;
  margin:2.5rem 0 1.1rem; font-weight:700}
.band:first-child{margin-top:0}
.card{border:1px solid var(--line); border-radius:2px; padding:1.25rem;
  margin:0 0 1.1rem; background:var(--paper); transition:background .25s, border-color .25s}
.card.is-done{background:var(--done); border-color:transparent}
.card.is-done .msg,.card.is-done .wa{opacity:.45}
.card header{display:flex; gap:1rem; align-items:flex-start; justify-content:space-between}
h2{font-family:"Bricolage Grotesque","Noto Sans Devanagari",sans-serif;
  font-size:1.2rem; font-weight:700; margin:0; letter-spacing:-.01em}
.meta{margin:.25rem 0 0; font-size:.85rem; color:var(--soft)}
.meta i{color:var(--faint); font-style:normal; margin:0 .4rem}
.meta .id{font-family:"IBM Plex Mono",monospace; font-size:.78rem; color:var(--faint)}
.chip{flex:none; font-size:.72rem; letter-spacing:.04em; padding:.28rem .6rem;
  border:1px solid currentColor; border-radius:99px; white-space:nowrap}
.chip.ta{color:var(--a)} .chip.tb{color:var(--b)} .chip.tc{color:var(--c)}
.note{margin:.9rem 0 0; font-size:.82rem; color:var(--faint);
  font-family:"IBM Plex Mono",monospace}
.msg{background:var(--sunk); border-left:2px solid var(--line);
  padding:.9rem 1rem; margin:1rem 0 1.1rem; font-size:.88rem;
  font-family:inherit; white-space:pre-wrap; word-break:break-word;
  color:var(--soft); overflow-x:auto}
.act{display:flex; gap:.6rem; flex-wrap:wrap; align-items:center}
.wa{flex:1 1 15rem; text-align:center; text-decoration:none;
  background:var(--accent); color:var(--accent-ink); padding:.8rem 1rem;
  border-radius:2px; font-weight:700; font-size:.92rem}
.wa:focus-visible,.done:focus-visible,.reset:focus-visible{
  outline:2px solid var(--ink); outline-offset:2px}
.done{background:none; border:1px solid var(--line); color:var(--soft);
  font:inherit; font-size:.85rem; padding:.8rem 1rem; border-radius:2px; cursor:pointer}
.card.is-done .done{border-color:var(--accent); color:var(--accent); font-weight:700}
footer{margin-top:2.5rem; padding-top:1.25rem; border-top:1px solid var(--line);
  font-size:.85rem; color:var(--faint)}
footer b{color:var(--soft); font-weight:500}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="wrap">
<header class="top">
  <h1>आज का राउंड</h1>
  <p class="sub">__DATE__ · __DAY__ · कौशाम्बी–प्रयागराज</p>
</header>

<div class="bar">
  <span class="count"><b id="n">0</b>/__TOTAL__ भेजे</span>
  <div class="track"><div class="fill" id="fill"></div></div>
  <button class="reset" id="reset" type="button">रीसेट</button>
</div>

__CARDS__

<footer>
  <p><b>__DUE__ follow-up, __NEW__ नए।</b> अभी __LEFT__ नाम और बाक़ी हैं —
  वो अगले दिनों में अपने आप निकलेंगे, रोज़ दस से ज़्यादा नहीं।</p>
  <p>जवाब न आए तो घबराइए मत। चार में से दूसरा और चौथा touch ही ज़्यादातर
  deal बंद कराता है — पहला नहीं।</p>
</footer>
</div>

<script>
(function(){
  var KEY="zn-round-__KEY__", done={};
  try{ done=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ done={}; }
  var cards=[].slice.call(document.querySelectorAll(".card"));
  var n=document.getElementById("n"), fill=document.getElementById("fill");
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(done)); }catch(e){} }
  function paint(){
    var c=0;
    cards.forEach(function(el){
      var on=!!done[el.dataset.id];
      el.classList.toggle("is-done",on);
      var b=el.querySelector(".done");
      b.textContent=on?"✓ भेज दिया":"भेज दिया";
      b.setAttribute("aria-pressed",on?"true":"false");
      if(on)c++;
    });
    n.textContent=c;
    fill.style.width=(cards.length?c/cards.length*100:0)+"%";
  }
  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-mark]");
    if(!t)return;
    var id=t.dataset.mark;
    if(t.classList.contains("done")){
      if(done[id]){ delete done[id]; } else { done[id]=true; }
      save(); paint();
    } else {
      setTimeout(function(){ done[id]=true; save(); paint(); },400);
    }
  });
  document.getElementById("reset").addEventListener("click",function(){
    done={}; save(); paint();
  });
  paint();
})();
</script>
"""

if __name__ == "__main__":
    main()
