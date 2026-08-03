import { and, asc, count, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, appTags, apps, categories, tags } from "@/db/schema";
import { getCategoryDirectoryData } from "@/lib/category-directory-data";
import {
  cardFields,
  getCardMedia,
  type DirectorySearchFilters,
} from "@/lib/directory-shared";

function searchConditions(filters?: DirectorySearchFilters) {
  const conditions: SQL[] = [eq(apps.status, "published"), isNull(apps.deletedAt)];
  if (filters?.query) {
    const pattern = `%${filters.query.toLowerCase()}%`;
    conditions.push(sql`(
      lower(${apps.name}) like ${pattern}
      or lower(${apps.tagline}) like ${pattern}
      or lower(${apps.description}) like ${pattern}
      or lower(${categories.name}) like ${pattern}
      or exists (
        select 1 from ${appTags}
        inner join ${tags} on ${tags.id} = ${appTags.tagId}
        where ${appTags.appId} = ${apps.id} and lower(${tags.name}) like ${pattern}
      )
    )`);
  }
  if (filters?.category) conditions.push(eq(categories.slug, filters.category));
  if (filters?.pricing) conditions.push(eq(apps.pricingType, filters.pricing));
  if (filters?.billing) conditions.push(eq(apps.billingType, filters.billing));
  if (filters?.openSource) conditions.push(eq(apps.sourceType, "open_source"));
  return conditions;
}

export async function getHomepageDirectoryData(filters?: DirectorySearchFilters) {
  const database = await getDatabase();
  const [records, taxonomy] = await Promise.all([
    database
      .select(cardFields)
      .from(apps)
      .innerJoin(appCategories, and(
        eq(appCategories.appId, apps.id),
        eq(appCategories.isPrimary, true),
      ))
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
      .orderBy(desc(apps.publishedAt), asc(apps.name)),
    getCategoryDirectoryData(),
  ]);

  const page = filters?.page ?? 1;
  const pageSize = 24;
  const conditions = searchConditions(filters);
  const [searchRecords, countRows] = filters ? await Promise.all([
    database
      .select({ ...cardFields, sourceType: apps.sourceType })
      .from(apps)
      .innerJoin(appCategories, and(
        eq(appCategories.appId, apps.id),
        eq(appCategories.isPrimary, true),
      ))
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(and(...conditions))
      .orderBy(asc(apps.name))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    database
      .select({ total: count() })
      .from(apps)
      .innerJoin(appCategories, and(
        eq(appCategories.appId, apps.id),
        eq(appCategories.isPrimary, true),
      ))
      .innerJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(and(...conditions)),
  ]) : [[], [{ total: 0 }]];

  const appIds = [...new Set([...records, ...searchRecords].map(({ id }) => id))];
  const { icons, previews } = await getCardMedia(appIds);
  return {
    applications: records.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
      preview: previews.get(record.id) ?? null,
    })),
    categories: taxonomy,
    search: {
      active: Boolean(filters),
      applications: searchRecords.map((record) => ({
        ...record,
        icon: icons.get(record.id) ?? null,
      })),
      page,
      pageSize,
      total: Number(countRows[0]?.total ?? 0),
    },
  };
}
