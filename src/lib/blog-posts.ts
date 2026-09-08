export type BlogPostSummary = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
};

export const blogPosts: BlogPostSummary[] = [
  {
    slug: "best-dictation-apps-for-mac",
    title: "Best dictation apps for Mac",
    description: "Six Mac dictation apps compared by price, privacy, offline support, meeting transcription, and everyday use.",
    category: "App comparisons",
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
  },
];

