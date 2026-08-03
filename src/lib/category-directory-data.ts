import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, apps, categories } from "@/db/schema";

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
    .leftJoin(apps, and(
      eq(apps.id, appCategories.appId),
      eq(apps.status, "published"),
      isNull(apps.deletedAt),
    ))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}
