import { z } from "zod";
import { isAllowedRemoteImageUrl } from "@/lib/media-upload";
import { slugSchema } from "@/app/dashboard/manage/shared";

export type SourceRow = Record<string, unknown>;

export function splitList(value: string) {
  return value.split(/[|;\n\r]+/).map((item) => item.trim()).filter(Boolean);
}

export const importSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  websiteUrl: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
  tagline: z.string().trim().min(10).max(140),
  description: z.string().trim().min(40).max(20_000),
  pricingType: z.enum(["free", "freemium", "paid"]),
  billingType: z.enum(["one_time", "subscription"]).or(z.literal("")).default(""),
  pricingDetails: z.string().trim().max(240).default(""),
  sourceType: z.enum(["open_source", "closed_source"]).default("closed_source"),
  youtubeUrl: z.string().trim().default("").refine((value) => {
    if (!value) return true;
    const parsed = z.url().safeParse(value);
    return parsed.success && ["youtube.com", "www.youtube.com", "youtu.be"].includes(new URL(parsed.data).hostname);
  }, "Use a youtube.com or youtu.be URL."),
  tags: z.string().trim().min(2).max(500)
    .refine((value) => value.split(",").map((tag) => tag.trim()).filter(Boolean).length <= 3, "Use no more than 3 tags."),
  iconUrl: z.string().trim().max(2_000).default("").refine(isAllowedRemoteImageUrl, "Use a public HTTPS image URL."),
  iconAltText: z.string().trim().max(300).default(""),
  previewImageUrl: z.string().trim().max(2_000).default("").refine(isAllowedRemoteImageUrl, "Use a public HTTPS image URL."),
  previewImageAltText: z.string().trim().max(300).default(""),
  screenshotUrls: z.string().trim().max(16_000).default("")
    .refine((value) => splitList(value).length <= 8, "Use no more than 8 screenshot URLs.")
    .refine((value) => splitList(value).every(isAllowedRemoteImageUrl), "Every screenshot must use a public HTTPS image URL."),
  relatedAppSlugs: z.string().trim().max(2_000).default(""),
}).superRefine((data, context) => {
  if (data.pricingType !== "free" && data.billingType === "") {
    context.addIssue({ code: "custom", path: ["billingType"], message: "Choose one_time or subscription." });
  }
});

export type NormalizedImport = z.infer<typeof importSchema>;

export function normalizeSourceRow(input: unknown) {
  const source: SourceRow = typeof input === "object" && input !== null && !Array.isArray(input)
    ? input as SourceRow
    : {};
  const value = (camel: string, snake: string) => String(source[camel] ?? source[snake] ?? "");
  const listValue = (camel: string, snake: string, separator: string) => {
    const raw = source[camel] ?? source[snake] ?? "";
    return Array.isArray(raw) ? raw.map(String).join(separator) : String(raw);
  };
  return {
    name: value("name", "name"),
    slug: value("slug", "slug"),
    websiteUrl: value("websiteUrl", "website_url"),
    tagline: value("tagline", "tagline"),
    description: value("description", "description"),
    pricingType: value("pricingType", "pricing_type"),
    billingType: value("billingType", "billing_type"),
    pricingDetails: value("pricingDetails", "pricing_details"),
    sourceType: value("sourceType", "source_type") || "closed_source",
    youtubeUrl: value("youtubeUrl", "youtube_url"),
    tags: value("tags", "tags"),
    iconUrl: value("iconUrl", "icon_url"),
    iconAltText: value("iconAltText", "icon_alt_text"),
    previewImageUrl: value("previewImageUrl", "preview_image_url"),
    previewImageAltText: value("previewImageAltText", "preview_image_alt_text"),
    screenshotUrls: listValue("screenshotUrls", "screenshot_urls", "|"),
    relatedAppSlugs: listValue("relatedAppSlugs", "related_app_slugs", ","),
  };
}
