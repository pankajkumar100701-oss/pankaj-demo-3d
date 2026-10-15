"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArtIcon, artIcon, artVars } from "@/components/MultitudeArt";
import { ProjectShowcase } from "@/components/multitudes/Websites";
import { PopCard, SizeSwitch, readSize, saveSize } from "@/components/PopCard";
import { SearchBox, SortFilter, flash } from "@/components/SortFilter";
import { findType, inType, profile, type Project } from "@/data/profile";
import { search } from "@/lib/search";

const sorts = [
  { value: "new", label: "Newest first" },
  { value: "old", label: "Oldest first" },
  { value: "az", label: "A → Z" },
  { value: "type", label: "By type" },
] as const;

const sizes = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;
type Size = (typeof sizes)[number]["value"];
const SIZE_KEY = "work-size";
// The grid for each card size (small is two across even on phones).
const gridFor: Record<Size, string> = {
  large: "space-y-6",
  medium: "grid gap-5 md:grid-cols-2",
  small: "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3",
};

// Everything a search on /work looks through for one website.
const searchText = (p: Project) =>
  [p.title, p.description, p.client, ...p.tags, ...(p.highlights ?? []), ...[p.multitude, ...(p.also ?? [])].map((s) => `${findType(s)?.title ?? s} ${findType(s)?.sub ?? ""}`)].join(" ");

// The /work page's list of websites, with a search box, one "Sort & filter" button (sort
// and type in a single card) and a card-size switch (remembered per browser;
// phones get just Small and Large). Small and medium cards pop open into the
// full card on a tap.
// (profile.projects is in the order they were built, so its end is newest.)
export default function WorkList() {
  const { projects } = profile;
  const [sort, setSort] = useState<(typeof sorts)[number]["value"]>("new");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [size, setSize] = useState<Size>("large");
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  // The remembered size is only readable in the browser; sync it in after hydration.
  useEffect(() => {
    const saved = readSize(SIZE_KEY, sizes);
    // Phones have no Medium (it's one card a row there anyway): show Small.
    const phone = matchMedia("(max-width: 639px)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setSize(phone && saved === "medium" ? "small" : saved);
  }, []);

  const pickSize = (s: Size) => {
    setSize(s);
    saveSize(SIZE_KEY, s);
  };
  const typeOf = (slug: string) => findType(slug)?.title ?? slug;
  const usedTypes = [...new Set(projects.flatMap((p) => [p.multitude, ...(p.also ?? [])]))];

  let list = projects.filter((p) => type === "all" || inType(p, type));
  if (sort === "new") list = [...list].reverse();
  if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "type") list = [...list].sort((a, b) => typeOf(a.multitude).localeCompare(typeOf(b.multitude)));
  // A search keeps the closest matches first; near ones (typos, related words) are marked.
  const hits = search(list, q, searchText);
  const related = new Set(q.trim() ? hits.filter((h) => h.related).map((h) => h.item.title) : []);
  list = hits.map((h) => h.item);

  const opened = projects.find((p) => p.title === openTitle);

  return (
    <>
      <div className="x-bar m-rise">
        <SearchBox value={q} onChange={setQ} placeholder="Search: gym, booking, shop…" label="Search my websites" />
        <div className="x-tools">
        <SortFilter
          groups={[
            { title: "Sort by", options: sorts, value: sort, onChange: (v) => setSort(v as typeof sort) },
            {
              title: "Type of website",
              options: [
                { value: "all", label: "All types", count: projects.length, icon: <b>✦</b> },
                ...usedTypes.map((slug) => {
                  const t = findType(slug);
                  return {
                    value: slug,
                    label: typeOf(slug),
                    count: projects.filter((p) => inType(p, slug)).length,
                    icon: <ArtIcon icon={artIcon(slug)} />,
                    style: artVars(slug, t?.color ?? "var(--u-acid)") as CSSProperties,
                    keywords: `${t?.sub ?? ""} ${t?.idealFor ?? ""}`,
                  };
                }),
              ],
              value: type,
              onChange: setType,
              cards: true,
              searchable: true,
            },
          ]}
          changed={sort !== "new" || type !== "all"}
          onReset={() => {
            setSort("new");
            setType("all");
          }}
        />
        <SizeSwitch options={sizes} value={size} onChange={pickSize} />
        </div>
      </div>
      <p className="mt-5 font-sans text-xs uppercase tracking-[0.2em] text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "site" : "sites"}
        {type !== "all" && <> · {typeOf(type)}</>}
        {q.trim() && <> · “{q.trim()}”</>}
      </p>

      {list.length === 0 ? (
        <div className="m-card mt-6 rounded-2xl p-8 text-center">
          <p className="font-display text-3xl">No website like “{q.trim()}” yet.</p>
          <p className="mt-2 text-muted">I can still build it. Try another word, or tell me what you need.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" className="x-share" onClick={() => setQ("")}>
              Clear search
            </button>
            <Link href="/contact" className="m-cta m-cta-sm">
              Customise your website plan <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className={`mt-5 ${gridFor[size]}`}>
          {list.map((p, i) => {
            const t = findType(p.multitude);
            return (
              <div key={`${sort}-${type}-${p.title}`} className="x-hit" data-flash={flash(q)} data-related={related.has(p.title) || undefined}>
                <ProjectShowcase
                  p={p}
                  i={i}
                  kicker={t ? <Link href={`/websites/${t.slug}`} className="hover:underline">{t.title}</Link> : "Live"}
                  size={size}
                  onOpen={size === "large" ? undefined : () => setOpenTitle(p.title)}
                />
              </div>
            );
          })}
        </div>
      )}

      <PopCard open={opened !== undefined} onClose={() => setOpenTitle(null)} label={opened?.title ?? "Website"} style={opened ? ({ "--c": opened.color } as CSSProperties) : undefined}>
        {opened && <ProjectShowcase p={opened} i={list.indexOf(opened)} kicker={findType(opened.multitude)?.title ?? "Live"} size="medium" />}
      </PopCard>
    </>
  );
}
