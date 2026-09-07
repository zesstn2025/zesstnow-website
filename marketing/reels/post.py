# -*- coding: utf-8 -*-
"""Today's posting plan, as executable payloads.

The daily Routine fires a fresh session that has no memory of any of this. So
this file is the handover: given a date, it prints exactly which video goes
where, with which text, to which account id — and the session's only job is to
pass those payloads to the Zapier actions named in each block.

Nothing here posts anything. It builds the plan; a human or the fired session
executes it. Keeping those separate means the plan can be read and checked
before anything goes out, and a bad day can be skipped without editing code.

    python3 post.py            → today (IST)
    python3 post.py monday
    python3 post.py --json     → machine-readable
"""
import datetime as dt
import json
import sys
import zoneinfo

from copy import COPY, FOOTER, TAGS_COMMON, yt_description
from spec2 import REELS

IST = zoneinfo.ZoneInfo("Asia/Kolkata")
SITE = "https://www.cognitivecapitalsuite.com"

# Where each day's video is served from. Committed into the website's own
# public/ folder, so the URL is on the company's domain, is served as video/mp4
# by Vercel's CDN, and is fetchable by Instagram, YouTube and Facebook — all
# three pull the file from a URL rather than accepting an upload from here.
VIDEO_BASE = f"{SITE}/reels"

# The account ids every post targets. Written down rather than looked up at
# fire time: a dropdown that returns a different order one morning would
# otherwise post the company's video to somebody's personal page.
TARGETS = dict(
    instagram_account="17841475982008901",          # @zesstnowai
    facebook_page_zesstnow="100709512133622",       # Zesst Now services private limited
    linkedin_company="117373922",                   # Cognitive Capital-Global
    gbp_location="locations/9244036794200648994",   # Zesst Now services private limited
)

GBP_API = "https://mybusiness.googleapis.com/v4"
GBP_ACCOUNT = "112479523110015984027"
GBP_LOCATION = "9244036794200648994"

# Each day's video points at the page that answers it. A Reel that sends people
# to the home page converts far worse than one that lands on the service.
LANDING = {
    "mon-website":  "/services",
    "tue-app":      "/services",
    "wed-saas":     "/services/saas-development",
    "thu-ai":       "/services/ai-agents",
    "fri-funnel":   "/services/digital-marketing",
    "sat-social":   "/services/digital-marketing",
}

# The desk half of each day gets its own destination, because the Google
# Business post is aimed at a different person than the Reel.
DESK_LANDING = {
    "mon-website":  "/services/fintech",
    "tue-app":      "/services/fintech",
    "wed-saas":     "/services",
    "thu-ai":       "/services/digital-marketing",
    "fri-funnel":   "/products",
    "sat-social":   "/products",
}

WEEKDAY_TO_REEL = {
    0: "mon-website", 1: "tue-app", 2: "wed-saas",
    3: "thu-ai", 4: "fri-funnel", 5: "sat-social",
}

# LinkedIn is Tue-Thu only. Posting everywhere every day is how an account
# starts looking automated, which is the one thing that reliably suppresses
# reach — but Google Business is the exception: it is a directory listing, not
# a feed, so a post a day is normal there and each one is a different service.
LINKEDIN_DAYS = {1, 2, 3}
GBP_DAYS = {0, 1, 2, 3, 4, 5}

# The service rotation starts here and advances one card per posting day,
# Monday to Saturday, wrapping at the end. With 25 services that is a little
# over four weeks before a service comes round again.
CYCLE_EPOCH = dt.date(2026, 9, 7)   # a Monday


def service_of_day(date):
    """Which service card today's Google Business post carries.

    Counted in *posting* days rather than calendar days: Sunday publishes
    nothing, and if the index advanced on Sundays one service in seven would
    never be posted at all.
    """
    from servicecards import CARDS
    days = (date - CYCLE_EPOCH).days
    if days < 0:
        days = 0
    full_weeks, rest = divmod(days, 7)
    posting_days = full_weeks * 6 + min(rest, 6)
    return CARDS[posting_days % len(CARDS)]


def link(path, source, campaign):
    """A landing URL that reports where the click came from."""
    return (f"{SITE}{path}?utm_source={source}&utm_medium=organic"
            f"&utm_campaign={campaign}")


def service_post(card):
    """The Google Business post for one service.

    Always carries an image: a local post with a photo is shown far more
    prominently than one without, and a bare-text post is the one people scroll
    past. Never carries a phone number — Google's local post policy disallows
    it, and a post that breaks it comes back REJECTED rather than erroring, so
    it fails silently.
    """
    body = {
        "languageCode": "hi",
        "summary": card["post"].strip(),
        "topicType": "STANDARD",
        "media": [{
            "mediaFormat": "PHOTO",
            "sourceUrl": f"{VIDEO_BASE}/img/{card['id']}.jpg",
        }],
        "callToAction": {
            "actionType": "LEARN_MORE",
            "url": link(card["landing"], "google-business", card["id"]),
        },
    }
    assert "77538" not in body["summary"], "no phone numbers in a Google post"
    return dict(
        order=0, at="08:00 IST", platform="Google Business post",
        account="Zesst Now services private limited",
        service=card["eyebrow"], card=card["id"],
        tool="google_business_profile_make_api_mutating_request",
        selected_api="GoogleMyBusinessCLIAPI", action="_zap_raw_request",
        params={
            "method": "POST",
            "url": (f"{GBP_API}/accounts/{GBP_ACCOUNT}/"
                    f"locations/{GBP_LOCATION}/localPosts"),
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(body, ensure_ascii=False),
            "fail_on_errors": "true",
        },
        verify=("Read the post back afterwards. It returns PROCESSING and "
                "becomes LIVE or REJECTED a minute later, and a REJECTED "
                "post is invisible rather than an error."),
    )


