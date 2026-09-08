import { company, contact } from "@/content/site";
import EnquiryForm from "./EnquiryForm";

export default function Contact() {
  const a = company.address;
  return (
    <section className="section alt" id="contact">
      <div className="wrap">
        <h2>{contact.heading}</h2>
        <p className="lead">{contact.sub}</p>
        <div className="two" style={{ marginTop: "2rem" }}>
          <EnquiryForm />
          <ul className="deets">
            <li><b>फ़ोन</b><a href={`tel:+91${company.phone}`}>+91 {company.phone}</a></li>
            {company.email && (
              <li><b>ईमेल</b><a href={`mailto:${company.email}`}>{company.email}</a></li>
            )}
            <li><b>पता</b>{a.line}, {a.town}, {a.district} — {a.pin}</li>
            <li><b>समय</b>{company.hours}</li>
            {a.mapUrl && (
              <li><b>नक़्शा</b><a href={a.mapUrl} rel="noopener">Google Maps पर देखें</a></li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
