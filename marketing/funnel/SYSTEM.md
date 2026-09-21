# Zesst Now — the whole outreach and content system

Exported 21 September 2026. Everything in this archive was written for
Zesst Now Services Private Limited, Kaushambi, Uttar Pradesh.

---

## READ THIS FIRST: why this export exists

`/home/user/funnel` **was never a git repository.** It lived only inside a
session container, and a container is destroyed when the session ends. Every
script in `funnel/` — the advocate harvester, the lead finder, the pitch
writers, the price book — existed in exactly one place in the world, and that
place was temporary.

`website-marketing/` is the opposite: it is already committed in
`zesstn2025/zesstnow-website` and is safe. It is included so the system is
complete in one place, not because it was at risk.

**So the first thing to do with this archive is put `funnel/` into a private
git repository.** Not the public one — see the warning at the end.

---

## What is in here

```
funnel/            The automation. 27 Python scripts, 2 JS, 6 written documents.
funnel/data/       14 CSVs — the lead lists these scripts produced.
funnel/output/     Finished deliverables: the PDF call sheet, the WhatsApp page.
website-marketing/ The blog and Web Story loop that runs on the live site.
```

---

## funnel/ — the scripts, grouped by what they are for

### Finding leads

| file | what it does |
|---|---|
| `newbiz.py` | **The main one.** New Indian businesses that need a website or app, with mobile and e-mail read off their own sites. Produced the 1,547-row list. |
| `roll.py` | Advocates from the Allahabad High Court Roll — 25,985 names, 16,224 with both mobile and e-mail. The statutory register, not a scraped directory. |
| `pros.py` | CAs and advocates across Prayagraj, Kaushambi, Kanpur. |
| `builders.py` | Builders and promoters, contact details read off their own sites. |
| `founders.py` | Turns a founder export into a list with measured website weaknesses. |
| `harvest.py` | Named businesses around Kaushambi–Prayagraj out of OpenStreetMap. |
| `im_harvest.py` | Businesses that already pay for leads and still have no website. |
| `intake.py` | Reads a CSV from a browser scraper and turns it into mailable prospects. |
| `build_list.py` | Turns the OSM harvest into pipeline rows with the signal already measured. |
| `batch.py` | The agency batch, plus the running **competitor exclusion list**. |

### Checking before contacting

| file | what it does |
|---|---|
| `active.py` | **Do not skip this.** Is the agency still trading, or is its website merely still paid for? Scores 0–100; 45+ to mail. |
| `findmail.py` | Finds real e-mail addresses for prospects that only have a phone. |
| `agencymail.py` | Finds an agency's address — a different problem from `findmail.py`. |

### Writing

| file | what it does |
|---|---|
| `pitch.py` | Every pitch variant, written against what these buyers actually fear. |
| `messages.py` | The day's outreach per prospect, plus `link()` which builds the wa.me URLs. |
| `hotmail.py` | The 22 hottest rows written one at a time — e-mail and WhatsApp. |
| `pricing.py` | **What we charge and why.** Every number in every message must come from here, never from memory. |

### Producing the day's work

| file | what it does |
|---|---|
| `mkpage.py` · `mkday.py` | The day's outreach as a phone page. |
| `mkround.py` · `mklinkedin.py` | The LinkedIn round: comment text, DM text, links. |
| `mksend.py` | The rows that cannot be sent automatically, as one tap-per-row page. |
| `mkpdf.py` | Turns a lead CSV into a printable PDF call sheet. |
| `seen.py` | **The memory between days.** Who was pitched, who is owed a follow-up. |
| `pipeline.py` | The pipeline, deliberately a CSV. |
| `funnel.py` | The original website sales funnel document. |

### Written documents, not code

`PLAYBOOK.md` · `PITCH-NEWBIZ.md` · `PITCH-CA-ADVOCATE.md` · `PITCH-5L.md` ·
`INBOUND-3.md` · `212207-RESEARCH.md`

