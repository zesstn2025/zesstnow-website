# -*- coding: utf-8 -*-
"""What we charge, and the reason the range is a range.

A single flat price is the fastest way to lose a good project and win a bad
one. The LinkedIn threads these prospects posted in prove it: one asks for a
300-product store with a ₹1,00,000 budget, another asks for Apple-style 3D
scroll animation on ₹12,000 — and a stranger in his own comments told him
"12k not possible for 3d interactive websites". Quoting one number to both
means either walking away from the first or failing the second.

So the quote names the band and the one thing that decides which band: how
much of the work is *building software* versus *presenting a business*.

Terms are fixed and stated up front, because nobody else in those threads
states them: 25% to start, the balance on delivery, one year of hosting
included with every website.

THE FLOOR IS ₹25,000 AND THERE IS NOTHING BELOW IT.

An earlier version carried a ₹5,000–15,000 "starter" band. It was removed, and
not for positioning. At that price a year of hosting, a domain, an enquiry path
that actually reaches a phone, real photographs and the hours to get a client's
copy right cannot all be paid for — so it is either a loss or a worse site than
the client was promised. Quoting it also anchors every later conversation
against our own cheapest number. If a prospect cannot reach ₹25,000, the honest
answer is to say so and leave; it is not to invent a tier that loses money.
"""

WEBSITE = [
    dict(id="business", low=25_000, high=50_000, days=7,
         name="Business site",
         fits="A firm that sells on credibility — consultants, clinics, manufacturers",
         has=["6–15 pages", "Content you can edit yourself", "Blog",
              "Technical SEO + structured data", "Analytics",
              "Enquiry routing to email and WhatsApp", "1 year hosting"]),
    dict(id="commerce", low=60_000, high=1_00_000, days=14,
         name="Commerce site",
         fits="Selling online: catalogue, payments, orders",
         has=["Product catalogue and categories", "Cart and checkout",
              "Payment gateway", "Order and inventory management",
              "Customer accounts", "SEO for product pages", "1 year hosting"]),
    dict(id="platform", low=1_00_000, high=1_50_000, days=28,
         name="Platform",
         fits="B2B + B2C together, dealer pricing, dashboards, integrations",
         has=["Everything in Commerce", "B2B pricing tiers and dealer logins",
              "Admin dashboard and roles", "Third-party integrations and APIs",
              "Bulk / repeat ordering", "1 year hosting"]),
]

APP = [
    dict(id="app-one", low=1_00_000, high=1_50_000, days=35,
         name="App — one platform",
         fits="Android or iOS, launched as an MVP with the features that matter",
         has=["Native-quality build", "Backend and APIs", "Admin panel",
              "Push notifications", "Store submission"]),
    dict(id="app-both", low=1_50_000, high=2_50_000, days=56,
         name="App — Android + iOS",
         fits="Both stores, shared backend with the website",
         has=["Android and iOS", "Shared backend with the site",
              "Payments in-app", "Admin dashboard", "Both store submissions",
              "Post-launch support"]),
]

# ── the tier above the rate card, and why it had to exist ────────────────────
#
# Added 15 September 2026. Everything above tops out at ₹2.5L, and that ceiling
# was quietly deciding who we could sell to: a funded startup that needs its
# actual PRODUCT built is a ₹5–10L buyer, and a founder about to spend that
# much looks the vendor up. Finding "₹1–1.5L for a platform" published on our
# own site ends the conversation before it starts — we would have negotiated
# against ourselves using our own website.
#
# This is deliberately NOT a price rise on the bands above. A ₹25,000 shop
# website and a ₹6L product build are different products for different buyers,
# and losing the first to reach the second would be a bad trade. The floor
# stays ₹25,000.
#
# What separates this tier from "Platform" is not size, it is who the software
# is FOR. A platform is a business presenting itself with some logic behind it.
# This is the thing the business sells — if it stops working the company has no
# product, not a broken website. That difference is what a founder is actually
# buying, and it is why the number is different.
#
# Always quoted as milestones, never as one number. A ₹6L lump sum from an
# unknown vendor is a decision a founder postpones; ₹1.2L for a first milestone
# that ships in two weeks is a decision they can make on a call. Same project,
# same total — one of them closes.
PRODUCT = [
    dict(id="mvp", low=3_50_000, high=6_00_000, days=63,
         name="Product build — MVP",
         fits="A funded startup whose product does not exist yet, or exists "
              "as a no-code prototype it has outgrown",
         has=["Accounts and authentication", "Payments and subscriptions",
              "Customer-facing dashboard", "Admin panel and roles",
              "APIs and third-party integrations",
              "Their GitHub from day one", "Milestone delivery"]),
    dict(id="platform-plus", low=6_00_000, high=10_00_000, days=112,
         name="Product build — platform + apps",
         fits="Web product plus Android and iOS on one backend, with the "
              "operational tooling a real customer base needs",
         has=["Everything in MVP", "Android and iOS on a shared backend",
              "Role-based operations tooling", "Reporting and analytics",
              "Scale and monitoring work", "Handover and documentation"]),
]

