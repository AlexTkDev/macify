import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { importRows } from "@/db/schema";
import { normalizeCategories } from "@/lib/application-schema";
import { putPreparedMedia } from "@/lib/media-upload";
import { prepareImportedMedia } from "@/app/dashboard/manage/import-media";
import type { NormalizedImport } from "@/app/dashboard/manage/import-schema";
import { insertImportedApplication } from "@/app/dashboard/manage/import-row-persistence";

type Database = Awaited<ReturnType<typeof getDatabase>>;
type ImportRow = typeof importRows.$inferSelect;

export type ImportCommitContext = {
  database: Database;
  bucket: R2Bucket;
  images: ImagesBinding | undefined;
  importJobId: string;
  slugs: Set<string>;
  websites: Set<string>;
  appIdsBySlug: Map<string, string>;
  pendingRelationships: Array<{ appId: string; slugs: string[] }>;
};

export async function commitImportRow(row: ImportRow, context: ImportCommitContext) {
  const data = row.normalizedData as NormalizedImport;
  if (context.slugs.has(data.slug) || context.websites.has(data.websiteUrl)) {
    await context.database
      .update(importRows)
      .set({
        status: "duplicate",
        errors: ["An application with this slug or website already exists."],
      })
      .where(eq(importRows.id, row.id));
    return "duplicate" as const;
  }

  const appId = crypto.randomUUID();
  const now = new Date();
  const prepared = await prepareImportedMedia(appId, data, context.images);
  if (!prepared.ok) {
    await context.database
      .update(importRows)
      .set({ status: "failed", errors: [prepared.error] })
      .where(eq(importRows.id, row.id));
    return "failed" as const;
  }

  const uploadedKeys: string[] = [];
  try {
    for (const asset of prepared.media) {
      await putPreparedMedia(context.bucket, asset);
      uploadedKeys.push(asset.storageKey);
    }
    await insertImportedApplication(
      context.database,
      appId,
      data,
      normalizeCategories(data.categories),
      prepared.media,
      row.id,
      now,
    );
    context.slugs.add(data.slug);
    context.websites.add(data.websiteUrl);
    context.appIdsBySlug.set(data.slug, appId);
    context.pendingRelationships.push({
      appId,
      slugs: data.relatedAppSlugs
        .split(/[|;,\n\r]+/)
        .map((slug) => slug.trim())
        .filter(Boolean),
    });
    return "imported" as const;
  } catch (error) {
    await Promise.all(uploadedKeys.map((key) => context.bucket.delete(key)));
    const message = error instanceof Error ? error.message : "Unknown import error";
    console.error(JSON.stringify({
      event: "application.import.failed",
      importJobId: context.importJobId,
      rowId: row.id,
      message,
    }));
    await context.database
      .update(importRows)
      .set({ status: "failed", errors: ["The row or its media could not be committed."] })
      .where(eq(importRows.id, row.id));
    return "failed" as const;
  }
}
