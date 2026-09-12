# -*- coding: utf-8 -*-
"""The send list: the rows that CANNOT be sent from here, as a phone page.

Email is the only channel this session can actually send on. LinkedIn comments
and DMs cannot be — there is no LinkedIn tool and Zapier is out of tasks — and
WhatsApp goes through a wa.me link because every API route available runs
through an account that is out of quota.

So the eleven rows on the partner, equity, freelance and budget tracks land
here instead of in an outbox: the message finished, the link pre-filled, and
one button per row. The division is honest — the writing is done, the tapping
is not, and this page exists so the tapping takes a minute rather than an hour.

Phone-first on purpose: it is opened standing up, one thumb, between other
things. That is why the action button is the largest object in every row.
"""
import html, pathlib, sys, urllib.parse
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from leads import LEADS
from pitch import (partner_comment, equity_comment, freelance_comment,
                   budget_comment)
from pricing import WHATSAPP_SHOWN

WRITER = {"partner": partner_comment, "equity": equity_comment,
          "freelance": freelance_comment, "budget": budget_comment}
LABEL = {"partner": "white-label", "equity": "co-founder",
         "freelance": "no agencies", "budget": "budget gap"}
# What the row is being asked to do, in the one line the user reads first.
DO = {"partner": "Agency ko supplier ki tarah — ghanton ka rate, aur non-compete",
      "equity": "Founder ko teen shakl — cash pehle, equity baad me",
      "freelance": "Naam se jawab, company chhupaye bina",
      "budget": "Teen asli number, chautha 'nahi' nahi"}

rows = [l for l in LEADS if l.get("track") in WRITER]
wa = [l for l in rows if l["wa"]]
li = [l for l in rows if not l["wa"] and not l["email"]]
mailed = [l for l in rows if l["email"]]
# The headline counts CARDS, not rows. A row with an address already had its
# email sent from here, so it is not something the user has to do — counting it
# in "ye aapke haath se jaayenge" promises a card that is not on the page.
todo = wa + li


def card(l, n):
    t = l["track"]
    msg = WRITER[t](l)
    note = (f'<p class="note">{html.escape(l["note"])}</p>'
            if l.get("note") else "")
    if l["wa"]:
        href = f'https://wa.me/91{l["wa"]}?text={urllib.parse.quote(msg)}'
        btn = (f'<a class="go wa" href="{href}" target="_blank" rel="noopener">'
               f'WhatsApp kholo — {l["wa"]}</a>')
        second = ('<p class="second">Email pehle hi ja chuka hai. Ye doosra '
                  'touch hai — chaho tabhi bhejo.</p>' if l["email"] else "")
    else:
        btn = (f'<a class="go li" href="{l["li"]}" target="_blank" '
               f'rel="noopener">LinkedIn post kholo</a>')
        second = ""
    firm = l.get("firm") or l["who"]
    return f"""
<article class="row" id="r{n}">
  <div class="who">
    <h3>{html.escape(l['name'])}</h3>
    <p class="sub">{html.escape(firm)} · {html.escape(l['where'])}</p>
  </div>
  <div class="tags"><span class="tag {t}">{LABEL[t]}</span>
    <span class="asked">{l['asked']}</span></div>
  <p class="do">{html.escape(DO[t])}</p>
  {note}{second}
  <div class="msgbox">
    <pre id="m{n}">{html.escape(msg)}</pre>
    <button class="copy" type="button" data-t="m{n}">Message copy karo</button>
  </div>
  {btn}
</article>"""


cards_wa = "\n".join(card(l, i) for i, l in enumerate(wa))
cards_li = "\n".join(card(l, i + 100) for i, l in enumerate(li))
done = " · ".join(f"{l['name']} ({l['email']})" for l in mailed)

