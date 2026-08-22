import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { getPost, getPosts, relatedPosts } from "@/lib/content";
import { company } from "@/content/site";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [company.legalName],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;
  const url = `${siteUrl}/blog/${post.slug}`;
  const related = relatedPosts(post);

  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: company.legalName, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: company.legalName,
      url: siteUrl,
    },
  };

  // Answer engines lift FAQPage entries almost verbatim, so the questions are
  // written as the questions people actually type.
  const faq = post.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <RevealObserver />

      <main>
        <PageHero
          eyebrow={post.category}
          title={post.title}
          back={{ label: "All posts", href: "/blog" }}
        >
          <div className="post-meta reveal" data-delay={200} style={{ marginTop: 26 }}>
            <span className="mono-label">{fmt(post.date)}</span>
            <span className="mono-label">{post.readingMinutes} min read</span>
            <span className="mono-label">{post.author}</span>
          </div>
        </PageHero>

        <section className="section">
          <div className="shell shell-narrow">
            <article
              className="prose reveal"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {post.faq?.length ? (
              <div className="prose reveal" style={{ marginTop: 56 }}>
                <h2>Common questions</h2>
                {post.faq.map((f) => (
                  <div key={f.q} style={{ marginBottom: 22 }}>
                    <h3 className="faq-h">{f.q}</h3>
                    <p>{f.a}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="svc-pts reveal" style={{ marginTop: 44 }}>
              {post.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="section section-alt">
            <div className="shell">
              <div className="section-head reveal">
                <span className="eyebrow">KEEP READING</span>
                <h2 className="section-title">Related guides</h2>
              </div>

              <div className="post-list">
                {related.map((r, i) => (
                  <Link
                    href={`/blog/${r.slug}`}
                    key={r.slug}
                    className="post-card"
                    data-s3d={i % 2 === 0 ? "left" : "right"}
                  >
                    <div className="post-meta">
                      <span className="mono-label post-cat">{r.category}</span>
                      <span className="mono-label">{r.readingMinutes} min</span>
                    </div>
                    <h3 className="post-title">{r.title}</h3>
                    <p className="post-desc">{r.description}</p>
                    <span className="post-more">Read →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
