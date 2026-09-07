# -*- coding: utf-8 -*-
"""Zesst Now — the website sales funnel, Kaushambi–Prayagraj.

Built to one constraint, because that constraint decides everything else: one
person takes the calls, and he can take five to ten a week. A funnel that
produces eighty leads for a man who can talk to eight is not a better funnel —
it is the same eight conversations plus seventy-two people who now think the
company does not reply.

So this works backwards from ten conversations a week, not forwards from a
contact list. Every number in section 02 is derived from that.

Three proofs are used throughout, and all three were checked live before being
written down: adnitinkumar.in (a client build, and the strongest one because the
client is an advocate in Kaushambi), bizgstpro.com (the company's own product),
and www.cognitivecapitalsuite.com. A fourth spelling, advnitinkumar.in, does not
resolve at all and must never appear in a message.
"""
import base64, pathlib

D = pathlib.Path("/home/user/letterhead")
def b64(p): return base64.b64encode(D.joinpath(p).read_bytes()).decode()
def face(fam, f, w):
    return (f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};"
            f"font-display:block;src:url(data:font/woff2;base64,{b64(f)}) format('woff2');}}")

FONTS = "".join([
    face("Manrope", "fonts/manrope-400.woff2", 400),
    face("Manrope", "fonts/manrope-500.woff2", 500),
    face("Manrope", "fonts/manrope-600.woff2", 600),
    face("Manrope", "fonts/manrope-700.woff2", 700),
    face("JetBrains Mono", "fonts/jbmono-500.woff2", 500),
    face("Fraunces", "fonts/fraunces.woff2", "300 700"),
    face("Noto Devanagari", "fonts/notodev-500.woff2", 500),
    face("Noto Devanagari", "fonts/notodev-600.woff2", 600),
])

lockup = D.joinpath("brand-lockup.svg").read_text()
field  = D.joinpath("_field.svg").read_text()
HEAD_H, FOOT_T, SEAM = 40.0, 252.0, 1.15

def h1(t):   return f'<div class="h1">{t}</div>'
def h2(n,t): return f'<div class="h2"><span>{n}</span>{t}</div>'
def p(t):    return f'<div class="p">{t}</div>'
def note(t): return f'<div class="note">{t}</div>'

def table(rows, w1="32mm", w2=None):
    out = []
    style = f"--w1:{w1}" + (f";--w2:{w2}" if w2 else "")
    two = " two" if w2 else ""
    for i, r in enumerate(rows):
        first = " first" if i == 0 else ""
        out.append(f'<div class="row{first}{two}" style="{style}">'
                   + "".join(f'<div class="rc">{c}</div>' for c in r) + "</div>")
    return "".join(out)

def msg(label, meta, body):
    """A message written out exactly as it should be sent."""
    return (f'<div class="msg"><div class="mlbl">{label}</div>'
            f'<div class="mmeta">{meta}</div>'
            f'<div class="mbody">{body}</div></div>')


