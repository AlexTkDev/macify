import { and, desc, eq, inArray, or } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { apps, mediaAssets } from "@/db/schema";

export type DirectorySearchFilters = {
  query: string;
  pricing: "" | "free" | "freemium" | "paid";
  billing: "" | "one_time" | "subscription";
  openSource: boolean;
  page: number;
};

export const cardFields = {
  id: apps.id,
  slug: apps.slug,
  name: apps.name,
  tagline: apps.tagline,
  pricingType: apps.pricingType,
  billingType: apps.billingType,
  pricingDetails: apps.pricingDetails,
};

export const publicApplicationFields = {
  id: apps.id,
  slug: apps.slug,
  name: apps.name,
  websiteUrl: apps.websiteUrl,
  tagline: apps.tagline,
  description: apps.description,
  pricingType: apps.pricingType,
  billingType: apps.billingType,
  pricingDetails: apps.pricingDetails,
  sourceType: apps.sourceType,
  youtubeUrl: apps.youtubeUrl,
  seoTitle: apps.seoTitle,
  seoDescription: apps.seoDescription,
  publishedAt: apps.publishedAt,
};

export async function getCardMedia(appIds: string[]) {
  if (!appIds.length) return { icons: new Map(), previews: new Map() };
  const database = await getDatabase();
  const rows = await database
    .select({
      appId: mediaAssets.appId,
      role: mediaAssets.role,
      storageKey: mediaAssets.storageKey,
      altText: mediaAssets.altText,
      width: mediaAssets.width,
      height: mediaAssets.height,
    })
    .from(mediaAssets)
    .where(and(
      inArray(mediaAssets.appId, appIds),
      or(eq(mediaAssets.role, "icon"), eq(mediaAssets.role, "preview_image")),
    ))
    .orderBy(desc(mediaAssets.createdAt));
  const icons = new Map<string, (typeof rows)[number]>();
  const previews = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!row.appId) continue;
    if (row.role === "icon" && !icons.has(row.appId)) icons.set(row.appId, row);
    if (row.role === "preview_image" && !previews.has(row.appId)) previews.set(row.appId, row);
  }
  return { icons, previews };
}
