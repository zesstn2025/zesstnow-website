import Link from "next/link";
import { services } from "@/content/site";
import Contact from "@/components/Contact";

export const metadata = { title: "सेवाएँ" };

export default function Services() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <h1>सेवाएँ</h1>
          <div className="grid" style={{ marginTop: "2rem" }}>
            {services.map((s) => (
              <Link key={s.slug} className="card" href={`/services/${s.slug}`}>
                <h3>{s.title}</h3><p>{s.blurb}</p>
                {s.price && <span className="price">{s.price}</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
}
