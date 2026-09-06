"use server";

import { eq } from "drizzle-orm";
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
  const row = await database.select({ slug: apps.slug }).from(apps).where(eq(apps.id, parsed.data.appId)).limit(1);
  if (!row[0]) redirect("/dashboard");
  await database.update(apps).set({ isFeatured: featured, featuredAt: featured ? new Date() : null, updatedAt: new Date() })
    .where(eq(apps.id, parsed.data.appId));
  revalidatePath("/");
  revalidatePath(`/apps/${row[0].slug}`);
  redirect(`/dashboard/apps/${parsed.data.appId}/edit?featured=1`);
}

const dealSchema = z.object({
  appId: z.uuid(),
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
  const appId = String(formData.get("appId") ?? "");
  if (!parsed.success) redirect(`/dashboard/apps/${encodeURIComponent(appId)}/edit?dealError=1`);
  const database = await getDatabase();
  const now = new Date();
  await database.insert(deals).values({
    id: crypto.randomUUID(),
    appId: parsed.data.appId,
    discountPercent: parsed.data.discountPercent,
    code: parsed.data.code || null,
    url: parsed.data.url,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: deals.appId,
    set: {
      discountPercent: parsed.data.discountPercent,
      code: parsed.data.code || null,
      url: parsed.data.url,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      updatedAt: now,
    },
  });
  revalidatePath(`/apps/${(await database.select({ slug: apps.slug }).from(apps).where(eq(apps.id, parsed.data.appId)).limit(1))[0]?.slug ?? ""}`);
  redirect(`/dashboard/apps/${parsed.data.appId}/edit?dealSaved=1`);
}

export async function removeApplicationDeal(formData: FormData) {
  await requireAdmin();
  const appId = z.uuid().safeParse(formData.get("appId"));
  if (!appId.success) redirect("/dashboard");
  const database = await getDatabase();
  const application = await database.select({ slug: apps.slug }).from(apps).where(eq(apps.id, appId.data)).limit(1);
  await database.delete(deals).where(eq(deals.appId, appId.data));
  if (application[0]) revalidatePath(`/apps/${application[0].slug}`);
  redirect(`/dashboard/apps/${appId.data}/edit?dealRemoved=1`);
}
