import { and, asc, count, desc, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  appRelationships,
  appCategories,
  apps,
  mediaAssets,
  categories,
} from "@/db/schema";

export async function getEditorialOptions(excludeAppId?: string) {
  const database = await getDatabase();
  const [relatedApplicationOptions, categoryOptions] = await Promise.all([
    database
      .select({ id: apps.id, name: apps.name, status: apps.status })
      .from(apps)
      .where(excludeAppId
        ? and(isNull(apps.deletedAt), ne(apps.id, excludeAppId))
        : isNull(apps.deletedAt))
      .orderBy(asc(apps.name)),
    database.select({ name: categories.name }).from(categories).orderBy(asc(categories.name)),
  ]);

  return {
    relatedApplications: relatedApplicationOptions,
    categories: categoryOptions.map(({ name }) => name),
  };
}

export async function getApplicationsDashboardData() {
  const database = await getDatabase();
  const [records, statsRows, mediaRows] = await Promise.all([
    database
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        pricingType: apps.pricingType,
        billingType: apps.billingType,
        pricingDetails: apps.pricingDetails,
        sourceType: apps.sourceType,
        status: apps.status,
        updatedAt: apps.updatedAt,
      })
      .from(apps)
      .where(isNull(apps.deletedAt))
      .orderBy(desc(apps.updatedAt))
      .limit(50),
    database
      .select({
        total: count(),
        published: sql<number>`coalesce(sum(case when ${apps.status} = 'published' then 1 else 0 end), 0)`,
        drafts: sql<number>`coalesce(sum(case when ${apps.status} = 'draft' then 1 else 0 end), 0)`,
      })
      .from(apps)
      .where(isNull(apps.deletedAt)),
    database
      .select({ count: count(), bytes: sql<number>`coalesce(sum(${mediaAssets.byteSize}), 0)` })
      .from(mediaAssets),
  ]);

  const applicationIds = records.map(({ id }) => id);
  const iconRows = applicationIds.length > 0
    ? await database
      .select({
        appId: mediaAssets.appId,
        storageKey: mediaAssets.storageKey,
        altText: mediaAssets.altText,
      })
      .from(mediaAssets)
      .where(and(
        inArray(mediaAssets.appId, applicationIds),
        eq(mediaAssets.role, "icon"),
      ))
      .orderBy(desc(mediaAssets.createdAt))
    : [];
  const iconsByApplication = new Map<string, (typeof iconRows)[number]>();
  for (const icon of iconRows) {
    if (icon.appId && !iconsByApplication.has(icon.appId)) {
      iconsByApplication.set(icon.appId, icon);
    }
  }

  return {
    applications: records.map((record) => {
      const icon = iconsByApplication.get(record.id);
      return {
        ...record,
        iconStorageKey: icon?.storageKey ?? null,
        iconAltText: icon?.altText ?? null,
      };
    }),
    stats: statsRows[0] ?? { total: 0, published: 0, drafts: 0 },
    media: mediaRows[0] ?? { count: 0, bytes: 0 },
  };
}

export async function getApplicationEditorData(id: string) {
  const database = await getDatabase();
  const [applicationRows, media, categoryRows, relationshipRows] = await Promise.all([
    database
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        websiteUrl: apps.websiteUrl,
        tagline: apps.tagline,
        description: apps.description,
        pricingType: apps.pricingType,
        billingType: apps.billingType,
        pricingDetails: apps.pricingDetails,
        sourceType: apps.sourceType,
        youtubeUrl: apps.youtubeUrl,
        status: apps.status,
      })
      .from(apps)
      .where(and(eq(apps.id, id), isNull(apps.deletedAt)))
      .limit(1),
    database
      .select({
        id: mediaAssets.id,
        role: mediaAssets.role,
        storageKey: mediaAssets.storageKey,
        mimeType: mediaAssets.mimeType,
        byteSize: mediaAssets.byteSize,
        width: mediaAssets.width,
        height: mediaAssets.height,
        durationMs: mediaAssets.durationMs,
        sourceUrl: mediaAssets.sourceUrl,
        altText: mediaAssets.altText,
        createdAt: mediaAssets.createdAt,
      })
      .from(mediaAssets)
      .where(and(eq(mediaAssets.appId, id), sql`${mediaAssets.role} <> 'audio'`))
      .orderBy(desc(mediaAssets.createdAt)),
    database
      .select({ name: categories.name })
      .from(appCategories)
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(eq(appCategories.appId, id))
      .orderBy(asc(categories.name)),
    database
      .select({
        sourceAppId: appRelationships.sourceAppId,
        targetAppId: appRelationships.targetAppId,
      })
      .from(appRelationships)
      .where(or(eq(appRelationships.sourceAppId, id), eq(appRelationships.targetAppId, id))),
  ]);

  const application = applicationRows[0]
    ? {
        ...applicationRows[0],
        categoriesText: categoryRows.map(({ name }) => name).join(", "),
        relatedAppIds: relationshipRows.map(({ sourceAppId, targetAppId }) =>
          sourceAppId === id ? targetAppId : sourceAppId),
      }
    : null;

  return { application, media };
}
