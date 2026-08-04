"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { apps } from "@/db/schema";
import { applicationFieldsFromFormData, applicationSchema } from "@/lib/application-schema";
import {
  normalizedApplicationValues,
  relatedApplicationsExist,
  relationshipQueries,
  tagQueries,
  uniqueConstraintMessage,
} from "@/app/dashboard/actions/application-persistence";
import type { ApplicationFormState } from "@/app/dashboard/actions/action-types";

export async function updateApplication(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const idResult = z.uuid().safeParse(formData.get("appId"));
  const result = applicationSchema.safeParse(applicationFieldsFromFormData(formData));
  if (!idResult.success) return { message: "This application record is invalid." };
  if (!result.success) {
    return {
      message: "Review the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const database = await getDatabase();
    if (!(await relatedApplicationsExist(database, idResult.data, result.data.relatedAppIds))) {
      return {
        message: "One or more related applications are no longer available.",
        errors: { relatedAppIds: ["Refresh the page and choose related applications again."] },
      };
    }
    await database.batch([
      database
        .update(apps)
        .set({ ...normalizedApplicationValues(result.data), updatedAt: new Date() })
        .where(and(eq(apps.id, idResult.data), isNull(apps.deletedAt))),
      ...tagQueries(database, idResult.data, result.data),
      ...relationshipQueries(database, idResult.data, result.data.relatedAppIds),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const constraintMessage = uniqueConstraintMessage(message);
    if (constraintMessage) return { message: constraintMessage };
    console.error(JSON.stringify({ event: "application.update.failed", appId: idResult.data, message }));
    return { message: "The changes could not be saved. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/apps/${result.data.slug}`);
  revalidatePath(`/dashboard/apps/${idResult.data}/edit`);
  redirect(`/dashboard/apps/${idResult.data}/edit?saved=1`);
}