# The milestone shape a PRODUCT quote is always presented in. The split matters
# more than the total: each milestone ships something they can judge, they pay
# after it ships, and they can stop at any boundary and keep the code. That
# removes the only real objection — which is never price, but "what happens to
# my money if this person disappears" — and it costs us nothing to offer.
MILESTONES = [
    ("M1", "Auth + accounts", 0.20, 2),
    ("M2", "Payments + subscriptions", 0.25, 2),
    ("M3", "Customer dashboard", 0.33, 3),
    ("M4", "Admin + reporting", 0.22, 2),
]

TERMS = dict(advance_pct=25, hosting_years=1,
             note="25% to start, balance on delivery. One year of hosting "
                  "included with every website.")

# ── the two price books that are not retail ───────────────────────────────────
#
# Most "urgent hiring web developer" posts on LinkedIn in any given week are not
# buyers. They are agencies recruiting, and founders looking for a technical
# co-founder. Pitching a retail website quote at either one is a message that
# proves it was not read. But both of them need exactly what we do — they just
# buy it in a different shape. So there are two more price books, and the rates
# below are taken from the market rather than invented.
#
# SOURCES, 12 September 2026. USD converted at 95.55 (Alpha Vantage spot, same
# day) — the rate is written down because these numbers stop being defensible
# the moment nobody can reproduce them.
#
#   White-label / subcontract, India:
#     · senior developer $18–45/hr
#     · retainers $499–800 (10–20 hrs), $1,200–2,000 (30–50 hrs),
#       $2,500–5,000 (60–100 hrs); dedicated developer $3,000–6,000/month
#     · agencies resell subcontracted work at a 1.5–2x markup
#     · GoodFirms: 57.6% of Indian agencies bill $10–15/hr, 39% bill $50–100/hr
#
#   Technical co-founder equity, India:
#     · idea stage 25–50%, pre-MVP 25–40%, post-MVP 15–25%, at seed 5–15%
#     · 4-year vest with a 1-year cliff is standard and near-universal
#     · "Below 20% is a hire, not a co-founder"
#     · fractional CTO $5,000–15,000/month
#     · a senior Indian contract team will build the same MVP in a 6–8 week
#       sprint for ₹12–25 lakh and take no equity at all

FX_USD_INR = 95.55          # Alpha Vantage spot, 2026-09-12. Restate if requoting.

# ── the white-label rate card, in TWO tiers, and the reason there are two ────
#
# A single partner rate was wrong and the market said so. A real Noida
# white-label shop publishes its agency rate card openly: monthly retainer
# ₹20,000–50,000 for 20–60 hours, which is ₹333–1,000 an hour. Quoting an
# Indian agency ₹1,800–2,600 an hour — as this file did until 13 September —
# is two to five times the going domestic rate. Nobody argues with a number
# that far out; they just stop replying, and the silence gets misread as a bad
# pitch rather than a bad price.
#
# But the same hour sold to a Western agency is a different market entirely.
# They bill their own client $75–150/hr and pay Indian partners $25–45/hr, and
# 73% of them report they cannot hire developers fast enough — over 42 days to
# hire, more than $15,000 to do it. That is where the money is: the same work,
# three to ten times the rate.
#
# So: INDIA is the easier first close and the proof-builder. EXPORT is where
# the cash flow actually lives. Both are real; only one of them was priced.
#
# SOURCES, 13 September 2026, USD at 95.55 (Alpha Vantage spot, 12 Sep):
#   · Western agencies bill $75–150/hr; India premium firms charge them
#     $25–45/hr — a 60–70% saving for the agency
#   · Indian domestic agency-partner rates, published: business site
#     ₹20,000–40,000, e-commerce ₹30,000–55,000, Figma→Next.js ₹15,000–35,000,
#     Laravel backend ₹40,000–1,20,000, retainer ₹20,000–50,000 / 20–60 hrs
#   · Dedicated India engineer billed to Western agencies $3,000–6,000/month;
#     some quote $8,000–12,000 for a fully embedded engineer
#   · Agencies mark subcontracted work up 40–80% to their client
#   · 73% of agencies cannot hire; >42 days to hire; >$15,000 per hire

