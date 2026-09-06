"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { appCategories, categories } from "@/db/schema";
import { messageUrl, taxonomySchema } from "@/app/dashboard/manage/shared";
import { requireAdmin } from "@/lib/admin-auth";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const result = taxonomySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/categories", "error", "Enter a valid category name and slug."));
  try {
    const database = await getDatabase();
    await database.insert(categories).values({ id: crypto.randomUUID(), ...result.data, createdAt: new Date() });
  } catch {
    redirect(messageUrl("/dashboard/categories", "error", "That category slug is already in use."));
  }
  revalidatePath("/dashboard/categories");
  redirect(messageUrl("/dashboard/categories", "success", "Category created."));
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const result = taxonomySchema.extend({ id: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/categories", "error", "The category values are invalid."));
  try {
    const database = await getDatabase();
    await database.update(categories).set({ name: result.data.name, slug: result.data.slug }).where(eq(categories.id, result.data.id));
  } catch {
    redirect(messageUrl("/dashboard/categories", "error", "That category slug is already in use."));
  }
  revalidatePath("/dashboard/categories");
  redirect(messageUrl("/dashboard/categories", "success", "Category updated."));
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/categories", "error", "Invalid category."));
  const database = await getDatabase();
  const usage = await database.select({ appId: appCategories.appId }).from(appCategories).where(eq(appCategories.categoryId, id.data)).limit(1);
  if (usage[0]) redirect(messageUrl("/dashboard/categories", "error", "Remove this category from its applications before deleting it."));
  await database.delete(categories).where(eq(categories.id, id.data));
  revalidatePath("/dashboard/categories");
  redirect(messageUrl("/dashboard/categories", "success", "Unused category deleted."));
}
