import type { catalogueRevisions } from "@/db/schema";

type Revision = typeof catalogueRevisions.$inferSelect;

export const dealRevisionChangeLabels: Record<Revision["changeType"], string> = {
  create: "New deal",
  update: "Deal update",
  archive: "Deal removal",
};

export const dealPublishActionLabels: Record<Revision["changeType"], string> = {
  create: "Publish new deal",
  update: "Publish deal update",
  archive: "Remove published deal",
};
