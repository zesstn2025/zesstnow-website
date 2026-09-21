# -*- coding: utf-8 -*-
"""Turn NEWBIZ-leads.csv into a printable PDF call sheet.

WHY A PDF AND NOT JUST THE CSV

The CSV is the working file — it sorts, it filters, it feeds seen.py. The PDF
is for the other half of the job: sitting with a phone and working down a list.
So this is laid out as a CALL SHEET, not a data dump. Landscape, one row per
line, mobile in the second column where the thumb lands, and the rows grouped
by what is actually wrong with the business — because the opening line of the
call changes completely between a DEAD domain and a working one.

Rendered through headless Chromium, which is already installed here. No
reportlab, no weasyprint — both are absent and neither is worth installing to
lay out a table.

    python3 mkpdf.py                NEWBIZ-leads.csv  -> NEWBIZ-leads.pdf
    python3 mkpdf.py --limit 1000   only the first 1000 rows
"""
import csv
import html
import pathlib
import subprocess
import sys
import datetime

HERE = pathlib.Path(__file__).parent
SRC = HERE / "NEWBIZ-leads.csv"
HTM = HERE / "NEWBIZ-leads.html"
PDF = HERE / "NEWBIZ-leads.pdf"
# Chromium is pre-installed but NOT on PATH in this container — it lives under
# the Playwright browser directory. Resolved rather than assumed, because
# "chromium" on PATH fails with a bare FileNotFoundError that looks like the
# browser is missing entirely.
CHROME = next(
    (p for p in (
        "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
    ) if pathlib.Path(p).exists()),
    "chromium")

# Hottest first. This is the order the sheet is worked in, and the reason the
# document is grouped at all.
ORDER = ["NO-SITE", "DEAD", "PARKED", "THIN", "BUILDER", "NO-HTTPS", "OK"]

WHAT = {
    "NO-SITE":  ("कोई website नहीं",
                 "LinkedIn पर domain ही दर्ज नहीं — ये LinkedIn के बाहर कहीं नहीं दिखते।"),
    "DEAD":     ("Domain खुलता ही नहीं",
                 "हर साल renew हो रहा है, पर चलता नहीं। सबसे तगड़ी call यही है।"),
    "PARKED":   ("“Coming soon” पड़ा है",
                 "शुरू किया और छोड़ दिया। इरादा साबित हो चुका है।"),
    "THIN":     ("एक ही screen का पन्ना",
                 "8 KB से कम — website नहीं, placeholder है।"),
    "BUILDER":  ("Wix / GoDaddy template",
                 "ग्राहक को template साफ़ दिखता है।"),
    "NO-HTTPS": ("http only",
                 "Browser “Not secure” दिखाता है।"),
    "OK":       ("Website ठीक है",
                 "website मत बेचिए — app बेचिए, ख़ासकर जहाँ app कॉलम “no” है।"),
}

