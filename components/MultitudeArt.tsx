import type { ReactNode } from "react";

// Per-multitude look for the page-to-page portal: a two-tone gradient, the
// text colour that reads on it, and a line icon (Lucide-style, 24×24, ISC).
// Every shape has pathLength="1" so CSS can draw it in with a dash offset.
export type MultitudeArt = { from: string; to: string; ink: string; icon: ReactNode };

const p = (d: string) => <path d={d} pathLength={1} />;

export const MULTITUDE_ART: Record<string, MultitudeArt> = {
  // The hero's 3D demos card (not a type).
  "3d": {
    from: "#5ee7ff",
    to: "#4f2bd8",
    ink: "#fff",
    icon: (
      <>
        {p("M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z")}
        {p("m3.3 7 8.7 5 8.7-5")}
        {p("M12 22V12")}
      </>
    ),
  },
  store: {
    from: "#d7ff3f",
    to: "#14a37f",
    ink: "#07120c",
    icon: (
      <>
        {p("M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z")}
        {p("M3 6h18")}
        {p("M16 10a4 4 0 0 1-8 0")}
      </>
    ),
  },
  "painting-art": {
    from: "#ff7a45",
    to: "#c2185b",
    ink: "#fff",
    icon: (
      <>
        {p("M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z")}
        {p("M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7")}
        {p("M14.5 17.5 4.5 15")}
      </>
    ),
  },
  fitness: {
    from: "#7b93ff",
    to: "#3b1fa8",
    ink: "#fff",
    icon: (
      <>
        {p("M14.4 14.4 9.6 9.6")}
        {p("M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z")}
        {p("m21.5 21.5-1.4-1.4")}
        {p("M3.9 3.9 2.5 2.5")}
        {p("M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z")}
      </>
    ),
  },
  education: {
    from: "#ffe66d",
    to: "#2f9e5a",
    ink: "#0d1f12",
    icon: (
      <>
        {p("M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z")}
        {p("M22 10v6")}
        {p("M6 12.5V16a6 3 0 0 0 12 0v-3.5")}
      </>
    ),
  },
  clubbing: {
    from: "#ff2bd6",
    to: "#2a0a7a",
    ink: "#fff",
    icon: (
      <>
        {p("M9 18V5l12-2v13")}
        <circle cx="6" cy="18" r="3" pathLength={1} />
        <circle cx="18" cy="16" r="3" pathLength={1} />
      </>
    ),
  },
  events: {
    from: "#ffd23f",
    to: "#fb5607",
    ink: "#1f0b00",
    icon: (
      <>
        {p("M5.8 11.3 2 22l10.7-3.79")}
        {p("M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z")}
        {p("m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10")}
        {p("m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17")}
        {p("m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7")}
      </>
    ),
  },
  restaurants: {
    from: "#ff6b6b",
    to: "#7a1022",
    ink: "#fff",
    icon: (
      <>
        {p("M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2")}
        {p("M7 2v20")}
        {p("M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7")}
      </>
    ),
  },
  recipes: {
    from: "#ffb347",
    to: "#c2461c",
    ink: "#fff",
    icon: (
      <>
        {p("M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.84.73-1.04a4 4 0 0 0-2.14-7.59 5 5 0 0 0-9.18 0 4 4 0 0 0-2.14 7.59c.41.2.73.58.73 1.04V20a1 1 0 0 0 1 1Z")}
        {p("M6 17h12")}
      </>
    ),
  },
  rental: {
    from: "#4cc9f0",
    to: "#3a3fd9",
    ink: "#fff",
    icon: (
      <>
        {p("m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4")}
        {p("m21 2-9.6 9.6")}
        <circle cx="7.5" cy="15.5" r="5.5" pathLength={1} />
      </>
    ),
  },
  business: {
    from: "#e9c46a",
    to: "#14284b",
    ink: "#fff",
    icon: (
      <>
        {p("M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16")}
        <rect x="2" y="6" width="20" height="14" rx="2" pathLength={1} />
      </>
    ),
  },
  medical: {
    from: "#5ee7d0",
    to: "#0b5e7a",
    ink: "#fff",
    icon: (
      <>
        {p("M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z")}
        {p("M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27")}
      </>
    ),
  },
  stay: {
    from: "#c9b6f2",
    to: "#22225e",
    ink: "#fff",
    icon: (
      <>
        {p("M2 4v16")}
        {p("M2 8h18a2 2 0 0 1 2 2v10")}
        {p("M2 17h20")}
        {p("M6 8v9")}
      </>
    ),
  },
  "real-estate": {
    from: "#ffb38a",
    to: "#8a2b0e",
    ink: "#fff",
    icon: (
      <>
        {p("M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8")}
        {p("M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z")}
      </>
    ),
  },
  salon: {
    from: "#ffb3e6",
    to: "#7b2cbf",
    ink: "#fff",
    icon: (
      <>
        <circle cx="6" cy="6" r="3" pathLength={1} />
        {p("M8.12 8.12 12 12")}
        {p("M20 4 8.12 15.88")}
        <circle cx="6" cy="18" r="3" pathLength={1} />
        {p("M14.8 14.8 20 20")}
      </>
    ),
  },
  travel: {
    from: "#ffd166",
    to: "#ef476f",
    ink: "#fff",
    icon: p("M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"),
  },
  photography: {
    from: "#b8f2e6",
    to: "#1f6f5c",
    ink: "#fff",
    icon: (
      <>
        {p("M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z")}
        <circle cx="12" cy="13" r="3" pathLength={1} />
      </>
    ),
  },
  interior: {
    from: "#f4d35e",
    to: "#6b4226",
    ink: "#fff",
    icon: (
      <>
        {p("M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3")}
        {p("M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z")}
        {p("M4 18v2")}
        {p("M20 18v2")}
        {p("M12 4v9")}
      </>
    ),
  },
  professional: {
    from: "#a8c5ff",
    to: "#1b2a5e",
    ink: "#fff",
    icon: (
      <>
        {p("m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z")}
        {p("m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z")}
        {p("M7 21h10")}
        {p("M12 3v18")}
        {p("M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2")}
      </>
    ),
  },
  startup: {
    from: "#7af0ff",
    to: "#5a189a",
    ink: "#fff",
    icon: (
      <>
        {p("M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z")}
        {p("m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z")}
        {p("M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0")}
        {p("M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5")}
      </>
    ),
  },
  portfolio: {
    from: "#e0e7ff",
    to: "#4338ca",
    ink: "#fff",
    icon: (
      <>
        <circle cx="12" cy="8" r="5" pathLength={1} />
        {p("M20 21a8 8 0 0 0-16 0")}
      </>
    ),
  },
  ngo: {
    from: "#c7f9cc",
    to: "#2d6a4f",
    ink: "#fff",
    icon: (
      <>
        {p("M7 20h10")}
        {p("M10 20c5.5-2.5.8-6.4 3-10")}
        {p("M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z")}
        {p("M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z")}
      </>
    ),
  },
};

// Fallback for a multitude added without its own art: a plain dot.
export const DEFAULT_ART: Omit<MultitudeArt, "from" | "to"> = {
  ink: "#fff",
  icon: <circle cx="12" cy="12" r="4" pathLength={1} />,
};

export function ArtIcon({ icon, className }: { icon: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {icon}
    </svg>
  );
}

// CSS custom properties (--from, --to, --art-ink) for an element styled with a
// multitude's gradient; falls back to its plain colour.
export function artVars(slug: string, color: string): Record<string, string> {
  const art = MULTITUDE_ART[slug];
  return { "--from": art?.from ?? color, "--to": art?.to ?? color, "--art-ink": (art ?? DEFAULT_ART).ink };
}

export const artIcon = (slug: string) => (MULTITUDE_ART[slug] ?? DEFAULT_ART).icon;
