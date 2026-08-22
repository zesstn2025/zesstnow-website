#!/usr/bin/env python3
"""
Crop the leadership photographs to a consistent 3:4 headshot.

The photographs arrive as phone snaps — one square close-up, two full-length
standing shots. Dropped into a 3:4 card with `object-fit: cover` they crop from
the centre of the frame, which on a full-length photo lands on the torso rather
than the face. This finds the face and composes a proper portrait crop around
it, so the three cards match each other instead of matching whatever the camera
happened to frame.

Run from the repo root:  python3 scripts/portraits.py
It reads scripts/portraits.json and writes into public/team.

Rerunning is safe: sources live in public/team/_originals and are never
modified, so the crop can be re-tuned without re-uploading anything.
"""

import json
import pathlib
import sys

import cv2
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEAM = ROOT / "public" / "team"
ORIGINALS = TEAM / "_originals"

# Output geometry. 900x1200 is comfortably above the 260px the card renders at,
# with room for a 2x display.
OUT_W, OUT_H = 900, 1200
RATIO = OUT_W / OUT_H

# Portrait composition, as fractions of the output frame:
# the face box occupies this much of the height, and its centre sits this far
# down. Eyes therefore land near the upper third, which is where a portrait
# reads as composed rather than as a crop.
FACE_HEIGHT = 0.42
FACE_CENTRE_Y = 0.44

CASCADE = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


# A head is in the upper part of any photograph of a standing or seated person,
# so a face centred below this line is not a face. On the first run the cascade
# confidently matched a patch of floor tiles, whose grid of dark grout lines
# reads to it exactly like two eyes and a mouth.
SEARCH_TOP = 0.62

# Sanity bounds on face width, as a fraction of image width. Below this it is
# texture; above it, the whole frame.
MIN_FACE_W, MAX_FACE_W = 0.05, 0.75


def find_face(path: pathlib.Path):
    """Return (x, y, w, h) of the most prominent face, or None."""
    image = cv2.imread(str(path))
    if image is None:
        raise SystemExit(f"cannot read {path}")

    H, W = image.shape[:2]
    grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    grey = cv2.equalizeHist(grey)
    detector = cv2.CascadeClassifier(CASCADE)

    def plausible(f):
        x, y, w, h = f
        # Filter on where the face sits rather than cropping the search area:
        # a tight portrait's face can be large enough to extend past the cut
        # line, and cropping first makes such a face undetectable.
        return MIN_FACE_W * W <= w <= MAX_FACE_W * W and (y + h / 2) <= SEARCH_TOP * H

    # A face that is small in the frame — the full-length shots — needs a finer
    # scale step to be found at all. Try progressively more permissive passes
    # rather than one loose pass, so a tight portrait does not match a shirt
    # collar before it matches the actual face.
    for scale, neighbours in ((1.05, 6), (1.05, 4), (1.08, 3), (1.15, 3)):
        faces = [
            f
            for f in detector.detectMultiScale(
                grey, scaleFactor=scale, minNeighbors=neighbours, minSize=(36, 36)
            )
            if plausible(f)
        ]
        if faces:
            # Largest match: on a group-free photo this is the subject.
            return max(faces, key=lambda f: f[2] * f[3])
    return None


def crop(src: pathlib.Path, dst: pathlib.Path, nudge_y: float = 0.0):
    image = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    W, H = image.size

    face = find_face(src)
    if face is None:
        # No face found — fall back to an upper-centre crop, which is where a
        # head is on almost any standing photograph. Better than the middle.
        print(f"  {src.name}: no face detected, using upper-centre crop")
        box_h = min(H, int(W / RATIO))
        top = min(max(0, int(H * 0.06)), H - box_h)
        left = max(0, (W - int(box_h * RATIO)) // 2)
        image.crop((left, top, left + int(box_h * RATIO), top + box_h)).resize(
            (OUT_W, OUT_H), Image.LANCZOS
        ).save(dst, "JPEG", quality=88, optimize=True)
        return

    fx, fy, fw, fh = (int(v) for v in face)
    print(f"  {src.name}: face at {fx},{fy} {fw}x{fh} in {W}x{H}")

    # Size the crop so the face fills FACE_HEIGHT of it, then place it so the
    # face centre lands at FACE_CENTRE_Y.
    crop_h = fh / FACE_HEIGHT
    crop_w = crop_h * RATIO

    face_cx, face_cy = fx + fw / 2, fy + fh / 2
    left = face_cx - crop_w / 2
    top = face_cy - crop_h * (FACE_CENTRE_Y + nudge_y)

    # If the ideal crop runs past an edge, shrink it to fit rather than letting
    # it clamp — clamping silently shifts the face off the composition line.
    if crop_w > W or crop_h > H:
        scale = min(W / crop_w, H / crop_h)
        crop_w, crop_h = crop_w * scale, crop_h * scale
        left = face_cx - crop_w / 2
        top = face_cy - crop_h * (FACE_CENTRE_Y + nudge_y)

    left = max(0, min(left, W - crop_w))
    top = max(0, min(top, H - crop_h))

    box = (round(left), round(top), round(left + crop_w), round(top + crop_h))
    image.crop(box).resize((OUT_W, OUT_H), Image.LANCZOS).save(
        dst, "JPEG", quality=88, optimize=True
    )


def main():
    spec = json.loads((ROOT / "scripts" / "portraits.json").read_text())
    missing = False
    for item in spec:
        src = ORIGINALS / item["source"]
        if not src.exists():
            print(f"  missing source: {src}")
            missing = True
            continue
        dst = TEAM / item["output"]
        crop(src, dst, nudge_y=item.get("nudgeY", 0.0))
        print(f"  -> {dst.relative_to(ROOT)} ({dst.stat().st_size // 1024} KB)")
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
