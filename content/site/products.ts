/**
 * The company's own products and where they are going.
 *
 * BizGST Pro's feature names, plan prices and contact details are read directly
 * from bizgstpro.com (home, /pricing, /contact, /about) — the product's own
 * words, not a paraphrase.
 */

export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  note: string;
  features: string[];
  highlight?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  domain: string;
  /** External site, when the product has one. Omitted for products that live
   *  on this domain — there is nowhere else to send the visitor. */
  url?: string;
  status: "Live" | "Private beta" | "In development";
  accent: "violet" | "cyan";
  /**
   * A real capture of the live product, from public/portfolio. Present means
   * the visual shows the actual interface; absent means it falls back to an
   * abstraction. Never point this at a mockup of a screen that does not exist.
   */
  shot?: string;
  kicker: string;
  headline: string;
  sub: string;
  audience: string;
  features: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  pricing?: { title: string; sub: string; tiers: PricingTier[] };
  faq: { q: string; a: string }[];
};

export const products: Product[] = [
  {
    slug: "bizgstpro",
    name: "BizGST Pro",
    domain: "bizgstpro.com",
    shot: "/portfolio/bizgstpro-home-desktop.jpg",
    url: "https://bizgstpro.com",
    status: "Live",
    accent: "violet",
    kicker: "GST-COMPLIANT SAAS ERP",
    headline: "Run your business. We'll handle GST, billing and collections.",
    sub: "Invoicing, ledger, inventory, expenses, payroll and GST returns in one app — from signup to your first GST invoice in under 120 seconds. Cheaper than Zoho, simpler than Tally, far more than a khata app.",
    audience:
      "Built for Indian MSMEs — shops, traders, distributors and service businesses that bill from a phone — and for the CAs who file their returns.",
    features: [
      {
        title: "GST invoicing",
        body: "CGST, SGST and IGST calculated automatically across every slab, RCM and composition. A professional invoice in about 30 seconds.",
      },
      {
        title: "Customer ledger",
        body: "Khata-style ledger showing exactly who owes what, with one-tap WhatsApp payment reminders against any outstanding balance.",
      },
      {
        title: "Payment recovery",
        body: "Automatic overdue reminders on WhatsApp and email chase receivables so the owner doesn't have to.",
      },
      {
        title: "Smart inventory",
        body: "Stock deducts itself as you invoice and rises with purchases, with low-stock alerts — no separate register to reconcile.",
      },
      {
        title: "Expense tracking",
        body: "Twelve built-in categories with GST captured on every entry, so input credit isn't left on the table.",
      },
      {
        title: "P&L report",
        body: "This month's profit or loss at a glance, without waiting for a month-end close.",
      },
      {
        title: "GSTR-1 & GSTR-3B summaries",
        body: "B2B, B2C and HSN breakups ready to read, exportable as CSV to hand straight to your CA.",
      },
      {
        title: "CA portal",
        body: "Your accountant enters an access code and sees every linked client's live GST picture read-only — invoices, GST collected, outstanding dues.",
      },
      {
        title: "Leads pipeline",
        body: "New → Contacted → Quoted → Won, so follow-ups don't die in a WhatsApp thread.",
      },
      {
        title: "AI assistant",
        body: "Ask GST questions in plain language and get an answer inside the app, instead of guessing or calling someone.",
      },
      {
        title: "Payroll",
        body: "Employees and payslips handled in the same place as the books, on the Business plan.",
      },
      {
        title: "Tally import & no lock-in",
        body: "Bring existing masters across in about five minutes. Your data exports whenever you want — leaving is always allowed.",
      },
    ],
    steps: [
      { title: "Sign up", body: "Two minutes, no card. Free forever tier, nothing to cancel." },
      { title: "Bill", body: "Raise a compliant GST invoice from your phone and send it on WhatsApp in one tap." },
      { title: "Collect", body: "The ledger tracks what's outstanding and chases it automatically until it's paid." },
      { title: "File", body: "GSTR-1 and GSTR-3B summaries export as CSV — or your CA reads them live in the portal." },
    ],
    pricing: {
      title: "Tally's power. Zoho's features. A lower price than either.",
      sub: "No hidden charges, no per-invoice fees, cancel anytime. Annual billing works out to roughly two months free.",
      tiers: [
        {
          name: "Free",
          price: "₹0",
          period: "forever",
          note: "Try it out — no card required",
          features: [
            "5 invoices / month",
            "10 customers · 10 items",
            "GST invoice with auto CGST/SGST/IGST",
            "Print / PDF invoice",
            "AI assistant — 3 queries/day",
          ],
        },
        {
          name: "Basic",
          price: "₹499",
          period: "/mo · ₹4,999/yr",
          note: "Complete accounting for a small business",
          features: [
            "150 invoices / month",
            "500 customers · 500 items",
            "Customer ledger + WhatsApp reminders",
            "Expense tracking + P&L report",
            "GSTR-1 & GSTR-3B summaries + CSV",
            "AI assistant — 20 queries/day",
          ],
        },
        {
          name: "Pro",
          price: "₹699",
          period: "/mo · ₹6,999/yr",
          note: "Everything in Basic, plus inventory and the CA portal",
          highlight: true,
          features: [
            "1,000 invoices / month",
            "5,000 customers · items",
            "Inventory — auto stock deduction + alerts",
            "Leads pipeline + email outreach",
            "E-invoice (IRN) JSON export",
            "CA Portal access",
            "Priority WhatsApp support",
          ],
        },
        {
          name: "Business",
          price: "₹999",
          period: "/mo · ₹9,999/yr",
          note: "Every feature we make — for growing teams",
          features: [
            "Unlimited invoices · customers · items",
            "Payroll — employees + payslips",
            "Team roles (Owner/Admin/Accountant/Sales)",
            "Tally import (masters)",
            "AI assistant — 100 queries/day",
            "Onboarding call + data import help",
          ],
        },
      ],
    },
    faq: [
      {
        q: "Who is BizGST Pro for?",
        a: "Indian small and medium businesses that invoice regularly — shops, traders, distributors and service firms — plus the CAs and tax practitioners who file for them. If you're running the business off a paper khata or a plain billing app with no compliance, this is the step up.",
      },
      {
        q: "What does it cost to start?",
        a: "Nothing. The free tier is free forever — 5 invoices a month, no card required. Paid plans start at ₹499/month, and annual billing works out to roughly two months free.",
      },
      {
        q: "Where is my data stored, and can I get it out?",
        a: "In India, on servers in Mumbai. Export everything whenever you want — there is no lock-in and no exit fee. If it isn't for you, take your data and go.",
      },
      {
        q: "Can my CA see my books?",
        a: "Yes. Give your accountant an access code and the CA Portal shows them your live GST picture, read-only — invoices, GST collected, outstanding dues. No month-end Excel chase. CAs can also join the partner program at ₹4,999/year for 10 client licences.",
      },
      {
        q: "How does it compare to Tally, Zoho Books or Vyapar?",
        a: "No large upfront licence like TallyPrime, and cloud-based so you can work from anywhere. Cheaper than Zoho Books with a built-in AI assistant they don't have. And unlike a billing-only app, it covers full accounting, inventory and payroll.",
      },
      {
        q: "Does it handle e-invoicing?",
        a: "E-invoice IRN JSON export is on the Pro plan. Live IRN generation depends on government GSP integration — sandbox mode is included and live activation is rolling out per plan. As always, have your CA verify GST calculations before filing.",
      },
    ],
  },

  /**
   * Cognitive Capital Suite — the AI SDR agent.
   *
   * Copy is drawn from the company's own English pitch deck. The Hindi deck
   * covering the same product is explicitly internal ("apne aap ko aur partner
   * ko samjhane ke liye") and carries tool costs, margins and investor asks —
   * none of that belongs on a public page and none of it is used here.
   *
   * Prices are deliberately absent: the company quotes per scope after a call.
   */
  {
    slug: "cognitive-capital-suite",
    name: "Cognitive Capital Suite",
    domain: "cognitivecapitalsuite.com",
    status: "Private beta",
    accent: "cyan",
    kicker: "AI SALES AGENT FOR B2B SAAS",
    headline: "Your outbound pipeline, running while you sleep.",
    sub: "An AI sales agent that finds your ideal customers, researches each one, writes a genuinely personalised email — not a template — follows up, reads the replies, and books qualified meetings straight into your calendar. You show up to the demo.",
    audience:
      "Built for bootstrapped B2B SaaS founders between $500K and $5M ARR with no dedicated SDR yet, and for agencies who want to offer outbound to their own clients white-labelled.",
    features: [
      {
        title: "Lead discovery",
        body: "Pulls a steady stream of qualified accounts matching your ideal customer profile — around 100 a day — instead of you scrolling LinkedIn.",
      },
      {
        title: "Real-time enrichment",
        body: "Every company is researched before anything is written: what they do, how they're funded, what changed recently. That research is what makes the email land.",
      },
      {
        title: "Genuine personalisation",
        body: "One unique email per lead, written from that research. Not a merge field dropped into a template — the difference is the reply rate.",
      },
      {
        title: "Deliverability that holds",
        body: "Warmed sending domains and paced delivery, so your mail keeps reaching inboxes instead of quietly landing in spam after week two.",
      },
      {
        title: "Reply intelligence",
        body: "Replies are read and classified — interested, not now, wrong person, unsubscribe — and routed or answered accordingly, without you triaging an inbox.",
      },
      {
        title: "Automatic follow-up",
        body: "The sequence keeps going on its own schedule. Most replies come from follow-ups, and follow-ups are exactly what a busy founder stops doing.",
      },
      {
        title: "Meetings booked, CRM updated",
        body: "Qualified conversations become calendar invites and CRM records without a handoff step, so nothing sits in someone's head.",
      },
      {
        title: "Weekly report",
        body: "What went out, what came back, what's booked. One page, every week, so you can tell whether it is working.",
      },
    ],
    steps: [
      {
        title: "Monday",
        body: "The agent finds qualified leads, researches each company, writes a unique email for every one, and sends the first batch.",
      },
      {
        title: "Wednesday",
        body: "Follow-ups go out automatically. Interested replies are detected and answered; the rest are classified and filed.",
      },
      {
        title: "Friday",
        body: "Meetings land in your calendar, the CRM is updated, and a weekly report tells you what actually happened.",
      },
      {
        title: "Your part",
        body: "Take the demo. Close the deal. That is the whole job description.",
      },
    ],
    pricing: {
      title: "Three ways to run it.",
      sub: "Every engagement is scoped and quoted on a call — volume, sending domains and how much of the pipeline you want handled all move the number. No public price list, no surprise line items.",
      tiers: [
        {
          name: "Starter",
          price: "On enquiry",
          note: "One campaign, for a founder testing outbound properly",
          features: [
            "One active campaign",
            "Managed lead discovery & enrichment",
            "Personalised sequences with follow-up",
            "Meeting booking + CRM sync",
            "Weekly report",
          ],
        },
        {
          name: "Growth",
          price: "On enquiry",
          period: "most chosen",
          note: "Several campaigns running against different segments",
          highlight: true,
          features: [
            "Multiple active campaigns",
            "Higher monthly lead volume",
            "Advanced multi-step sequences",
            "Reply classification & routing",
            "Priority support",
          ],
        },
        {
          name: "Agency",
          price: "On enquiry",
          note: "Offer outbound to your own clients, under your own brand",
          features: [
            "White-label ready",
            "Multi-client dashboard",
            "Unlimited campaigns",
            "Dedicated account manager",
            "Partner revenue share",
          ],
        },
      ],
    },
    faq: [
      {
        q: "How is this different from hiring an SDR?",
        a: "An SDR costs a salary whether or not the pipeline moves, sends perhaps 50–80 emails a day, works eight hours, needs three to four months of ramp, and half of them leave within a year. The agent runs continuously, sends at a far higher volume, is consistent on a bad week, and is live in days rather than months. It does not replace a closer — you still take the calls.",
      },
      {
        q: "Are these mail-merge templates?",
        a: "No, and that is the whole point. Each company is researched first and the email is written from that research, so it reads like someone actually looked at the business. Templates are why 95% of cold email gets ignored.",
      },
      {
        q: "Will this get my domain blacklisted?",
        a: "Not if it is set up properly. We send from separate warmed domains rather than your primary one, pace the volume, and monitor deliverability — so your company mail is never the thing at risk.",
      },
      {
        q: "How long does setup take?",
        a: "Around 48 hours to configure and go live, with no engineering work needed from your side. Sending domains need a warm-up period before volume ramps, which we handle.",
      },
      {
        q: "What does it cost?",
        a: "It is quoted after a short call, because volume, number of campaigns and how much of the pipeline you want managed change the answer significantly. We will give you a fixed number in writing before anything starts.",
      },
      {
        q: "Can an agency resell this?",
        a: "Yes. The Agency engagement is white-label with a multi-client dashboard and a revenue share, so you can offer outbound as your own service without building the machinery.",
      },
      {
        q: "Who is it not for?",
        a: "Anyone selling to consumers, anyone whose buyers are not reachable by email, and anyone with no offer worth booking a meeting about. Outbound amplifies a proposition — it does not create one.",
      },
    ],
  },
];

