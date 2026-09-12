# -*- coding: utf-8 -*-
"""The day's outreach, written per prospect.

Two rules from section 04 of the funnel, and everything here exists to keep
them: the first line says something true and specific about *this* business,
and the message asks for a reply rather than for a sale. A message that could
have been sent to a thousand people gets treated as if it was.

So the opener is generated from the signal that was measured for that row —
`no_site` and `no_form` are different facts and get different first lines — and
the second line is chosen by trade, because what a hotel loses by having no
website is not what a coaching centre loses.

WhatsApp is delivered as wa.me links rather than through an API. Every sending
route available here runs through an account that is out of quota, and a link
that opens WhatsApp with the text already filled in costs nothing, needs no
integration, and leaves the send in a human's hands — which for a first cold
message to a shopkeeper is where it belongs.

    python3 messages.py            → today's batch, from `pipeline.py due`
    python3 messages.py --all      → every row still at stage `new`
"""
import csv
import datetime as dt
import pathlib
import sys
import urllib.parse
import zoneinfo

IST = zoneinfo.ZoneInfo("Asia/Kolkata")
HERE = pathlib.Path(__file__).parent
PIPE = HERE / "pipeline.csv"
OUT = HERE / "outbox"

SITE = "https://www.cognitivecapitalsuite.com"
PORTFOLIO = "https://adnitinkumar.in"
SIGN = ("— सोनू शर्मा\nZesst Now Services Private Limited, कौशाम्बी\n"
        f"{SITE}")

DAILY_CAP = 10

# What this particular trade loses by being invisible. Never a generic line
# about "online presence" — the owner has heard that one and it is why the
# message gets ignored.
HOOK = {
    "होटल": "कमरा बुक करने से पहले लोग फ़ोटो, रेट और लोकेशन देखते हैं। न दिखे तो अगला होटल देख लेते हैं।",
    "गेस्ट हाउस": "कमरा बुक करने से पहले लोग फ़ोटो, रेट और लोकेशन देखते हैं। न दिखे तो अगला देख लेते हैं।",
    "कोचिंग": "दाख़िले से पहले माँ-बाप अब फ़ोन पर ही देखते हैं — कौन पढ़ाता है, बैच कब, फ़ीस कितनी।",
    "अस्पताल": "मरीज़ आने से पहले देखना चाहता है — डॉक्टर कौन, समय क्या, जगह कहाँ।",
    "डॉक्टर": "मरीज़ आने से पहले देखना चाहता है — कौन-सी जाँच होती है, समय क्या, रिपोर्ट कब।",
    "रेस्टोरेंट": "खाना कहाँ खाएँ, ये लोग मेन्यू और फ़ोटो देखकर तय करते हैं — फ़ोन करके नहीं पूछते।",
    "ट्रैवल": "गाड़ी बुक करने से पहले लोग रेट और रूट देखना चाहते हैं।",
    "फ़ाइनेंस": "पैसे के काम में लोग पहले देखते हैं कि आदमी कौन है, कब से है, कहाँ बैठता है।",
    "डेयरी": "थोक का ग्राहक रेट और सप्लाई की जानकारी पहले देखना चाहता है।",
}
HOOK_DEFAULT = ("आपके यहाँ क्या-क्या मिलता है — ये पूछने के लिए भी लोग अब "
                "पहले Google देखते हैं, फ़ोन बाद में करते हैं।")


def opener(r):
    """The first line. It states the measured fact, not an opinion about it."""
    if r["signal"] == "no_form":
        return (f'{r["business"]} की website तो है, पर उस पर पूछताछ का कोई '
                f'रास्ता नहीं — न कोई फ़ॉर्म, न WhatsApp बटन। जो आदमी साइट तक '
                f'पहुँच गया, वो वहीं रुक जाता है।')
    if r["signal"] == "dead_site":
        return (f'{r["business"]} की website का पता तो है, पर वो खुलती नहीं। '
                f'जो आदमी उसे खोलता है, उसे लगता है दुकान बंद हो गई।')
    return (f'{r["business"]} — Google पर आपकी जगह दिखती है, नंबर भी है, पर '
            f'website का कोई लिंक नहीं।')


