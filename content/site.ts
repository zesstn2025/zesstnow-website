/**
 * SINGLE SOURCE OF TRUTH FOR ALL SITE COPY.
 *
 * Nothing in components/ hardcodes user-facing text — edit it here and the whole
 * site updates.
 *
 * Provenance of everything below:
 *   - Company registration facts: MCA records.
 *   - BizGST Pro: read directly from bizgstpro.com (home, /pricing, /contact,
 *     /about). Feature names, plan prices and contact details are the product's
 *     own words.
 *   - Contact details: bizgstpro.com/contact, which is the company's published
 *     contact channel.
 *   - The business-services verticals (GST, loans, insurance, leads): read from
 *     www.adnitinkumar.in, where the group publishes them, plus BizGST Pro's
 *     own leads module. Every line item below appears on one of those two.
 *
 * Anything still marked `CONFIRM:` is NOT verified — replace before launch.
 */

export const company = {
  legalName: "Zesst Now Services Private Limited",
  shortName: "Zesst Now",
  wordmark: "ZESST NOW",
  // The company's own description of itself, from bizgstpro.com/about.
  tagline:
    "A bootstrapped software company in Kaushambi, Uttar Pradesh — building premium websites, AI automations and SaaS products for Indian businesses.",
  cin: "U47110UP2025PTC217212",
  incorporated: "21 February 2025",
  registeredOffice: {
    // Spelling follows the company's own published address.
    line1: "C/O Varsha Agrawal, Bhaktan Ka Pura",
    line2: "Osa Road, Manjhanpur",
    locality: "Manjhanpur",
    district: "Kaushambi",
    state: "Uttar Pradesh",
    pin: "212207",
    country: "India",
  },
  // The company's own address, not the product's. BizGST Pro keeps
  // support@bizgstpro.com on its own site for existing subscribers; anything
  // addressed to Zesst Now itself comes here.
  email: "zesstn@gmail.com",
  phone: "+91 77538 98481",
  phoneE164: "917753898481",
  hours: "Mon–Sat, 10 AM – 7 PM IST",
  instagram: "zesstnowai",
  instagramUrl: "https://instagram.com/zesstnowai",
  founder: "Sonu Sharma",
  founderRole: "Founder & CEO",
  // Both directors on the MCA record. Naming them is deliberate — an anonymous
  // company converts badly with the clients this site is aimed at.
  directors: ["Sonu Sharma", "Rani Devi"],
  legalAdvisor: "Adv. Nitin Kumar",
  // This site ships on cognitivecapitalsuite.com — the company's own domain,
  // which doubles as its portfolio. The www host is the canonical one; Vercel
  // 308s the apex to it, so canonical URLs, OG and sitemap.xml must name www
  // or they all point at a redirect.
  domain: "www.cognitivecapitalsuite.com",
};

/**
 * Social profiles.
 *
 * A profile with an empty `url` is rendered nowhere — the components skip it.
 * That is deliberate: a guessed facebook.com/... or linkedin.com/in/... slug
 * lands on the wrong person or a 404, which is worse than no link at all. Fill
 * the real URLs in and they appear everywhere at once.
 *
 * The two URLs filled in below are not guesses. They are numeric-id URLs read
 * off the pages the company's own accounts actually administer — Facebook page
 * 100709512133622 "Zesst Now services private limited" and LinkedIn company
 * 117373922 "Cognitive Capital-Global". Both platforms treat the id form as
 * canonical and redirect it to whatever vanity slug the page later takes, so
 * these keep working even if the handles change. If a vanity URL is preferred
 * in the footer, paste it over the id form — do not delete the id.
 */
export type Profile = { network: string; handle: string; url: string };

export const social: { company: Profile[]; founder: Profile[] } = {
  company: [
    { network: "Instagram", handle: "@zesstnowai", url: "https://instagram.com/zesstnowai" },
    {
      network: "Facebook",
      handle: "Zesst Now Services Private Limited",
      url: "https://www.facebook.com/100709512133622",
    },
    {
      network: "LinkedIn",
      handle: "Cognitive Capital-Global",
      url: "https://www.linkedin.com/company/117373922/",
    },
  ],
  founder: [
    {
      network: "Instagram",
      handle: "@sonu_sharma_entreprenuar",
      url: "https://instagram.com/sonu_sharma_entreprenuar",
    },
    // TODO: paste the profile URLs
    { network: "Facebook", handle: "Sonu Kumar", url: "" },
    { network: "LinkedIn", handle: "Sonu Sharma", url: "" },
  ],
};

/**
 * The people behind the company.
 *
 * `photo` points at a file in public/team. If that file is not present, the
 * card renders a monogram instead of a broken image — so a missing photograph
 * degrades to something deliberate rather than to an empty frame. Drop the
 * real photograph in at the named path and it appears with no code change.
 *
 * These are real, named people. Their photographs are the one asset on this
 * site that must never be substituted with a generated likeness.
 */
export type Person = {
  name: string;
  role: string;
  /** A second line under the role — held separately so the role stays short. */
  scope: string;
  photo: string;
  /** Two letters. Shown when the photograph is absent. */
  monogram: string;
  bio: string;
  links?: Profile[];
};

export const leadership = {
  eyebrow: "WHO YOU'RE WORKING WITH",
  title: "Three people, named.",
  sub: "A private limited company is a legal person, but the work is done by these three. Their names are on the MCA record and on every project we take.",
  people: <Person[]>[
    {
      name: "Sonu Sharma",
      role: "Founder & CEO",
      scope: "Director",
      photo: "/team/sonu-sharma.jpg",
      monogram: "SS",
      bio: "Founded the company in February 2025 and leads what gets built. Writes the brief on every project before anyone opens an editor, and is the person a client talks to when something is going wrong.",
      links: [
        {
          network: "Instagram",
          handle: "@sonu_sharma_entreprenuar",
          url: "https://instagram.com/sonu_sharma_entreprenuar",
        },
      ],
    },
    {
      name: "Rani Devi",
      role: "Director",
      scope: "Operations & compliance",
      photo: "/team/rani-devi.jpg",
      monogram: "RD",
      bio: "On the board since incorporation. Oversees the company's own statutory compliance — the filings, registers and records that let us tell a client honestly how their compliance should be run.",
    },
    {
      name: "Adv. Nitin Kumar",
      role: "Legal Advisor",
      scope: "Contracts & regulatory",
      photo: "/team/nitin-kumar.jpg",
      monogram: "NK",
      bio: "Advocate. Reviews the contracts we sign and the ones we ask clients to sign, and keeps the loan, insurance and lead-generation work inside what the regulations actually permit.",
    },
  ],
};

/**
 * The homepage read as a sequence of chapters, for the scroll rail.
 *
 * Numbering is only honest because this genuinely is an order: a visitor meets
 * the promise, then the work, then the people, then the way in. The ids must
 * match the section ids on the homepage — a chapter whose target is missing is
 * dropped rather than rendered as a dead link.
 */
export const chapters: { id: string; label: string }[] = [
  { id: "top", label: "Open" },
  { id: "promise", label: "The promise" },
  { id: "pillars", label: "What we build" },
  { id: "pillar-ai", label: "AI agents" },
  { id: "pillar-saas", label: "SaaS & apps" },
  { id: "pillar-automation", label: "Automation" },
  { id: "pillar-fintech", label: "Fintech" },
  { id: "services", label: "Disciplines" },
  { id: "verticals", label: "Compliance desk" },
  { id: "products", label: "Our products" },
  { id: "showcase", label: "Inside a product" },
  { id: "roadmap", label: "What's next" },
  { id: "process", label: "How we work" },
  { id: "portfolio", label: "The work" },
  { id: "leadership", label: "Who we are" },
  { id: "contact", label: "Start" },
];

