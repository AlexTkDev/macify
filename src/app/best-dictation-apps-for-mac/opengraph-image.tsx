import { BLOG_OG_SIZE, createBlogOgImage } from "@/components/blog/blog-og-card";
import { bestDictationAppsPost } from "@/content/blog/posts/best-dictation-apps-for-mac";

export const size = BLOG_OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return createBlogOgImage(bestDictationAppsPost.image);
}
