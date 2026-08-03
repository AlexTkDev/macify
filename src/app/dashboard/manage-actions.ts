"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  appTags,
  apps,
  categories,
  importJobs,
  importRows,
  mediaAssets,
  redirects as redirectsTable,
  tags,
} from "@/db/schema";
import { normalizeTags } from "@/lib/application-schema";

const slugSchema = z.string().trim().min(2).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const taxonomySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
});

function messageUrl(path: string, type: "success" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

export async function createCategory(formData: FormData) {
  const result = taxonomySchema.extend({
    description: z.string().trim().max(320),
    sortOrder: z.coerce.number().int().min(0).max(9999),
  }).safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/categories", "error", "Enter a valid name, slug, description, and order."));
  try {
    const database = await getDatabase();
    await database.insert(categories).values({
      id: crypto.randomUUID(),
      ...result.data,
      description: result.data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch {
    redirect(messageUrl("/dashboard/categories", "error", "That category slug is already in use."));
  }
  revalidatePath("/dashboard/categories");
  revalidatePath("/");
  redirect(messageUrl("/dashboard/categories", "success", "Category created."));
}

export async function updateCategory(formData: FormData) {
  const result = taxonomySchema.extend({
    id: z.uuid(),
    description: z.string().trim().max(320),
    sortOrder: z.coerce.number().int().min(0).max(9999),
  }).safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/categories", "error", "The category values are invalid."));
  try {
    const database = await getDatabase();
    const current = await database.select({ slug: categories.slug }).from(categories).where(eq(categories.id, result.data.id)).limit(1);
    if (!current[0]) redirect(messageUrl("/dashboard/categories", "error", "Category not found."));
    const categoryUpdate = database.update(categories).set({
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description || null,
        sortOrder: result.data.sortOrder,
        updatedAt: new Date(),
      }).where(eq(categories.id, result.data.id));
    if (current[0].slug !== result.data.slug) {
      await database.batch([categoryUpdate, database.insert(redirectsTable).values({
        id: crypto.randomUUID(),
        sourcePath: `/categories/${current[0].slug}`,
        destinationPath: `/categories/${result.data.slug}`,
        statusCode: 308,
        createdAt: new Date(),
      }).onConflictDoUpdate({ target: redirectsTable.sourcePath, set: { destinationPath: `/categories/${result.data.slug}`, statusCode: 308 } })]);
    } else {
      await categoryUpdate;
    }
  } catch {
    redirect(messageUrl("/dashboard/categories", "error", "That category slug is already in use."));
  }
  revalidatePath("/dashboard/categories");
  revalidatePath("/");
  redirect(messageUrl("/dashboard/categories", "success", "Category updated."));
}

export async function deleteCategory(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/categories", "error", "Invalid category."));
  const database = await getDatabase();
  const usage = await database.select({ appId: appCategories.appId }).from(appCategories).where(eq(appCategories.categoryId, id.data)).limit(1);
  if (usage[0]) redirect(messageUrl("/dashboard/categories", "error", "Move its applications before deleting this category."));
  await database.delete(categories).where(eq(categories.id, id.data));
  revalidatePath("/dashboard/categories");
  redirect(messageUrl("/dashboard/categories", "success", "Unused category deleted."));
}

export async function createTag(formData: FormData) {
  const result = taxonomySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/tags", "error", "Enter a valid tag name and slug."));
  try {
    const database = await getDatabase();
    await database.insert(tags).values({ id: crypto.randomUUID(), ...result.data, createdAt: new Date() });
  } catch {
    redirect(messageUrl("/dashboard/tags", "error", "That tag slug is already in use."));
  }
  revalidatePath("/dashboard/tags");
  redirect(messageUrl("/dashboard/tags", "success", "Tag created."));
}

export async function updateTag(formData: FormData) {
  const result = taxonomySchema.extend({ id: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/tags", "error", "The tag values are invalid."));
  try {
    const database = await getDatabase();
    await database.update(tags).set({ name: result.data.name, slug: result.data.slug }).where(eq(tags.id, result.data.id));
  } catch {
    redirect(messageUrl("/dashboard/tags", "error", "That tag slug is already in use."));
  }
  revalidatePath("/dashboard/tags");
  redirect(messageUrl("/dashboard/tags", "success", "Tag updated."));
}

export async function deleteTag(formData: FormData) {
  const id = z.string().min(1).safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/tags", "error", "Invalid tag."));
  const database = await getDatabase();
  const usage = await database.select({ appId: appTags.appId }).from(appTags).where(eq(appTags.tagId, id.data)).limit(1);
  if (usage[0]) redirect(messageUrl("/dashboard/tags", "error", "Remove this tag from its applications before deleting it."));
  await database.delete(tags).where(eq(tags.id, id.data));
  revalidatePath("/dashboard/tags");
  redirect(messageUrl("/dashboard/tags", "success", "Unused tag deleted."));
}

export async function deleteMediaAsset(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/media", "error", "Invalid media item."));
  const database = await getDatabase();
  const rows = await database
    .select({ id: mediaAssets.id, storageKey: mediaAssets.storageKey, role: mediaAssets.role, appStatus: apps.status })
    .from(mediaAssets)
    .leftJoin(apps, eq(apps.id, mediaAssets.appId))
    .where(eq(mediaAssets.id, id.data))
    .limit(1);
  const asset = rows[0];
  if (!asset) redirect(messageUrl("/dashboard/media", "error", "Media item not found."));
  if (asset.appStatus === "published" && (asset.role === "icon" || asset.role === "preview_image")) {
    redirect(messageUrl("/dashboard/media", "error", "Return the application to draft before deleting required media."));
  }
  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.delete(asset.storageKey);
  await database.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard");
  redirect(messageUrl("/dashboard/media", "success", "Media deleted from R2 and D1."));
}

type SourceRow = Record<string, unknown>;

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value); rows.push(row); row = []; value = ""; }
    else if (char !== "\r") value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  return rows.filter((cells) => cells.some(Boolean)).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

const importSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  websiteUrl: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
  tagline: z.string().trim().min(10).max(140),
  summary: z.string().trim().min(20).max(320),
  description: z.string().trim().min(40).max(20_000),
  pricingType: z.enum(["free", "freemium", "paid_once", "subscription", "open_source", "enterprise"]),
  pricingDetails: z.string().trim().max(240).default(""),
  sourceType: z.enum(["open_source", "closed_source"]),
  sourceUrl: z.string().trim().default("").refine((value) => {
    if (!value) return true;
    const parsed = z.url().safeParse(value);
    return parsed.success && ["http:", "https:"].includes(new URL(parsed.data).protocol);
  }, "Use a complete http:// or https:// URL."),
  youtubeUrl: z.string().trim().default("").refine((value) => {
    if (!value) return true;
    const parsed = z.url().safeParse(value);
    return parsed.success && ["youtube.com", "www.youtube.com", "youtu.be"].includes(new URL(parsed.data).hostname);
  }, "Use a youtube.com or youtu.be URL."),
  minimumMacos: z.string().trim().max(40).default(""),
  category: z.string().trim().min(1),
  tags: z.string().trim().max(500).default(""),
});

function normalizeSourceRow(input: unknown) {
  const source: SourceRow = typeof input === "object" && input !== null && !Array.isArray(input) ? input as SourceRow : {};
  const value = (camel: string, snake: string) => String(source[camel] ?? source[snake] ?? "");
  return {
    name: value("name", "name"), slug: value("slug", "slug"), websiteUrl: value("websiteUrl", "website_url"),
    tagline: value("tagline", "tagline"), summary: value("summary", "summary"), description: value("description", "description"),
    pricingType: value("pricingType", "pricing_type"), pricingDetails: value("pricingDetails", "pricing_details"),
    sourceType: value("sourceType", "source_type"), sourceUrl: value("sourceUrl", "source_url"), youtubeUrl: value("youtubeUrl", "youtube_url"),
    minimumMacos: value("minimumMacos", "minimum_macos"), category: value("category", "category"), tags: value("tags", "tags"),
  };
}

export async function uploadImportFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect(messageUrl("/dashboard/imports", "error", "Choose a CSV or JSON file."));
  if (file.size > 5 * 1024 * 1024) redirect(messageUrl("/dashboard/imports", "error", "Import files must be 5 MB or smaller."));
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension !== "csv" && extension !== "json") redirect(messageUrl("/dashboard/imports", "error", "Only CSV and JSON files are supported."));

  let sourceRows: unknown[];
  const text = await file.text();
  try {
    const parsed = extension === "json" ? JSON.parse(text) : parseCsv(text);
    if (!Array.isArray(parsed)) throw new Error("Expected an array");
    sourceRows = parsed;
  } catch {
    redirect(messageUrl("/dashboard/imports", "error", "The file could not be parsed."));
  }
  if (sourceRows.length === 0 || sourceRows.length > 250) redirect(messageUrl("/dashboard/imports", "error", "Use a file containing between 1 and 250 rows."));

  const database = await getDatabase();
  const categoryRows = await database.select({ id: categories.id, slug: categories.slug, name: categories.name }).from(categories);
  const categoryMap = new Map(categoryRows.flatMap((category) => [[category.slug.toLowerCase(), category.id], [category.name.toLowerCase(), category.id]]));
  const jobId = crypto.randomUUID();
  const now = new Date();
  const normalizedRows = sourceRows.map((source, index) => {
    const parsed = importSchema.safeParse(normalizeSourceRow(source));
    const categoryId = parsed.success ? categoryMap.get(parsed.data.category.toLowerCase()) : undefined;
    const errors = parsed.success ? (categoryId ? [] : ["Category does not match an existing category name or slug."]) : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    const safeSource: SourceRow = typeof source === "object" && source !== null && !Array.isArray(source) ? source as SourceRow : { value: source };
    return { id: crypto.randomUUID(), importJobId: jobId, rowNumber: index + 1, status: errors.length ? "invalid" : "valid", sourceData: safeSource, normalizedData: parsed.success && categoryId ? { ...parsed.data, categoryId } : null, errors, createdAt: now };
  });
  const validRows = normalizedRows.filter((row) => row.status === "valid").length;
  const storageKey = `imports/${jobId}/${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100)}`;
  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.put(storageKey, new TextEncoder().encode(text), { httpMetadata: { contentType: extension === "json" ? "application/json" : "text/csv" }, customMetadata: { importJobId: jobId } });
  try {
    await database.batch([
      database.insert(importJobs).values({ id: jobId, fileName: file.name, storageKey, format: extension, status: "validated", totalRows: normalizedRows.length, validRows, invalidRows: normalizedRows.length - validRows, duplicateRows: 0, createdAt: now }),
      ...normalizedRows.map((row) => database.insert(importRows).values(row)),
    ]);
  } catch (error) {
    await env.MEDIA.delete(storageKey);
    throw error;
  }
  revalidatePath("/dashboard/imports");
  redirect(`/dashboard/imports/${jobId}`);
}

