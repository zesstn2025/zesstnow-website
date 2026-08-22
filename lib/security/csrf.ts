/**
 * Cross-site request forgery protection for the enquiry endpoint.
 *
 * Three checks, in increasing order of how much they can be trusted.
 *
 * 1. `Sec-Fetch-Site`. Set by the browser, not by the page, and unforgeable
 *    from script. `same-origin` and `none` are ours; `cross-site` is not. Old
 *    browsers omit it, so a missing header is not treated as a failure.
 * 2. `Origin`. Sent on every cross-origin POST. Compared against the request's
 *    own host rather than a hard-coded domain, so preview deployments and the
 *    apex and www hosts all work without a list to maintain.
 * 3. A double-submit token. Middleware sets a random value in a SameSite=Strict
 *    cookie; the page reads it and echoes it in a header. An attacker's page on
 *    another origin can cause the cookie to be sent but cannot read it, so it
 *    cannot produce the matching header.
 *
 * Worth being straight about the stakes: this form carries no session and
 * performs no privileged action, so a forged request is spam rather than a
 * compromise. The value here is that it closes the endpoint to anything that is
 * not this site's own page, which is also most of what makes automated abuse
 * expensive.
 */

/** Not HttpOnly — the page has to read it. That is inherent to double-submit
 *  and safe, because the cookie authorises nothing on its own. */
export const CSRF_COOKIE = "zn.csrf";
export const CSRF_HEADER = "x-zn-csrf";

export function issueToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length-independent comparison, so the check cannot be timed. */
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Returns null when the request may proceed, or a short reason for the log.
 * The reason never reaches the client: which of the three checks failed is a
 * description of the defence.
 */
export function verifyRequest(request: Request, cookieToken: string | undefined): string | null {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return `sec-fetch-site=${site}`;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return "unparseable origin";
    }
    // `host` reflects the host the request was actually made to, including the
    // port, which is what the browser compared against when it decided this was
    // same-origin.
    const host = request.headers.get("host");
    if (!host || originHost !== host) return `origin ${originHost} != host ${host}`;
  }

  const sent = request.headers.get(CSRF_HEADER);
  if (!cookieToken) return "no csrf cookie";
  if (!sent || !timingSafeEqual(sent, cookieToken)) return "csrf token mismatch";

  return null;
}