export const nav = [
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const ticker = [
  `CIN ${company.cin}`,
  "Incorporated 2025",
  "Kaushambi · Uttar Pradesh",
  "Websites · AI Automations · SaaS",
  "GST & Tax Compliance",
  "Loans · Insurance · Leads",
  "Websites live in 48 hours",
  "Data hosted in India",
  "Bootstrapped, no outside capital",
];

export const hero = {
  eyebrow: "ESTD 2025 · KAUSHAMBI, UTTAR PRADESH",
  titleLead: "We build digital products",
  titleEm: "businesses actually run on.",
  sub: "Zesst Now Services Private Limited designs and engineers premium websites, AI automations and SaaS products — and runs the compliance, funding and marketing desk behind them. From the first pixel to the filed return.",
  primaryCta: { label: "See our work", href: "/work" },
  secondaryCta: { label: "Start a project", href: "/contact" },
  stats: [
    { value: "48 hrs", label: "Website live, start to finish" },
    { value: "25–45", label: "Days to loan disbursement" },
    { value: "12", label: "Modules shipped in BizGST Pro" },
    { value: "100%", label: "Built in-house" },
  ],
};

export const services = {
  eyebrow: "WHAT WE DO",
  // Phrased as the question a visitor arrives with. A heading that states what
  // we do is about us; a heading that asks what they need is about them, and
  // the six answers below are the same six either way.
  title: "What are you looking for?",
  sub: "No handoffs between agencies. Strategy, design and engineering sit in the same room — and the same team stays on it after launch.",
  items: [
    {
      no: "01",
      title: "Web Experiences",
      body: "Marketing sites and web apps engineered for speed, search and conversion. Real 3D, real motion, real Core Web Vitals — not a template with a new logo.",
      points: ["Next.js & React", "Technical SEO", "3D / WebGL", "CMS & dashboards"],
    },
    {
      no: "02",
      title: "AI Automations",
      body: "Workflows that delete manual work: document extraction, reconciliation, reporting and support triage — wired into the tools a business already uses.",
      points: ["Document intelligence", "Workflow agents", "Data pipelines", "Integrations"],
    },
    {
      no: "03",
      title: "Product Engineering",
      body: "Full SaaS builds end to end — architecture, backend, auth, billing, admin, deployment and the monitoring that keeps it up at 2am. BizGST Pro is ours, start to finish.",
      points: ["Architecture", "Backend & APIs", "Billing & auth", "Cloud deployment"],
    },
    {
      no: "04",
      title: "Apps — Native & Installable",
      body: "Mobile and desktop apps designed native to each platform, not one layout stretched across both. Shipped to the stores when you want that, and installable straight from your own link when you don't — no Play Store review, no waiting.",
      points: ["iOS & Android", "Windows & macOS", "Direct install", "Offline-capable"],
    },
    {
      no: "05",
      title: "Social Media Automation",
      body: "Content planned, produced, scheduled and posted across channels on a calendar you can see — with replies, comments and DMs routed to one inbox so leads don't die in a notification.",
      points: ["Content calendar", "Scheduling", "Unified inbox", "Reporting"],
    },
    {
      no: "06",
      title: "Brand Identity",
      body: "Naming, logo systems, type and colour — a design language that makes a young company look like the obvious choice.",
      points: ["Naming", "Logo systems", "Design language", "Collateral"],
    },
  ],
};

/**
 * The promises the company is willing to be held to.
 *
 * Only two numbers are fixed anywhere on this site — the 48-hour website and the
 * 25–45 day loan window. Everything else is quoted per scope, deliberately, and
 * the copy has to keep saying so rather than implying a rate card exists.
 */
export const usps = {
  eyebrow: "WHAT YOU GET FROM US",
  title: "Fixed where it matters. Honest everywhere else.",
  sub: "Most studios hide behind a vague timeline and a padded quote. We do the opposite — a hard commitment where we can make one, and a real number in writing before anything starts.",
  items: [
    {
      value: "48 hrs",
      title: "Your website, live",
      body: "A complete, production website inside 48 hours of the brief being agreed — designed, built, deployed and handed over. Not a template with your logo dropped in.",
    },
    {
      value: "25–45 days",
      title: "Loan disbursement",
      body: "From a complete file to money in the account, typically 25 to 45 days. We prepare the paperwork and stay on the bank until it moves.",
      note: "Timeline assumes complete documents and a clean profile. Sanction and disbursement are the lender's decision, not ours.",
    },
    {
      value: "Locked",
      title: "Every other project, time-locked",
      body: "Bigger builds don't get a made-up date. We scope the work first, then lock a delivery date in writing — and if something slips, you hear it the week we find out, not at the deadline.",
    },
    {
      value: "Quoted",
      title: "Never a rate card",
      body: "No fixed price list, because no two projects are the same job. We understand what you need, then give you one number in writing that does not move unless you change the scope.",
    },
  ],
};

/**
 * The second half of the business.
 *
 * Alongside the software studio, the group runs financial and compliance
 * services out of Kaushambi — GST and tax filing through Nitin GST Suvidha
 * Kendra, loan and insurance facilitation, lead generation and marketing.
 * Every line item here is published on www.adnitinkumar.in or inside
 * BizGST Pro; nothing is invented.
 *
 * Note on wording: loan and insurance work is *facilitation* — sourcing,
 * paperwork and follow-through with the lender or insurer. The company does
 * not lend and does not underwrite, and the copy must never imply it does.
 */
export const verticals = {
  eyebrow: "BUSINESS SERVICES",
  title: "The compliance and growth desk.",
  sub: "Software is half of what we do. The other half is the unglamorous work Indian businesses actually get stuck on — returns, funding, paperwork and customers.",
  note: "Delivered from our Kaushambi office and through Nitin GST Suvidha Kendra, in front of Axis Bank, Sirathu Road, Manjhanpur. Walk-in GST and ITR services available.",
  items: [
    {
      no: "01",
      motif: "calendar" as const,
      title: "GST & Tax Compliance",
      lead: "Registration, filing and the notices nobody wants to open.",
      body: "A full GST desk: registration and new business setup, monthly and quarterly return filing, e-invoice generation, annual returns and GST audit. Plus income-tax returns, TDS/TCS corrections and representation when a demand notice arrives.",
      points: [
        "GST registration & new business setup",
        "Monthly / quarterly GSTR filing",
        "E-invoice (e-bill) generation",
        "GST audit & annual return",
        "Income tax returns, TDS / TCS",
        "Notice, demand & assessment support",
      ],
    },
    {
      no: "02",
      motif: "window" as const,
      title: "Loan Facilitation",
      lead: "Complete file to disbursement, typically 25–45 days.",
      body: "We help businesses and families get bank-ready and stay on top of the file: home and commercial property loans, loan against property, cash credit and overdraft limits, personal, business, education and vehicle loans — plus CIBIL clean-up before you apply. Once the file is complete we chase the bank until the money moves, and most cases disburse inside 25 to 45 days.",
      points: [
        "Home & commercial property loans",
        "Loan Against Property (LAP)",
        "Cash Credit (CC) & Overdraft (OD)",
        "Personal, business & education loans",
        "Vehicle loan assistance",
        "CIBIL score improvement",
      ],
      // Shown as a footnote on the card. Keeps the claim accurate and keeps the
      // company clear of anything that reads as unlicensed lending.
      disclaimer:
        "We facilitate applications and documentation with banks and NBFCs. Zesst Now is not a lender and does not accept deposits; sanction, rate and terms rest entirely with the lending institution.",
    },
    {
      no: "03",
      motif: "stack" as const,
      title: "Business Registration & Insurance",
      lead: "Getting the entity and the cover in place.",
      body: "Company, LLP, partnership, society and trust registration, Udyam (MSME) registration and trademark filing — then life, health, vehicle and travel cover, with claim documentation handled rather than left to you.",
      points: [
        "LLP, partnership, society & trust registration",
        "Udyam (MSME) registration",
        "Trademark registration",
        "Life & health insurance",
        "Vehicle & travel insurance",
        "Claim assistance & policy review",
      ],
      disclaimer:
        "Insurance is placed through licensed intermediaries. Zesst Now does not underwrite policies.",
    },
    {
      no: "04",
      motif: "funnel" as const,
      title: "Leads & Marketing",
      lead: "Customers in the pipeline, not just impressions bought.",
      body: "Lead generation and performance marketing wired into a pipeline you can actually work — landing pages, search and social campaigns, WhatsApp-first capture, and a New → Contacted → Quoted → Won pipeline so follow-ups stop dying in a chat thread. We also buy and sell verified leads at the prevailing market rate, and run social media end to end: content calendar, scheduling, posting and a single inbox for every reply.",
      points: [
        "Lead generation campaigns",
        "Buy & sell verified leads at market rate",
        "Landing pages built to convert",
        "Search & social performance marketing",
        "Social media automation & scheduling",
        "WhatsApp-first capture & nurture",
        "CRM pipeline setup",
        "Content, SEO & local search",
      ],
    },
  ],
};

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
export const pillars = {
  eyebrow: "WHAT WE BUILD",
  title: "Four things, built properly.",
  sub: "Every one of them runs on the same studio, the same team and the same contract. No handoffs, no agency in the middle.",
  items: [
    {
      id: "pillar-ai",
      no: "01",
      eyebrow: "COGNITIVE ARCHITECTURE",
      title: "Agents that finish the job.",
      lead: "Not a chatbot bolted onto a website.",
      body: "An agent that plans a task, pulls what it needs from your own documents and systems, and carries the work through to a result you can check. Built against your data, deployed where your team already works, and constrained so it never acts outside what you approved.",
      stages: ["Planning", "Knowledge synthesis", "Execution"],
      points: ["Document intelligence", "Tool-using agents", "Human-in-the-loop review", "Private deployment"],
    },
    {
      id: "pillar-saas",
      no: "02",
      eyebrow: "SAAS, WEB & APP DEVELOPMENT",
      title: "Software you own outright.",
      lead: "From a blank repository to a product in production.",
      body: "Marketing sites, web apps, dashboards and installable mobile apps — engineered for speed, search and the day the traffic actually arrives. You get the repository, the deployment and the documentation; there is no platform you have to keep renting from us.",
      points: ["Next.js & React", "Dashboards & admin", "Installable apps", "Technical SEO"],
    },
    {
      id: "pillar-automation",
      no: "03",
      eyebrow: "AUTOMATION & DIGITAL MARKETING",
      title: "A pipeline, not impressions.",
      lead: "Traffic is only worth what it converts.",
      body: "Campaigns, landing pages and WhatsApp-first capture wired into a pipeline you can actually work, with the follow-ups running on their own schedule. We also buy and sell verified leads at the prevailing market rate, and run social media end to end.",
      points: ["Lead generation", "Marketing automation", "Social media, end to end", "Verified leads at market rate"],
    },
    {
      id: "pillar-fintech",
      no: "04",
      eyebrow: "INSTITUTIONAL TRUST",
      title: "Funding, and the paperwork behind it.",
      lead: "Typically 25 to 45 days from a complete file to disbursement.",
      body: "Business loans, loan against property, and life, health, vehicle and travel cover. We prepare the file, present it properly and stay on the lender until it moves — and we handle the claim documentation rather than leaving it to you.",
      points: ["Business loans", "Loan against property", "Insurance & claims", "CIBIL improvement"],
      /*
       * Both figures are checkable.
       *
       * The reference this section was drawn from carried "100% Automated
       * Processing" and "Zero Collateral Risks", and neither can go on the
       * page. The desk prepares files by hand and stays on the lender until it
       * moves — that is the service, and it is not automated. And loan against
       * property, which is on the list directly above, is a secured product:
       * the collateral is the point of it. A finance page is the last place to
       * put a number that will not survive the first question about it.
       */
      stats: [
        { value: "25–45 days", label: "Complete file to disbursement" },
        { value: "Pvt Ltd", label: "CIN on the public MCA record" },
      ],
      disclaimer:
        "We facilitate applications and documentation with banks and NBFCs. Zesst Now is not a lender and does not accept deposits; sanction, rate and terms rest entirely with the lending institution.",
    },
  ],
};

/**
 * The interactive product model.
 *
 * Layer names are the architecture a client is buying, in the order they are
 * stacked. They match the layers in components/three/scenes/ProductModel.tsx —
 * if one list changes, the other has to.
 */
export const showcase = {
  eyebrow: "SEE INSIDE",
  title: "Take the product apart.",
  sub: "Drag to turn it, scroll to zoom, and pull the stack open to see what is actually under the interface. This is how every product we ship is built.",
  layers: [
    { label: "Interface", body: "What your customer touches. Fast, accessible, and yours." },
    { label: "Logic & automations", body: "The rules, the workflows and the agents doing the repeated work." },
    { label: "Data", body: "Your records, in your account, exportable the day you ask." },
    { label: "Platform & hosting", body: "Deployment, backups and monitoring — set up once, handed over documented." },
  ],
  hint: "Drag to rotate · Scroll to zoom",
};

/**
 * The three service pages.
 *
 * Each one is a full page rather than a section, because these are the three
 * things a client arrives already searching for — and a page can rank, a
 * section cannot.
 *
 * On e-commerce specifically: this is written as a build service, which is what
 * it is. Zesst Now builds and hands over stores; it does not operate them, and
 * there is no store case study to show yet, so nothing here claims one. The
 * angle that is real is the GST one — an Indian store has to issue compliant
 * invoices from day one, and the same company runs the filing desk.
 */
export type ServicePage = {
  slug: string;
  scene: "agent" | "vault" | "saas" | "storefront" | "funnel";
  eyebrow: string;
  navLabel: string;
  title: string;
  titleEm: string;
  lead: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  stats: { value: string; label: string }[];
  /** What is actually delivered. Each one is a thing, not an adjective. */
  capabilities: { no: string; title: string; body: string }[];
  /** The order the work happens in. */
  steps: { no: string; title: string; body: string }[];
  faq: { q: string; a: string }[];
  /** Shown in a bordered note at the end. Omit where there is nothing to say. */
  note?: string;
  /**
   * A stage-by-stage walk through the work, with the scene advancing beside it.
   *
   * Only on pages where the process is the thing being sold and it genuinely
   * has fixed stages. Everywhere else `steps` above already covers the order,
   * and a second numbered list would be repetition dressed as detail.
   */
  timeline?: {
    no: string;
    title: string;
    body: string;
    /** The concrete artefact this stage produces. */
    output: string;
  }[];
  /**
   * Sections that go further into one product line, optionally with a working
   * tool attached. `calculator` names which one — the components decide what
   * that means, and each carries its own disclosure.
   */
  deepDives?: {
    id: string;
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
    calculator?: "emi" | "cover";
  }[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "ai-agents",
    scene: "agent",
    eyebrow: "COGNITIVE ARCHITECTURE",
    navLabel: "AI agents",
    title: "Agents that",
    titleEm: "finish the job.",
    lead: "Not a chatbot bolted onto a website.",
    metaTitle: "AI agents and document intelligence — Zesst Now",
    metaDescription:
      "AI agents that plan a task, read your own documents and systems, and carry the work through to a checkable result. Built against your data, deployed where your team already works, and constrained so nothing happens without approval.",
    intro: [
      "A chatbot answers. An agent finishes. The difference is that an agent is allowed to do something — open the file, read the ledger, draft the reply, fill the form — and is held to a result you can inspect afterwards rather than a paragraph that sounds right.",
      "That is also why most of this work is not model work. The model is the easy part. The work is deciding what the agent is allowed to touch, feeding it your documents rather than the open internet, and building the point where a person signs off before anything leaves the building.",
    ],
    stats: [
      { value: "Your data", label: "Answers grounded in your own documents" },
      { value: "Approval first", label: "Nothing sent or filed without a person" },
    ],
    capabilities: [
      {
        no: "01",
        title: "Document intelligence",
        body: "Invoices, contracts, statements, notices. The agent reads what you already have and answers from it, with the page it took the answer from — so a wrong answer is visible instead of plausible.",
      },
      {
        no: "02",
        title: "Tool-using agents",
        body: "An agent that can actually act: query the database, call the API, write the row, send the message. Each tool is granted explicitly, and the list of what it may do is a thing you can read.",
      },
      {
        no: "03",
        title: "Human-in-the-loop review",
        body: "The step that makes the rest usable. Anything that leaves the company — a filing, a quote, a customer reply — waits for a person. The agent does ninety per cent of the work and none of the deciding.",
      },
      {
        no: "04",
        title: "Workflow automation",
        body: "The repeated sequence nobody wants: pull the file, check it against the rule, chase the missing document, update the sheet. Running on a schedule instead of on somebody remembering.",
      },
      {
        no: "05",
        title: "Private deployment",
        body: "Deployed into your own account and your own storage. Your documents are not training data for anybody, and the day you want it switched off it goes off.",
      },
      {
        no: "06",
        title: "Where your team already works",
        body: "WhatsApp, email, the dashboard they already have open. An agent that needs a new app to be adopted does not get adopted.",
      },
    ],
    /**
     * The three stages the orb performs beside this section. They are the
     * client's own words for the same thing — plan, learn, do — and they are
     * listed because this process genuinely has that order, not to give the
     * scene something to count.
     */
    timeline: [
      {
        no: "01",
        title: "Planning",
        body: "The task is broken into steps before a single one runs. What has to happen, in what order, what each step needs, and what must be true for the result to count as done. This is written down and agreed, because an agent given a vague goal will confidently pursue the wrong one.",
        output: "A written task plan with the success condition stated.",
      },
      {
        no: "02",
        title: "Knowledge elicitation",
        body: "The agent is given your material — documents, records, the systems it may query — and nothing else. Answers are grounded in that set and cite where inside it they came from. What it does not know, it says it does not know rather than filling the gap.",
        output: "A private, cited knowledge base built from your own records.",
      },
      {
        no: "03",
        title: "Execution",
        body: "The plan runs against the tools it was explicitly granted. Every action is logged. Anything with a consequence outside the company stops at a person for approval, and the log is what you read when you want to know why it did what it did.",
        output: "Completed work, a full action log, and a person's sign-off on anything that leaves.",
      },
    ],
    steps: [
      { no: "01", title: "Find the task", body: "We look for one repeated, well-defined job with a clear right answer — not 'add AI'. The first agent should replace an afternoon a week, not a department." },
      { no: "02", title: "Ground it", body: "Your documents and systems are connected, permissions scoped, and the agent tested against cases where you already know the correct answer." },
      { no: "03", title: "Put a person in it", body: "The approval step is built before the agent is let near anything live. It is the part that makes the rest safe to switch on." },
      { no: "04", title: "Run and watch", body: "Deployed with logging on. We review what it got wrong in the first weeks with you, and tighten it. An agent nobody reviews is an agent nobody should trust." },
    ],
    faq: [
      {
        q: "Will it make things up?",
        a: "A language model can, which is exactly why nothing here rests on it not doing so. Answers are grounded in your documents and cite the source, and anything with a consequence waits for a person. If you are being sold an AI system whose safety argument is 'it is accurate', ask what happens on the day it is not.",
      },
      {
        q: "Do our documents get used to train someone's model?",
        a: "No. It runs in your own account with your own storage, and we configure the providers so your content is not retained for training. If your policy requires a specific provider or a specific region, say so at the start and we build to it.",
      },
      {
        q: "Which model do you use?",
        a: "Whichever fits the task, the cost and your data policy — and we will tell you which, and why, rather than treating it as a trade secret. Being able to change it later without rebuilding is part of how it is put together.",
      },
      {
        q: "How much of a job can it actually take over?",
        a: "The reading, the drafting, the checking and the chasing — reliably. The deciding, no, and we do not build it to. In practice the honest promise is that the work arrives finished and a person spends a minute approving it instead of an hour producing it.",
      },
      {
        q: "What does it cost to run?",
        a: "There is a build cost and a running cost, and the running cost is usage-based — it goes up with volume. We estimate it from your real volumes before you commit and show the workings, because it is the number that surprises people six months in.",
      },
    ],
    note: "An agent is a tool operated by your team, not a replacement for professional judgement. Where output touches a regulated matter — a tax filing, a legal document, an insurance claim — a qualified person reviews and signs it before it goes anywhere.",
  },
  {
    slug: "saas-development",
    scene: "saas",
    eyebrow: "PRODUCT ENGINEERING",
    navLabel: "SaaS & apps",
    title: "Software you",
    titleEm: "own outright.",
    lead: "From a blank repository to a product in production.",
    metaTitle: "SaaS, web and app development — Zesst Now",
    metaDescription:
      "Custom SaaS platforms, dashboards, web apps and installable mobile apps, built in Next.js and React. You get the repository, the deployment and the documentation — no platform to keep renting.",
    intro: [
      "We build the software a business runs on: the dashboard the team lives in, the portal customers log into, the app that goes on a phone. Not a page builder with a login bolted on — a real product, with real state, that holds up when the traffic arrives.",
      "We ship our own SaaS as well as yours. BizGST Pro is live and has paying subscribers, which means the decisions on your build come from having operated software, not just delivered it.",
    ],
    stats: [
      { value: "48 hrs", label: "Marketing site, brief to live" },
      { value: "Yours", label: "Repository, deployment and docs handed over" },
    ],
    capabilities: [
      {
        no: "01",
        title: "SaaS platforms",
        body: "Multi-tenant products with accounts, roles, billing and an admin that your team can actually run without calling us. Built to be handed over.",
      },
      {
        no: "02",
        title: "Dashboards & internal tools",
        body: "The screen your operations team stares at all day. Fast filters, real exports, and numbers that reconcile — because a dashboard nobody trusts gets replaced by a spreadsheet.",
      },
      {
        no: "03",
        title: "Web apps & portals",
        body: "Customer logins, document upload, status tracking, payment. The things that otherwise live in a WhatsApp thread and get lost.",
      },
      {
        no: "04",
        title: "Installable apps",
        body: "Apps that install to the home screen from a link and work offline, without a Play Store review sitting between you and your customers.",
      },
      {
        no: "05",
        title: "Integrations",
        body: "Payments, GST e-invoicing, accounting, logistics, WhatsApp. Wired into what you already use rather than replacing it.",
      },
      {
        no: "06",
        title: "Technical SEO & performance",
        body: "Rendered on the server, measured on real Core Web Vitals. Fast is a feature, and on a marketing site it is the feature.",
      },
    ],
    steps: [
      { no: "01", title: "Scope", body: "We write down what it does and what it does not do, and price it. That number goes in writing before anyone opens an editor." },
      { no: "02", title: "Build", body: "Deployed from day one, so you are looking at the real thing on a real URL rather than at a picture of it." },
      { no: "03", title: "Handover", body: "Repository, deployment, environment variables and a written runbook. You could take it to another studio the next morning." },
      { no: "04", title: "Aftercare", body: "The same people who built it fix it. No account manager in between." },
    ],
    faq: [
      {
        q: "Do we own the code?",
        a: "Yes, outright, and the repository is transferred to your account at handover. There is no licence, no per-seat fee and no platform of ours you have to keep paying for to keep your own software running.",
      },
      {
        q: "What does it cost?",
        a: "A marketing site starts in the low tens of thousands of rupees. A web app or SaaS build is quoted per scope once we understand it. The number is fixed in writing before work starts and does not move unless you change the scope — in which case you approve the change first.",
      },
      {
        q: "How long does a real product take?",
        a: "A marketing site is 48 hours from an agreed brief. A working product is scoped and time-locked after we understand it — usually weeks, not months, because we cut scope rather than deadlines.",
      },
      {
        q: "What stack do you build on?",
        a: "Next.js and React, TypeScript throughout, Postgres, deployed on Vercel unless you need it somewhere else. Boring, widely known choices — so the next engineer who touches it is not learning something we invented.",
      },
    ],
  },
  {
    slug: "ecommerce",
    scene: "storefront",
    eyebrow: "ONLINE RETAIL",
    navLabel: "E-commerce",
    title: "A store that",
    titleEm: "invoices correctly.",
    lead: "Anyone can put a catalogue online. The hard part starts at checkout.",
    metaTitle: "E-commerce store development, GST-ready — Zesst Now",
    metaDescription:
      "Online stores built for Indian businesses: catalogue, UPI and card payments, GST-compliant invoicing, shipping and returns. Built, handed over, and backed by our own GST filing desk.",
    intro: [
      "An Indian store is not finished when the cart works. It has to raise a GST-compliant invoice on every order, apply the right rate to the right HSN code, handle a return without breaking the books, and produce numbers your accountant can file from at the end of the month.",
      "That last part is the reason to build one here. The same company running your store also runs a GST filing desk and ships GST software — so the invoice your customer receives and the return you file at month end are designed by people who have to live with both.",
    ],
    stats: [
      { value: "GST-ready", label: "Compliant invoicing from the first order" },
      { value: "UPI & cards", label: "Domestic payment rails, settled to your account" },
    ],
    capabilities: [
      {
        no: "01",
        title: "Catalogue & merchandising",
        body: "Products, variants, stock, collections and search that finds things. Editable by your team, not by a ticket to us.",
      },
      {
        no: "02",
        title: "Checkout & payments",
        body: "UPI, cards, netbanking and wallets through Indian gateways, with cash on delivery where it still matters. Settled straight to your account.",
      },
      {
        no: "03",
        title: "GST-compliant invoicing",
        body: "The right rate against the right HSN, CGST/SGST or IGST resolved by place of supply, and e-invoicing where your turnover requires it. Generated automatically, per order.",
      },
      {
        no: "04",
        title: "Shipping & returns",
        body: "Courier integration, tracking the customer can see, and a return flow that reverses the invoice properly instead of leaving a hole in the ledger.",
      },
      {
        no: "05",
        title: "Storefront performance",
        body: "A store that loads slowly loses the sale before the product is seen. Server-rendered, image-optimised and measured.",
      },
      {
        no: "06",
        title: "Reporting your accountant can use",
        body: "Sales, tax collected and returns, exportable in the shape a filing actually needs — not a CSV somebody has to re-cut by hand every month.",
      },
    ],
    steps: [
      { no: "01", title: "Catalogue", body: "We get your products, variants, HSN codes and tax rates in order first. Everything downstream depends on this being right." },
      { no: "02", title: "Build", body: "Storefront, checkout and admin, on a live URL from the start, with test payments running end to end." },
      { no: "03", title: "Go live", body: "Gateway approved, invoicing verified against a real order, courier connected, and you have placed a test purchase yourself." },
      { no: "04", title: "First month", body: "We stay close through the first filing cycle, because that is when a store's accounting problems actually surface." },
    ],
    faq: [
      {
        q: "Shopify, or custom?",
        a: "Whichever costs you less over three years. Shopify is faster to launch and fine for a straightforward catalogue; custom wins once you need unusual pricing, deep GST handling or an integration Shopify will not do. We will tell you which one you are, including when the answer is the cheaper one for us to build.",
      },
      {
        q: "Do you handle the GST filing too?",
        a: "Yes — that is a separate service and it is priced separately, but it is the same company. Most store owners take both, because the store is what generates the numbers the filing is made of.",
      },
      {
        q: "Can I edit products myself?",
        a: "Yes. Admin access is yours from day one and adding a product is not a support ticket. If you can use a spreadsheet you can run the catalogue.",
      },
      {
        q: "Do you have a store I can look at?",
        a: "Not yet — our published work is BizGST Pro and adnitinkumar.in, and we would rather say so than point you at somebody else's build. Everything above is what we deliver; ask us for a walkthrough of the checkout and invoicing on a staging store instead.",
      },
    ],
    note: "We build and hand over stores. We do not operate them, hold your stock or take a cut of your sales — the store, the gateway account and the customer data are yours from the first day.",
  },
  {
    slug: "digital-marketing",
    scene: "funnel",
    eyebrow: "DEMAND & PIPELINE",
    navLabel: "Marketing",
    title: "Customers in the pipeline,",
    titleEm: "not impressions bought.",
    lead: "Traffic is only worth what it converts.",
    metaTitle: "Digital marketing, lead generation and automation — Zesst Now",
    metaDescription:
      "Lead generation, performance campaigns, WhatsApp-first capture and marketing automation, wired into a pipeline you can work. Verified leads bought and sold at the prevailing market rate.",
    intro: [
      "Most agencies sell you reach and report on it. Reach is not the thing you needed — you needed enquiries you can call, in an order that tells you who to call first, with the follow-ups already going out.",
      "So the campaign and the pipeline are built as one piece here. The ad, the landing page, the capture, the follow-up sequence and the inbox are the same system, and every number reported traces back to a person you could pick up the phone to.",
    ],
    stats: [
      { value: "Market rate", label: "Verified leads, bought and sold" },
      { value: "One inbox", label: "Every channel's replies in one place" },
    ],
    capabilities: [
      {
        no: "01",
        title: "Lead generation",
        body: "Search and social campaigns pointed at pages built to convert, not at a homepage. Measured on cost per qualified enquiry, not on impressions.",
      },
      {
        no: "02",
        title: "WhatsApp-first capture",
        body: "In India the conversation happens on WhatsApp. Capture starts there and lands in the pipeline rather than dying in somebody's personal chat list.",
      },
      {
        no: "03",
        title: "Marketing automation",
        body: "Follow-up sequences that keep going on their own schedule. Most replies come from follow-ups, and follow-ups are exactly what a busy owner stops doing.",
      },
      {
        no: "04",
        title: "Social media, end to end",
        body: "Content calendar, production, scheduling, posting and a single inbox for every reply. Not just the posting half.",
      },
      {
        no: "05",
        title: "Verified leads",
        body: "We buy and sell verified leads at the prevailing market rate. No inflated list, no recycled data, and the rate is the rate — we do not mark it up quietly.",
      },
      {
        no: "06",
        title: "Landing pages that load",
        body: "Built by the same team that builds the products. A campaign pointed at a slow page is money spent on a bounce.",
      },
    ],
    steps: [
      { no: "01", title: "Offer", body: "Before any spend, we get clear on what is being sold and to whom. Outbound amplifies a proposition — it cannot create one." },
      { no: "02", title: "Build", body: "Landing page, capture, pipeline stages and the follow-up sequence, wired together and tested with a real enquiry." },
      { no: "03", title: "Run", body: "Campaigns live, spend controlled, and reported on cost per qualified enquiry rather than on reach." },
      { no: "04", title: "Tighten", body: "Kill what does not convert, put the budget behind what does. Monthly, in a call, with the numbers open." },
    ],
    faq: [
      {
        q: "What does a lead cost?",
        a: "It depends entirely on the industry and the geography, and anyone quoting you a single number before knowing either is guessing. We buy and sell at the prevailing market rate and show you what that rate is for your category before you commit.",
      },
      {
        q: "Do you guarantee a number of leads?",
        a: "No, and be careful with anyone who does. We commit to the spend, the build, the reporting and the follow-up running — the market decides the rest, and a guaranteed number usually means the definition of 'lead' is about to get very loose.",
      },
      {
        q: "Who owns the leads and the ad accounts?",
        a: "You do. Accounts are created under your ownership and we are given access, not the other way round. If you stop working with us you keep the accounts, the history and the data.",
      },
      {
        q: "Can you run this on top of a site we already have?",
        a: "Yes, if it converts. If it does not, we will say so and quote you the landing pages separately rather than spending your budget pointing traffic at a page that loses it.",
      },
    ],
    note: "Lead generation and marketing are delivered by Zesst Now Services Private Limited. Where a campaign touches a regulated product — a loan, an insurance policy — the disclosures on our fintech page apply to it as well.",
  },
  {
    slug: "fintech",
    scene: "vault",
    eyebrow: "INSTITUTIONAL TRUST",
    navLabel: "Loans & insurance",
    title: "Funding, and",
    titleEm: "the paperwork behind it.",
    lead: "Typically 25 to 45 days from a complete file to disbursement.",
    metaTitle: "Business loans, loan against property and insurance — Zesst Now",
    metaDescription:
      "We prepare and present loan and insurance files to banks and NBFCs, and stay on the lender until the file moves. Business loans, loan against property, and life, health, vehicle and travel cover — including the claim documentation.",
    intro: [
      "Most rejected loan files are not rejected on the numbers. They are rejected because something was missing, something contradicted something else, or nobody followed up when the file went quiet at the branch. That is the work here: assembling a file that answers the questions before they are asked, and then not letting go of it.",
      "The same desk runs the GST and tax compliance, which matters more than it sounds. A lender reads your returns. When the filings and the loan file are prepared by the same people, the story they tell matches — and a file whose numbers agree with the record gets a decision faster.",
    ],
    stats: [
      { value: "25–45 days", label: "Complete file to disbursement" },
      { value: "We file it", label: "Claim documentation prepared, not handed back" },
    ],
    capabilities: [
      {
        no: "01",
        title: "Business loans",
        body: "Working capital, term loans and machinery finance. We work out what the books will actually support before approaching anyone, so the first conversation with a lender is not the one that kills the file.",
      },
      {
        no: "02",
        title: "Loan against property",
        body: "Secured lending against residential or commercial property. Valuation, title papers and the legal file prepared properly, because this is where these applications stall.",
      },
      {
        no: "03",
        title: "Life & health cover",
        body: "Cover sized against what the household or the business would actually need, not against what is easiest to sell. We walk you through the exclusions before you sign, not after a claim.",
      },
      {
        no: "04",
        title: "Vehicle & travel cover",
        body: "Commercial and personal vehicle policies, and travel cover. Renewals tracked so a policy does not lapse quietly between years.",
      },
      {
        no: "05",
        title: "Claim documentation",
        body: "The part most intermediaries hand back to you. We assemble the claim file, submit it and follow it. A policy you cannot claim on was never cover.",
      },
      {
        no: "06",
        title: "CIBIL improvement",
        body: "Reading the report properly, disputing what is wrong on it, and sequencing the fixes. Slow, unglamorous, and the single thing that moves a rejected file to an approved one.",
      },
    ],
    deepDives: [
      {
        id: "loans",
        eyebrow: "DEEP DIVE 01",
        title: "Loans",
        body: "A lender is deciding one thing: whether this business can carry this repayment for this long. Everything in the file exists to answer that. We build it in the order the credit team reads it — the numbers, the record behind the numbers, then the security — and we keep it consistent with the returns already filed.",
        points: [
          "Eligibility worked out against the books before anyone is approached",
          "Bank statements, returns and GST filings reconciled to each other",
          "Property valuation and title work handled for secured files",
          "The lender followed until a decision, not until submission",
        ],
        calculator: "emi",
      },
      {
        id: "insurance",
        eyebrow: "DEEP DIVE 02",
        title: "Insurance",
        body: "Two questions decide whether a policy was worth buying, and both are asked before you buy: how much cover, and what is excluded. We size the cover against what would actually have to be replaced or repaid, read the exclusions with you, and keep the claim documentation on our side of the table.",
        points: [
          "Cover sized against liabilities and dependants, not against the premium",
          "Exclusions and waiting periods read out before signing",
          "Renewals tracked so nothing lapses between years",
          "Claim file assembled, submitted and followed by us",
        ],
        calculator: "cover",
      },
    ],
    steps: [
      { no: "01", title: "Read the position", body: "Books, returns, existing borrowings and the credit report. We tell you what is realistic before you spend a month on an application that was never going to clear." },
      { no: "02", title: "Fix what blocks it", body: "The disputed entry on the report, the missing return, the mismatch between the statements and the filings. This is where the time goes, and where the outcome is decided." },
      { no: "03", title: "Build and present the file", body: "Assembled once, properly, and presented to the lenders whose criteria it actually fits rather than to all of them at once." },
      { no: "04", title: "Stay on it", body: "Queries answered the same day, the file chased until there is a decision. Most files that die, die of silence." },
    ],
    faq: [
      {
        q: "Are you a lender?",
        a: "No. Zesst Now is not a lender or an NBFC, does not accept deposits, and does not decide your application. We prepare and present the file to banks and NBFCs — sanction, rate and terms rest entirely with them.",
      },
      {
        q: "Is the EMI figure on this page a quote?",
        a: "No. It is the standard reducing-balance formula every lender uses, run on numbers you type in. It is arithmetic, and it is useful for comparing scenarios — but your actual rate, tenure, processing fee and insurance are set by the lender in the sanction letter, and that letter is the only figure that binds anyone.",
      },
      {
        q: "Why is there no premium calculator?",
        a: "Because a premium cannot honestly be calculated without underwriting — age, medical history, occupation, sum assured and the insurer's own table all move it, and a number produced without them is a guess wearing a decimal point. The tool on this page estimates how much cover is needed, which is the question you can answer before an insurer is involved. The premium comes from the insurer's illustration.",
      },
      {
        q: "What do you charge?",
        a: "A fee for preparing and running the file, agreed in writing before we start. Where an insurer or lender pays a commission on a product, we tell you that it does. What we do not do is take a fee and stay quiet about a commission on the same transaction.",
      },
      {
        q: "My last application was rejected. Is it worth trying again?",
        a: "Often, but not immediately and not at the same lender. A rejection has a reason, and applying again before it is fixed adds another enquiry to your report and makes the next one harder. Let us read the file first — sometimes the fix is six weeks, and sometimes we will tell you it is a year.",
      },
      {
        q: "How long does it really take?",
        a: "Twenty-five to forty-five days from a complete file to disbursement is what we see, and the words doing the work in that sentence are 'complete file'. Getting to complete is usually the longer half, and it is mostly in your hands — documents we ask for, produced quickly.",
      },
    ],
    note: "Zesst Now Services Private Limited facilitates loan and insurance applications and documentation with banks, NBFCs and insurers. We are not a lender or an insurer and do not accept deposits. Sanction, rate, terms, and acceptance of any claim rest entirely with the lending or insuring institution. Insurance is a subject matter of solicitation.",
  },
];

export const process = {
  eyebrow: "HOW WE WORK",
  title: "Four steps, no mystery.",
  sub: "You always know what is being built, what it costs and when it lands.",
  steps: [
    {
      no: "01",
      title: "Discover",
      body: "We map the business, the users and the constraints before anyone opens a design tool. Scope, timeline and price get fixed here — in writing.",
    },
    {
      no: "02",
      title: "Design",
      body: "Direction, then full screens. You see the real thing — typography, motion, states — not a mood board that quietly changes later.",
    },
    {
      no: "03",
      title: "Engineer",
      body: "Built in the open with staging links from week one. Performance, accessibility and SEO are part of the build, not a cleanup phase.",
    },
    {
      no: "04",
      title: "Launch & iterate",
      body: "Deployment, analytics, monitoring and handover — then we keep improving it against real traffic instead of walking away.",
    },
  ],
};

export type Shot = { src: string; alt: string; device: "desktop" | "mobile" };

export type Work = {
  client: string;
  url: string;
  domain: string;
  year: string;
  role: string;
  summary: string;
  /**
   * Real screenshots of the live site, captured with headless Chromium — not
   * mockups. Regenerate with brand/../scripts described in the README.
   */
  shots: Shot[];
  highlights: { label: string; body: string }[];
  tags: string[];
};

// This section is the portfolio the company wants at this domain: everything
// Zesst Now has built, product and client work alike, in one place. New sites,
// CRMs and SaaS get appended here as they ship.
export const portfolio = {
  eyebrow: "PORTFOLIO",
  title: "Everything we've shipped.",
  sub: "Products of our own and work built for clients — live, in production, and still maintained by us. Every screenshot below is the real site, captured from the live domain.",
  items: [
    {
      client: "BizGST Pro",
      url: "https://bizgstpro.com",
      domain: "bizgstpro.com",
      year: "2026",
      role: "Our own product — design, engineering and operations",
      summary:
        "A GST-compliant SaaS ERP for Indian MSMEs, built and run end to end. Twelve modules cover GST invoicing, khata-style ledgers, WhatsApp payment recovery, inventory, expenses, P&L, payroll and GSTR-1/3B summaries — with a read-only CA portal, an in-app AI assistant, row-level tenant isolation and data hosted in Mumbai.",
      shots: [
        { src: "/portfolio/bizgstpro-home-desktop.jpg", alt: "BizGST Pro homepage", device: "desktop" },
        { src: "/portfolio/bizgstpro-modules-desktop.jpg", alt: "The twelve BizGST Pro modules", device: "desktop" },
        { src: "/portfolio/bizgstpro-pricing-desktop.jpg", alt: "BizGST Pro pricing plans", device: "desktop" },
        { src: "/portfolio/bizgstpro-home-mobile.jpg", alt: "BizGST Pro on a phone", device: "mobile" },
      ],
      highlights: [
        { label: "120s", body: "Signup to first GST invoice" },
        { label: "12", body: "Shipped product modules" },
        { label: "₹0", body: "Free tier, no card" },
        { label: "Mumbai", body: "Data stays in India" },
      ],
      tags: ["SaaS", "Multi-tenant", "GST compliance", "AI assistant", "Payments", "Payroll"],
    },
    {
      client: "Adv. Nitin Kumar — Legal Chambers",
      // The live domain is adnitinkumar.in. An earlier version of this file
      // said advnitinkumar.in, which does not resolve — do not "correct" it back.
      url: "https://www.adnitinkumar.in",
      domain: "adnitinkumar.in",
      year: "2025",
      role: "Client work — brand, site, CMS and dues portal",
      summary:
        "A full practice website for a Kaushambi advocate with nine years at the Bar: a cinematic 3D hero, eight practice areas, three service verticals, a custom CMS for legal articles, a client dues lookup, WhatsApp-first lead capture and local SEO for a district where nobody else had bothered.",
      shots: [
        { src: "/portfolio/adnitinkumar-home-desktop.jpg", alt: "Adv. Nitin Kumar homepage", device: "desktop" },
        { src: "/portfolio/adnitinkumar-practice-desktop.jpg", alt: "The eight practice areas", device: "desktop" },
        { src: "/portfolio/adnitinkumar-verticals-desktop.jpg", alt: "GST, insurance and loan service verticals", device: "desktop" },
        { src: "/portfolio/adnitinkumar-home-mobile.jpg", alt: "The practice site on a phone", device: "mobile" },
      ],
      highlights: [
        { label: "8", body: "Practice areas" },
        { label: "3", body: "Service verticals" },
        { label: "Dues", body: "Client lookup portal" },
        { label: "Local", body: "District-level SEO" },
      ],
      tags: ["Next.js", "Custom CMS", "Client portal", "Local SEO", "3D motion", "WhatsApp leads"],
    },
  ] satisfies Work[],
};

export const about = {
  eyebrow: "ABOUT US",
  title: "A studio and a service desk, in the same building.",
  sub: "Zesst Now Services Private Limited was incorporated on 21 February 2025 in Kaushambi, Uttar Pradesh. We are bootstrapped — no outside capital, no board to please, no incentive to sell anyone something they don't need.",
  body: [
    "Most of the businesses around us are stuck in the same place: the paperwork is late, the software is either too expensive or too dumb, and nobody local can build them anything decent. Big-city agencies quote big-city prices and disappear after launch. So the work splits naturally into two halves, and we do both.",
    "One half is engineering. We design and build websites, web apps, AI automations and full SaaS products — and we run our own, BizGST Pro, which serves Indian MSMEs and the CAs who file for them. Operating our own product is the reason we can quote honestly on someone else's: we know what production actually costs after launch, because we pay it every month.",
    "The other half is the compliance and growth desk — GST and income tax filing, loan and insurance facilitation, business registration, lead generation and marketing. It is unglamorous work, and it is the work that decides whether a small business survives the year.",
  ],
  values: [
    {
      title: "Say the real number",
      body: "Scope, timeline and price are fixed in writing before anything is built. If something will take longer, you hear it the week we find out, not at the deadline.",
    },
    {
      title: "No lock-in, anywhere",
      body: "Your code, your data, your accounts, your domain. Everything we build is exportable and handed over. If you want to leave, you leave with all of it.",
    },
    {
      title: "We stay after launch",
      body: "A site that goes live and then rots is a failed project. We monitor, measure and keep improving against real traffic.",
    },
    {
      title: "Built here, on purpose",
      body: "Kaushambi is not a tech hub, and we are not pretending otherwise. It means lower cost, closer contact and a team that answers its own phone.",
    },
  ],
  facts: [
    { label: "Founder & CEO", value: company.founder },
    { label: "Directors", value: company.directors.join(" · ") },
    { label: "Legal advisor", value: company.legalAdvisor },
    { label: "Legal name", value: company.legalName },
    { label: "CIN", value: company.cin },
    { label: "Incorporated", value: company.incorporated },
    { label: "Registered office", value: `${company.registeredOffice.locality}, ${company.registeredOffice.district}, ${company.registeredOffice.state} – ${company.registeredOffice.pin}` },
    { label: "Funding", value: "Bootstrapped" },
  ],
};

export const faq = {
  eyebrow: "QUESTIONS",
  title: "Before you write to us.",
  items: [
    {
      q: "What does a project cost?",
      a: "A marketing site starts in the low tens of thousands of rupees; a web app or a SaaS build is quoted per scope after we understand it. We fix the number in writing before work starts and do not revise it mid-project unless you change the scope — in which case you approve the change first.",
    },
    {
      q: "How long does it take?",
      a: "A focused marketing site is typically three to five weeks from kickoff. Product builds run longer and ship in stages, with a staging link from week one so you are never waiting in the dark.",
    },
    {
      q: "Do you work with clients outside Uttar Pradesh?",
      a: "Yes. Most of the work happens over calls, WhatsApp and shared staging links, and our own product serves customers across India. The compliance desk is where being physically in Kaushambi matters — walk-in GST and ITR work is local.",
    },
    {
      q: "Who owns what you build?",
      a: "You do. Code, design files, domains and accounts are yours and are handed over at the end. We keep nothing hostage and we do not resell your project as a template.",
    },
    {
      q: "Do you actually do the loan and GST work, or just refer it out?",
      a: "The GST and income-tax work is done at our own desk in Manjhanpur, including walk-ins. For loans and insurance we handle sourcing, documentation and follow-up with the bank, NBFC or insurer — we are not a lender and not an underwriter, so approval and terms are always theirs to decide.",
    },
    {
      q: "Can you take over a site someone else built?",
      a: "Often, yes — if we can get access to the code and hosting. Sometimes a rebuild is cheaper than untangling what's there, and we will tell you which one it is rather than billing you for the slower answer.",
    },
  ],
};

export const contact = {
  eyebrow: "START SOMETHING",
  title: "Tell us what you're building.",
  sub: "A short note is enough. We'll come back with what it would take, what it would cost and whether we're the right people for it.",
  cta: "Send on WhatsApp",
  note: "Messages open in WhatsApp with your details filled in — nothing is stored on this site.",
  services: [
    "Website / web app",
    "AI automation",
    "SaaS product build",
    "Mobile / desktop app",
    "Social media automation",
    "Brand identity",
    "GST & tax compliance",
    "Loan facilitation",
    "Business / MSME registration",
    "Leads & marketing",
    "Buy or sell leads",
    "Cognitive Capital Suite — AI sales agent",
    "BizGST Pro enquiry",
    "BizGST Pro — CA partner program",
    "Zesst AI Academy — waitlist",
    "Something else",
  ],
};

export const footer = {
  rights: "All rights reserved.",
  blurb:
    "A bootstrapped product and engineering studio in Kaushambi, Uttar Pradesh — building premium websites, AI automations and software for businesses across India, and running the compliance, funding and marketing desk behind them.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Work", href: "/work" },
        { label: "Blog", href: "/blog" },
        { label: "Announcements", href: "/announcements" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Products",
      links: [
        { label: "BizGST Pro", href: "/products/bizgstpro" },
        { label: "All products", href: "/products" },
        { label: "Zesst AI Academy", href: "/products#roadmap" },
        { label: "bizgstpro.com", href: "https://bizgstpro.com" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Terms of Service", href: "/legal/terms" },
        { label: "Refund Policy", href: "/legal/refunds" },
      ],
    },
  ],
};

