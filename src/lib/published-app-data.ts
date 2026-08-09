import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDatabase } from "@/db/client";
import {
  appRelationships,
  appTags,
  apps,
  mediaAssets,
  tags,
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
    confidence: appRelationships.confidence,
  };
  const [tagRows, media, outgoing, incoming] = await Promise.all([
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
      .orderBy(desc(appRelationships.confidence))
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
      .orderBy(desc(appRelationships.confidence))
      .limit(6),
  ]);

  const relatedRecords = Array.from(
    [...outgoing, ...incoming]
      .sort((a, b) => b.confidence - a.confidence)
      .reduce(
        (items, item) => items.set(item.id, item),
        new Map<string, (typeof outgoing)[number]>(),
      )
      .values(),
  ).slice(0, 6);
  const icons = await getAppIcons(relatedRecords.map(({ id }) => id));
  return {
    ...application,
    tags: tagRows,
    media,
    related: relatedRecords.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
    })),
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
