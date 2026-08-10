import { and, asc, count, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appTags, apps, tags } from "@/db/schema";
import {
  cardFields,
  getCardMedia,
  type DirectorySearchFilters,
} from "@/lib/directory-shared";

const HOMEPAGE_CURATED_SLUGS = [
  "clop",
  "lunar",
  "dia",
  "anybox",
  "balance",
  "wallspace",
  "cleanshot-x",
  "pieoneer",
  "droppy",
  "iina",
  "klack",
  "antinote",
  "orion",
  "blip",
  "monocle",
  "lookaway",
  "swish",
  "alcove",
  "proxyman",
  "1password",
  "wispr-flow",
  "expenses",
  "mimestream",
  "xmind",
  "raycast",
  "sketch",
  "compressx",
  "dayflow",
  "chronoid",
  "bettertouchtool",
  "daisydisk",
  "session",
];

function searchConditions(filters?: DirectorySearchFilters) {
  const conditions: SQL[] = [eq(apps.status, "published"), isNull(apps.deletedAt)];
  if (filters?.query) {
    const pattern = `%${filters.query.toLowerCase()}%`;
    conditions.push(sql`(
      lower(${apps.name}) like ${pattern}
      or lower(${apps.tagline}) like ${pattern}
      or lower(${apps.description}) like ${pattern}
      or exists (
        select 1 from ${appTags}
        inner join ${tags} on ${tags.id} = ${appTags.tagId}
        where ${appTags.appId} = ${apps.id} and lower(${tags.name}) like ${pattern}
      )
    )`);
  }
  if (filters?.pricing) conditions.push(eq(apps.pricingType, filters.pricing));
  if (filters?.billing) conditions.push(eq(apps.billingType, filters.billing));
  if (filters?.openSource) conditions.push(eq(apps.sourceType, "open_source"));
  return conditions;
}

export async function getHomepageDirectoryData(filters?: DirectorySearchFilters) {
  const database = await getDatabase();
  const heroSlugs = ["dayflow", "cleanshot-x", "swish", "droppy"];
  const [records, heroRecords] = await Promise.all([
    database
      .select(cardFields)
      .from(apps)
      .where(and(
        eq(apps.status, "published"),
        isNull(apps.deletedAt),
        inArray(apps.slug, HOMEPAGE_CURATED_SLUGS),
      ))
      .orderBy(sql`random()`)
      .limit(30),
    database
      .select(cardFields)
      .from(apps)
      .where(and(
        eq(apps.status, "published"),
        isNull(apps.deletedAt),
        inArray(apps.slug, heroSlugs),
      )),
  ]);

  const page = filters?.page ?? 1;
  const pageSize = 24;
  const conditions = searchConditions(filters);
  const [searchRecords, countRows] = filters ? await Promise.all([
    database
      .select({ ...cardFields, sourceType: apps.sourceType })
      .from(apps)
      .where(and(...conditions))
      .orderBy(asc(apps.name))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    database
      .select({ total: count() })
      .from(apps)
      .where(and(...conditions)),
  ]) : [[], [{ total: 0 }]];

  const appIds = [...new Set([...records, ...heroRecords, ...searchRecords].map(({ id }) => id))];
  const { icons, previews } = await getCardMedia(appIds);
  return {
    applications: records.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
      preview: previews.get(record.id) ?? null,
    })),
    heroApplications: heroRecords.map((record) => ({
      ...record,
      icon: icons.get(record.id) ?? null,
      preview: previews.get(record.id) ?? null,
    })),
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
