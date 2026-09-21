# -*- coding: utf-8 -*-
"""Advocates in Prayagraj, from the Allahabad High Court's own Roll of Advocates.

WHY THIS SOURCE AND NOT A LEAD DATABASE

Three sources were tried for this list before this one, and the failures are
worth recording so nobody repeats them:

  · Explorium — 3,025 Indian legal/accounting matches, every one in the sample
    in Bengaluru, Delhi, Pune or Mumbai. A sole practitioner in Prayagraj has
    no LinkedIn company page, so a LinkedIn-derived database cannot see him.
    Paying credits for metro law firms would have bought the opposite of the
    brief.
  · OpenStreetMap — 4 advocates across all three districts and ZERO phone
    numbers. Real, surveyed, and far too thin to work from.
  · IndiaMART — real businesses but the number shown is IndiaMART's routing
    proxy, not the practitioner's.

The Roll is the register the Court itself publishes, and it carries exactly
what the other three could not: the advocate's name, enrolment number and
year, full residence and office address, chamber number inside the High Court,
landline, MOBILE, and e-mail. It is public, it is authoritative, and it is the
same document any litigant can read.

USE IT THE WAY A PUBLIC REGISTER SHOULD BE USED. These are real people whose
contact details are published for professional purposes. One relevant message
with an easy way out is defensible; repeat mailing is not, which is why every
row flows through seen.py like everything else in this funnel.

THE WEBSITE TEST IS FREE, AND IT IS IN THE EMAIL ADDRESS

The brief asks whether each one has a website. The Roll has no website field
and checking 25,000 names against a search engine is not realistic. But the
e-mail address answers it almost perfectly: an advocate on
`name@hisfirm.in` has a domain and therefore a site; an advocate on
`name@gmail.com` almost never does. So the address is classified rather than
guessed, custom domains are flagged for a real check, and the gmail/yahoo
majority is exactly the segment the pitch is for.

    python3 roll.py             harvest, classify, write advocates_prayagraj.csv
    python3 roll.py 40          only the first 40 pages (a quick sample)
"""
import concurrent.futures as cf
import csv
import pathlib
import re
import sys
import time
import urllib.request

HERE = pathlib.Path(__file__).parent
OUT = HERE / "advocates_prayagraj.csv"
URL = "https://www.allahabadhighcourt.in/advocate/generateRollA.jsp?page={}"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

TAGS = re.compile(r"<[^>]*>")
WS = re.compile(r"[ \t\xa0]+")

# One row of the register. The columns run: serial, roll number, name,
# father/husband, enrolment, date, addresses, telephones, e-mail.
ROW = re.compile(
    r"(?P<sn>\d{2,6})\s+(?P<roll>A/[A-Z0-9]+/\d{4})\s+"
    r"(?P<rest>.*?)(?=\s+\d{2,6}\s+A/[A-Z0-9]+/\d{4}\s|\Z)", re.S)

MOBILE = re.compile(r"3\.\s*Mobile:\s*([6-9]\d{9})")
RES_PH = re.compile(r"1\.\s*Residence:\s*([0-9][0-9\-]{7,})")
OFF_PH = re.compile(r"2\.\s*Office:\s*([0-9][0-9\-]{7,})")
EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
ENROL = re.compile(r"(\d{1,5}/(\d{4}))\s+Bar Council")
DATED = re.compile(r"(\d{2}/\d{2}/\d{4})")
RES_AD = re.compile(r"1\.\s*Residence:\s*(.*?)\s*2\.\s*Office:", re.S)
OFF_AD = re.compile(r"2\.\s*Office:\s*(.*?)\s*3\.\s*Chamber", re.S)
CHAMBER = re.compile(r"3\.\s*Chamber in High Court:\s*(.*?)\s*1\.\s*Residence:", re.S)

FREEMAIL = re.compile(
    r"@(gmail|yahoo|hotmail|outlook|rediffmail|live|icloud|ymail|aol)\.", re.I)


