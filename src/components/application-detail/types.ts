import type { getPublishedApplicationBySlug } from "@/lib/apps-data";

export type PublishedApplication = NonNullable<Awaited<ReturnType<typeof getPublishedApplicationBySlug>>>;
export type ApplicationMedia = PublishedApplication["media"][number];
