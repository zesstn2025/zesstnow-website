/**
 * Everything that is not a service: the hero, the proof, the about page, the
 * questions people actually ask, and the legal pages.
 */

import { company } from "./company";

export const nav = [
  { href: "/", label: "होम" },
  { href: "/services", label: "सेवाएँ" },
  { href: "/about", label: "हमारे बारे में" },
  { href: "/contact", label: "संपर्क" },
];

export const hero = {
  /* The single most important line on the site. It should answer "what is this
     and is it near me" before the visitor scrolls. Naming the town beats any
     adjective — it is what the visitor is checking for. */
  heading: "CONFIRM: क्या काम, किस क़स्बे में",
  sub: "CONFIRM: एक वाक्य — किसके लिए, और क्यों यहीं",
  primary: { label: "अभी कॉल करें", href: `tel:+91${company.phone}` },
  secondary: { label: "WhatsApp पर पूछें", href: "" }, // filled by the component
};

/**
 * Real photographs of the actual shop, staff and work. Never stock images.
 * A visitor from two streets away can tell, and the moment they can, the site
 * stops being proof of anything.
 *
 * Files go in public/gallery/. Six to twelve is plenty. Every one needs alt
 * text — it is what a screen reader and Google both read.
 */
export const gallery: { src: string; alt: string }[] = [];

/**
 * Optional, and only if genuine. One real line from a named customer beats six
 * invented ones, and an invented review on a small-town site is recognised
 * immediately by exactly the people it was meant to convince.
 */
export const testimonials: { quote: string; name: string; place?: string }[] = [];

export const about = {
  heading: "CONFIRM: शीर्षक",
  /* Two or three paragraphs. When it started, who runs it, what changed. A
     person's name and a year do more work here than any amount of prose about
     commitment to quality. */
  body: ["CONFIRM", "CONFIRM"],
};

/**
 * The questions the client is actually asked at the counter every week. Ask
 * them for these — do not invent generic ones. Answering the real question is
 * what saves the phone call, and saving the phone call is what the client is
 * paying for.
 */
export const faq: { q: string; a: string }[] = [
  { q: "CONFIRM: क्या समय खुलते हैं?", a: company.hours },
  { q: "CONFIRM", a: "CONFIRM" },
];

export const contact = {
  heading: "पूछताछ करें",
  sub: "फ़ॉर्म भर दीजिए, या सीधे कॉल/WhatsApp कर लीजिए।",
  /* What the customer is told after the form submits. It must say what happens
     next and roughly when, because a bare "धन्यवाद" leaves them wondering
     whether anything was sent at all. */
  thanks: "मिल गया। हम जल्द ही आपसे संपर्क करेंगे।",
};

export const legal = [
  {
    slug: "privacy",
    title: "निजता नीति",
    body: [
      `${company.name} इस साइट पर सिर्फ़ वही जानकारी लेता है जो आप पूछताछ फ़ॉर्म में ख़ुद भरते हैं — नाम, फ़ोन नंबर और आपका संदेश।`,
      "यह जानकारी सिर्फ़ आपकी पूछताछ का जवाब देने के लिए इस्तेमाल होती है। इसे किसी को बेचा या साझा नहीं किया जाता।",
      "हटवाना चाहें तो नीचे दिए नंबर पर बता दीजिए, हटा दी जाएगी।",
    ],
  },
  {
    slug: "terms",
    title: "शर्तें",
    body: [
      "इस साइट पर दी गई जानकारी सामान्य जानकारी के लिए है। दाम, उपलब्धता और समय बिना सूचना बदल सकते हैं।",
      "पक्की जानकारी के लिए कृपया कॉल करके पुष्टि कर लें।",
    ],
  },
];

export const footer = {
  note: `© ${new Date().getFullYear()} ${company.name}`,
};
