"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps, catalogueRevisions, deals } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { dealManifestSchema } from "@/lib/deal-manifest";

const decisionSchema = z.object({
  revisionId: z.uuid(),
  intent: z.enum(["publish", "reject"]),
});

export async function decideDealRevision(formData: FormData) {
  await requireAdmin();
  const parsed = decisionSchema.safeParse({
    revisionId: formData.get("revisionId"),
    intent: formData.get("intent"),
  });
  if (!parsed.success) redirect("/dashboard/catalogue/deals?error=invalid");

  const database = await getDatabase();
  const revisionRows = await database.select().from(catalogueRevisions).where(and(
    eq(catalogueRevisions.id, parsed.data.revisionId),
    eq(catalogueRevisions.status, "pending"),
  )).limit(1);
  const revision = revisionRows[0];
  if (!revision) redirect("/dashboard/catalogue/deals?error=not-pending");
  if (!revision.sourcePath.startsWith("catalog/deals/")) redirect("/dashboard/catalogue/deals?error=invalid");

  const newestRevision = await database.select({ id: catalogueRevisions.id }).from(catalogueRevisions)
    .where(eq(catalogueRevisions.sourcePath, revision.sourcePath))
    .orderBy(desc(catalogueRevisions.createdAt)).limit(1);
  if (newestRevision[0]?.id !== revision.id) redirect("/dashboard/catalogue/deals?error=stale-revision");

  if (parsed.data.intent === "reject") {
    await database.update(catalogueRevisions).set({ status: "rejected", reviewedAt: new Date() })
      .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending")));
    revalidatePath("/dashboard/catalogue/deals");
    redirect("/dashboard/catalogue/deals?rejected=1");
  }

  const applicationRows = await database.select({ id: apps.id, slug: apps.slug, status: apps.status }).from(apps)
    .where(and(eq(apps.slug, revision.appSlug), isNull(apps.deletedAt))).limit(1);
  const application = applicationRows[0];
  if (!application) redirect("/dashboard/catalogue/deals?error=missing-app");
  if (application.status !== "published") redirect("/dashboard/catalogue/deals?error=app-not-published");
  const now = new Date();

  if (revision.changeType === "archive") {
    await database.batch([
      database.delete(deals).where(eq(deals.appId, application.id)),
      database.update(catalogueRevisions).set({ appId: application.id, status: "published", reviewedAt: now })
        .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
    ]);
    revalidatePath(`/apps/${application.slug}`);
    revalidatePath("/dashboard/catalogue/deals");
    redirect("/dashboard/catalogue/deals?published=1");
  }

  const manifestResult = dealManifestSchema.safeParse(revision.manifest);
  if (!manifestResult.success || manifestResult.data.appSlug !== application.slug) {
    redirect("/dashboard/catalogue/deals?error=invalid-manifest");
  }
  const manifest = manifestResult.data;
  await database.batch([
    database.insert(deals).values({
      id: crypto.randomUUID(),
      appId: application.id,
      discountPercent: manifest.discountPercent,
      code: manifest.code,
      url: manifest.url,
      startsAt: new Date(manifest.startsAt),
      endsAt: new Date(manifest.endsAt),
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: deals.appId,
      set: {
        discountPercent: manifest.discountPercent,
        code: manifest.code,
        url: manifest.url,
        startsAt: new Date(manifest.startsAt),
        endsAt: new Date(manifest.endsAt),
        updatedAt: now,
      },
    }),
    database.update(catalogueRevisions).set({ appId: application.id, status: "published", reviewedAt: now })
      .where(and(eq(catalogueRevisions.id, revision.id), eq(catalogueRevisions.status, "pending"))),
  ]);
  revalidatePath(`/apps/${application.slug}`);
  revalidatePath("/dashboard/catalogue/deals");
  redirect("/dashboard/catalogue/deals?published=1");
}