PARTNER_IN = [
    dict(id="in-hourly", low=900, high=1_400, unit="per hour",
         name="Hourly, white-labelled",
         fits="Overflow, a sprint you are short-handed for, a specialism",
         has=["Minimum 10 hours", "Your brand on everything, ours on nothing",
              "We never contact or are named to your client",
              "Daily written standup", "Code in your repository from day one"]),
    dict(id="in-retainer", low=45_000, high=90_000, unit="per month",
         name="Retainer — 40 to 80 hours a month",
         fits="One live project plus maintenance across your other accounts",
         has=["Named developer", "Unused hours roll one month",
              "Same-day response", "Monthly hour statement"]),
    dict(id="in-dedicated", low=1_40_000, high=2_20_000, unit="per month",
         name="Dedicated developer — full time",
         fits="A developer who is yours, on your stack, as long as you need",
         has=["160 hours a month", "Works your hours, joins your calls",
              "Direct to your project manager", "One month's notice either way"]),
    dict(id="in-build", low=25_000, high=1_05_000, unit="per build",
         name="Per build, white-labelled",
         fits="You sold it, we build it, your client never knows we exist",
         has=["Our retail band less 30% — you keep the margin and the client",
              "₹25,000 is the floor and it does not move",
              "Delivered in your repository, your hosting, your name",
              "We do not hold the client relationship, ever"]),
]

# Quoted in USD because that is the currency the buyer thinks in. Converting
# to rupees on their invoice makes us look like a vendor being converted from,
# rather than a partner they can compare against their local options.
PARTNER_EX = [
    dict(id="ex-hourly", low=25, high=40, unit="USD per hour",
         name="Hourly, white-labelled",
         fits="Overflow when your own team is booked and the deadline is not",
         has=["Minimum 10 hours", "You bill your client $75–150 for the same hour",
              "Under NDA before anything starts",
              "4–6 hours of overlap with US Eastern, 3–4 with the UK",
              "Your repo, your Slack, your standup — we join as your team"]),
    dict(id="ex-retainer", low=1_600, high=3_200, unit="USD per month",
         name="Retainer — 60 to 100 hours a month",
         fits="A steady stream of client work you would otherwise turn down",
         has=["Named developer", "Same-day response",
              "Monthly hour statement", "No long-term contract"]),
    dict(id="ex-dedicated", low=3_000, high=5_000, unit="USD per month",
         name="Dedicated developer — full time",
         fits="Engineering capacity without the 42 days and $15,000 to hire",
         has=["160 hours a month, one engineer, only your work",
              "Invisible to your client — NDA, unbranded staging, your email",
              "Mark it up 40–80% and the spread is yours",
              "One month's notice either way"]),
]

# Kept as an alias so nothing that already imports PARTNER breaks. India is the
# default because it is who we can close first, not who pays best.
PARTNER = PARTNER_IN