BLOCKS = "".join([
 h1("The Website Funnel"),
 p('Kaushambi and Prayagraj. One offer &mdash; a working website for '
   '&#8377;15,000 to &#8377;40,000 &mdash; sold to businesses that already have a '
   'Google listing and nothing behind it. Built to produce <b>five to ten '
   'conversations a week</b>, because that is what one person can actually hold.'),

 # ─────────────────────────────────────────────────────────────────
 h2("01","Why this offer, and not the bigger ones"),
 p('An app or a SaaS build is worth more per deal and is the wrong thing to sell '
   'first. A new company has no track record, and a &#8377;3 lakh decision needs '
   'one. A &#8377;20,000 website does not &mdash; it is inside what a shopkeeper '
   'decides alone, in one conversation, without asking anybody.'),
 table([
   ["<b>Decided by one person</b>","No committee, no quotes from three vendors. The owner says yes or no."],
   ["<b>Delivered in 48 hours</b>","The company already promises this publicly. It is the only hard number a competitor cannot match by talking."],
   ["<b>Proof exists locally</b>","adnitinkumar.in is an advocate in Kaushambi. Some prospects will know him."],
   ["<b>It opens the rest</b>","The website client is who you sell automation, the funnel and the app to in month four. Nobody buys those cold."],
 ], "34mm"),

 # ─────────────────────────────────────────────────────────────────
 h2("02","The maths, worked backwards from ten calls"),
 p('These ratios are conservative on purpose. If the real ones turn out better, '
   'the week gets easier; planning on optimistic ones is how a pipeline runs dry '
   'in week three and nobody notices until month two.'),
 table([
   ["<b>2&ndash;3 deals</b>","a month, at &#8377;15&ndash;40k","<b>&#8377;40,000&ndash;&#8377;90,000 a month</b> to start"],
   ["<b>8&ndash;10 calls</b>","a week","one person's real ceiling"],
   ["<b>20&ndash;25 replies</b>","a week","roughly 40% of replies become a call"],
   ["<b>60&ndash;80 contacts</b>","a week, touched twice","roughly 30% reply when the message is specific"],
   ["<b>25&ndash;30 new names</b>","a day, four days a week","the only daily number to protect"],
 ], "30mm", "40mm"),
 note('<b>The one number that decides everything: 25 new names a day.</b> Not '
      'reach, not impressions, not followers. If that number holds for six weeks, '
      'the rest follows arithmetically. If it drops for a fortnight, the pipeline '
      'is empty a month later and no amount of effort in month three fixes it.'),

 # ─────────────────────────────────────────────────────────────────
 h2("03","Who exactly &mdash; and the signal that makes the message land"),
 p('Not "small businesses in Kaushambi". That is a category, not a list. The list '
   'is built from one checkable signal, and the signal is what turns a cold '
   'message into an observation.'),
 table([
   ["<b>Where the list comes from</b>",
    "Google Maps, searched by trade and by town: Manjhanpur, Sirathu, Chail, "
    "Karari, Bharwari, and Prayagraj by locality. Every listing carries a name, a "
    "phone number, a category, a review count, and &mdash; the important part &mdash; "
    "a website field that is often empty."],
   ["<b class=hl>Signal A &mdash; no website at all</b>",
    "The listing exists, the phone works, the website field is blank. These are "
    "the easiest and the largest group. The message writes itself because the gap "
    "is a fact, not a pitch."],
   ["<b class=hl>Signal B &mdash; a website that does not work</b>",
    "There is a link and it is dead, or it loads and has no enquiry form, or the "
    "form goes nowhere. Harder to find, converts better: the owner already paid "
    "somebody once and is not happy about it."],
   ["<b>Who to skip</b>",
    "Under 10 reviews (usually not running properly yet). Chains and franchises "
    "(head office decides). Anyone whose site is genuinely good &mdash; say so and "
    "move on; arguing with a happy customer wastes the week."],
 ], "42mm"),
 p('<b>Best trades to start with</b>, because they sell to people who search: '
   'coaching and tuition centres, clinics and diagnostic labs, tent and catering '
   'houses, real-estate agents and builders, gyms, CA and tax practices, hardware '
   'and building material, agri-input dealers, jewellers, packers and movers.'),

 # ─────────────────────────────────────────────────────────────────
 h2("04","The first message"),
 p('Two rules. It names something true and specific about <i>them</i> in the first '
   'line, and it asks for a reply rather than a sale. Anything that could have '
   'been sent to a thousand people gets treated as if it was.'),
 msg("EMAIL &middot; day 0",
     "Subject: <b>आपकी Google listing में website का लिंक नहीं है</b>",
     "नमस्ते &lt;नाम&gt; जी,<br><br>"
     "&lt;व्यवसाय&gt; की Google listing देखी &mdash; &lt;n&gt; रिव्यू हैं, फ़ोन नंबर भी है, "
     "पर website का लिंक नहीं है।<br><br>"
     "जो लोग आपको Google पर खोजते हैं, उनमें से कुछ लिंक देखकर ही तय करते हैं। नंबर पर "
     "फ़ोन तभी करते हैं जब भरोसा बन जाए।<br><br>"
     "हम कौशाम्बी में ही हैं। एक काम हमने यहीं किया है &mdash; "
     "<b>adnitinkumar.in</b>, अधिवक्ता नितिन कुमार जी की साइट, जिस पर लोग फ़ीस भी "
     "ऑनलाइन देते हैं। हमारा अपना प्रोडक्ट <b>bizgstpro.com</b> है।<br><br>"
     "आपके लिए क्या बन सकता है, ये मैं दो मिनट में बता सकता हूँ। "
     "इस मेल का जवाब दे दीजिए, या नंबर बता दीजिए तो मैं कॉल कर लूँ।<br><br>"
     "&mdash; सोनू शर्मा<br>Zesst Now Services Private Limited, कौशाम्बी<br>"
     "www.cognitivecapitalsuite.com"),
 note('<b>Why the advocate and not the product.</b> A shopkeeper in Manjhanpur does '
      'not care that you built a GST platform. He cares that you built something '
      'for a man he might have heard of, in his own district. Lead with '
      'adnitinkumar.in every time; BizGST Pro is the second sentence, not the first.'),

 # ─────────────────────────────────────────────────────────────────
 h2("05","The follow-up &mdash; where the deals actually are"),
 p('Most businesses stop after one message and conclude that outreach does not '
   'work. The reply rate on message one is not the number that matters; the '
   'number that matters is the total across four touches, and it is usually two '
   'to three times higher.'),
 table([
   ["<b class=tm>Day 0</b>","Email","The message above."],
   ["<b class=tm>Day 2</b>","WhatsApp","Short, and it must not repeat the email. "
    "&ldquo;नमस्ते, मैंने कल मेल किया था &mdash; &lt;व्यवसाय&gt; की website के बारे में। "
    "देख लिया हो तो बता दीजिए, वरना कोई बात नहीं।&rdquo;"],
   ["<b class=tm>Day 5</b>","Call","Not a pitch. &ldquo;दो मिनट हैं? एक बात पूछनी थी &mdash; "
    "अभी नए ग्राहक कहाँ से आते हैं आपके पास?&rdquo; Then listen. The call script is section 07."],
   ["<b class=tm>Day 12</b>","Email","One line and a door left open. &ldquo;अभी ज़रूरत नहीं है तो "
    "कोई बात नहीं। जब सोचें, ये मेल का जवाब दे दीजिएगा।&rdquo; This one closes more than day 2 does."],
   ["<b class=tm>Then stop</b>","&mdash;","Four touches and out. A fifth annoys and costs the "
    "referral. Move them to a quarterly list instead."],
 ], "22mm", "26mm"),
 note('<b>Volume cap, and it is not optional.</b> Email goes from zesstn@gmail.com, '
      'which is also the company\'s working inbox. <b>Ten to fifteen a day, maximum.</b> '
      'Thirty to fifty a day from a personal Gmail is the standard way to get the '
      'address flagged, and losing it would cost far more than the pipeline is worth.'),

 # ─────────────────────────────────────────────────────────────────
 h2("06","The six objections, and what actually answers them"),
 p('Every one of these is a real question, not a brush-off. Treating them as '
   'resistance is what loses them; answering the actual question is what closes.'),
 table([
   ["<b>&ldquo;वेबसाइट की ज़रूरत नहीं, काम मुँह-ज़बानी चलता है&rdquo;</b>",
    "Agree, then narrow. &ldquo;बिल्कुल, और वही सबसे अच्छा ग्राहक होता है। पर जो आदमी आपका नाम "
    "सुनकर Google पर खोजता है &mdash; उसे क्या मिलता है?&rdquo; The website is not for strangers. "
    "It is for the referral who wants to check you first."],
   ["<b>&ldquo;बहुत महँगा है&rdquo;</b>",
    "Never drop the price first. Ask what they compared it to. Usually it is a "
    "&#8377;3,000 Facebook page or a &#8377;1.5 lakh quote from Prayagraj. Put the number "
    "next to one month of what they spend on a helper."],
   ["<b>&ldquo;पहले भी बनवाई थी, कुछ नहीं हुआ&rdquo;</b>",
    "<b>The best objection there is.</b> Ask to see it. It will have no enquiry form, or "
    "one that goes nowhere. Show them exactly that, on their own site, on the call. "
    "That single moment closes more deals than any portfolio."],
   ["<b>&ldquo;सोचकर बताता हूँ&rdquo;</b>",
    "This means one of three things: money, a person who has to agree, or they are "
    "being polite. Ask which. &ldquo;बिल्कुल &mdash; एक बात बता दीजिए, अटक कहाँ रहा है? "
    "पैसा, या किसी और से पूछना है?&rdquo;"],
   ["<b>&ldquo;48 घंटे में कैसे? कुछ घटिया बनाओगे&rdquo;</b>",
    "Fair, and answerable. adnitinkumar.in has online fee payment, a pending-dues "
    "check and consultation booking. Open it on the call. 48 hours is possible "
    "because the process is fixed, not because the work is thin."],
   ["<b>&ldquo;WhatsApp पर भेज दो, देख लूँगा&rdquo;</b>",
    "Usually a soft no. Send it &mdash; and book the next step in the same message. "
    "&ldquo;भेज दिया। गुरुवार शाम को दो मिनट बात कर लें?&rdquo; Without a date, it dies."],
 ], "48mm"),

 # ─────────────────────────────────────────────────────────────────
 h2("07","The call &mdash; eight minutes, and mostly listening"),
 table([
   ["<b class=tm>0:00</b>","Permission. &ldquo;दो मिनट हैं?&rdquo; If no, ask when, and ring then."],
   ["<b class=tm>0:30</b>","One question, then silence: &ldquo;अभी नए ग्राहक कहाँ से आते हैं?&rdquo; "
    "Let them talk. Whatever they say next is the thing to sell to."],
   ["<b class=tm>2:00</b>","Their words back: &ldquo;तो ज़्यादातर पहचान से आते हैं, और नए लोग कभी-कभी।&rdquo;"],
   ["<b class=tm>3:00</b>","The gap, as a fact: &ldquo;जो नया आदमी आपका नाम Google पर डालता है, "
    "उसे listing मिलती है पर website नहीं।&rdquo;"],
   ["<b class=tm>4:00</b>","Proof, opened live: adnitinkumar.in. Say what it does, not what it looks like."],
   ["<b class=tm>6:00</b>","Number and time: &#8377;15,000 to &#8377;40,000 by scope, live in 48 hours."],
   ["<b class=tm>7:00</b>","One close, then stop talking: &ldquo;शुरू कर दें?&rdquo;"],
 ], "20mm"),
 note('<b>Do not send a quotation before the call.</b> A price with no conversation '
      'around it is compared on price alone, and there is always somebody cheaper. '
      'The 48-hour promise and the local proof only carry weight in a voice.'),

 # ─────────────────────────────────────────────────────────────────
 h2("08","The offer, and what is deliberately not in it"),
 table([
   ["<b>&#8377;15,000</b>","<b>Single page</b> &mdash; who you are, what you do, "
    "photos, map, enquiry form that reaches a phone, WhatsApp button. Live in 48 hours."],
   ["<b>&#8377;25,000</b>","<b>Four to six pages</b> &mdash; services, gallery, about, "
    "contact, plus the content editor so they change it themselves."],
   ["<b>&#8377;40,000</b>","<b>Everything above</b> plus online payment, bookings or a "
    "catalogue, and Google Business Profile set up properly."],
   ["<b>Included at every level</b>","One year hosting and domain, enquiry alerts to "
    "phone and email, and the editor. Not sold as extras later."],
   ["<b class=hl>Not offered</b>","Monthly maintenance fees for doing nothing. "
    "Say this out loud &mdash; it is what most of them were burned by, and refusing "
    "to charge it is a stronger differentiator than any feature."],
 ], "26mm"),
 p('<b>Payment:</b> half to start, half on going live. Not full advance &mdash; nobody '
   'in this segment pays a new vendor in full up front, and asking makes the company '
   'look like the ones that took the money and vanished.'),

 # ─────────────────────────────────────────────────────────────────
 h2("09","The pipeline, and the only two numbers worth reading"),
 table([
   ["<b>New</b>","On the list, nothing sent."],
   ["<b>Touched</b>","Message one sent. Date recorded, or the follow-up will not happen."],
   ["<b>Replied</b>","Any answer at all, including a no. A no is information; record why."],
   ["<b>Call booked</b>","A date and a time exist. Without a date it belongs in Touched."],
   ["<b>Quoted</b>","A number given on a call. Never before one."],
   ["<b>Won / Lost</b>","If lost, one line on why. Six of those teach more than any advice."],
 ], "26mm"),
 note('<b>Read two numbers each Friday, and ignore the rest.</b> How many new names '
      'went in this week (target 100&ndash;120), and how many calls actually happened '
      '(target 8&ndash;10). Reply rates and open rates move on their own and tell you '
      'nothing you can act on this week.'),

 # ─────────────────────────────────────────────────────────────────
 h2("10","The week"),
 table([
   ["<b class=tm>Mon 60 min</b>","Build the list. 100&ndash;120 names from Google Maps with the "
    "signal marked. This is the whole week's fuel &mdash; if only one thing gets done, this."],
   ["<b class=tm>Tue&ndash;Fri 30 min</b>","Send 10&ndash;15 emails, WhatsApp yesterday's batch, "
    "make the day-5 calls."],
   ["<b class=tm>Daily 10 min</b>","Reply to everything the same day. A reply that waits two "
    "days is worth about half."],
   ["<b class=tm>Fri 20 min</b>","Two numbers. Names in, calls held. Then close the laptop."],
   ["<b class=tm>Sat</b>","Deliver. A 48-hour promise needs a day that is not selling."],
 ], "28mm"),
 note('<b>The first month will feel like nothing is happening.</b> Weeks one and two '
      'produce almost no replies, because the follow-ups have not landed yet &mdash; most '
      'of the yield arrives on day 5 and day 12 of each batch, which means the first '
      'real week of results is week three. Stopping in week two, which is when almost '
      'everybody stops, throws away the part that works.'),
])

