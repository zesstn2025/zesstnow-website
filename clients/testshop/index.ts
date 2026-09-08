/**
 * Barrel. Everything the site renders comes from here, so components import
 * one path and the modules can be reorganised without touching them.
 *
 * Editing a client's site? Open the module, not this file:
 *
 *   ./brand      colours, fonts, radius — the whole visual identity
 *   ./company    name, phone, WhatsApp, address, hours, accounts
 *   ./services   what they sell, and why them
 *   ./pages      hero, gallery, about, FAQ, contact, legal, nav
 *
 * Those four files are the entire job. Nothing in app/ or components/ should
 * need changing for a normal client site.
 */

export * from "./brand";
export * from "./company";
export * from "./services";
export * from "./pages";