---

## How to run it

Python 3.11+. Everything uses the standard library — there is nothing to
`pip install`.

```bash
cd funnel

python3 seen.py due                # ALWAYS first — who is owed a follow-up
python3 newbiz.py                  # harvest new businesses -> NEWBIZ-leads.csv
python3 active.py <domain>         # check one prospect is alive
python3 mkpdf.py                   # CSV -> printable PDF call sheet
python3 seen.py record             # after the round, so nobody is mailed twice
```

`mkpdf.py` renders through headless Chromium. Its path is resolved inside the
script because Chromium is usually not on `PATH`.

---

## The five rules that were learned the hard way

These are not style preferences. Each one is here because breaking it cost
something real.

**1. Measure, never assume — and measure the thing itself.**
Fourteen Web Stories were silently invalid for weeks because the AMP
boilerplate was missing its `-moz-`, `-ms-` and `-o-` prefixed rules. Nothing
reported an error; Google simply dropped them. It was found only by running the
official validator for the first time. `marketing/blog/story.py --check` now
refuses to pass if the validator did not actually run.

**2. Re-check every claim the morning you send it.**
Four leads were marked "coming soon" by the harvester. Re-checking before
mailing showed three were wrong — two said "coming soon" about a *feature* and
one about a *course*, while their sites worked perfectly. Telling those owners
their site was broken would have been caught in one click.

**3. A dead prospect is worse than a bounce.**
A bounce is information. Silence from an unread inbox looks exactly like
silence from a live business that ignored you, so it corrupts the only number
the whole loop is measured on.

**4. Never mail a competitor.**
Several firms that look exactly like prospects sell white-label development
themselves. Mailing one hands a rival the rate card. The exclusion list in
`batch.py` only ever grows.

**5. Sending volume is the real constraint.**
`zesstn@gmail.com` is a personal Gmail and it is the only channel that actually
sends. Ramp gently — roughly 25, then 35, then 50 a day. A sudden jump is the
exact pattern Google restricts on, and losing that account stops everything.
The real fix is a Workspace seat on the company domain.

---

## What this system cannot do

Stated plainly so nobody rediscovers it the expensive way:

- **No LinkedIn.** There is no LinkedIn tool. Comments and DMs are written by
  the system and pasted by a person.
- **WhatsApp does not send by itself.** It goes out through `wa.me` links —
  free, no ban risk, one tap per lead. The official API needs a Meta-approved
  template for any first message to someone who has not written to you first;
  that is WhatsApp's rule, not a missing feature.
- **Replies to those WhatsApp messages cannot be read back.** They land on the
  phone that sent them.
- **E-mail is the only channel that sends and reads end to end.**

---

## website-marketing/ — the content loop

`blog/queue.md` holds the topic queue and the house rules every post must obey:
900–1,500 words, three to six `##` sections, three FAQ entries, a category that
**already exists on the site**, and a section that says plainly when the reader
should not hire anybody.

`blog/story.py` turns a published post into an AMP Web Story.

```bash
python3 marketing/blog/story.py <slug>    # one story
python3 marketing/blog/story.py --check   # validate ALL stories. Never skip.
```

This loop still runs daily: two posts and two Web Stories, committed and pushed
automatically. As of this export, 18 posts and 18 stories are live and all 18
pass the official AMP validator.

---

## ⚠️ Where this must not go

`funnel/data/` holds mobile numbers and e-mail addresses for roughly
**eighteen thousand real people and businesses** — 16,224 advocates and 1,547
new businesses among them.

**`zesstn2025/zesstnow-website` is a PUBLIC repository. None of this data may
ever be committed to it.** Push scripts there; never the lists.

Put this archive in a **private** repository, and keep `data/` out of any
public one. Treat the contents the way a public register should be treated:
one relevant message, an easy way out, and never a second unasked-for one —
which is exactly what `seen.py` exists to enforce.
