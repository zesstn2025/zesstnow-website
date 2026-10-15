/**
 * The company's own registration documents, published so a prospective client
 * can check who they are dealing with without having to ask.
 *
 * Provenance — every number below is read off the document in
 * `public/documents/`, not from memory. Where a government portal lets anyone
 * verify the number independently, `verifyUrl` points at that portal rather
 * than at our own copy, because a certificate anybody can forge in an
 * afternoon proves nothing; a registry lookup does.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * The SPICe+ DIN approval letter is not published and should not be. It
 * carries the director's date of birth, father's name and full residential
 * address on one page — the exact combination used for identity fraud in
 * India. The DIN number itself was listed among the identifiers below for one
 * commit and was removed at the owner's instruction: it identifies a person,
 * not the company, and nothing here needs it.
 *
 * Documents are being re-issued as the company's details are updated. When a
 * newer copy arrives, replace the file in `public/documents/` under the same
 * name and update `issued` here — the page needs no other change.
 */

export type CompanyDocument = {
  /** Stable id, also the anchor on the page. */
  id: string;
  /** What the document is called by the authority that issued it. */
  name: string;
  /** The one line that says why a client should care. */
  what: string;
  /** Label for the identifying number, e.g. "CIN". */
  idLabel: string;
  idValue: string;
  authority: string;
  issued: string;
  /** Path under /public. */
  file: string;
  /** "pdf" | "image" — decides the link label only. */
  kind: "pdf" | "image";
  /** Where anyone can verify the number themselves. */
  verifyUrl?: string;
  verifyLabel?: string;
};

export const documents: CompanyDocument[] = [
  {
    id: "incorporation",
    name: "Certificate of Incorporation",
    what:
      "The company legally exists. Issued by the Registrar of Companies under the Companies Act, 2013, and the document every other registration below is built on.",
    idLabel: "CIN",
    idValue: "U47110UP2025PTC217212",
    authority: "Ministry of Corporate Affairs — Registrar of Companies, CRC",
    issued: "21 February 2025",
    file: "/documents/certificate-of-incorporation.pdf",
    kind: "pdf",
    verifyUrl: "https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do",
    verifyLabel: "Check this CIN on the MCA register",
  },
  {
    id: "pan",
    name: "Company PAN",
    what:
      "The company's permanent account number with the Income Tax Department. It appears on every invoice we raise.",
    idLabel: "PAN",
    idValue: "AACCZ5676Q",
    authority: "Income Tax Department",
    issued: "21 February 2025",
    file: "/documents/pan-card.jpg",
    kind: "image",
  },
  {
    id: "tan",
    name: "TAN Allotment Letter",
    what:
      "The account number through which the company deducts and deposits TDS. It is what lets us deduct tax correctly on payments we make to vendors and contractors.",
    idLabel: "TAN",
    idValue: "ALDZ00501E",
    authority: "Income Tax Department",
    issued: "24 February 2025",
    file: "/documents/tan-allotment-letter.pdf",
    kind: "pdf",
  },
  {
    id: "gst",
    name: "GST Registration Certificate",
    what:
      "The company is registered for GST as a regular taxpayer, so you get a proper tax invoice and can claim input credit on what you pay us.",
    idLabel: "GSTIN",
    idValue: "09AACCZ5676Q1Z8",
    authority: "Goods and Services Tax Network — Kaushambi Sector, Uttar Pradesh",
    issued: "22 March 2025",
    file: "/documents/gst-registration-certificate.pdf",
    kind: "pdf",
    verifyUrl: "https://services.gst.gov.in/services/searchtp",
    verifyLabel: "Check this GSTIN on the GST portal",
  },
  {
    id: "startup-india",
    name: "Startup India Recognition (DPIIT)",
    what:
      "Recognised as a startup by the Department for Promotion of Industry and Internal Trade, in the Professional & Commercial Services industry. Valid to 20 February 2035.",
    idLabel: "DPIIT",
    idValue: "DIPP199952",
    authority: "Dept. for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry",
    issued: "16 April 2025",
    file: "/documents/startup-india-dpiit-recognition.pdf",
    kind: "pdf",
    verifyUrl: "https://www.startupindia.gov.in/content/sih/en/search.html",
    verifyLabel: "Look the company up on Startup India",
  },
  {
    id: "udyam",
    name: "Udyam Registration (MSME)",
    what:
      "Registered as a micro enterprise with the Ministry of MSME — the registration that makes the company eligible for the MSME delayed-payment protections.",
    idLabel: "Udyam",
    idValue: "UDYAM-UP-46-0015392",
    authority: "Ministry of Micro, Small and Medium Enterprises",
    issued: "24 March 2025",
    file: "/documents/udyam-msme-certificate.pdf",
    kind: "pdf",
    verifyUrl: "https://udyamregistration.gov.in/Udyam_Verify.aspx",
    verifyLabel: "Verify this Udyam number",
  },
  {
    id: "esic",
    name: "ESIC Registration",
    what:
      "Registered with the Employees' State Insurance Corporation, which is what brings employees under the ESI Act, 1948.",
    idLabel: "ESIC code",
    idValue: "21000983730000999",
    authority: "Employees' State Insurance Corporation — Regional Office, Kanpur",
    issued: "21 February 2025",
    file: "/documents/esic-registration.pdf",
    kind: "pdf",
  },
  {
    id: "moa",
    name: "Memorandum of Association (INC-33)",
    what:
      "The company's charter — the objects it was incorporated to pursue and the share capital it was formed with. Filed with the Registrar at incorporation.",
    idLabel: "Form",
    idValue: "INC-33",
    authority: "Ministry of Corporate Affairs",
    issued: "21 February 2025",
    file: "/documents/memorandum-of-association.pdf",
    kind: "pdf",
  },
  {
    id: "aoa",
    name: "Articles of Association (INC-34)",
    what:
      "The internal rulebook — how shares are issued and transferred, how directors are appointed, how meetings run. Table F of the Companies Act, 2013.",
    idLabel: "Form",
    idValue: "INC-34",
    authority: "Ministry of Corporate Affairs",
    issued: "21 February 2025",
    file: "/documents/articles-of-association.pdf",
    kind: "pdf",
  },
];

/**
 * The company's registration numbers, for anyone checking us against a
 * government portal.
 *
 * COMPANY IDENTIFIERS ONLY. The director's DIN was listed here briefly and was
 * removed at the owner's instruction. It is a person's identifier rather than
 * the company's, and nothing on this page needs it — do not add it back.
 */
export const identifiers = [
  { label: "CIN", value: "U47110UP2025PTC217212" },
  { label: "GSTIN", value: "09AACCZ5676Q1Z8" },
  { label: "PAN", value: "AACCZ5676Q" },
  { label: "TAN", value: "ALDZ00501E" },
  { label: "Udyam", value: "UDYAM-UP-46-0015392" },
  { label: "DPIIT", value: "DIPP199952" },
  { label: "ESIC", value: "21000983730000999" },
];
