import { BLOG_OG_SIZE, createBlogOgImage } from "@/components/blog/blog-og-card";

export const size = BLOG_OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return createBlogOgImage({ title: "Best dictation apps", titleLineTwo: "for Mac" });
}
