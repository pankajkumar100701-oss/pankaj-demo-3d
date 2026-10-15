import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import ExploreTypes from "@/components/ExploreTypes";
import SiteMenu from "@/components/SiteMenu";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(`Explore your type — ${profile.brand}`, "Every kind of website I build — find yours, see live examples and add it to your message.", "/explore");

// Every website type (the 12 trending ones and the rest), searchable and
// sortable. Reached from the hero's "Explore your type".
export default function ExplorePage() {
  return (
    <main className="u-detail" data-page="explore" style={{ "--c": "var(--m-lime)" } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <span className="flex items-center gap-5">
          <Link href="/work" className="hidden whitespace-nowrap sm:inline">
            My work
          </Link>
          <Link href="/#top" className="whitespace-nowrap">
            ← Home
          </Link>
        </span>
      </nav>

      <article className="u-detail-main">
        <header className="m-rise">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">Explore your type · every kind</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.04em]">
            Find the website
            <br />
            that fits you.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-soft sm:text-xl">
            Pick the ones that sound like you and add them to your message — then customise it and send it to me on WhatsApp or email.
          </p>
        </header>

        <div className="mt-12">
          <ExploreTypes />
        </div>
      </article>
    </main>
  );
}
