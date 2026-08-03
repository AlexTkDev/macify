import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, appRelationships, appTags, apps, tags } from "@/db/schema";
import { normalizeTags, type ApplicationFields } from "@/lib/application-schema";

export function normalizedApplicationValues(data: ApplicationFields) {
  return {
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
  };
}

export function taxonomyQueries(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  data: ApplicationFields,
) {
  const normalizedTags = normalizeTags(data.tagsText);
  return [
    database.delete(appCategories).where(eq(appCategories.appId, appId)),
    database.insert(appCategories).values({ appId, categoryId: data.categoryId, isPrimary: true }),
    database.delete(appTags).where(eq(appTags.appId, appId)),
    ...normalizedTags.flatMap(({ name, slug }) => [
      database
        .insert(tags)
        .values({ id: `tag-${slug}`, name, slug, createdAt: new Date() })
        .onConflictDoUpdate({ target: tags.slug, set: { name } }),
      database.insert(appTags).values({
        appId,
        tagId: sql`(select ${tags.id} from ${tags} where ${tags.slug} = ${slug})`,
      }),
    ]),
  ] as const;
}

export function relationshipQueries(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  relatedAppIds: string[],
) {
  const uniqueIds = [...new Set(relatedAppIds)].filter((relatedId) => relatedId !== appId);
  return [
    database.delete(appRelationships).where(or(
      eq(appRelationships.sourceAppId, appId),
      eq(appRelationships.targetAppId, appId),
    )),
    ...uniqueIds.map((relatedId) => {
      const [sourceAppId, targetAppId] = [appId, relatedId].sort();
      return database
        .insert(appRelationships)
        .values({
          id: crypto.randomUUID(),
          sourceAppId,
          targetAppId,
          relationshipType: "related",
          confidence: 1,
          origin: "manual",
          reviewedAt: new Date(),
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }),
  ] as const;
}

export async function relatedApplicationsExist(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  relatedAppIds: string[],
) {
  const uniqueIds = [...new Set(relatedAppIds)].filter((relatedId) => relatedId !== appId);
  if (uniqueIds.length === 0) return true;
  const rows = await database
    .select({ id: apps.id })
    .from(apps)
    .where(and(inArray(apps.id, uniqueIds), isNull(apps.deletedAt)));
  return rows.length === uniqueIds.length;
}

export function uniqueConstraintMessage(message: string) {
  return message.includes("UNIQUE constraint failed")
    ? "An application with this slug or website already exists."
    : null;
}
