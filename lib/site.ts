import { profile } from "@/data/profile";

// The site's public address, used by the sitemap, robots.txt and share
// previews. Set NEXT_PUBLIC_SITE_URL once you have a domain (e.g.
// https://pankaj.dev); on Vercel it falls back to the production URL.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

// A page's title and description, also used for its share preview (a page
// that sets no `openGraph` would share with the homepage's title and text).
// Setting it replaces the inherited one, so the site's card image is repeated.
export function pageMeta(title: string, description: string, path: string) {
  const images = [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${profile.brand} — ${profile.role}` }];
  return {
    title,
    description,
    openGraph: { type: "website" as const, siteName: profile.brand, title, description, url: path, images },
    twitter: { card: "summary_large_image" as const, images },
  };
}
