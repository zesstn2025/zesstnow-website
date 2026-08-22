"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { useAllow3D } from "@/lib/motion";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/csrf";
import { company, contact } from "@/content/site";

const SendEnvelope = dynamic(() => import("./three/scenes/SendEnvelope"), { ssr: false });

/**
 * The enquiry goes to /api/enquiry, which emails the desk and pings the
 * founder's WhatsApp. The keys for both live in the server's environment and
 * never reach the browser — that endpoint exists for exactly that reason.
 *
 * The envelope only flies once the server has confirmed delivery. It is the
 * one thing on the page that makes a claim about the outside world, so it
 * waits for the outside world: the animation and the request run together and
 * the panel is decided by the request, not by the clock.
 *
 * Three outcomes, and they are deliberately not collapsed into two.
 *
 *   Delivered   — at least one channel got through. The panel says which.
 *   Unconfigured — no keys on this deployment. The form falls back to handing
 *                 the enquiry to WhatsApp from the browser, which is how this
 *                 worked before the endpoint existed and still works with
 *                 nothing set up. Nobody loses a lead over an unset variable.
 *   Failed      — the providers were tried and did not deliver. The visitor is
 *                 told plainly and given the same manual links.
 *
 * What the panel never does is claim delivery that did not happen. A visitor
 * who is told their message was sent will wait for a reply to a message that
 * was never dispatched.
 *
 * The manual links are built even on the happy path, because "message us
 * directly instead" is a reasonable thing to want after filling in a form, and
 * a user-initiated click is never popup-blocked.
 *
 * Two things go with the submission besides the fields. A CSRF token, read from
 * the cookie middleware set and echoed in a header — a page on another origin
 * can cause that cookie to be sent but cannot read it, so it cannot produce the
 * header. And, where a public key is configured, the whole body encrypted with
 * AES-256-GCM under a key derived per submission by ECDH; see
 * lib/security/sealed.ts, which is also honest about what that does and does
 * not protect against.
 */

/** The double-submit token middleware issued. */
function csrfToken() {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + CSRF_COOKIE.replace(".", "\\.") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : "";
}

type Sent = { body: string; wa: string; mail: string };
type Result = {
  ok: boolean;
  configured: boolean;
  deliveries?: { channel: string; status: string; detail: string }[];
  error?: string;
};

