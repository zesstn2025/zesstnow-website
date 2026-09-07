# -*- coding: utf-8 -*-
"""Reel builder, v2 — faster cuts, per-service visuals, no letterhead look.

What changed from v1 and why, since the differences are the whole point:

  PACE. The narration ran at default speed with a 0.32s gap between lines and
  five to eight seconds on each static caption. Measured against what actually
  gets watched, that is slow. Now: +16% speech rate, 0.10s gaps, and roughly
  twice as many scenes at half the length each.

  MOTION. v1 animated scenes in and out and nothing in between. Now every scene
  animates its own contents, and the background drifts for the entire run, so no
  frame is ever still.

  LOOK. v1 reused the letterhead — navy, constellation, one palette for all six
  services. Right for A4, wrong for a feed, and it made six different services
  look like six copies of one video. Each service now has its own palette and
  its own visual object.

    python3 reel.py mon-website
    python3 reel.py all
"""
import asyncio, base64, pathlib, subprocess, sys

import edge_tts
import imageio_ffmpeg

from scenes import RENDER, THEMES, r_end, words
from style import CSS

D = pathlib.Path("/home/user/reels")
OUT = D / "out"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

VOICE = "hi-IN-MadhurNeural"
RATE = "+16%"        # measured: still fully intelligible in Hindi, and it is the
                     # single biggest fix for "slow"
W, H, FPS = 1080, 1920, 30

GAP = 0.10           # was 0.32 — the pause between lines, not between ideas
LEAD = 0.25
TAIL = 1.30


# ── Voice ───────────────────────────────────────────────────────────────

async def synth(text, path):
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(path))


def duration(path):
    r = subprocess.run([FFMPEG, "-i", str(path)], capture_output=True, text=True)
    for line in r.stderr.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise RuntimeError(f"no duration for {path}")


async def voice_track(reel, work):
    clips = []
    for i, sc in enumerate(reel["scenes"]):
        mp3 = work / f"vo{i:02d}.mp3"
        await synth(sc["vo"], mp3)
        clips.append((mp3, duration(mp3)))
    t = LEAD
    timeline = []
    for _, dur in clips:
        timeline.append(dict(start=round(t, 3), dur=round(dur, 3)))
        t += dur + GAP
    return clips, timeline, round(t - GAP + TAIL, 3)


def mix_audio(clips, total, dest):
    args = [FFMPEG, "-y"]
    for mp3, _ in clips:
        args += ["-i", str(mp3)]
    parts = [f"[{i}:a]apad=pad_dur={GAP}[a{i}]" for i in range(len(clips))]
    chain = ";".join(parts) + ";" + "".join(f"[a{i}]" for i in range(len(clips)))
    chain += f"concat=n={len(clips)}:v=0:a=1[cat]"
    chain += (f";[cat]adelay={int(LEAD*1000)}|{int(LEAD*1000)},apad,"
              f"atrim=0:{total},loudnorm=I=-16:TP=-1.5:LRA=11[out]")
    args += ["-filter_complex", chain, "-map", "[out]",
             "-c:a", "aac", "-b:a", "192k", "-ar", "44100", str(dest)]
    subprocess.run(args, check=True, capture_output=True)


# ── Page ────────────────────────────────────────────────────────────────

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


def scene_html(sc, i):
    k = sc["kind"]
    inner = r_end(sc, LOCKUP) if k == "end" else RENDER[k](sc)
    return f'<section class="sc s-{k}" data-i="{i}">{inner}</section>'


def build_html(reel, timeline, total):
    th = THEMES[reel["theme"]]
    scenes = "".join(scene_html(sc, i) for i, sc in enumerate(reel["scenes"]))

    # A scene's window opens a beat before its line and closes a beat after.
    # 0.14s of overlap on each side is enough for the cross-fade and small
    # enough that it still reads as a cut.
    rules = []
    for i, t in enumerate(timeline):
        start = max(0.0, t["start"] - 0.14)
        end = t["start"] + t["dur"] + (0.16 if i < len(timeline) - 1 else TAIL)
        rules.append(f'.sc[data-i="{i}"]{{--in:{start:.3f}s;'
                     f'--hold:{max(0.2, end - start):.3f}s;}}')

    css = (CSS.replace("__FONTS__", FONTS).replace("__TOTAL__", f"{total:.3f}")
              .replace("__BG1__", th["bg1"]).replace("__BG2__", th["bg2"])
              .replace("__ORB__", th["orb"]).replace("__ACC__", th["acc"])
              .replace("__ACC2__", th["acc2"]).replace("__INK__", th["ink"]))
    css += "\n" + "\n".join(rules)

    return ('<!doctype html><html lang="hi"><head><meta charset="utf-8"/>'
            f'<style>{css}</style></head><body>'
            '<div class="bg"><div class="orb a"></div><div class="orb b"></div>'
            '<div class="grid"></div></div>'
            f'<div class="stage">{scenes}</div><div class="bar-p"></div>'
            '</body></html>')


# ── Capture ─────────────────────────────────────────────────────────────
# The clock is set explicitly per frame rather than left to the compositor.
# Left to wall-clock recording, a 50s timeline came out as a 57s file and every
# caption drifted a sentence behind. Also: no animations:"disabled" on the
# screenshot — that option fast-forwards every animation to its end state,
# which here means opacity 0, i.e. blank frames.

