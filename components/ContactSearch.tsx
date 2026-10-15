"use client";

import { useState, type CSSProperties } from "react";
import { ArtIcon, artIcon, artVars } from "@/components/MultitudeArt";
import { search } from "@/lib/search";
import type { WebsiteType } from "@/data/profile";

export type SearchOption = { kind: "type"; type: WebsiteType; text: string } | { kind: "idea"; name: string; text: string };

// The Contact page's "What do you need?" box: type anything ("salon
// booking", "resturant", "hotel") and the closest website types and ideas
// light up underneath, best first, with near-misses shown softer as
// "related". One tap adds one to the message (and tapping again removes it).
// `onQuery` lets the lists below flash their matching options too.
export function ContactSearch({
  options,
  isPicked,
  onPick,
  onQuery,
}: {
  options: SearchOption[];
  isPicked: (o: SearchOption) => boolean;
  onPick: (o: SearchOption) => void;
  onQuery: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  const hits = q.trim() ? search(options, q, (o) => o.text).slice(0, 10) : [];
  const set = (v: string) => {
    setQ(v);
    onQuery(v);
  };

  return (
    <div className="c-search m-card rounded-2xl p-4 sm:p-5">
      <label className="c-search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => set(e.target.value)}
          placeholder="What do you need? e.g. salon booking, online shop…"
          aria-label="Search website types and ideas"
          enterKeyHint="search"
        />
        {q && (
          <button type="button" onClick={() => set("")} aria-label="Clear search">
            ×
          </button>
        )}
      </label>

      {q.trim() !== "" && (
        <div className="c-search-hits" aria-live="polite">
          {hits.length === 0 ? (
            <p className="text-sm text-muted">Nothing close to “{q.trim()}”. Write it in the last step and I&apos;ll take it from there.</p>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted">Tap to add to your message</p>
              <ul className="flex flex-wrap gap-2">
                {hits.map(({ item: o, related }, i) => {
                  const key = o.kind === "type" ? `t:${o.type.slug}` : `i:${o.name}`;
                  const picked = isPicked(o);
                  return (
                    <li key={key} className="c-hit" data-related={related || undefined} style={{ "--k": i } as CSSProperties}>
                      {o.kind === "type" ? (
                        <button
                          type="button"
                          className="c-type"
                          style={{ "--c": o.type.color, ...artVars(o.type.slug, o.type.color) } as CSSProperties}
                          aria-pressed={picked}
                          onClick={() => onPick(o)}
                        >
                          <ArtIcon icon={artIcon(o.type.slug)} />
                          {o.type.title}
                          <small className="c-hit-kind">{related ? "related" : "type"}</small>
                        </button>
                      ) : (
                        <button type="button" className="m-pill" aria-pressed={picked} onClick={() => onPick(o)}>
                          {picked ? "✓ " : "+ "}
                          {o.name}
                          {related && <small className="c-hit-kind">related</small>}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
