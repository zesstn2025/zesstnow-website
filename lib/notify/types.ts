/**
 * What a completed enquiry looks like once the API route has validated it, and
 * what a notification channel reports back.
 *
 * Shared so the email body, the WhatsApp message and the route's response all
 * describe the same thing. A lead that reaches the inbox with one set of fields
 * and WhatsApp with another is a lead somebody has to reconcile by hand.
 */
export type Enquiry = {
  name: string;
  phone: string;
  service: string;
  message: string;
  email?: string;
  company?: string;
  /** Where on the site it was submitted from. */
  source: string;
  receivedAt: Date;
};

/**
 * The outcome of one channel.
 *
 * `skipped` is not a failure: it means the channel has no credentials in this
 * environment. A deployment with only email configured should send email and
 * say so, not report an error for the half that was never switched on.
 */
export type Delivery = {
  channel: "email" | "whatsapp";
  status: "sent" | "skipped" | "failed";
  /** Safe to show a visitor. Never contains a key, a token or a raw provider body. */
  detail: string;
};
