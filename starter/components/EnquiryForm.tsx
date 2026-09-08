"use client";

import { useState } from "react";
import { company, contact } from "@/content/site";

/**
 * The enquiry form.
 *
 * If the mail server is not configured the API says so, and the form falls back
 * to a WhatsApp link carrying the same message rather than swallowing it. A
 * form that silently loses a customer's enquiry is worse for the client than
 * having no form, and on these sites it is the failure that actually happens —
 * an SMTP password expires and nobody notices for a month.
 */
export default function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "fallback" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setState("sending");
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (r.ok) { setState("ok"); form.reset(); return; }
      if (j.fallback) {
        setMsg(`नमस्ते, मैं ${data.name} — ${data.message} (फ़ोन: ${data.phone})`);
        setState("fallback");
        return;
      }
      setState("err");
    } catch {
      setState("err");
    }
  }

  if (state === "ok") return <p className="ok">{contact.thanks}</p>;

  if (state === "fallback")
    return (
      <p className="note">
        फ़ॉर्म अभी नहीं भेज पा रहा।{" "}
        <a className="btn" href={`https://wa.me/91${company.whatsapp}?text=${encodeURIComponent(msg)}`}
           target="_blank" rel="noopener">WhatsApp पर भेज दीजिए</a>
      </p>
    );

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>नाम
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </label>
      <label>फ़ोन नंबर
        <input name="phone" required inputMode="numeric" pattern="[0-9]{10}"
               maxLength={10} autoComplete="tel" placeholder="10 अंक" />
      </label>
      <label>क्या चाहिए?
        <textarea name="message" required minLength={5} maxLength={800} />
      </label>
      {/* Bots fill every field they can see. This one is hidden, so anything
          that arrives with it filled was not a person. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off"
             aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <button className="btn" disabled={state === "sending"}>
        {state === "sending" ? "भेजा जा रहा है…" : "भेजें"}
      </button>
      {state === "err" && <p className="err">कुछ गड़बड़ हुई। कृपया कॉल कर लीजिए।</p>}
    </form>
  );
}
