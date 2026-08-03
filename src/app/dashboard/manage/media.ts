"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps, mediaAssets } from "@/db/schema";
import { messageUrl } from "@/app/dashboard/manage/shared";

export async function deleteMediaAsset(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/media", "error", "Invalid media item."));
  const database = await getDatabase();
  const rows = await database
    .select({
      id: mediaAssets.id,
      storageKey: mediaAssets.storageKey,
      role: mediaAssets.role,
      appStatus: apps.status,
    })
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