def plan(day_index, date=None, video_only=False):
    if day_index not in WEEKDAY_TO_REEL:
        return dict(rest_day=True,
                    note="Sunday. Nothing goes out — a rest day that is planned "
                         "survives; one taken out of guilt does not.")

    rid = WEEKDAY_TO_REEL[day_index]
    reel = next(r for r in REELS if r["id"] == rid)
    c = COPY[rid]
    video = f"{VIDEO_BASE}/{rid}.mp4"
    tags = " ".join(c["ig_tags"] + TAGS_COMMON)

    posts = []

    # ── 19:00 IST · Instagram Reel — the highest-reach slot of the day ──
    posts.append(dict(
        order=1, at="19:00 IST", platform="Instagram Reel", account="@zesstnowai",
        tool="instagram_for_business_publish_video",
        selected_api="InstagramBusinessCLIAPI",
        action="publish_video",
        params={
            "instagramPageId": TARGETS["instagram_account"],
            "video": video,
            "caption": (c["ig_caption"] + "\n\n"
                        + link(LANDING[rid], "instagram", rid) + "\n\n"
                        + tags + "\n\n" + FOOTER),
        }))

    # ── 19:05 · YouTube Short. Two minutes behind Instagram so the upload is
    #    processing while the Reel is already gathering its first views.
    posts.append(dict(
        order=2, at="19:05 IST", platform="YouTube Short",
        account="@sonu_sharma_entrepreneur",
        tool="youtube_upload_video", selected_api="YouTubeV4CLIAPI",
        action="upload_video",
        params={
            "title": c["yt_title"] + " #Shorts",
            "video": video,
            "description": (yt_description(rid) + "\n\n"
                            + link(LANDING[rid], "youtube", rid)),
            "tags": c["yt_tags"],
            "privacy_status": "public",
            "made_for_kids": "false",
            "notify_subscribers": "true",
            "default_language": "hi",
            "default_audio_language": "hi",
        }))

    # ── 19:10 · Facebook page video ──
    posts.append(dict(
        order=3, at="19:10 IST", platform="Facebook Page video",
        account="Zesst Now services private limited",
        tool="facebook_pages_create_page_video", selected_api="FacebookV2CLIAPI",
        action="page_video",
        params={
            "page": TARGETS["facebook_page_zesstnow"],
            "title": c["yt_title"],
            "source": video,
            "description": (c["fb"] + "\n\n"
                            + link(LANDING[rid], "facebook", rid) + "\n\n"
                            + FOOTER),
        }))

    # ── 19:15 · LinkedIn, Tue-Thu, and never the video ──
    if day_index in LINKEDIN_DAYS:
        posts.append(dict(
            order=4, at="19:15 IST", platform="LinkedIn company update",
            account="Cognitive Capital-Global",
            tool="linkedin_create_company_update", selected_api="LinkedInCLIAPI",
            action="create_company_update",
            params={
                "company_id": TARGETS["linkedin_company"],
                "comment": (c["li"] + "\n\n"
                            + link(LANDING[rid], "linkedin", rid)),
                "submitted_url": link(LANDING[rid], "linkedin", rid),
                "title": c["yt_title"][:400],
            }))

    # ── 08:00 · Google Business, Mon/Wed/Fri, and the desk half not the build
    #    half. Someone searching at nine in the morning wants the compliance
    #    desk, not a video about SaaS.
    #    Posted through the raw API rather than Zapier's create_post action,
    #    because that action cannot attach a call-to-action button and Google
    #    would otherwise get a bare URL sitting in the body text.
    #
    #    Two things this post must never contain: a phone number, and a raw
    #    link in the summary. The first live attempt included the company's
    #    number and came back REJECTED; the identical text without it, with the
    #    URL moved into a LEARN_MORE button, went LIVE. Google's local post
    #    policy disallows phone numbers in post content — the API accepts the
    #    post and then quietly rejects it, so nothing surfaces until the state
    #    is read back.
    morning = []
    if day_index in GBP_DAYS and not video_only:
        morning.append(service_post(service_of_day(date or dt.date.today())))

    return dict(
        date=str(date) if date else None,
        day=reel["day"], reel=rid,
        build_service=reel["service"], desk_service=reel["desk"],
        video=video,
        morning=morning, evening=posts,
        total=len(morning) + len(posts),
    )


def render(p):
    if p.get("rest_day"):
        print("\n  " + p["note"] + "\n")
        return
    bar = "=" * 70
    print(f"\n{bar}\n  {p['day'].upper()}  ·  {p['build_service']}  ×  {p['desk_service']}")
    print(f"  video: {p['video']}\n  {p['total']} posts today\n{bar}")
    for post in p["morning"] + p["evening"]:
        print(f"\n── {post['at']}  {post['platform']}  →  {post['account']}")
        print(f"   tool: {post['tool']}")
        for k, v in post["params"].items():
            if isinstance(v, list):
                v = ", ".join(v)
            v = str(v)
            if len(v) > 180:
                v = v[:180].replace("\n", " ⏎ ") + " …"
            else:
                v = v.replace("\n", " ⏎ ")
            print(f"   {k:18} {v}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--json"]
    now = dt.datetime.now(IST)
    names = ["monday", "tuesday", "wednesday", "thursday",
             "friday", "saturday", "sunday"]
    idx = names.index(args[0].lower()) if args else now.weekday()
    p = plan(idx, now.date() if not args else None)
    if "--json" in sys.argv:
        print(json.dumps(p, ensure_ascii=False, indent=1))
    else:
        render(p)