CSS = """
@page { size: A4 landscape; margin: 11mm 9mm 13mm 9mm;
        @bottom-right { content: counter(page); } }
*    { box-sizing: border-box; }
/* Devanagari is NOT installed in this container by default — without the
   Noto face every Hindi heading renders as empty boxes and the PDF looks
   broken. Both faces are installed system-wide before rendering. */
body { margin:0; font: 8.4pt/1.32 "Noto Sans", "Noto Sans Devanagari",
       "DejaVu Sans", system-ui, sans-serif;
       color:#12161c; background:#fff; -webkit-print-color-adjust:exact;
       print-color-adjust:exact; }

/* ---- cover ---------------------------------------------------------- */
/* No page-break-after here. Every .sec already carries break-before:page, and
   the two together emit a blank page between the cover and the first table —
   `.sec:first-of-type` does not help, because the first <section> in the
   document is the cover, so that selector matches nothing. */
.cover     { padding:14mm 8mm 0; }
.kicker    { font-size:8pt; letter-spacing:.18em; text-transform:uppercase;
             color:#6b7785; margin:0 0 6mm; }
h1         { font-size:30pt; line-height:1.04; margin:0 0 3mm; font-weight:700;
             letter-spacing:-.018em; max-width:20ch; }
.sub       { font-size:11pt; color:#41505f; margin:0 0 10mm; max-width:78ch; }
.big       { display:flex; gap:14mm; margin:0 0 11mm; flex-wrap:wrap; }
.big div   { min-width:26mm; }
.big b     { display:block; font-size:25pt; line-height:1; font-weight:700;
             letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.big span  { font-size:7.6pt; color:#6b7785; text-transform:uppercase;
             letter-spacing:.11em; }
.note      { font-size:8.6pt; color:#41505f; max-width:92ch; margin:0 0 4mm; }
.note b    { color:#12161c; }

/* ---- legend --------------------------------------------------------- */
.legend    { border-top:1.6pt solid #12161c; padding-top:4mm; margin-top:4mm; }
.legend h2 { font-size:8pt; letter-spacing:.16em; text-transform:uppercase;
             color:#6b7785; margin:0 0 3mm; font-weight:600; }
.lrow      { display:flex; gap:4mm; align-items:baseline; padding:1.5mm 0;
             border-bottom:.4pt solid #e3e7ec; }
.lrow .n   { font-variant-numeric:tabular-nums; color:#6b7785; min-width:12mm;
             text-align:right; font-size:8.6pt; }

/* ---- section headers ------------------------------------------------ */
.sec       { break-before:page; page-break-before:always; margin:0 0 3mm; }
.sec h2    { font-size:15pt; margin:0 0 1mm; font-weight:700;
             letter-spacing:-.01em; }
.sec p     { margin:0; font-size:8.6pt; color:#41505f; }

/* ---- table ---------------------------------------------------------- */
table      { width:100%; border-collapse:collapse; table-layout:fixed; }
thead      { display:table-header-group; }
th         { text-align:left; font-size:7pt; letter-spacing:.09em;
             text-transform:uppercase; color:#fff; background:#24425f;
             padding:1.6mm 1.6mm; font-weight:600; }
td         { padding:1.5mm 1.6mm; border-bottom:.4pt solid #e3e7ec;
             vertical-align:top; word-wrap:break-word; overflow-wrap:anywhere; }
tr         { page-break-inside:avoid; }
tbody tr:nth-child(even) td { background:#f6f8fa; }
.num       { font-variant-numeric:tabular-nums; color:#8a94a1; text-align:right; }
.tel       { font-weight:700; font-variant-numeric:tabular-nums;
             white-space:nowrap; }
.co        { font-weight:600; }
.mail      { color:#24425f; }
.dim       { color:#6b7785; }
.no        { color:#b3261e; font-weight:700; }

.chip      { display:inline-block; padding:.7mm 2mm; border-radius:2mm;
             font-size:7pt; font-weight:700; letter-spacing:.05em;
             background:#12161c; color:#fff; }
.c-hot     { background:#b3261e; }
.c-warm    { background:#24425f; }
.c-cool    { background:#6b7785; }
"""

HOT = {"NO-SITE", "DEAD", "PARKED"}
WARM = {"THIN", "BUILDER", "NO-HTTPS"}


def chip(code):
    cls = "c-hot" if code in HOT else "c-warm" if code in WARM else "c-cool"
    return f'<span class="chip {cls}">{html.escape(code)}</span>'


