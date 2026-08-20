import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Reads the file-backed collections the admin CMS writes to.
 *
 * Blog posts and announcements are markdown files in the repo, not database
 * rows. Publishing is a git commit, which means the published site is always
 * exactly what is in version control, every change is attributable, and there
 * is no third database to keep alive alongside the two the company already
 * runs for its other products.
 *
 * Everything here runs at build time only — server components import it, the
 * browser never does.
 */

const ROOT = process.cwd();

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  author: string;
  readingMinutes: number;
  /** Rendered HTML body. */
  html: string;
  /** Optional Q&A pairs, emitted as FAQPage structured data. */
  faq?: { q: string; a: string }[];
  draft?: boolean;
};

export type Announcement = {
  slug: string;
  title: string;
  date: string;
  kind: string;
  summary: string;
  /** Shown in the site-wide bar when true. Only the newest pinned one shows. */
  pinned?: boolean;
  cta?: { label: string; href: string };
  html: string;
  draft?: boolean;
};

function readCollection(dir: string) {
  const full = path.join(ROOT, "content", dir);
  if (!fs.existsSync(full)) return [];

  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.md$/, ""), data, content };
    });
}

/** Roughly 200 words a minute, floored at one. */
function readingTime(text: string) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export function getPosts(): Post[] {
  return readCollection("blog")
    .map(({ slug, data, content }) => ({
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      updated: data.updated ? String(data.updated) : undefined,
      category: String(data.category ?? "Guides"),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      author: String(data.author ?? "Zesst Now"),
      readingMinutes: readingTime(content),
      html: marked.parse(content, { async: false }) as string,
      faq: Array.isArray(data.faq)
        ? data.faq.map((f: { q?: string; a?: string }) => ({
            q: String(f.q ?? ""),
            a: String(f.a ?? ""),
          }))
        : undefined,
      draft: Boolean(data.draft),
    }))
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

/** Posts sharing a category, newest first, excluding the one being read. */
export function relatedPosts(post: Post, limit = 3): Post[] {
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter((p) => p.category === post.category);
  return [...sameCategory, ...others.filter((p) => p.category !== post.category)].slice(0, limit);
}

export function getAnnouncements(): Announcement[] {
  return readCollection("announcements")
    .map(({ slug, data, content }) => ({
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      kind: String(data.kind ?? "Update"),
      summary: String(data.summary ?? ""),
      pinned: Boolean(data.pinned),
      cta:
        data.cta && data.cta.label && data.cta.href
          ? { label: String(data.cta.label), href: String(data.cta.href) }
          : undefined,
      html: marked.parse(content, { async: false }) as string,
      draft: Boolean(data.draft),
    }))
    .filter((a) => !a.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** The one announcement the site-wide bar should show, if any. */
export function activeAnnouncement(): Announcement | undefined {
  return getAnnouncements().find((a) => a.pinned);
}
