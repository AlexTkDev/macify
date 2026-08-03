"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  appRelationships,
  appTags,
  apps,
  mediaAssets,
  tags,
} from "@/db/schema";
import {
  applicationFieldsFromFormData,
  applicationSchema,
  normalizeTags,
  type ApplicationFields,
} from "@/lib/application-schema";
import { prepareMediaSource, putPreparedMedia, type MediaRole, type PreparedMedia } from "@/lib/media-upload";

export type ApplicationFormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type MediaUploadState = {
  message?: string;
  success?: boolean;
};

export type PublicationState = {
  message?: string;
};

const mediaRoleSchema = z.enum(["icon", "preview_image", "screenshot"]);

function normalizedApplicationValues(data: ApplicationFields) {
  return {
    name: data.name,
    slug: data.slug,
    websiteUrl: data.websiteUrl,
    tagline: data.tagline,
    description: data.description,
    pricingType: data.pricingType,
    billingType: data.pricingType === "free" ? null : data.billingType || null,
    pricingDetails: data.pricingDetails || null,
    sourceType: data.sourceType,
    youtubeUrl: data.youtubeUrl || null,
  };
}

function taxonomyQueries(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  data: ApplicationFields,
) {
  const normalizedTags = normalizeTags(data.tagsText);

  return [
    database.delete(appCategories).where(eq(appCategories.appId, appId)),
    database.insert(appCategories).values({
      appId,
      categoryId: data.categoryId,
      isPrimary: true,
    }),
    database.delete(appTags).where(eq(appTags.appId, appId)),
    ...normalizedTags.flatMap(({ name, slug }) => [
      database
        .insert(tags)
        .values({ id: `tag-${slug}`, name, slug, createdAt: new Date() })
        .onConflictDoUpdate({ target: tags.slug, set: { name } }),
      database.insert(appTags).values({
        appId,
        tagId: sql`(select ${tags.id} from ${tags} where ${tags.slug} = ${slug})`,
      }),
    ]),
  ] as const;
}

