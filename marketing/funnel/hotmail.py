# -*- coding: utf-8 -*-
"""The 22 hottest rows, written one at a time — e-mail and WhatsApp.

WHY THESE 22 AND NOT THE OTHER 1,525

Every row here is a business whose website is MISSING or BROKEN, verified on
the morning it is being sent. That is the only list where a cold message can
open with a fact the reader can check in one click, which is the whole reason
this works at all.

THE RE-CHECK IS NOT OPTIONAL, AND IT ALREADY SAVED US ONCE

The harvest flagged four sites PARKED. Re-checking them before writing showed
three were fine: ecofeelia.com is a full shop, naviget.in says "Coming Soon"
about a City Rides feature, scrideed.com says it about a course. Only
thevadaco.com, whose <title> is literally "Coming soon", was real. Mailing the
other three to say their site was down would have been caught instantly and
would have burned three good rows permanently. They are excluded.

Likewise every DEAD row was re-tested with a browser user-agent for a real
status code, because a 403 means "blocking a scraper", not "dead", and telling
a man his working site is broken destroys the only advantage this list has.
None of the 22 returned 200. Nine do not resolve in DNS at all.

LANGUAGE IS ENGLISH ON PURPOSE

These leads are in Gujarat, West Bengal, Telangana, Karnataka, Odisha, Madhya
Pradesh, Maharashtra, Jharkhand, Delhi and UP. There is no shared Indian
language across that list except English, and a Hindi mail to a Bengaluru
hospitality firm reads as a mass mail, which is the one thing this must not.

THE URGENCY IS REAL, WHICH IS WHY IT IS ALLOWED

Nothing here invents a deadline or a discount. For the nine domains that do not
resolve, the honest and genuinely frightening fact is that a lapsed domain can
be registered by anyone once it drops — including a competitor, and including
someone who will sell it back. That is true, it is checkable, and it is the
strongest thing we can say. It is phrased as "check this" and never as a
certainty, because we cannot see their registrar account.

    python3 hotmail.py           print every message and its wa.me link
    python3 hotmail.py --json    machine-readable, for the sender
"""
import json
import pathlib
import sys
import urllib.parse

HERE = pathlib.Path(__file__).parent
SRC = pathlib.Path("/tmp/claude-0/hot_final.json")

