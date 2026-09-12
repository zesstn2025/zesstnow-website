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
from pricing import (WEBSITE, APP, PARTNER, EQUITY, EQUITY_BENCHMARK, TERMS,
                     band, rate, booking_block,
                     WHATSAPP, WHATSAPP_SHOWN, BOOK_SITE)

TIERS = {t["id"]: t for t in WEBSITE + APP}


def _w(text, width=78, first="", rest=""):
    """Hard-wrap a constant into the email's column.

    The constants above are written as single long strings so they can be
    reused in a comment box, a web page and an email without three copies
    drifting apart. An email client shows them as one unbroken line that runs
    off the side on a phone, next to paragraphs that are neatly wrapped — which
    reads as carelessness in a message whose entire argument is that we are
    careful about detail. So the wrapping happens at the point of use.
    """
    import textwrap
    return "\n".join(textwrap.wrap(text, width, initial_indent=first,
                                   subsequent_indent=rest))

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

# The fallback closing question, hoisted out of the f-string: a backslash
# cannot appear inside an f-string expression, so a multi-line default has to
# live somewhere the formatter can simply reference.
DEFAULT_QUESTION = (
    "What does the site need to make a visitor actually do — enquire, buy, or "
    "book? The answer changes the build more than any feature list does."
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

{_w(f"You posted on {lead['asked']} looking for a developer. {lead['hook']}")}

THE NUMBER, FIRST

  {t['name']}   {price}   {t['days']} working days
{chr(10).join(_w(h, 78, '    · ', '      ') for h in t['has'])}

{_w(TERMS['note'], 78, '  ', '  ')}
{apps}
WHAT THIS BAND ASSUMES

{_w(ASSUMPTIONS)}

WHAT IT DOES NOT INCLUDE

{chr(10).join(_w(e, 78, '  · ', '    ') for e in EXCLUDED)}

I am writing that down because you will get several quotes and they will not
agree with each other. They rarely disagree about the work — they disagree
about what each one silently assumed. The only way to compare them is if
somebody tells you what is outside the line.

WHO OWNS WHAT

{_w(OWNERSHIP)}

WHO YOU WOULD BE WORKING WITH

{_w(SIGN_CO + ', a registered company in Kaushambi, Uttar Pradesh. Two '
     'things you can open in ten seconds instead of reading claims:')}

  {PORT_CLIENT}
      A client's site. Online fee payment, a pending-dues check and appointment
      booking. Transactions, not a brochure.

  {PORT_OWN}
      Our own product, which we build, run and support ourselves. Support is not
      a line we added to win work.

ONE QUESTION

{_w(lead.get('question') or DEFAULT_QUESTION)}

Answer that and the next mail is a fixed quote with a delivery date, not a band.

{booking_block()}

— {SIGN_NAME}
{SIGN_CO}
{SITE}""")
    return subject, body


# ── track: partner ────────────────────────────────────────────────────────────
#
# These are agencies who posted a HIRING advert. They are not buying a website
# and a website quote would be read as spam by someone who can see at a glance
# that it is. What they are actually short of is delivery capacity, which is a
# thing they buy every week — just under a different name and from a supplier,
# not a vendor.
#
# The one rule this track keeps that the retail pitch does not: never sell to
# their client. An agency's entire fear about subcontracting is that the
# subcontractor eventually takes the account. Saying so first, unprompted, is
# the whole pitch.

PARTNER_TIERS = {t["id"]: t for t in PARTNER}

NON_COMPETE = (
    "We do not contact your client, are not named to your client, and do not "
    "take work from your client afterwards. In writing before anything starts, "
    "if you want it in writing. That is the only real question about "
    "subcontracting and it should not have to be asked."
)


def partner_comment(lead):
    who = lead["first"] or lead["name"]
    h = PARTNER_TIERS["partner-hourly"]
    d = PARTNER_TIERS["partner-dedicated"]
    return (
f"""{who} — you are hiring, not buying, so this is not a pitch for your project. It is a line you can call when a deadline lands and the hire has not started yet.

We work white-label for agencies: {rate(h)} for overflow, {rate(d)} for a full-time dedicated developer, and retainers in between. Your brand on everything, ours on nothing.

{NON_COMPETE}

{PORT_CLIENT} — a client build with online payments and appointment booking
{PORT_OWN} — our own product, which we run and support ourselves

{SIGN_CO}, a registered company. WhatsApp {WHATSAPP_SHOWN} (wa.me/{WHATSAPP}) or reply here.""")


def partner_email(lead):
    who = lead["first"] or lead["name"]
    subject = (f"White-label delivery for {lead.get('firm') or 'your agency'} — "
               f"rates, and the non-compete in writing")
    rows = "\n".join(
        f"  {t['name']:<38} {rate(t)}\n      {t['fits']}"
        for t in PARTNER)
    body = (
f"""Hi {who},

You posted on {lead['asked']} hiring a developer. This is not an application and
it is not a quote for a website — you are not buying one. It is a supplier
introduction, which is a different thing and takes two minutes to read.

A hire takes four to eight weeks to find and another four to be useful. The
work that lands in between is what subcontracting is for.

WHAT WE CHARGE AGENCIES

{rows}

  Per-build work is our retail band less 30%. You keep the margin and you keep
  the client. ₹25,000 is the floor and it does not move — below that a year of
  hosting, a working enquiry path and real hours on the client's copy cannot
  all be paid for, and a supplier who pretends otherwise becomes your problem
  in week three.

THE PART THAT ACTUALLY MATTERS

{_w(NON_COMPETE)}

HOW IT RUNS

  · Code in your repository from day one — not handed over at the end
  · A written standup daily, so you can forward it to your client as your own
  · Your sprint board, your ceremonies, your client-facing language
  · One month's notice either way on a dedicated developer; no lock-in anywhere

WHAT WE ARE

{_w(SIGN_CO + ', a registered company in Kaushambi, Uttar Pradesh. Two things '
     'you can open rather than take on trust:')}

  {PORT_CLIENT}
      A client's site — online payment, a pending-dues check, appointment
      booking. Transactions, not a brochure.

  {PORT_OWN}
      Our own product, which we build, run and support ourselves.

ONE QUESTION

What is the thing you are currently turning down or pushing out because there
is nobody free? That is the piece worth starting on, and it is usually smaller
than the hire you are recruiting for.

{booking_block()}

— {SIGN_NAME}
{SIGN_CO}
{SITE}""")
    return subject, body


# ── track: equity / co-founder ────────────────────────────────────────────────
#
# Vinay Sattu wrote "I'm not looking to outsource this to an agency" in his own
# post. So the first paragraph has to acknowledge that he said it — otherwise
# the message proves it was not read, and everything after it is wasted.
#
# The honest structure is to lead with the CASH option, not the equity one.
# The market's own benchmark says a senior contract team builds the same MVP
# for ₹12–25 lakh and takes no equity, and a founder who does not know that is
# being sold to rather than advised. Leading with the option that is worse for
# us is the only version of this pitch that is worth sending.

EQ_TIERS = {t["id"]: t for t in EQUITY}


def equity_comment(lead):
    who = lead["first"] or lead["name"]
    c, h, f = EQ_TIERS["eq-cash"], EQ_TIERS["eq-hybrid"], EQ_TIERS["eq-cofounder"]
    return (
f"""{who} — you said you are looking for a co-founder, not an agency, and that is worth taking at face value rather than arguing with. So three shapes, and the first one is the one that is worse for us:

1. Cash, no equity — {rate(c)}, MVP in 6–8 weeks, you keep 100% of the company.
2. Half cash, small equity — {rate(h)}, 4-year vest, 1-year cliff.
3. Equity only, technical co-founder — {rate(f)} post-MVP, 25–40% pre-MVP. Market rate, not a negotiating position.

Most founders asking this question should take option 1 and do not know it, because a 25% slice bought at idea stage costs more than the build ever would.

{PORT_OWN} is our own product — we built, run and support it. That is the thing worth judging, not a deck.

Happy to talk on any of the three. WhatsApp {WHATSAPP_SHOWN} (wa.me/{WHATSAPP}).""")


def equity_email(lead):
    who = lead["first"] or lead["name"]
    subject = "Three ways to do this — and the first one is the one that is worse for us"
    rows = "\n".join(
        f"  {t['name']:<38} {rate(t)}\n      {t['fits']}\n"
        + "\n".join(_w(h, 78, "        · ", "          ") for h in t["has"])
        for t in EQUITY)
    body = (
f"""Hi {who},

{_w(f"You posted on {lead['asked']} looking for a technical co-founder. "
     f"{lead['hook']}")}

I am writing as a company, which is the thing you said you were not looking for,
so let me deal with that first rather than hope you skip it. We are not applying
to be your co-founder by default. There are three shapes this can take, and
which one is right depends entirely on how far the product already is and how
close your raise is. One of them involves no equity at all.

THE THREE

{rows}

WHAT YOU ARE COMPARING THIS AGAINST

{_w(EQUITY_BENCHMARK)}

THE PART MOST PEOPLE PITCHING YOU WILL NOT SAY

If you have or can raise the cash, take the first option. A 25% slice granted at
idea stage is the most expensive money a founder ever spends — it is priced
before the company is worth anything and it does not reprice when it is. The
only good reasons to give equity instead of cash are that you genuinely cannot
pay, or that you want someone whose downside is tied to yours for the next four
years. Both are real reasons. Neither is "it is cheaper", because it is not.

If it is the second reason, then the 4-year vest with a 1-year cliff is not a
formality and we would not ask you to waive it. A co-founder who leaves in month
five and keeps 25% is the single most common way an early cap table becomes
unfundable.

WHO WOULD ACTUALLY BE DOING THE WORK

{_w(SIGN_CO + ', a registered company in Kaushambi, Uttar Pradesh.')}

  {PORT_OWN}
      Our own product. We designed it, built it, run it and answer its support.
      Judge that rather than a deck — it is the only evidence that means
      anything for a co-founder conversation.

  {PORT_CLIENT}
      A client build: online payment, pending-dues check, appointment booking.

ONE QUESTION

What has to be true in 90 days for you to be able to raise? Whether the answer
is a working MVP, ten paying users, or a demo that survives a live call changes
which of the three options above is correct — and it is the only question worth
settling before we talk about percentages.

{booking_block()}

— {SIGN_NAME}
{SIGN_CO}
{SITE}""")
    return subject, body


# ── track: freelance ──────────────────────────────────────────────────────────
#
# Her post ends "PS: no agencies." The wrong answer is to pitch anyway; the
# other wrong answer is to pretend to be a freelancer, which is a lie that
# collapses the moment she looks anyone up. The right answer is to say who is
# doing the work, name him, and let her decide whether that counts.

def freelance_comment(lead):
    who = lead["first"] or lead["name"]
    t = TIERS["business"]
    return (
f"""{who} — you wrote "no agencies", so: I am {SIGN_NAME}, and I would be the one writing the code. I am not going to pretend I am not attached to a company, because you would find out in one search and rightly stop reading.

What "no agencies" usually means is no account manager between you and the developer, no handover to a junior after the contract is signed, and no chasing. You would have my number and nobody else's.

{t['name']}: {band(t['low'], t['high'])}, {t['days']} working days, 25% to start. One year of hosting. You own the code.

{PORT_CLIENT} — I built that one. Online payments, dues check, appointment booking.

If you meant it literally and want a person with no company behind them, that is completely fair and I will leave it there. WhatsApp {WHATSAPP_SHOWN} if not.""")


# ── track: budget ─────────────────────────────────────────────────────────────
#
# ₹12,000 for Apple-style 3D scroll animation. A stranger already told him in
# his own comments that it cannot be done at that price. Repeating that is
# useless. The only message with any value tells him what ₹12,000 DOES buy and
# what the 3D version actually costs, so he can decide instead of guess.

def budget_comment(lead):
    who = lead["first"] or lead["name"]
    t = TIERS["business"]
    return (
f"""{who} — somebody already told you 12k does not buy 3D scroll animation, which is true and also useless on its own. So here is the actual shape of it.

What ₹12,000 buys anywhere honest: a single-page site, real photographs of the product shot well, fast load, and a WhatsApp enquiry button. No 3D. For an LED brand that is not a bad first site — the product photography carries it, and it is the thing a distributor actually forwards.

What the site you described costs: {band(t['low'], t['high'])} and {t['days']} working days at the low end, more if the 3D models have to be built rather than supplied. The Apple pages you are thinking of are WebGL with a modelled product and a scroll timeline — the modelling is most of the bill, not the code.

The middle option, and the one I would take: build the ₹25,000 version now, shoot the product properly, and add the 3D on one hero product later when there is revenue to justify it. It is the same site, not a rebuild.

Either way you are better off knowing the three numbers than being told no. WhatsApp {WHATSAPP_SHOWN} (wa.me/{WHATSAPP}) if you want the detail.""")


if __name__ == "__main__":
    import sys
    from leads import LEADS
    want = sys.argv[1] if len(sys.argv) > 1 else "LI001"
    lead = next(l for l in LEADS if l["id"] == want)
    fn = {"partner": partner_email, "equity": equity_email}.get(
        lead.get("track"), email)
    s, b = fn(lead)
    print("SUBJECT:", s, "\n"); print(b)
