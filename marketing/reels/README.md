# The daily Reel system

One 55–60 second vertical video a day, six days a week, built here and posted to
the accounts listed below. Sunday is off.

```
spec2.py     the six Reels as data — spoken lines and the visual each one uses
scenes.py    one renderer per visual: browser, form, phone, dashboard, funnel, calendar…
style.py     the look. Per-service palette, kinetic type, motion on every scene
reel.py      builds a Reel: voice → measure → HTML → frames → mp4
copy.py      every line of text that goes out, written per platform
chapters.py  YouTube chapter timestamps, read off the built video
post.py      today's posting plan as executable payloads
```

## Building

```bash
python3 reel.py mon-website      # one
python3 reel.py all              # all six, about 40 minutes
python3 copy.py all              # the text pack
python3 post.py                  # today's plan (IST)
python3 post.py --json           # the same, for the daily Routine
```

Needs `edge-tts` and `imageio-ffmpeg` (`pip install edge-tts imageio-ffmpeg`) plus
the Playwright Chromium already present in the build environment. No paid API and
no generation credits: the voice is Microsoft's free endpoint, ffmpeg ships inside
imageio-ffmpeg, and every frame is CSS rendered by Chromium.

Behind a TLS-intercepting proxy, `edge-tts` pins certifi's bundle rather than
reading `SSL_CERT_FILE`, so the proxy CA has to be appended to
`certifi/cacert.pem` or synthesis fails with a certificate error.

## The order things happen in, and why

**Voice first, then visuals.** Every line is synthesised and then *measured*, and
the scene timeline is built from the real durations. Timing a caption by guessing
"this sentence is about four seconds" is how captions end up leaving the screen
mid-word — and on a muted phone the caption is the video.

**The clock is set, not observed.** Frames are captured by pausing every
animation and assigning `currentTime` per frame. Playwright's video recorder was
the obvious choice and produced a 57-second file for a 50-second timeline,
because a 1080×1920 page full of CSS animation does not paint at 30fps in a
headless browser. Every scene ran 14% late; by the middle of the Reel the caption
on screen belonged to the previous sentence.

Two traps in that same area, both of which produced *plausible-looking* output:

- `screenshot({ animations: "disabled" })` sounds like what a deterministic
  capture wants. It fast-forwards every finite animation to its end state, and
  every scene here ends at opacity 0 — so all 1,600 frames came out empty.
- A `.stage` rule written for a funnel row landed on `.stage`, the container
  holding every scene, and set `opacity: 0` on it. The video rendered as
  background with nothing on it while every element inside still reported itself
  visible to `getComputedStyle`.

`reel.py` now asserts the scene container's opacity before capturing, and counts
bright pixels across sampled frames afterwards. A first attempt at that second
check used JPEG file size and failed a perfectly good render — the drifting
gradient background compresses to about the same size either way.

## Where the videos live

`public/reels/<id>.mp4`, served from the company's own domain. Instagram, YouTube
and Facebook all pull the file from a URL rather than accepting an upload, and a
URL on the company domain is served as `video/mp4` by the CDN, which those
fetchers require.

These six files are the recurring weekly set, not a new file every day. When the
angle rotates (see section 08 of the Daily Marketing System), replace the files
at the same paths so the repository does not grow a copy per day.

## Where each post goes

| Time (IST) | Platform | Account | Days |
|---|---|---|---|
| 08:00 | Google Business post | Zesst Now services private limited | Mon · Wed · Fri |
| 19:00 | Instagram Reel | @zesstnowai | Mon–Sat |
| 19:05 | YouTube Short | @sonu_sharma_entrepreneur | Mon–Sat |
| 19:10 | Facebook Page video | Zesst Now services private limited | Mon–Sat |
| 19:15 | LinkedIn company update | Cognitive Capital-Global | Tue · Wed · Thu |

Account ids are written down in `post.py` rather than resolved from a dropdown at
post time. A dropdown that returns a different order one morning would otherwise
put the company's video on somebody's personal page.

LinkedIn gets the text post and a link, never the video — a re-posted Reel reads
as noise there. Google Business gets the *desk* half of the day (GST, loans,
registration), because someone searching at nine in the morning wants the
compliance desk, not a video about SaaS.
