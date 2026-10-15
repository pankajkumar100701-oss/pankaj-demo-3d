import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import SiteMenu from "@/components/SiteMenu";
import TemplateViewer from "@/components/TemplateViewer";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/site";
import { findTemplate, templates } from "@/data/templates";
import { templateSource } from "@/lib/templates";

export const dynamicParams = false;

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = findTemplate(slug);
  return t ? pageMeta(`${t.title} — Templates — ${profile.brand}`, t.blurb, `/templates/${t.slug}`) : {};
}

export default async function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
  const { slug } = await params;
  const index = templates.findIndex((t) => t.slug === slug);
  if (index === -1) notFound();

  const t = templates[index];
  const prev = templates[(index - 1 + templates.length) % templates.length];
  const next = templates[(index + 1) % templates.length];

  return (
    <main className="u-detail" data-page="template" style={{ "--c": t.color } as CSSProperties}>
      <div className="u-grain" aria-hidden />
      <div className="u-detail-glow" aria-hidden />

      <nav className="u-detail-top relative z-30">
        <SiteMenu />
        <span className="flex items-center gap-5">
          <Link href="/templates" className="whitespace-nowrap">
            ← <span className="hidden min-[400px]:inline">All </span>templates
          </Link>
          <span className="hidden sm:inline">
            {String(index + 1).padStart(2, "0")} / {String(templates.length).padStart(2, "0")}
          </span>
        </span>
      </nav>

      <article className="u-detail-main">
        <header className="m-rise">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-ink">
            {t.kind} · <span className="m-tag">{t.tier}</span>
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] tracking-[-0.04em]">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-soft">{t.blurb}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[...t.features, "Zero dependencies", "Responsive"].map((f) => (
              <li key={f} className="m-show-point">
                {f}
              </li>
            ))}
          </ul>
        </header>

        <div className="mt-10">
          <TemplateViewer slug={t.slug} title={t.title} code={templateSource(t.slug)} />
        </div>

        <ol className="t-steps">
          <li>
            <b>01</b>
            <span>
              <strong>Copy or download</strong> the code above.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Save it</strong> as <code>index.html</code>.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Open it</strong> in any browser — then change the text and colours to make it yours.
            </span>
          </li>
        </ol>
      </article>

      <nav className="u-detail-pager" aria-label="Other templates">
        <Link href={`/templates/${prev.slug}`}>
          <small>← Previous</small>
          {prev.title}
        </Link>
        <Link href={`/templates/${next.slug}`}>
          <small>Next →</small>
          {next.title}
        </Link>
      </nav>
    </main>
  );
}
