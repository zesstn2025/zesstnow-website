import Link from "next/link";
import { company, footer, social } from "@/content/site";
import SocialLinks from "./SocialLinks";
import Mark from "./Mark";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ fontSize: 16 }}>
              <Mark size={28} />
              {company.wordmark}
            </div>
            <p className="footer-blurb">{footer.blurb}</p>

            <div className="footer-contact">
              <a href={`https://wa.me/${company.phoneE164}`} target="_blank" rel="noopener noreferrer">
                {company.phone}
              </a>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>

            <SocialLinks profiles={social.company} />
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <div className="footer-links">
                {col.links.map((link) =>
                  link.href.startsWith("http") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="legal">
          <span>
            © {new Date().getFullYear()} {company.legalName}. {footer.rights}
          </span>
          <span>CIN {company.cin}</span>
          <span>
            {company.registeredOffice.district}, {company.registeredOffice.state} —{" "}
            {company.registeredOffice.pin}
          </span>
        </div>
      </div>
    </footer>
  );
}
