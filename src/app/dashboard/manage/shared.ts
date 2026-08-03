import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(90)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const taxonomySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
});

export function messageUrl(path: string, type: "success" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}
