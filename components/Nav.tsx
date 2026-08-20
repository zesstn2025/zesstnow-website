"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { company, nav } from "@/content/site";
import Mark from "./Mark";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label={`${company.shortName} home`}>
            <Mark size={30} />
            {company.wordmark}
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
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
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link href="/contact" onClick={() => setOpen(false)} className="mobile-cta">
          Start a project →
        </Link>
      </div>
    </>
  );
}
