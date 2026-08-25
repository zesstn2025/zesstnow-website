import { company } from "@/content/site";
import type { Delivery, Enquiry } from "./types";

/**
 * Alerts the founder on WhatsApp the moment a lead arrives.
 *
 * Two providers, chosen by whichever set of variables is present, because the
 * decision has not been made yet and hard-coding one would mean rewriting this
 * file to change it:
 *
 *   Meta WhatsApp Cloud API — WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN
 *   Twilio                  — TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM
 *
 * One thing to know before wiring either up, because it is the usual reason a
 * working integration sends nothing. WhatsApp only permits free-form text
 * inside a 24-hour window opened by the recipient messaging the business. An
 * alert that arrives at 3am, days after the founder last replied to that
 * number, falls outside it and must be an approved template message.
 * `WHATSAPP_TEMPLATE_NAME` switches this to a template; without it the code
 * sends free-form text, which is right for testing and unreliable in
 * production. Email is the channel that always lands, which is why the route
 * treats it as the system of record and this as the alert.
 */

/** Digits only, no plus — what both APIs expect. */
function e164(value: string) {
  return value.replace(/[^\d]/g, "");
}

/** The alert itself. Short: it is read on a lock screen. */
function body(enquiry: Enquiry) {
  return [
    "*New enquiry — " + company.shortName + "*",
    "",
    `*${enquiry.name}*${enquiry.company ? ` · ${enquiry.company}` : ""}`,
    `${enquiry.phone}${enquiry.email ? ` · ${enquiry.email}` : ""}`,
    `Interested in: ${enquiry.service}`,
    "",
    enquiry.message.length > 500 ? enquiry.message.slice(0, 500) + "…" : enquiry.message,
    "",
    `Reply: https://wa.me/${e164(enquiry.phone)}`,
  ].join("\n");
}

async function viaCloudApi(enquiry: Enquiry, to: string): Promise<Delivery> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN!.trim();
  const template = process.env.WHATSAPP_TEMPLATE_NAME?.trim();
  const version = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";

  const payload = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "en" },
          components: [
            {
              type: "body",
              // Newlines are not allowed in template parameters, so the alert
              // is flattened rather than sent as the multi-line free-form text.
              parameters: [
                { type: "text", text: enquiry.name },
                { type: "text", text: enquiry.service },
                { type: "text", text: enquiry.phone },
              ],
            },
          ],
        },
      }
    : { messaging_product: "whatsapp", to, type: "text", text: { body: body(enquiry) } };

  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[enquiry] WhatsApp Cloud API rejected the alert", response.status, text.slice(0, 500));
    return { channel: "whatsapp", status: "failed", detail: `WhatsApp API returned ${response.status}.` };
  }
  return { channel: "whatsapp", status: "sent", detail: "WhatsApp alert sent." };
}

async function viaTwilio(enquiry: Enquiry, to: string): Promise<Delivery> {
  const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const token = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM!.trim();

  const form = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:+${e164(from)}`,
    To: `whatsapp:+${to}`,
    Body: body(enquiry),
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        // Twilio takes HTTP basic auth rather than a bearer token.
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[enquiry] Twilio rejected the alert", response.status, text.slice(0, 500));
    return { channel: "whatsapp", status: "failed", detail: `WhatsApp provider returned ${response.status}.` };
  }
  return { channel: "whatsapp", status: "sent", detail: "WhatsApp alert sent." };
}

function hasCloudApi() {
  return !!process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() && !!process.env.WHATSAPP_ACCESS_TOKEN?.trim();
}

function hasTwilioApi() {
  return (
    !!process.env.TWILIO_ACCOUNT_SID?.trim() &&
    !!process.env.TWILIO_AUTH_TOKEN?.trim() &&
    !!process.env.TWILIO_WHATSAPP_FROM?.trim()
  );
}

/** Whether either provider has credentials in this environment. */
export function whatsappConfigured() {
  return hasCloudApi() || hasTwilioApi();
}

export async function sendWhatsAppAlert(enquiry: Enquiry): Promise<Delivery> {
  const to = e164(process.env.ENQUIRY_TO_WHATSAPP?.trim() || company.phoneE164);

  const hasCloud = hasCloudApi();
  const hasTwilio = hasTwilioApi();

  if (!hasCloud && !hasTwilio) {
    return {
      channel: "whatsapp",
      status: "skipped",
      detail: "WhatsApp alerts are not configured on this deployment.",
    };
  }

  try {
    return hasCloud ? await viaCloudApi(enquiry, to) : await viaTwilio(enquiry, to);
  } catch (error) {
    console.error("[enquiry] WhatsApp request failed", error);
    return { channel: "whatsapp", status: "failed", detail: "WhatsApp provider did not respond." };
  }
}
