import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, appTags, apps, categories, mediaAssets, tags } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (query.length < 2) return Response.json({ results: [] });

  const database = await getDatabase();
  const term = query.toLowerCase();
  const pattern = `%${term}%`;
  const prefix = `${term}%`;
  const results = await database
    .select({
      id: apps.id,
      slug: apps.slug,
      name: apps.name,
      tagline: apps.tagline,
      category: categories.name,
      iconStorageKey: sql<string | null>`(select storage_key from ${mediaAssets} where app_id = ${apps.id} and role = 'icon' order by created_at desc limit 1)`,
      iconAltText: sql<string | null>`(select alt_text from ${mediaAssets} where app_id = ${apps.id} and role = 'icon' order by created_at desc limit 1)`,
    })
    .from(apps)
    .innerJoin(appCategories, and(eq(appCategories.appId, apps.id), eq(appCategories.isPrimary, true)))
    .innerJoin(categories, eq(categories.id, appCategories.categoryId))
    .where(and(
      eq(apps.status, "published"),
      isNull(apps.deletedAt),
      sql`(
        lower(${apps.name}) like ${pattern}
        or lower(${apps.tagline}) like ${pattern}
        or lower(${apps.description}) like ${pattern}
        or lower(${categories.name}) like ${pattern}
        or exists (
          select 1 from ${appTags}
          inner join ${tags} on ${tags.id} = ${appTags.tagId}
          where ${appTags.appId} = ${apps.id} and lower(${tags.name}) like ${pattern}
        )
      )`,
    ))
    .orderBy(
      sql`case when lower(${apps.name}) = ${term} then 0 when lower(${apps.name}) like ${prefix} then 1 else 2 end`,
      asc(apps.name),
    )
    .limit(8);

  return Response.json(
    { results },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
  );
}