type NormalizedImport = z.infer<typeof importSchema> & { categoryId: string };

export async function commitImportJob(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/imports", "error", "Invalid import job."));
  const database = await getDatabase();
  const jobs = await database.select().from(importJobs).where(eq(importJobs.id, id.data)).limit(1);
  if (!jobs[0] || jobs[0].status !== "validated") redirect(messageUrl("/dashboard/imports", "error", "This import cannot be committed."));
  const rows = await database.select().from(importRows).where(and(eq(importRows.importJobId, id.data), eq(importRows.status, "valid")));
  const existing = await database.select({ slug: apps.slug, websiteUrl: apps.websiteUrl }).from(apps).where(isNull(apps.deletedAt));
  const slugs = new Set(existing.map((app) => app.slug));
  const websites = new Set(existing.map((app) => app.websiteUrl));
  let imported = 0;
  let duplicates = 0;
  for (const row of rows) {
    const data = row.normalizedData as NormalizedImport;
    if (slugs.has(data.slug) || websites.has(data.websiteUrl)) {
      duplicates += 1;
      await database.update(importRows).set({ status: "duplicate", errors: ["An application with this slug or website already exists."] }).where(eq(importRows.id, row.id));
      continue;
    }
    const appId = crypto.randomUUID();
    const now = new Date();
    const normalizedTags = normalizeTags(data.tags);
    try {
      await database.batch([
        database.insert(apps).values({ id: appId, name: data.name, slug: data.slug, websiteUrl: data.websiteUrl, tagline: data.tagline, summary: data.summary, description: data.description, pricingType: data.pricingType, pricingDetails: data.pricingDetails || null, sourceType: data.sourceType, sourceUrl: data.sourceUrl || null, youtubeUrl: data.youtubeUrl || null, minimumMacos: data.minimumMacos || null, status: "draft", createdAt: now, updatedAt: now }),
        database.insert(appCategories).values({ appId, categoryId: data.categoryId, isPrimary: true }),
        ...normalizedTags.flatMap((tag) => [
          database.insert(tags).values({ id: `tag-${tag.slug}`, ...tag, createdAt: now }).onConflictDoUpdate({ target: tags.slug, set: { name: tag.name } }),
          database.insert(appTags).values({ appId, tagId: sql`(select ${tags.id} from ${tags} where ${tags.slug} = ${tag.slug})` }),
        ]),
        database.update(importRows).set({ status: "imported", appId }).where(eq(importRows.id, row.id)),
      ]);
      slugs.add(data.slug); websites.add(data.websiteUrl); imported += 1;
    } catch {
      await database.update(importRows).set({ status: "failed", errors: ["The row could not be committed."] }).where(eq(importRows.id, row.id));
    }
  }
  await database.update(importJobs).set({ status: "completed", duplicateRows: duplicates, validRows: imported, completedAt: new Date() }).where(eq(importJobs.id, id.data));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/imports");
  redirect(`/dashboard/imports/${id.data}?success=${encodeURIComponent(`${imported} draft application${imported === 1 ? "" : "s"} imported.`)}`);
}
