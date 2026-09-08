import { bestDictationAppsPost } from "./posts/best-dictation-apps-for-mac";
import type { BlogPostDefinition } from "./types";

const registeredBlogPosts = [bestDictationAppsPost] satisfies readonly BlogPostDefinition[];

export function getAllBlogPosts(): readonly BlogPostDefinition[] {
  return [...registeredBlogPosts].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getBlogPost(slug: string): BlogPostDefinition | undefined {
  return registeredBlogPosts.find((post) => post.slug === slug);
}

