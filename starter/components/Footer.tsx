import Link from "next/link";
import { company, footer, legal } from "@/content/site";

export default function Footer() {
  const social = company.social.filter((s) => s.url);
  return (
    <footer className="site">
      <div className="wrap">
        <p><b>{company.name}</b><br />
          {company.address.line}, {company.address.town}, {company.address.district} — {company.address.pin}<br />
          <a href={`tel:+91${company.phone}`}>+91 {company.phone}</a>
          {company.email && <> · <a href={`mailto:${company.email}`}>{company.email}</a></>}
        </p>
        <p>{company.hours}</p>
        {social.length > 0 && (
          <p>{social.map((s, i) => (
            <span key={s.network}>{i > 0 && " · "}
              <a href={s.url} rel="noopener">{s.network}</a></span>
          ))}</p>
        )}
        <p>{legal.map((l, i) => (
          <span key={l.slug}>{i > 0 && " · "}
            <Link href={`/legal/${l.slug}`}>{l.title}</Link></span>
        ))}</p>
        {company.gstin && <p>GSTIN: {company.gstin}</p>}
        <p>{footer.note}</p>
        {/* One quiet line, on every client site. Over a year this is the
            cheapest lead source the company has. */}
        <p className="built">
          वेबसाइट — <a href={company.builtBy.url} rel="noopener">{company.builtBy.name}</a>
        </p>
      </div>
    </footer>
  );
}
