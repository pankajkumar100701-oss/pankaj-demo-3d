// The site's public origin, used for metadataBase (share previews). Set
// NEXT_PUBLIC_SITE_URL once there is a domain; on Vercel it falls back to the
// production URL, and locally to the dev server.
function origin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL !== undefined) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const siteUrl = origin().replace(/\/$/, "");
