"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { PopCard } from "@/components/PopCard";
import { search } from "@/lib/search";

export type FilterOption = {
  value: string;
  label: string;
  // Card look (for `cards` groups): an icon, how many items it has, its own colours.
  icon?: ReactNode;
  count?: number;
  style?: CSSProperties;
  // Extra words the search box matches on, beyond the label.
  keywords?: string;
};

export type FilterGroup = {
  title: string;
  options: readonly FilterOption[];
  value: string;
  onChange: (v: string) => void;
  // Show the options as small cards (icon, name, count) instead of pills.
  cards?: boolean;
  // The popup's search box filters this group's options ("all" always stays).
  searchable?: boolean;
};

// Restarts the "found it" pulse on every keystroke: the CSS has the same
// animation under two names, and switching name replays it.
export const flash = (q: string) => (q.trim() ? (q.length % 2 ? "a" : "b") : undefined);

// A search box: matches as you type, with a clear button once there's text.
export function SearchBox({ value, onChange, placeholder, label, className = "" }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; className?: string }) {
  return (
    <label className={`x-search ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} enterKeyHint="search" />
      {value && (
        <button type="button" className="x-search-clear" onClick={() => onChange("")} aria-label="Clear search">
          ×
        </button>
      )}
    </label>
  );
}

// One "Sort & filter" button that opens every option in a single card (a
// sheet from the bottom on phones), instead of rows of pills on the page.
// The button shows what's picked right now. When a group is `searchable`,
// a search box on top narrows its options as you type, close matches first.
export function SortFilter({ groups, onReset, changed }: { groups: FilterGroup[]; onReset: () => void; changed: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const summary = groups.map((g) => g.options.find((o) => o.value === g.value)?.label).filter(Boolean).join(" · ");
  const searchable = groups.some((g) => g.searchable);

  return (
    <>
      <button type="button" className="x-folder" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        <span className="min-w-0">
          <b>Sort &amp; filter</b>
          <small>{summary}</small>
        </span>
        {changed && <i aria-label="Changed" />}
      </button>

      <PopCard
        open={open}
        onClose={() => {
          setOpen(false);
          setQ("");
        }}
        label="Sort & filter"
      >
        <p className="font-display text-3xl">Sort &amp; filter</p>
        {searchable && <SearchBox value={q} onChange={setQ} placeholder="Find a type: shop, gym, hotel…" label="Search the options" className="x-folder-search" />}
        {groups.map((g) => {
          const hits = g.searchable && q.trim() ? search(g.options.filter((o) => o.value !== "all"), q, (o) => `${o.label} ${o.keywords ?? ""}`) : null;
          const all = g.options.find((o) => o.value === "all");
          const shown = hits ? [...(all ? [{ item: all, related: false }] : []), ...hits] : g.options.map((item) => ({ item, related: false }));
          return (
            <fieldset key={g.title} className="x-folder-group">
              <legend>{g.title}</legend>
              <div className={g.cards ? "x-opt-grid" : "flex flex-wrap gap-2"}>
                {shown.map(({ item: o, related }) =>
                  g.cards ? (
                    <button
                      key={o.value}
                      type="button"
                      className="x-opt-card"
                      aria-pressed={g.value === o.value}
                      onClick={() => g.onChange(o.value)}
                      style={o.style}
                      data-flash={hits && o.value !== "all" ? flash(q) : undefined}
                      data-related={related || undefined}
                    >
                      <span className="x-type-icon" aria-hidden>
                        {o.icon ?? <b>✦</b>}
                      </span>
                      <span className="min-w-0">
                        <b>{o.label}</b>
                        {o.count !== undefined && (
                          <small>
                            {o.count} {o.count === 1 ? "site" : "sites"}
                          </small>
                        )}
                      </span>
                    </button>
                  ) : (
                    <button key={o.value} type="button" className="m-pill" aria-pressed={g.value === o.value} onClick={() => g.onChange(o.value)} data-flash={hits && o.value !== "all" ? flash(q) : undefined} data-related={related || undefined}>
                      {o.label}
                    </button>
                  ),
                )}
              </div>
              {hits && hits.length === 0 && <p className="x-empty-line">Nothing called “{q.trim()}” yet. Try “shop”, “gym” or “hotel”.</p>}
            </fieldset>
          );
        })}
        <div className="x-folder-foot">
          <button
            type="button"
            className="x-share"
            onClick={() => {
              onReset();
              setQ("");
            }}
            disabled={!changed && !q}
          >
            Reset
          </button>
          <button type="button" className="m-cta m-cta-sm" onClick={() => setOpen(false)}>
            Show results
          </button>
        </div>
      </PopCard>
    </>
  );
}