def get(page, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(URL.format(page),
                                         headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception:
            time.sleep(2 * (i + 1))
    return ""


CELL = re.compile(r"</t[dh]>", re.I)
ROWSPLIT = re.compile(r"<tr[^>]*>", re.I)


def cells_of(tr):
    """Split one table row into its cells BEFORE stripping tags.

    The first version stripped every tag and then tried to recover the columns
    from runs of whitespace. It could not: the register prints the advocate's
    name and their father's name in adjacent cells, both upper case, and after
    tag-stripping they read as one string — so every row came out named
    "ABDUL HASEEB LATE ABDUL MAJID". That name goes into the greeting line of a
    real email to a real person, which makes it the one field that has to be
    exactly right.
    """
    parts = CELL.split(tr)
    return [WS.sub(" ", TAGS.sub(" ", p)).strip() for p in parts]


def parse(html):
    out = []
    for tr in ROWSPLIT.split(html)[1:]:
        c = [x for x in cells_of(tr)]
        if len(c) < 6 or "Bar Council" not in " ".join(c):
            continue
        # Columns: serial, roll no, name, father/husband, enrolment, date,
        # addresses, telephones, e-mail.
        sn = c[0].strip()
        if not sn.isdigit():
            continue
        rest = " ".join(c)
        e = ENROL.search(rest)
        if not e:
            continue
        # Cell [1] is "A/J1336/2023 JAGDEESH PRASAD RAM UJAGIR" — the roll
        # number, then the advocate's name and the father/husband's name run
        # together with NO delimiter between them. There is no rule that
        # separates "JAGDEESH PRASAD" from "RAM UJAGIR" without knowing the
        # person, so this does not pretend to: it keeps the pair intact in one
        # honest column and takes only the FIRST TOKEN as the given name, which
        # is the only part that is certain and the only part a greeting needs.
        head = c[1].strip()
        mroll = re.match(r"(A/[A-Z0-9]+/\d{4})\s*(.*)$", head)
        roll = mroll.group(1) if mroll else ""
        both = (mroll.group(2) if mroll else head).strip()
        toks = both.split(" ") if both else []
        # "A.D. SAUNDERS" must not greet somebody as "A.D." — when the first
        # token is initials, the name is the first two tokens.
        if toks and (("." in toks[0]) or len(toks[0]) <= 2) and len(toks) > 1:
            first = " ".join(toks[:2]).title()
        else:
            first = toks[0].title() if toks else ""
        name = both
        father = ""

        mob = MOBILE.search(rest)
        em = [x for x in EMAIL.findall(rest) if "@" in x]
        res = RES_AD.search(rest)
        off = OFF_AD.search(rest)
        ch = CHAMBER.search(rest)
        d = DATED.search(rest)
        out.append(dict(
            sn=sn,
            roll_no=roll,
            first_name=first,
            name_and_father=re.sub(r"\s+", " ", name).strip(),
            enrolment=e.group(1),
            enrolled_year=e.group(2),
            enrolled_on=d.group(1) if d else "",
            mobile=("+91" + mob.group(1)) if mob else "",
            landline_res=(RES_PH.search(rest).group(1) if RES_PH.search(rest) else ""),
            landline_off=(OFF_PH.search(rest).group(1) if OFF_PH.search(rest) else ""),
            email=em[0].lower() if em else "",
            address_residence=re.sub(r"\s+", " ", res.group(1)).strip()[:160] if res else "",
            address_office=re.sub(r"\s+", " ", off.group(1)).strip()[:160] if off else "",
            chamber=re.sub(r"\s+", " ", ch.group(1)).strip()[:80] if ch else "",
        ))
    return out


def main():
    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 260
    print(f"Roll of Advocates, Allahabad — pages 1..{pages}\n")
    rows, done = [], 0
    # Six at a time. This is a court's own server and the whole roll is being
    # read; there is no reason to hit it harder than a person browsing would.
    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(get, p): p for p in range(1, pages + 1)}
        for f in cf.as_completed(futs):
            html = f.result()
            if html:
                rows.extend(parse(html))
            done += 1
            if done % 40 == 0:
                print(f"  {done}/{pages} pages · {len(rows)} advocates so far",
                      flush=True)

    seen, uniq = set(), []
    for r in rows:
        if r["roll_no"] in seen:
            continue
        seen.add(r["roll_no"])
        em = r["email"]
        if not em:
            r["has_own_website"] = "no email — unknown"
        elif FREEMAIL.search(em):
            r["has_own_website"] = "NO — free email, no domain"
        else:
            r["has_own_website"] = "maybe — custom domain, check " + em.split("@")[1]
        # Years in practice decides how the pitch opens, so it is computed here
        # rather than left for a human to work out per row.
        try:
            r["years_practising"] = 2026 - int(r["enrolled_year"])
        except ValueError:
            r["years_practising"] = ""
        uniq.append(r)

    cols = ["sn", "roll_no", "first_name", "name_and_father", "enrolment",
            "enrolled_year", "years_practising", "enrolled_on", "mobile",
            "landline_res", "landline_off", "email", "has_own_website",
            "chamber", "address_office", "address_residence"]
    uniq.sort(key=lambda r: int(r["sn"]) if r["sn"].isdigit() else 0)
    with OUT.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(uniq)

    mob = sum(1 for r in uniq if r["mobile"])
    em = sum(1 for r in uniq if r["email"])
    both = sum(1 for r in uniq if r["mobile"] and r["email"])
    nosite = sum(1 for r in uniq if r["has_own_website"].startswith("NO"))
    print(f"\n{len(uniq)} advocates")
    print(f"  with a mobile      {mob}")
    print(f"  with an e-mail     {em}")
    print(f"  with BOTH          {both}   <- the workable list")
    print(f"  free email (no site) {nosite}")
    print(f"\n-> {OUT}")


if __name__ == "__main__":
    main()
