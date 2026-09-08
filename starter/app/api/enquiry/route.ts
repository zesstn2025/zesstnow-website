import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { company } from "@/content/site";

/**
 * Where an enquiry goes.
 *
 * Mail is sent through whatever SMTP the client already has, configured by
 * environment variables and never committed. If it is not configured — or it
 * fails — this returns `fallback: true` instead of a bare error, and the form
 * hands the customer a WhatsApp link carrying the same message. The enquiry
 * reaches the shop either way, which is the only thing that matters here.
 */

export const runtime = "nodejs";

type Body = { name?: string; phone?: string; message?: string; website?: string };

const clean = (s: unknown, max: number) =>
  typeof s === "string" ? s.trim().slice(0, max) : "";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // The honeypot. A human never sees this field, so anything in it is a bot —
  // answered with a 200 so the bot records a success and does not retry.
  if (clean(body.website, 1)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 10).replace(/\D/g, "");
  const message = clean(body.message, 800);

  if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || message.length < 5)
    return NextResponse.json({ error: "invalid" }, { status: 422 });

  const to = process.env.ENQUIRY_TO || company.email;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!to || !SMTP_HOST || !SMTP_USER || !SMTP_PASS)
    return NextResponse.json({ fallback: true }, { status: 503 });

  try {
    const tx = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await tx.sendMail({
      from: `"${company.name} website" <${SMTP_USER}>`,
      to,
      replyTo: company.email || undefined,
      subject: `नई पूछताछ — ${name} (${phone})`,
      text: `नाम: ${name}\nफ़ोन: ${phone}\n\n${message}\n\n— ${company.name} की website से`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Deliberately a fallback, not a 500. The customer should still get through.
    return NextResponse.json({ fallback: true }, { status: 503 });
  }
}
