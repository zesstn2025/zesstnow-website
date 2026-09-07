# -*- coding: utf-8 -*-
"""Scene renderers. One function per visual, each with motion of its own.

The first version failed on exactly one thing: a scene was a line of text that
faded in, sat still for six seconds, and faded out. That reads as slow no matter
how short you make it, because nothing inside the frame is moving. So every
renderer here animates its *contents* — words arrive one at a time, a cursor
travels, a number counts, a bar grows, a pulse runs down a wire — and scenes are
written to last two to three seconds rather than six.

The letterhead's navy-and-constellation is deliberately gone. It is right for a
printed page and wrong for a phone: too dark, too quiet, and identical for every
service. Each service now gets its own palette and its own visual object — a
browser for websites, a home screen for apps, a dashboard for SaaS, a wire for
automation, a funnel for the funnel, a calendar for scheduling.
"""

# ── Per-service look ────────────────────────────────────────────────────
# No yellow and no gold anywhere: that is a standing brand rule and it holds
# here too. Variety comes from hue, not from breaking it.
THEMES = {
  "website": dict(bg1="#0B1020", bg2="#141C3A", orb="#2563EB",
                  acc="#60A5FA", acc2="#A78BFA", ink="#FFFFFF"),
  "app":     dict(bg1="#120A20", bg2="#241238", orb="#7C3AED",
                  acc="#C084FC", acc2="#22D3EE", ink="#FFFFFF"),
  "saas":    dict(bg1="#04140F", bg2="#0A2A22", orb="#059669",
                  acc="#34D399", acc2="#67E8F9", ink="#FFFFFF"),
  "ai":      dict(bg1="#0A0A18", bg2="#1A1030", orb="#4F46E5",
                  acc="#22D3EE", acc2="#F0ABFC", ink="#FFFFFF"),
  "funnel":  dict(bg1="#18060E", bg2="#330C1E", orb="#E11D48",
                  acc="#FB7185", acc2="#F0ABFC", ink="#FFFFFF"),
  "social":  dict(bg1="#0A0F1E", bg2="#151033", orb="#6366F1",
                  acc="#38BDF8", acc2="#F472B6", ink="#FFFFFF"),
}


def words(text, base=0.0, step=0.085, cls="w"):
    """Wrap each *word* in a span that arrives in sequence, leaving tags alone.

    A whole sentence appearing at once is a slide; the same sentence arriving
    word by word is motion, and it costs nothing. But the naive version of this
    — text.split(" ") — also split the markup, so `<span class=hl>` became three
    "words" and the literal string `class=hl>` was rendered on screen. The lines
    that carry no markup looked perfect, which is why it survived a glance.

    So: scan the string, pass anything between < and > through untouched, and
    wrap only the runs of real text. A word inside <span class=hl> ends up as
    <span class=hl><span class="w">…</span></span>, which still inherits the
    highlight colour.
    """
    out, buf, i, n = [], [], 0, 0

    def flush():
        nonlocal n
        for w in "".join(buf).split():
            out.append(f'<span class="{cls}" style="--d:{base + n*step:.3f}s">{w}</span>')
            n += 1
        buf.clear()

    while i < len(text):
        if text[i] == "<":
            flush()
            j = text.find(">", i)
            if j == -1:                    # unterminated tag: treat as text
                buf.append(text[i:])
                break
            out.append(text[i:j + 1])
            i = j + 1
        else:
            buf.append(text[i])
            i += 1
    flush()
    return " ".join(out)


# ── Renderers ───────────────────────────────────────────────────────────

def r_kinetic(sc):
    size = sc.get("size", "lg")
    return f'<div class="kin {size}">{words(sc["big"])}</div>'


def r_label(sc):
    """A small eyebrow over a big line — used to open a section."""
    return (f'<div class="eyebrow" style="--d:0s">{sc["eyebrow"]}</div>'
            f'<div class="kin md">{words(sc["big"], base=0.18)}</div>')


def r_counter(sc):
    """A number that counts up. Twenty steps is enough to read as a count and
    few enough that the DOM stays small."""
    to = sc["to"]
    steps = "".join(
        f'<span class="cn" style="--d:{i*0.045:.3f}s">{v}</span>'
        for i, v in enumerate(sc["ramp"]))
    return (f'<div class="bignum">{steps}'
            f'<span class="cn last" style="--d:{len(sc["ramp"])*0.045:.3f}s">{to}</span>'
            + (f'<span class="unit">{sc["unit"]}</span>' if sc.get("unit") else "")
            + f'</div><div class="undertext">{words(sc["sub"], base=0.9)}</div>')


def r_browser(sc):
    """A browser window that assembles itself, block by block."""
    blocks = "".join(f'<div class="bl b{i}" style="--d:{0.30 + i*0.16:.2f}s"></div>'
                     for i in range(sc.get("blocks", 5)))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            '<div class="win"><div class="wbar"><i></i><i></i><i></i>'
            f'<span class="url">{sc.get("url", "yourbusiness.in")}</span></div>'
            f'<div class="wbody">{blocks}</div></div>')


def r_form(sc):
    """A form filling itself, then a cursor hitting the button."""
    rows = "".join(
        f'<div class="frow" style="--d:{0.25 + i*0.30:.2f}s">'
        f'<span class="fl">{a}</span><span class="fv">{b}</span></div>'
        for i, (a, b) in enumerate(sc["rows"]))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="card"><div class="ctitle">{sc.get("title", "एन्क्वायरी")}</div>'
            f'{rows}<div class="cbtn">{sc.get("btn", "भेजिए")}</div>'
            '<div class="cursor"></div></div>')


