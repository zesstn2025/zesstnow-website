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

/**
 * A second policy, for /admin only.
 *
 * The policy above is right for a marketing site that talks to nothing but
 * itself, and it silently made the admin impossible to open: the editor is
 * Sveltia CMS, `script-src 'self'` refused to load it, and the page sat on its
 * "Loading the editor" message forever. Nothing about that looks like a
 * failure from the outside, which is why it went unnoticed — a boot screen
 * that never resolves reads as a slow boot.
 *
 * The editor is now served from public/admin rather than from unpkg, so
 * `script-src` stays `'self'` here too. That is not incidental. Whoever is
 * signed in to this page is holding a GitHub token with write access to the
 * repository, so a script tag pointing at a CDN is a path from someone else's
 * infrastructure to that token. A CDN is an acceptable dependency for a
 * stylesheet on a marketing page and not for this.
 *
 * What genuinely has to be allowed:
 *
 *   connect-src api.github.com  — the editor IS a GitHub client. Every read
 *       and every publish is a REST call. Without this, sign-in fails at the
 *       first request and the failure looks like a bad token.
 *   img-src githubusercontent  — avatars and any media already committed.
 *   font-src cdn.jsdelivr.net  — the icon font. Fonts cannot execute, and
 *       without it every button in the UI renders as its name in text.
 *   form-action github.com     — the sign-in handoff.
 *
 * Deliberately still refused: unpkg, which the bundle would otherwise reach
 * for to lazily fetch syntax-highlighting grammars. Losing highlighting inside
 * a markdown code block is not worth putting a third-party script origin in
 * front of a repo-scoped token.
 */
const ADMIN_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://*.githubusercontent.com",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  // `data:` is here because the editor fetches its own inlined SVG assets
  // back through fetch(), and a data: URI is subject to connect-src like any
  // other. Refusing it stopped the app booting.
  "connect-src 'self' data: https://api.github.com https://cdn.jsdelivr.net",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const isAdmin = request.nextUrl.pathname.startsWith("/admin");

  response.headers.set("Content-Security-Policy", isAdmin ? ADMIN_CSP : CSP);

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
  //
  // The admin gets the one relaxation that still counts as isolation. Signing
  // in through GitHub OAuth opens github.com in a popup which then has to hand
  // the result back through `window.opener`; under a flat `same-origin` that
  // reference is severed and the popup completes, closes, and tells the page
  // nothing — a sign-in that appears to do nothing at all. `allow-popups`
  // keeps this document unreachable from any window that opened IT, which is
  // the direction the attack comes from.
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    isAdmin ? "same-origin-allow-popups" : "same-origin"
  );
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