CSS = f"""
{FONTS}
:root{{--ink:#05060F;--navy:#0A1226;--silver:#B9C6D6;--silver-lt:#E8EEF6;
       --body:#1B2437;--muted:#4C5A72;--hair:#DCE2EC;--v:#6D3BF5;--c:#22D3EE;}}
@page{{size:210mm 297mm;margin:0;}}
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{width:210mm;margin:0;padding:0;background:#fff;}}
body{{font-size:0;line-height:0;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;}}
.sheet{{position:relative;width:210mm;height:296.9mm;background:#fff;overflow:hidden;
        font-family:'Manrope',system-ui,sans-serif;font-size:10pt;line-height:normal;
        page-break-after:always;break-after:page;}}
.sheet:last-child{{page-break-after:auto;break-after:auto;}}
.panel{{position:absolute;left:0;right:0;overflow:hidden;}}
.panel .stars{{position:absolute;inset:0;}}
.panel .stars svg{{width:100%;height:100%;display:block;}}
.head{{top:0;height:{HEAD_H}mm;background:
  radial-gradient(120% 150% at 82% -30%,#17244a 0%,rgba(23,36,74,0) 62%),
  linear-gradient(160deg,#0C1530 0%,var(--navy) 46%,var(--ink) 100%);}}
.head::after{{content:"";position:absolute;left:0;right:0;bottom:0;height:12mm;
  background:linear-gradient(180deg,rgba(5,6,15,0) 0%,rgba(5,6,15,.55) 100%);}}
.foot{{top:{FOOT_T}mm;bottom:0;background:
  radial-gradient(120% 150% at 82% 130%,#17244a 0%,rgba(23,36,74,0) 62%),
  linear-gradient(200deg,#0C1530 0%,var(--navy) 46%,var(--ink) 100%);}}
.foot .stars{{transform:scaleY(-1);}}
.foot::after{{content:"";position:absolute;left:0;right:0;top:0;height:12mm;
  background:linear-gradient(0deg,rgba(5,6,15,0) 0%,rgba(5,6,15,.55) 100%);}}
.seam{{position:absolute;left:0;right:0;height:{SEAM}mm;z-index:3;
  background:linear-gradient(90deg,var(--v) 0%,var(--c) 34%,#2b3f6b 62%,#1b2540 100%);}}
.seam.a{{top:{HEAD_H}mm;}} .seam.b{{top:{FOOT_T}mm;}}
.pin{{position:absolute;left:20mm;right:20mm;top:12.5mm;z-index:2;
  display:flex;align-items:flex-start;justify-content:space-between;}}
.lockup svg{{height:11mm;width:auto;display:block;}}
.sub{{margin-top:3mm;margin-left:.5mm;font-family:'JetBrains Mono',monospace;
  font-size:6.2pt;letter-spacing:.34em;text-transform:uppercase;color:var(--silver);opacity:.82;}}
.site{{padding-top:3.2mm;text-align:right;font-size:9pt;font-weight:600;color:#fff;}}

.body{{position:absolute;left:20mm;right:20mm;top:{HEAD_H + 11}mm;
       bottom:{297 - FOOT_T + 6}mm;z-index:2;color:var(--body);
       font-size:8.9pt;line-height:1.52;}}
.h1{{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:2.0em;line-height:1.15;
     color:var(--ink);font-variation-settings:'opsz' 36,'SOFT' 0,'WONK' 0;}}
.h2{{margin-top:7mm;padding-top:4.6mm;border-top:.3mm solid var(--hair);
     font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:1.32em;color:var(--ink);
     font-variation-settings:'opsz' 22,'SOFT' 0,'WONK' 0;}}
.h2 span{{font-family:'JetBrains Mono',monospace;font-size:.62em;font-weight:500;
  color:var(--c);letter-spacing:.08em;margin-right:3.4mm;}}
.p{{margin-top:3.4mm;}}
.p b,.note b,.row b,.msg b{{color:var(--ink);font-weight:700;}}
.p i,.row i{{font-style:italic;color:var(--muted);}}
.hl{{color:#0E7490;}}
.note{{margin-top:4mm;padding:4mm 4.6mm;background:#F4F7FB;border-radius:1.8mm;
       border-left:.8mm solid var(--c);line-height:1.55;}}
.row{{display:flex;font-size:.97em;line-height:1.48;
      padding:2.8mm 0;border-top:.25mm solid var(--hair);}}
.row.first{{margin-top:4mm;border-top:.3mm solid var(--hair);}}
.rc{{flex:1;}}
.rc:first-child{{flex:0 0 var(--w1,32mm);padding-right:5mm;}}
.row.two .rc:nth-child(2){{flex:0 0 var(--w2,32mm);padding-right:5mm;}}
.tm{{font-family:'JetBrains Mono',monospace;font-weight:500;color:var(--ink);font-size:.98em;}}

.msg{{margin-top:4mm;padding:4.4mm 5mm;border:.3mm solid var(--hair);border-radius:2mm;
      border-left:.9mm solid var(--v);background:#FCFDFE;}}
.mlbl{{font-family:'JetBrains Mono',monospace;font-size:5.8pt;font-weight:500;
       letter-spacing:.24em;text-transform:uppercase;color:var(--c);}}
.mmeta{{margin-top:1.8mm;font-size:.98em;color:var(--muted);}}
.mbody{{margin-top:3mm;padding-top:3mm;border-top:.25mm solid var(--hair);
        font-family:'Noto Devanagari','Manrope',sans-serif;font-size:1.0em;line-height:1.62;}}

.fc{{position:absolute;left:20mm;right:20mm;top:{FOOT_T + 8.0}mm;z-index:2;}}
.entity{{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:10pt;
  color:var(--silver-lt);font-variation-settings:'opsz' 18,'SOFT' 0,'WONK' 0;}}
.cols{{display:flex;margin-top:4.4mm;}}
.col{{flex:1;padding-right:6mm;}}
.col + .col{{padding-left:6mm;border-left:.3mm solid rgba(185,198,214,.22);}}
.col.last{{flex:0 0 46mm;padding-right:0;}}
.lbl2{{display:block;font-family:'JetBrains Mono',monospace;font-size:5.5pt;
  font-weight:500;letter-spacing:.26em;text-transform:uppercase;
  color:rgba(185,198,214,.62);margin-bottom:2mm;}}
.val{{font-size:7.4pt;line-height:1.72;color:#C6D2E0;font-weight:500;}}
.cin{{font-family:'JetBrains Mono',monospace;font-size:7.6pt;font-weight:500;
  color:#fff;display:block;margin-bottom:1mm;}}
"""

