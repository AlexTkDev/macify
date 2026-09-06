import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  apps,
  mediaAssets,
  categories,
  catalogueRevisions,
} from "@/db/schema";

export async function getApplicationsDashboardData() {
  const database = await getDatabase();
  const [records, statsRows, mediaRows, revisionRows] = await Promise.all([
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
        isFeatured: apps.isFeatured,
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
      })
      .from(apps)
      .where(isNull(apps.deletedAt)),
    database
      .select({ count: count(), bytes: sql<number>`coalesce(sum(${mediaAssets.byteSize}), 0)` })
      .from(mediaAssets),
    database.select({ count: count() }).from(catalogueRevisions).where(eq(catalogueRevisions.status, "pending")),
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
    stats: statsRows[0] ?? { total: 0, published: 0 },
    media: mediaRows[0] ?? { count: 0, bytes: 0 },
    pendingRevisions: revisionRows[0]?.count ?? 0,
  };
}

export async function getApplicationEditorData(id: string) {
  const database = await getDatabase();
  const [applicationRows, media, categoryRows] = await Promise.all([
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
        isFeatured: apps.isFeatured,
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
  ]);

  const application = applicationRows[0]
    ? {
        ...applicationRows[0],
        categoriesText: categoryRows.map(({ name }) => name).join(", "),
      }
    : null;

  return { application, media };
}
