/**
 * What the company sells, in summary form: the service list, the reasons to
 * choose it, and the verticals it works across.
 *
 * The long per-service page copy lives in ./service-pages, which is several
 * times this size — keep them apart so editing a headline here does not mean
 * loading all of it.
 */

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
