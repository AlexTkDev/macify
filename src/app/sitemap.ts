import type { MetadataRoute } from "next";
import { getPublishedApplicationSlugs } from "@/lib/apps-data";
import { getPublishedTagSlugs } from "@/lib/tag-directory-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [applications, tags] = await Promise.all([getPublishedApplicationSlugs(), getPublishedTagSlugs()]);

  return [
    { url: "https://macify.app", changeFrequency: "daily", priority: 1 },
    { url: "https://macify.app/editorial-policy", changeFrequency: "monthly", priority: 0.4 },
    { url: "https://macify.app/privacy", changeFrequency: "monthly", priority: 0.3 },
    ...tags.map(({ slug }) => ({
      url: `https://macify.app/tags/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...applications.map(({ slug, updatedAt }) => ({
      url: `https://macify.app/apps/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
