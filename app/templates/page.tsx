import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import SiteMenu from "@/components/SiteMenu";
import TemplateList from "@/components/TemplateList";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/site";
import { templates } from "@/data/templates";

export const metadata: Metadata = pageMeta(`Templates — ${profile.brand}`, "Free 3D, WebGL and scroll-animated page templates — see them live, copy the code. No libraries needed.", "/templates");

// Every template as a card with a live, scaled-down preview (sortable,
// filterable, small or large; see TemplateList). Reached from the menu.
export default function TemplatesPage() {
  return (
    <main className="u-detail" data-page="templates" style={{ "--c": "var(--m-lime)" } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <span className="flex items-center gap-5">
          <Link href="/#top" className="whitespace-nowrap">
            ← Home
          </Link>
          <span className="hidden sm:inline">{String(templates.length).padStart(2, "0")} templates</span>
        </span>
      </nav>

      <article className="u-detail-main">
        <header className="m-rise">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">Templates · free</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.04em]">See it live. Copy the code.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-soft sm:text-xl">
            3D, WebGL and scroll-animated pages you can play with — globes, carousels, terrains and more. Each one is a single HTML file: no libraries, nothing to install. Paste it, open it, make it yours.
          </p>
        </header>

        <div className="mt-12">
          <TemplateList items={templates} />
        </div>
      </article>
    </main>
  );
}
