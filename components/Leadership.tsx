import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { company, leadership, type Person } from "@/content/site";

/**
 * The leadership cards — photograph, name and role in a glass panel.
 *
 * The photograph is checked on disk at build time rather than trusted. Three
 * real people are named here, and a card is the wrong place to discover that a
 * file was never committed: a missing image would otherwise render as a broken
 * frame on the section a client looks at hardest. When the file is absent the
 * card falls back to a monogram, which reads as a considered placeholder
 * instead of a mistake. Commit the photograph at the path named in
 * content/site.ts and it appears on the next build, no code change needed.
 */
function hasPhoto(publicPath: string) {
  try {
    return fs.statSync(path.join(process.cwd(), "public", publicPath)).isFile();
  } catch {
    return false;
  }
}

function Portrait({ person }: { person: Person }) {
  if (!hasPhoto(person.photo)) {
    return (
      <div className="lead-photo lead-photo-empty" aria-hidden="true">
        <span className="lead-mono">{person.monogram}</span>
      </div>
    );
  }

  return (
    <div className="lead-photo">
      <Image
        src={person.photo}
        alt={`${person.name}, ${person.role} at ${company.shortName}`}
        width={900}
        height={1200}
        sizes="(max-width: 720px) 40vw, 260px"
        className="lead-img"
      />
      {/* The rim light that the rest of the site is built around, laid over
          the photograph so the card sits in the same world as the 3D. */}
      <span className="lead-rim" aria-hidden="true" />
    </div>
  );
}

export default function Leadership() {
  return (
    <section className="section" id="leadership">
      <div className="shell">
        <div className="section-head reveal">
          <span className="eyebrow">{leadership.eyebrow}</span>
          <h2 className="section-title">{leadership.title}</h2>
          <p className="section-sub">{leadership.sub}</p>
        </div>

        <div className="lead-grid">
          {leadership.people.map((person, i) => (
            <article
              className="glass lead reveal"
              key={person.name}
              data-delay={i * 110}
              /* Each card sits at a slightly different depth, so moving the
                 cursor separates them the way the reference films do. */
              data-parallax={0.5 + i * 0.25}
              data-s3d="up"
            >
              <Portrait person={person} />

              <div className="lead-body">
                <h3 className="lead-name">{person.name}</h3>
                <span className="mono-label lead-role">{person.role}</span>
                <span className="lead-scope">{person.scope}</span>
                <p className="lead-bio">{person.bio}</p>

                {person.links?.some((l) => l.url) && (
                  <div className="lead-links">
                    {person.links
                      .filter((l) => l.url)
                      .map((l) => (
                        <a
                          key={l.network}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lead-link"
                        >
                          {l.network} ↗
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