# What the site would have to DO for this kind of business, and what one
# missing customer is worth to them. Generic copy is what makes a cold mail
# feel like a cold mail, so nothing below is reusable across industries.
TRADE = {
    "Hospitals and Health Care": dict(
        job="let a patient check you are real and then book",
        loss="A patient who cannot find you does not call to ask. They book the "
             "clinic that came up instead.",
        build="a page that proves who is treating them, what you treat, your "
              "timings and address, and one button that books",
        price=35000),
    "Higher Education": dict(
        job="let a parent decide on a phone at 10pm",
        loss="Parents compare three names before they call one. The two with a "
             "page get the call, and the fee for a whole batch goes with it.",
        build="a page with who teaches, which courses, batch timings, fees and "
              "one enquiry button that reaches your phone",
        price=30000),
    "Architecture and Planning": dict(
        job="show finished work to somebody deciding on a big spend",
        loss="Nobody hands over an interiors budget to a name they cannot see "
             "work from. Your photographs are the entire sale.",
        build="a portfolio page — real project photographs, what each one cost "
              "to deliver, your area, and a WhatsApp button",
        price=30000),
    "Retail Apparel and Fashion": dict(
        job="show the catalogue and take the order on WhatsApp",
        loss="A customer who cannot see the range asks once and moves on. You "
             "lose the order and never know it existed.",
        build="a catalogue page with real product photographs, prices or "
              "ranges, and a WhatsApp order button",
        price=30000),
    "Retail": dict(
        job="show what you sell and take the order on WhatsApp",
        loss="A customer who cannot see the range asks once and moves on.",
        build="a catalogue page with real photographs, prices and a WhatsApp "
              "order button",
        price=30000),
    "Textile Manufacturing": dict(
        job="give a buyer something he can forward to his own boss",
        loss="A purchase manager who likes your product still has to send it "
             "upward for approval. He cannot forward a phone number.",
        build="a product catalogue a buyer can forward — specifications, "
              "capacity, certifications, and how to raise an enquiry",
        price=40000),
    "Manufacturing": dict(
        job="give a buyer something he can forward to his own boss",
        loss="A purchase manager who likes your work still has to send it "
             "upward for approval. He cannot forward a phone number.",
        build="a product catalogue a buyer can forward — specifications, "
              "capacity, certifications, and how to raise an enquiry",
        price=40000),
    "Furniture and Home Furnishings Manufacturing": dict(
        job="give a buyer a catalogue he can forward",
        loss="Furniture is bought from photographs. A buyer who cannot see the "
             "range cannot put you on his shortlist.",
        build="a product catalogue with real photographs, sizes, materials and "
              "an enquiry form that reaches your phone",
        price=40000),
    "Construction": dict(
        job="prove the product is certified and let a contractor enquire",
        loss="Fire doors are specified from a document. If a consultant cannot "
             "download your specification, he specifies somebody else's.",
        build="a product page with specifications, certifications and ratings a "
              "consultant can download, plus an enquiry form",
        price=40000),
    "Real Estate": dict(
        job="show live listings to somebody searching right now",
        loss="Property search starts on a phone. A buyer who cannot see your "
             "listings sees a competitor's.",
        build="a listings page you can update yourself — photographs, location, "
              "price, and an enquiry button per property",
        price=40000),
    "Wellness and Fitness Services": dict(
        job="show timings, fees and the place itself",
        loss="Nobody joins a gym they have not seen. Photographs, timings and "
             "the fee are the whole decision.",
        build="a page with real photographs of the floor, batch timings, "
              "membership fees, trainers and a WhatsApp join button",
        price=25000),
    "Events Services": dict(
        job="show past events to somebody planning one",
        loss="Events are booked entirely from photographs of previous events. "
             "Without them there is nothing to judge you on.",
        build="a gallery of real events you have run, the kinds you take, your "
              "city, and an enquiry button",
        price=30000),
    "Human Resources Services": dict(
        job="let an employer and a candidate both take you seriously",
        loss="A company about to hand you a hiring mandate checks whether you "
             "exist. A recruitment firm with no site loses the mandate.",
        build="a page with the roles you place, sectors you cover, how you "
              "work, and separate enquiry paths for employers and candidates",
        price=30000),
    "Hospitality": dict(
        job="let somebody see the place and book it",
        loss="Hospitality is chosen from photographs and a price. Without them "
             "there is no booking to lose — the enquiry never starts.",
        build="a page with real photographs, what is on offer, prices and a "
              "direct booking or WhatsApp button",
        price=35000),
    "Food and Beverage Services": dict(
        job="show the menu and where you are",
        loss="Somebody hungry nearby searches, finds nothing, and orders from "
             "the shop that came up. That is every single day.",
        build="a one-page site with the menu, photographs, your location on "
              "Google Maps, timings and an order button",
        price=25000),
}
DEFAULT = dict(job="let a customer find you and get in touch",
               loss="A customer who cannot find you contacts somebody else.",
               build="a one-page site — what you do, real photographs, your "
                     "area and a WhatsApp button",
               price=25000)

# What was actually measured today, in the customer's own words.
SAW = {
    "NODNS":  "it does not open at all — the domain does not even resolve, "
              "which usually means the registration has lapsed",
    "NOCONN": "the domain is still registered, but the server behind it never "
              "answers — the hosting looks expired while the domain is still "
              "being paid for",
    "E500":   "it returns a server error (500) instead of a page",
    "E404":   "it returns a 404 — the domain and hosting are alive, but there "
              "is nothing on them",
    "PARKED": "it still shows a “Coming soon” holding page",
    "NOSITE": "",
}

URGENCY = {
    "NODNS":  ("Please check this today, because it is the part that does not "
               "wait: once a lapsed domain finishes dropping, anybody can "
               "register it — a competitor, or somebody who will sell it back "
               "to you at their price. Your registrar account will tell you in "
               "a minute whether it is still renewable."),
    "NOCONN": ("Worth checking today: you are almost certainly still paying the "
               "yearly domain renewal for something that has not served a page "
               "in months. That is money leaving every year for nothing."),
    "E500":   ("This one is worth looking at today, because a 500 means the "
               "hosting is alive and being billed — you are paying for a server "
               "that is handing your customers an error."),
    "E404":   ("You are paying for both the domain and the hosting right now. "
               "Everything is running except the part customers see."),
    "PARKED": ("Every day this stays on “Coming soon” is a day people "
               "search, find the page, and leave. The ones who leave do not "
               "come back to check later."),
    "NOSITE": ("The honest urgency is that search positions get taken and kept. "
               "Whoever puts up a page first is the one answering the phone two "
               "years later, and the gap widens every month."),
}


def wa_link(phone, text):
    num = phone.lstrip("+").replace(" ", "")
    num = num if num.startswith("91") and len(num) == 12 else "91" + num[-10:]
    return "https://wa.me/" + num + "?text=" + urllib.parse.quote(text)


