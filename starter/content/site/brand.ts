/**
 * The client's whole visual identity, in one object.
 *
 * Every colour, font and measurement the site uses is here. Nothing in
 * components/ or app/ hardcodes a colour — `layout.tsx` turns this object into
 * CSS custom properties and the stylesheet reads them, so changing a client's
 * look is editing this file and nothing else.
 *
 * That is the point of the starter: the layout, the code and the behaviour are
 * already built and identical for every client, and what differs between one
 * shop and the next is this file plus the four beside it.
 *
 * RULES THAT ARE NOT PREFERENCES
 *
 *   - No yellow, no gold. Company standard, no exceptions.
 *   - `ink` must never be pure #000000 and `surface` never pure #ffffff. Both
 *     read as unstyled — as a page that nobody chose the colours for, which is
 *     exactly the impression a client is paying to avoid.
 *   - `accent` has to clear 4.5:1 against `surface`, because it carries button
 *     text and links. Check it before shipping; a pretty accent that fails
 *     contrast is a site that older customers cannot read, and in this market
 *     they are a large share of who is buying.
 */

export const brand = {
  /* ── colour ─────────────────────────────────────────────────────────── */
  ink: "#141b1a", // headings and body text
  surface: "#faf9f6", // page ground
  surfaceAlt: "#f0eee7", // sunk panels, alternating sections
  line: "#ddd9cf", // hairlines, card borders
  muted: "#5d6560", // secondary text
  accent: "#0f5f52", // buttons, links, the one loud colour
  accentInk: "#faf9f6", // text that sits on `accent`
  accentSoft: "#e4efe9", // accent at low strength — chips, highlights

  /* Dark mode. The site renders in whatever theme the visitor's phone is set
     to, and in this market most phones are set to dark. It is not an extra. */
  darkInk: "#eceae2",
  darkSurface: "#12140f",
  darkSurfaceAlt: "#1a1d16",
  darkLine: "#2f332a",
  darkMuted: "#a6a89c",
  darkAccent: "#63c0a8",
  darkAccentInk: "#12140f",
  darkAccentSoft: "#1c2a24",

  /* ── type ───────────────────────────────────────────────────────────── */
  /* Loaded from Google Fonts in layout.tsx. Any face used for Hindi copy must
     be a Devanagari family — a Latin-only face silently falls back to whatever
     the phone has, and the page stops looking designed at the first Hindi
     word. */
  displayFont: "Fraunces",
  displayWeights: "400;600;700",
  bodyFont: "Noto Sans Devanagari",
  bodyWeights: "400;500;700",
  fallback: "system-ui, -apple-system, Segoe UI, sans-serif",

  /* ── measurement ────────────────────────────────────────────────────── */
  radius: "4px",
  maxWidth: "68rem",
} as const;

export type Brand = typeof brand;