export default function ContactSection() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [phase, setPhase] = useState<"form" | "sending" | "sent" | "failed">("form");
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

  /**
   * Fetches the envelope's code as soon as somebody starts filling the form,
   * so the download is not sitting on the critical path at the moment they
   * press send.
   */
  const [warm, setWarm] = useState(false);
  const onFieldFocus = () => {
    if (warm || !allow3D) return;
    setWarm(true);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animated = allow3D && !reduced;

    setPhase("sending");
    setResult(null);

    // The animation and the request start together and are awaited together.
    // Run in series they would add a second and a half to the wait for nothing;
    // gated only on the clock, the envelope would fly before anything had been
    // delivered.
    const animation = animated
      ? Promise.race([
          new Promise<void>((resolve) => {
            flight.current = 0;
            gsap.killTweensOf(flight);
            gsap.to(flight, { current: 1, duration: 1.55, ease: "none", onComplete: resolve });
          }),
          // The envelope is a flourish and must never be what a visitor is
          // waiting on. It runs on requestAnimationFrame, so anything that
          // stalls the main thread stalls it — measured here at ten seconds on
          // a software renderer, against an API that answered in ten
          // milliseconds, because mounting the scene and baking its environment
          // map blocked the frame loop. Past this the panel goes up regardless.
          new Promise<void>((resolve) => setTimeout(resolve, 2600)),
        ])
      : Promise.resolve();

    const request = (async (): Promise<Result> => {
      try {
        const fields = {
          name,
          phone,
          service,
          message,
          email,
          company: org,
          source: window.location.pathname,
          // The honeypot. A person never sees this field, so anything in it
          // came from something filling the form in automatically.
          website: String(data.get("website") ?? ""),
        };

        // Encrypted when a public key is published, plain over TLS when it is
        // not. `seal` returns null on any browser that cannot do it rather than
        // throwing — a contact form that stops working because a crypto
        // primitive was missing is a worse outcome than one sent over TLS
        // alone, which is the ordinary and safe arrangement.
        const publicKey = process.env.NEXT_PUBLIC_ENQUIRY_PUBLIC_KEY;
        let body: unknown = fields;
        if (publicKey) {
          const { seal } = await import("@/lib/security/seal.client");
          body = (await seal(fields, publicKey)) ?? fields;
        }

        const response = await fetch("/api/enquiry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [CSRF_HEADER]: csrfToken(),
          },
          // Never send the cookie to another origin, whatever a redirect says.
          credentials: "same-origin",
          redirect: "error",
          body: JSON.stringify(body),
          // The server already caps each provider at eight seconds; this is the
          // backstop for the request itself never coming back.
          signal: AbortSignal.timeout(15000),
        });
        const json = (await response.json()) as Partial<Result>;
        // The route always reports `configured`; default it true so a
        // malformed response is treated as a real failure rather than as an
        // unconfigured deployment, which would silently hide a broken provider.
        return { ok: false, configured: true, ...json };
      } catch {
        // A network failure is indistinguishable from an unconfigured
        // deployment from here, and the useful thing to do about either is the
        // same: give the visitor the links and let them send it themselves.
        return { ok: false, configured: false, error: "Could not reach the server." };
      }
    })();

    const [outcome] = await Promise.all([request, animation]);
    setResult(outcome);
    setPhase(outcome.ok || !outcome.configured ? "sent" : "failed");
  };

  const reset = useCallback(() => {
    gsap.killTweensOf(flight);
    flight.current = 0;
    setSent(null);
    setResult(null);
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
            {allow3D && warm && (
              // Mounted from the first keystroke, not from the submit. The
              // envelope is invisible until its progress leaves zero, and
              // building the scene — downloading the chunk, compiling the
              // materials, baking the environment map — costs real main-thread
              // time. Paid while somebody is typing it is free; paid on submit
              // it is the thing they are waiting for.
              <View className="contact-view">
                <PerspectiveCamera makeDefault position={[0, 0, 4.6]} fov={42} />
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
              {(phase === "sent" || phase === "failed") && sent ? (
                (() => {
                  // Delivered by the server, or handed back for the visitor to
                  // send themselves. The wording is the difference between the
                  // two, and it is the part that has to be right.
                  const delivered = phase === "sent" && !!result?.ok;
                  const channels = (result?.deliveries ?? [])
                    .filter((d) => d.status === "sent")
                    .map((d) => (d.channel === "email" ? "email" : "WhatsApp"));

                  return (
                    <div className="sent" role="status" aria-live="polite">
                      <span className="sent-tick" data-failed={phase === "failed"} aria-hidden="true">
                        {phase === "failed" ? "!" : "✓"}
                      </span>

                      <h3 className="sent-title">
                        {delivered
                          ? "Your enquiry is with us."
                          : phase === "failed"
                            ? "We could not deliver it."
                            : "Your enquiry is ready to send."}
                      </h3>

                      <p className="sent-sub">
                        {delivered ? (
                          <>
                            It landed on our desk
                            {channels.length ? ` by ${channels.join(" and ")}` : ""}. We read
                            everything that comes in and reply from{" "}
                            {company.phone} — usually the same working day.
                          </>
                        ) : phase === "failed" ? (
                          <>
                            Something between us and our mail provider is down. Nothing is
                            lost — the message is written out below, and the buttons send
                            it straight to us.
                          </>
                        ) : (
                          <>
                            Use one of the buttons below — each carries the same message,
                            already written.
                          </>
                        )}
                      </p>

                      <div className="sent-actions">
                        <a
                          href={sent.wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={delivered ? "pill pill-ghost" : "pill pill-primary"}
                        >
                          {delivered ? "Message us on WhatsApp" : "Open WhatsApp"}
                        </a>
                        <a href={sent.mail} className="pill pill-ghost">
                          Send as email
                        </a>
                      </div>

                      {/* Hidden once it has actually been delivered: it is the
                          copy the visitor would send by hand, and offering it
                          alongside "it is with us" only raises the question of
                          whether it really is. */}
                      {!delivered && <pre className="sent-body">{sent.body}</pre>}

                      <div className="sent-actions">
                        {!delivered && (
                          <button type="button" className="pill pill-ghost pill-sm" onClick={copy}>
                            {copied ? "Copied ✓" : "Copy message"}
                          </button>
                        )}
                        <button type="button" className="pill pill-ghost pill-sm" onClick={reset}>
                          Write another
                        </button>
                      </div>

                      <p className="sent-note">
                        Prefer to call? {company.phone} · {company.hours}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <form onSubmit={onSubmit} onFocus={onFieldFocus} noValidate>
                  {/* The honeypot. Off-screen rather than display:none, which
                      some form-fillers skip, and taken out of the tab order and
                      the accessibility tree so nobody using a keyboard or a
                      screen reader can land in it by accident. */}
                  <div className="honeypot" aria-hidden="true">
                    <label htmlFor="c-website">Website</label>
                    <input
                      id="c-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

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
                Sending your enquiry…
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
