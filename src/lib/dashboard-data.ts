import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  appTags,
  apps,
  categories,
  importJobs,
  importRows,
  mediaAssets,
  tags,
} from "@/db/schema";

export async function getCategoryManagementData() {
  const database = await getDatabase();
  return database
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      sortOrder: categories.sortOrder,
      applicationCount: count(appCategories.appId),
    })
    .from(categories)
    .leftJoin(appCategories, eq(appCategories.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getTagManagementData() {
  const database = await getDatabase();
  return database
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      applicationCount: count(appTags.appId),
    })
    .from(tags)
    .leftJoin(appTags, eq(appTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(desc(count(appTags.appId)), asc(tags.name));
}

export async function getMediaManagementData() {
  const database = await getDatabase();
  const [records, totals] = await Promise.all([
    database
      .select({
        id: mediaAssets.id,
        appId: mediaAssets.appId,
        appName: apps.name,
        appStatus: apps.status,
        role: mediaAssets.role,
        storageKey: mediaAssets.storageKey,
        mimeType: mediaAssets.mimeType,
        byteSize: mediaAssets.byteSize,
        sourceUrl: mediaAssets.sourceUrl,
        altText: mediaAssets.altText,
        createdAt: mediaAssets.createdAt,
      })
      .from(mediaAssets)
      .leftJoin(apps, and(eq(apps.id, mediaAssets.appId), isNull(apps.deletedAt)))
      .where(sql`${mediaAssets.role} <> 'audio'`)
      .orderBy(desc(mediaAssets.createdAt)),
    database
      .select({ count: count(), bytes: sql<number>`coalesce(sum(${mediaAssets.byteSize}), 0)` })
      .from(mediaAssets)
      .where(sql`${mediaAssets.role} <> 'audio'`),
  ]);
  return { records, totals: totals[0] ?? { count: 0, bytes: 0 } };
}

export async function getImportJobsData() {
  const database = await getDatabase();
  return database
    .select()
    .from(importJobs)
    .orderBy(desc(importJobs.createdAt))
    .limit(50);
}

export async function getImportJobData(id: string) {
  const database = await getDatabase();
  const [jobs, rows] = await Promise.all([
    database.select().from(importJobs).where(eq(importJobs.id, id)).limit(1),
    database
      .select()
      .from(importRows)
      .where(eq(importRows.importJobId, id))
      .orderBy(asc(importRows.rowNumber)),
  ]);
  return { job: jobs[0] ?? null, rows };
}
