# -*- coding: utf-8 -*-
"""Build the day's outreach page.

The wa.me links are 2 KB of percent-encoding each — unreadable pasted into a
chat, and unusable on a phone. A page turns the day's round into ten taps, and
remembers which ones have gone so the round survives being interrupted, which
on a working day it always is.
"""
import csv
import html
import pathlib
import sys

sys.path.insert(0, "/home/user/funnel")
from messages import whatsapp, link, email as email_msg   # noqa: E402

PIPE = pathlib.Path("/home/user/funnel/pipeline.csv")
OUT = pathlib.Path(__file__).with_name("day1.html")
DATE = "8 सितम्बर 2026"

SIGNAL_LABEL = {
    "no_site": ("कोई website नहीं", "a"),
    "no_form": ("पूछताछ का रास्ता नहीं", "b"),
    "dead_site": ("website खुलती नहीं", "c"),
}

rows = list(csv.DictReader(PIPE.open(encoding="utf-8")))
emailed = [r for r in rows if r["stage"] == "touched"]
fresh = [r for r in rows if r["stage"] == "new"]
fresh.sort(key=lambda r: (not r["email"], r["town"], r["business"]))
batch = emailed + fresh[:6]

cards = []
for r in batch:
    msg = whatsapp(r)
    lab, tone = SIGNAL_LABEL[r["signal"]]
    mailed = ('<span class="mailed">✓ email भेज दिया गया</span>'
              if r["stage"] == "touched" else "")
    cards.append(f"""
<article class="card" data-id="{r['id']}">
  <header>
    <div class="who">
      <h2>{html.escape(r['business'])}</h2>
      <p class="meta"><span>{html.escape(r['trade'])}</span><i>·</i>
         <span>{html.escape(r['town'])}</span><i>·</i>
         <span class="id">{r['id']}</span></p>
    </div>
    <span class="chip t{tone}">{lab}</span>
  </header>
  <pre class="msg">{html.escape(msg)}</pre>
  <div class="act">
    <a class="wa" href="{link(r['phone'], msg)}" target="_blank" rel="noopener"
       data-mark="{r['id']}">WhatsApp खोलें · {r['phone']}</a>
    <button class="done" data-mark="{r['id']}" type="button">भेज दिया</button>
  </div>
  {mailed}
</article>""")

