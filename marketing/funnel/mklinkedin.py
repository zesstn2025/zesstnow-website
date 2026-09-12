# -*- coding: utf-8 -*-
"""The LinkedIn round: one page, one pitch per prospect, ready to send.

Every person here PUBLISHED a request for quotes. That is the whole reason this
is not cold outreach and the reason the pitch may lead with a price: they asked
for one. It also sets the bar — their post already carries six to twelve agency
comments, all of them a list of capabilities. A capability list is invisible.
What is not invisible is a number, a date, and something specific about their
own business.
"""
import csv, datetime as dt, html, pathlib, urllib.parse

HERE = pathlib.Path(__file__).parent
TODAY = dt.date(2026, 9, 12)
PORT = "https://adnitinkumar.in"

def age(d): return (TODAY - dt.date.fromisoformat(d)).days

def pitch(r):
    """Short enough for a LinkedIn comment, which is where it gets seen."""
    return (
f"""नमस्ते {r['name'].split('—')[0].split('/')[0].strip()},

आपकी {r['asked']} वाली पोस्ट देखी — {r['need_hi']}

सीधा दाम पहले, क्योंकि बाक़ी जवाबों में वो नहीं मिलेगा:
पूरी professional website — ₹50,000, एक साल की hosting साथ में। 25% शुरू में, बाक़ी delivery पर। 7 काम के दिन।

भरोसे के लिए दो चीज़ें अभी खोलकर देख लीजिए:
{PORT} — क्लाइंट की साइट, जिस पर ऑनलाइन फ़ीस, बक़ाया जाँच और अपॉइंटमेंट तीनों चलते हैं
https://bizgstpro.com — हमारा अपना GST प्रोडक्ट, जो हम ख़ुद चलाते हैं

Zesst Now Services Private Limited — रजिस्टर्ड कंपनी है, फ्रीलांसर नहीं।

— सोनू शर्मा
https://www.cognitivecapitalsuite.com""")

NEED_HI = {
 "LI001": "ऑफ़लाइन धंधे को B2B+B2C e-commerce पर लाना है, और बनाने के बाद सँभालने वाला भी चाहिए।",
 "LI002": "एक professional, responsive website बनवानी है।",
 "LI003": "नए धंधे के लिए multi-page website — quote form, SEO और तेज़ loading के साथ।",
 "LI004": "99acres जैसा real-estate marketplace — website और Android/iOS दोनों।",
 "LI005": "एक जाने-पहचाने धंधे के लिए professional website / web app, और आप भारत की ही कंपनी चाहते हैं।",
 "LI006": "SKS Logistics के लिए website, corporate email और iOS+Android app।",
 "LI007": "website + Android/iOS app, और आपने portfolio, stack, timeline और cost breakup माँगा है।",
 "LI008": "chhabili.com अधूरा पड़ा है और उसे पूरा करके ठीक करना है।",
 "LI009": "D2C seafood ब्रांड के लिए consumer app और conversion-focused website।",
 "LI010": "Maa Vindhwasini Enterprises के लिए company profile, product showcase, enquiry form और SEO।",
}

FLAG = {
 "LI002": "⚠ पोस्ट में साफ़ लिखा है <b>“no agencies”</b>। कंपनी के नाम से pitch करना उनकी कही बात को अनदेखा करना है — या तो व्यक्ति के तौर पर लिखिए, या छोड़ दीजिए।",
 "LI004": "⚠ website + iOS + Android। ₹50,000 इसमें पूरा नहीं पड़ता — उसी thread में ₹1.5L–3L के quote पड़े हैं। website का दाम बताइए, app अलग से scope कीजिए।",
 "LI006": "⚠ app भी माँगा है — ₹50,000 सिर्फ़ website का है, ये साफ़ लिखिए।",
 "LI007": "⚠ app भी माँगा है — website का दाम अलग, app अलग।",
 "LI008": "पहले chhabili.com खोलिए। जो ख़राबी दिखे वही पहली लाइन में लिखिए — यही सबसे तेज़ी से deal बंद कराता है।",
 "LI009": "130 दिन पुरानी पोस्ट — शायद भर चुकी। सबसे आख़िर में।",
 "LI010": "187 दिन पुरानी — लगभग पक्का भर चुकी। सिर्फ़ तब, जब बाक़ी सब हो जाएँ।",
}

rows = list(csv.DictReader((HERE / "linkedin.csv").open(encoding="utf-8")))
cards = []
for r in rows:
    r["need_hi"] = NEED_HI[r["id"]]
    a = age(r["asked"])
    fresh = "fresh" if a <= 14 else ("warm" if a <= 40 else "cold")
    txt = pitch(r)
    acts = [f'<a class="btn li" href="{r["li"]}" target="_blank" rel="noopener">'
            f'पोस्ट खोलें → comment / DM</a>']
    if r["email"]:
        acts.append('<span class="sent">✓ मेल भेज दिया गया</span>')
    if r["wa"]:
        acts.append(f'<a class="btn wa" href="https://wa.me/91{r["wa"]}?text='
                    f'{urllib.parse.quote(txt)}" target="_blank" rel="noopener">'
                    f'WhatsApp → {r["wa"]}</a>')
    cards.append(f"""
<article class="card">
  <header>
    <div><h2>{html.escape(r['name'])}</h2>
      <p class="meta"><span class="id">{r['id']}</span><i>·</i>{html.escape(r['where'])}
      <i>·</i>पोस्ट {r['asked']} <b>({a} दिन पुरानी)</b></p></div>
    <span class="chip {fresh}">{ {'fresh':'ताज़ा','warm':'गुनगुनी','cold':'ठंडी'}[fresh] }</span>
  </header>
  <p class="need">{html.escape(r['need'])}</p>
  {f'<p class="flag">{FLAG[r["id"]]}</p>' if r['id'] in FLAG else ''}
  <pre class="msg">{html.escape(txt)}</pre>
  <div class="act">{''.join(acts)}</div>
</article>""")

page = (HERE / "linkedin_template.html").read_text(encoding="utf-8")
out = HERE / "outbox" / f"linkedin-{TODAY}.html"
out.write_text(page.replace("__CARDS__", "\n".join(cards))
                   .replace("__N__", str(len(rows))), encoding="utf-8")
print(f"{len(rows)} cards -> {out}")