function relationshipQueries(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  relatedAppIds: string[],
) {
  const uniqueIds = [...new Set(relatedAppIds)].filter((relatedId) => relatedId !== appId);
  return [
    database
      .delete(appRelationships)
      .where(
        or(
          eq(appRelationships.sourceAppId, appId),
          eq(appRelationships.targetAppId, appId),
        ),
      ),
    ...uniqueIds.map((relatedId) => {
      const [sourceAppId, targetAppId] = [appId, relatedId].sort();
      return database
        .insert(appRelationships)
        .values({
          id: crypto.randomUUID(),
          sourceAppId,
          targetAppId,
          relationshipType: "related",
          confidence: 1,
          origin: "manual",
          reviewedAt: new Date(),
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }),
  ] as const;
}

async function relatedApplicationsExist(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appId: string,
  relatedAppIds: string[],
) {
  const uniqueIds = [...new Set(relatedAppIds)].filter((relatedId) => relatedId !== appId);
  if (uniqueIds.length === 0) return true;
  const rows = await database
    .select({ id: apps.id })
    .from(apps)
    .where(and(inArray(apps.id, uniqueIds), isNull(apps.deletedAt)));
  return rows.length === uniqueIds.length;
}

function uniqueConstraintMessage(message: string) {
  return message.includes("UNIQUE constraint failed")
    ? "An application with this slug or website already exists."
    : null;
}

async function prepareCreateMedia(formData: FormData, appId: string) {
  const selections: Array<{ role: MediaRole; file: File | null; url: string; altText: string }> = [];
  const addSelection = (role: MediaRole, value: FormDataEntryValue | null, url: string, altText: string) => {
    const file = value instanceof File && value.size > 0 ? value : null;
    if (file || url.trim()) selections.push({ role, file, url: url.trim(), altText });
  };

  addSelection("icon", formData.get("iconFile"), String(formData.get("iconUrl") ?? ""), String(formData.get("iconAltText") ?? ""));
  addSelection("preview_image", formData.get("previewImageFile"), String(formData.get("previewImageUrl") ?? ""), String(formData.get("previewImageAltText") ?? ""));
  const screenshots = formData.getAll("screenshotFiles").filter((value): value is File => value instanceof File && value.size > 0);
  const screenshotUrls = String(formData.get("screenshotUrls") ?? "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
  if (screenshots.length + screenshotUrls.length > 8) return { ok: false, error: "Choose no more than 8 screenshots at a time." } as const;
  for (const screenshot of screenshots) addSelection("screenshot", screenshot, "", "");
  for (const url of screenshotUrls) addSelection("screenshot", null, url, "");

  const prepared: PreparedMedia[] = [];
  for (const selection of selections) {
    const result = await prepareMediaSource(appId, selection.role, selection.file, selection.url, selection.altText);
    if (!result.ok) return result;
    prepared.push(result.media);
  }
  const totalBytes = prepared.reduce((sum, media) => sum + media.byteSize, 0);
  if (totalBytes > 40 * 1024 * 1024) return { ok: false, error: "The combined media upload must be 40 MB or smaller." } as const;
  return { ok: true, media: prepared } as const;
}

export async function createApplication(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const result = applicationSchema.safeParse(applicationFieldsFromFormData(formData));

  if (!result.success) {
    return {
      message: "Review the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const now = new Date();
  const appId = crypto.randomUUID();
  const preparedResult = await prepareCreateMedia(formData, appId);
  if (!preparedResult.ok) {
    return { message: preparedResult.error, errors: { media: [preparedResult.error] } };
  }
  const preparedMedia = preparedResult.media;
  const uploadedKeys: string[] = [];

  try {
    const database = await getDatabase();
    if (!(await relatedApplicationsExist(database, appId, result.data.relatedAppIds))) {
      return {
        message: "One or more related applications are no longer available.",
        errors: { relatedAppIds: ["Refresh the page and choose related applications again."] },
      };
    }
    const { env } = await getCloudflareContext({ async: true });
    for (const asset of preparedMedia) {
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
      ...taxonomyQueries(database, appId, result.data),
      ...relationshipQueries(database, appId, result.data.relatedAppIds),
      ...preparedMedia.map((asset) => database.insert(mediaAssets).values({
        id: asset.id,
        appId,
        role: asset.role,
        storageKey: asset.storageKey,
        mimeType: asset.mimeType,
        byteSize: asset.byteSize,
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
        console.error(JSON.stringify({ event: "application.create.media_cleanup_failed", appId, message: cleanupError instanceof Error ? cleanupError.message : "Unknown cleanup error" }));
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

export async function updateApplication(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const idResult = z.uuid().safeParse(formData.get("appId"));
  const result = applicationSchema.safeParse(applicationFieldsFromFormData(formData));

  if (!idResult.success) return { message: "This application record is invalid." };
  if (!result.success) {
    return {
      message: "Review the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const database = await getDatabase();
    if (!(await relatedApplicationsExist(database, idResult.data, result.data.relatedAppIds))) {
      return {
        message: "One or more related applications are no longer available.",
        errors: { relatedAppIds: ["Refresh the page and choose related applications again."] },
      };
    }
    await database.batch([
      database
        .update(apps)
        .set({ ...normalizedApplicationValues(result.data), updatedAt: new Date() })
        .where(and(eq(apps.id, idResult.data), isNull(apps.deletedAt))),
      ...taxonomyQueries(database, idResult.data, result.data),
      ...relationshipQueries(database, idResult.data, result.data.relatedAppIds),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const constraintMessage = uniqueConstraintMessage(message);
    if (constraintMessage) return { message: constraintMessage };

    console.error(
      JSON.stringify({ event: "application.update.failed", appId: idResult.data, message }),
    );
    return { message: "The changes could not be saved. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/apps/${result.data.slug}`);
  revalidatePath(`/dashboard/apps/${idResult.data}/edit`);
  redirect(`/dashboard/apps/${idResult.data}/edit?saved=1`);
}

export async function setApplicationPublicationState(
  _previousState: PublicationState,
  formData: FormData,
): Promise<PublicationState> {
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
      .where(and(eq(appCategories.appId, appIdResult.data), eq(appCategories.isPrimary, true)))
      .limit(1),
    database
      .select({ role: mediaAssets.role })
      .from(mediaAssets)
      .where(eq(mediaAssets.appId, appIdResult.data)),
  ]);

  const application = applicationRows[0];
  if (!application) return { message: "The application no longer exists." };

  if (intentResult.data === "publish") {
    const roles = new Set(mediaRows.map(({ role }) => role));
    const missing: string[] = [];
    if (!categoryRows[0]) missing.push("a primary category");
    if (!roles.has("icon")) missing.push("an application icon");
    if (!roles.has("preview_image")) missing.push("a main preview image");

    if (missing.length > 0) {
      return { message: `Add ${missing.join(", ")} before publishing.` };
    }
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
  redirect(
    `/dashboard/apps/${appIdResult.data}/edit?${publishing ? "published" : "draft"}=1`,
  );
}

export async function uploadApplicationMedia(
  _previousState: MediaUploadState,
  formData: FormData,
): Promise<MediaUploadState> {
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
  const prepared = await prepareMediaSource(appIdResult.data, roleResult.data, file, remoteUrl, altText);
  if (!prepared.ok) return { message: prepared.error };
  const asset = prepared.media;

  const { env } = await getCloudflareContext({ async: true });

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
    console.error(
      JSON.stringify({
        event: "application.media.upload.failed",
        appId: appIdResult.data,
        role: roleResult.data,
        message,
      }),
    );
    return { message: "The file could not be stored. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/apps/${appIdResult.data}/edit`);
  return { success: true, message: "Stored in local R2." };
}
