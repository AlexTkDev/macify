import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, apps, categories } from "@/db/schema";
import { cardFields, getAppIcons, getCardMedia } from "@/lib/directory-shared";

export async function getPublishedCategoryBySlug(slug: string) {
  const database = await getDatabase();
  const categoryRows = await database
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  const category = categoryRows[0];
  if (!category) return null;

  const records = await database
    .select(cardFields)
    .from(appCategories)
    .innerJoin(apps, eq(apps.id, appCategories.appId))
    .where(and(eq(appCategories.categoryId, category.id), eq(apps.status, "published"), isNull(apps.deletedAt)))
    .orderBy(asc(apps.name));
  const { icons, previews } = await getCardMedia(records.map(({ id }) => id));

  return {
    ...category,
    applications: records.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
      preview: previews.get(record.id) ?? null,
    })),
  };
}

export async function getPublishedCategorySlugs() {
  const database = await getDatabase();
  return database
    .selectDistinct({ slug: categories.slug })
    .from(categories)
    .innerJoin(appCategories, eq(appCategories.categoryId, categories.id))
    .innerJoin(apps, eq(apps.id, appCategories.appId))
    .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
    .orderBy(asc(categories.slug));
}

export async function getPublishedCategories() {
  const database = await getDatabase();
  const [categoryRows, applicationRows] = await Promise.all([
    database.select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      applicationCount: count(appCategories.appId),
    }).from(categories)
      .innerJoin(appCategories, eq(appCategories.categoryId, categories.id))
      .innerJoin(apps, eq(apps.id, appCategories.appId))
      .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
      .groupBy(categories.id)
      .orderBy(desc(count(appCategories.appId)), asc(categories.name)),
    database.select({ categoryId: appCategories.categoryId, ...cardFields })
      .from(appCategories)
      .innerJoin(apps, eq(apps.id, appCategories.appId))
      .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
      .orderBy(desc(apps.publishedAt), asc(apps.name)),
  ]);
  const icons = await getAppIcons([...new Set(applicationRows.map(({ id }) => id))]);
  const applicationsByCategory = new Map<string, Array<(typeof applicationRows)[number] & {
    icon: NonNullable<ReturnType<typeof icons.get>> | null;
  }>>();

  for (const application of applicationRows) {
    const categoryApplications = applicationsByCategory.get(application.categoryId) ?? [];
    if (categoryApplications.length >= 4) continue;
    categoryApplications.push({ ...application, icon: icons.get(application.id) ?? null });
    applicationsByCategory.set(application.categoryId, categoryApplications);
  }

  return categoryRows.map((category) => ({
    ...category,
    applications: applicationsByCategory.get(category.id) ?? [],
  }));
}