HTML = """<title>आज का राउंड</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Noto+Sans+Devanagari:wght@400;500;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
:root{
  --paper:#f6f5f2; --sunk:#eceae4; --line:#d9d5cc;
  --ink:#1b1a17; --soft:#5f5b52; --faint:#8c877c;
  --accent:#0d5b52; --accent-ink:#f6f5f2;
  --a:#0d5b52; --b:#7a3b12; --c:#7a1230;
  --done:#e6ece7;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#14150f; --sunk:#1d1f17; --line:#33362a;
    --ink:#eceadf; --soft:#a8a496; --faint:#7b776b;
    --accent:#5fbfa8; --accent-ink:#10120c;
    --a:#5fbfa8; --b:#d9a274; --c:#e08a9e;
    --done:#1b241d;
  }
}
:root[data-theme="dark"]{
  --paper:#14150f; --sunk:#1d1f17; --line:#33362a;
  --ink:#eceadf; --soft:#a8a496; --faint:#7b776b;
  --accent:#5fbfa8; --accent-ink:#10120c;
  --a:#5fbfa8; --b:#d9a274; --c:#e08a9e;
  --done:#1b241d;
}
*{box-sizing:border-box}
body{
  background:var(--paper); color:var(--ink);
  font-family:"Noto Sans Devanagari","Segoe UI",system-ui,sans-serif;
  line-height:1.6; margin:0; padding:0 1rem 5rem;
  -webkit-text-size-adjust:100%;
}
.wrap{max-width:44rem; margin:0 auto}

header.top{padding:2.5rem 0 1.25rem; border-bottom:2px solid var(--ink)}
h1{
  font-family:"Bricolage Grotesque","Noto Sans Devanagari",sans-serif;
  font-weight:700; font-size:clamp(2rem,7vw,3rem); line-height:1.05;
  letter-spacing:-.02em; margin:0; text-wrap:balance;
}
.sub{color:var(--soft); margin:.5rem 0 0; font-size:.95rem}

.bar{
  position:sticky; top:0; z-index:5; background:var(--paper);
  border-bottom:1px solid var(--line);
  display:flex; align-items:center; gap:.75rem;
  padding:.7rem 0; margin-bottom:1.5rem;
}
.count{
  font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:.85rem;
  color:var(--soft); white-space:nowrap;
}
.track{flex:1; height:6px; background:var(--sunk); border-radius:99px; overflow:hidden}
.fill{height:100%; width:0; background:var(--accent); transition:width .35s ease}
.reset{
  background:none; border:none; color:var(--faint); font:inherit;
  font-size:.8rem; cursor:pointer; padding:.2rem .4rem; text-decoration:underline;
}

.card{
  border:1px solid var(--line); border-radius:2px;
  padding:1.25rem; margin:0 0 1.1rem; background:var(--paper);
  transition:background .25s, border-color .25s;
}
.card.is-done{background:var(--done); border-color:transparent}
.card.is-done .msg,.card.is-done .wa{opacity:.45}
.card header{display:flex; gap:1rem; align-items:flex-start; justify-content:space-between}
h2{
  font-family:"Bricolage Grotesque","Noto Sans Devanagari",sans-serif;
  font-size:1.2rem; font-weight:700; margin:0; letter-spacing:-.01em;
}
.meta{margin:.25rem 0 0; font-size:.85rem; color:var(--soft)}
.meta i{color:var(--faint); font-style:normal; margin:0 .4rem}
.meta .id{font-family:"IBM Plex Mono",monospace; font-size:.78rem; color:var(--faint)}
.chip{
  flex:none; font-size:.72rem; letter-spacing:.04em; padding:.28rem .6rem;
  border:1px solid currentColor; border-radius:99px; white-space:nowrap;
}
.chip.ta{color:var(--a)} .chip.tb{color:var(--b)} .chip.tc{color:var(--c)}

.msg{
  background:var(--sunk); border-left:2px solid var(--line);
  padding:.9rem 1rem; margin:1rem 0 1.1rem; font-size:.88rem;
  font-family:inherit; white-space:pre-wrap; word-break:break-word;
  color:var(--soft); overflow-x:auto;
}
.act{display:flex; gap:.6rem; flex-wrap:wrap; align-items:center}
.wa{
  flex:1 1 15rem; text-align:center; text-decoration:none;
  background:var(--accent); color:var(--accent-ink);
  padding:.8rem 1rem; border-radius:2px; font-weight:700; font-size:.92rem;
}
.wa:focus-visible,.done:focus-visible,.reset:focus-visible{
  outline:2px solid var(--ink); outline-offset:2px;
}
.done{
  background:none; border:1px solid var(--line); color:var(--soft);
  font:inherit; font-size:.85rem; padding:.8rem 1rem; border-radius:2px;
  cursor:pointer;
}
.card.is-done .done{border-color:var(--accent); color:var(--accent); font-weight:700}
.mailed{
  display:inline-block; margin-top:.8rem; font-size:.8rem; color:var(--accent);
  font-family:"IBM Plex Mono",monospace;
}
footer{
  margin-top:2.5rem; padding-top:1.25rem; border-top:1px solid var(--line);
  font-size:.85rem; color:var(--faint);
}
footer b{color:var(--soft); font-weight:500}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="wrap">
<header class="top">
  <h1>आज का राउंड</h1>
  <p class="sub">__DATE__ · कौशाम्बी–प्रयागराज · पहला संपर्क</p>
</header>

<div class="bar">
  <span class="count"><b id="n">0</b>/__TOTAL__ भेजे</span>
  <div class="track"><div class="fill" id="fill"></div></div>
  <button class="reset" id="reset" type="button">रीसेट</button>
</div>

__CARDS__

<footer>
  <p><b>चार में से चौथा नहीं, पहला।</b> जवाब न आए तो घबराइए मत — असली deal
  दूसरे और चौथे touch पर बंद होती है। अगला touch इनका
  <b>10 सितम्बर</b> को है, वो अपने आप निकल आएगा।</p>
  <p>जिनके पास email था उन चार को मेल जा चुका है। बाक़ी के लिए यही WhatsApp
  ही पहला संपर्क है।</p>
</footer>
</div>

<script>
(function(){
  var KEY="zn-round-__DATEKEY__", done={};
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
  function mark(id){ done[id]=true; save(); paint(); }

  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-mark]");
    if(!t)return;
    var id=t.dataset.mark;
    if(t.classList.contains("done")){
      if(done[id]){ delete done[id]; save(); paint(); } else { mark(id); }
    } else {
      setTimeout(function(){ mark(id); },400);
    }
  });
  document.getElementById("reset").addEventListener("click",function(){
    done={}; save(); paint();
  });
  paint();
})();
</script>
"""

OUT.write_text(
    HTML.replace("__CARDS__", "\n".join(cards))
        .replace("__DATE__", DATE)
        .replace("__TOTAL__", str(len(batch)))
        .replace("__DATEKEY__", "2026-09-08"),
    encoding="utf-8")
print(f"{len(batch)} cards -> {OUT}  ({OUT.stat().st_size/1024:.0f} KB)")
