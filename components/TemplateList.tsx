"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { SizeSwitch, readSize, saveSize } from "@/components/PopCard";
import { SearchBox, SortFilter, flash } from "@/components/SortFilter";
import type { Template } from "@/data/templates";
import { search } from "@/lib/search";

const sorts = [
  { value: "new", label: "Newest first" },
  { value: "old", label: "Oldest first" },
  { value: "az", label: "A → Z" },
  { value: "kind", label: "By kind" },
] as const;
const sizes = [
  { value: "small", label: "Small" },
  { value: "large", label: "Large" },
] as const;
type Size = (typeof sizes)[number]["value"];
const SIZE_KEY = "templates-size";

// A card's preview (/templates/<slug>/preview#still). The frame is only
// created while the card is near the screen, and it freezes after its first
// moments (see STILL in lib/templates.ts): only the `active` card plays, the
// one under the mouse, or on touch screens the one in the middle of the screen.
function Thumb({ slug, title, active, onCentre }: { slug: string; title: string; active: boolean; onCentre: (slug: string, centred: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Far off screen, the frame goes away (and loads afresh when it's back).
    const io = new IntersectionObserver(
      (entries) => {
        const isNear = entries.some((e) => e.isIntersecting);
        setNear(isNear);
        if (!isNear) setLoaded(false);
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    // Touch screens have no hover: the card crossing the middle of the screen plays.
    let mid: IntersectionObserver | undefined;
    if (matchMedia("(hover: none)").matches) {
      mid = new IntersectionObserver((entries) => entries.forEach((e) => onCentre(slug, e.isIntersecting)), { rootMargin: "-42% 0px -42% 0px" });
      mid.observe(el);
    }
    return () => {
      io.disconnect();
      mid?.disconnect();
    };
  }, [slug, onCentre]);

  // Tell the frame to play or freeze (again once it has loaded).
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(active ? "tpl:play" : "tpl:pause", "*");
  }, [active, loaded]);

  return (
    <div ref={ref} className="t-thumb" data-loaded={loaded || undefined} data-active={active || undefined}>
      {near && (
        <iframe
          ref={frame}
          title={`${title} preview`}
          src={`/templates/${slug}/preview#still`}
          sandbox="allow-scripts"
          scrolling="no"
          tabIndex={-1}
          aria-hidden
          inert
          onLoad={() => setLoaded(true)}
        />
      )}
      <span className="t-play" aria-hidden>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="t-play-hover">Hover to play</span>
        <span className="t-play-touch">Scroll to play</span>
      </span>
    </div>
  );
}

// /templates: every template as a card with a scaled-down preview that plays
// on hover, behind a search box, one "Sort & filter" button and a small /
// large switch. Each card opens /templates/<slug>.
export default function TemplateList({ items }: { items: Template[] }) {
  const [sort, setSort] = useState<(typeof sorts)[number]["value"]>("new");
  const [kind, setKind] = useState("all");
  const [size, setSize] = useState<Size>("large");
  const [q, setQ] = useState("");
  // The card whose preview plays: hovered, or centred on a touch screen.
  const [active, setActive] = useState<string | null>(null);
  const onCentre = useCallback((slug: string, centred: boolean) => setActive((cur) => (centred ? slug : cur === slug ? null : cur)), []);

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

  const kinds = [...new Set(items.map((t) => t.kind))];
  let list = items.filter((t) => kind === "all" || t.kind === kind);
  if (sort === "new") list = [...list].sort((a, b) => b.added.localeCompare(a.added) || items.indexOf(b) - items.indexOf(a));
  if (sort === "old") list = [...list].sort((a, b) => a.added.localeCompare(b.added) || items.indexOf(a) - items.indexOf(b));
  if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "kind") list = [...list].sort((a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
  const hits = search(list, q, (t) => [t.title, t.kind, t.tier, t.blurb, ...t.features].join(" "));
  const related = new Set(q.trim() ? hits.filter((h) => h.related).map((h) => h.item.slug) : []);
  list = hits.map((h) => h.item);
  const small = size === "small";

  return (
    <>
      <div className="x-bar m-rise">
        <SearchBox value={q} onChange={setQ} placeholder="Search: globe, scroll, gallery…" label="Search templates" />
        <div className="x-tools">
        <SortFilter
          groups={[
            { title: "Sort by", options: sorts, value: sort, onChange: (v) => setSort(v as typeof sort) },
            {
              title: "Kind",
              options: [{ value: "all", label: `All · ${items.length}` }, ...kinds.map((k) => ({ value: k, label: k }))],
              value: kind,
              onChange: setKind,
            },
          ]}
          changed={sort !== "new" || kind !== "all"}
          onReset={() => {
            setSort("new");
            setKind("all");
          }}
        />
        <SizeSwitch options={sizes} value={size} onChange={pickSize} />
        </div>
      </div>
      <p className="mt-5 font-sans text-xs uppercase tracking-[0.2em] text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "template" : "templates"}
        {kind !== "all" && <> · {kind}</>}
        {q.trim() && <> · “{q.trim()}”</>}
      </p>

      {list.length === 0 && (
        <div className="m-card mt-6 rounded-2xl p-8 text-center">
          <p className="font-display text-3xl">No template like “{q.trim()}” yet.</p>
          <p className="mt-2 text-muted">Try “3D”, “scroll” or “gallery”.</p>
          <button type="button" className="x-share mt-6" onClick={() => setQ("")}>
            Clear search
          </button>
        </div>
      )}

      <ul className={`mt-5 grid ${small ? "grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" : "gap-6 md:grid-cols-2 lg:grid-cols-3"}`}>
        {list.map((t, i) => (
          <li key={t.slug} className="m-rise x-hit" style={{ animationDelay: `${0.05 + Math.min(i, 8) * 0.06}s` }} data-flash={flash(q)} data-related={related.has(t.slug) || undefined}>
            <Link
              href={`/templates/${t.slug}`}
              className="t-card m-card m-lift"
              data-size={size}
              style={{ "--c": t.color } as CSSProperties}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(t.slug)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive((cur) => (cur === t.slug ? null : cur))}
              onFocus={() => setActive(t.slug)}
              onBlur={() => setActive((cur) => (cur === t.slug ? null : cur))}
            >
              <div className="relative">
                <Thumb slug={t.slug} title={t.title} active={active === t.slug} onCentre={onCentre} />
                <span className="t-tier">{t.tier}</span>
              </div>
              <div className={small ? "p-3 sm:p-4" : "p-5 sm:p-6"}>
                <p className="font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-ink">{t.kind}</p>
                <h2 className={`mt-1.5 font-display leading-tight ${small ? "text-lg sm:text-xl" : "text-2xl"}`}>{t.title}</h2>
                {!small && <p className="mt-2 text-sm leading-relaxed text-muted">{t.blurb}</p>}
                {!small && (
                  <span className="t-open">
                    Preview &amp; code <span aria-hidden>→</span>
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
