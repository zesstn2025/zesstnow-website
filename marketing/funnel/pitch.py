# -*- coding: utf-8 -*-
"""The pitch, in English, in two lengths.

`comment()` is what goes under the post. Every one of these threads already
carries six to twelve agency comments and they are all the same shape — "we
specialize in..." followed by a list. That shape is invisible. Three things are
not: a number, a date, and one sentence that proves the post was actually read.
So the comment is short, leads with the band, and opens on their own project.

`email()` is the longer version for the people who published an address. It
adds the terms, the portfolio and an actual question, because a mail that ends
without a question ends the thread.

Nothing here claims a capability we cannot show. The two portfolio links are
both live and both openable in ten seconds, which is the point of them.

Both versions end on a booking route rather than "happy to connect". Three are
offered because people differ: WhatsApp gets answered the same hour, the site's
contact page suits somebody not ready to talk yet, and a LinkedIn reply costs
them nothing since they are already there.
"""
from pricing import WEBSITE, APP, TERMS, band, booking_block, WHATSAPP, WHATSAPP_SHOWN, BOOK_SITE

TIERS = {t["id"]: t for t in WEBSITE + APP}

SITE = "https://www.cognitivecapitalsuite.com"
PORT_CLIENT = "https://adnitinkumar.in"
PORT_OWN = "https://bizgstpro.com"
SIGN_NAME = "Sonu Sharma"
SIGN_CO = "Zesst Now Services Private Limited"


def _price(lead):
    t = TIERS[lead["tier"]]
    return t, band(t["low"], t["high"])


def comment(lead):
    t, price = _price(lead)
    who = lead["first"] or lead["name"]
    return (
f"""{who} — {lead['hook']}

Straight numbers, since the thread is full of capability lists: {t['name'].lower()} of this scope runs {price}, {t['days']} working days, 25% to start and the balance on delivery. One year of hosting included.

Two things you can open rather than take on trust:
{PORT_CLIENT} — a client's site with online payments, a dues check and appointment booking
{PORT_OWN} — our own product, which we run and support ourselves

{SIGN_CO}, a registered company.

If the brief is still open, book a call whichever way suits — WhatsApp {WHATSAPP_SHOWN} (wa.me/{WHATSAPP}), {BOOK_SITE}, or just reply here.""")


def email(lead):
    t, price = _price(lead)
    who = lead["first"] or lead["name"]
    subject = f"{t['name']} — {price}, {t['days']} working days"

    apps = ""
    if any(w in lead["need"].lower() for w in ("app", "ios", "android", "flutter")):
        a1, a2 = APP[0], APP[1]
        apps = (
f"""\nYou also mentioned an app. That is priced separately and honestly it has to be — one platform is {band(a1['low'], a1['high'])} over {a1['days']} working days, Android and iOS together {band(a2['low'], a2['high'])} over {a2['days']}. Anyone quoting you an app inside a website price is going to make it back somewhere you will not enjoy.\n""")

    body = (
f"""Hi {who},

You posted on {lead['asked']} looking for a developer. {lead['hook']}

The number first, because most replies to that post will not give you one.

{t['name']} — {price}, {t['days']} working days.
{chr(10).join('  · ' + h for h in t['has'])}

{TERMS['note']}
{apps}
Who you would be working with: {SIGN_CO}, a registered company in Kaushambi, Uttar Pradesh. Rather than a list of claims, two things you can open right now:

  {PORT_CLIENT} — a client's site. Online fee payment, a pending-dues check and appointment booking. Not a brochure.
  {PORT_OWN} — our own GST product, which we run and support ourselves. Support is not a line item we added to win work.

One question so the next mail is a real quote rather than a guess: {lead.get('question', 'what does the business need the site to actually do for a visitor — enquire, buy, or book?')}

{booking_block()}

— {SIGN_NAME}
{SIGN_CO}
{SITE}""")
    return subject, body


if __name__ == "__main__":
    import sys
    from leads import LEADS
    want = sys.argv[1] if len(sys.argv) > 1 else "LI001"
    lead = next(l for l in LEADS if l["id"] == want)
    s, b = email(lead)
    print("SUBJECT:", s, "\n"); print(b)
    print("\n" + "="*70 + "\nCOMMENT:\n"); print(comment(lead))
