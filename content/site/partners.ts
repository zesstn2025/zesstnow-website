/**
 * /partners — the only page on this site written for an AGENCY, not a buyer.
 *
 * WHY IT EXISTS
 *
 * The white-label outreach emails linked to the home page. An agency owner who
 * clicked found a site selling websites, SEO and apps — the same things they
 * sell — so we read as a competitor, not a supplier. Worse, the rest of this
 * site argues AGAINST agencies in three places, because its buyer is a business
 * owner choosing between us and an agency:
 *
 *   "Big-city agencies quote big-city prices and disappear after launch."
 *   "Most agencies sell you reach and report on it."
 *   "No handoffs between agencies."
 *
 * Those lines are right for that reader and wrong for this one. Rather than
 * soften them and weaken the main site, the agency conversation gets its own
 * page and the outreach links here instead.
 *
 * THE RATES BELOW ARE A COPY. marketing/funnel/pricing.py IS THE SOURCE.
 *
 * They live in two languages — Python for the outreach, TypeScript for the
 * site — so they can drift, and a rate card that disagrees with the email that
 * linked to it is worse than having no page. When PARTNER_IN or PARTNER_EX
 * changes in pricing.py, change it here in the same commit. Last synced with
 * pricing.py on 13 September 2026.
 *
 * The two tiers are not a trick. An Indian agency pays Indian rates — a real
 * Noida white-label shop publishes ₹20,000–50,000 a month for 20–60 hours —
 * while a Western agency bills its own client $75–150 an hour and pays Indian
 * partners $25–45. Quoting either one the other's number loses the deal for
 * opposite reasons.
 */

export type PartnerTier = {
  name: string;
  rate: string;
  fits: string;
  has: string[];
};

