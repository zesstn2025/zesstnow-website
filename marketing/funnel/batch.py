# -*- coding: utf-8 -*-
"""Today's fit-sourced agency batch — prospects found by profile, not by post.

Two rules that decide who is on this list, and both were learned by nearly
getting them wrong.

EXCLUDE WHITE-LABEL SUPPLIERS. dallaswebagency.us, joemcreative.com,
theoutsourcingagency.com and Survyc all turned up in the same searches and all
look like agencies. They sell exactly what we sell, to exactly the buyer we are
writing to. Mailing them is not a wasted send, it is telling a competitor our
rate card.

EXCLUDE ANYONE WHOSE DEV CAPACITY IS THE PRODUCT. A 200-person offshore shop is
not short of developers. The fit is a small team that sells websites and does
not employ the people who build them.

`asked` is deliberately absent on these rows. They did not ask for anything —
they were found — and partner_cold() is the only writer that may be used on
them. partner_email() opens by citing a post, which for this list would be a
fabrication in the first line.
"""

BATCH = [
    # ── United States ────────────────────────────────────────────────────────
    dict(id="AG001", name="Solve + Create", first="Shawn", firm="Solve + Create",
         site="solveandcreate.com", email="hello@solveandcreate.com",
         where="Medford, Oregon, US", region="export", size="3",
         who="Web design and branding studio — Webflow, WordPress, Shopify"),
    dict(id="AG002", name="Frosi + Bair", first="Gina", firm="Frosi + Bair",
         site="frosiandbair.com", email="hello@frosiandbair.com",
         where="Port Townsend, Washington, US", region="export", size="2",
         who="Web design and development studio, ecommerce focus"),
    dict(id="AG003", name="Web Design Mike", first="Mike", firm="Web Design Mike",
         site="webdesignmike.com", email="mike@webdesignmike.com",
         where="Pleasant Hill, California, US", region="export", size="2",
         who="WordPress, Wix and Shopify design plus local SEO"),
    dict(id="AG004", name="Socoz Design", first="Tim", firm="Socoz Design",
         site="socozdesign.com", email="tim@socozdesign.com",
         where="Saginaw, Michigan, US", region="export", size="1",
         who="Fractional marketing and web design for owner-led businesses"),
    dict(id="AG005", name="Kreative Splash", first="", firm="Kreative Splash",
         site="kreativesplash.com", email="info@kreativesplash.com",
         where="Chicago / Wilmington, US", region="export", size="10-50",
         who="SMB digital marketing — SEO, web design, publishes its prices"),
    dict(id="AG006", name="Trail Mix Creative", first="", firm="Trail Mix Creative",
         site="trailmixcreative.com", email="",
         where="Jacksonville, Florida, US", region="export", size="small",
         who="Creative agency — WordPress, WooCommerce, Shopify, branding, SEO"),
    dict(id="AG007", name="Keka Web Studio", first="", firm="Keka Web Studio",
         site="kekawebstudio.com", email="",
         where="Boston, Massachusetts, US", region="export", size="small",
         who="Web design studio for Massachusetts local businesses"),
    dict(id="AG008", name="North Fork Marketing & Design", first="Jen",
         firm="North Fork Marketing & Design",
         site="northforkmarketinganddesign.com", email="",
         where="Mattituck, New York, US", region="export", size="3",
         who="Creative agency — marketing, web design, brand identity"),

    # ── Canada ───────────────────────────────────────────────────────────────
    dict(id="AG009", name="Analog'Digital", first="Britanny", firm="Analog'Digital",
         site="analogdigital.ca", email="hello@analogdigital.ca",
         where="Canmore, Alberta, CA", region="export", size="6",
         who="Tech-forward digital agency — websites, web apps, marketing"),
    dict(id="AG010", name="AethDigital", first="Talha", firm="AethDigital",
         site="aethdigital.com", email="info@aethdigital.com",
         where="Toronto, Ontario, CA", region="export", size="3",
         who="Digital marketing for service businesses — web, SEO, branding"),
    dict(id="AG011", name="L8P Digital Marketing", first="", firm="L8P Digital Marketing",
         site="l8p.ca", email="hello@l8p.ca",
         where="Squamish, British Columbia, CA", region="export", size="5",
         who="Digital marketing agency — SEO, website design and development"),
    dict(id="AG012", name="Side By Side Digital", first="", firm="Side By Side",
         site="sidebysidedigital.com", email="",
         where="Waterloo, Ontario, CA", region="export", size="4",
         who="Digital marketing and web development — SEO, web design, PPC"),
    dict(id="AG013", name="KWD Marketing", first="Jeff", firm="KWD Marketing",
         site="kwdmarketing.ca", email="",
         where="Kelowna, British Columbia, CA", region="export", size="5",
         who="Web design, SEO, ecommerce and custom web applications"),
    dict(id="AG014", name="Websites Made With Love", first="Mark",
         firm="Websites Made With Love",
         site="websitesmadewithlove.com", email="",
         where="Parksville, British Columbia, CA", region="export", size="5",
         who="WordPress websites, SEO and ads for small businesses"),
    dict(id="AG015", name="Guelph Digital", first="", firm="Guelph Digital",
         site="guelphdigital.com", email="",
         where="Guelph, Ontario, CA", region="export", size="1-10",
         who="Digital marketing — web design and development, SEO, training"),
    dict(id="AG016", name="Rapid Fire Web Studio", first="Karina",
         firm="Rapid Fire Web Studio",
         site="rapidfireweb.com", email="",
         where="Toronto, Ontario, CA", region="export", size="3",
         who="Webflow development and growth studio"),

    # ── United Kingdom ───────────────────────────────────────────────────────
    dict(id="AG017", name="Anemo Agency", first="", firm="Anemo",
         site="anemo.agency", email="hello@anemo.agency",
         where="Kaunas, LT — serving UK and EU", region="export", size="2",
         who="Senior-only studio — WordPress, Webflow, React Native, Next.js"),
    dict(id="AG018", name="The Hoop Studio", first="", firm="The Hoop Studio",
         site="thehoopstudio.com", email="hello@thehoopstudio.com",
         where="The Cotswolds, UK", region="export", size="small",
         who="Webflow agency and digital growth partner, UK/EU/US clients"),
    dict(id="AG019", name="Kwayse", first="", firm="Kwayse",
         site="kwayse.com", email="contact@kwayse.com",
         where="London, UK", region="export", size="small",
         who="Full-service growth agency — website design, CRO, SEO, Ads"),
    dict(id="AG020", name="Appleby Creative", first="Jack", firm="Appleby Creative",
         site="appleby-creative.co.uk", email="",
         where="Manchester / London, UK", region="export", size="small",
         who="Certified Webflow partner — web design, Webflow, SEO"),
    dict(id="AG021", name="Digitopia", first="Darren", firm="Digitopia",
         site="digitopia.design", email="",
         where="UK", region="export", size="2",
         who="Senior WordPress builds and marketing, 30-day rolling contracts"),
]

# Found in the same searches and deliberately NOT mailed. They sell white-label
# development themselves — writing to them hands a competitor our rate card.
EXCLUDED_COMPETITORS = [
    ("dallaswebagency.us", "white-label partner for small agencies — direct competitor"),
    ("joemcreative.com", "white-label website developer for agencies — direct competitor"),
    ("theoutsourcingagency.com", "UK white-label creative team — direct competitor"),
    ("survyc.com", "launched a white-label WordPress programme for US agencies"),
    ("webdesksolution.com", "large multi-city shop; dev capacity is its product, not its gap"),
    ("fokusagency.com", "12 people with its own dev team in Pakistan — not short of developers"),
]

if __name__ == "__main__":
    have = [b for b in BATCH if b["email"]]
    need = [b for b in BATCH if not b["email"]]
    print(f"{len(BATCH)} agencies · {len(have)} with an address "
          f"({100*len(have)//len(BATCH)}%) · {len(need)} to look up")
    print(f"{len(EXCLUDED_COMPETITORS)} excluded as competitors")
    for b in need:
        print(f"  lookup: {b['id']} {b['site']}")
