# Leadership photographs

`sonu-sharma.jpg`, `rani-devi.jpg` and `nitin-kumar.jpg` are **generated** — do
not edit or replace them by hand. They are produced from the originals in
`_originals/` by:

```
python3 scripts/portraits.py
```

which finds the face and composes a 3:4 headshot around it (900×1200, face at
42% of frame height, centred at 44% down). Two of the three originals are
full-length standing photos; dropped straight into the card they would crop to
the torso, which is what this exists to prevent.

## To change a photograph

1. Put the new file in `_originals/` — any size, any framing, face anywhere in
   the upper part of the frame.
2. Point at it from `scripts/portraits.json`.
3. Run the script and look at the result before committing. It prints the face
   box it found; a box in an implausible place means it matched something else.

To nudge the framing without touching the source, add `"nudgeY"` to that
entry in `scripts/portraits.json` — positive moves the crop down, negative up,
in fractions of the frame height.

## If a file is missing

`components/Leadership.tsx` checks each path on disk at build time and renders
a monogram instead of a broken frame. A typo in a filename therefore shows up
as a monogram, not as an error.

## One rule

These are photographs of real, named people. They must never be replaced with a
generated or stock likeness — the entire point of the section is that this
company is not anonymous.
