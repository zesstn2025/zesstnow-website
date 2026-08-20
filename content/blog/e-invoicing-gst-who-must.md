---
title: "E-invoicing under GST: who has to, and what actually changes"
description: "Which businesses are covered by e-invoicing, what an IRN and a QR code are for, what happens if you issue an invoice without one, and how to prepare before your turnover crosses the line."
date: "2026-09-03"
category: "GST & Tax"
tags: ["E-invoicing", "GST", "IRN", "Compliance"]
author: "Zesst Now"
faq:
  - q: "Is an invoice without an IRN valid?"
    a: "If e-invoicing applies to you, an invoice without a valid IRN is not a valid tax invoice. Your buyer's input tax credit on it is at risk, which is why buyers check."
  - q: "Does e-invoicing apply to B2C sales?"
    a: "The IRN requirement covers B2B supplies, exports and supplies to government. B2C is treated differently, though larger taxpayers have dynamic QR code obligations on B2C invoices."
  - q: "What happens when my turnover crosses the threshold mid-year?"
    a: "Applicability is assessed against turnover in a preceding financial year, and once you are covered you stay covered. Set your billing up before you cross, not after."
---

E-invoicing is often described as "invoices go to the government". That is not
quite it, and the difference matters.

## What it actually is

You still raise your own invoice, in your own system, with your own numbering.
What changes is that before you issue it, the invoice details are reported to the
Invoice Registration Portal, which validates them and returns:

- an **IRN** — Invoice Reference Number, a unique hash for that invoice
- a **signed QR code** you print on the invoice
- a digitally signed copy of the invoice data

So it is registration, not generation. The invoice remains yours.

## Who is covered

Applicability is based on **aggregate annual turnover in a preceding financial
year**, and the threshold has been lowered repeatedly since e-invoicing began —
each reduction pulling in a much larger group of smaller businesses.

Because the threshold has moved so often, check the figure currently in force
rather than relying on what you remember. The important structural points do not
change:

- It applies to **B2B supplies, exports and supplies to government**
- Once you are covered, you stay covered even if turnover later falls
- Some categories are specifically exempt regardless of turnover

## Why it matters commercially

The IRN flows into the GST system, which means your invoice data reaches your
buyer's GSTR-2B automatically and more reliably. That is genuinely good for
everyone.

The flip side is enforcement by counterparty. If you are covered and you issue an
invoice without an IRN, it is not a valid tax invoice — so your buyer's credit is
at risk. Buyers with competent accounts teams check, and they will hold payment
until you reissue.

## What to do before you are covered

**Know your number.** Aggregate turnover is PAN-level across all GSTINs, not per
registration. Businesses with more than one registration routinely underestimate
it.

**Check your billing software today.** Not whether it "supports GST" — whether it
can generate the e-invoice payload and register it. Adding this at the point you
cross the threshold, mid-year, under pressure, is the expensive way.

**Get master data clean first.** E-invoicing validates strictly. Wrong GSTINs,
bad HSN codes, missing pin codes fail at registration rather than being quietly
accepted. Cleaning up customer and item masters in advance saves a difficult
week.

**Understand the cancellation window.** An IRN can only be cancelled within a
short window after generation, and not at all once it has been used. After that
the correction route is a credit note. Sloppy invoicing gets expensive.

## Practically

[BizGST Pro](/products/bizgstpro) exports the e-invoice IRN JSON on the Pro plan,
with live IRN generation dependent on GSP integration and rolling out per plan.
Whatever tool you use, the preparation is the same: know your turnover, clean
your masters, and confirm your software can do it before you need it.

If you would rather someone else watched the threshold for you, our
[GST desk](/services#verticals) does exactly that.

---

*General information, not tax advice. Thresholds and rules change frequently.
Confirm current applicability with your chartered accountant.*
