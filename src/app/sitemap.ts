import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { getPublishedApplicationSlugs } from "@/lib/published-app-data";
import { getPublishedCategorySlugs } from "@/lib/category-directory-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [applications, categories] = await Promise.all([getPublishedApplicationSlugs(), getPublishedCategorySlugs()]);

  return [
    { url: "https://macify.app", changeFrequency: "daily", priority: 1 },
    { url: "https://macify.app/categories", changeFrequency: "weekly", priority: 0.7 },
    { url: "https://macify.app/blog", lastModified: blogPosts[0]?.updatedAt, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://macify.app/editorial-policy", changeFrequency: "monthly", priority: 0.4 },
    { url: "https://macify.app/privacy", changeFrequency: "monthly", priority: 0.3 },
    ...blogPosts.map(({ slug, updatedAt }) => ({
      url: `https://macify.app/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...categories.map(({ slug }) => ({
      url: `https://macify.app/categories/${slug}`,
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
