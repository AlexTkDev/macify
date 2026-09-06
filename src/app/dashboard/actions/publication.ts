"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { appCategories, apps, mediaAssets } from "@/db/schema";
import type { PublicationState } from "@/app/dashboard/actions/action-types";
import { requireAdmin } from "@/lib/admin-auth";

export async function setApplicationPublicationState(
  _previousState: PublicationState,
  formData: FormData,
): Promise<PublicationState> {
  await requireAdmin();
  const appIdResult = z.uuid().safeParse(formData.get("appId"));
  const intentResult = z.enum(["publish", "draft"]).safeParse(formData.get("intent"));
  if (!appIdResult.success || !intentResult.success) {
    return { message: "The publication request is invalid." };
  }

  const database = await getDatabase();
  const [applicationRows, categoryRows, mediaRows] = await Promise.all([
    database
      .select({ id: apps.id, slug: apps.slug, status: apps.status })
      .from(apps)
      .where(and(eq(apps.id, appIdResult.data), isNull(apps.deletedAt)))
      .limit(1),
    database
      .select({ categoryId: appCategories.categoryId })
      .from(appCategories)
      .where(eq(appCategories.appId, appIdResult.data))
      .limit(1),
    database.select({ role: mediaAssets.role }).from(mediaAssets).where(eq(mediaAssets.appId, appIdResult.data)),
  ]);

  const application = applicationRows[0];
  if (!application) return { message: "The application no longer exists." };
  if (intentResult.data === "publish") {
    const roles = new Set(mediaRows.map(({ role }) => role));
    const missing: string[] = [];
    if (!categoryRows[0]) missing.push("at least one category");
    if (!roles.has("icon")) missing.push("an application icon");
    if (!roles.has("preview_image")) missing.push("a main preview image");
    if (missing.length > 0) return { message: `Add ${missing.join(", ")} before publishing.` };
  }

  const publishing = intentResult.data === "publish";
  await database
    .update(apps)
    .set({
      status: publishing ? "published" : "draft",
      publishedAt: publishing ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(apps.id, appIdResult.data));

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/apps/${appIdResult.data}/edit`);
  revalidatePath(`/apps/${application.slug}`);
  redirect(`/dashboard/apps/${appIdResult.data}/edit?${publishing ? "published" : "draft"}=1`);
}
