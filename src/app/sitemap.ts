import type { MetadataRoute } from "next";
import { getCategoryDirectoryData, getPublishedApplicationSlugs } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [applications, categories] = await Promise.all([
    getPublishedApplicationSlugs(),
    getCategoryDirectoryData(),
  ]);

  return [
    { url: "https://macify.app", changeFrequency: "daily", priority: 1 },
    { url: "https://macify.app/categories", changeFrequency: "weekly", priority: 0.7 },
    ...categories.filter(({ publishedCount }) => publishedCount > 0).map(({ slug }) => ({
      url: `https://macify.app/categories/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...applications.map(({ slug, updatedAt }) => ({
      url: `https://macify.app/apps/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
