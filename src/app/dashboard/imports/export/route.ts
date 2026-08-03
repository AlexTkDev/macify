import { and, asc, eq, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { appCategories, appRelationships, appTags, apps, categories, mediaAssets, tags } from "@/db/schema";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request) {
  const database = await getDatabase();
  const [records, tagRows, mediaRows, relationshipRows] = await Promise.all([
    database
      .select({
        id: apps.id,
        name: apps.name,
        slug: apps.slug,
        websiteUrl: apps.websiteUrl,
        tagline: apps.tagline,
        description: apps.description,
        pricingType: apps.pricingType,
        billingType: apps.billingType,
        pricingDetails: apps.pricingDetails,
        sourceType: apps.sourceType,
        youtubeUrl: apps.youtubeUrl,
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
    database.select({ appId: mediaAssets.appId, role: mediaAssets.role, storageKey: mediaAssets.storageKey, sourceUrl: mediaAssets.sourceUrl, altText: mediaAssets.altText }).from(mediaAssets).orderBy(asc(mediaAssets.createdAt)),
    database.select({ sourceAppId: appRelationships.sourceAppId, targetAppId: appRelationships.targetAppId }).from(appRelationships).where(eq(appRelationships.relationshipType, "related")),
  ]);
  const tagsByApp = new Map<string, string[]>();
  for (const tag of tagRows) tagsByApp.set(tag.appId, [...(tagsByApp.get(tag.appId) ?? []), tag.name]);
  const mediaByApp = new Map<string, typeof mediaRows>();
  for (const media of mediaRows) if (media.appId) mediaByApp.set(media.appId, [...(mediaByApp.get(media.appId) ?? []), media]);
  const slugById = new Map(records.map((record) => [record.id, record.slug]));
  const relatedByApp = new Map<string, string[]>();
  for (const relationship of relationshipRows) {
    const sourceSlug = slugById.get(relationship.sourceAppId);
    const targetSlug = slugById.get(relationship.targetAppId);
    if (sourceSlug && targetSlug) {
      relatedByApp.set(relationship.sourceAppId, [...(relatedByApp.get(relationship.sourceAppId) ?? []), targetSlug]);
      relatedByApp.set(relationship.targetAppId, [...(relatedByApp.get(relationship.targetAppId) ?? []), sourceSlug]);
    }
  }
  const exportMediaUrl = (asset: (typeof mediaRows)[number], status: string) => asset.sourceUrl ?? (status === "published" ? `https://macify.app/media/${asset.storageKey.split("/").map(encodeURIComponent).join("/")}` : "");
  const output = records.map(({ id, ...record }) => {
    const media = mediaByApp.get(id) ?? [];
    const icon = media.find((asset) => asset.role === "icon");
    const preview = media.find((asset) => asset.role === "preview_image");
    return {
      ...record,
      tags: (tagsByApp.get(id) ?? []).join(", "),
      iconUrl: icon ? exportMediaUrl(icon, record.status) : "",
      iconAltText: icon?.altText ?? "",
      previewImageUrl: preview ? exportMediaUrl(preview, record.status) : "",
      previewImageAltText: preview?.altText ?? "",
      screenshotUrls: media.filter((asset) => asset.role === "screenshot").map((asset) => exportMediaUrl(asset, record.status)).filter(Boolean).join("|"),
      relatedAppSlugs: (relatedByApp.get(id) ?? []).join(","),
    };
  });
  const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "json";

  if (format === "json") {
    return new Response(JSON.stringify(output, null, 2), {
      headers: { "Content-Disposition": 'attachment; filename="macify-applications.json"', "Content-Type": "application/json; charset=utf-8" },
    });
  }
  const headers = ["name", "slug", "websiteUrl", "tagline", "description", "pricingType", "billingType", "pricingDetails", "sourceType", "youtubeUrl", "category", "tags", "iconUrl", "iconAltText", "previewImageUrl", "previewImageAltText", "screenshotUrls", "relatedAppSlugs", "status"] as const;
  const csv = [headers.join(","), ...output.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\r\n");
  return new Response(csv, {
    headers: { "Content-Disposition": 'attachment; filename="macify-applications.csv"', "Content-Type": "text/csv; charset=utf-8" },
  });
}
