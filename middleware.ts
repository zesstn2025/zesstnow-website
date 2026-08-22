import { NextResponse, type NextRequest } from "next/server";
import { CSRF_COOKIE, issueToken } from "@/lib/security/csrf";

/**
 * Security headers for every response, and the CSRF cookie the contact form
 * echoes back.
 *
 * ── About the Content-Security-Policy ────────────────────────────────
 *
 * `script-src` carries `'unsafe-inline'`, and that is a deliberate, documented
 * choice rather than an oversight, so here is the reasoning in full.
 *
 * The strict way to write this policy is with a per-request nonce. That
 * requires the nonce to appear inside the HTML, which requires the HTML to be
 * generated per request — and every page on this site is prerendered at build
 * time. Turning that off would make a marketing site render on demand for every
 * visitor, permanently, to close a hole it does not have: nothing here renders
 * attacker-supplied HTML. The blog is markdown from the repository, the
 * structured data is escaped before it is serialised, and the contact form's
 * input is only ever read by the server.
 *
 * What the policy does still enforce is the part that actually contains an
 * attack. Script may load only from this origin — no CDN, no third party, no
 * injected `<script src>`. `object-src 'none'` removes the plugin surface.
 * `base-uri 'self'` stops a `<base>` tag from repointing every relative URL.
 * `form-action 'self'` stops a form from being made to post somewhere else.
 * `frame-ancestors 'none'` is the clickjacking defence, and it is the modern
 * one — `X-Frame-Options` is sent alongside it for browsers old enough to need
 * it. `connect-src 'self'` means an injected script could not exfiltrate
 * anything to an address it chose.
 *
 * `style-src` needs `'unsafe-inline'` regardless of any of this: next/font
 * emits an inline style block, and the page carries inline `style` attributes.
 * `worker-src blob:` is required by the WebGL layer.
 *
 * If the day comes that this site renders user-supplied HTML, the answer is a
 * nonce and dynamic rendering, not a tighter list of hosts.
 */

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", CSP);

  // Clickjacking, for browsers that predate frame-ancestors.
  response.headers.set("X-Frame-Options", "DENY");

  // Stops a browser from second-guessing a Content-Type — the mechanism behind
  // an upload being sniffed as script.
  response.headers.set("X-Content-Type-Options", "nosniff");

  // A full URL in the Referer of an outbound click can carry a path that was
  // never meant to travel. Origin only, and only over TLS.
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Nothing on this site uses any of these, so nothing should be able to ask.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );

  // Two years, subdomains included. Only meaningful over TLS, and browsers
  // ignore it on plain http, so it is safe to send unconditionally.
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Isolation headers. Cheap, and they close whole classes of cross-window
  // attack by making this document uninteresting to anything that opens it.
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // The CSRF token, issued once per browser and reused. SameSite=Strict is what
  // makes double-submit work: a page on another origin cannot read it, and
  // cannot cause it to be sent on a top-level cross-site request either.
  if (!request.cookies.get(CSRF_COOKIE)) {
    response.cookies.set(CSRF_COOKIE, issueToken(), {
      httpOnly: false, // the page must read it to echo it back
      sameSite: "strict",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  return response;
}

export const config = {
  /**
   * Everything except Next's own static output and the files served straight
   * from public/. Those are immutable assets with no cookies and no HTML, so
   * running this on them would only add latency.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