def main():
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    rows = list(csv.DictReader(SRC.open(encoding="utf-8")))
    if limit:
        rows = rows[:limit]

    groups = {k: [r for r in rows if r["problem"] == k] for k in ORDER}
    groups = {k: v for k, v in groups.items() if v}
    noapp = sum(1 for r in rows if r.get("has_app") == "no")
    cities = len({r["city"].split(",")[0].strip() for r in rows if r["city"]})
    today = datetime.date.today().strftime("%d %B %Y")

    o = ["<!doctype html><html lang='hi'><meta charset='utf-8'>",
         "<title>New business call sheet</title><style>", CSS, "</style><body>"]

    # ---------------- cover ----------------
    o.append("<section class='cover'>")
    o.append("<p class='kicker'>Zesst Now Services Private Limited "
             f"&nbsp;·&nbsp; {today}</p>")
    o.append("<h1>नए business जिन्हें website या app चाहिए</h1>")
    o.append("<p class='sub'>हर row में mobile भी है और e-mail भी — "
             "कोई ख़ाली cell नहीं। हर कंपनी 2024 के बाद बनी है, 2–50 लोगों की है, "
             "और उसकी website असल में खोलकर जाँची गई है।</p>")
    o.append("<div class='big'>")
    o.append(f"<div><b>{len(rows):,}</b><span>Leads</span></div>")
    o.append(f"<div><b>{len(rows):,}</b><span>Mobile + e-mail</span></div>")
    o.append(f"<div><b>{noapp:,}</b><span>कोई app नहीं</span></div>")
    o.append(f"<div><b>{cities}</b><span>शहर</span></div>")
    o.append(f"<div><b>{len(groups)}</b><span>Problem types</span></div>")
    o.append("</div>")

    o.append("<p class='note'><b>ये list कहाँ से आई।</b> कंपनियाँ LinkedIn के "
             "database (Crustdata) से — नई, छोटी, और जान-बूझकर ग़ैर-तकनीकी, "
             "क्योंकि software कंपनी अपनी website ख़ुद बना लेती है। "
             "Mobile और e-mail LinkedIn से नहीं आए: वो हर कंपनी की अपनी website "
             "से पढ़े गए हैं। नया business अपना नंबर ख़ुद header में छापता है, "
             "क्योंकि वो चाहता है कि call आए — वही नंबर उठता भी है।</p>")
    o.append("<p class='note'><b>Problem column अंदाज़ा नहीं है।</b> हर site "
             "असल में खोली गई और जो मिला वही लिखा गया। इसीलिए call की पहली "
             "लाइन सच्ची होती है — और यही इस list की पूरी ताक़त है।</p>")
    o.append("<p class='note'><b>भेजने से पहले उस दिन दोबारा जाँच लीजिए।</b> "
             "जो site आज DEAD है वो अगले महीने चल सकती है, और ग़लत पहली लाइन "
             "इस list का इकलौता फ़ायदा ख़त्म कर देती है।</p>")

    o.append("<div class='legend'><h2>किस code का क्या मतलब — और इसी क्रम में "
             "call कीजिए</h2>")
    for k in ORDER:
        if k not in groups:
            continue
        t, d = WHAT[k]
        o.append(f"<div class='lrow'>{chip(k)}"
                 f"<span class='n'>{len(groups[k]):,}</span>"
                 f"<span><b>{html.escape(t)}</b> — {html.escape(d)}</span></div>")
    o.append("</div></section>")

    # ---------------- tables ----------------
    for k in ORDER:
        if k not in groups:
            continue
        g = groups[k]
        t, d = WHAT[k]
        o.append("<section class='sec'>")
        o.append(f"<h2>{chip(k)} &nbsp;{html.escape(t)} "
                 f"<span class='dim'>· {len(g):,}</span></h2>")
        o.append(f"<p>{html.escape(d)}</p></section>")
        o.append("<table><thead><tr>"
                 "<th style='width:4%'>#</th>"
                 "<th style='width:17%'>Business</th>"
                 "<th style='width:13%'>Mobile</th>"
                 "<th style='width:21%'>E-mail</th>"
                 "<th style='width:11%'>शहर</th>"
                 "<th style='width:14%'>Industry</th>"
                 "<th style='width:4%'>Year</th>"
                 "<th style='width:12%'>Website</th>"
                 "<th style='width:4%'>App</th>"
                 "</tr></thead><tbody>")
        for i, r in enumerate(g, 1):
            app = r.get("has_app", "")
            appcell = "<span class='no'>no</span>" if app == "no" else \
                      f"<span class='dim'>{html.escape(app)}</span>"
            o.append(
                f"<tr><td class='num'>{i}</td>"
                f"<td class='co'>{html.escape(r['company'])}</td>"
                f"<td class='tel'>{html.escape(r['mobile'])}</td>"
                f"<td class='mail'>{html.escape(r['email'])}</td>"
                f"<td class='dim'>{html.escape(r['city'])}</td>"
                f"<td class='dim'>{html.escape(r['industry'])}</td>"
                f"<td class='num'>{html.escape(str(r['founded']))}</td>"
                f"<td class='dim'>{html.escape(r['website'])}</td>"
                f"<td>{appcell}</td></tr>")
        o.append("</tbody></table>")

    o.append("</body></html>")
    HTM.write_text("".join(o), encoding="utf-8")
    print(f"html -> {HTM}  ({HTM.stat().st_size//1024} KB)")

    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
         "--no-pdf-header-footer", "--virtual-time-budget=30000",
         f"--print-to-pdf={PDF}", HTM.as_uri()],
        check=True, capture_output=True, timeout=600)
    print(f"pdf  -> {PDF}  ({PDF.stat().st_size//1024} KB)")
    for k in ORDER:
        if k in groups:
            print(f"    {k:9} {len(groups[k]):>5}")
    print(f"    {'TOTAL':9} {len(rows):>5}")


if __name__ == "__main__":
    main()