CHROME = f"""
<div class="panel head"><div class="stars">{field}</div></div>
<div class="seam a"></div>
<div class="pin"><div><div class="lockup">{lockup}</div>
<div class="sub">Services Private Limited</div></div>
<div class="site">www.cognitivecapitalsuite.com</div></div>
<div class="seam b"></div>
<div class="panel foot"><div class="stars">{field}</div></div>
<div class="fc"><div class="entity">Zesst Now Services Private Limited</div>
<div class="cols">
<div class="col"><span class="lbl2">Registered office</span><div class="val">
C/O Varsha Agrawal, Bhaktan Ka Pura,<br/>Osa Road, Manjhanpur, Kaushambi,<br/>Uttar Pradesh 212207, India</div></div>
<div class="col"><span class="lbl2">Corporate identity</span><div class="val">
<span class="cin">U47110UP2025PTC217212</span>Incorporated 21 February 2025<br/>Registrar of Companies, Kanpur</div></div>
<div class="col last"><span class="lbl2">Contact</span><div class="val">
zesstn@gmail.com<br/>+91 77538 98481<br/>Mon&ndash;Sat, 10 AM &ndash; 7 PM IST</div></div>
</div></div>
"""

PAGINATE = """
(function () {
  const src=document.getElementById("src"), out=document.getElementById("out");
  const blocks=Array.from(src.children); src.remove();
  let n=0, body=null;
  function newSheet(){ n+=1;
    const s=document.createElement("section"); s.className="sheet";
    s.innerHTML=CHROME;
    body=document.createElement("div"); body.className="body";
    s.appendChild(body); out.appendChild(s); }
  newSheet();
  for (const b of blocks){
    body.appendChild(b);
    if (body.scrollHeight > body.clientHeight){
      if (body.children.length===1) continue;
      body.removeChild(b); newSheet(); body.appendChild(b);
    }
  }
  document.title="pages:"+n;
})();
"""

html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<title>Zesst Now — The Website Funnel</title><style>{CSS}</style></head>
<body><div id="out"></div><div id="src" style="display:none">{BLOCKS}</div>
<script>const CHROME = {CHROME!r};</script><script>{PAGINATE}</script></body></html>"""

pathlib.Path("/home/user/funnel/funnel.html").write_text(html, encoding="utf-8")
print("built funnel.html")
