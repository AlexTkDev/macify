"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { asc, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDatabase } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { optimizeImage } from "@/lib/image-optimization";
import { bytesToHex } from "@/lib/media-validation";
import { messageUrl } from "@/app/dashboard/manage/shared";
import { requireAdmin } from "@/lib/admin-auth";

const batchSize = 12;

export async function optimizeExistingMedia() {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMAGES) {
    redirect(messageUrl("/dashboard/media", "error", "Cloudflare Images is not available in this environment."));
  }

  const database = await getDatabase();
  const assets = await database
    .select({
      id: mediaAssets.id,
      role: mediaAssets.role,
      storageKey: mediaAssets.storageKey,
      mimeType: mediaAssets.mimeType,
      byteSize: mediaAssets.byteSize,
    })
    .from(mediaAssets)
    .where(or(isNull(mediaAssets.width), isNull(mediaAssets.height)))
    .orderBy(asc(mediaAssets.createdAt))
    .limit(batchSize);

  let optimizedCount = 0;
  let bytesSaved = 0;
  for (const asset of assets) {
    const object = await env.MEDIA.get(asset.storageKey);
    if (!object) continue;
    const sourceBytes = new Uint8Array(await object.arrayBuffer());
    const result = await optimizeImage(env.IMAGES, asset.role, {
      bytes: sourceBytes,
      mimeType: asset.mimeType,
      fileName: asset.storageKey.split("/").pop() || "image",
    });
    if (result.width === null || result.height === null) continue;

    const digestInput = result.bytes.buffer.slice(
      result.bytes.byteOffset,
      result.bytes.byteOffset + result.bytes.byteLength,
    ) as ArrayBuffer;
    const digest = await crypto.subtle.digest("SHA-256", digestInput);
    const checksum = bytesToHex(new Uint8Array(digest));
    if (result.optimized) {
      await env.MEDIA.put(asset.storageKey, result.bytes, {
        httpMetadata: {
          contentType: result.mimeType,
          contentDisposition: "inline",
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: object.customMetadata,
        sha256: digest,
      });
      optimizedCount += 1;
      bytesSaved += Math.max(0, asset.byteSize - result.bytes.byteLength);
    }
    await database
      .update(mediaAssets)
      .set({
        mimeType: result.mimeType,
        byteSize: result.bytes.byteLength,
        width: result.width,
        height: result.height,
        checksum,
      })
      .where(eq(mediaAssets.id, asset.id));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/media");
  const saved = bytesSaved < 1024 * 1024
    ? `${Math.round(bytesSaved / 1024)} KB`
    : `${(bytesSaved / 1024 / 1024).toFixed(1)} MB`;
  const suffix = assets.length === batchSize ? " Run it again to process the next batch." : " All legacy media has been checked.";
  redirect(messageUrl(
    "/dashboard/media",
    "success",
    `Checked ${assets.length} files, optimized ${optimizedCount}, and saved ${saved}.${suffix}`,
  ));
}
