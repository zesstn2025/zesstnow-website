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
"""

WEBSITE = [
    dict(id="starter", low=5_000, high=15_000, days=4,
         name="Starter site",
         fits="A business that has no site at all and needs to exist online",
         has=["Up to 5 pages", "Mobile-first", "Enquiry form that reaches a phone",
              "WhatsApp button", "Google Business + maps", "1 year hosting"]),
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

TERMS = dict(advance_pct=25, hosting_years=1,
             note="25% to start, balance on delivery. One year of hosting "
                  "included with every website.")


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


if __name__ == "__main__":
    for group, tiers in (("WEBSITE", WEBSITE), ("APP", APP)):
        print(f"\n{group}")
        for t in tiers:
            print(f"  {quote_line(t)}")
            print(f"      {t['fits']}")
    print(f"\n{TERMS['note']}")
