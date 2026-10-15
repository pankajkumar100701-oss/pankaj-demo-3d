"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArtIcon, artIcon, artVars } from "@/components/MultitudeArt";
import { AddToMessage, ShareLink } from "@/components/MessageActions";
import { PopCard, SizeSwitch, readSize, saveSize } from "@/components/PopCard";
import { SearchBox, SortFilter, flash } from "@/components/SortFilter";
import { allTypes, inType, profile, type WebsiteType } from "@/data/profile";
import { search } from "@/lib/search";

const trending = new Set(profile.multitudes.map((m) => m.slug));
const examples = (slug: string) => profile.projects.filter((p) => inType(p, slug));

const filters = [
  { value: "all", label: "All" },
  { value: "trending", label: "Trending" },
  { value: "more", label: "More types" },
  { value: "live", label: "With live examples" },
] as const;
const sorts = [
  { value: "trending", label: "Trending first" },
  { value: "az", label: "A → Z" },
  { value: "examples", label: "Most examples" },
] as const;
const sizes = [
  { value: "small", label: "Small" },
  { value: "large", label: "Large" },
] as const;
type Size = (typeof sizes)[number]["value"];
const SIZE_KEY = "explore-size";

// The Explore page's body: every website type as a card, with search, one
// "Sort & filter" button and a small / large switch on top. Small cards (the default)
// show just the name and pop open with the details; large ones show it all.
// Each can open its own page, be added to the visitor's message, or be shared.
export default function ExploreTypes() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [sort, setSort] = useState<(typeof sorts)[number]["value"]>("trending");
  const [size, setSize] = useState<Size>("small");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const opened = allTypes.find((t) => t.slug === openSlug);

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

  const { shown, related } = useMemo(() => {
    let list = allTypes.filter((t) => {
      if (filter === "trending" && !trending.has(t.slug)) return false;
      if (filter === "more" && trending.has(t.slug)) return false;
      if (filter === "live" && examples(t.slug).length === 0) return false;
      return true;
    });
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "examples") list = [...list].sort((a, b) => examples(b.slug).length - examples(a.slug).length);
    // Typos and related words match too ("hotel" finds homestays); the closest come first.
    const hits = search(list, q, (t) => [t.title, t.sub, t.idealFor, t.intro, ...t.features].join(" "));
    return { shown: hits.map((h) => h.item), related: new Set(q.trim() ? hits.filter((h) => h.related).map((h) => h.item.slug) : []) };
  }, [q, filter, sort]);

  return (
    <>
      <div className="x-bar m-rise">
        <SearchBox value={q} onChange={setQ} placeholder="Search: salon, booking, payments…" label="Search website types" />
        <div className="x-tools">
          <SortFilter
            groups={[
              { title: "Show", options: filters, value: filter, onChange: (v) => setFilter(v as typeof filter) },
              { title: "Sort by", options: sorts, value: sort, onChange: (v) => setSort(v as typeof sort) },
            ]}
            changed={filter !== "all" || sort !== "trending"}
            onReset={() => {
              setFilter("all");
              setSort("trending");
            }}
          />
          <SizeSwitch options={sizes} value={size} onChange={pickSize} />
        </div>
      </div>

      <p className="mt-6 font-sans text-xs uppercase tracking-[0.2em] text-muted" aria-live="polite">
        {shown.length} {shown.length === 1 ? "type" : "types"}
        {q.trim() && <> · “{q.trim()}”</>}
      </p>

      {shown.length === 0 ? (
        <div className="m-card mt-6 rounded-2xl p-8 text-center">
          <p className="font-display text-3xl">{q.trim() ? `Nothing like “${q.trim()}” on the list.` : "Not listed? I can still build it."}</p>
          <p className="mt-2 text-muted">I can still build it. Tell me what you have in mind on the Contact page.</p>
          <Link href="/contact" className="u-cta-primary x-btn mt-6">
            Customise your website plan <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <ul className={`x-grid ${size === "small" ? "x-grid-small" : ""}`}>
          {shown.map((t, i) => {
            const style = { "--c": t.color, ...artVars(t.slug, t.color), animationDelay: `${Math.min(i, 8) * 0.04}s` } as CSSProperties;
            return size === "small" ? (
              <li key={t.slug} id={t.slug} className="x-mini m-rise x-hit" style={style} data-flash={flash(q)} data-related={related.has(t.slug) || undefined}>
                <button type="button" onClick={() => setOpenSlug(t.slug)} aria-haspopup="dialog">
                  <span className="x-type-icon">
                    <ArtIcon icon={artIcon(t.slug)} />
                  </span>
                  <span className="min-w-0">
                    <b>{t.title}</b>
                    <small>{t.sub}</small>
                  </span>
                  <i className="x-mini-go" aria-hidden>
                    ›
                  </i>
                </button>
              </li>
            ) : (
              <li key={t.slug} id={t.slug} className="x-type m-rise x-hit" style={style} data-flash={flash(q)} data-related={related.has(t.slug) || undefined}>
                <TypeDetails t={t} />
              </li>
            );
          })}
        </ul>
      )}

      <PopCard
        open={opened !== undefined}
        onClose={() => setOpenSlug(null)}
        label={opened ? `${opened.title} websites` : "Website type"}
        style={opened ? ({ "--c": opened.color, "--ink": opened.color, ...artVars(opened.slug, opened.color) } as CSSProperties) : undefined}
      >
        {opened && <TypeDetails t={opened} />}
      </PopCard>
    </>
  );
}

// Everything about a type: on a large card, and in the pop-up from a small one.
function TypeDetails({ t }: { t: WebsiteType }) {
  const live = examples(t.slug);
  return (
    <>
      <div className="x-type-top">
        <span className="x-type-icon">
          <ArtIcon icon={artIcon(t.slug)} />
        </span>
        <span className="font-sans text-[0.625rem] tracking-[0.15em] text-ink">{t.n}</span>
        {trending.has(t.slug) && <span className="x-badge">Trending</span>}
      </div>
      <h2 className="mt-5 font-display text-3xl leading-none">
        <Link href={`/websites/${t.slug}`} className="hover:underline">
          {t.title}
        </Link>
      </h2>
      <p className="mt-1.5 font-sans text-[0.6875rem] uppercase tracking-[0.15em] text-muted">{t.sub}</p>
      <p className="mt-4 text-sm leading-relaxed text-soft">{t.intro}</p>
      <p className="mt-4 text-xs text-muted">
        <b className="font-semibold text-soft">For:</b> {t.idealFor}
      </p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Can include">
        {t.features.slice(0, 5).map((f) => (
          <li key={f} className="m-tag">
            {f}
          </li>
        ))}
      </ul>
      {live.length > 0 && (
        <p className="x-type-live">
          <i className="u-live" aria-hidden /> Live:{" "}
          {live.map((p, k) => (
            <span key={p.title}>
              {k > 0 && ", "}
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                {p.title} ↗
              </a>
            </span>
          ))}
        </p>
      )}
      <div className="x-type-actions">
        <Link href={`/websites/${t.slug}`} className="x-open">
          See websites <span aria-hidden>→</span>
        </Link>
        <AddToMessage kind="types" id={t.slug} />
        <ShareLink path={`/websites/${t.slug}`} title={`${t.title} websites — ${profile.brand}`} />
      </div>
    </>
  );
}
