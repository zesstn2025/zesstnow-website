from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

SRC = "/home/user/zesstnow-website/.next/static/media/3dc379dc9b5dec12-s.p.woff2"
TEXT, WEIGHT, TRACKING = "ZESST NOW", 600, 0.14

font = instantiateVariableFont(TTFont(SRC), {"wght": WEIGHT})
upem = font["head"].unitsPerEm
cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]

# Lay the glyphs out, capturing both outlines and the true ink bounds.
placed, x = [], 0.0
bounds = BoundsPen(gs)
for ch in TEXT:
    g = cmap[ord(ch)]
    t = Transform().translate(x, 0)
    gs[g].draw(TransformPen(bounds, t))
    pen = SVGPathPen(gs)
    gs[g].draw(pen)
    if pen.getCommands():
        placed.append((x, pen.getCommands()))
    x += hmtx[g][0] + TRACKING * upem

x0, y0, x1, y1 = bounds.bounds
w, h = x1 - x0, y1 - y0
paths = "\n    ".join(
    f'<path transform="translate({px:.2f} 0)" d="{d}"/>' for px, d in placed
)

# Flip to y-down and shift the ink box to the origin.
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" role="img" aria-label="ZESST NOW">
  <g transform="translate({-x0:.2f} {y1:.2f}) scale(1 -1)" fill="currentColor">
    {paths}
  </g>
</svg>'''
open("wordmark.svg", "w").write(svg)
print(f"ink box: {w:.1f} x {h:.1f}  (ratio {w/h:.3f})")
