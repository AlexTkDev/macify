import type { ApplicationFormState } from "@/app/dashboard/actions/action-types";

export type EditableApplication = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  tagline: string;
  description: string;
  pricingType: "free" | "freemium" | "paid";
  billingType: "one_time" | "subscription" | null;
  pricingDetails: string | null;
  sourceType: "open_source" | "closed_source";
  youtubeUrl: string | null;
  tagsText: string;
  relatedAppIds: string[];
};

export type RelatedApplicationOption = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
};

export type FieldErrors = ApplicationFormState["errors"];
