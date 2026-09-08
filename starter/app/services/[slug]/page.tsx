import { notFound } from "next/navigation";
import { services } from "@/content/site";
import Contact from "@/components/Contact";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return { title: s?.title ?? "सेवा", description: s?.blurb };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <>
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">सेवा</p>
          <h1>{s.title}</h1>
          <p className="lead">{s.blurb}</p>
          {s.body.map((p) => <p key={p} style={{ maxWidth: "42rem" }}>{p}</p>)}
          <ul className="ticks">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
          {s.price && <p className="price" style={{ marginTop: "1.5rem" }}>{s.price}</p>}
        </div>
      </section>
      <Contact />
    </>
  );
}
