"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps, importJobs, importRows } from "@/db/schema";
import { commitImportedRelationships } from "@/app/dashboard/manage/import-relationships";
import { commitImportRow, type ImportCommitContext } from "@/app/dashboard/manage/import-row";
import { messageUrl } from "@/app/dashboard/manage/shared";
import { requireAdmin } from "@/lib/admin-auth";

export async function commitImportJob(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/imports", "error", "Invalid import job."));
  const database = await getDatabase();
  const jobs = await database.select().from(importJobs).where(eq(importJobs.id, id.data)).limit(1);
  if (!jobs[0] || jobs[0].status !== "validated") {
    redirect(messageUrl("/dashboard/imports", "error", "This import cannot be committed."));
  }
  const rows = await database
    .select()
    .from(importRows)
    .where(and(eq(importRows.importJobId, id.data), eq(importRows.status, "valid")));
  const existing = await database
    .select({ id: apps.id, slug: apps.slug, websiteUrl: apps.websiteUrl })
    .from(apps)
    .where(isNull(apps.deletedAt));
  const { env } = await getCloudflareContext({ async: true });
  const context: ImportCommitContext = {
    database,
    bucket: env.MEDIA,
    images: env.IMAGES,
    importJobId: id.data,
    slugs: new Set(existing.map((app) => app.slug)),
    websites: new Set(existing.map((app) => app.websiteUrl)),
    appIdsBySlug: new Map(existing.map((app) => [app.slug, app.id])),
    pendingRelationships: [],
  };

  let imported = 0;
  let duplicates = 0;
  for (const row of rows) {
    const result = await commitImportRow(row, context);
    if (result === "imported") imported += 1;
    if (result === "duplicate") duplicates += 1;
  }
  await commitImportedRelationships(
    database,
    context.pendingRelationships,
    context.appIdsBySlug,
  );
  await database
    .update(importJobs)
    .set({
      status: "completed",
      duplicateRows: duplicates,
      validRows: imported,
      completedAt: new Date(),
    })
    .where(eq(importJobs.id, id.data));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/imports");
  const message = `${imported} draft application${imported === 1 ? "" : "s"} imported.`;
  redirect(`/dashboard/imports/${id.data}?success=${encodeURIComponent(message)}`);
}
