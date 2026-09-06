"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDatabase } from "@/db/client";
import { apps, mediaAssets } from "@/db/schema";
import { applicationFieldsFromFormData, applicationSchema } from "@/lib/application-schema";
import { putPreparedMedia } from "@/lib/media-upload";
import { prepareCreateMedia } from "@/app/dashboard/actions/create-media";
import {
  normalizedApplicationValues,
  relatedApplicationsExist,
  relationshipQueries,
  categoryQueries,
  uniqueConstraintMessage,
} from "@/app/dashboard/actions/application-persistence";
import type { ApplicationFormState } from "@/app/dashboard/actions/action-types";
import { requireAdmin } from "@/lib/admin-auth";

export async function createApplication(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  await requireAdmin();
  const result = applicationSchema.safeParse(applicationFieldsFromFormData(formData));
  if (!result.success) {
    return {
      message: "Review the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const now = new Date();
  const appId = crypto.randomUUID();
  const { env } = await getCloudflareContext({ async: true });
  const preparedResult = await prepareCreateMedia(formData, appId, env.IMAGES);
  if (!preparedResult.ok) {
    return { message: preparedResult.error, errors: { media: [preparedResult.error] } };
  }
  const uploadedKeys: string[] = [];

  try {
    const database = await getDatabase();
    if (!(await relatedApplicationsExist(database, appId, result.data.relatedAppIds))) {
      return {
        message: "One or more related applications are no longer available.",
        errors: { relatedAppIds: ["Refresh the page and choose related applications again."] },
      };
    }
    for (const asset of preparedResult.media) {
      await putPreparedMedia(env.MEDIA, asset);
      uploadedKeys.push(asset.storageKey);
    }
    await database.batch([
      database.insert(apps).values({
        id: appId,
        ...normalizedApplicationValues(result.data),
        status: "draft",
        createdAt: now,
        updatedAt: now,
      }),
      ...categoryQueries(database, appId, result.data),
      ...relationshipQueries(database, appId, result.data.relatedAppIds),
      ...preparedResult.media.map((asset) => database.insert(mediaAssets).values({
        id: asset.id,
        appId,
        role: asset.role,
        storageKey: asset.storageKey,
        mimeType: asset.mimeType,
        byteSize: asset.byteSize,
        width: asset.width,
        height: asset.height,
        checksum: asset.checksum,
        sourceUrl: asset.sourceUrl,
        altText: asset.altText,
        createdAt: now,
      })),
    ]);
  } catch (error) {
    if (uploadedKeys.length > 0) {
      try {
        const { env } = await getCloudflareContext({ async: true });
        await Promise.all(uploadedKeys.map((key) => env.MEDIA.delete(key)));
      } catch (cleanupError) {
        console.error(JSON.stringify({
          event: "application.create.media_cleanup_failed",
          appId,
          message: cleanupError instanceof Error ? cleanupError.message : "Unknown cleanup error",
        }));
      }
    }
    const message = error instanceof Error ? error.message : "";
    const constraintMessage = uniqueConstraintMessage(message);
    if (constraintMessage) return { message: constraintMessage };
    console.error(JSON.stringify({ event: "application.create.failed", message }));
    return { message: "The application could not be saved. Try again." };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/apps/${appId}/edit?created=1`);
}
