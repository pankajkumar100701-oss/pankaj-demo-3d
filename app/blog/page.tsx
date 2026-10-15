import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import SiteMenu from "@/components/SiteMenu";
import { formatDate, posts } from "@/data/blog";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(`Blog — ${profile.brand}`, "Plain advice on websites for small businesses: prices, phones, Instagram and getting started.", "/blog");

// Every post from data/blog.ts, newest first. Reached from the menu ("Blog").
export default function BlogPage() {
  return (
    <main className="u-detail" data-page="blog" style={{ "--c": "var(--m-blue)" } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <Link href="/#top" className="whitespace-nowrap">
          ← Home
        </Link>
      </nav>

      <article className="u-detail-main">
        <header className="m-rise">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">Blog</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.04em]">Notes on websites.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-soft sm:text-xl">
            Straight answers to the questions small business owners ask me most.
          </p>
        </header>

        <ul className="f-blog-list">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`}>
                <small>
                  {formatDate(p.date)} · {p.minutes} min read
                </small>
                <strong>{p.title}</strong>
                <span>{p.blurb}</span>
                <em>
                  Read <span aria-hidden>→</span>
                </em>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
