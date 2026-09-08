/**
 * SINGLE SOURCE OF TRUTH FOR ALL SITE COPY.
 *
 * Nothing in components/ hardcodes user-facing text — edit it here and the
 * whole site updates. Everything that used to live in one 91 KB file is now
 * split across the modules below, and this barrel re-exports all of it, so
 * every existing `from "@/content/site"` import keeps working unchanged.
 *
 * The split is not tidiness. Reading the old single file cost about 23,000
 * tokens, and a session that only needed to change a footer line paid all of
 * it. Now the footer is in ./pages and the service copy — three quarters of
 * the weight — is only read when it is the thing being edited.
 *
 * Editing? Open the module, not this file:
 *
 *   ./company        registration facts, leadership, social accounts
 *   ./services       the service list, USPs, verticals, process
 *   ./service-pages  the full copy of each service page (the big one)
 *   ./products       BizGST Pro, the suite, the roadmap
 *   ./pages          home, work, about, FAQ, contact, footer, legal, nav
 *
 * Anything still marked `CONFIRM:` is NOT verified — replace before launch.
 */

export * from "./company";
export * from "./services";
export * from "./service-pages";
export * from "./products";
export * from "./pages";
