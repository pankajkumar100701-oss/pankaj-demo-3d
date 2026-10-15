import { findTemplate, templates } from "@/data/templates";
import { previewSource } from "@/lib/templates";

// A template's live preview as its own static file, so pages can point an
// iframe at it (cached, loaded on demand) instead of inlining every template's
// HTML into the page as srcdoc.
export const dynamicParams = false;

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function GET(_req: Request, { params }: RouteContext<"/templates/[slug]/preview">) {
  const { slug } = await params;
  if (!findTemplate(slug)) return new Response("Not found", { status: 404 });
  return new Response(previewSource(slug), {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
