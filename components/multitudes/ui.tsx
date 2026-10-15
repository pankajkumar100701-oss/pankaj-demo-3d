import type { ReactNode } from "react";
import type { WebsiteType } from "@/data/profile";

// Building blocks shared by the multitude layouts.

export function Hero({ m, children, className = "" }: { m: WebsiteType; children?: ReactNode; className?: string }) {
  return (
    <header className={`m-rise ${className}`}>
      <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">{m.sub}</p>
      <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.04em]">{m.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-soft sm:text-xl">{m.intro}</p>
      {children}
    </header>
  );
}

export function Heading({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h2 className="mb-6 flex items-baseline gap-3 font-sans text-xs uppercase tracking-[0.25em] text-muted">
      <span className="text-ink">{n}</span> {children}
    </h2>
  );
}