def r_notif(sc):
    """An alert sliding in over a dimmed screen."""
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            '<div class="notif"><div class="nrow">'
            f'<div class="nico"></div><div><div class="nt">{sc["title"]}</div>'
            f'<div class="nb">{sc["body"]}</div></div>'
            f'<div class="nn">{sc.get("time", "अभी")}</div></div></div>')


def r_home(sc):
    """A phone home screen with one icon flying into place."""
    cells = "".join(
        f'<i class="{"on" if i == sc.get("slot", 5) else ""}" style="--d:{0.10 + i*0.035:.2f}s"></i>'
        for i in range(12))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="home"><div class="hgrid">{cells}</div>'
            f'<div class="hlabel">{sc.get("label", "आपका ऐप")}</div></div>')


def r_dash(sc):
    """Bars that grow. The only honest way to show a product doing something."""
    bars = "".join(
        f'<div class="bwrap"><div class="bar" style="--h:{h}%;--d:{0.25 + i*0.09:.2f}s"></div>'
        f'<span class="blab">{l}</span></div>'
        for i, (l, h) in enumerate(sc["bars"]))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="dash"><div class="dtitle">{sc.get("title","")}</div>'
            f'<div class="bars">{bars}</div></div>')


def r_rows(sc):
    """A document building line by line — an invoice, a statement, a receipt."""
    rows = "".join(
        f'<div class="drow {"tot" if i == len(sc["rows"]) - 1 else ""}" '
        f'style="--d:{0.22 + i*0.26:.2f}s">'
        f'<span>{a}</span><span class="dv">{b}</span></div>'
        for i, (a, b) in enumerate(sc["rows"]))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="card"><div class="ctitle">{sc.get("title","")}</div>{rows}</div>')


def r_chat(sc):
    """A conversation with a typing indicator that resolves into a reply."""
    bubbles = ""
    d = 0.20
    for who, text in sc["msgs"]:
        if who == "typing":
            bubbles += (f'<div class="bub them typing" style="--d:{d:.2f}s">'
                        '<b></b><b></b><b></b></div>')
            d += 0.55
        else:
            bubbles += f'<div class="bub {who}" style="--d:{d:.2f}s">{text}</div>'
            d += 0.60
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="thread">{bubbles}'
            f'<div class="stamp" style="--d:{d:.2f}s">{sc.get("time","11:04 PM")}</div></div>')


def r_wire(sc):
    """Nodes joined by a wire, with a pulse running along it."""
    n = len(sc["nodes"])
    body = ""
    for i, label in enumerate(sc["nodes"]):
        body += f'<div class="node" style="--d:{0.20 + i*0.28:.2f}s">{label}</div>'
        if i < n - 1:
            body += (f'<div class="wire" style="--d:{0.34 + i*0.28:.2f}s">'
                     f'<span class="pulse" style="--d:{0.55 + i*0.28:.2f}s"></span></div>')
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="wires">{body}</div>')


def r_funnel(sc):
    """An actual funnel, narrowing, with counts falling through it."""
    n = len(sc["stages"])
    body = ""
    for i, (label, count) in enumerate(sc["stages"]):
        w = 100 - i * (46 / max(1, n - 1))
        # `fstage`, not `stage`: `.stage` is the container that holds every
        # scene, and defining a second `.stage` rule here put opacity:0 on it —
        # which blanked the entire video while every element inside still
        # reported itself visible.
        body += (f'<div class="fstage" style="--w:{w:.0f}%;--d:{0.22 + i*0.30:.2f}s">'
                 f'<span class="slab">{label}</span><span class="scount">{count}</span></div>')
        if i < n - 1:
            body += f'<div class="drop" style="--d:{0.38 + i*0.30:.2f}s"></div>'
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="funnel">{body}</div>')


def r_cal(sc):
    """A month filling up, one dot at a time."""
    marks = sc.get("marks", [])
    cells = "".join(
        f'<i class="{"m" if i in marks else ""}" style="--d:{0.10 + i*0.022:.2f}s"></i>'
        for i in range(30))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="cal"><div class="ctitle">{sc.get("title","")}</div>'
            f'<div class="cgrid">{cells}</div>'
            f'<div class="cfoot">{sc.get("foot","")}</div></div>')


def r_versus(sc):
    """Two columns. The left one is what everyone else does."""
    return ('<div class="vs">'
            f'<div class="vcol a" style="--d:0.15s"><span class="vlab">{sc["a_label"]}</span>'
            f'<span class="vtxt">{sc["a"]}</span></div>'
            f'<div class="vcol b" style="--d:0.55s"><span class="vlab">{sc["b_label"]}</span>'
            f'<span class="vtxt">{sc["b"]}</span></div>'
            '</div>')


def r_ticks(sc):
    """Three things that land in sequence with a check."""
    items = "".join(
        f'<div class="tick" style="--d:{0.18 + i*0.30:.2f}s">'
        f'<span class="tk"></span>{x}</div>'
        for i, x in enumerate(sc["items"]))
    return (f'<div class="kin sm">{words(sc["big"])}</div>'
            f'<div class="ticks">{items}</div>')


def r_end(sc, lockup):
    return ('<div class="endcard">'
            f'<div class="kin md">{words(sc["big"])}</div>'
            f'<div class="lk" style="--d:0.55s">{lockup}</div>'
            '<div class="elines" style="--d:0.75s">'
            'www.cognitivecapitalsuite.com<br>+91 77538 98481 &middot; कौशाम्बी, उ.प्र.'
            '</div></div>')


RENDER = {
    "kinetic": r_kinetic, "label": r_label, "counter": r_counter,
    "browser": r_browser, "form": r_form, "notif": r_notif, "home": r_home,
    "dash": r_dash, "rows": r_rows, "chat": r_chat, "wire": r_wire,
    "funnel": r_funnel, "cal": r_cal, "versus": r_versus, "ticks": r_ticks,
}
