"""
Generates the Zesst Now logo system.

The mark is an original geometric Z: two full-width bars joined by a steep
diagonal, with the two free terminals sheared parallel to that diagonal so the
whole letter leans forward. That shear is the "Now" — motion without cutting the
letter apart, which is what keeps it readable down to 16px.

An earlier cut ran slits across the diagonal instead. It shredded at small sizes
and stopped reading as a Z, so it was abandoned.

Everything is drawn from one set of numbers so the mark, the mono cut and the
lockup can never drift apart. The wordmark is real Sora 600 converted to
outlines, so no file depends on a font being installed.
"""

import os, re

OUT = "/home/user/zesstnow-website/brand"
os.makedirs(OUT, exist_ok=True)

# ── mark geometry, on a 96 grid ──────────────────────────────────────────────
# A Z built from two full-width bars and a steep diagonal. The two free
# terminals — top-left and bottom-right — are sheared parallel to that diagonal,
# which leans the whole letter forward. That shear is the "Now"; it reads as
# motion without cutting the letter up, so the Z survives down to 16px.
BOX, RADIUS = 96, 22
L, R = 26, 70          # Z left / right extent
TOP, BOT = 20, 76      # Z top / bottom extent
BAR = 10               # bar thickness
DIAG = 17              # diagonal thickness, measured horizontally

top_b, bot_t = TOP + BAR, BOT - BAR              # 30, 66
run = (R - DIAG) - L                             # horizontal travel of the diagonal
rise = bot_t - top_b                             # vertical travel
SHEAR = BAR * run / rise                         # terminals parallel to the diagonal

Z_OUTLINE = (
    f"M{L + SHEAR:.2f},{TOP} H{R} V{top_b} L{L + DIAG},{bot_t} H{R} "
    f"L{R - SHEAR:.2f},{BOT} H{L} V{bot_t} L{R - DIAG},{top_b} H{L} Z"
)

# One path, no punched holes — the mark is the letter and nothing else.
Z_CUT = Z_OUTLINE
SLITS = ""

VIOLET, CYAN, INK = "#6D3BF5", "#22D3EE", "#05060F"

GRAD = (
    '<linearGradient id="zg" x1="0" y1="0" x2="1" y2="1">'
    f'<stop offset="0" stop-color="{VIOLET}"/>'
    f'<stop offset="1" stop-color="{CYAN}"/>'
    "</linearGradient>"
)

def write(name, body):
    open(os.path.join(OUT, name), "w").write(body)
    print("wrote", name)

# ── 1. primary mark — gradient tile, ink Z ───────────────────────────────────
write("zesst-now-mark.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}" width="{BOX}" height="{BOX}" role="img" aria-label="Zesst Now">
  <defs>{GRAD}</defs>
  <rect width="{BOX}" height="{BOX}" rx="{RADIUS}" fill="url(#zg)"/>
  <path d="{Z_CUT}" fill="{INK}"/>
</svg>''')

# ── 2. mono mark — single colour, no tile. The trademark-filing cut. ─────────
write("zesst-now-mark-mono.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}" width="{BOX}" height="{BOX}" role="img" aria-label="Zesst Now">
  <path d="{Z_CUT}" fill="#000000"/>
</svg>''')

# ── 3. mono tile — reversed, for stamps and single-colour print ──────────────
write("zesst-now-mark-mono-tile.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}" width="{BOX}" height="{BOX}" role="img" aria-label="Zesst Now">
  <rect width="{BOX}" height="{BOX}" rx="{RADIUS}" fill="#000000"/>
  <path d="{Z_CUT}" fill="#FFFFFF"/>
</svg>''')

# ── 4. favicon — slits dropped; below ~32px they silt up and muddy the Z ─────
write("zesst-now-favicon.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}" width="{BOX}" height="{BOX}" role="img" aria-label="Zesst Now">
  <defs>{GRAD}</defs>
  <rect width="{BOX}" height="{BOX}" rx="{RADIUS}" fill="url(#zg)"/>
  <path d="{Z_OUTLINE}" fill="{INK}"/>
</svg>''')

# ── 5 & 6. lockups — mark + Sora 600 outlines ───────────────────────────────
src = open("/tmp/claude-0/-home-user-advnitinkumar-website/"
           "4ba61bc9-9ff3-5346-80f4-3ca54a7cd7f4/scratchpad/wordmark.svg").read()
vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', src)
WM_W, WM_H = float(vb.group(1)), float(vb.group(2))
inner = re.search(r"<g transform=\"([^\"]+)\"[^>]*>(.*)</g>", src, re.S)
wm_transform, wm_paths = inner.group(1), inner.group(2).strip()

CAP, GAP = 44.0, 26.0                     # wordmark cap height, gap from mark
k = CAP / WM_H
wm_w = WM_W * k
total_w = BOX + GAP + wm_w
wm_y = (BOX - CAP) / 2

def lockup(mark_fill_defs, mark_body, word_fill, name):
    write(name, f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w:.1f} {BOX}" width="{total_w:.0f}" height="{BOX}" role="img" aria-label="Zesst Now">
  {mark_fill_defs}
  {mark_body}
  <g transform="translate({BOX + GAP:.1f} {wm_y:.2f}) scale({k:.6f})" fill="{word_fill}">
    <g transform="{wm_transform}">
      {wm_paths}
    </g>
  </g>
</svg>''')

lockup(
    f"<defs>{GRAD}</defs>",
    f'<rect width="{BOX}" height="{BOX}" rx="{RADIUS}" fill="url(#zg)"/>\n'
    f'  <path d="{Z_CUT}" fill="{INK}"/>',
    "#FFFFFF",
    "zesst-now-lockup.svg",
)

lockup(
    "",
    f'<path d="{Z_CUT}" fill="#000000"/>',
    "#000000",
    "zesst-now-lockup-mono.svg",
)

print(f"\nmark grid {BOX}  |  wordmark {WM_W:.0f}x{WM_H:.0f} -> scale {k:.5f}")
print(f"lockup {total_w:.0f} x {BOX}  (ratio {total_w/BOX:.3f})")
