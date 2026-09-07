# -*- coding: utf-8 -*-
"""One branded image per service, for the Google Business post.

Google shows a local post with a photo far more prominently than one without,
and a post with no image is the one people scroll past. These are built the same
way the Reels are — CSS rendered by Chromium — so the card and the video are
recognisably the same company, and nothing is licensed from anywhere.

1200x900. Google accepts 250x250 upward and recommends 720x720; 4:3 is what the
post card actually crops to, so composing at 4:3 means nothing important gets
cut.

    python3 cards.py            → all
    python3 cards.py gst-filing
"""
import base64, json, pathlib, subprocess, sys

D = pathlib.Path("/home/user/reels")
OUT = pathlib.Path("/home/user/zesstnow-website/public/reels/img")
W, H = 1200, 900

from style import CSS as REEL_CSS  # noqa: F401  (themes come from scenes)
from scenes import THEMES


def b64(p): return base64.b64encode(D.joinpath(p).read_bytes()).decode()

def face(fam, f, w):
    return (f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};"
            f"font-display:block;src:url(data:font/woff2;base64,{b64(f)}) format('woff2');}}")

FONTS = "".join([
    face("Manrope", "fonts/manrope-500.woff2", 500),
    face("Manrope", "fonts/manrope-600.woff2", 600),
    face("Manrope", "fonts/manrope-700.woff2", 700),
    face("JetBrains Mono", "fonts/jbmono-500.woff2", 500),
    face("Noto Devanagari", "fonts/notodev-500.woff2", 500),
    face("Noto Devanagari", "fonts/notodev-600.woff2", 600),
])

LOCKUP = D.joinpath("brand-lockup.svg").read_text()


CARD_CSS = """
__FONTS__
:root{--bg1:__BG1__;--bg2:__BG2__;--orb:__ORB__;--acc:__ACC__;--acc2:__ACC2__;
      --dev:'Noto Devanagari','Manrope',sans-serif;--ui:'Manrope',sans-serif;
      --mono:'JetBrains Mono',monospace;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1200px;height:900px;overflow:hidden;}
body{font-family:var(--ui);color:#fff;position:relative;
  background:linear-gradient(150deg,var(--bg1) 0%,var(--bg2) 62%,var(--bg1) 100%);}
.orb{position:absolute;border-radius:50%;filter:blur(110px);}
.orb.a{width:640px;height:640px;background:var(--orb);opacity:.55;left:-160px;top:-180px;}
.orb.b{width:520px;height:520px;background:var(--acc);opacity:.30;right:-140px;bottom:-140px;}
.grid{position:absolute;inset:0;opacity:.09;
  background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);
  background-size:72px 72px;}
.wrap{position:absolute;inset:0;padding:82px 90px;display:flex;flex-direction:column;}
.eyebrow{font-family:var(--dev);font-size:30px;font-weight:600;color:var(--acc);
  letter-spacing:.02em;}
.head{margin-top:26px;font-family:var(--dev);font-weight:600;font-size:82px;
  line-height:1.22;letter-spacing:-.015em;max-width:960px;}
.head .hl{color:var(--acc);}
.sub{margin-top:30px;font-family:var(--dev);font-weight:500;font-size:38px;
  line-height:1.44;color:rgba(255,255,255,.80);max-width:900px;}
.rule{margin-top:auto;height:3px;border-radius:2px;
  background:linear-gradient(90deg,var(--acc),var(--acc2),transparent);}
.foot{margin-top:30px;display:flex;align-items:flex-end;justify-content:space-between;}
.lk svg{height:58px;width:auto;display:block;}
.meta{text-align:right;font-family:var(--ui);font-weight:500;font-size:27px;
  line-height:1.5;color:rgba(255,255,255,.72);}
.meta b{color:#fff;font-weight:600;}
"""

HTML = """<!doctype html><html lang="hi"><head><meta charset="utf-8"/>
<style>__CSS__</style></head><body>
<div class="orb a"></div><div class="orb b"></div><div class="grid"></div>
<div class="wrap">
  <div class="eyebrow">__EYEBROW__</div>
  <div class="head">__HEAD__</div>
  <div class="sub">__SUB__</div>
  <div class="rule"></div>
  <div class="foot">
    <div class="lk">__LOCKUP__</div>
    <div class="meta"><b>पूरे भारत में</b><br>www.cognitivecapitalsuite.com</div>
  </div>
</div></body></html>"""


SHOT_JS = r"""
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
(async () => {
  const [html, out] = process.argv.slice(2);
  const b = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox","--disable-dev-shm-usage","--hide-scrollbars"] });
  const p = await b.newPage({ viewport: { width: __W__, height: __H__ } });
  await p.goto("file://" + html);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out, type: "jpeg", quality: 92 });
  await b.close();
})();
"""


def build(card):
    th = THEMES[card["theme"]]
    css = (CARD_CSS.replace("__FONTS__", FONTS)
           .replace("__BG1__", th["bg1"]).replace("__BG2__", th["bg2"])
           .replace("__ORB__", th["orb"]).replace("__ACC__", th["acc"])
           .replace("__ACC2__", th["acc2"]))
    html = (HTML.replace("__CSS__", css)
            .replace("__EYEBROW__", card["eyebrow"])
            .replace("__HEAD__", card["head"])
            .replace("__SUB__", card["sub"])
            .replace("__LOCKUP__", LOCKUP))

    work = D / "work-cards"
    work.mkdir(exist_ok=True)
    hp = work / f"{card['id']}.html"
    hp.write_text(html, encoding="utf-8")

    js = work / "shot.js"
    js.write_text(SHOT_JS.replace("__W__", str(W)).replace("__H__", str(H)))

    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{card['id']}.jpg"
    r = subprocess.run(["node", str(js), str(hp), str(dest)],
                       capture_output=True, text=True, cwd=str(work))
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-800:])
    kb = dest.stat().st_size / 1024
    # Google rejects a post whose image is under 10 KB as broken; a card that
    # rendered as an empty gradient lands around 30 KB, one with type on it
    # comfortably above 60. Cheap guard against shipping a blank card.
    if kb < 40:
        raise RuntimeError(f"{dest.name} is only {kb:.0f}KB — probably blank")
    print(f"  {dest.name:34} {kb:5.0f} KB")
    return dest


if __name__ == "__main__":
    from servicecards import CARDS
    want = sys.argv[1] if len(sys.argv) > 1 else None
    todo = [c for c in CARDS if not want or c["id"] == want]
    if not todo:
        sys.exit(f"no card {want!r}")
    print(f"building {len(todo)} cards -> {OUT}")
    for c in todo:
        build(c)
