import { and, asc, eq, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appTags, apps, tags } from "@/db/schema";
import { cardFields, getCardMedia } from "@/lib/directory-shared";

export async function getPublishedTagBySlug(slug: string) {
  const database = await getDatabase();
  const tagRows = await database
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  const tag = tagRows[0];
  if (!tag) return null;

  const records = await database
    .select(cardFields)
    .from(appTags)
    .innerJoin(apps, eq(apps.id, appTags.appId))
    .where(and(eq(appTags.tagId, tag.id), eq(apps.status, "published"), isNull(apps.deletedAt)))
    .orderBy(asc(apps.name));
  const { icons, previews } = await getCardMedia(records.map(({ id }) => id));

  return {
    ...tag,
    applications: records.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
      preview: previews.get(record.id) ?? null,
    })),
  };
}

export async function getPublishedTagSlugs() {
  const database = await getDatabase();
  return database
    .selectDistinct({ slug: tags.slug })
    .from(tags)
    .innerJoin(appTags, eq(appTags.tagId, tags.id))
    .innerJoin(apps, eq(apps.id, appTags.appId))
    .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
    .orderBy(asc(tags.slug));
}
