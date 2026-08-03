import { and, asc, count, desc, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  appRelationships,
  appTags,
  apps,
  categories,
  mediaAssets,
  tags,
} from "@/db/schema";

export async function getTaxonomyOptions() {
  const database = await getDatabase();
  return database
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getEditorialOptions(excludeAppId?: string) {
  const database = await getDatabase();
  const [categoryOptions, relatedApplicationOptions] = await Promise.all([
    database
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    database
      .select({ id: apps.id, name: apps.name, status: apps.status })
      .from(apps)
      .where(
        excludeAppId
          ? and(isNull(apps.deletedAt), ne(apps.id, excludeAppId))
          : isNull(apps.deletedAt),
      )
      .orderBy(asc(apps.name)),
  ]);

  return { categories: categoryOptions, relatedApplications: relatedApplicationOptions };
}

const publicApplicationFields = {
  id: apps.id,
  slug: apps.slug,
  name: apps.name,
  websiteUrl: apps.websiteUrl,
  tagline: apps.tagline,
  summary: apps.summary,
  description: apps.description,
  pricingType: apps.pricingType,
  pricingDetails: apps.pricingDetails,
  sourceType: apps.sourceType,
  sourceUrl: apps.sourceUrl,
  youtubeUrl: apps.youtubeUrl,
  minimumMacos: apps.minimumMacos,
  seoTitle: apps.seoTitle,
  seoDescription: apps.seoDescription,
  publishedAt: apps.publishedAt,
};

export async function getApplicationsDashboardData() {
  const database = await getDatabase();

  const [records, statsRows, mediaRows] = await Promise.all([
    database
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        minimumMacos: apps.minimumMacos,
        pricingType: apps.pricingType,
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
      .select({
        count: count(),
        bytes: sql<number>`coalesce(sum(${mediaAssets.byteSize}), 0)`,
      })
      .from(mediaAssets),
  ]);

  return {
    applications: records,
    stats: statsRows[0] ?? { total: 0, published: 0, drafts: 0 },
    media: mediaRows[0] ?? { count: 0, bytes: 0 },
  };
}

export async function getHomepageDirectoryData() {
  const database = await getDatabase();
  const [records, taxonomy] = await Promise.all([
    database
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        tagline: apps.tagline,
        pricingType: apps.pricingType,
        pricingDetails: apps.pricingDetails,
        minimumMacos: apps.minimumMacos,
        category: categories.name,
      })
      .from(apps)
      .innerJoin(
        appCategories,
        and(eq(appCategories.appId, apps.id), eq(appCategories.isPrimary, true)),
      )
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
      .orderBy(desc(apps.publishedAt), asc(apps.name))
      .limit(7),
    database
      .select({ id: categories.id, slug: categories.slug, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name))
      .limit(8),
  ]);

  const iconRows = records.length
    ? await database
        .select({ appId: mediaAssets.appId, storageKey: mediaAssets.storageKey, altText: mediaAssets.altText })
        .from(mediaAssets)
        .where(and(inArray(mediaAssets.appId, records.map(({ id }) => id)), eq(mediaAssets.role, "icon")))
        .orderBy(desc(mediaAssets.createdAt))
    : [];
  const icons = new Map<string, (typeof iconRows)[number]>();
  for (const icon of iconRows) {
    if (icon.appId && !icons.has(icon.appId)) icons.set(icon.appId, icon);
  }

  return {
    applications: records.map((record) => ({ ...record, icon: icons.get(record.id) ?? null })),
    categories: taxonomy,
  };
}

export async function getApplicationEditorData(id: string) {
  const database = await getDatabase();
  const [applicationRows, media, categoryRows, tagRows, relationshipRows] = await Promise.all([
    database
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        websiteUrl: apps.websiteUrl,
        tagline: apps.tagline,
        summary: apps.summary,
        description: apps.description,
        pricingType: apps.pricingType,
        pricingDetails: apps.pricingDetails,
        sourceType: apps.sourceType,
        sourceUrl: apps.sourceUrl,
        youtubeUrl: apps.youtubeUrl,
        minimumMacos: apps.minimumMacos,
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
      .select({ id: categories.id })
      .from(appCategories)
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(and(eq(appCategories.appId, id), eq(appCategories.isPrimary, true)))
      .limit(1),
    database
      .select({ name: tags.name })
      .from(appTags)
      .innerJoin(tags, eq(tags.id, appTags.tagId))
      .where(eq(appTags.appId, id))
      .orderBy(asc(tags.name)),
    database
      .select({
        sourceAppId: appRelationships.sourceAppId,
        targetAppId: appRelationships.targetAppId,
      })
      .from(appRelationships)
      .where(
        or(
          eq(appRelationships.sourceAppId, id),
          eq(appRelationships.targetAppId, id),
        ),
      ),
  ]);

  const application = applicationRows[0]
    ? {
        ...applicationRows[0],
        categoryId: categoryRows[0]?.id ?? "",
        tagsText: tagRows.map(({ name }) => name).join(", "),
        relatedAppIds: relationshipRows.map(({ sourceAppId, targetAppId }) =>
          sourceAppId === id ? targetAppId : sourceAppId,
        ),
      }
    : null;

  return { application, media };
}

