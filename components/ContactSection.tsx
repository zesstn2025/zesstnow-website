"use client";

import { useState } from "react";
import { company, contact } from "@/content/site";

/**
 * No backend by design — the form composes an enquiry and hands it off to
 * WhatsApp or email. Nothing is stored, which keeps this a pure static deploy.
 *
 * Submitting used to call window.open() and nothing else. When a browser blocks
 * that popup — which is the common case, and what a visitor reported — the page
 * did not change at all, so the form looked broken. Now submitting always
 * switches the panel to a visible "ready to send" state carrying real links the
 * visitor clicks themselves: a user-initiated click is never popup-blocked.
 */
export default function ContactSection() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ body: string; wa: string; mail: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const service = String(data.get("service") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const org = String(data.get("org") ?? "").trim();

    if (!name || !phone || !service || !message) {
      setError("Name, phone, service and a short brief are required.");
      return;
    }
    setError(null);

    const body = [
      "*New project enquiry*",
      "──────────────",
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      email && `*Email:* ${email}`,
      org && `*Organisation:* ${org}`,
      `*Interested in:* ${service}`,
      "",
      "*Brief:*",
      message,
      "──────────────",
      `Sent from ${company.domain}`,
    ]
      .filter(Boolean)
      .join("\n");

    const wa = `https://wa.me/${company.phoneE164}?text=${encodeURIComponent(body)}`;
    const mail =
      `mailto:${company.email}` +
      `?subject=${encodeURIComponent(`Project enquiry — ${service}`)}` +
      `&body=${encodeURIComponent(body.replace(/\*/g, ""))}`;

    setSent({ body, wa, mail });

    // Still try the handoff, because when it is allowed it is the fastest path.
    // If it is blocked, the panel below is already showing the same links.
    try {
      window.open(wa, "_blank", "noopener");
    } catch {
      /* the panel is the fallback */
    }
  };

  const copy = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="shell">
        <div className="contact-grid">
          <div className="reveal">
            <span className="eyebrow">{contact.eyebrow}</span>
            <h2 className="section-title">{contact.title}</h2>
            <p className="section-sub">{contact.sub}</p>

            <div style={{ marginTop: 40 }}>
              <a className="contact-line" href={`mailto:${company.email}`}>
                <span className="mono-label" style={{ width: 78 }}>
                  Email
                </span>
                {company.email}
              </a>
              <a className="contact-line" href={`tel:+${company.phoneE164}`}>
                <span className="mono-label" style={{ width: 78 }}>
                  Phone
                </span>
                <span>
                  {company.phone}
                  <span style={{ color: "var(--faint)", marginLeft: 10, fontSize: 13 }}>
                    {company.hours}
                  </span>
                </span>
              </a>
              <a
                className="contact-line"
                href={company.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="mono-label" style={{ width: 78 }}>
                  Instagram
                </span>
                @{company.instagram}
              </a>
              <div className="contact-line" style={{ alignItems: "flex-start" }}>
                <span className="mono-label" style={{ width: 78, paddingTop: 3 }}>
                  Office
                </span>
                <span style={{ color: "var(--muted)" }}>
                  {company.registeredOffice.line1},
                  <br />
                  {company.registeredOffice.line2},
                  <br />
                  {company.registeredOffice.district},{" "}
                  {company.registeredOffice.state} – {company.registeredOffice.pin}
                </span>
              </div>
            </div>
          </div>

          <div className="glass reveal" data-delay={120} style={{ padding: "clamp(26px,3vw,38px)" }}>
            {sent ? (
              <div className="sent" role="status" aria-live="polite">
                <span className="sent-tick" aria-hidden="true">
                  ✓
                </span>
                <h3 className="sent-title">Your enquiry is ready to send.</h3>
                <p className="sent-sub">
                  If WhatsApp did not open on its own, use the button below — it
                  carries the same message, already written.
                </p>

                <div className="sent-actions">
                  <a
                    href={sent.wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill pill-primary"
                  >
                    Open WhatsApp
                  </a>
                  <a href={sent.mail} className="pill pill-ghost">
                    Send as email
                  </a>
                </div>

                <pre className="sent-body">{sent.body}</pre>

                <div className="sent-actions">
                  <button type="button" className="pill pill-ghost pill-sm" onClick={copy}>
                    {copied ? "Copied ✓" : "Copy message"}
                  </button>
                  <button
                    type="button"
                    className="pill pill-ghost pill-sm"
                    onClick={() => {
                      setSent(null);
                      setCopied(false);
                    }}
                  >
                    Write another
                  </button>
                </div>

                <p className="sent-note">
                  Prefer to call? {company.phone} · {company.hours}
                </p>
              </div>
            ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="field">
                <label htmlFor="c-name">Your name *</label>
                <input id="c-name" name="name" placeholder="Nitin Kumar" required />
              </div>

              <div className="field">
                <label htmlFor="c-phone">Phone *</label>
                <input
                  id="c-phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 00000 00000"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" name="email" type="email" placeholder="you@company.com" />
              </div>

              <div className="field">
                <label htmlFor="c-org">Organisation</label>
                <input id="c-org" name="org" placeholder="Company or practice name" />
              </div>

              <div className="field">
                <label htmlFor="c-service">Interested in *</label>
                <select id="c-service" name="service" defaultValue="" required>
                  <option value="" disabled>
                    Select one
                  </option>
                  {contact.services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="c-message">Brief *</label>
                <textarea
                  id="c-message"
                  name="message"
                  placeholder="What are you building, and by when?"
                  required
                />
              </div>

              {error && (
                <p
                  role="alert"
                  style={{ color: "#fca5a5", fontSize: 14, marginBottom: 14 }}
                >
                  {error}
                </p>
              )}

              <button type="submit" className="pill pill-primary" style={{ width: "100%" }}>
                {contact.cta}
              </button>

              <p style={{ marginTop: 16, fontSize: 12.5, color: "var(--faint)" }}>
                {contact.note}
              </p>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
