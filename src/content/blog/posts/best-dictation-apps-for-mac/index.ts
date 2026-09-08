import { dictationAppSlugs } from "./comparison";
import type { BlogPostDefinition } from "../../types";

export const bestDictationAppsPost = {
  appSlugs: dictationAppSlugs,
  category: "App comparisons",
  description: "Six Mac dictation apps compared by price, privacy, offline support, meeting transcription, and everyday use.",
  image: {
    alt: "Best dictation apps for Mac, compared by Macify",
    path: "/best-dictation-apps-for-mac/opengraph-image",
    title: "Best dictation apps",
    titleLineTwo: "for Mac",
  },
  kind: "comparison",
  path: "/best-dictation-apps-for-mac",
  publishedAt: "2026-09-08",
  readTimeMinutes: 12,
  seo: {
    description: "Compare the best dictation apps for Mac by pricing, offline support, languages, file transcription, custom vocabulary, and everyday fit.",
    socialDescription: "Six Mac dictation apps compared with clear feature checks and practical editorial guidance.",
    title: "Best Dictation Apps for Mac in 2026",
    twitterDescription: "Six Mac dictation apps compared by the differences that matter.",
  },
  slug: "best-dictation-apps-for-mac",
  structuredData: {
    about: "Mac dictation software",
    breadcrumb: { name: "Dictation", path: "/categories/dictation" },
  },
  title: "Best dictation apps for Mac",
  updatedAt: "2026-09-08",
} satisfies BlogPostDefinition;
