import type { getPublishedApplicationBySlug } from "@/lib/published-app-data";

export type PublishedApplication = NonNullable<Awaited<ReturnType<typeof getPublishedApplicationBySlug>>>;
export type ApplicationMedia = PublishedApplication["media"][number];
