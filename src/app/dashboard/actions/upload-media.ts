"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps, mediaAssets } from "@/db/schema";
import { prepareMediaSource, putPreparedMedia } from "@/lib/media-upload";
import type { MediaUploadState } from "@/app/dashboard/actions/action-types";
import { requireAdmin } from "@/lib/admin-auth";

const mediaRoleSchema = z.enum(["icon", "preview_image", "screenshot"]);

export async function uploadApplicationMedia(
  _previousState: MediaUploadState,
  formData: FormData,
): Promise<MediaUploadState> {
  await requireAdmin();
  const appIdResult = z.uuid().safeParse(formData.get("appId"));
  const roleResult = mediaRoleSchema.safeParse(formData.get("role"));
  const altText = String(formData.get("altText") ?? "").trim().slice(0, 300);
  const fileValue = formData.get("file");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const remoteUrl = String(formData.get("mediaUrl") ?? "").trim();
  if (!appIdResult.success || !roleResult.success) {
    return { message: "The upload destination is invalid." };
  }

  const database = await getDatabase();
  const application = await database
    .select({ id: apps.id })
    .from(apps)
    .where(and(eq(apps.id, appIdResult.data), isNull(apps.deletedAt)))
    .limit(1);
  if (!application[0]) return { message: "The application no longer exists." };
  const { env } = await getCloudflareContext({ async: true });
  const prepared = await prepareMediaSource(
    appIdResult.data,
    roleResult.data,
    file,
    remoteUrl,
    altText,
    env.IMAGES,
  );
  if (!prepared.ok) return { message: prepared.error };
  const asset = prepared.media;
  try {
    await putPreparedMedia(env.MEDIA, asset);
    try {
      await database.insert(mediaAssets).values({
        id: asset.id,
        appId: appIdResult.data,
        role: roleResult.data,
        storageKey: asset.storageKey,
        mimeType: asset.mimeType,
        byteSize: asset.byteSize,
        width: asset.width,
        height: asset.height,
        checksum: asset.checksum,
        sourceUrl: asset.sourceUrl,
        altText: asset.altText,
        createdAt: new Date(),
      });
    } catch (error) {
      await env.MEDIA.delete(asset.storageKey);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error(JSON.stringify({
      event: "application.media.upload.failed",
      appId: appIdResult.data,
      role: roleResult.data,
      message,
    }));
    return { message: "The file could not be stored. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/apps/${appIdResult.data}/edit`);
  return { success: true, message: "Stored in local R2." };
}
