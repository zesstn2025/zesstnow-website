/**
 * What the client sells. Each entry becomes a card on the home page and its own
 * page at /services/<slug>.
 *
 * Write these in the words the client's customers use, not the client's own
 * trade vocabulary. A tailor says "फ़ॉल-पिको"; a customer searches "सिलाई"।
 * The site is for the second person.
 *
 * Three to six services is the right number. More than six and the home page
 * stops making a case and starts reading as a list, which is the single most
 * common way these sites fail — the visitor cannot tell what the shop is
 * actually known for.
 */

export type Service = {
  slug: string;
  title: string;
  /** One sentence on the card. Under about 90 characters or it wraps badly. */
  blurb: string;
  /** Two short paragraphs on the service's own page. */
  body: string[];
  /** Four to six. Concrete things, not adjectives. */
  points: string[];
  /**
   * Optional. "₹500 से" or "मौक़े पर बताया जाएगा". Leave empty if the client
   * does not want a number — an empty string hides the line, and a wrong
   * number on a website is an argument at the counter later.
   */
  price?: string;
};

export const services: Service[] = [
  {
    slug: "CONFIRM-service-one",
    title: "CONFIRM: पहली सेवा",
    blurb: "CONFIRM: एक वाक्य में, ग्राहक की भाषा में",
    body: [
      "CONFIRM: यह सेवा किसके लिए है और कब चाहिए होती है।",
      "CONFIRM: क्लाइंट इसे कैसे करता है, और उससे ग्राहक को क्या फ़र्क़ पड़ता है।",
    ],
    points: ["CONFIRM", "CONFIRM", "CONFIRM", "CONFIRM"],
    price: "",
  },
];

/**
 * Why this shop and not the next one. Three items, and every one has to be
 * something a competitor could not honestly print too — "अच्छी सेवा" is not
 * one. Years in business, a guarantee, home delivery, a language spoken, an
 * actual name behind the counter: those are.
 */
export const why: { title: string; text: string }[] = [
  { title: "CONFIRM", text: "CONFIRM" },
  { title: "CONFIRM", text: "CONFIRM" },
  { title: "CONFIRM", text: "CONFIRM" },
];
