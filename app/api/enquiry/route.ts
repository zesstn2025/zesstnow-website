import { NextResponse, type NextRequest } from "next/server";
import { sendEnquiryEmail } from "@/lib/notify/email";
import { sendWhatsAppAlert } from "@/lib/notify/whatsapp";
import type { Enquiry } from "@/lib/notify/types";

/**
 * Takes a contact-form submission and notifies the desk by email and WhatsApp.
 *
 * This exists so the API keys never reach the browser. Everything the page
 * knows is that it POSTs a JSON body here and gets back which channels went
 * through; the credentials are read from the server's environment and are not
 * in the bundle, not in the HTML, and not readable from the network tab.
 *
 * Both channels are attempted, and the response says what happened to each
 * rather than collapsing to a single boolean. That distinction matters at the
 * form: an enquiry that reached the inbox but not the phone is delivered, and
 * telling the visitor it failed would make them send it twice or give up.
 *
 * Not stored anywhere. There is no database behind this site and adding one to
 * hold names and phone numbers would be a new obligation — the notification is
 * the whole job.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ── Abuse control ────────────────────────────────────────────────────
   A public endpoint that sends email and WhatsApp on demand is worth abusing.
   Two cheap defences; neither is a substitute for provider-side limits.

   The window is per-process and in memory, which on a serverless platform
   means per warm instance rather than global — it slows a single attacker
   down and does not stop a distributed one. The provider's own rate limit is
   the real backstop, and this keeps a bored script from reaching it. */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const recent = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);

  // The map would otherwise grow for the life of the process.
  if (recent.size > 500) {
    for (const [k, v] of recent) {
      if (v.every((t) => now - t >= WINDOW_MS)) recent.delete(k);
    }
  }
  return hits.length > MAX_PER_WINDOW;
}

/** Trims, caps length, and refuses the header-injection characters. */
function field(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  // The honeypot: a field hidden from people and irresistible to form-filling
  // bots. Anything in it and the submission is dropped — with a 200, because
  // an error teaches the bot to try differently.
  if (field(payload.website, 200)) {
    console.warn("[enquiry] honeypot tripped");
    return NextResponse.json({ ok: true, deliveries: [] });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many enquiries from this connection. Try again in a minute." },
      { status: 429 }
    );
  }

  const enquiry: Enquiry = {
    name: field(payload.name, 120),
    phone: field(payload.phone, 40),
    service: field(payload.service, 120),
    // The one field that keeps its line breaks: it is the brief, and a brief
    // flattened into one paragraph is harder to read.
    message: typeof payload.message === "string" ? payload.message.trim().slice(0, 4000) : "",
    email: field(payload.email, 160) || undefined,
    company: field(payload.company, 160) || undefined,
    source: field(payload.source, 200) || "/",
    receivedAt: new Date(),
  };

  if (!enquiry.name || !enquiry.phone || !enquiry.service || !enquiry.message) {
    return NextResponse.json(
      { ok: false, error: "Name, phone, service and a short brief are required." },
      { status: 400 }
    );
  }

  // Together rather than one after the other: the visitor is watching a
  // spinner, and two eight-second timeouts in series is sixteen seconds.
  const [email, whatsapp] = await Promise.all([
    sendEnquiryEmail(enquiry),
    sendWhatsAppAlert(enquiry),
  ]);

  const deliveries = [email, whatsapp];
  const sent = deliveries.filter((d) => d.status === "sent");
  const failed = deliveries.filter((d) => d.status === "failed");

  if (sent.length === 0) {
    /**
     * Nothing got through, so the form must not claim it did.
     *
     * `configured` separates the two reasons, because they need different
     * words in front of the visitor. Both channels skipped means the keys have
     * not been added to this deployment yet — the form falls back to handing
     * the enquiry to WhatsApp from the browser, which is how it worked before
     * this endpoint existed and still works with nothing configured. Failed
     * means the providers were tried and did not deliver.
     */
    const configured = failed.length > 0;
    console.error("[enquiry] nothing delivered", deliveries);
    return NextResponse.json(
      {
        ok: false,
        configured,
        deliveries,
        error: configured
          ? "We could not deliver your enquiry just now."
          : "Notifications are not configured on this deployment.",
      },
      { status: configured ? 502 : 501 }
    );
  }

  if (failed.length > 0) {
    // Delivered, but not everywhere. Worth a server-side line so a channel
    // that has been quietly failing for a week is visible in the logs.
    console.warn("[enquiry] partial delivery", failed);
  }

  return NextResponse.json({ ok: true, configured: true, deliveries });
}
