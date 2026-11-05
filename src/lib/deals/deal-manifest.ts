import { z } from "zod";
import { parseRemoteImageUrl } from "@/lib/media/media-validation";

const httpsUrl = z.url().max(2_000).refine((value) => parseRemoteImageUrl(value) !== null, "Use a public HTTPS URL without credentials.");
const timestamp = z.string().datetime({ offset: true });

export const dealManifestSchema = z.object({
  $schema: z.literal("../schema/deal.schema.json"),
  schemaVersion: z.literal(1),
  appSlug: z.string().trim().min(2).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  discountPercent: z.number().int().min(1).max(100),
  code: z.string().trim().min(1).max(80).nullable(),
  url: httpsUrl,
  startsAt: timestamp,
  endsAt: timestamp.nullable(),
}).strict().superRefine((deal, context) => {
  if (deal.endsAt !== null && Date.parse(deal.endsAt) <= Date.parse(deal.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after start date." });
  }
});

export type DealManifest = z.infer<typeof dealManifestSchema>;