def whatsapp(r):
    return "\n\n".join([
        "नमस्ते 🙏",
        opener(r),
        HOOK.get(r["trade"], HOOK_DEFAULT),
        f"हम कौशाम्बी के ही हैं। यहीं का एक काम — {PORTFOLIO} — अधिवक्ता नितिन "
        f"कुमार जी की साइट, जिस पर लोग फ़ीस भी ऑनलाइन देते हैं।",
        "आपके लिए क्या बन सकता है, दो मिनट में बता दूँगा। जवाब दे दीजिए तो बात कर लें।",
        SIGN,
    ])


def email(r):
    subject = {
        "no_form": f'{r["business"]} की साइट पर पूछताछ का कोई रास्ता नहीं है',
        "dead_site": f'{r["business"]} की website खुल नहीं रही',
    }.get(r["signal"], f'{r["business"]} की Google listing में website का लिंक नहीं है')

    body = "\n\n".join([
        "नमस्ते,",
        opener(r),
        HOOK.get(r["trade"], HOOK_DEFAULT),
        f"हम कौशाम्बी में ही हैं। एक काम यहीं किया है — {PORTFOLIO}, अधिवक्ता "
        f"नितिन कुमार जी की साइट, जिस पर लोग फ़ीस भी ऑनलाइन देते हैं और "
        f"अपॉइंटमेंट भी लेते हैं। हमारा अपना प्रोडक्ट bizgstpro.com है।",
        f'{r["business"]} के लिए क्या बन सकता है, ये मैं दो मिनट में बता सकता '
        f'हूँ। इस मेल का जवाब दे दीजिए, या नंबर बता दीजिए तो मैं कॉल कर लूँ।',
        SIGN,
    ])
    return subject, body


def link(phone, text):
    """wa.me needs the country code and no plus sign. A ten-digit local number
    sent as-is opens a chat with the wrong person in another country."""
    num = phone if phone.startswith("91") and len(phone) == 12 else "91" + phone
    return f"https://wa.me/{num}?text=" + urllib.parse.quote(text)



def followup2(r):
    """The day-2 WhatsApp. It must not repeat the first message.

    Short on purpose: this touch is a nudge, not a second pitch. The one thing
    it adds is an explicit way out — "वरना कोई बात नहीं" — because giving
    somebody permission to say no is what makes the ones who are interested
    actually answer instead of going quiet.
    """
    return "\n\n".join([
        f'नमस्ते 🙏 मैंने {r["business"]} की website के बारे में लिखा था।',
        "देख लिया हो तो बता दीजिए — वरना कोई बात नहीं, मैं दोबारा परेशान नहीं करूँगा।",
        "— सोनू शर्मा, Zesst Now, कौशाम्बी",
    ])


def main():
    rows = list(csv.DictReader(PIPE.open(encoding="utf-8")))
    fresh = [r for r in rows if r["stage"] == "new"]
    # Two channels beat one: a prospect who can be emailed *and* messaged gets
    # two chances to notice, so those rows go out first while the list is long
    # enough that the order still matters.
    fresh.sort(key=lambda r: (not r["email"], r["town"], r["business"]))
    batch = fresh if "--all" in sys.argv else fresh[:DAILY_CAP]
    today = dt.datetime.now(IST).date()

    OUT.mkdir(exist_ok=True)
    md = [f"# Day 1 — {today} ({today.strftime('%A')})", "",
          f"{len(batch)} प्रस्ताव। हर लिंक दबाइए, WhatsApp खुलेगा, message पहले "
          f"से भरा होगा — बस भेजना है।", ""]

    emails = []
    for r in batch:
        t = whatsapp(r)
        md += [f"## {r['id']} · {r['business']}",
               f"`{r['trade']} · {r['town']} · {r['signal']}`", "",
               f"**[WhatsApp खोलें → {r['phone']}]({link(r['phone'], t)})**", "",
               "```", t, "```", ""]
        if r["email"]:
            s, b = email(r)
            emails.append(dict(id=r["id"], to=r["email"],
                               business=r["business"], subject=s, body=b))
            md += [f"**Email:** {r['email']} — *भेजा जा रहा है*", ""]
        md.append("---")

    (OUT / f"whatsapp-{today}.md").write_text("\n".join(md), encoding="utf-8")

    import json
    (OUT / f"email-{today}.json").write_text(
        json.dumps(emails, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"{len(batch)} WhatsApp messages -> {OUT}/whatsapp-{today}.md")
    print(f"{len(emails)} emails queued   -> {OUT}/email-{today}.json")
    for e in emails:
        print(f"  {e['id']}  {e['to']}")


if __name__ == "__main__":
    main()
