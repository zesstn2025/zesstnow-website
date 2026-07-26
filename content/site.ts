/**
 * SINGLE SOURCE OF TRUTH FOR ALL SITE COPY.
 *
 * Nothing in components/ hardcodes user-facing text — edit it here and the whole
 * site updates.
 *
 * Lines marked `CONFIRM:` are drafted copy that has NOT been verified against the
 * real product. Replace them with the real thing before this site goes public.
 */

export const company = {
  legalName: "Zesst Now Services Private Limited",
  shortName: "Zesst Now",
  wordmark: "ZESST NOW",
  // Verified — the company's own self-description, taken from its production code.
  tagline:
    "We craft world-class premium websites, AI automations, brand identities & digital experiences.",
  // Verified against MCA records.
  cin: "U47110UP2025PTC217212",
  incorporated: "21 February 2025",
  registeredOffice: {
    locality: "Manjhanpur",
    district: "Kaushambi",
    state: "Uttar Pradesh",
    pin: "212207",
    country: "India",
  },
  // CONFIRM: no company-owned email/phone was available. This number belongs to
  // Adv. Nitin Kumar and is used here only as a working placeholder.
  email: "hello@zesstnow.com",
  phone: "+91 98893 74344",
  phoneE164: "919889374344",
  domain: "zesstnow.com", // CONFIRM: final deployment domain
};

export const nav = [
  { label: "Services", href: "/#services" },
  { label: "Products", href: "/#products" },
  { label: "Process", href: "/#process" },
  { label: "Work", href: "/#work" },
];

export const ticker = [
  `CIN ${company.cin}`,
  "Incorporated 2025",
  "Kaushambi · Uttar Pradesh",
  "Websites · AI Automations · SaaS",
  "Now taking projects for Q3",
];

