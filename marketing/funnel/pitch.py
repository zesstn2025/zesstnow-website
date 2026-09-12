# -*- coding: utf-8 -*-
"""The pitch. Written against what these buyers actually say they are afraid of.

Read enough of these threads and the same anxiety keeps surfacing, in the
prospects' own words rather than ours:

  "One agency quotes ₹4L. Another quotes ₹15L. You don't know why."
  "You asked three agencies to quote your app. One said ₹2.5 lakhs. One said
   ₹9 lakhs. One sent a document worth ₹22 lakhs."
  "If an agency cannot answer all seven clearly and in writing, the number on
   that quote is a guess — not an estimate."

Nobody is short of agencies. What they cannot get is a number they can trust,
and the reason quotes diverge tenfold is that each agency silently assumed a
different scope. So the pitch does the one thing forty competing comments do
not: it states the assumptions out loud, says what is NOT included, names who
owns the code, and fixes the milestones. That is what "premium" means here —
not adjectives, but removing the buyer's risk of being wrong.

Three rules this file keeps:

  1. Never open with who we are. Open with something true about THEIR project.
     A capability list is invisible; forty of them sit under every post.
  2. State the band, the timeline and the terms up front. Anyone who makes a
     buyer ask for the price twice has already lost to whoever didn't.
  3. Say what is excluded. It is the single most credible paragraph available,
     because no one else writes it.
"""
from pricing import (WEBSITE, APP, TERMS, band, booking_block,
                     WHATSAPP, WHATSAPP_SHOWN, BOOK_SITE)

TIERS = {t["id"]: t for t in WEBSITE + APP}

SITE = "https://www.cognitivecapitalsuite.com"
PORT_CLIENT = "https://adnitinkumar.in"
PORT_OWN = "https://bizgstpro.com"
SIGN_NAME = "Sonu Sharma"
SIGN_CO = "Zesst Now Services Private Limited"

# What a website quote at our bands does NOT cover. Saying this unprompted is
# the paragraph that separates a quote from a guess — and it is the paragraph
# that stops an argument in week three, which is worth more than the project.
EXCLUDED = [
    "Content and photography. We structure and edit what you give us; we do not "
    "invent product descriptions or shoot your catalogue.",
    "Paid ads, and the budget behind them.",
    "Third-party licences and fees — payment gateway charges, premium plugins, "
    "stock imagery, SMS or WhatsApp API credits.",
    "Ongoing feature work after launch. The build is fixed-price; anything new "
    "afterwards is quoted before it starts, never billed as a surprise.",
]

ASSUMPTIONS = (
    "This band assumes: one round of structural feedback and one of detail, "
    "content supplied by you in usable form, and a single decision-maker to sign "
    "off. Those three are what actually move a project from seven days to seven "
    "weeks, so they are stated rather than discovered."
)

OWNERSHIP = (
    "You own the code, the domain and the hosting account outright on final "
    "payment. No lock-in, no monthly hostage fee, and if you move to another "
    "team later we hand over cleanly."
)


def _tier(lead):
    t = TIERS[lead["tier"]]
    return t, band(t["low"], t["high"])


def _wants_app(lead):
    return any(w in lead["need"].lower()
               for w in ("app", "ios", "android", "flutter", "play store"))


def comment(lead):
    """Short enough to be read in a feed. Leads on their project, then the
    number, then one thing nobody else in the thread has said."""
    t, price = _tier(lead)
    who = lead["first"] or lead["name"]
    app_line = ""
    if _wants_app(lead):
        a1, a2 = APP[0], APP[1]
        app_line = (f"\n\nThe app is a separate line, always — "
                    f"{band(a1['low'], a1['high'])} for one platform, "
                    f"{band(a2['low'], a2['high'])} for both. Quoting an app "
                    f"inside a website price is how a number ends up meaning "
                    f"nothing.")
    return (
f"""{who} — {lead['hook']}

{t['name']}: {price}, {t['days']} working days, 25% to start and the balance on delivery. One year of hosting included.{app_line}

What that does not include: content and photography, paid ad spend, and third-party fees like gateway charges or plugin licences. You own the code, domain and hosting on final payment — no lock-in.

Two things you can open rather than take on trust:
{PORT_CLIENT} — a client's site with online payments, a dues check and appointment booking
{PORT_OWN} — our own product, which we run and support ourselves

{SIGN_CO}, a registered company. Book a call whichever way suits — WhatsApp {WHATSAPP_SHOWN} (wa.me/{WHATSAPP}), {BOOK_SITE}, or reply here.""")


def email(lead):
    t, price = _tier(lead)
    who = lead["first"] or lead["name"]
    subject = f"{t['name']} — {price}, {t['days']} working days, and what it excludes"

    apps = ""
    if _wants_app(lead):
        a1, a2 = APP[0], APP[1]
        apps = (
f"""
THE APP, PRICED SEPARATELY

  One platform            {band(a1['low'], a1['high'])}   {a1['days']} working days
  Android and iOS         {band(a2['low'], a2['high'])}   {a2['days']} working days

It is a separate line every time. An app folded into a website price is the
reason three agencies can quote you three numbers that differ by a factor of
five — each one quietly assumed a different thing. Ours is written down so you
can hold us to it.
""")

    body = (
f"""Hi {who},

You posted on {lead['asked']} looking for a developer. {lead['hook']}

THE NUMBER, FIRST

  {t['name']}   {price}   {t['days']} working days
{chr(10).join('    · ' + h for h in t['has'])}

  {TERMS['note']}
{apps}
WHAT THIS BAND ASSUMES

{ASSUMPTIONS}

WHAT IT DOES NOT INCLUDE

{chr(10).join('  · ' + e for e in EXCLUDED)}

I am writing that down because you will get several quotes and they will not
agree with each other. They rarely disagree about the work — they disagree
about what each one silently assumed. The only way to compare them is if
somebody tells you what is outside the line.

WHO OWNS WHAT

{OWNERSHIP}

WHO YOU WOULD BE WORKING WITH

{SIGN_CO}, a registered company in Kaushambi, Uttar Pradesh. Two things you can
open in ten seconds instead of reading claims:

  {PORT_CLIENT}
      A client's site. Online fee payment, a pending-dues check and appointment
      booking. Transactions, not a brochure.

  {PORT_OWN}
      Our own product, which we build, run and support ourselves. Support is not
      a line we added to win work.

ONE QUESTION

{lead.get('question', 'What does the site need to make a visitor actually do — enquire, buy, or book? The answer changes the build more than any feature list does.')}

Answer that and the next mail is a fixed quote with a delivery date, not a band.

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