CSS = """
:root{
 --paper:#f6f5f1; --sunk:#eae7de; --card:#fffefb; --line:#d8d3c6;
 --ink:#15140e; --soft:#57544b; --faint:#8a8578;
 --wa:#0d5b52; --wa-ink:#f6f5f1; --li:#1b3a5c; --li-ink:#f6f5f1;
 --violet:#4a3a6b; --warnbg:#f3e9e6; --warn:#8a2b1f;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
 --paper:#101107; --sunk:#191b11; --card:#15170d; --line:#32351f;
 --ink:#edeade; --soft:#a6a195; --faint:#7a7467;
 --wa:#5fbfa8; --wa-ink:#101107; --li:#86b6e4; --li-ink:#101107;
 --violet:#b3a0dd; --warnbg:#2a1a16; --warn:#e79a8e;
}}
:root[data-theme="dark"]{
 --paper:#101107; --sunk:#191b11; --card:#15170d; --line:#32351f;
 --ink:#edeade; --soft:#a6a195; --faint:#7a7467;
 --wa:#5fbfa8; --wa-ink:#101107; --li:#86b6e4; --li-ink:#101107;
 --violet:#b3a0dd; --warnbg:#2a1a16; --warn:#e79a8e;
}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);margin:0;
 font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.6;
 -webkit-text-size-adjust:100%}
.wrap{max-width:38rem;margin:0 auto;padding:0 1rem;padding-block:2rem 4rem}
h1{font-family:"Bricolage Grotesque",Inter,sans-serif;font-weight:800;
 font-size:clamp(1.75rem,6.5vw,2.5rem);line-height:1.05;letter-spacing:-.025em;
 margin:0;text-wrap:balance}
.lede{color:var(--soft);margin:.7rem 0 0;font-size:.95rem}
.counts{display:flex;gap:.5rem;flex-wrap:wrap;margin:1.25rem 0 0}
.count{background:var(--sunk);border-radius:2px;padding:.55rem .8rem;
 font-size:.8rem;color:var(--soft);flex:1 1 8rem}
.count b{display:block;font-family:"IBM Plex Mono",monospace;font-size:1.4rem;
 color:var(--ink);line-height:1.1;font-variant-numeric:tabular-nums}
h2{font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:.78rem;
 letter-spacing:.12em;text-transform:uppercase;color:var(--faint);
 font-weight:800;margin:2.5rem 0 .2rem;padding-top:1.1rem;
 border-top:2px solid var(--ink)}
.h2sub{color:var(--soft);font-size:.86rem;margin:.35rem 0 1.1rem}
.list{display:flex;flex-direction:column;gap:1rem}
.row{background:var(--card);border:1px solid var(--line);border-radius:3px;
 padding:1.1rem;display:flex;flex-direction:column;gap:.65rem}
.who h3{font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:1.1rem;
 font-weight:700;margin:0;line-height:1.25}
.sub{margin:.15rem 0 0;font-size:.83rem;color:var(--soft)}
.tags{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.tag{font-size:.68rem;letter-spacing:.07em;text-transform:uppercase;
 padding:.22rem .55rem;border-radius:99px;border:1px dashed currentColor;
 color:var(--violet)}
.asked{font-family:"IBM Plex Mono",monospace;font-size:.74rem;color:var(--faint)}
.do{margin:0;font-size:.9rem;color:var(--soft)}
.note,.second{margin:0;font-size:.84rem;padding:.6rem .75rem;border-radius:2px}
.note{background:var(--warnbg);color:var(--warn)}
.second{background:var(--sunk);color:var(--soft)}
.msgbox{border:1px solid var(--line);border-radius:2px;overflow:hidden}
pre{margin:0;max-height:11rem;overflow:auto;padding:.8rem;background:var(--sunk);
 font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.76rem;
 line-height:1.65;white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.copy{width:100%;border:0;border-top:1px solid var(--line);background:var(--card);
 color:var(--soft);font:inherit;font-size:.82rem;padding:.7rem;cursor:pointer}
.copy:hover{color:var(--ink)}
.copy.ok{color:var(--wa);font-weight:600}
.go{display:block;text-align:center;text-decoration:none;font-weight:600;
 font-size:.95rem;padding:.95rem 1rem;border-radius:3px}
.go.wa{background:var(--wa);color:var(--wa-ink)}
.go.li{background:var(--li);color:var(--li-ink)}
.go:focus-visible,.copy:focus-visible{outline:3px solid var(--violet);
 outline-offset:2px}
.done{margin:2.5rem 0 0;padding:.9rem 1rem;background:var(--sunk);
 border-radius:2px;font-size:.84rem;color:var(--soft)}
.done b{color:var(--ink)}
footer{margin:2.5rem 0 0;padding-top:1.1rem;border-top:1px solid var(--line);
 font-size:.82rem;color:var(--faint)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
"""

JS = """
document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click', function(){
    var el = document.getElementById(b.dataset.t);
    var txt = el.textContent;
    function done(){ b.textContent = 'Copy ho gaya'; b.classList.add('ok');
      setTimeout(function(){ b.textContent = 'Message copy karo';
        b.classList.remove('ok'); }, 2200); }
    // Clipboard API needs a secure context and can be refused outright; the
    // selection fallback is what keeps the button honest on an older phone
    // browser rather than silently doing nothing.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, select);
    } else { select(); }
    function select(){
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) { done(); } else { b.textContent = 'Upar se select karke copy karo'; }
    }
  });
});
"""

PAGE = f"""<title>Aaj Kiske Paas Jaana Hai</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>{CSS}</style>
<div class="wrap">
<header>
  <h1>Ye {len(todo)} aapke haath se jaayenge</h1>
  <p class="lede">Email yahan se chala jaata hai — ye nahi. LinkedIn ka koi tool
  nahi hai aur Zapier ke task khatam hain, is liye comment aur DM mujhse nahi
  bhej sakte. Message likha hua taiyar hai; dabana aapko hai.</p>
  <div class="counts">
    <div class="count"><b>{len(wa)}</b>WhatsApp — link dabao, message bhara milega</div>
    <div class="count"><b>{len(li)}</b>LinkedIn — post kholo, comment paste karo</div>
    <div class="count"><b>{len(mailed)}</b>email ja chuki hai</div>
  </div>
</header>

<h2>WhatsApp</h2>
<p class="h2sub">Button dabate hi WhatsApp khulega aur message pehle se bhara
hoga. Bhejne se pehle ek baar padh lijiye — bas bhejna hai.</p>
<div class="list">{cards_wa}</div>

<h2>LinkedIn — comment ya DM</h2>
<p class="h2sub">Pehle "Message copy karo" dabaiye, phir post kholiye aur paste
kar dijiye. Comment DM se behtar chalta hai: post ke neeche baaki log bhi
padhte hain.</p>
<div class="list">{cards_li}</div>

<p class="done">Ja chuke hain: <b>{html.escape(done)}</b></p>

<footer>Zesst Now Services Private Limited · WhatsApp {WHATSAPP_SHOWN} ·
cognitivecapitalsuite.com<br>
Ye page nijee hai — link kisi ko mat bhejiye, ismein doosron ke number hain.</footer>
</div>
<script>{JS}</script>
"""

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "outbox/send.html")
out.write_text(PAGE, encoding="utf-8")
print(f"{len(todo)} cards ({len(wa)} WhatsApp, {len(li)} LinkedIn, "
      f"{len(mailed)} already emailed) -> {out}")
