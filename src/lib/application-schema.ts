import { z } from "zod";

const httpUrl = z
  .url("Enter a complete URL, including https://.")
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Use an http:// or https:// URL.");

const optionalHttpUrl = z.string().trim().refine((value) => value === "" || httpUrl.safeParse(value).success, "Enter a valid URL.");

const optionalYouTubeUrl = optionalHttpUrl.refine((value) => {
  if (value === "") return true;
  const hostname = new URL(value).hostname.replace(/^www\./, "");
  return hostname === "youtube.com" || hostname === "youtu.be";
}, "Use a youtube.com or youtu.be URL.");

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Enter the application name.").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug.")
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  websiteUrl: httpUrl,
  tagline: z.string().trim().min(10, "Write a more descriptive tagline.").max(140),
  description: z.string().trim().min(40, "Write at least 40 characters.").max(20_000),
  pricingType: z.enum(["free", "freemium", "paid"]),
  billingType: z.enum(["one_time", "subscription"]).or(z.literal("")),
  pricingDetails: z.string().trim().max(240),
  sourceType: z.enum(["open_source", "closed_source"]),
  youtubeUrl: optionalYouTubeUrl,
  categoryId: z.string().trim().min(1, "Choose a primary category."),
  tagsText: z
    .string()
    .trim()
    .max(500, "Keep the tag list under 500 characters.")
    .refine(
      (value) =>
        value === "" ||
        value.split(",").every((tag) => {
          const length = tag.trim().length;
          return length >= 2 && length <= 40;
        }),
      "Use comma-separated tags between 2 and 40 characters each.",
    ),
  relatedAppIds: z.array(z.uuid()).max(12, "Choose no more than 12 related applications."),
}).superRefine((data, context) => {
  if (data.pricingType !== "free" && data.billingType === "") {
    context.addIssue({ code: "custom", path: ["billingType"], message: "Choose one-time payment or subscription." });
  }
});

export type ApplicationFields = z.infer<typeof applicationSchema>;

export function applicationFieldsFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    websiteUrl: formData.get("websiteUrl"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    pricingType: formData.get("pricingType"),
    billingType: formData.get("billingType") ?? "",
    pricingDetails: formData.get("pricingDetails"),
    sourceType: formData.get("sourceType") ?? "closed_source",
    youtubeUrl: formData.get("youtubeUrl"),
    categoryId: formData.get("categoryId"),
    tagsText: formData.get("tagsText"),
    relatedAppIds: formData.getAll("relatedAppIds"),
  };
}

export function normalizeTags(value: string) {
  const seen = new Set<string>();

  return value
    .split(",")
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .map((name) => ({
      name,
      slug: name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }))
    .filter(({ slug }) => slug.length >= 2 && !seen.has(slug) && seen.add(slug))
    .slice(0, 12);
}
