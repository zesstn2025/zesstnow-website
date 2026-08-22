"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { company, nav, servicePages } from "@/content/site";
import Mark from "./Mark";

/**
 * The one navigation bar, mounted once in the root layout.
 *
 * Mounted once matters. Rendered per page, this component was rebuilt on every
 * route change: the scroll listener re-attached and the "scrolled" state reset
 * to false, so the bar flashed back to its transparent state for a frame before
 * catching up with where the page actually was. Living in the layout it simply
 * never unmounts — which is also most of why switching pages feels instant,
 * because the frame around the content does not move at all.
 *
 * The services menu is here because there are five service pages now and the
 * bar can spare one word for them. It opens on hover for a mouse and on tap for
 * everything else, and underneath it is a plain list of links — so it works
 * from the keyboard, and a crawler sees five real anchors rather than a script
 * that might produce some.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState(false);
  const pathname = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setServices(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // A menu still open after you have arrived somewhere else is a menu that has
  // to be dismissed. Both close on every route change.
  useEffect(() => {
    setOpen(false);
    setServices(false);
  }, [pathname]);

  // Pressing away closes the dropdown. `pointerdown` rather than `click`, so it
  // closes on the press instead of waiting for the release.
  useEffect(() => {
    if (!services) return;
    const onDown = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServices(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [services]);

  /** Marks the section you are in, not only the exact page. */
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label={`${company.shortName} home`}>
            <Mark size={30} />
            {company.wordmark}
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {nav.map((item) =>
              item.href === "/services" ? (
                <div
                  className="nav-drop"
                  key={item.href}
                  ref={servicesRef}
                  onMouseEnter={() => setServices(true)}
                  onMouseLeave={() => setServices(false)}
                >
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    aria-expanded={services}
                    onClick={(e) => {
                      // With no hover to open it, the first tap opens the menu
                      // instead of navigating past it. The index page is still
                      // one tap away, at the foot of the panel.
                      if (window.matchMedia("(hover: none)").matches && !services) {
                        e.preventDefault();
                        setServices(true);
                      }
                    }}
                  >
                    {item.label}
                    <span className="nav-caret" aria-hidden="true" />
                  </Link>

                  <div className="nav-panel glass" data-open={services}>
                    {servicePages.map((page) => (
                      <Link
                        href={`/services/${page.slug}`}
                        key={page.slug}
                        className="nav-panel-row"
                        aria-current={
                          pathname === `/services/${page.slug}` ? "page" : undefined
                        }
                      >
                        <span className="nav-panel-t">{page.navLabel}</span>
                        <span className="nav-panel-b">{page.lead}</span>
                      </Link>
                    ))}
                    <Link href="/services" className="nav-panel-all mono-label">
                      All services →
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="nav-right">
            <Link href="/contact" className="pill pill-primary pill-sm">
              Start a project
            </Link>
            <button
              type="button"
              className="burger"
              data-open={open}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" data-open={open}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}

        {/* The service pages, indented under Services. On a phone a hover menu
            is no menu at all, so they are simply listed. */}
        <div className="mobile-sub">
          {servicePages.map((page) => (
            <Link href={`/services/${page.slug}`} key={page.slug}>
              {page.navLabel}
            </Link>
          ))}
        </div>

        <Link href="/contact" className="mobile-cta">
          Start a project →
        </Link>
      </div>
    </>
  );
}
