/**
 * The full copy of every individual service page.
 *
 * The largest block of text on the site, and the one least often edited. It is
 * its own module for exactly that reason: nothing else should have to be read
 * alongside it.
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
