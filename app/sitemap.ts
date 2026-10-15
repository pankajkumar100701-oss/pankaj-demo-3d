import type { MetadataRoute } from "next";
import { posts } from "@/data/blog";
import { allTypes } from "@/data/profile";
import { templates } from "@/data/templates";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/explore`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/work`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/templates`, changeFrequency: "monthly", priority: 0.8 },
    ...templates.map((t) => ({
      url: `${siteUrl}/templates/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...allTypes.map((m) => ({
      url: `${siteUrl}/websites/${m.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
