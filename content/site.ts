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
  email: "support@bizgstpro.com",
  phone: "+91 77538 98481",
  phoneE164: "917753898481",
  hours: "Mon–Sat, 10 AM – 7 PM IST",
  instagram: "zesstnowai",
  instagramUrl: "https://instagram.com/zesstnowai",
  // This site ships on cognitivecapitalsuite.com — the company's own domain,
  // which doubles as its portfolio. The www host is the canonical one; Vercel
  // 308s the apex to it, so canonical URLs, OG and sitemap.xml must name www
  // or they all point at a redirect.
  domain: "www.cognitivecapitalsuite.com",
};

export const nav = [
  { label: "Services", href: "/#services" },
  { label: "Products", href: "/#products" },
  { label: "Process", href: "/#process" },
  { label: "Portfolio", href: "/#portfolio" },
];

export const ticker = [
  `CIN ${company.cin}`,
  "Incorporated 2025",
  "Kaushambi · Uttar Pradesh",
  "Websites · AI Automations · SaaS",
  "Data hosted in India",
  "Bootstrapped, no outside capital",
];

export const hero = {
  eyebrow: "ESTD 2025 · KAUSHAMBI, UTTAR PRADESH",
  titleLead: "We build digital products",
  titleEm: "businesses actually run on.",
  sub: "Zesst Now Services Private Limited designs and engineers premium websites, AI automations and SaaS products — from the first pixel to production traffic. We ship our own software too, so we know what production actually costs.",
  primaryCta: { label: "See our products", href: "/#products" },
  secondaryCta: { label: "Start a project", href: "/#contact" },
  stats: [
    { value: "12", label: "Modules shipped in BizGST Pro" },
    { value: "₹0", label: "Where our SaaS starts" },
    { value: "100%", label: "Built in-house" },
  ],
};

export const services = {
  eyebrow: "WHAT WE DO",
  title: "Four disciplines, one team.",
  sub: "No handoffs between agencies. Strategy, design and engineering sit in the same room.",
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
      title: "Brand Identity",
      body: "Naming, logo systems, type and colour — a design language that makes a young company look like the obvious choice.",
      points: ["Naming", "Logo systems", "Design language", "Collateral"],
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
  url: string;
  status: "Live" | "In development";
  accent: "violet" | "cyan";
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
];

export const productsSection = {
  eyebrow: "OUR PRODUCTS",
  title: "We don't just build for clients.",
  sub: "Products of our own, engineered and operated in-house — which is why we know what production actually costs.",
};

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

// This section is the portfolio the company wants at this domain: everything
// Zesst Now has built, product and client work alike, in one place. New sites,
// CRMs and SaaS get appended here as they ship.
export const portfolio = {
  eyebrow: "PORTFOLIO",
  title: "Everything we've shipped.",
  sub: "Products of our own and work built for clients — live, in production, and still maintained by us. The list grows as we ship.",
  items: [
    {
      client: "BizGST Pro",
      url: "https://bizgstpro.com",
      domain: "bizgstpro.com",
      year: "2026",
      body: "Our own SaaS ERP, built and operated end to end: twelve modules covering GST invoicing, ledgers, inventory, expenses, payroll and returns, with a read-only CA portal, an in-app AI assistant, row-level tenant isolation and data hosted in Mumbai.",
      tags: ["SaaS", "Multi-tenant", "GST compliance", "AI assistant", "Payments"],
    },
    {
      client: "Adv. Nitin Kumar — Legal Chambers",
      url: "https://advnitinkumar.in",
      domain: "advnitinkumar.in",
      year: "2025",
      body: "A full practice website for an advocate in Kaushambi: custom CMS for legal articles, a client dues lookup, lead capture into an admin dashboard, and local SEO built for a district where nobody else had bothered.",
      tags: ["Next.js", "Supabase", "Custom CMS", "Local SEO", "3D motion"],
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
    "Brand identity",
    "BizGST Pro enquiry",
    "BizGST Pro — CA partner program",
    "Something else",
  ],
};

export const footer = {
  blurb:
    "A bootstrapped product and engineering studio in Kaushambi, Uttar Pradesh — building premium websites, AI automations and software for businesses across India.",
};