/**
 * Legal pages.
 *
 * These are drafted to describe what this site and this company actually do —
 * a static marketing site with no accounts, no tracking and no stored form
 * submissions. They are not a substitute for advice from the company's CA or
 * CS, and should be reviewed before anyone relies on them.
 */
export const legal = {
  updated: "20 August 2026",
  pages: [
    {
      slug: "privacy",
      title: "Privacy Policy",
      intro:
        "This policy covers www.cognitivecapitalsuite.com, the website of Zesst Now Services Private Limited. It does not cover BizGST Pro, which is a separate product with its own policy at bizgstpro.com.",
      sections: [
        {
          heading: "What this site collects",
          body: [
            "Nothing that identifies you. This site has no accounts, no login, no advertising pixels and no third-party analytics. We do not set cookies for tracking.",
            "The contact form on this site does not submit anywhere. It assembles the details you type into a WhatsApp message and opens WhatsApp with that message ready to send. Until you press send in WhatsApp, nothing leaves your device — and this site never receives or stores it.",
          ],
        },
        {
          heading: "What happens when you contact us",
          body: [
            "If you send us a message on WhatsApp, email us, or call, we hold what you send in order to reply to you and to deliver any service you engage us for. That includes your name, contact details and whatever you choose to tell us about your business.",
            "We do not sell your details, and we do not share them with anyone except where it is necessary to deliver a service you asked for — for example, submitting a loan application to the bank you asked us to approach, or filing a return with the GST or Income Tax department on your instruction.",
          ],
        },
        {
          heading: "Hosting and logs",
          body: [
            "This site is hosted on Vercel. Like any web host, their infrastructure processes the network requests needed to serve the page, which can include your IP address. We do not have an analytics dashboard attached to this site and do not build profiles from that traffic.",
          ],
        },
        {
          heading: "Retention and your rights",
          body: [
            "Where we hold records because you engaged us for compliance work, we keep them for as long as the relevant law requires and no longer than we need to.",
            "You can ask us what we hold about you, ask for it to be corrected, or ask us to delete it where we are not required to keep it. Write to " + company.email + " and we will respond.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `${company.legalName}, CIN ${company.cin}. ${company.registeredOffice.line1}, ${company.registeredOffice.line2}, ${company.registeredOffice.district}, ${company.registeredOffice.state} – ${company.registeredOffice.pin}, India. Email ${company.email}.`,
          ],
        },
      ],
    },
    {
      slug: "terms",
      title: "Terms of Service",
      intro:
        "These terms govern your use of this website. Services we deliver are governed by the individual written proposal or engagement letter for that work, which takes precedence over anything here.",
      sections: [
        {
          heading: "About this site",
          body: [
            "This is the marketing website of Zesst Now Services Private Limited. The content describes our services and our work. It is provided for information, and it is not an offer capable of acceptance or a guarantee of a particular result.",
          ],
        },
        {
          heading: "Engagements",
          body: [
            "Work begins only under a written scope that sets out what will be delivered, by when and at what price. Changes to that scope are agreed in writing before they are built.",
            "Ownership of deliverables passes to the client on full payment. We retain the right to describe the work publicly and to show it in this portfolio unless the engagement says otherwise.",
          ],
        },
        {
          heading: "Financial and compliance services",
          body: [
            "For loan and insurance work we act as a facilitator: we assist with sourcing, documentation and follow-up. We are not a lender, we do not accept deposits, and we do not underwrite insurance. Sanction, rejection, interest rate, premium and all terms rest with the bank, NBFC or insurer concerned.",
            "For tax and GST work, filings are prepared from the information and documents you provide. You remain responsible for the accuracy and completeness of what you give us, and statutory liability for a return remains with the taxpayer.",
          ],
        },
        {
          heading: "Third-party links",
          body: [
            "This site links to sites we do not control, including our own product at bizgstpro.com and client sites. We are not responsible for their content or their policies.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "To the extent permitted by law, our liability arising out of any engagement is limited to the fees paid to us for that engagement. We are not liable for indirect or consequential loss.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms are governed by the laws of India. Courts at Kaushambi, Uttar Pradesh have jurisdiction.",
          ],
        },
      ],
    },
    {
      slug: "refunds",
      title: "Refund & Cancellation Policy",
      intro:
        "This policy covers services engaged directly with Zesst Now Services Private Limited. BizGST Pro subscriptions are covered by the refund policy published at bizgstpro.com.",
      sections: [
        {
          heading: "Project work",
          body: [
            "Design and engineering projects are billed in stages against an agreed scope. If you cancel mid-project, you pay for the stages completed and any work in progress at the point of cancellation; anything you have paid beyond that is refunded.",
            "Deposits paid to reserve delivery capacity are refundable if you cancel before we begin work, less any costs already committed on your behalf, such as domains, licences or third-party services.",
          ],
        },
        {
          heading: "Compliance and filing services",
          body: [
            "Fees for a filing or registration become non-refundable once the filing has been submitted to the relevant department, because the work and any government fee have already been spent. If we have not yet filed, the fee is refundable less any government charge already paid.",
            "Government fees, statutory charges and third-party costs are never refundable once paid to the authority concerned.",
          ],
        },
        {
          heading: "Loan and insurance facilitation",
          body: [
            "Because approval rests with the lender or insurer, our fee covers the work of preparing and pursuing the application — not a particular outcome. Where a service fee is charged and we have not carried out the work, it is refunded in full.",
          ],
        },
        {
          heading: "How to request a refund",
          body: [
            `Write to ${company.email} or message ${company.phone} with your invoice reference and what you are asking for. We respond within three working days, and approved refunds are returned to the original payment method within seven to ten working days.`,
          ],
        },
      ],
    },
  ],
};
