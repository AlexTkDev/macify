"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps, deals } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export async function setFeaturedApplication(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ appId: z.uuid(), featured: z.enum(["true", "false"]) }).safeParse({
    appId: formData.get("appId"), featured: formData.get("featured"),
  });
  if (!parsed.success) redirect("/dashboard?error=invalid-featured");
  const featured = parsed.data.featured === "true";
  const database = await getDatabase();
  const row = await database.select({ slug: apps.slug, status: apps.status }).from(apps)
    .where(and(eq(apps.id, parsed.data.appId), isNull(apps.deletedAt))).limit(1);
  if (!row[0]) redirect("/dashboard");
  if (featured && row[0].status !== "published") {
    redirect(`/dashboard/apps/${parsed.data.appId}/edit?featureError=not-published`);
  }
  await database.update(apps).set({ isFeatured: featured, featuredAt: featured ? new Date() : null, updatedAt: new Date() })
    .where(eq(apps.id, parsed.data.appId));
  revalidatePath("/");
  revalidatePath(`/apps/${row[0].slug}`);
  redirect(`/dashboard/apps/${parsed.data.appId}/edit?featured=1`);
}

export async function setApplicationPublication(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ appId: z.uuid(), intent: z.enum(["publish", "unpublish"]) }).safeParse({
    appId: formData.get("appId"), intent: formData.get("intent"),
  });
  if (!parsed.success) redirect("/dashboard?error=invalid-publication");
  const database = await getDatabase();
  const applicationRows = await database.select({ slug: apps.slug }).from(apps)
    .where(and(eq(apps.id, parsed.data.appId), isNull(apps.deletedAt))).limit(1);
  const application = applicationRows[0];
  if (!application) redirect("/dashboard");
  const now = new Date();
  await database.update(apps).set(parsed.data.intent === "publish" ? {
    status: "published",
    publishedAt: now,
    updatedAt: now,
  } : {
    status: "archived",
    isFeatured: false,
    featuredAt: null,
    updatedAt: now,
  }).where(eq(apps.id, parsed.data.appId));
  revalidatePath("/");
  revalidatePath(`/apps/${application.slug}`);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/apps/${parsed.data.appId}`);
  redirect(`/dashboard/apps/${parsed.data.appId}/edit?publication=${parsed.data.intent}`);
}

const dealSchema = z.object({
  appId: z.uuid(),
  dealId: z.union([z.uuid(), z.literal("")]).optional(),
  discountPercent: z.coerce.number().int().min(1).max(100),
  code: z.string().trim().max(80),
  url: z.url().refine((value) => new URL(value).protocol === "https:"),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
}).superRefine((deal, context) => {
  if (deal.startsAt && Number.isNaN(Date.parse(deal.startsAt))) context.addIssue({ code: "custom", path: ["startsAt"], message: "Invalid start date." });
  if (deal.endsAt && Number.isNaN(Date.parse(deal.endsAt))) context.addIssue({ code: "custom", path: ["endsAt"], message: "Invalid end date." });
  if (deal.startsAt && deal.endsAt && Date.parse(deal.endsAt) <= Date.parse(deal.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after start date." });
  }
});

export async function saveApplicationDeal(formData: FormData) {
  await requireAdmin();
  const parsed = dealSchema.safeParse(Object.fromEntries(formData));
  const dealId = z.uuid().safeParse(formData.get("dealId"));
  if (!parsed.success) redirect(dealId.success ? `/dashboard/deals/${dealId.data}?error=1` : "/dashboard/deals/new?error=1");
  const database = await getDatabase();
  const applicationRows = await database.select({ slug: apps.slug }).from(apps)
    .where(and(eq(apps.id, parsed.data.appId), isNull(apps.deletedAt))).limit(1);
  const application = applicationRows[0];
  if (!application) redirect("/dashboard/deals/new?error=missing-app");
  const now = new Date();
  await database.insert(deals).values({
    id: crypto.randomUUID(),
    appId: parsed.data.appId,
    discountPercent: parsed.data.discountPercent,
    code: parsed.data.code || null,
    url: parsed.data.url,
    startsAt: utcDate(parsed.data.startsAt),
    endsAt: utcDate(parsed.data.endsAt),
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: deals.appId,
    set: {
      discountPercent: parsed.data.discountPercent,
      code: parsed.data.code || null,
      url: parsed.data.url,
      startsAt: utcDate(parsed.data.startsAt),
      endsAt: utcDate(parsed.data.endsAt),
      updatedAt: now,
    },
  });
  revalidatePath(`/apps/${application.slug}`);
  revalidatePath("/dashboard/deals");
  redirect("/dashboard/deals?saved=1");
}

export async function removeApplicationDeal(formData: FormData) {
  await requireAdmin();
  const appId = z.uuid().safeParse(formData.get("appId"));
  if (!appId.success) redirect("/dashboard/deals?error=invalid");
  const database = await getDatabase();
  const application = await database.select({ slug: apps.slug }).from(apps).where(eq(apps.id, appId.data)).limit(1);
  await database.delete(deals).where(eq(deals.appId, appId.data));
  if (application[0]) revalidatePath(`/apps/${application[0].slug}`);
  revalidatePath("/dashboard/deals");
  redirect("/dashboard/deals?removed=1");
}

function utcDate(value: string) {
  return new Date(`${value}:00.000Z`);
}