export const hero = {
  eyebrow: "ESTD 2025 · KAUSHAMBI, UTTAR PRADESH",
  titleLead: "We build digital products",
  titleEm: "businesses actually run on.",
  sub: "Zesst Now Services Private Limited designs and engineers premium websites, AI automations and SaaS products — from the first pixel to production traffic.",
  primaryCta: { label: "See our products", href: "/#products" },
  secondaryCta: { label: "Start a project", href: "/#contact" },
  stats: [
    { value: "2", label: "Products shipped" },
    { value: "100%", label: "Built in-house" },
    { value: "2025", label: "Incorporated" },
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
      body: "Full SaaS builds end to end — architecture, backend, auth, billing, admin, deployment and the monitoring that keeps it up at 2am.",
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
  faq: { q: string; a: string }[];
};

export const products: Product[] = [
  {
    slug: "bizgstpro",
    name: "BizGSTPro",
    domain: "bizgstpro.com",
    url: "https://bizgstpro.com",
    status: "Live",
    accent: "violet",
    kicker: "GST COMPLIANCE SUITE",
    headline: "GST filing without the spreadsheet graveyard.",
    // CONFIRM: entire product description below is drafted from the product's
    // name and category — bizgstpro.com was unreachable from the build sandbox.
    sub: "BizGSTPro pulls invoices, returns, reconciliation and client management into one workspace — so a practice can file for a hundred GSTINs without losing a night to it.",
    audience:
      "Built for chartered accountants, tax practitioners, GST Suvidha Kendras and the finance teams that file their own returns.",
    features: [
      {
        title: "Returns, filed in order",
        body: "GSTR-1 and GSTR-3B prepared from your own invoice data, validated before submission so portal rejections stop being a monthly ritual.",
      },
      {
        title: "Invoicing & e-invoicing",
        body: "Generate compliant tax invoices, credit and debit notes, with IRN and e-way bill handling built into the same flow.",
      },
      {
        title: "ITC reconciliation",
        body: "Match purchase registers against GSTR-2B automatically. Mismatches surface as a worklist, not as a 4,000-row export.",
      },
      {
        title: "Multi-GSTIN client desk",
        body: "Every client, every GSTIN, every filing status on one board — with role-based access for the staff doing the work.",
      },
      {
        title: "Deadlines that chase you",
        body: "Automated reminders by client and return type, so a late fee is a decision rather than an accident.",
      },
      {
        title: "Audit-ready history",
        body: "Complete filing history, challans and acknowledgements retained and exportable whenever a notice arrives.",
      },
    ],
    steps: [
      { title: "Connect", body: "Add your GSTINs and import existing invoice data or billing exports." },
      { title: "Reconcile", body: "The suite matches purchases to GSTR-2B and flags only what actually needs a human." },
      { title: "File", body: "Review the prepared return, validate, and submit — with the acknowledgement stored automatically." },
      { title: "Report", body: "Hand clients a clean monthly summary instead of a screenshot of the portal." },
    ],
    faq: [
      {
        q: "Who is BizGSTPro for?",
        a: "Practices and businesses that file GST returns regularly — CAs, tax consultants, GST Suvidha Kendras, and in-house finance teams managing more than one GSTIN.",
      },
      {
        q: "Does it replace the GST portal?",
        a: "No. It prepares, validates and organises everything around your filings so the time spent on the portal itself is short and predictable.",
      },
      {
        q: "Can multiple staff use one account?",
        a: "Yes — client work is assigned and access is role-based, so juniors can prepare while a partner reviews and files.",
      },
    ],
  },
  {
    slug: "cognitive-capital-suite",
    name: "Cognitive Capital Suite",
    domain: "cognitivecapitalsuite.com",
    url: "https://cognitivecapitalsuite.com",
    status: "In development",
    accent: "cyan",
    kicker: "AI FINANCIAL INTELLIGENCE",
    headline: "Your books, finally able to answer questions.",
    // CONFIRM: cognitivecapitalsuite.com is a domain Zesst Now owns. Positioning
    // below is a proposal, not confirmed product scope.
    sub: "Cognitive Capital Suite reads the financial documents a business already produces and turns them into cash-flow visibility, credit readiness and reporting that writes itself.",
    audience:
      "For SMEs, lenders and advisors who need a straight answer about a business's financial position without waiting on a month-end close.",
    features: [
      {
        title: "Document intelligence",
        body: "Bank statements, invoices, GST returns and financials parsed into structured, queryable data — no manual entry.",
      },
      {
        title: "Cash-flow visibility",
        body: "Where the money actually goes, month over month, with working-capital pressure visible before it becomes a problem.",
      },
      {
        title: "Credit readiness",
        body: "A clear read on how a lender will see the business, and exactly which numbers to fix before applying.",
      },
      {
        title: "Reporting on autopilot",
        body: "MIS packs generated on schedule and delivered to the people who need them, in the format they already expect.",
      },
    ],
    steps: [
      { title: "Ingest", body: "Upload statements and filings, or connect the sources directly." },
      { title: "Understand", body: "The suite extracts, classifies and cross-checks every line it reads." },
      { title: "Surface", body: "Cash flow, ratios and risk signals presented as decisions, not dashboards for their own sake." },
      { title: "Deliver", body: "Scheduled reports to owners, advisors and lenders — automatically." },
    ],
    faq: [
      {
        q: "Is Cognitive Capital Suite available today?",
        a: "It is in active development. Early-access conversations are open — get in touch and we'll walk you through where it stands.",
      },
      {
        q: "Does it work alongside BizGSTPro?",
        a: "Yes. GST data captured in BizGSTPro feeds straight into the financial picture, so compliance and intelligence share one source of truth.",
      },
    ],
  },
];

export const productsSection = {
  eyebrow: "OUR PRODUCTS",
  title: "We don't just build for clients.",
  sub: "Two products of our own, engineered and operated in-house — which is why we know what production actually costs.",
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

export const work = {
  eyebrow: "SELECTED WORK",
  title: "Shipped, live, in production.",
  sub: "A short list, honestly kept. Every entry below is a site we built and still maintain.",
  items: [
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
    "BizGSTPro enquiry",
    "Cognitive Capital Suite — early access",
    "Something else",
  ],
};

export const footer = {
  blurb:
    "A product and engineering studio in Kaushambi, Uttar Pradesh — building premium websites, AI automations and software for businesses across India.",
};
