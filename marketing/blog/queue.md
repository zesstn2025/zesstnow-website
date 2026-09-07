# Daily blog queue

One post a day, published by a Routine at 07:00 IST. The queue is deliberately a
plain file rather than a database: publishing here is a git commit, so the queue
belongs in the same place as the posts it produces, and anyone can reorder it by
editing a line.

**How the daily job uses it.** Read this file top to bottom, take the first entry
whose `content/blog/<slug>.md` does not exist yet, write that post, commit,
push. Nothing else. That makes the job idempotent — running it twice in a day
produces one post, not two — and it stops on its own when the queue empties
rather than inventing filler.

**What each entry has to earn.** Every topic below is a question somebody with a
business actually types into Google or asks an AI. None of them are "top 10 tips"
posts. The angle column is there so the post has a point of view before a word is
written; a post that only lists facts is the kind nobody links to and no model
quotes.

**House rules for every post** — these are what make a post worth ranking, and
they are not negotiable:

- Open with the direct answer in the first two lines, then explain. Models lift
  the clean answer, not the build-up; readers leave during the build-up.
- Real numbers: section numbers, form names, dates, amounts, day counts. Vague
  pages are neither ranked nor cited.
- Say what the company does **not** do, and when the reader should not hire
  anyone. A post that only sells reads as an advertisement and performs like one.
- Never state a rate, a threshold or a due date as legal advice. Point at the
  portal or a CA. The site's existing posts do this consistently — match them.
- 900–1,500 words. Three to six `##` sections. Three FAQ entries in front matter.
- Front matter fields exactly as the existing posts use them: `title`,
  `description`, `date`, `category`, `tags`, `author`, `faq`. `author` is always
  "Zesst Now".
- `category` must be one already in use: GST & Tax, Loans & Credit,
  Registration, Software, Marketing, Web.
- Link to two or three of the existing posts where genuinely relevant, and to at
  most one service page. More than that and it reads as a funnel.

---

