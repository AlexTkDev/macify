import { BLOG_OG_SIZE, createBlogOgImage } from "@/components/blog/blog-og-card";
import { bestDictationAppsPost } from "@/content/blog/posts/best-dictation-apps-for-mac";
import { getBlogPost } from "@/content/blog";
import { notFound } from "next/navigation";

export const size = BLOG_OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  if (!getBlogPost(bestDictationAppsPost.slug)) notFound();
  return createBlogOgImage(bestDictationAppsPost.image);
}
