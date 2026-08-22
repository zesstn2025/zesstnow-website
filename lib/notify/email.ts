import { company } from "@/content/site";
import type { Delivery, Enquiry } from "./types";

/**
 * Sends the enquiry to the desk by email, through Resend.
 *
 * Over `fetch` rather than the Resend SDK. The SDK is a wrapper around one POST
 * to one URL; taking the dependency would add a package to the deployment,
 * another thing to keep on a supported version, and nothing this file does not
 * already do in twenty lines.
 *
 * Every value that comes from the form is escaped before it reaches the HTML.
 * The recipient is the company's own inbox, so this is not the classic
 * cross-site case — but an enquiry body is attacker-controlled text arriving in
 * a mail client, and mail clients render HTML. A name of `<img onerror=...>`
 * should appear as those characters and nothing else.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** The four characters that can change the meaning of surrounding markup. */
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Paragraph breaks preserved, everything else escaped. */
function escBlock(value: string) {
  return esc(value).replace(/\n/g, "<br />");
}

function row(label: string, value: string, href?: string) {
  const shown = href
    ? `<a href="${esc(href)}" style="color:#b9c6d6;text-decoration:none;border-bottom:1px solid rgba(185,198,214,.4)">${esc(value)}</a>`
    : esc(value);
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(185,198,214,.14);
                 font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;
                 letter-spacing:.14em;text-transform:uppercase;color:#5d6d84;
                 vertical-align:top;width:132px">${esc(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(185,198,214,.14);
                 font:400 15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',
                 Roboto,Helvetica,Arial,sans-serif;color:#e6ecf4">${shown}</td>
    </tr>`;
}

/**
 * The site's own palette, in a table layout.
 *
 * Tables and inline styles because that is what mail clients render reliably —
 * Outlook has no flexbox and Gmail strips a `<style>` block. Dark by design,
 * and every colour is stated explicitly so a client that forces its own dark
 * mode has nothing to invert into illegibility.
 */
function html(enquiry: Enquiry) {
  const when = enquiry.receivedAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const wa = `https://wa.me/${enquiry.phone.replace(/[^\d]/g, "")}`;

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#000022">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
         style="max-width:640px;margin:0 auto;background:#040922;border:1px solid rgba(185,198,214,.18);
                border-radius:16px;overflow:hidden">
    <tr><td style="padding:28px 32px 4px">
      <div style="font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;
                  letter-spacing:.18em;text-transform:uppercase;color:#5d6d84">New project enquiry</div>
      <div style="margin-top:10px;font:400 26px/1.2 Georgia,'Times New Roman',serif;color:#e8eef6">
        ${esc(enquiry.name)}${enquiry.company ? ` &middot; ${esc(enquiry.company)}` : ""}
      </div>
    </td></tr>

    <tr><td style="padding:18px 32px 0">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${row("Name", enquiry.name)}
        ${row("Phone", enquiry.phone, wa)}
        ${enquiry.email ? row("Email", enquiry.email, `mailto:${enquiry.email}`) : ""}
        ${enquiry.company ? row("Company", enquiry.company) : ""}
        ${row("Interested in", enquiry.service)}
        ${row("Received", when)}
        ${row("Page", enquiry.source)}
      </table>
    </td></tr>

    <tr><td style="padding:24px 32px 4px">
      <div style="font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;
                  letter-spacing:.14em;text-transform:uppercase;color:#5d6d84">Project details</div>
      <div style="margin-top:10px;padding:16px 18px;background:rgba(185,198,214,.06);
                  border:1px solid rgba(185,198,214,.14);border-radius:10px;
                  font:400 15px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,
                  Helvetica,Arial,sans-serif;color:#e6ecf4;white-space:pre-wrap">${escBlock(enquiry.message)}</div>
    </td></tr>

    <tr><td style="padding:26px 32px 32px">
      <a href="${esc(wa)}"
         style="display:inline-block;padding:12px 22px;border-radius:999px;
                background:linear-gradient(100deg,#e8eef6,#b9c6d6);color:#000022;
                font:600 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,
                Helvetica,Arial,sans-serif;text-decoration:none">Reply on WhatsApp</a>
      <div style="margin-top:22px;padding-top:18px;border-top:1px solid rgba(185,198,214,.14);
                  font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,
                  Helvetica,Arial,sans-serif;color:rgba(230,236,244,.42)">
        Sent by the contact form on ${esc(company.domain)}.<br />
        ${esc(company.legalName)} &middot; CIN ${esc(company.cin)}
      </div>
    </td></tr>
  </table>
</body></html>`;
}

/** The same thing as text, for clients that will not render HTML. */
function text(enquiry: Enquiry) {
  return [
    "NEW PROJECT ENQUIRY",
    "",
    `Name:          ${enquiry.name}`,
    `Phone:         ${enquiry.phone}`,
    enquiry.email && `Email:         ${enquiry.email}`,
    enquiry.company && `Company:       ${enquiry.company}`,
    `Interested in: ${enquiry.service}`,
    `Page:          ${enquiry.source}`,
    "",
    "PROJECT DETAILS",
    enquiry.message,
    "",
    `Sent by the contact form on ${company.domain}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendEnquiryEmail(enquiry: Enquiry): Promise<Delivery> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ENQUIRY_TO_EMAIL?.trim() || company.email;
  // Resend will only send from a domain verified in the account, so this has
  // to be configurable rather than derived from company.domain.
  const from = process.env.ENQUIRY_FROM_EMAIL?.trim();

  if (!key || !from) {
    return {
      channel: "email",
      status: "skipped",
      detail: "Email notifications are not configured on this deployment.",
    };
  }

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
        subject: `New enquiry — ${enquiry.service} — ${enquiry.name}`,
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