RECORD_JS = r"""
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
(async () => {
  const [html, dir, total, fps] = process.argv.slice(2);
  const N = Math.ceil(Number(total) * Number(fps));
  const b = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox","--disable-dev-shm-usage","--hide-scrollbars"],
  });
  const p = await b.newPage({ viewport: { width: __W__, height: __H__ } });
  const errs = [];
  p.on("pageerror", e => errs.push(String(e).slice(0,200)));
  await p.goto("file://" + html);
  await p.evaluate(() => document.fonts.ready);
  // The animation list is captured ONCE and kept on window. Calling
  // getAnimations() inside the per-frame loop re-walks the whole document
  // every frame; with ~110 animations over ~1650 frames that dominated the
  // run time (measured: 6m44s a reel, most of it in this call).
  const count = await p.evaluate(() => {
    window.__anims = document.getAnimations();
    window.__anims.forEach(a => a.pause());
    return window.__anims.length;
  });
  console.log("animations: " + count + ", frames: " + N);

  // Preflight. A `.stage` rule written for a funnel row once landed on the
  // container that holds every scene and set opacity:0 on it — the whole video
  // came out as a background with nothing on it, while every element inside
  // still reported itself visible. One assertion catches that class of bug
  // before 1,600 frames are written.
  const pre = await p.evaluate(() => {
    const st = document.querySelector(".stage");
    return { op: getComputedStyle(st).opacity, scenes: st.children.length };
  });
  if (pre.op !== "1") {
    throw new Error(".stage computed opacity is " + pre.op +
                    " — something is overriding the scene container");
  }
  console.log("stage ok: opacity " + pre.op + ", " + pre.scenes + " scenes");

  for (let i = 0; i < N; i++) {
    await p.evaluate((ms) => {
      for (const a of window.__anims) a.currentTime = ms;
    }, (i / Number(fps)) * 1000);
    await p.screenshot({ path: dir + "/f" + String(i).padStart(5,"0") + ".jpg",
                         type: "jpeg", quality: 92 });
  }
  if (errs.length) console.log("JS ERRORS: " + errs.join(" | "));
  await b.close();
})();
"""


def record(html_path, work, total):
    js = work / "record.js"
    js.write_text(RECORD_JS.replace("__W__", str(W)).replace("__H__", str(H)))
    frames = work / "frames"
    frames.mkdir(exist_ok=True)
    for f in frames.glob("*.jpg"):
        f.unlink()
    r = subprocess.run(["node", str(js), str(html_path), str(frames), str(total), str(FPS)],
                       capture_output=True, text=True, cwd=str(work))
    for line in r.stdout.strip().splitlines():
        print("    ", line)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:])
    n = len(list(frames.glob("*.jpg")))
    if n < int(total * FPS):
        raise RuntimeError(f"only {n} of {int(total*FPS)} frames")
    check_frames_have_content(frames, n)
    return frames


def check_frames_have_content(frames, n):
    """Refuse to ship a reel whose frames are only background.

    Counts bright pixels. The backgrounds are dark in every theme while the type
    and the white cards are near 255, so "is any of this frame bright" separates
    a real frame from a background-only one.

    Two calibrations, both learned by the check being wrong:

    A first version used JPEG file size, and failed a perfectly good render —
    the drifting gradient compresses to about the same size with or without
    type on it.

    The second version demanded that 60% of sampled frames carry type, at a
    threshold of 190. That failed the Saturday reel, whose theme is darker and
    whose cuts land often enough that half the samples fall in a cross-fade.
    Inspecting the "blank" frames showed a large counter and two lines of text.
    So the bar is now what it should always have been: a *total* failure is one
    where almost nothing anywhere is bright. Cross-fades and dark scenes are
    expected; a video with no type at all is not.
    """
    from PIL import Image
    checked, blank = 0, 0
    for i in range(6, n, max(1, n // 12)):
        f = frames / f"f{i:05d}.jpg"
        if not f.exists():
            continue
        px = list(Image.open(f).convert("L").resize((216, 384)).getdata())
        bright = sum(1 for v in px if v > 170) / len(px)
        checked += 1
        if bright < 0.002:
            blank += 1
    if checked and blank > checked * 0.75:
        raise RuntimeError(
            f"{blank} of {checked} sampled frames are essentially empty — "
            "the scene layer is not rendering")
    print(f"     content ok: {checked - blank}/{checked} sampled frames carry type")


def mux(frames, aac, total, dest):
    subprocess.run([
        FFMPEG, "-y",
        "-framerate", str(FPS), "-i", str(frames / "f%05d.jpg"),
        "-i", str(aac), "-map", "0:v:0", "-map", "1:a:0",
        "-t", f"{total:.3f}", "-vf", "format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-profile:v", "high", "-level", "4.0", "-g", str(FPS * 2),
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dest),
    ], check=True, capture_output=True)


def build(reel):
    work = D / "work2" / reel["id"]
    work.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(exist_ok=True)
    n = len(reel["scenes"])
    print(f"\n=== {reel['id']}  {reel['day']} — {reel['service']}  ({n} scenes) ===")

    clips, timeline, total = asyncio.run(voice_track(reel, work))
    avg = total / n
    print(f"    {total:.1f}s total, {avg:.2f}s average per cut")
    if not (52 <= total <= 63):
        print(f"    !! {total:.1f}s outside 55-60 target")

    aac = work / "voice.m4a"
    mix_audio(clips, total, aac)

    html = work / "reel.html"
    html.write_text(build_html(reel, timeline, total), encoding="utf-8")

    frames = record(html, work, total)
    dest = OUT / f"{reel['id']}.mp4"
    mux(frames, aac, total, dest)
    print(f"    -> {dest.name}  {dest.stat().st_size/1e6:.1f} MB")
    return dest


if __name__ == "__main__":
    from spec2 import REELS
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    todo = REELS if which == "all" else [r for r in REELS if r["id"] == which]
    if not todo:
        sys.exit(f"no reel {which!r}")
    for r in todo:
        build(r)
