import { NextResponse, type NextRequest } from "next/server";
import { sendEnquiryEmail } from "@/lib/notify/email";
import { sendWhatsAppAlert } from "@/lib/notify/whatsapp";
import type { Enquiry } from "@/lib/notify/types";
import { clean, validate } from "@/lib/security/validate";
import { CSRF_COOKIE, verifyRequest } from "@/lib/security/csrf";
import { isSealed } from "@/lib/security/sealed";
import { unseal, encryptionConfigured, encryptionRequired } from "@/lib/security/unseal.server";

/**
 * Takes a contact-form submission and notifies the desk by email and WhatsApp.
 *
 * The whole reason this endpoint exists is that the provider keys stay on the
 * server. The page knows only that it POSTs here and gets back which channels
 * went through; the credentials are read from the environment, are not in the
 * bundle, not in the HTML and not visible in a network tab.
 *
 * Nothing is stored. There is no database behind this site, and adding one to
 * hold names and phone numbers would create an obligation — a place that can be
 * breached, a retention period to define, a deletion request to honour. The
 * notification is the entire job, and "we do not keep it" is a stronger
 * guarantee than any encryption applied to a store that exists.
 *
 * ── The order of the checks, and why ─────────────────────────────────
 *
 * Cheap and certain first, expensive and fallible last, so that abuse is
 * rejected before it costs anything:
 *
 *   1. Body size — refused before it is parsed.
 *   2. CSRF — is this our own page?
 *   3. Rate limit — has this connection had its turn?
 *   4. Decrypt — only now is any cryptography done.
 *   5. Honeypot — is this a bot filling every field it can find?
 *   6. Validate — is this a usable enquiry?
 *   7. Send — the only step that talks to anybody else.
 *
 * ── What comes back ──────────────────────────────────────────────────
 *
 * One shape, always, and never an internal detail. No stack traces, no provider
 * response bodies, no indication of which check rejected a request. Everything
 * diagnostic goes to the server log where the people who own the deployment can
 * read it, and nowhere else. An error message that explains the defence is a
 * map of the defence.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Generous for a brief, small enough that nothing can be parsed to death. */
const MAX_BODY_BYTES = 16 * 1024;

/* ── Rate limiting ────────────────────────────────────────────────────
   Two windows rather than one. The short window stops a burst; the long one
   stops a slow drip that would sit under it all day.

   Per-process and in memory, which on a serverless platform means per warm
   instance rather than global. It makes a single attacker expensive and does
   not stop a distributed one — the provider's own limits and the platform's
   edge protection are the real backstop, and this keeps a bored script from
   ever reaching them. Said plainly here because a rate limiter people believe
   is global is worse than one they know the shape of. */

const WINDOWS = [
  { ms: 60_000, max: 3 },
  { ms: 60 * 60_000, max: 20 },
];

const hits = new Map<string, number[]>();

function rateLimited(key: string): number | null {
  const now = Date.now();
  const longest = WINDOWS[WINDOWS.length - 1].ms;
  const times = (hits.get(key) ?? []).filter((t) => now - t < longest);
  times.push(now);
  hits.set(key, times);

  if (hits.size > 1000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= longest)) hits.delete(k);
    }
  }

  for (const w of WINDOWS) {
    const inWindow = times.filter((t) => now - t < w.ms);
    if (inWindow.length > w.max) {
      // Seconds until the oldest hit in this window falls out of it.
      return Math.ceil((w.ms - (now - inWindow[0])) / 1000);
    }
  }
  return null;
}

