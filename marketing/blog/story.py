# -*- coding: utf-8 -*-
"""Turn a published blog post into a Google Web Story.

WHAT A WEB STORY IS AND IS NOT WORTH, MEASURED BEFORE BUILDING THIS

Checked on 14 September 2026 rather than assumed, because the format's
reputation is several years out of date in both directions.

  · Google removed the Web Stories icon from Google Images and killed the
    Discover carousel in February 2024. Stories now appear as a single result
    or a single Discover card.
  · The Search carousel survives in exactly three markets: the United States,
    INDIA (English and Hindi), and Brazil. India is one of the three, which is
    the single strongest argument for doing this at all.
  · Every serious guide puts food, travel, fashion and lifestyle in the "works"
    column and "B2B software, finance, legal, technical" in the "does not"
    column. Web development services sits in the second list.
  · Typical numbers: 80–90% bounce, 10–15 second sessions.

So the honest expectation is impressions and brand recall, not enquiries. That
is precisely why this file DERIVES a story from a post that was going to be
written anyway instead of authoring one from scratch: the marginal cost is a
few seconds of compute, and a channel worth a lottery ticket should cost about
that much. Google's own guidance also says a story should complement long-form
content rather than stand alone.

THE POSTER IMAGE IS NOT DECORATION

AMP requires poster-portrait-src, and Google will not show a story without one.
There are no photographs here, so the poster is generated: the brand gradient
with the title set on it. Google's best-practice page explicitly warns against
burning text into the poster because it collides with the title Search draws
over the preview — so the generated poster carries the wordmark and a rule,
never the headline.

    python3 story.py <slug>        write public/web-stories/<slug>.html
    python3 story.py --all         every post that has no story yet
"""
import html
import json
import pathlib
import re
import sys
import textwrap

HERE = pathlib.Path(__file__).resolve().parents[2]
POSTS = HERE / "content" / "blog"
OUT = HERE / "public" / "web-stories"
POSTERS = HERE / "public" / "web-stories" / "poster"

SITE = "https://www.cognitivecapitalsuite.com"
BRAND = "Zesst Now"

# The brand gradient, taken from the site's own favicon so a story never
# invents a colour the rest of the site does not use.
GRAD_FROM = (109, 59, 245)     # #6D3BF5
GRAD_TO = (34, 211, 238)       # #22D3EE
INK = (5, 6, 15)               # #05060F

# Portrait, the only aspect ratio Google accepts for the poster.
W, H = 640, 853


def front_matter(text):
    """Parse the YAML-ish front matter these posts use. A real YAML parser is
    not installed and is not worth adding for six known keys, but the `faq`
    block is a list of mappings, so this has to handle nesting rather than
    splitting on the first colon and hoping."""
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise SystemExit("post has no front matter")
    head, body = m.group(1), m.group(2)
    fm, key = {}, None
    for line in head.split("\n"):
        if not line.strip():
            continue
        if re.match(r"^\s", line):
            continue                      # inside faq; not needed for a story
        k, _, v = line.partition(":")
        key = k.strip()
        fm[key] = v.strip().strip('"')
    return fm, body


def pages_from(body, limit=6):
    """Slice the post into story pages.

    A Web Story page holds a headline and a sentence or two — the format's own
    guidance is under 200 characters per page, and Google suppresses stories
    that are walls of text. So each `##` section becomes one page, carrying its
    heading and the first real sentence under it. That keeps the story honest:
    it is the post's own structure, not a summary somebody invented.
    """
    out = []
    for m in re.finditer(r"^##\s+(.+?)\n(.*?)(?=^##\s|\Z)", body, re.S | re.M):
        heading = m.group(1).strip()
        chunk = m.group(2)
        # Strip markdown that would render as literal characters on a slide.
        chunk = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", chunk)
        chunk = re.sub(r"[*_`>#|-]", "", chunk)
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", chunk)
                     if len(s.strip()) > 40]
        if not sentences:
            continue
        text = sentences[0]
        if len(text) > 190:
            text = text[:187].rsplit(" ", 1)[0] + "…"
        out.append((heading, text))
        if len(out) >= limit:
            break
    return out


def poster(slug, title):
    """Generate the portrait poster AMP requires.

    Deliberately no headline on the image. Google's best-practice page says
    burned-in text obstructs the title Search overlays on the preview, and a
    reader who cannot read the title is less likely to open the story.
    """
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    # Diagonal gradient, drawn as rows blended along x+y so it matches the
    # favicon's direction rather than being a flat vertical fade.
    for y in range(H):
        for_x = y / (W + H)
        for x in range(0, W, 8):
            t = min(1.0, for_x + x / (W + H))
            c = tuple(int(GRAD_FROM[i] + (GRAD_TO[i] - GRAD_FROM[i]) * t)
                      for i in range(3))
            d.rectangle([x, y, x + 8, y + 1], fill=c)

    font_path = None
    for cand in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        if pathlib.Path(cand).exists():
            font_path = cand
            break
    f = ImageFont.truetype(font_path, 44) if font_path else ImageFont.load_default()
    d.text((48, H - 150), BRAND, font=f, fill=(255, 255, 255))
    d.rectangle([48, H - 88, 200, H - 82], fill=(255, 255, 255))

    POSTERS.mkdir(parents=True, exist_ok=True)
    p = POSTERS / f"{slug}.jpg"
    img.save(p, "JPEG", quality=88, optimize=True)
    return p


