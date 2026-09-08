import Link from "next/link";
import { company, nav } from "@/content/site";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="wrap">
        <Link href="/" className="brandmark">
          {company.name}
          <span>{company.address.town}</span>
        </Link>
        <div className="navlinks">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </div>
        <a className="btn" href={`tel:+91${company.phone}`}>कॉल करें</a>
      </div>
    </nav>
  );
}
