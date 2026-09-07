"use server";

import { and, desc, eq, inArray, isNull, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDatabase } from "@/db/client";
import {
  appCategories,
  appRelationships,
  apps,
  catalogueRevisions,
  categories,
  deals,
  mediaAssets,
} from "@/db/schema";
import { catalogueManifestSchema } from "@/lib/catalogue-manifest";
import { ingestCatalogueItem } from "@/lib/catalogue-ingestion";
import { dealManifestSchema } from "@/lib/deal-manifest";
import { requireAdmin } from "@/lib/admin-auth";

const decisionSchema = z.object({
  revisionId: z.uuid(),
  intent: z.enum(["publish", "reject"]),
});

const bulkDecisionSchema = z.object({
  revisionIds: z.array(z.uuid()).min(1).max(100),
  intent: z.enum(["publish", "reject"]),
});

type DecisionIntent = z.infer<typeof decisionSchema>["intent"];

class CatalogueDecisionError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

const failureActionSchema = z.object({ revisionId: z.uuid() });

function reviewQueuePath(formData: FormData) {
  return formData.get("returnPath") === "/dashboard/deals" ? "/dashboard/deals" : "/dashboard/catalogue";
}

function reviewSourcePattern(queuePath: ReturnType<typeof reviewQueuePath>) {
  return queuePath === "/dashboard/deals" ? "catalog/deals/%" : "catalog/apps/%";
}

export async function retryCatalogueFailure(formData: FormData) {
  await requireAdmin();
  const queuePath = reviewQueuePath(formData);
  const parsed = failureActionSchema.safeParse({ revisionId: formData.get("revisionId") });
  if (!parsed.success) redirect(`${queuePath}?view=failed&error=invalid`);

  const database = await getDatabase();
  const rows = await database.select().from(catalogueRevisions).where(and(
    eq(catalogueRevisions.id, parsed.data.revisionId),
    eq(catalogueRevisions.status, "failed"),
    like(catalogueRevisions.sourcePath, reviewSourcePattern(queuePath)),
  )).limit(1);
  const revision = rows[0];
  if (!revision || !revision.manifest) redirect(`${queuePath}?view=failed&error=not-failed`);

  const { env } = await getCloudflareContext({ async: true });
  const result = await ingestCatalogueItem({
    changeType: "upsert",
    path: revision.sourcePath,
    manifest: revision.manifest,
  }, {
    repository: revision.sourceRepository,
    commitSha: revision.sourceCommitSha,
  }, env);

  revalidatePath("/dashboard/catalogue");
  revalidatePath("/dashboard/deals");
  revalidatePath(`/dashboard/catalogue/${revision.id}`);
  if (!result.ok) redirect(`${queuePath}?view=failed&error=retry-failed`);
  redirect(`${queuePath}?retried=1`);
}

export async function dismissCatalogueFailure(formData: FormData) {
  await requireAdmin();
  const queuePath = reviewQueuePath(formData);
  const parsed = failureActionSchema.safeParse({ revisionId: formData.get("revisionId") });
  if (!parsed.success) redirect(`${queuePath}?view=failed&error=invalid`);

  const database = await getDatabase();
  const result = await database.update(catalogueRevisions).set({
    status: "dismissed",
    reviewedAt: new Date(),
  }).where(and(
    eq(catalogueRevisions.id, parsed.data.revisionId),
    eq(catalogueRevisions.status, "failed"),
    like(catalogueRevisions.sourcePath, reviewSourcePattern(queuePath)),
  )).returning({ id: catalogueRevisions.id });
  if (result.length === 0) redirect(`${queuePath}?view=failed&error=not-failed`);

  revalidatePath("/dashboard/catalogue");
  revalidatePath("/dashboard/deals");
  redirect(`${queuePath}?view=failed&dismissed=1`);
}

export async function decideCatalogueRevision(formData: FormData) {
  await requireAdmin();
  const queuePath = reviewQueuePath(formData);
  const parsed = decisionSchema.safeParse({
    revisionId: formData.get("revisionId"),
    intent: formData.get("intent"),
  });
  if (!parsed.success) redirect(`${queuePath}?error=invalid`);

  try {
    await applyCatalogueDecision(parsed.data.revisionId, parsed.data.intent, reviewSourcePattern(queuePath));
  } catch (error) {
    if (error instanceof CatalogueDecisionError) redirect(`${queuePath}?error=${error.code}`);
    throw error;
  }

  revalidateCataloguePaths();
  redirect(`${queuePath}?${parsed.data.intent === "publish" ? "published" : "rejected"}=1`);
}

