"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { appCategories, categories, redirects as redirectsTable } from "@/db/schema";
import { messageUrl, taxonomySchema } from "@/app/dashboard/manage/shared";

const categorySchema = taxonomySchema.extend({
  description: z.string().trim().max(320),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export async function createCategory(formData: FormData) {
  const result = categorySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/categories", "error", "Enter a valid name, slug, description, and order."));
  try {
    const database = await getDatabase();
    await database.insert(categories).values({
      id: crypto.randomUUID(),
      ...result.data,
      description: result.data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch {
    redirect(messageUrl("/dashboard/categories", "error", "That category slug is already in use."));
  }
  revalidatePath("/dashboard/categories");
  revalidatePath("/");
  redirect(messageUrl("/dashboard/categories", "success", "Category created."));
}

export async function updateCategory(formData: FormData) {
  const result = categorySchema.extend({ id: z.uuid() }).safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/categories", "error", "The category values are invalid."));
  try {
    const database = await getDatabase();
    const current = await database.select({ slug: categories.slug }).from(categories).where(eq(categories.id, result.data.id)).limit(1);
    if (!current[0]) redirect(messageUrl("/dashboard/categories", "error", "Category not found."));
    const categoryUpdate = database
      .update(categories)
      .set({
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description || null,
        sortOrder: result.data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, result.data.id));
    if (current[0].slug !== result.data.slug) {
      await database.batch([
        categoryUpdate,
        database.insert(redirectsTable).values({
          id: crypto.randomUUID(),
          sourcePath: `/categories/${current[0].slug}`,
          destinationPath: `/categories/${result.data.slug}`,
          statusCode: 308,
          createdAt: new Date(),
        }).onConflictDoUpdate({
          target: redirectsTable.sourcePath,
          set: { destinationPath: `/categories/${result.data.slug}`, statusCode: 308 },
        }),
      ]);
    } else {
      await categoryUpdate;
    }
  } catch {
    redirect(messageUrl("/dashboard/categories", "error", "That category slug is already in use."));
  }
  revalidatePath("/dashboard/categories");
  revalidatePath("/");
  redirect(messageUrl("/dashboard/categories", "success", "Category updated."));
}

export async function deleteCategory(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/categories", "error", "Invalid category."));
  const database = await getDatabase();
  const usage = await database.select({ appId: appCategories.appId }).from(appCategories).where(eq(appCategories.categoryId, id.data)).limit(1);
  if (usage[0]) redirect(messageUrl("/dashboard/categories", "error", "Move its applications before deleting this category."));
  await database.delete(categories).where(eq(categories.id, id.data));
  revalidatePath("/dashboard/categories");
  redirect(messageUrl("/dashboard/categories", "success", "Unused category deleted."));
}
