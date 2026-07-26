"use client";

import { useState } from "react";
import { company, contact } from "@/content/site";

/**
 * No backend by design — the form composes a WhatsApp message and hands off.
 * Nothing is stored, which keeps this site a pure static deploy.
 */
export default function ContactSection() {
  const [error, setError] = useState<string | null>(null);

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

    window.open(
      `https://wa.me/${company.phoneE164}?text=${encodeURIComponent(body)}`,
      "_blank",
      "noopener"
    );
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
                {company.phone}
              </a>
              <div className="contact-line" style={{ alignItems: "flex-start" }}>
                <span className="mono-label" style={{ width: 78, paddingTop: 3 }}>
                  Office
                </span>
                <span style={{ color: "var(--muted)" }}>
                  {company.registeredOffice.locality},{" "}
                  {company.registeredOffice.district},
                  <br />
                  {company.registeredOffice.state} – {company.registeredOffice.pin}
                </span>
              </div>
            </div>
          </div>

          <div className="glass reveal" data-delay={120} style={{ padding: "clamp(26px,3vw,38px)" }}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