export async function decideCatalogueRevisions(formData: FormData) {
  await requireAdmin();
  const queuePath = reviewQueuePath(formData);
  const parsed = bulkDecisionSchema.safeParse({
    revisionIds: [...new Set(formData.getAll("revisionId"))],
    intent: formData.get("intent"),
  });
  if (!parsed.success) redirect(`${queuePath}?error=invalid-selection`);

  const database = await getDatabase();
  const selected = await database.select({
    id: catalogueRevisions.id,
    sourcePath: catalogueRevisions.sourcePath,
    createdAt: catalogueRevisions.createdAt,
  }).from(catalogueRevisions).where(and(
    inArray(catalogueRevisions.id, parsed.data.revisionIds),
    eq(catalogueRevisions.status, "pending"),
    like(catalogueRevisions.sourcePath, reviewSourcePattern(queuePath)),
  ));

  const selectedIds = new Set(selected.map(({ id }) => id));
  let failed = parsed.data.revisionIds.length - selectedIds.size;
  let completed = 0;
  const ordered = selected.sort((left, right) => {
    const leftIsDeal = left.sourcePath.startsWith("catalog/deals/");
    const rightIsDeal = right.sourcePath.startsWith("catalog/deals/");
    return Number(leftIsDeal) - Number(rightIsDeal) || left.createdAt.getTime() - right.createdAt.getTime();
  });
  let remaining = ordered.map(({ id }) => id);

  // A second pass lets a selected app publish before a related app or deal that depends on it.
  for (let pass = 0; pass < 2 && remaining.length > 0; pass += 1) {
    const retry: string[] = [];
    for (const revisionId of remaining) {
      try {
        await applyCatalogueDecision(revisionId, parsed.data.intent, reviewSourcePattern(queuePath));
        completed += 1;
      } catch (error) {
        if (error instanceof CatalogueDecisionError) retry.push(revisionId);
        else {
          console.error(`Bulk catalogue decision failed for revision ${revisionId}.`, error);
          retry.push(revisionId);
        }
      }
    }
    if (retry.length === remaining.length) {
      remaining = retry;
      break;
    }
    remaining = retry;
  }
  failed += remaining.length;

  revalidateCataloguePaths();
  const params = new URLSearchParams({
    bulkIntent: parsed.data.intent,
    bulkCompleted: String(completed),
    bulkFailed: String(failed),
  });
  redirect(`${queuePath}?${params}`);
}

