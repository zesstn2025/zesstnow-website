import Link from "next/link";
import { company, hero, services, why, gallery, testimonials, faq } from "@/content/site";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">{company.address.town}</p>
          <h1>{hero.heading}</h1>
          <p className="lead">{hero.sub}</p>
          <div className="btns">
            <a className="btn" href={hero.primary.href}>{hero.primary.label}</a>
            {company.whatsapp && company.whatsapp !== "CONFIRM" && (
              <a className="btn ghost" target="_blank" rel="noopener"
                 href={`https://wa.me/91${company.whatsapp}`}>WhatsApp पर पूछें</a>
            )}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <h2>हमारी सेवाएँ</h2>
          <div className="grid" style={{ marginTop: "1.5rem" }}>
            {services.map((s) => (
              <Link key={s.slug} className="card" href={`/services/${s.slug}`}>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                {s.price && <span className="price">{s.price}</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {why.some((w) => w.title !== "CONFIRM") && (
        <section className="section">
          <div className="wrap">
            <h2>हमें क्यों चुनें</h2>
            <div className="grid" style={{ marginTop: "1.5rem" }}>
              {why.map((w) => (
                <div key={w.title} className="card">
                  <h3>{w.title}</h3><p>{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="section alt">
          <div className="wrap">
            <h2>एक नज़र</h2>
            <div className="gallery" style={{ marginTop: "1.5rem" }}>
              {gallery.map((g) => (
                <img key={g.src} src={g.src} alt={g.alt} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="section">
          <div className="wrap">
            <h2>ग्राहक क्या कहते हैं</h2>
            <div style={{ marginTop: "1.5rem" }}>
              {testimonials.map((t) => (
                <blockquote className="quote" key={t.quote}>
                  <p>“{t.quote}”</p>
                  <cite>— {t.name}{t.place && `, ${t.place}`}</cite>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="section alt">
          <div className="wrap faq">
            <h2>अक्सर पूछे जाने वाले सवाल</h2>
            <div style={{ marginTop: "1.5rem" }}>
              {faq.map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>
      )}

      <Contact />
    </>
  );
}
