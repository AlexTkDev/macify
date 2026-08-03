"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { appTags, tags } from "@/db/schema";
import { messageUrl, taxonomySchema } from "@/app/dashboard/manage/shared";

export async function createTag(formData: FormData) {
  const result = taxonomySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/tags", "error", "Enter a valid tag name and slug."));
  try {
    const database = await getDatabase();
    await database.insert(tags).values({ id: crypto.randomUUID(), ...result.data, createdAt: new Date() });
  } catch {
    redirect(messageUrl("/dashboard/tags", "error", "That tag slug is already in use."));
  }
  revalidatePath("/dashboard/tags");
  redirect(messageUrl("/dashboard/tags", "success", "Tag created."));
}

export async function updateTag(formData: FormData) {
  const result = taxonomySchema.extend({ id: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!result.success) redirect(messageUrl("/dashboard/tags", "error", "The tag values are invalid."));
  try {
    const database = await getDatabase();
    await database.update(tags).set({ name: result.data.name, slug: result.data.slug }).where(eq(tags.id, result.data.id));
  } catch {
    redirect(messageUrl("/dashboard/tags", "error", "That tag slug is already in use."));
  }
  revalidatePath("/dashboard/tags");
  redirect(messageUrl("/dashboard/tags", "success", "Tag updated."));
}

export async function deleteTag(formData: FormData) {
  const id = z.string().min(1).safeParse(formData.get("id"));
  if (!id.success) redirect(messageUrl("/dashboard/tags", "error", "Invalid tag."));
  const database = await getDatabase();
  const usage = await database.select({ appId: appTags.appId }).from(appTags).where(eq(appTags.tagId, id.data)).limit(1);
  if (usage[0]) redirect(messageUrl("/dashboard/tags", "error", "Remove this tag from its applications before deleting it."));
  await database.delete(tags).where(eq(tags.id, id.data));
  revalidatePath("/dashboard/tags");
  redirect(messageUrl("/dashboard/tags", "success", "Unused tag deleted."));
}
