import { and, asc, count, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, apps, categories } from "@/db/schema";
import {
  cardFields,
  getCardMedia,
  type DirectorySearchFilters,
} from "@/lib/directory-shared";
import { getHotApplicationVisits, getTrendingApplicationVisits } from "@/lib/datafast-analytics";

type HomepageView = "hot" | "trending" | "latest";

const HOMEPAGE_CURATED_SLUGS = [
  "clop",
  "lunar",
  "dia",
  "anybox",
  "balance",
  "wallspace",
  "pieoneer",
  "droppy",
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
const HOMEPAGE_CURATED_ORDER = new Map(
  HOMEPAGE_CURATED_SLUGS.map((slug, index) => [slug, index]),
);

function searchConditions(filters?: DirectorySearchFilters) {
  const conditions: SQL[] = [eq(apps.status, "published"), isNull(apps.deletedAt)];
  if (filters?.query) {
    const pattern = `%${filters.query.toLowerCase()}%`;
    conditions.push(sql`(
      lower(${apps.name}) like ${pattern}
      or lower(${apps.tagline}) like ${pattern}
      or lower(${apps.description}) like ${pattern}
      or exists (
        select 1 from ${appCategories}
        inner join ${categories} on ${categories.id} = ${appCategories.categoryId}
        where ${appCategories.appId} = ${apps.id} and lower(${categories.name}) like ${pattern}
      )
    )`);
  }
  if (filters?.pricing) conditions.push(eq(apps.pricingType, filters.pricing));
  if (filters?.billing) conditions.push(eq(apps.billingType, filters.billing));
  if (filters?.openSource) conditions.push(eq(apps.sourceType, "open_source"));
  return conditions;
}

export async function getHomepageDirectoryData(filters?: DirectorySearchFilters, view: HomepageView = "hot") {
  const database = await getDatabase();
  const [fallbackRecords, analyticsVisits] = await Promise.all([
    view === "latest"
      ? database.select(cardFields).from(apps)
        .where(and(eq(apps.status, "published"), isNull(apps.deletedAt)))
        .orderBy(desc(apps.createdAt), asc(apps.id)).limit(30)
      : database.select(cardFields).from(apps).where(and(
        eq(apps.status, "published"), isNull(apps.deletedAt), inArray(apps.slug, HOMEPAGE_CURATED_SLUGS),
      )).limit(30),
    view === "hot" ? getHotApplicationVisits() : view === "trending" ? getTrendingApplicationVisits() : Promise.resolve([]),
  ]);

  let records = fallbackRecords;
  if (analyticsVisits.length) {
    const rankedSlugs = analyticsVisits.map(({ slug }) => slug);
    const rankedRecords = await database.select(cardFields).from(apps).where(and(
      eq(apps.status, "published"), isNull(apps.deletedAt), inArray(apps.slug, rankedSlugs),
    )).limit(30);
    const bySlug = new Map(rankedRecords.map((record) => [record.slug, record]));
    const ranked = rankedSlugs.map((slug) => bySlug.get(slug)).filter((record): record is (typeof rankedRecords)[number] => Boolean(record));
    const rankedIds = new Set(ranked.map(({ id }) => id));
    const curatedRemainder = [...fallbackRecords]
      .filter(({ id }) => !rankedIds.has(id))
      .sort((left, right) => (
        (HOMEPAGE_CURATED_ORDER.get(left.slug) ?? HOMEPAGE_CURATED_SLUGS.length)
        - (HOMEPAGE_CURATED_ORDER.get(right.slug) ?? HOMEPAGE_CURATED_SLUGS.length)
      ));
    records = [...ranked, ...curatedRemainder].slice(0, 30);
  }

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

  const appIds = [...new Set([...records, ...searchRecords].map(({ id }) => id))];
  const { icons, previews } = await getCardMedia(appIds);
  const orderedRecords = view !== "latest" && !analyticsVisits.length ? [...records].sort((left, right) => (
    (HOMEPAGE_CURATED_ORDER.get(left.slug) ?? HOMEPAGE_CURATED_SLUGS.length)
    - (HOMEPAGE_CURATED_ORDER.get(right.slug) ?? HOMEPAGE_CURATED_SLUGS.length)
  )) : records;
  return {
    applications: orderedRecords.map((record) => ({
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

// Keep hero artwork independent of optional ranking analytics.
export async function getHomepageHeroData() {
  const database = await getDatabase();
  const records = await database.select(cardFields).from(apps).where(and(
    eq(apps.status, "published"),
    isNull(apps.deletedAt),
    inArray(apps.slug, ["dayflow", "cleanshot-x", "swish", "droppy"]),
  )).limit(4);
  const { icons, previews } = await getCardMedia(records.map(({ id }) => id));
  return records.map((record) => ({
    ...record,
    icon: icons.get(record.id) ?? null,
    preview: previews.get(record.id) ?? null,
  }));
}
