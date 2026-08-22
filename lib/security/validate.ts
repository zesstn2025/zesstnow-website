/**
 * Validation and normalisation for everything the enquiry form sends.
 *
 * ── On SQL injection ─────────────────────────────────────────────────
 * There is no SQL here, and no database of any kind: the endpoint composes an
 * email and a WhatsApp message and keeps nothing. Not having a query to inject
 * into is a stronger guarantee than any amount of escaping, and it is worth
 * stating plainly rather than shipping a filter that pretends to defend against
 * a surface that does not exist. Blocklists of words like SELECT and DROP are
 * worse than nothing — they reject people called O'Brien and stop no attacker.
 *
 * The injection risks that ARE real for this endpoint, and what handles each:
 *
 *   Email header injection — a newline in a name or subject can add a header
 *     and turn the form into an open relay. Every single-line field has its
 *     control characters stripped before it goes anywhere near a header.
 *   HTML/script injection into the notification email — the recipient's mail
 *     client renders HTML. Escaped at the point of rendering, in
 *     lib/notify/email.ts, which is the only place that builds markup.
 *   Resource exhaustion — an unbounded brief is a way to make the server do
 *     work. Every field is capped by length, and the request body by size.
 *
 * Normalisation happens before validation. Unicode has several ways to write
 * the same string, and a check that runs on one form while the mailer uses
 * another is a check that can be walked around.
 */

export type Cleaned = {
  name: string;
  phone: string;
  service: string;
  message: string;
  email: string;
  company: string;
  source: string;
};

/**
 * C0 and C1 control characters, plus the Unicode bidirectional overrides.
 *
 * Written as escapes rather than as literals so the pattern survives being
 * read, copied and diffed. A control character pasted into source is
 * invisible, and an invisible character in a security filter is a filter
 * nobody can review.
 */
const CONTROL =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * A single-line field: normalised, stripped of control characters and bidi
 * overrides, collapsed, trimmed and capped.
 *
 * The bidi characters matter more than they look. They reorder how text is
 * displayed without changing what it contains, so a name can be made to render
 * as something quite different in the notification the desk reads. There is no
 * legitimate use for one in a name or a phone number.
 */
function line(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(CONTROL, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** A multi-line field: keeps paragraph breaks, drops everything else. */
function block(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(CONTROL, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

/**
 * Deliberately permissive: one @, something either side, a dot in the domain.
 *
 * A stricter pattern is a liability rather than an improvement — the addresses
 * a full RFC 5321 grammar allows are strange enough that most "proper" regexes
 * reject valid mail, and the only consequence of a bad address here is that a
 * reply bounces. The field is optional for exactly that reason.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digits, spaces and the punctuation phone numbers are actually written with. */
const PHONE_ALLOWED = /^[\d\s+()\-.]+$/;

export function clean(input: Record<string, unknown>): Cleaned {
  return {
    name: line(input.name, 120),
    phone: line(input.phone, 40),
    service: line(input.service, 120),
    message: block(input.message, 4000),
    email: line(input.email, 160),
    company: line(input.company, 160),
    // Only ever used to say which page the enquiry came from. Anything that is
    // not a same-site path is discarded rather than repeated back.
    source: /^\/[\w\-/.]{0,199}$/.test(line(input.source, 200)) ? line(input.source, 200) : "/",
  };
}

/**
 * Returns one message for the visitor, or null when the enquiry is usable.
 *
 * One message, not a list, and always about what they should do next. An error
 * that enumerates which internal checks failed is a description of the
 * validator, and a validator described is a validator mapped.
 */
export function validate(v: Cleaned): string | null {
  if (!v.name || !v.phone || !v.service || !v.message) {
    return "Name, phone, service and a short brief are required.";
  }
  if (v.name.length < 2) return "Please give a name we can address you by.";

  const digits = v.phone.replace(/\D/g, "");
  if (!PHONE_ALLOWED.test(v.phone) || digits.length < 7 || digits.length > 15) {
    return "That phone number does not look right — include the country code.";
  }
  if (v.email && !EMAIL.test(v.email)) {
    return "That email address does not look right.";
  }
  if (v.message.length < 10) {
    return "Tell us a little more — a sentence or two about the project.";
  }
  return null;
}
