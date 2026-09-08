import { about, company } from "@/content/site";
import Contact from "@/components/Contact";

export const metadata = { title: "हमारे बारे में" };

export default function About() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">{company.address.town}</p>
          <h1>{about.heading}</h1>
          {about.body.map((p) => <p key={p} style={{ maxWidth: "42rem" }}>{p}</p>)}
        </div>
      </section>
      <Contact />
    </>
  );
}
