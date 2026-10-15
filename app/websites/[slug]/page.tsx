import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { AddToMessage, ShareLink } from "@/components/MessageActions";
import Websites from "@/components/multitudes/Websites";
import { Heading, Hero } from "@/components/multitudes/ui";
import SiteMenu from "@/components/SiteMenu";
import { allTypes, profile } from "@/data/profile";
import { kinds } from "@/data/multitudes";
import { pageMeta } from "@/lib/site";

// Every website type has a page: the 12 trending ones, then the rest.
const multitudes = allTypes;

export const dynamicParams = false;

export function generateStaticParams() {
  return multitudes.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/websites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = multitudes.find((x) => x.slug === slug);
  return m ? pageMeta(`${m.title} — ${profile.brand}`, m.intro, `/websites/${m.slug}`) : {};
}

export default async function MultitudePage({ params }: PageProps<"/websites/[slug]">) {
  const { slug } = await params;
  const index = multitudes.findIndex((x) => x.slug === slug);
  if (index === -1) notFound();

  const m = multitudes[index];
  const prev = multitudes[(index - 1 + multitudes.length) % multitudes.length];
  const next = multitudes[(index + 1) % multitudes.length];
  const list = kinds[m.slug] ?? [];

  return (
    <main className="u-detail" data-page={m.slug} style={{ "--c": m.color } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <span className="flex items-center gap-5">
          <Link href="/explore" className="whitespace-nowrap">
            ← <span className="hidden min-[400px]:inline">All </span>types
          </Link>
          <span className="hidden sm:inline">
            {m.n} / {String(multitudes.length).padStart(2, "0")}
          </span>
        </span>
      </nav>

      <article className="u-detail-main">
        <Hero m={m}>
          <div className="x-type-actions mt-8">
            <Link href={`/contact?type=${m.slug}`} className="m-cta m-cta-sm">
              Customise yours <span aria-hidden>→</span>
            </Link>
            <AddToMessage kind="types" id={m.slug} />
            <ShareLink path={`/websites/${m.slug}`} title={`${m.title} websites — ${profile.brand}`} />
          </div>
        </Hero>

        {/* The different websites I can build for this kind of business:
            folded to a row of names (so the websites below are a scroll
            away), opening into the full cards. */}
        <section id="what-i-build" className="mt-16 scroll-mt-10">
          <Heading n="01">{m.title} websites I can build</Heading>
          <details className="k-fold">
            <summary>
              <span className="k-fold-names">
                {list.map((k) => (
                  <span key={k.title}>{k.title}</span>
                ))}
                {list.length === 0 && <span>What any {m.title} site can have</span>}
              </span>
              <span className="k-fold-toggle">
                <span className="k-fold-more">See details</span>
                <span className="k-fold-less">Hide</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </summary>
            {list.length > 0 && (
              <ul className="k-grid">
                {list.map((k, i) => (
                  <li key={k.title} className="k-card">
                    <span className="font-sans text-[0.625rem] tracking-[0.15em] text-ink">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-2 font-display text-2xl leading-tight">{k.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-soft">{k.text}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Includes">
                      {k.has.map((h) => (
                        <li key={h} className="m-tag">
                          {h}
                        </li>
                      ))}
                    </ul>
                    <AddToMessage kind="ideas" id={k.title} label="I want this" addedLabel="Added to message" className="k-add" />
                  </li>
                ))}
              </ul>
            )}
            <div className="k-extras">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">Any of them can have</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {m.features.map((f) => (
                  <li key={f}>
                    <AddToMessage kind="ideas" id={f} label={f} addedLabel={f} className="k-chip" />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </section>

        <Websites m={m} n="02" />
      </article>

      <nav className="u-detail-pager" aria-label="Other website types">
        <Link href={`/websites/${prev.slug}`}>
          <small>← Previous</small>
          {prev.title}
        </Link>
        <Link href={`/websites/${next.slug}`}>
          <small>Next →</small>
          {next.title}
        </Link>
      </nav>
    </main>
  );
}
