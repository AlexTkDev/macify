import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDatabase } from "@/db/client";
import {
  appRelationships,
  appCategories,
  apps,
  mediaAssets,
  categories,
  deals,
} from "@/db/schema";
import { getAppIcons, publicApplicationFields } from "@/lib/directory-shared";

export async function getPublishedApplicationBySlug(slug: string) {
  const database = await getDatabase();
  const applicationRows = await database
    .select(publicApplicationFields)
    .from(apps)
    .where(and(eq(apps.slug, slug), eq(apps.status, "published"), isNull(apps.deletedAt)))
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
    billingType: relatedApp.billingType,
    pricingDetails: relatedApp.pricingDetails,
    isFeatured: relatedApp.isFeatured,
  };
  const now = new Date();
  const [categoryRows, media, outgoing, incoming, dealRows] = await Promise.all([
    database
      .select({ id: categories.id, slug: categories.slug, name: categories.name })
      .from(appCategories)
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(eq(appCategories.appId, application.id))
      .orderBy(asc(categories.name)),
    database
      .select({
        id: mediaAssets.id,
        role: mediaAssets.role,
        storageKey: mediaAssets.storageKey,
        mimeType: mediaAssets.mimeType,
        width: mediaAssets.width,
        height: mediaAssets.height,
        altText: mediaAssets.altText,
      })
      .from(mediaAssets)
      .where(and(
        eq(mediaAssets.appId, application.id),
        sql`${mediaAssets.role} <> 'audio'`,
      ))
      .orderBy(asc(mediaAssets.createdAt)),
    database
      .select(relatedFields)
      .from(appRelationships)
      .innerJoin(relatedApp, eq(relatedApp.id, appRelationships.targetAppId))
      .where(and(
        eq(appRelationships.sourceAppId, application.id),
        eq(relatedApp.status, "published"),
        isNull(relatedApp.deletedAt),
      ))
      .orderBy(asc(relatedApp.name))
      .limit(6),
    database
      .select(relatedFields)
      .from(appRelationships)
      .innerJoin(relatedApp, eq(relatedApp.id, appRelationships.sourceAppId))
      .where(and(
        eq(appRelationships.targetAppId, application.id),
        eq(relatedApp.status, "published"),
        isNull(relatedApp.deletedAt),
      ))
      .orderBy(asc(relatedApp.name))
      .limit(6),
    database.select().from(deals).where(and(
      eq(deals.appId, application.id),
      sql`(${deals.startsAt} is null or ${deals.startsAt} <= ${now})`,
      sql`(${deals.endsAt} is null or ${deals.endsAt} > ${now})`,
    )).limit(1),
  ]);

  const relatedRecords = Array.from(
    [...outgoing, ...incoming]
      .reduce(
        (items, item) => items.set(item.id, item),
        new Map<string, (typeof outgoing)[number]>(),
      )
      .values(),
  ).slice(0, 6);
  const icons = await getAppIcons(relatedRecords.map(({ id }) => id));
  return {
    ...application,
    categories: categoryRows,
    media,
    related: relatedRecords.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
    })),
    deal: dealRows[0] ?? null,
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
