export type BlogPostKind = "comparison" | "review" | "guide";

export type BlogPostImage = {
  alt: string;
  path: string;
  title: string;
  titleLineTwo?: string;
};

export type BlogPostDefinition = {
  appSlugs?: readonly string[];
  category: string;
  description: string;
  image: BlogPostImage;
  kind: BlogPostKind;
  path: `/${string}`;
  publishedAt: `${number}-${number}-${number}`;
  readTimeMinutes: number;
  seo?: {
    description?: string;
    socialDescription?: string;
    title?: string;
    twitterDescription?: string;
  };
  slug: string;
  structuredData?: {
    about?: string;
    breadcrumb?: { name: string; path: `/${string}` };
  };
  title: string;
  updatedAt: `${number}-${number}-${number}`;
};