def compose(r):
    t = TRADE.get(r["industry"], DEFAULT)
    dom = r["website"].strip()
    kind = r["kind"]
    name = r["company"].strip()
    city = (r["city"].split(",")[0].strip() if r["city"] else "")

    if kind == "NOSITE":
        subject = f"{name} — one thing a customer cannot do right now"
        opening = (
            f"I was looking at {name} and could not find a website anywhere — "
            f"only the LinkedIn page.\n\n"
            f"That means if somebody searches for what you do"
            f"{' in ' + city if city else ''}, you do not come up at all. Not "
            f"lower down. Not at all.")
    else:
        subject = f"{dom} — please open it on your phone right now"
        opening = (
            f"Open {dom} on your phone before you read the rest of this.\n\n"
            f"I tried it this morning and {SAW[kind]}.\n\n"
            f"That is what your customer sees too — and a customer who hits "
            f"that does not try again or call to tell you. They open the next "
            f"name on the list.")

    body = f"""{opening}

{t['loss']}

Here is the arithmetic, and it is yours, not mine: what is one customer worth
to you? Not a big month — one customer. Now think about how many searched this
month and found nothing.

{URGENCY[kind]}

WHAT I WOULD BUILD

{t['build'].capitalize()}. One job: {t['job']}.

  · Complete website, live in 48 hours of the content being agreed
  · Your domain and your hosting, in YOUR name, with the passwords on day one
  · One year of hosting included
  · Google Business listing set up so you show on Maps
  · WhatsApp button so an enquiry reaches your phone, not an inbox

  Rs {t['price']:,} all-inclusive. Rs {t['price'] // 4:,} to start, the rest
  when it is live and you have approved it.

BEFORE YOU DECIDE ANYTHING

I will build the first page and send it to you to look at — no charge, no
commitment, nothing to sign. If you like it we carry on. If you do not, you
keep it and we are done.

Just reply with "yes" and I will start today.

Sonu Sharma
Zesst Now Services Private Limited, Kaushambi, Uttar Pradesh
CIN U47110UP2025PTC217212
WhatsApp +91 77538 98481
https://www.cognitivecapitalsuite.com  |  https://bizgstpro.com
"""

    if kind == "NOSITE":
        wa = (f"Hello — I looked for {name} online and could not find a "
              f"website, only LinkedIn.\n\n"
              f"So anyone searching for what you do right now finds someone "
              f"else instead.\n\n"
              f"I can build you the first page and show it to you free — no "
              f"commitment. Complete site Rs {t['price']:,}, live in 48 hours, "
              f"domain and hosting in your own name.\n\n"
              f"Shall I send you the sample page? Just reply yes.\n\n"
              f"— Sonu Sharma, Zesst Now Services Pvt Ltd")
    else:
        short = {"NODNS": "it does not open at all",
                 "NOCONN": "the server never answers",
                 "E500": "it shows a server error",
                 "E404": "it shows a 404 — nothing is on it",
                 "PARKED": "it still says “Coming soon”"}[kind]
        extra = ("\n\nWorth checking your registrar today — a lapsed domain can "
                 "be bought by anyone once it drops."
                 if kind == "NODNS" else "")
        wa = (f"Hello — please open {dom} on your phone.\n\n"
              f"I tried this morning and {short}. That is what your customers "
              f"see too, and they just open the next name instead.{extra}\n\n"
              f"I can build the first page and show it to you free — no "
              f"commitment. Complete site Rs {t['price']:,}, live in 48 hours, "
              f"domain and hosting in YOUR name.\n\n"
              f"Shall I send the sample? Just reply yes.\n\n"
              f"— Sonu Sharma, Zesst Now Services Pvt Ltd")

    return dict(company=name, email=r["email"].split(" / ")[0].strip(),
                mobile=r["mobile"].split(" / ")[0].strip(), kind=kind,
                industry=r["industry"], price=t["price"],
                subject=subject, body=body, whatsapp=wa,
                wa_url=wa_link(r["mobile"].split(" / ")[0], wa))


def main():
    rows = json.load(SRC.open())
    msgs = [compose(r) for r in rows]
    if "--json" in sys.argv:
        print(json.dumps(msgs, ensure_ascii=False))
        return
    for m in msgs:
        print("=" * 78)
        print(f"{m['kind']:7} {m['company']}  ->  {m['email']}  {m['mobile']}")
        print(f"Rs {m['price']:,}  |  {m['industry']}")
        print(f"SUBJECT: {m['subject']}\n")
        print(m["body"])
        print("--- WhatsApp ---")
        print(m["whatsapp"])
    print("=" * 78)
    print(f"{len(msgs)} leads  ·  total if all convert: "
          f"Rs {sum(m['price'] for m in msgs):,}")


if __name__ == "__main__":
    main()