async function applyCatalogueDecision(revisionId: string, intent: DecisionIntent, sourcePattern: string) {

  const database = await getDatabase();
  const row = await database
    .select()
    .from(catalogueRevisions)
    .where(and(
      eq(catalogueRevisions.id, revisionId),
      eq(catalogueRevisions.status, "pending"),
      like(catalogueRevisions.sourcePath, sourcePattern),
    ))
    .limit(1);
  const revision = row[0];
  if (!revision) throw new CatalogueDecisionError("not-pending");
  const isApplicationRevision = revision.sourcePath.startsWith("catalog/apps/");
  const isDealRevision = revision.sourcePath.startsWith("catalog/deals/");
  if (!isApplicationRevision && !isDealRevision) throw new CatalogueDecisionError("invalid");

  const newestRevision = await database.select({ id: catalogueRevisions.id }).from(catalogueRevisions)
    .where(eq(catalogueRevisions.sourcePath, revision.sourcePath))
    .orderBy(desc(catalogueRevisions.createdAt)).limit(1);
  if (newestRevision[0]?.id !== revision.id) throw new CatalogueDecisionError("stale-revision");

  if (intent === "reject") {
    const keys = [...new Set(revision.preparedMedia.map(({ storageKey }) => storageKey))];
    const rejected = await database.update(catalogueRevisions).set({ status: "rejected", reviewedAt: new Date() })
      .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending")))
      .returning({ id: catalogueRevisions.id });
    if (rejected.length === 0) throw new CatalogueDecisionError("not-pending");
    if (keys.length) {
      try {
        const referenced = await database.select({ storageKey: mediaAssets.storageKey }).from(mediaAssets)
          .where(inArray(mediaAssets.storageKey, keys));
        const referencedKeys = new Set(referenced.map(({ storageKey }) => storageKey));
        const disposable = keys.filter((key) => !referencedKeys.has(key));
        if (disposable.length) {
          const { env } = await getCloudflareContext({ async: true });
          await env.MEDIA.delete(disposable);
        }
      } catch (error) {
        console.error("Rejected catalogue revision but could not remove its unreferenced media.", error);
      }
    }
    return;
  }

  if (isDealRevision) {
    const applicationRows = await database.select({ id: apps.id, status: apps.status }).from(apps)
      .where(and(eq(apps.slug, revision.appSlug), isNull(apps.deletedAt))).limit(1);
    const application = applicationRows[0];
    if (!application || (revision.changeType !== "archive" && application.status !== "published")) {
      throw new CatalogueDecisionError("missing-deal-app");
    }

    const reviewedAt = new Date();
    if (revision.changeType === "archive") {
      await database.batch([
        database.delete(deals).where(eq(deals.appId, application.id)),
        database.update(catalogueRevisions).set({ appId: application.id, status: "published", reviewedAt })
          .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
      ]);
    } else {
      const manifestResult = dealManifestSchema.safeParse(revision.manifest);
      if (!manifestResult.success) throw new CatalogueDecisionError("invalid-deal-manifest");
      const manifest = manifestResult.data;
      const values = {
        discountPercent: manifest.discountPercent,
        code: manifest.code,
        url: manifest.url,
        startsAt: new Date(manifest.startsAt),
        endsAt: new Date(manifest.endsAt),
        updatedAt: reviewedAt,
      };
      await database.batch([
        database.insert(deals).values({
          id: crypto.randomUUID(),
          appId: application.id,
          ...values,
          createdAt: reviewedAt,
        }).onConflictDoUpdate({ target: deals.appId, set: values }),
        database.update(catalogueRevisions).set({ appId: application.id, status: "published", reviewedAt })
          .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
      ]);
    }

    return;
  }

  if (revision.changeType === "archive") {
    if (!revision.appId) throw new CatalogueDecisionError("missing-app");
    await database.batch([
      database.update(apps).set({ status: "archived", isFeatured: false, featuredAt: null, updatedAt: new Date() }).where(eq(apps.id, revision.appId)),
      database.update(catalogueRevisions).set({ status: "published", reviewedAt: new Date() })
        .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
    ]);
    return;
  }

  const manifestResult = catalogueManifestSchema.safeParse(revision.manifest);
  if (!manifestResult.success) throw new CatalogueDecisionError("invalid-manifest");
  const manifest = manifestResult.data;
  const appId = revision.appId ?? crypto.randomUUID();
  const relatedSlugs = [...new Set(manifest.relatedAppSlugs)].filter((slug) => slug !== manifest.slug);
  const related = relatedSlugs.length
    ? await database.select({ id: apps.id, slug: apps.slug }).from(apps)
      .where(and(inArray(apps.slug, relatedSlugs), isNull(apps.deletedAt)))
    : [];
  if (related.length !== relatedSlugs.length) throw new CatalogueDecisionError("missing-related-app");
  if (!revision.preparedMedia.some((asset) => asset.role === "icon")
    || !revision.preparedMedia.some((asset) => asset.role === "preview_image")) {
    throw new CatalogueDecisionError("missing-media");
  }

  const now = new Date();
  const previousMedia = revision.appId
    ? await database.select({ storageKey: mediaAssets.storageKey }).from(mediaAssets).where(eq(mediaAssets.appId, revision.appId))
    : [];
  const appValues = {
    name: manifest.name,
    slug: manifest.slug,
    websiteUrl: manifest.websiteUrl,
    tagline: manifest.tagline,
    description: manifest.description,
    pricingType: manifest.pricingType,
    billingType: manifest.billingType,
    pricingDetails: manifest.pricingDetails,
    sourceType: manifest.sourceType,
    youtubeUrl: manifest.youtubeUrl,
    status: "published" as const,
    publishedAt: now,
    updatedAt: now,
  };
  const normalizedCategories = normalizeManifestCategories(manifest.categories);
  const appQuery = revision.changeType === "create"
    ? database.insert(apps).values({ id: appId, ...appValues, createdAt: now })
    : database.update(apps).set(appValues).where(eq(apps.id, appId));

  await database.batch([
    appQuery,
    database.delete(appCategories).where(eq(appCategories.appId, appId)),
    ...normalizedCategories.flatMap(({ name, slug }) => [
      database.insert(categories).values({ id: `category-${slug}`, name, slug, createdAt: now })
        .onConflictDoUpdate({ target: categories.slug, set: { name } }),
      database.insert(appCategories).values({
        appId,
        categoryId: sql`(select ${categories.id} from ${categories} where ${categories.slug} = ${slug})`,
      }),
    ]),
    database.delete(appRelationships).where(eq(appRelationships.sourceAppId, appId)),
    ...related.map(({ id: relatedId }) => {
      return database.insert(appRelationships).values({
        id: crypto.randomUUID(),
        sourceAppId: appId,
        targetAppId: relatedId,
        createdAt: now,
      }).onConflictDoNothing();
    }),
    database.delete(mediaAssets).where(eq(mediaAssets.appId, appId)),
    ...revision.preparedMedia.map((asset) => database.insert(mediaAssets).values({
      ...asset,
      appId,
      sourceUrl: asset.sourceUrl,
      altText: asset.altText,
      createdAt: now,
    })),
    database.update(catalogueRevisions).set({ appId, status: "published", reviewedAt: now })
      .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
  ]);

  const publishedKeys = new Set(revision.preparedMedia.map(({ storageKey }) => storageKey));
  const obsoleteKeys = previousMedia.map(({ storageKey }) => storageKey).filter((key) => !publishedKeys.has(key));
  if (obsoleteKeys.length) {
    try {
      const { env } = await getCloudflareContext({ async: true });
      await env.MEDIA.delete(obsoleteKeys);
    } catch (error) {
      console.error("Published catalogue revision but could not remove superseded R2 media.", error);
    }
  }

}

function revalidateCataloguePaths() {
  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/catalogue");
  revalidatePath("/dashboard/deals");
  revalidatePath("/apps/[slug]", "page");
}

function normalizeManifestCategories(values: string[]) {
  const seen = new Set<string>();
  return values.map((name) => ({
    name: name.trim().replace(/\s+/g, " "),
    slug: name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
  })).filter(({ slug }) => slug.length >= 2 && !seen.has(slug) && seen.add(slug));
}
