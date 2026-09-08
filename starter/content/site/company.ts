/**
 * Who the client is, and every way a customer can reach them.
 *
 * Fill this from what the client actually tells you, not from their Google
 * listing — the listing is frequently a few years stale, and the first time a
 * customer is sent to a closed shop or a dead number is the last time the
 * client trusts the site.
 *
 * Anything still marked CONFIRM has not been checked with the client. The
 * build prints a warning for each one; do not launch with any left.
 */

export const company = {
  /** Shown in the browser tab, the header, and structured data. */
  name: "CONFIRM: व्यवसाय का नाम",
  /** One line, under the name. What they do and where. Not a slogan. */
  tagline: "CONFIRM: क्या काम, किस इलाक़े में",

  /* ── reaching them ───────────────────────────────────────────────────── */
  /* Ten digits, no +91 and no spaces. The code adds the country code where it
     is needed and would otherwise produce a broken tel: or wa.me link. */
  phone: "CONFIRM",
  /** Usually the same as `phone`. Leave empty to hide the WhatsApp button. */
  whatsapp: "CONFIRM",
  /** Empty is fine — many shops have no email, and the form still works. */
  email: "",

  address: {
    line: "CONFIRM: दुकान/ऑफ़िस का पता",
    town: "CONFIRM",
    district: "CONFIRM",
    state: "Uttar Pradesh",
    pin: "CONFIRM",
    /** Paste the "Share → Copy link" URL from Google Maps. */
    mapUrl: "",
  },

  /** Shown as written. "सोमवार–शनिवार, सुबह 10 – रात 8" reads better than a table. */
  hours: "CONFIRM: खुलने का समय",

  /** Optional. Printed small in the footer where the client has one. */
  gstin: "",

  /* ── accounts ────────────────────────────────────────────────────────── */
  /* A profile with an empty url is skipped rather than published as a dead
     link. Leave what they do not have empty; do not guess a handle. */
  social: [
    { network: "Facebook", url: "" },
    { network: "Instagram", url: "" },
    { network: "YouTube", url: "" },
  ],

  /* ── who built it ────────────────────────────────────────────────────── */
  /* Every site carries one quiet line in the footer. Over a year of client
     sites this is the cheapest lead source the company has. */
  builtBy: {
    name: "Zesst Now Services Private Limited",
    url: "https://www.cognitivecapitalsuite.com",
  },
};
/* Deliberately not `as const`. With it, TypeScript narrows `phone` to the
   literal string in this file, and the moment a real number is filled in the
   guards elsewhere (`whatsapp !== "CONFIRM"`) become comparisons between two
   types that cannot overlap — a build error in generated client sites, caught
   the first time this starter was actually used. */
