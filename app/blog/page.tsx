import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import RevealObserver from "@/components/RevealObserver";
import ContactSection from "@/components/ContactSection";
import { getPosts } from "@/lib/content";
import { company } from "@/content/site";

const title = "Blog — GST, loans, compliance and building software in India";
const description =
  "Practical guides for Indian business owners: GST returns and input credit, loan documentation and credit scores, MSME compliance, AI automation and getting found online.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: { title, description, url: "/blog" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function BlogIndex() {
  const posts = getPosts();
  const categories = [...new Set(posts.map((p) => p.category))];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${company.domain}`;

  // A Blog listing tells search and answer engines that these pages belong
  // together, which is what gets the collection surfaced rather than one
  // orphaned article.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${company.shortName} Blog`,
    url: `${siteUrl}/blog`,
    publisher: { "@type": "Organization", name: company.legalName },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      url: `${siteUrl}/blog/${p.slug}`,
      author: { "@type": "Organization", name: company.legalName },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RevealObserver />

      <main>
        <PageHero
          eyebrow="BLOG"
          title={
            <>
              Written for people who{" "}
              <span className="grad-text">have to file it.</span>
            </>
          }
          sub="Guides on the things Indian businesses actually get stuck on — returns, funding, paperwork, customers and software. No filler, and we say when the answer is 'ask your CA'."
          accent="#e8eef6"
        />

        <section className="section">
          <div className="shell">
            <div className="cat-row reveal">
              {categories.map((c) => (
                <span className="chip" key={c}>
                  {c}
                </span>
              ))}
              <span className="chip">{posts.length} posts</span>
            </div>

            <div className="post-list">
              {posts.map((post, i) => (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.slug}
                  className="post-card"
                  data-s3d={i % 2 === 0 ? "left" : "right"}
                >
                  <div className="post-meta">
                    <span className="mono-label post-cat">{post.category}</span>
                    <span className="mono-label">{fmt(post.date)}</span>
                    <span className="mono-label">{post.readingMinutes} min</span>
                  </div>
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-desc">{post.description}</p>
                  <span className="post-more">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