export const productsSection = {
  eyebrow: "OUR PRODUCTS",
  title: "We don't just build for clients.",
  sub: "Products of our own, engineered and operated in-house — which is why we know what production actually costs.",
};

/**
 * What's being built next, under the Cognitive Capital banner — this domain.
 *
 * The four Academy courses are listed by name only, each marked "Coming soon".
 * That is the owner's decision, and it is the right one: syllabus copy written
 * before a course exists is a promise the company has not yet made. Add the
 * detail when the courses are actually built.
 */

export const roadmap = {
  eyebrow: "IN DEVELOPMENT",
  title: "What we're building next.",
  sub: "Everything below is being built now. Dates aren't promised; these ship when they're good.",
  items: [
    {
      name: "Zesst AI Academy",
      status: "Coming soon",
      kicker: "FOUR COURSES",
      body: "Practical AI training for the people we already work with — business owners, accountants, students and small teams across Uttar Pradesh. Taught in plain Hindi and English, built around real work rather than theory. Four courses at launch:",
      courses: [
        { no: "01", title: "AI for Business Owners", body: "" },
        { no: "02", title: "AI for Accounting & GST Practice", body: "" },
        { no: "03", title: "Building with AI — Web & Apps", body: "" },
        { no: "04", title: "AI Content & Digital Marketing", body: "" },
      ],
    },
    {
      name: "One account for everything",
      status: "In development",
      kicker: "PLATFORM",
      body: "Bringing the compliance desk, the lead pipeline and our SaaS into a single login, so a business owner sees filings, funding and customers on one screen instead of four apps and a WhatsApp thread.",
      courses: [],
    },
  ],
};

/**
 * The four pillars, each with a 3D object that performs it.
 *
 * This is the same work the six services and four verticals describe, grouped
 * the way a client actually buys it rather than the way it is delivered. The
 * detailed lists below them still exist on /services; this is the front door.
 *
 * `stages` are the named steps shown beside the object. They are only listed
 * where the work genuinely has a fixed order — inventing three steps for
 * something that does not have them would make the numbering decoration.
 */
