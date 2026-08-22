"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import Studio from "./three/Studio";
import { useAllow3D } from "@/lib/motion";
import { company, contact } from "@/content/site";

const SendEnvelope = dynamic(() => import("./three/scenes/SendEnvelope"), { ssr: false });

/**
 * No backend by design — the form composes an enquiry and hands it off to
 * WhatsApp or email. Nothing is stored, which keeps this a pure static deploy.
 *
 * Which is why the envelope animation is followed by "ready to send" and not by
 * "message sent". Nothing has been sent at the moment the card folds up: the
 * enquiry has been written and handed to WhatsApp, and the visitor still presses
 * send. A page that claims delivery it cannot perform is the one kind of
 * flourish worth refusing — somebody would wait for a reply to a message that
 * was never dispatched.
 *
 * Submitting used to call window.open() and nothing else. When a browser blocks
 * that popup — which is the common case, and what a visitor reported — the page
 * did not change at all, so the form looked broken. Now submitting always
 * switches the panel to a visible "ready to send" state carrying real links the
 * visitor clicks themselves: a user-initiated click is never popup-blocked.
 */

type Sent = { body: string; wa: string; mail: string };

export default function ContactSection() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [phase, setPhase] = useState<"form" | "sending" | "sent">("form");
  const [copied, setCopied] = useState(false);
  const allow3D = useAllow3D();

  /** 0 to 1 through the envelope. Read inside the frame loop, never rendered. */
  const flight = useRef(0);

  /* ── Tilt ──────────────────────────────────────────────────────────
     The card leans toward the cursor. It is deliberately on an inner element:
     the wrapper carries the site's scroll reveal, which animates `transform`,
     and two writers on one transform means whichever runs last wins and the
     other silently disappears. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring);
  const tiltable = useRef<boolean | null>(null);

  const canTilt = () => {
    if (tiltable.current === null) {
      tiltable.current =
        window.matchMedia("(hover: hover)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return tiltable.current;
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt()) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  // A tween still running when the section unmounts would keep writing to a ref
  // nobody reads and hold the timeline alive.
  useEffect(() => () => gsap.killTweensOf(flight), []);

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
      org && `*Company:* ${org}`,
      `*Interested in:* ${service}`,
      "",
      "*Project details:*",
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
    // If it is blocked, the panel is already on its way to showing the same
    // links.
    try {
      window.open(wa, "_blank", "noopener");
    } catch {
      /* the panel is the fallback */
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!allow3D || reduced) {
      // Without the animation there is nothing to wait for, and making somebody
      // watch a second and a half of nothing is worse than no flourish at all.
      setPhase("sent");
      return;
    }

    setPhase("sending");
    flight.current = 0;
    gsap.killTweensOf(flight);
    gsap.to(flight, {
      current: 1,
      duration: 1.55,
      ease: "none",
      onComplete: () => setPhase("sent"),
    });
  };

  const reset = useCallback(() => {
    gsap.killTweensOf(flight);
    flight.current = 0;
    setSent(null);
    setCopied(false);
    setPhase("form");
  }, []);

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

          <div className="contact-card-wrap reveal" data-delay={120}>
            {/* The envelope is drawn into the shared canvas, which sits behind
                the page — so it only becomes visible once the card above it has
                folded away and stopped covering it. That is also the order the
                animation wants, which is the one piece of luck in this. */}
            {allow3D && phase === "sending" && (
              <View className="contact-view">
                <PerspectiveCamera makeDefault position={[0, 0, 4.6]} fov={42} />
                <Studio />
                <SendEnvelope progress={flight} />
              </View>
            )}

            <motion.div
              className="glass contact-card"
              data-phase={phase}
              style={{ rotateX, rotateY, transformPerspective: 1100 }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              {phase === "sent" && sent ? (
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
                    <button type="button" className="pill pill-ghost pill-sm" onClick={reset}>
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
                    <label htmlFor="c-org">Company</label>
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
                    <label htmlFor="c-message">Project details *</label>
                    <textarea
                      id="c-message"
                      name="message"
                      placeholder="What are you building, and by when?"
                      required
                    />
                  </div>

                  {error && (
                    <p role="alert" style={{ color: "#fca5a5", fontSize: 14, marginBottom: 14 }}>
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
            </motion.div>

            {/* Said out loud while the card is folding, so somebody who cannot
                see the animation is not left on a blank panel wondering whether
                the button worked. */}
            {phase === "sending" && (
              <p className="contact-sending" role="status" aria-live="polite">
                Packing your enquiry…
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
