import { company } from "@/content/site";
import type { Delivery, Enquiry } from "./types";
import { html, subject, text } from "./message";
import { sendViaSmtp, smtpConfigured } from "./smtp";

/**
 * Email delivery, over whichever transport this deployment has been given.
 *
 * Two of them, because they have opposite costs. Resend is the better one and
 * cannot be switched on in five minutes: it needs an account, and it will not
 * send from a domain until that domain's DNS has been verified. SMTP will send
 * from a mailbox the company already owns as soon as it has an app password.
 *
 * Resend wins when both are present — it reports delivery properly and has no
 * per-mailbox daily ceiling — but the point of keeping both is that the form
 * reaches an inbox on day one rather than on the day the DNS propagates.
 *
 * The message itself is rendered in ./message and is identical either way. A
 * lead that looks different depending on which transport carried it is a lead
 * somebody has to reconcile by hand.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function resendConfigured() {
  return !!process.env.RESEND_API_KEY?.trim() && !!process.env.ENQUIRY_FROM_EMAIL?.trim();
}

/** Whether an enquiry can reach an inbox at all in this environment. */
export function emailConfigured() {
  return resendConfigured() || smtpConfigured();
}

async function sendViaResend(enquiry: Enquiry): Promise<Delivery> {
  const key = process.env.RESEND_API_KEY!.trim();
  const to = process.env.ENQUIRY_TO_EMAIL?.trim() || company.email;
  // Resend will only send from a domain verified in the account, so this has
  // to be configurable rather than derived from company.domain.
  const from = process.env.ENQUIRY_FROM_EMAIL!.trim();

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // So hitting reply in the mail client answers the client, not us.
        ...(enquiry.email ? { reply_to: enquiry.email } : {}),
        subject: subject(enquiry),
        html: html(enquiry),
        text: text(enquiry),
      }),
      // A lead form must not hang. Past this, the visitor is told to use the
      // WhatsApp handoff instead of watching a spinner.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      // The provider's body can echo configuration; log it server-side, and
      // give the visitor the status code only.
      const body = await response.text().catch(() => "");
      console.error("[enquiry] Resend rejected the message", response.status, body.slice(0, 500));
      return { channel: "email", status: "failed", detail: `Email provider returned ${response.status}.` };
    }

    return { channel: "email", status: "sent", detail: `Emailed to ${to}.` };
  } catch (error) {
    console.error("[enquiry] Resend request failed", error);
    return { channel: "email", status: "failed", detail: "Email provider did not respond." };
  }
}

export async function sendEnquiryEmail(enquiry: Enquiry): Promise<Delivery> {
  if (resendConfigured()) {
    const delivery = await sendViaResend(enquiry);
    // If Resend is configured and fails, and SMTP is also available, the
    // enquiry is worth more than the tidiness of one attempt per lead.
    if (delivery.status === "failed" && smtpConfigured()) {
      console.error("[enquiry] falling back to SMTP after Resend failed");
      return sendViaSmtp(enquiry);
    }
    return delivery;
  }

  if (smtpConfigured()) return sendViaSmtp(enquiry);

  return {
    channel: "email",
    status: "skipped",
    detail: "Email notifications are not configured on this deployment.",
  };
}
