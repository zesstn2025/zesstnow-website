"use client";

import Image from "next/image";
import { useState } from "react";
import type { Work } from "@/content/site";

/**
 * A portfolio entry, built around real screenshots of the live site.
 *
 * The desktop shots go in a browser frame and the mobile shot in a phone frame
 * overlapping it, which is what makes a flat JPEG read as a shipped product
 * rather than a picture. Clicking a thumbnail swaps the framed shot; with JS
 * off the first one still renders, which is the one that matters.
 */
export default function WorkCard({ work, index }: { work: Work; index: number }) {
  const desktop = work.shots.filter((s) => s.device === "desktop");
  const phone = work.shots.find((s) => s.device === "mobile");
  const [active, setActive] = useState(0);
  const shown = desktop[active] ?? desktop[0];

  return (
    <article className="work" data-flip={index % 2 === 1}>
      <div className="work-shots reveal">
        <div className="browser tilt-host">
          <div className="browser-bar" aria-hidden="true">
            <span className="browser-dot" />
            <span className="browser-dot" />
            <span className="browser-dot" />
            <span className="browser-url">{work.domain}</span>
          </div>
          <div className="browser-view">
            {/* Every desktop shot is mounted so switching never shows a gap;
                only the active one is visible. */}
            {desktop.map((shot, i) => (
              <Image
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                width={2160}
                height={1350}
                sizes="(max-width: 900px) 92vw, 46vw"
                priority={index === 0 && i === 0}
                data-on={i === active}
                className="browser-img"
              />
            ))}
          </div>
        </div>

        {phone && (
          <div className="phone" aria-hidden="true">
            <div className="phone-notch" />
            <Image
              src={phone.src}
              alt={phone.alt}
              width={585}
              height={1266}
              sizes="150px"
              className="phone-img"
            />
          </div>
        )}

        {desktop.length > 1 && (
          <div className="shot-dots" role="tablist" aria-label={`${work.client} screenshots`}>
            {desktop.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={shot.alt}
                data-on={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="work-copy reveal" data-delay={120}>
        <div className="work-meta">
          <span className="mono-label">{work.year}</span>
          <span className="mono-label work-role">{work.role}</span>
        </div>

        <h3 className="work-name">{work.client}</h3>

        <a
          href={work.url}
          target="_blank"
          rel="noopener noreferrer"
          className="work-domain"
        >
          {work.domain} ↗
        </a>

        <p className="work-summary">{work.summary}</p>

        <div className="work-highlights">
          {work.highlights.map((h) => (
            <div key={h.label}>
              <div className="work-hl-v">{h.label}</div>
              <div className="work-hl-l">{h.body}</div>
            </div>
          ))}
        </div>

        <div className="svc-pts">
          {work.tags.map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