def build(slug):
    src = POSTS / f"{slug}.md"
    if not src.exists():
        raise SystemExit(f"no such post: {slug}")
    fm, body = front_matter(src.read_text(encoding="utf-8"))
    title = fm.get("title", slug)
    desc = fm.get("description", "")
    pages = pages_from(body)
    if len(pages) < 3:
        raise SystemExit(f"{slug}: only {len(pages)} usable sections — a story "
                         f"under three pages is not worth publishing")

    poster(slug, title)
    e = html.escape

    slides = []
    for i, (heading, text) in enumerate(pages):
        # Alternate the fill so consecutive pages do not look identical, using
        # the two brand stops rather than introducing new colours.
        a = "#6D3BF5" if i % 2 == 0 else "#0F2C4D"
        slides.append(f"""
  <amp-story-page id="p{i + 1}">
    <amp-story-grid-layer template="fill">
      <div style="width:100%;height:100%;background:linear-gradient(150deg,{a},#05060F)"></div>
    </amp-story-grid-layer>
    <amp-story-grid-layer template="vertical" class="pad">
      <h2 class="h">{e(heading)}</h2>
      <p class="t">{e(text)}</p>
    </amp-story-grid-layer>
  </amp-story-page>""")

    # The last page sends the reader to the post. A story that ends nowhere is
    # a dead end, and the post is the thing that can actually answer a buyer.
    slides.append(f"""
  <amp-story-page id="read">
    <amp-story-grid-layer template="fill">
      <div style="width:100%;height:100%;background:linear-gradient(150deg,#6D3BF5,#05060F)"></div>
    </amp-story-grid-layer>
    <amp-story-grid-layer template="vertical" class="pad">
      <h2 class="h">The full answer</h2>
      <p class="t">{e(desc[:170])}</p>
    </amp-story-grid-layer>
    <amp-story-page-outlink layout="nodisplay">
      <a href="{SITE}/blog/{slug}" title="Read the full post">Read the full post</a>
    </amp-story-page-outlink>
  </amp-story-page>""")

    doc = f"""<!doctype html>
<html amp lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <title>{e(title)}</title>
  <link rel="canonical" href="{SITE}/web-stories/{slug}.html">
  <meta name="description" content="{e(desc)}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta property="og:image" content="{SITE}/web-stories/poster/{slug}.jpg">
  <!-- Emitted through json.dumps, never an f-string repr. The first version
       used {title!r}, which writes Python's single quotes into what has to be
       JSON — Google discards the whole block silently, so the story would have
       shipped with no structured data and nothing would have said so. -->
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"Article",
    "headline":{json.dumps(title)},
    "image":["{SITE}/web-stories/poster/{slug}.jpg"],
    "datePublished":{json.dumps(fm.get("date", ""))},
    "author":{{"@type":"Organization","name":"{BRAND}"}},
    "publisher":{{"@type":"Organization","name":"{BRAND}"}}}}
  </script>
  <style amp-boilerplate>body{{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}}@-webkit-keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}@keyframes -amp-start{{from{{visibility:hidden}}to{{visibility:visible}}}}</style><noscript><style amp-boilerplate>body{{-webkit-animation:none;animation:none}}</style></noscript>
  <style amp-custom>
    .pad{{padding:2.2rem 1.8rem;justify-content:center}}
    .h{{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:2rem;
       line-height:1.15;color:#fff;margin:0 0 1rem;font-weight:800}}
    .t{{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:1.05rem;
       line-height:1.55;color:#dfe5f0;margin:0}}
  </style>
</head>
<body>
<amp-story standalone
  title="{e(title)}"
  publisher="{BRAND}"
  publisher-logo-src="{SITE}/web-stories/poster/{slug}.jpg"
  poster-portrait-src="{SITE}/web-stories/poster/{slug}.jpg">
{"".join(slides)}
</amp-story>
</body>
</html>
"""
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / f"{slug}.html"
    p.write_text(doc, encoding="utf-8")
    return p, len(pages) + 1


def main():
    if "--all" in sys.argv:
        made = 0
        for src in sorted(POSTS.glob("*.md")):
            if (OUT / f"{src.stem}.html").exists():
                continue
            try:
                p, n = build(src.stem)
                print(f"  ✓ {src.stem:42} {n} pages")
                made += 1
            except SystemExit as e:
                print(f"  — {src.stem:42} {e}")
        print(f"\n{made} stories written")
        return
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    if not slug:
        print(__doc__)
        return
    p, n = build(slug)
    print(f"{p}  ({n} pages)")


if __name__ == "__main__":
    main()
