import type { Profile } from "@/content/site";

/**
 * Renders only the profiles that have a real URL.
 *
 * A profile listed in content/site.ts with an empty `url` is skipped entirely —
 * a guessed facebook.com or linkedin.com slug lands on the wrong person or a
 * 404, and a broken link on a company site costs more trust than a missing one.
 */
export default function SocialLinks({
  profiles,
  label,
}: {
  profiles: Profile[];
  label?: string;
}) {
  const live = profiles.filter((p) => p.url);
  if (live.length === 0) return null;

  return (
    <div className="social-group">
      {label && <span className="mono-label">{label}</span>}
      <div className="social-row">
        {live.map((p) => (
          <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer">
            <span className="social-net">{p.network}</span>
            <span>{p.handle}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