| # | Slug | Title | Category | Angle — the thing this post argues |
|---|---|---|---|---|
| 1 | `gst-notice-first-three-things` | GST का नोटिस आया है? सबसे पहले ये तीन चीज़ें देखिए | GST & Tax | Most notices are system-generated mismatches, not accusations. The panic costs more than the notice. |
| 2 | `website-enquiry-form-goes-nowhere` | Your enquiry form works. Nobody is reading it. | Web | The commonest website failure is not design — it is a form wired to an inbox nobody opens. |
| 3 | `pwa-vs-play-store-app-india` | Play Store ऐप चाहिए या नहीं — एक सवाल से तय कीजिए | Software | Most small businesses are sold a native app they did not need. When they do need one, say so. |
| 4 | `gst-late-fee-interest-actual-cost` | GST देर से भरने पर असल में कितना लगता है | GST & Tax | The late fee is the small part. Blocked ITC for the buyer is what actually costs the relationship. |
| 5 | `bank-rejected-loan-file-nine-reasons` | बैंक ने फ़ाइल लौटा दी — दस में नौ बार वजह यही होती है | Loans & Credit | Rejection is usually paperwork, not the business. Which papers, in what order. |
| 6 | `crm-you-dont-need-yet` | The CRM you do not need yet | Software | Under a certain lead volume a spreadsheet plus one reminder beats any CRM. Say where the line is. |
| 7 | `udyam-registration-is-free` | Udyam रजिस्ट्रेशन मुफ़्त है। लोग दो हज़ार दे रहे हैं। | Registration | Name the scam plainly, then walk the actual portal steps. |
| 8 | `first-reply-time-decides-the-deal` | पहला जवाब कितनी देर में गया — यही सौदा तय करता है | Marketing | Response latency, not lead volume, is the constraint in most small businesses. |
| 9 | `input-tax-credit-2b-vs-books` | GSTR-2B और आपकी किताब में फ़र्क़ क्यों आता है | GST & Tax | Timing differences explain most gaps. Which ones are real problems. |
| 10 | `ai-automation-where-to-start` | बिज़नेस में AI कहाँ से शुरू करें — तीन जगह | Software | Start where a task repeats daily and needs no judgement. Everything else is a demo. |
| 11 | `company-registration-what-comes-after` | कंपनी बन गई — अब हर साल क्या भरना है | Registration | The registration is the easy part; the annual compliance calendar is what people miss. |
| 12 | `cheap-website-actual-cost` | सस्ती वेबसाइट की असल क़ीमत | Web | Hosting that expires, no editor, no backups, no one to call. Itemise it. |
| 13 | `whatsapp-business-vs-automation` | WhatsApp Business काफ़ी है या automation चाहिए | Marketing | Below a message volume, the free app wins. Above it, name what breaks. |
| 14 | `cibil-for-business-loan` | बिज़नेस लोन में CIBIL कितना मायने रखता है | Loans & Credit | Personal score matters more than owners expect in a small private limited. |
| 15 | `e-invoice-threshold-confusion` | E-invoicing आप पर लागू है या नहीं | GST & Tax | Turnover threshold, which turnover, and what happens the month you cross it. |
| 16 | `saas-build-vs-subscribe` | अपना सॉफ़्टवेयर बनवाएँ या किराए पर लें | Software | A build-versus-buy calculation with real numbers, including when buying wins. |
| 17 | `local-seo-for-a-district-town` | ज़िले के शहर में Google पर कैसे दिखें | Marketing | Google Business Profile beats everything else at this size. What to fill and what to ignore. |
| 18 | `gst-registration-when-required` | GST रजिस्ट्रेशन कब ज़रूरी हो जाता है | GST & Tax | Threshold, inter-state supply, e-commerce — the three triggers people miss. |
| 19 | `loan-documents-in-order` | लोन की फ़ाइल किस क्रम में लगती है | Loans & Credit | The order matters as much as the documents. A checklist that reflects what banks actually ask. |
| 20 | `content-calendar-that-survives` | कंटेंट कैलेंडर जो दूसरे महीने में नहीं टूटता | Marketing | Consistency fails for a scheduling reason, not a creative one. |
| 21 | `insurance-a-small-company-needs` | छोटी कंपनी को कौन सा बीमा चाहिए | Registration | Most are sold policies they do not need and miss the two they do. |
| 22 | `core-web-vitals-for-business-owners` | वेबसाइट धीमी है — ग्राहक पर क्या असर पड़ता है | Web | Translate LCP and CLS into money, not scores. |
| 23 | `composition-scheme-worth-it` | Composition scheme आपके लिए फ़ायदे का है? | GST & Tax | Lower rate, no ITC, no inter-state supply. Who it actually suits. |
| 24 | `hiring-first-employee-compliance` | पहला कर्मचारी रखने पर क्या-क्या करना होता है | Registration | PF, ESI, offer letter, register. What applies at what headcount. |
| 25 | `leads-that-die-on-day-three` | तीसरे दिन लीड क्यों मर जाती है | Marketing | The follow-up gap, why it happens, and the three touches that close it. |
| 26 | `gst-on-advance-received` | एडवांस मिला — GST अभी लगेगा या बाद में | GST & Tax | Goods versus services differ. The rule people get wrong. |
| 27 | `domain-and-email-basics` | अपना डोमेन और कंपनी की ईमेल — सही तरीक़ा | Web | Gmail on a company domain, DNS, and why a free address costs deals. |
| 28 | `machinery-loan-vs-working-capital` | मशीन के लिए लोन और चालू पूँजी — फ़र्क़ | Loans & Credit | Matching the loan type to the need, and what happens when you don't. |
| 29 | `analytics-without-a-dashboard` | बिना dashboard के भी ये चार नंबर देखिए | Marketing | Enquiries by source, reply time, close rate, repeat rate. Nothing else matters at this size. |
| 30 | `data-when-you-leave-a-software` | सॉफ़्टवेयर छोड़ते वक़्त डेटा किसका रहता है | Software | Export buttons that produce unusable files. What to check before subscribing. |
