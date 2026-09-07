# -*- coding: utf-8 -*-
"""YouTube chapter timestamps, read off the built reel rather than typed.

The v1 copy pack had chapter times written by hand against v1's pacing. v2 cuts
roughly twice as often, so every one of those timestamps became wrong the moment
the reels were rebuilt — and a wrong chapter mark is worse than none, because it
sends the viewer to the wrong sentence.

So they are derived: each reel's HTML carries `--in` per scene (the moment that
scene appears), which is the same clock the video was rendered on. Pick the
scenes worth marking and read their real start times.
"""
import pathlib, re, sys

D = pathlib.Path("/home/user/reels")

# Which scene indices earn a chapter mark. Not all of them: fifteen chapters on
# a sixty-second video is noise. Six or seven, at the turns in the argument.
MARKS = {
  "mon-website": [0, 3, 5, 7, 8, 11, 13, 15],
  "tue-app":     [0, 2, 5, 7, 8, 9, 11, 14],
  "wed-saas":    [0, 3, 5, 7, 8, 9, 12, 14],
  "thu-ai":      [0, 2, 5, 6, 7, 10, 12, 15],
  "fri-funnel":  [0, 2, 3, 8, 10, 12, 13, 14],
  "sat-social":  [0, 3, 5, 7, 8, 10, 12, 14],
}


def starts(reel_id):
    """Scene start times in seconds, in scene order, from the rendered page."""
    html = D / "work2" / reel_id / "reel.html"
    if not html.exists():
        raise FileNotFoundError(f"{html} — build the reel first")
    found = re.findall(r'\.sc\[data-i="(\d+)"\]\{--in:([\d.]+)s', html.read_text())
    # `--in` opens the scene 0.14s before its line starts; add that back so a
    # chapter lands on the word, not on the fade.
    return {int(i): float(t) + 0.14 for i, t in found}


def chapters(reel_id, labels):
    """`labels` is one short line per marked scene, in order."""
    st = starts(reel_id)
    marks = MARKS[reel_id]
    if len(labels) != len(marks):
        raise ValueError(f"{reel_id}: {len(labels)} labels for {len(marks)} marks")
    out = []
    for idx, label in zip(marks, labels):
        t = max(0.0, st[idx])
        # YouTube requires the first chapter to be 0:00.
        if not out:
            t = 0.0
        out.append(f"{int(t)//60}:{int(t)%60:02d} {label}")
    return "\n".join(out)


if __name__ == "__main__":
    for rid in MARKS:
        try:
            st = starts(rid)
            print(f"{rid:14} {len(st)} scenes, ends {max(st.values()):.1f}s")
        except FileNotFoundError as e:
            print(f"{rid:14} not built yet")
