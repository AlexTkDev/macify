"use server";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
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

const failureActionSchema = z.object({ revisionId: z.uuid() });

export async function retryCatalogueFailure(formData: FormData) {
  await requireAdmin();
  const parsed = failureActionSchema.safeParse({ revisionId: formData.get("revisionId") });
  if (!parsed.success) redirect("/dashboard/catalogue?view=failed&error=invalid");

  const database = await getDatabase();
  const rows = await database.select().from(catalogueRevisions).where(and(
    eq(catalogueRevisions.id, parsed.data.revisionId),
    eq(catalogueRevisions.status, "failed"),
  )).limit(1);
  const revision = rows[0];
  if (!revision || !revision.manifest) redirect("/dashboard/catalogue?view=failed&error=not-failed");

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
  revalidatePath(`/dashboard/catalogue/${revision.id}`);
  if (!result.ok) redirect("/dashboard/catalogue?view=failed&error=retry-failed");
  redirect("/dashboard/catalogue?retried=1");
}

export async function dismissCatalogueFailure(formData: FormData) {
  await requireAdmin();
  const parsed = failureActionSchema.safeParse({ revisionId: formData.get("revisionId") });
  if (!parsed.success) redirect("/dashboard/catalogue?view=failed&error=invalid");

  const database = await getDatabase();
  const result = await database.update(catalogueRevisions).set({
    status: "dismissed",
    reviewedAt: new Date(),
  }).where(and(
    eq(catalogueRevisions.id, parsed.data.revisionId),
    eq(catalogueRevisions.status, "failed"),
  )).returning({ id: catalogueRevisions.id });
  if (result.length === 0) redirect("/dashboard/catalogue?view=failed&error=not-failed");

  revalidatePath("/dashboard/catalogue");
  redirect("/dashboard/catalogue?view=failed&dismissed=1");
}

export async function decideCatalogueRevision(formData: FormData) {
  await requireAdmin();
  const parsed = decisionSchema.safeParse({
    revisionId: formData.get("revisionId"),
    intent: formData.get("intent"),
  });
  if (!parsed.success) redirect("/dashboard/catalogue?error=invalid");

  const database = await getDatabase();
  const row = await database
    .select()
    .from(catalogueRevisions)
    .where(and(eq(catalogueRevisions.id, parsed.data.revisionId), eq(catalogueRevisions.status, "pending")))
    .limit(1);
  const revision = row[0];
  if (!revision) redirect("/dashboard/catalogue?error=not-pending");
  const isApplicationRevision = revision.sourcePath.startsWith("catalog/apps/");
  const isDealRevision = revision.sourcePath.startsWith("catalog/deals/");
  if (!isApplicationRevision && !isDealRevision) redirect("/dashboard/catalogue?error=invalid");

  const newestRevision = await database.select({ id: catalogueRevisions.id }).from(catalogueRevisions)
    .where(eq(catalogueRevisions.sourcePath, revision.sourcePath))
    .orderBy(desc(catalogueRevisions.createdAt)).limit(1);
  if (newestRevision[0]?.id !== revision.id) redirect("/dashboard/catalogue?error=stale-revision");

  if (parsed.data.intent === "reject") {
    const keys = [...new Set(revision.preparedMedia.map(({ storageKey }) => storageKey))];
    const rejected = await database.update(catalogueRevisions).set({ status: "rejected", reviewedAt: new Date() })
      .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending")))
      .returning({ id: catalogueRevisions.id });
    if (rejected.length === 0) redirect("/dashboard/catalogue?error=not-pending");
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
    revalidatePath("/dashboard/catalogue");
    redirect("/dashboard/catalogue?rejected=1");
  }

  if (isDealRevision) {
    const applicationRows = await database.select({ id: apps.id, status: apps.status }).from(apps)
      .where(and(eq(apps.slug, revision.appSlug), isNull(apps.deletedAt))).limit(1);
    const application = applicationRows[0];
    if (!application || (revision.changeType !== "archive" && application.status !== "published")) {
      redirect("/dashboard/catalogue?error=missing-deal-app");
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
      if (!manifestResult.success) redirect("/dashboard/catalogue?error=invalid-deal-manifest");
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

    revalidatePath("/");
    revalidatePath("/deals");
    revalidatePath("/dashboard/catalogue");
    revalidatePath(`/apps/${revision.appSlug}`);
    redirect("/dashboard/catalogue?published=1");
  }

  if (revision.changeType === "archive") {
    if (!revision.appId) redirect("/dashboard/catalogue?error=missing-app");
    await database.batch([
      database.update(apps).set({ status: "archived", isFeatured: false, featuredAt: null, updatedAt: new Date() }).where(eq(apps.id, revision.appId)),
      database.update(catalogueRevisions).set({ status: "published", reviewedAt: new Date() })
        .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
    ]);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/catalogue");
    revalidatePath(`/apps/${revision.appSlug}`);
    redirect("/dashboard/catalogue?published=1");
  }

  const manifestResult = catalogueManifestSchema.safeParse(revision.manifest);
  if (!manifestResult.success) redirect("/dashboard/catalogue?error=invalid-manifest");
  const manifest = manifestResult.data;
  const appId = revision.appId ?? crypto.randomUUID();
  const relatedSlugs = [...new Set(manifest.relatedAppSlugs)].filter((slug) => slug !== manifest.slug);
  const related = relatedSlugs.length
    ? await database.select({ id: apps.id, slug: apps.slug }).from(apps)
      .where(and(inArray(apps.slug, relatedSlugs), isNull(apps.deletedAt)))
    : [];
  if (related.length !== relatedSlugs.length) redirect("/dashboard/catalogue?error=missing-related-app");
  if (!revision.preparedMedia.some((asset) => asset.role === "icon")
    || !revision.preparedMedia.some((asset) => asset.role === "preview_image")) {
    redirect("/dashboard/catalogue?error=missing-media");
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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/catalogue");
  revalidatePath(`/apps/${manifest.slug}`);
  redirect("/dashboard/catalogue?published=1");
}

function normalizeManifestCategories(values: string[]) {
  const seen = new Set<string>();
  return values.map((name) => ({
    name: name.trim().replace(/\s+/g, " "),
    slug: name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
  })).filter(({ slug }) => slug.length >= 2 && !seen.has(slug) && seen.add(slug));
}
