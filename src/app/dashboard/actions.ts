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
type MediaRole = z.infer<typeof mediaRoleSchema>;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const allowedTypes: Record<MediaRole, ReadonlySet<string>> = {
  icon: new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]),
  preview_image: new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]),
  screenshot: new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]),
};

function normalizedApplicationValues(data: ApplicationFields) {
  return {
    name: data.name,
    slug: data.slug,
    websiteUrl: data.websiteUrl,
    tagline: data.tagline,
    summary: data.summary,
    description: data.description,
    pricingType: data.pricingType,
    pricingDetails: data.pricingDetails || null,
    sourceType: data.sourceType,
    sourceUrl: data.sourceUrl || null,
    youtubeUrl: data.youtubeUrl || null,
    minimumMacos: data.minimumMacos || null,
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

function safeFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return normalized || "asset";
}

function bytesStartWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function matchesFileSignature(bytes: Uint8Array, mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg":
      return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/webp":
      return bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        bytesStartWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif":
      return bytesStartWith(bytes, [0x66, 0x74, 0x79, 0x70], 4) &&
        ["avif", "avis"].includes(new TextDecoder().decode(bytes.slice(8, 12)));
    default:
      return false;
  }
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

type PreparedMedia = {
  id: string;
  role: MediaRole;
  bytes: Uint8Array;
  digest: ArrayBuffer;
  checksum: string;
  storageKey: string;
  mimeType: string;
  fileName: string;
  byteSize: number;
  sourceUrl: string | null;
  altText: string | null;
};

function blockedRemoteHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.includes(":")) return true;
  const octets = normalized.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

function parseRemoteImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || blockedRemoteHostname(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function readResponseWithLimit(response: Response) {
  if (!response.body) throw new Error("The remote server returned an empty response.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_UPLOAD_BYTES) {
      await reader.cancel();
      throw new Error("The remote image is larger than the 10 MB limit.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

async function fetchRemoteImage(value: string, role: MediaRole) {
  let url = parseRemoteImageUrl(value);
  if (!url) return { ok: false, error: "Use a public HTTPS image URL." } as const;
  const sourceUrl = url.toString();
  try {
    for (let redirects = 0; redirects <= 3; redirects += 1) {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(12_000), headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" } });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirects === 3) return { ok: false, error: "The image URL redirects too many times." } as const;
        url = parseRemoteImageUrl(new URL(location, url).toString());
        if (!url) return { ok: false, error: "The image URL redirects to a blocked location." } as const;
        continue;
      }
      if (!response.ok) return { ok: false, error: `The image server returned HTTP ${response.status}.` } as const;
      const mimeType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
      if (!allowedTypes[role].has(mimeType)) return { ok: false, error: "The URL does not return a supported PNG, JPEG, WebP, or AVIF image." } as const;
      const declaredSize = Number(response.headers.get("content-length") ?? 0);
      if (declaredSize > MAX_UPLOAD_BYTES) return { ok: false, error: "The remote image is larger than the 10 MB limit." } as const;
      const bytes = await readResponseWithLimit(response);
      if (!matchesFileSignature(bytes, mimeType)) return { ok: false, error: "The downloaded content does not match its image type." } as const;
      const pathName = decodeURIComponent(url.pathname.split("/").pop() || "remote-image");
      return { ok: true, bytes, mimeType, fileName: pathName, sourceUrl } as const;
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The remote image could not be downloaded." } as const;
  }
  return { ok: false, error: "The remote image could not be downloaded." } as const;
}

async function prepareMediaSource(appId: string, role: MediaRole, file: File | null, remoteUrl: string, altText: string) {
  if (file && remoteUrl) return { ok: false, error: "Choose a local file or enter an image URL, not both." } as const;
  let source: { bytes: Uint8Array; mimeType: string; fileName: string; sourceUrl: string | null };
  if (remoteUrl) {
    const remote = await fetchRemoteImage(remoteUrl, role);
    if (!remote.ok) return remote;
    source = { bytes: remote.bytes, mimeType: remote.mimeType, fileName: remote.fileName, sourceUrl: remote.sourceUrl };
  } else if (file) {
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `${file.name} is larger than the 10 MB per-file limit.` } as const;
    if (!allowedTypes[role].has(file.type)) return { ok: false, error: `${file.name} is not a supported image type.` } as const;
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesFileSignature(bytes, file.type)) return { ok: false, error: `${file.name} does not match its declared image type.` } as const;
    source = { bytes, mimeType: file.type, fileName: file.name, sourceUrl: null };
  } else {
    return { ok: false, error: "Choose a file or enter an image URL." } as const;
  }
  const digestInput = source.bytes.buffer.slice(source.bytes.byteOffset, source.bytes.byteOffset + source.bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", digestInput);
  const checksum = bytesToHex(new Uint8Array(digest));
  const id = crypto.randomUUID();
  return { ok: true, media: {
    id, role, bytes: source.bytes, digest, checksum,
    storageKey: ["apps", appId, role, `${checksum.slice(0, 16)}-${id}-${safeFileName(source.fileName)}`].join("/"),
    mimeType: source.mimeType, fileName: source.fileName, byteSize: source.bytes.byteLength,
    sourceUrl: source.sourceUrl, altText: altText.trim().slice(0, 300) || null,
  } satisfies PreparedMedia } as const;
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
      await env.MEDIA.put(asset.storageKey, asset.bytes, {
        httpMetadata: {
          contentType: asset.mimeType,
          contentDisposition: "inline",
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: { appId, role: asset.role },
        sha256: asset.digest,
      });
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
    await env.MEDIA.put(asset.storageKey, asset.bytes, {
      httpMetadata: {
        contentType: asset.mimeType,
        contentDisposition: "inline",
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        appId: appIdResult.data,
        role: roleResult.data,
      },
      sha256: asset.digest,
    });

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
