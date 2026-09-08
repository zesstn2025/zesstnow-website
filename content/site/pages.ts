/**
 * Copy for the pages that are not services or products: home, work, about,
 * FAQ, contact, footer, legal, and the navigation and ticker that frame them.
 */

import { company } from "./company";
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