export const partners = {
  meta: {
    title: "White-label development for agencies",
    description:
      "We build under your brand. Your client never learns we exist — and we never contact them, are never named to them, and never take work from them. Rates for Indian and overseas agencies, in writing, up front.",
  },

  hero: {
    eyebrow: "FOR AGENCIES",
    title: "The team behind other people's agencies",
    sub: "You sold the project. We build it, under your brand, invisible to your client. No account manager between you and the developer, and no sales pitch to your client afterwards — that is the whole arrangement, and it is in writing before anything starts.",
  },

  /**
   * First, and loud. Every piece of research on this says the same thing: the
   * one question an agency has about subcontracting is whether the
   * subcontractor eventually takes the account. Answering it unprompted, before
   * the rate card, is the entire pitch. Everything else is detail.
   */
  promise: {
    eyebrow: "THE PART THAT ACTUALLY MATTERS",
    title: "We do not want your client",
    body: "We do not contact them. We are not named to them. We do not take work from them afterwards, and we will sign that before a line of code is written. Unbranded staging, your repository, your email domain, your name on every deliverable. If you want us on a client call we join as your team, with your email address.",
  },

  india: {
    eyebrow: "INDIAN AGENCIES",
    title: "Rupee rates",
    note: "Priced against what Indian white-label shops actually publish, not against what we would like to charge.",
    tiers: [
      {
        name: "Hourly, white-labelled",
        rate: "₹900 – ₹1,400 / hour",
        fits: "Overflow, a sprint you are short-handed for, a specialism you do not keep in-house",
        has: [
          "Minimum 10 hours — a small first block, deliberately",
          "Daily written standup you can forward to your client as your own",
          "Code in your repository from day one, not handed over at the end",
        ],
      },
      {
        name: "Retainer — 40 to 80 hours a month",
        rate: "₹45,000 – ₹90,000 / month",
        fits: "One live project plus maintenance across your other accounts",
        has: [
          "A named developer, not a rotating bench",
          "Unused hours roll one month",
          "Same-day response on anything logged",
          "A monthly hour statement, itemised",
        ],
      },
      {
        name: "Dedicated developer — full time",
        rate: "₹1,40,000 – ₹2,20,000 / month",
        fits: "A developer who is yours, on your stack, for as long as you need one",
        has: [
          "160 hours a month",
          "Works your hours and joins your calls",
          "Reports to your project manager, not to us",
          "One month's notice either way — no lock-in",
        ],
      },
      {
        name: "Per build, white-labelled",
        rate: "₹25,000 – ₹1,05,000 / build",
        fits: "You sold it, we build it, your client never knows we exist",
        has: [
          "Our retail band less 30% — you keep the margin and the client",
          "₹25,000 is the floor and it does not move",
          "Delivered in your repository, your hosting, your name",
        ],
      },
    ] as PartnerTier[],
  },

  overseas: {
    eyebrow: "AGENCIES OUTSIDE INDIA",
    title: "Dollar rates",
    note: "Quoted in dollars because that is the currency you price in. You bill your client $75–150 an hour for the same work; the spread is yours.",
    tiers: [
      {
        name: "Hourly, white-labelled",
        rate: "$25 – $40 / hour",
        fits: "Overflow when your own team is booked and the deadline is not",
        has: [
          "Minimum 10 hours",
          "Under NDA before anything starts",
          "4–6 hours of overlap with US Eastern, 3–4 with the UK",
          "Your repo, your Slack, your standup — we join as your team",
        ],
      },
      {
        name: "Retainer — 60 to 100 hours a month",
        rate: "$1,600 – $3,200 / month",
        fits: "A steady stream of client work you would otherwise turn down",
        has: [
          "A named developer",
          "Same-day response",
          "A monthly hour statement",
          "No long-term contract",
        ],
      },
      {
        name: "Dedicated developer — full time",
        rate: "$3,000 – $5,000 / month",
        fits: "Engineering capacity without the 42 days and $15,000 it takes to hire one",
        has: [
          "160 hours a month, one engineer, only your work",
          "Invisible to your client — NDA, unbranded staging, your email",
          "Mark it up and the spread is yours",
          "One month's notice either way",
        ],
      },
    ] as PartnerTier[],
  },

  how: {
    eyebrow: "HOW IT RUNS",
    title: "Boring on purpose",
    items: [
      {
        h: "Your tools, not ours",
        p: "Your repository, your board, your ceremonies, your client-facing language. We do not ask you to adopt anything.",
      },
      {
        h: "A written standup, daily",
        p: "Short, plain, and safe to forward to your client under your own name. You should never have to ask where something is.",
      },
      {
        h: "Scope in writing, before it starts",
        p: "What is included, what is not, and what changes the number. Quotes diverge tenfold because each side silently assumed something different; we write ours down.",
      },
      {
        h: "One month's notice, both ways",
        p: "No annual contract, no minimum term on retainers, no exit fee. If it is not working you should be able to stop.",
      },
    ],
  },

  /**
   * Saying who this is NOT for is the most credible paragraph on a page like
   * this, for the same reason the exclusions paragraph works in the quote
   * emails: it is the one thing a vendor trying to win everything will not say.
   */
  notFor: {
    eyebrow: "WHEN NOT TO CALL US",
    title: "Three times this is the wrong arrangement",
    items: [
      "You need someone in your office. We work remotely and we are in Kaushambi, Uttar Pradesh. If the work needs a desk in your building, it needs a hire.",
      "Development is the core of how you make money and the volume is steady. At that point your own team is cheaper than any partner, and a partner who tells you otherwise is selling.",
      "You want the cheapest hour available. We are not it. There are shops billing a third of these rates and some of them are fine; we would rather say so than win on a number we cannot deliver at.",
    ],
  },

  proof: {
    eyebrow: "WHAT YOU CAN OPEN INSTEAD OF TAKING OUR WORD",
    title: "Two things, in ten seconds",
    items: [
      {
        h: "bizgstpro.com",
        p: "Our own product — GST billing and accounting software. We designed it, built it, run it, and answer its support. For an agency judging whether we can actually build, this is the honest thing to look at.",
        href: "https://bizgstpro.com",
      },
      {
        h: "adnitinkumar.in",
        p: "A client build. Online fee payment, a pending-dues check and appointment booking. Transactions, not a brochure.",
        href: "https://adnitinkumar.in",
      },
    ],
  },

  cta: {
    eyebrow: "START SMALL",
    title: "Ten hours is a sensible first block",
    sub: "Not a retainer, not a contract. Give us the thing you are currently pushing out because nobody is free, and judge the arrangement on that. What is the piece you are turning down right now?",
  },
} as const;
