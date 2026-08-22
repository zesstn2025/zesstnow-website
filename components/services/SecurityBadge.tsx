"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The security posture of this site, stated on the page.
 *
 * Every line here is checkable, and that constraint did real work on the copy.
 * Three claims that a badge like this usually carries were removed rather than
 * softened:
 *
 *   "Zero-knowledge architecture" — false. Zero-knowledge means the operator
 *     cannot read the data. This server decrypts every enquiry, because it has
 *     to compose an email and a WhatsApp message out of it. No arrangement of
 *     keys changes that while the form still notifies anybody. What is true, and
 *     is stronger than most of what zero-knowledge is invoked for, is that
 *     nothing is stored at all — so that is what the badge says.
 *
 *   "End-to-end encrypted" — false, for the same reason. The payload IS
 *     encrypted to a key only the server holds, underneath TLS, which is worth
 *     saying; calling it end-to-end would not be.
 *
 *   "Bank-grade security" — meaningless. It names no property and cannot be
 *     checked, which is exactly why it is on every fintech page.
 *
 * The encryption row reports what this deployment is actually doing. With no
 * key published it reads "standby", not "active" — a status light that is
 * always green is a decoration, and on a page about handling somebody's loan
 * file that is the worst thing it could be.
 */

type Row = {
  label: string;
  detail: string;
  state: "live" | "standby";
};

export default function SecurityBadge() {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [encrypted, setEncrypted] = useState(false);

  // Read in an effect rather than at render: the value is inlined at build
  // time, but reading it during render on the server and again on the client
  // is how a hydration mismatch starts.
  useEffect(() => {
    setEncrypted(!!process.env.NEXT_PUBLIC_ENQUIRY_PUBLIC_KEY);
  }, []);

  const rows: Row[] = [
    {
      label: "TLS 1.3 · HSTS enforced",
      detail: "Every request upgraded, for two years, subdomains included.",
      state: "live",
    },
    {
      label: encrypted
        ? "AES-256-GCM payload encryption"
        : "AES-256-GCM encryption on standby",
      detail: encrypted
        ? "Enquiries sealed in your browser to a key only our server holds."
        : "Ready on this build; switches on when the deployment publishes its key.",
      state: encrypted ? "live" : "standby",
    },
    {
      label: "No enquiry data stored",
      detail: "No database. Your message is delivered to us and never kept.",
      state: "live",
    },
    {
      label: "Strict CSP · framing blocked",
      detail: "Scripts from this origin only. The page cannot be embedded.",
      state: "live",
    },
  ];

  /**
   * Steps through the rows a step at a time, and only while the badge is on
   * screen. A timer that keeps firing behind a scrolled-past section is a
   * render every two seconds for nothing.
   */
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) {
          timer = window.setInterval(() => setActive((i) => (i + 1) % rows.length), 2400);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [rows.length]);

  return (
    <div className="glass sec-badge" ref={host}>
      <div className="sec-badge-head">
        <span className="sec-dot" aria-hidden="true" />
        <span className="mono-label">Connection status</span>
      </div>

      {/* A plain list underneath the animation. The highlight is decoration;
          all four rows are readable at once, and a screen reader gets them in
          order without a moving target. */}
      <ul className="sec-rows">
        {rows.map((row, i) => (
          <li key={row.label} data-active={i === active ? "true" : "false"} data-state={row.state}>
            <span className="sec-tick" aria-hidden="true" />
            <span className="sec-row-body">
              <span className="sec-row-t">{row.label}</span>
              <span className="sec-row-b">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="sec-note">
        Zesst Now is not a lender or an insurer. These describe how this website
        handles what you send it — not the security of any bank, NBFC or insurer
        your file is later presented to.
      </p>
    </div>
  );
}