/** One response shape for every rejection. */
function refuse(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  try {
    // 1. Size, before parsing. Content-Length can be absent or lie, so the
    //    text is measured as well.
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY_BYTES) return refuse(413, "That message is too long.");

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return refuse(413, "That message is too long.");

    // 2. CSRF.
    const reason = verifyRequest(request, request.cookies.get(CSRF_COOKIE)?.value);
    if (reason) {
      console.warn("[enquiry] rejected by csrf:", reason, "from", ip);
      // Deliberately vague, and deliberately actionable: a real visitor hits
      // this when their cookie has expired, and reloading fixes it.
      return refuse(403, "Your session has expired. Please reload the page and try again.");
    }

    // 3. Rate limit.
    const retryAfter = rateLimited(ip);
    if (retryAfter !== null) {
      return NextResponse.json(
        { ok: false, error: "Too many enquiries from this connection. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(raw);
    } catch {
      return refuse(400, "Malformed request.");
    }

    // 4. Decrypt, if the payload is sealed.
    let sealedRequest = false;
    if (isSealed(payload)) {
      sealedRequest = true;
      const opened = unseal(payload);
      if (!opened || typeof opened !== "object") {
        console.warn("[enquiry] sealed payload rejected from", ip);
        return refuse(400, "We could not read that submission. Please reload and try again.");
      }
      payload = opened as Record<string, unknown>;
    } else if (encryptionRequired() && encryptionConfigured()) {
      // Configured to accept encrypted submissions only. A plaintext body at
      // this point is either a very old browser or something that is not the
      // site's own page.
      console.warn("[enquiry] plaintext refused while encryption is required, from", ip);
      return refuse(400, "We could not read that submission. Please reload and try again.");
    }

    // 5. Honeypot: a field hidden from people and irresistible to form-fillers.
    //    Answered with 200 on purpose — an error teaches the bot to try again
    //    differently, and a success teaches it nothing at all.
    if (typeof payload.website === "string" && payload.website.trim()) {
      console.warn("[enquiry] honeypot tripped from", ip);
      return NextResponse.json({ ok: true, configured: true, deliveries: [] });
    }

    // 6. Normalise, then validate. In that order: Unicode has several ways to
    //    write the same string, and a check that runs on one form while the
    //    mailer uses another is a check that can be walked around.
    const fields = clean(payload);
    const invalid = validate(fields);
    if (invalid) return refuse(400, invalid);

    const enquiry: Enquiry = {
      name: fields.name,
      phone: fields.phone,
      service: fields.service,
      message: fields.message,
      email: fields.email || undefined,
      company: fields.company || undefined,
      source: fields.source,
      receivedAt: new Date(),
    };

    // 7. Both channels together, not one after the other: the visitor is
    //    watching a spinner, and two eight-second timeouts in series is sixteen
    //    seconds. `allSettled`, so a provider that throws in an unexpected way
    //    cannot take the other channel down with it.
    const settled = await Promise.allSettled([
      sendEnquiryEmail(enquiry),
      sendWhatsAppAlert(enquiry),
    ]);

    const deliveries = settled.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : {
            channel: (i === 0 ? "email" : "whatsapp") as "email" | "whatsapp",
            status: "failed" as const,
            detail: "Provider did not respond.",
          }
    );

    const sent = deliveries.filter((d) => d.status === "sent");
    const failed = deliveries.filter((d) => d.status === "failed");

    if (sent.length === 0) {
      /**
       * Nothing got through, so the form must not claim it did.
       *
       * `configured` separates the two reasons, because they need different
       * words in front of a visitor. Both skipped means the keys are not on
       * this deployment yet, and the form falls back to handing the enquiry to
       * WhatsApp from the browser — which is how it worked before this endpoint
       * existed. Failed means the providers were tried and did not deliver.
       */
      const configured = failed.length > 0;
      console.error("[enquiry] nothing delivered", deliveries);
      return NextResponse.json(
        {
          ok: false,
          configured,
          encrypted: sealedRequest,
          deliveries,
          error: configured
            ? "We could not deliver your enquiry just now."
            : "Notifications are not configured on this deployment.",
        },
        { status: configured ? 502 : 501 }
      );
    }

    if (failed.length > 0) {
      // Delivered, but not everywhere. Worth a line so a channel that has been
      // quietly failing for a week is visible in the logs.
      console.warn("[enquiry] partial delivery", failed);
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      // Whether THIS submission arrived sealed, not merely whether the
      // deployment could accept one. The form shows it, so it has to be a
      // fact about the request rather than about the configuration.
      encrypted: sealedRequest,
      deliveries,
    });
  } catch (error) {
    /**
     * The last resort, and the reason it exists.
     *
     * Anything that reaches here is a bug rather than a rejection. Without this
     * the framework would answer with its own error page, and in some
     * configurations that page carries a stack trace — file paths, function
     * names, the shape of the code. The visitor gets one sentence; everything
     * useful goes to the server log.
     */
    console.error("[enquiry] unhandled failure", error);
    return refuse(500, "Something went wrong at our end. Please try again, or message us directly.");
  }
}

/** Anything that is not a POST is not an enquiry. */
export async function GET() {
  return refuse(405, "Method not allowed.");
}
