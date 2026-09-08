/**
 * Who the company is: registration facts, the people, the accounts it posts from.
 *
 * Provenance — company registration facts come from MCA records; contact
 * details from bizgstpro.com/contact, the company's published channel.
 *
 * The social URLs are numeric-id links read off the pages these accounts
 * actually administer, not guessed slugs. A profile left with an empty `url`
 * is skipped by the renderer rather than published as a dead link.
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
