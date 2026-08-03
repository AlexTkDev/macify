import { and, asc, eq, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, appTags, apps, categories, tags } from "@/db/schema";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request) {
  const database = await getDatabase();
  const [records, tagRows] = await Promise.all([
    database
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        websiteUrl: apps.websiteUrl,
        tagline: apps.tagline,
        summary: apps.summary,
        description: apps.description,
        pricingType: apps.pricingType,
        pricingDetails: apps.pricingDetails,
        sourceType: apps.sourceType,
        sourceUrl: apps.sourceUrl,
        youtubeUrl: apps.youtubeUrl,
        minimumMacos: apps.minimumMacos,
        category: categories.slug,
        status: apps.status,
      })
      .from(apps)
      .leftJoin(appCategories, and(eq(appCategories.appId, apps.id), eq(appCategories.isPrimary, true)))
      .leftJoin(categories, eq(categories.id, appCategories.categoryId))
      .where(isNull(apps.deletedAt))
      .orderBy(asc(apps.name)),
    database
      .select({ appId: appTags.appId, name: tags.name })
      .from(appTags)
      .innerJoin(tags, eq(tags.id, appTags.tagId))
      .orderBy(asc(tags.name)),
  ]);
  const tagsByApp = new Map<string, string[]>();
  for (const tag of tagRows) tagsByApp.set(tag.appId, [...(tagsByApp.get(tag.appId) ?? []), tag.name]);
  const output = records.map(({ id, ...record }) => ({ ...record, tags: (tagsByApp.get(id) ?? []).join(", ") }));
  const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "json";

  if (format === "json") {
    return new Response(JSON.stringify(output, null, 2), {
      headers: { "Content-Disposition": 'attachment; filename="macify-applications.json"', "Content-Type": "application/json; charset=utf-8" },
    });
  }
  const headers = ["name", "slug", "websiteUrl", "tagline", "summary", "description", "pricingType", "pricingDetails", "sourceType", "sourceUrl", "youtubeUrl", "minimumMacos", "category", "tags", "status"] as const;
  const csv = [headers.join(","), ...output.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\r\n");
  return new Response(csv, {
    headers: { "Content-Disposition": 'attachment; filename="macify-applications.csv"', "Content-Type": "text/csv; charset=utf-8" },
  });
}
