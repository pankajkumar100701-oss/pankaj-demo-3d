"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { inType, profile, type WebsiteType, type Project } from "@/data/profile";
import { AddToMessage } from "@/components/MessageActions";
import { SizeSwitch, readSize, saveSize } from "@/components/PopCard";
import { Heading } from "./ui";

const sizes = [
  { value: "small", label: "Small" },
  { value: "large", label: "Large" },
] as const;
type Size = (typeof sizes)[number]["value"];
const SIZE_KEY = "type-sites-size";

// Closes every multitude's page: the websites built for it (projects in
// data/profile.ts whose `multitude` is this slug), each as a showcase — the
// site in a browser frame beside who it's for, what's inside, tags and a
// live link. A small / large switch shrinks them to compact cards with a
// direct "Visit" button. Until there are some, an invitation to be the first.
export default function Websites({ m, n = "✦" }: { m: WebsiteType; n?: string }) {
  const sites = profile.projects.filter((p) => inType(p, m.slug));
  const [size, setSize] = useState<Size>("large");

  // The remembered size is only readable in the browser; sync it in after hydration.
  useEffect(() => {
    const saved = readSize(SIZE_KEY, sizes);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setSize(saved);
  }, []);
  const pickSize = (v: Size) => {
    setSize(v);
    saveSize(SIZE_KEY, v);
  };

  return (
    <section id="websites" className="mt-24 scroll-mt-10">
      <div className="x-sites-head">
        <Heading n={n}>{sites.length === 0 ? "Websites" : "Websites I've built"}</Heading>
        {sites.length > 0 && <SizeSwitch options={sizes} value={size} onChange={pickSize} />}
      </div>
      {sites.length === 0 ? (
        <div className="m-workshop-empty rounded-2xl p-6 sm:p-10">
          <p className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">Yours could be the first {m.title} site here.</p>
          <p className="mt-3 max-w-xl text-muted">Meanwhile, see how I build for others — the same care goes into yours.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/contact?type=${m.slug}`} className="m-cta m-cta-sm">
              Customise your website plan <span aria-hidden>→</span>
            </Link>
            <Link href="/work" className="x-share">
              See my work
            </Link>
          </div>
        </div>
      ) : (
        <div className={size === "small" ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3" : "space-y-6"}>
          {sites.map((p, i) => (
            <ProjectShowcase key={p.title} p={p} i={i} size={size} direct />
          ))}
        </div>
      )}
    </section>
  );
}

// One website as a showcase: the site in a browser frame beside who it's for,
// what's inside, tags, a live link and "I want one like this" (adds it to the
// visitor's message). Also used by the /work page, where
// `kicker` names the multitude it belongs to and `size` (the /work page's
// card size) can stack it: "medium" puts the site above the details, "small"
// also trims it to the title, one line and the buttons.
// With `onOpen`, tapping the site's picture or title calls it (to pop the card
// open) instead of visiting the site. `direct` keeps a "Visit" button on
// small cards, even on phones (where small cards otherwise drop the buttons).
export function ProjectShowcase({ p, i, kicker, size = "large", onOpen, direct }: { p: Project; i: number; kicker?: ReactNode; size?: "large" | "medium" | "small"; onOpen?: () => void; direct?: boolean }) {
  const small = size === "small";
  // Client reviews of this site (profile.reviews with `site` set to its title).
  const reviews = profile.reviews.filter((r) => r.site === p.title);
  return (
    <article className={`m-show m-rise group grid overflow-hidden rounded-2xl ${size === "large" ? "md:grid-cols-[1.3fr_1fr]" : ""}`} data-size={size} data-direct={(direct && small) || undefined} style={{ "--p": p.color, animationDelay: `${i * 0.1}s` } as CSSProperties}>
      {/* The site in a little browser window that tilts toward you on hover. */}
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        className="m-show-stage"
        aria-label={onOpen ? `More about ${p.title}` : `Open ${p.title}`}
        onClick={
          onOpen &&
          ((e) => {
            e.preventDefault();
            onOpen();
          })
        }
      >
        <span className="m-browser">
          <span className="m-browser-bar" aria-hidden>
            <i />
            <i />
            <i />
            <span>{p.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
          </span>
          <span className="m-shot relative block aspect-[16/10] overflow-hidden">
            {p.image ? (
              <Image src={p.image} alt={`${p.title} — home page`} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover object-top transition duration-[1.2s] group-hover:scale-[1.03]" />
            ) : (
              <span className="m-shot-blank" aria-hidden>
                {p.title}
              </span>
            )}
            {p.concept && <span className="m-concept">Sample design</span>}
          </span>
        </span>
      </a>
      <div className={`flex flex-col justify-center ${size === "large" ? "p-5 sm:p-8 lg:px-12" : small ? "p-4 sm:p-5" : "p-5 sm:p-7"}`}>
        <p className="flex items-center justify-between gap-4 font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-ink">
          <span>{String(i + 1).padStart(2, "0")} — {kicker ?? (p.concept ? "Sample design" : "Live")}</span>
          {p.year && <span className="text-muted">{p.year}</span>}
        </p>
        <h3 className={`mt-3 font-display leading-[1.05] ${small ? "text-xl sm:text-2xl" : "text-3xl lg:text-4xl"}`}>
          {onOpen ? (
            <button type="button" onClick={onOpen} className="text-left hover:underline">
              {p.title}
            </button>
          ) : (
            p.title
          )}
        </h3>
        {p.client && !small && <p className="mt-1.5 text-sm text-muted">{p.concept ? "Sample design for" : "for"} {p.client}</p>}
        <p className={`m-show-desc mt-3 text-sm leading-relaxed text-soft ${small ? "line-clamp-2" : ""}`}>{p.description}</p>
        {p.highlights && !small && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.highlights.map((h) => (
              <li key={h} className="m-show-point">
                {h}
              </li>
            ))}
          </ul>
        )}
        <div className={`m-show-tags mt-3 flex-wrap gap-1.5 ${small ? "hidden" : "flex"}`}>
          {p.tags.map((t) => (
            <span key={t} className="m-tag">
              {t}
            </span>
          ))}
        </div>
        {!small && reviews.map((r) => (
          <figure key={r.name + r.text.slice(0, 20)} className="m-show-review">
            {r.rating && (
              <p className="h-stars text-xs" aria-label={`${r.rating} out of 5`}>
                {"★".repeat(r.rating)}
                <span>{"★".repeat(5 - r.rating)}</span>
              </p>
            )}
            <blockquote>“{r.text}”</blockquote>
            <figcaption>
              <strong>{r.name}</strong> · {r.role}
            </figcaption>
          </figure>
        ))}
        <div className="m-show-acts mt-5 flex flex-wrap items-center gap-2">
          <a href={p.href} target="_blank" rel="noopener noreferrer" className="m-cta m-cta-sm">
            {direct && small ? "Visit" : "Visit the site"} <span aria-hidden>↗</span>
          </a>
          {!(direct && small) && <AddToMessage kind="sites" id={p.title} label="I want one like this" />}
        </div>
      </div>
    </article>
  );
}
