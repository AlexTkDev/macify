"use server";

import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
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
  mediaAssets,
} from "@/db/schema";
import { catalogueManifestSchema } from "@/lib/catalogue-manifest";
import { requireAdmin } from "@/lib/admin-auth";

const decisionSchema = z.object({
  revisionId: z.uuid(),
  intent: z.enum(["publish", "reject"]),
});

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

  const newestPending = await database.select({ id: catalogueRevisions.id }).from(catalogueRevisions)
    .where(and(eq(catalogueRevisions.appSlug, revision.appSlug), eq(catalogueRevisions.status, "pending")))
    .orderBy(desc(catalogueRevisions.createdAt)).limit(1);
  if (newestPending[0]?.id !== revision.id) redirect("/dashboard/catalogue?error=stale-revision");

  if (parsed.data.intent === "reject") {
    const keys = [...new Set(revision.preparedMedia.map(({ storageKey }) => storageKey))];
    if (keys.length) {
      const referenced = await database.select({ storageKey: mediaAssets.storageKey }).from(mediaAssets)
        .where(inArray(mediaAssets.storageKey, keys));
      const referencedKeys = new Set(referenced.map(({ storageKey }) => storageKey));
      const disposable = keys.filter((key) => !referencedKeys.has(key));
      if (disposable.length) {
        const { env } = await getCloudflareContext({ async: true });
        await env.MEDIA.delete(disposable);
      }
    }
    await database.update(catalogueRevisions).set({ status: "rejected", reviewedAt: new Date() })
      .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending")));
    revalidatePath("/dashboard/catalogue");
    redirect("/dashboard/catalogue?rejected=1");
  }

  if (revision.changeType === "archive") {
    if (!revision.appId) redirect("/dashboard/catalogue?error=missing-app");
    await database.batch([
      database.update(apps).set({ status: "archived", updatedAt: new Date() }).where(eq(apps.id, revision.appId)),
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
    database.delete(appRelationships).where(or(
      eq(appRelationships.sourceAppId, appId),
      eq(appRelationships.targetAppId, appId),
    )),
    ...related.map(({ id: relatedId }) => {
      const [sourceAppId, targetAppId] = [appId, relatedId].sort();
      return database.insert(appRelationships).values({
        id: crypto.randomUUID(),
        sourceAppId,
        targetAppId,
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