export async function getPublishedApplicationBySlug(slug: string) {
  const database = await getDatabase();
  const applicationRows = await database
    .select(publicApplicationFields)
    .from(apps)
    .where(
      and(eq(apps.slug, slug), eq(apps.status, "published"), isNull(apps.deletedAt)),
    )
    .limit(1);

  const application = applicationRows[0];
  if (!application) return null;

  const relatedApp = alias(apps, "related_app");
  const relatedFields = {
    id: relatedApp.id,
    slug: relatedApp.slug,
    name: relatedApp.name,
    tagline: relatedApp.tagline,
    pricingType: relatedApp.pricingType,
    confidence: appRelationships.confidence,
  };

  const [categoryRows, tagRows, media, outgoing, incoming] = await Promise.all([
    database
      .select({ id: categories.id, slug: categories.slug, name: categories.name })
      .from(appCategories)
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(and(eq(appCategories.appId, application.id), eq(appCategories.isPrimary, true)))
      .limit(1),
    database
      .select({ id: tags.id, slug: tags.slug, name: tags.name })
      .from(appTags)
      .innerJoin(tags, eq(tags.id, appTags.tagId))
      .where(eq(appTags.appId, application.id))
      .orderBy(asc(tags.name)),
    database
      .select({
        id: mediaAssets.id,
        role: mediaAssets.role,
        storageKey: mediaAssets.storageKey,
        mimeType: mediaAssets.mimeType,
        width: mediaAssets.width,
        height: mediaAssets.height,
        durationMs: mediaAssets.durationMs,
        altText: mediaAssets.altText,
      })
      .from(mediaAssets)
      .where(and(eq(mediaAssets.appId, application.id), sql`${mediaAssets.role} <> 'audio'`))
      .orderBy(asc(mediaAssets.createdAt)),
    database
      .select(relatedFields)
      .from(appRelationships)
      .innerJoin(relatedApp, eq(relatedApp.id, appRelationships.targetAppId))
      .where(
        and(
          eq(appRelationships.sourceAppId, application.id),
          eq(relatedApp.status, "published"),
          isNull(relatedApp.deletedAt),
        ),
      )
      .orderBy(desc(appRelationships.confidence))
      .limit(6),
    database
      .select(relatedFields)
      .from(appRelationships)
      .innerJoin(relatedApp, eq(relatedApp.id, appRelationships.sourceAppId))
      .where(
        and(
          eq(appRelationships.targetAppId, application.id),
          eq(relatedApp.status, "published"),
          isNull(relatedApp.deletedAt),
        ),
      )
      .orderBy(desc(appRelationships.confidence))
      .limit(6),
  ]);

  const related = Array.from(
    [...outgoing, ...incoming]
      .sort((a, b) => b.confidence - a.confidence)
      .reduce((records, record) => records.set(record.id, record), new Map<string, (typeof outgoing)[number]>())
      .values(),
  ).slice(0, 6);

  return {
    ...application,
    category: categoryRows[0] ?? null,
    tags: tagRows,
    media,
    related,
  };
}

export async function getPublishedApplicationSlugs() {
  const database = await getDatabase();
  return database
    .select({ slug: apps.slug, updatedAt: apps.updatedAt })
    .from(apps)
    .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
    .orderBy(desc(apps.updatedAt));
}

export async function getCategoryDirectoryData() {
  const database = await getDatabase();
  return database
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      publishedCount: sql<number>`count(${apps.id})`,
    })
    .from(categories)
    .leftJoin(appCategories, eq(appCategories.categoryId, categories.id))
    .leftJoin(
      apps,
      and(
        eq(apps.id, appCategories.appId),
        eq(apps.status, "published"),
        isNull(apps.deletedAt),
      ),
    )
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getPublishedCategoryBySlug(slug: string) {
  const database = await getDatabase();
  const categoryRows = await database
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  const category = categoryRows[0];
  if (!category) return null;

  const records = await database
    .select({
      id: apps.id,
      slug: apps.slug,
      name: apps.name,
      tagline: apps.tagline,
      pricingType: apps.pricingType,
      pricingDetails: apps.pricingDetails,
      minimumMacos: apps.minimumMacos,
    })
    .from(appCategories)
    .innerJoin(apps, eq(apps.id, appCategories.appId))
    .where(
      and(
        eq(appCategories.categoryId, category.id),
        eq(apps.status, "published"),
        isNull(apps.deletedAt),
      ),
    )
    .orderBy(desc(apps.publishedAt), asc(apps.name));

  const iconRows = records.length
    ? await database
        .select({ appId: mediaAssets.appId, storageKey: mediaAssets.storageKey, altText: mediaAssets.altText })
        .from(mediaAssets)
        .where(and(inArray(mediaAssets.appId, records.map(({ id }) => id)), eq(mediaAssets.role, "icon")))
        .orderBy(desc(mediaAssets.createdAt))
    : [];
  const icons = new Map<string, (typeof iconRows)[number]>();
  for (const icon of iconRows) {
    if (icon.appId && !icons.has(icon.appId)) icons.set(icon.appId, icon);
  }

  return {
    ...category,
    applications: records.map((record) => ({ ...record, icon: icons.get(record.id) ?? null })),
  };
}
