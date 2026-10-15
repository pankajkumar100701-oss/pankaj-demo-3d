import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import SiteMenu from "@/components/SiteMenu";
import { findPost, formatDate, posts } from "@/data/blog";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = findPost(slug);
  return p ? pageMeta(`${p.title} — ${profile.brand}`, p.blurb, `/blog/${p.slug}`) : {};
}

// One blog post (data/blog.ts), then the way to the next one and to Contact.
export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const post = posts[index];
  const next = posts[(index + 1) % posts.length];

  return (
    <main className="u-detail" data-page="blog" style={{ "--c": "var(--m-blue)" } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <Link href="/blog" className="whitespace-nowrap">
          ← All posts
        </Link>
      </nav>

      <article className="u-detail-main f-post">
        <header className="m-rise">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">
            {formatDate(post.date)} · {post.minutes} min read
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.03em]">{post.title}</h1>
        </header>

        <div className="f-post-body">
          {post.body.map((b, i) =>
            "h" in b ? (
              <h2 key={i}>{b.h}</h2>
            ) : "p" in b ? (
              <p key={i}>{b.p}</p>
            ) : (
              <ul key={i}>
                {b.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            ),
          )}
        </div>

        <section className="m-card mt-16 rounded-2xl p-6 sm:p-10">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">Have a question?</p>
          <p className="mt-4 max-w-xl font-display text-3xl leading-tight sm:text-4xl">Tell me about your business.</p>
          <p className="mt-3 text-muted">I&apos;ll reply with a plan and a fixed price.</p>
          <div className="h-cta" style={{ justifyContent: "flex-start" }}>
            <Link href="/contact" className="u-cta-primary">
              Customise your website plan <span aria-hidden>→</span>
            </Link>
            {next.slug !== post.slug && (
              <Link href={`/blog/${next.slug}`} className="u-cta-ghost">
                Next: {next.title}
              </Link>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}
