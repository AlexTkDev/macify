import { isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { apps } from "@/db/schema";
import {
  importSchema,
  normalizeSourceRow,
  type SourceRow,
} from "@/app/dashboard/manage/import-schema";

export async function validateImportRows(sourceRows: unknown[]) {
  const database = await getDatabase();
  const existingAppRows = await database.select({ slug: apps.slug }).from(apps).where(isNull(apps.deletedAt));
  const sourceSlugs = new Set(sourceRows
    .map((source) => normalizeSourceRow(source).slug)
    .filter(Boolean));
  const availableSlugs = new Set([
    ...existingAppRows.map((app) => app.slug),
    ...sourceSlugs,
  ]);
  const jobId = crypto.randomUUID();
  const now = new Date();
  const rows = sourceRows.map((source, index) => {
    const parsed = importSchema.safeParse(normalizeSourceRow(source));
    const errors = parsed.success ? [] : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    if (parsed.success) {
      const unknownRelated = parsed.data.relatedAppSlugs
        .split(/[|;,\n\r]+/)
        .map((slug) => slug.trim())
        .filter(Boolean)
        .filter((slug) => slug !== parsed.data.slug && !availableSlugs.has(slug));
      if (unknownRelated.length) {
        errors.push(`Unknown related application slug${unknownRelated.length === 1 ? "" : "s"}: ${unknownRelated.join(", ")}.`);
      }
    }
    const safeSource: SourceRow = typeof source === "object" && source !== null && !Array.isArray(source)
      ? source as SourceRow
      : { value: source };
    return {
      id: crypto.randomUUID(),
      importJobId: jobId,
      rowNumber: index + 1,
      status: errors.length ? "invalid" : "valid",
      sourceData: safeSource,
      normalizedData: parsed.success ? parsed.data : null,
      errors,
      createdAt: now,
    };
  });
  return {
    database,
    jobId,
    now,
    rows,
    validRows: rows.filter((row) => row.status === "valid").length,
  };
}
