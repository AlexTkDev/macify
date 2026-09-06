import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { apps, catalogueRevisions, mediaAssets } from "@/db/schema";
import type { CataloguePreparedMedia } from "@/db/schema-catalogue";
import {
  catalogueManifestSchema,
  manifestMediaSources,
  type CatalogueManifest,
} from "@/lib/catalogue-manifest";
import { prepareMediaSource, putPreparedMedia } from "@/lib/media-upload";

export type CatalogueSyncItem = {
  changeType: "upsert" | "delete";
  path: string;
  manifest?: unknown;
};

export async function ingestCatalogueItem(
  item: CatalogueSyncItem,
  source: { repository: string; commitSha: string },
  env: CloudflareEnv,
) {
  if (!/^catalog\/apps\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(item.path)) {
    return { ok: false, status: 400, error: "The catalogue path is invalid." } as const;
  }
  const pathSlug = item.path.slice("catalog/apps/".length, -".json".length);
  const database = await getDatabase();
  const duplicate = await database
    .select({ id: catalogueRevisions.id, status: catalogueRevisions.status })
    .from(catalogueRevisions)
    .where(and(
      eq(catalogueRevisions.sourceCommitSha, source.commitSha),
      eq(catalogueRevisions.sourcePath, item.path),
    ))
    .limit(1);
  if (duplicate[0] && duplicate[0].status !== "failed") {
    return { ok: true, duplicate: true, revisionId: duplicate[0].id } as const;
  }
  const retryRevisionId = duplicate[0]?.id;

  let current = await database
    .select({ id: apps.id })
    .from(apps)
    .where(and(eq(apps.slug, pathSlug), isNull(apps.deletedAt)))
    .limit(1);

  if (item.changeType === "delete") {
    if (!current[0]) return { ok: true, ignored: true, reason: "Application does not exist." } as const;
    const id = crypto.randomUUID();
    await database.insert(catalogueRevisions).values({
      id,
      appId: current[0].id,
      appSlug: pathSlug,
      changeType: "archive",
      sourceRepository: source.repository,
      sourcePath: item.path,
      sourceCommitSha: source.commitSha,
      manifestHash: await sha256Hex("deleted"),
      manifest: null,
      preparedMedia: [],
      errors: [],
      createdAt: new Date(),
    });
    return { ok: true, revisionId: id } as const;
  }

  const parsed = catalogueManifestSchema.safeParse(item.manifest);
  if (!parsed.success || parsed.data.slug !== pathSlug) {
    const details = parsed.success
      ? ["Manifest slug must match its filename."]
      : parsed.error.issues.map((issue) => `${issue.path.join(".") || "manifest"}: ${issue.message}`);
    return { ok: false, status: 422, error: "Manifest validation failed.", details } as const;
  }

  if (!current[0]) {
    current = await database.select({ id: apps.id }).from(apps)
      .where(and(eq(apps.websiteUrl, parsed.data.websiteUrl), isNull(apps.deletedAt))).limit(1);
  }

  const canonicalManifest = JSON.stringify(parsed.data);
  const manifestHash = await sha256Hex(canonicalManifest);
  const unchanged = await database
    .select({ id: catalogueRevisions.id })
    .from(catalogueRevisions)
    .where(and(
      eq(catalogueRevisions.appSlug, pathSlug),
      eq(catalogueRevisions.manifestHash, manifestHash),
      inArray(catalogueRevisions.status, ["pending", "published"]),
    ))
    .orderBy(desc(catalogueRevisions.createdAt))
    .limit(1);
  if (unchanged[0]) return { ok: true, ignored: true, reason: "Manifest content is unchanged." } as const;

  const revisionId = retryRevisionId ?? crypto.randomUUID();
  const prepared = await prepareRevisionMedia(parsed.data, current[0]?.id, revisionId, env);
  if (!prepared.ok) {
    const failedValues = {
      appId: current[0]?.id ?? null,
      appSlug: pathSlug,
      changeType: current[0] ? "update" as const : "create" as const,
      status: "failed" as const,
      sourceRepository: source.repository,
      sourcePath: item.path,
      sourceCommitSha: source.commitSha,
      manifestHash,
      manifest: parsed.data,
      preparedMedia: [],
      errors: [prepared.error],
    };
    if (retryRevisionId) await database.update(catalogueRevisions).set(failedValues).where(eq(catalogueRevisions.id, retryRevisionId));
    else await database.insert(catalogueRevisions).values({
      id: revisionId,
      ...failedValues,
      createdAt: new Date(),
    });
    return { ok: false, status: 422, error: prepared.error, revisionId } as const;
  }

  const readyValues = {
    appId: current[0]?.id ?? null,
    appSlug: pathSlug,
    changeType: current[0] ? "update" as const : "create" as const,
    sourceRepository: source.repository,
    sourcePath: item.path,
    sourceCommitSha: source.commitSha,
    manifestHash,
    manifest: parsed.data,
    preparedMedia: prepared.media,
    errors: [],
    status: "pending" as const,
  };
  if (retryRevisionId) await database.update(catalogueRevisions).set(readyValues).where(eq(catalogueRevisions.id, retryRevisionId));
  else await database.insert(catalogueRevisions).values({ id: revisionId, ...readyValues, createdAt: new Date() });
  return { ok: true, revisionId } as const;
}

async function prepareRevisionMedia(
  manifest: CatalogueManifest,
  appId: string | undefined,
  revisionId: string,
  env: CloudflareEnv,
) {
  const database = await getDatabase();
  const existing = appId
    ? await database.select().from(mediaAssets).where(eq(mediaAssets.appId, appId))
    : [];
  const reusable = new Map(existing.map((asset) => [`${asset.role}:${asset.sourceUrl ?? ""}`, asset]));
  const prepared: CataloguePreparedMedia[] = [];
  const newlyStoredKeys: string[] = [];

  try {
    for (const source of manifestMediaSources(manifest)) {
      const prior = reusable.get(`${source.role}:${source.sourceUrl}`);
      if (prior) {
        prepared.push({
          id: crypto.randomUUID(),
          role: source.role,
          storageKey: prior.storageKey,
          mimeType: prior.mimeType,
          byteSize: prior.byteSize,
          width: prior.width,
          height: prior.height,
          checksum: prior.checksum,
          sourceUrl: source.sourceUrl,
          altText: source.altText,
        });
        continue;
      }

      const result = await prepareMediaSource(
        `revision-${revisionId}`,
        source.role,
        null,
        source.sourceUrl,
        source.altText,
        env.IMAGES,
      );
      if (!result.ok) throw new Error(`${source.role}: ${result.error}`);
      await putPreparedMedia(env.MEDIA, result.media);
      newlyStoredKeys.push(result.media.storageKey);
      prepared.push({
        id: result.media.id,
        role: result.media.role,
        storageKey: result.media.storageKey,
        mimeType: result.media.mimeType,
        byteSize: result.media.byteSize,
        width: result.media.width,
        height: result.media.height,
        checksum: result.media.checksum,
        sourceUrl: result.media.sourceUrl ?? source.sourceUrl,
        altText: result.media.altText ?? source.altText,
      });
      if (prepared.reduce((total, asset) => total + asset.byteSize, 0) > 40 * 1024 * 1024) {
        throw new Error("Combined optimized media exceeds the 40 MB application limit.");
      }
    }
  } catch (error) {
    if (newlyStoredKeys.length) await env.MEDIA.delete(newlyStoredKeys);
    return { ok: false, error: error instanceof Error ? error.message : "Media preparation failed." } as const;
  }
  return { ok: true, media: prepared } as const;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
