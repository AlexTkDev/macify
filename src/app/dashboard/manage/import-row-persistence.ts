import { sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  apps,
  importRows,
  mediaAssets,
  categories,
} from "@/db/schema";
import type { NormalizedImport } from "@/app/dashboard/manage/import-schema";
import type { PreparedMedia } from "@/lib/media-upload";
import type { normalizeCategories } from "@/lib/application-schema";

type Database = Awaited<ReturnType<typeof getDatabase>>;
type NormalizedCategory = ReturnType<typeof normalizeCategories>[number];

export async function insertImportedApplication(
  database: Database,
  appId: string,
  data: NormalizedImport,
  normalizedCategories: NormalizedCategory[],
  media: PreparedMedia[],
  rowId: string,
  now: Date,
) {
  await database.batch([
    database.insert(apps).values({
      id: appId,
      name: data.name,
      slug: data.slug,
      websiteUrl: data.websiteUrl,
      tagline: data.tagline,
      description: data.description,
      pricingType: data.pricingType,
      billingType: data.pricingType === "free" ? null : data.billingType || null,
      pricingDetails: data.pricingDetails || null,
      sourceType: data.sourceType,
      youtubeUrl: data.youtubeUrl || null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    }),
    ...normalizedCategories.flatMap((category) => [
      database
        .insert(categories)
        .values({ id: `category-${category.slug}`, ...category, createdAt: now })
        .onConflictDoUpdate({ target: categories.slug, set: { name: category.name } }),
      database.insert(appCategories).values({
        appId,
        categoryId: sql`(select ${categories.id} from ${categories} where ${categories.slug} = ${category.slug})`,
      }),
    ]),
    ...media.map((asset) => database.insert(mediaAssets).values({
      id: asset.id,
      appId,
      role: asset.role,
      storageKey: asset.storageKey,
      mimeType: asset.mimeType,
      byteSize: asset.byteSize,
      width: asset.width,
      height: asset.height,
      checksum: asset.checksum,
      sourceUrl: asset.sourceUrl,
      altText: asset.altText,
      createdAt: now,
    })),
    database.update(importRows).set({ status: "imported", appId }).where(sql`${importRows.id} = ${rowId}`),
  ]);
}
