"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importJobs, importRows } from "@/db/schema";
import { parseCsv } from "@/app/dashboard/manage/csv";
import { validateImportRows } from "@/app/dashboard/manage/import-validation";
import { messageUrl } from "@/app/dashboard/manage/shared";
import { requireAdmin } from "@/lib/admin-auth";

export async function uploadImportFile(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(messageUrl("/dashboard/imports", "error", "Choose a CSV or JSON file."));
  }
  if (file.size > 5 * 1024 * 1024) {
    redirect(messageUrl("/dashboard/imports", "error", "Import files must be 5 MB or smaller."));
  }
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension !== "csv" && extension !== "json") {
    redirect(messageUrl("/dashboard/imports", "error", "Only CSV and JSON files are supported."));
  }

  let sourceRows: unknown[];
  const text = await file.text();
  try {
    const parsed = extension === "json" ? JSON.parse(text) : parseCsv(text);
    if (!Array.isArray(parsed)) throw new Error("Expected an array");
    sourceRows = parsed;
  } catch {
    redirect(messageUrl("/dashboard/imports", "error", "The file could not be parsed."));
  }
  if (sourceRows.length === 0 || sourceRows.length > 250) {
    redirect(messageUrl("/dashboard/imports", "error", "Use a file containing between 1 and 250 rows."));
  }

  const { database, jobId, now, rows, validRows } = await validateImportRows(sourceRows);
  const storageKey = `imports/${jobId}/${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100)}`;
  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.put(storageKey, new TextEncoder().encode(text), {
    httpMetadata: { contentType: extension === "json" ? "application/json" : "text/csv" },
    customMetadata: { importJobId: jobId },
  });
  try {
    await database.batch([
      database.insert(importJobs).values({
        id: jobId,
        fileName: file.name,
        storageKey,
        format: extension,
        status: "validated",
        totalRows: rows.length,
        validRows,
        invalidRows: rows.length - validRows,
        duplicateRows: 0,
        createdAt: now,
      }),
      ...rows.map((row) => database.insert(importRows).values(row)),
    ]);
  } catch (error) {
    await env.MEDIA.delete(storageKey);
    throw error;
  }
  revalidatePath("/dashboard/imports");
  redirect(`/dashboard/imports/${jobId}`);
}
