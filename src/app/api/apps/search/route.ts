import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, apps, categories } from "@/db/schema";
import { cardFields, getCardMedia } from "@/lib/directory/directory-shared";

export const dynamic = "force-dynamic";

function escapeLikePattern(value: string) {
  return value.replace(/[!%_]/g, (character) => `!${character}`);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim().slice(0, 80) ?? "";
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.get("page") ?? "1", 10) || 1));
  const pageSize = 24;
  if (!query) return Response.json({ results: [], applications: [], total: 0, page, pageSize });

  const database = await getDatabase();
  const term = query.toLowerCase();
  const escapedTerm = escapeLikePattern(term);
  const pattern = `%${escapedTerm}%`;
  const prefix = `${escapedTerm}%`;
  const conditions = and(
    eq(apps.status, "published"),
    isNull(apps.deletedAt),
    sql`(
      lower(${apps.name}) like ${pattern} escape '!'
      or lower(${apps.tagline}) like ${pattern} escape '!'
      or lower(${apps.description}) like ${pattern} escape '!'
      or exists (
        select 1 from ${appCategories}
        inner join ${categories} on ${categories.id} = ${appCategories.categoryId}
        where ${appCategories.appId} = ${apps.id} and lower(${categories.name}) like ${pattern} escape '!'
      )
    )`,
  );
  const [applicationRows, countRows] = await Promise.all([database
    .select(cardFields)
    .from(apps)
    .where(conditions)
    .orderBy(
      sql`case when lower(${apps.name}) = ${term} then 0 when lower(${apps.name}) like ${prefix} escape '!' then 1 else 2 end`,
      asc(apps.name),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize),
    database.select({ total: count() }).from(apps).where(conditions),
  ]);

  const { icons, previews } = await getCardMedia(applicationRows.map(({ id }) => id));
  const applications = applicationRows.map((application) => ({
    ...application,
    icon: icons.get(application.id) ?? null,
    preview: previews.get(application.id) ?? null,
  }));
  const results = applicationRows.map((application) => {
    const icon = icons.get(application.id);
    return {
      ...application,
      iconStorageKey: icon?.storageKey ?? null,
      iconAltText: icon?.altText ?? null,
    };
  });

  return Response.json(
    { results, applications, total: Number(countRows[0]?.total ?? 0), page, pageSize },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
  );
}
