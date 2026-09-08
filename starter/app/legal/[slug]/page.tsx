import { notFound } from "next/navigation";
import { legal } from "@/content/site";

export function generateStaticParams() {
  return legal.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: legal.find((l) => l.slug === slug)?.title ?? "" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = legal.find((x) => x.slug === slug);
  if (!l) notFound();
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: "42rem" }}>
        <h1>{l.title}</h1>
        {l.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </section>
  );
}
