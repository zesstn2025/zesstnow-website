import Link from "next/link";
import { company, footer, nav, products } from "@/content/site";
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
            <p
              style={{
                marginTop: 18,
                color: "var(--muted)",
                fontSize: 14.5,
                maxWidth: "44ch",
              }}
            >
              {footer.blurb}
            </p>
          </div>

          <div>
            <h4>Company</h4>
            <div className="footer-links">
              {nav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/#contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4>Products</h4>
            <div className="footer-links">
              {products.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`}>
                  {p.name}
                </Link>
              ))}
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
          </div>
        </div>

        <div className="legal">
          <span>
            © {new Date().getFullYear()} {company.legalName}
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
