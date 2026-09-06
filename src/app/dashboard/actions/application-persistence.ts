import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appRelationships, appCategories, apps, categories } from "@/db/schema";
import { normalizeCategories, type ApplicationFields } from "@/lib/application-schema";

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

export function categoryQueries(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  data: ApplicationFields,
) {
  const normalizedCategories = normalizeCategories(data.categoriesText);
  return [
    database.delete(appCategories).where(eq(appCategories.appId, appId)),
    ...normalizedCategories.flatMap(({ name, slug }) => [
      database
        .insert(categories)
        .values({ id: `category-${slug}`, name, slug, createdAt: new Date() })
        .onConflictDoUpdate({ target: categories.slug, set: { name } }),
      database.insert(appCategories).values({
        appId,
        categoryId: sql`(select ${categories.id} from ${categories} where ${categories.slug} = ${slug})`,
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
