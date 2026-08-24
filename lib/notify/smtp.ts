import nodemailer from "nodemailer";
import { company } from "@/content/site";
import type { Delivery, Enquiry } from "./types";
import { html, subject, text } from "./message";

/**
 * Delivers the enquiry over plain SMTP.
 *
 * This exists so that reaching the inbox does not depend on signing up for
 * anything. Resend is the better transport once it is set up — proper delivery
 * reporting, no per-mailbox sending limit — but it wants an account and a
 * domain verified by DNS before it will send a single message. SMTP wants a
 * mailbox, and the company already has one.
 *
 * With Gmail specifically: the password here is a Google **app password**, not
 * the account password, and generating one requires 2-Step Verification to be
 * on. Google refuses ordinary passwords from applications outright, so an
 * attempt with the real password fails at authentication and looks like a typo.
 * Host smtp.gmail.com, port 465, secure.
 *
 * Two limits worth knowing before choosing this over Resend. A normal Gmail
 * account will not send more than a few hundred messages a day, which is far
 * beyond what a contact form on a company site produces but is a real ceiling.
 * And mail sent this way is From the mailbox itself, so it cannot be From
 * something like enquiries@ the company domain unless that mailbox exists.
 *
 * The connection is TLS in both configurations offered: port 465 is TLS from
 * the first byte, port 587 starts plaintext and upgrades with STARTTLS, which
 * nodemailer requires by default. `secure` is derived from the port rather
 * than asked for, because getting that pair inconsistent is the usual reason
 * an otherwise correct SMTP configuration hangs until it times out.
 */

/** Reused across warm invocations; opening a TLS connection per lead is waste. */
let cached: nodemailer.Transporter | null = null;

function transporter(host: string, port: number, user: string, pass: string) {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS. Anything else is assumed to be STARTTLS on 587.
    secure: port === 465,
    auth: { user, pass },
    // A lead form must not hang. Past this the visitor is handed the WhatsApp
    // and mail fallbacks rather than left watching a spinner.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
  return cached;
}

export function smtpConfigured() {
  return (
    !!process.env.SMTP_HOST?.trim() &&
    !!process.env.SMTP_USER?.trim() &&
    !!process.env.SMTP_PASS?.trim()
  );
}

export async function sendViaSmtp(enquiry: Enquiry): Promise<Delivery> {
  const host = process.env.SMTP_HOST!.trim();
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || 465);
  const to = process.env.ENQUIRY_TO_EMAIL?.trim() || company.email;

  // Most providers reject a From that is not the authenticated mailbox, so
  // that is the default rather than something derived from the domain.
  const from = process.env.ENQUIRY_FROM_EMAIL?.trim() || `${company.shortName} <${user}>`;

  try {
    await transporter(host, port, user, pass).sendMail({
      from,
      to,
      // So hitting reply in the mail client answers the client, not us.
      ...(enquiry.email ? { replyTo: enquiry.email } : {}),
      subject: subject(enquiry),
      html: html(enquiry),
      text: text(enquiry),
    });
    return { channel: "email", status: "sent", detail: `Emailed to ${to}.` };
  } catch (error) {
    // An SMTP error carries the host, the account and sometimes the
    // credential state. It goes to the log and never to the visitor.
    console.error("[enquiry] SMTP delivery failed", error);
    // A dead transporter must not be reused; the next lead should reconnect.
    cached = null;
    return { channel: "email", status: "failed", detail: "The mail server did not accept the message." };
  }
}
