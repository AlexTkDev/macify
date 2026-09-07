"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps } from "@/db/schema";
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
