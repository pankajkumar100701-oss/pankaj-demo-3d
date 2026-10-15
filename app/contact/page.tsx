import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import ContactBuilder from "@/components/ContactBuilder";
import SiteMenu from "@/components/SiteMenu";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(`Customise your website plan — ${profile.brand}`, "Tell me what you need: pick your type, the ideas you want and send it on WhatsApp or email.", "/contact");

// Its own page, away from the home page's scroll: the visitor writes their
// message to me step by step (see ContactBuilder).
export default function ContactPage() {
  return (
    <main className="u-detail" data-page="contact" style={{ "--c": "var(--m-coral)" } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <span className="flex items-center gap-5">
          <Link href="/explore" className="hidden whitespace-nowrap sm:inline">
            Explore types
          </Link>
          <Link href="/#top" className="whitespace-nowrap">
            ← Home
          </Link>
        </span>
      </nav>

      <article className="u-detail-main">
        <header className="m-rise">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">Contact · Customise your website plan</p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.04em]">
            Your website,
            <br />
            your words.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-soft sm:text-xl">
            Pick what you need and I&apos;ll write the message for you. Change anything you like, then send it on WhatsApp or by email — I reply with a plan and a price.
          </p>
        </header>

        <div className="mt-12">
          <ContactBuilder />
        </div>
      </article>
    </main>
  );
}