# Three shapes, and a founder picks one. The first is the one the market data
# actually recommends, which is why it is listed first even though it is the
# one that pays us in cash rather than upside.
EQUITY = [
    dict(id="eq-cash", low=2_50_000, high=4_00_000, unit="fixed",
         name="Cash, fixed sprint — no equity",
         fits="You keep 100% of your company and get a working MVP in 6–8 weeks",
         has=["Website + one mobile platform, or a full web platform",
              "Backend, admin, payments, deployment", "6–8 weeks",
              "You own everything on final payment", "No equity, no board seat, "
              "no conversation about vesting"]),
    dict(id="eq-hybrid", low=1_25_000, high=2_00_000, unit="cash + 2–5%",
         name="Half cash, small equity",
         fits="Funding is thin now but the raise is real and close",
         has=["Half the cash number above", "2–5% equity",
              "4-year vest, 1-year cliff — standard, and we do not ask to skip it",
              "We carry build risk with you, at a size that does not wreck "
              "your cap table before a seed round"]),
    dict(id="eq-cofounder", low=15, high=25, unit="% equity",
         name="Technical co-founder — equity only",
         fits="Pre-revenue, pre-MVP, and you need someone who owns the product",
         has=["15–25% post-MVP; 25–40% pre-MVP, which is the honest band and "
              "the market's, not a negotiating position",
              "4-year vest, 1-year cliff, standard documents",
              "Full technical ownership — architecture, build, hires, the lot",
              "We can take one or two of these at a time and no more, because "
              "equity-only means no cash and we have a payroll"]),
]

# What the founder is being compared against, said out loud. A fractional CTO
# in India is quoted $5,000–15,000 a month, and a senior contract team will
# build the same MVP for ₹12–25 lakh taking nothing of the company. Our cash
# number is well under both, and the reason is geography, not scope.
EQUITY_BENCHMARK = (
    "For reference, and because you will check anyway: the market rate for a "
    "technical co-founder in India is 25–40% pre-MVP and 15–25% post-MVP, on a "
    "4-year vest with a 1-year cliff. A fractional CTO runs ₹4.8–14.3 lakh a "
    "month. A senior contract team will build the same MVP in a 6–8 week sprint "
    "for ₹12–25 lakh and take no equity at all — which is why the cash option is "
    "listed first. Our cash number sits well under that ₹12–25 lakh because we "
    "are in Kaushambi and not Bengaluru. That is a difference in cost of "
    "operation, not in what gets built."
)

# Three ways to reach us, in the order people actually use them. WhatsApp is
# first because it is the one that gets answered the same hour; a form is the
# one people fill in when they are not ready to talk yet.
WHATSAPP = "917753898481"
WHATSAPP_SHOWN = "+91 77538 98481"
BOOK_SITE = "https://www.cognitivecapitalsuite.com/contact"
BOOK_LI = "https://www.linkedin.com/company/117373922/"


def booking_block():
    return (f"To book a call, whichever is easiest:\n"
            f"  WhatsApp {WHATSAPP_SHOWN} — https://wa.me/{WHATSAPP}\n"
            f"  {BOOK_SITE}\n"
            f"  or just reply on LinkedIn")


def inr(n):
    """Indian grouping: 1,00,000 not 100,000. A price written the wrong way
    reads as foreign, and foreign reads as expensive."""
    s = str(n)
    if len(s) <= 3:
        return s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:]); head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts) + "," + tail


def band(low, high):
    return f"₹{inr(low)} – ₹{inr(high)}"


def quote_line(tier):
    return f"{tier['name']}: {band(tier['low'], tier['high'])} · {tier['days']} working days"


def rate(tier):
    """Partner and equity rows are not priced in working days, so they carry a
    `unit` instead. The co-founder row is a percentage, not rupees — printing
    ₹15 – ₹25 there would be the kind of error nobody catches until a founder
    reads it."""
    if tier["unit"].endswith("% equity"):
        return f"{tier['low']}–{tier['high']}% equity"
    # The export tier is quoted in dollars because that is the currency the
    # buyer thinks in. Running it through band() stamped a rupee sign on a
    # dollar figure — "₹25 USD per hour" — which reads as carelessness on the
    # one line a buyer actually checks.
    if "USD" in tier["unit"]:
        per = tier["unit"].replace("USD ", "")
        return f"${tier['low']:,} – ${tier['high']:,} {per}"
    return f"{band(tier['low'], tier['high'])} {tier['unit']}"


if __name__ == "__main__":
    for group, tiers in (("WEBSITE", WEBSITE), ("APP", APP)):
        print(f"\n{group}")
        for t in tiers:
            print(f"  {quote_line(t)}")
            print(f"      {t['fits']}")
    print(f"\n{TERMS['note']}")
    for group, tiers in (("PARTNER / WHITE-LABEL", PARTNER),
                         ("FOUNDER / EQUITY", EQUITY)):
        print(f"\n{group}")
        for t in tiers:
            print(f"  {t['name']}: {rate(t)}")
            print(f"      {t['fits']}")
