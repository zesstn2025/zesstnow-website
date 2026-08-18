"""
Converts the "ZESST NOW" wordmark to vector outlines.

Writes brand/wordmark.svg, which brandgen.py composes into the lockups. Running
this is only necessary if the wordmark text, weight or tracking changes — the
committed wordmark.svg is otherwise the source of truth.

    pip install fonttools brotli
    python3 brand/wordmark.py [path/to/Sora.woff2]

With no argument it looks for Sora inside .next/static/media, which is where
next/font caches it after a build. Those filenames are content hashes and change
on every build, so the font is identified by its name table, not its path.
"""

import glob
import os
import sys

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

TEXT = "ZESST NOW"
WEIGHT = 600
TRACKING = 0.14  # em — matches the .brand letter-spacing in globals.css

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def find_sora() -> str:
    """
    Locate Sora among next/font's cached webfonts.

    Matching on the name table alone is not enough: next/font emits several
    subsets per family, and the non-latin ones carry the Sora name while lacking
    every glyph in TEXT. So the candidate has to actually cover the wordmark.
    """
    needed = {ord(c) for c in TEXT if c != " "}
    for path in glob.glob(os.path.join(ROOT, ".next", "static", "media", "*.woff2")):
        try:
            font = TTFont(path, lazy=True)
            if font["name"].getDebugName(1) != "Sora":
                continue
            if needed <= set(font.getBestCmap()):
                return path
        except Exception:
            continue
    raise SystemExit(
        "Could not find a Sora subset covering the wordmark. Run `npm run build` "
        "first so next/font caches it, or pass the .woff2 path as an argument."
    )


src = sys.argv[1] if len(sys.argv) > 1 else find_sora()
print("using", os.path.relpath(src, ROOT))

font = instantiateVariableFont(TTFont(src), {"wght": WEIGHT})
upem = font["head"].unitsPerEm
cmap, glyphs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]

# Lay the glyphs out, capturing both their outlines and the true ink bounds.
placed, x = [], 0.0
bounds = BoundsPen(glyphs)
for ch in TEXT:
    name = cmap[ord(ch)]
    glyphs[name].draw(TransformPen(bounds, Transform().translate(x, 0)))

    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    if pen.getCommands():
        placed.append((x, pen.getCommands()))

    x += hmtx[name][0] + TRACKING * upem

x0, _y0, _x1, y1 = bounds.bounds
w, h = _x1 - x0, y1 - _y0
paths = "\n    ".join(
    f'<path transform="translate({px:.2f} 0)" d="{d}"/>' for px, d in placed
)

# Font coordinates are y-up; flip them and pull the ink box to the origin.
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" role="img" aria-label="{TEXT}">
  <g transform="translate({-x0:.2f} {y1:.2f}) scale(1 -1)" fill="currentColor">
    {paths}
  </g>
</svg>'''

out = os.path.join(HERE, "wordmark.svg")
with open(out, "w") as fh:
    fh.write(svg)

print(f"wrote {os.path.relpath(out, ROOT)} — ink box {w:.1f} x {h:.1f}")
