import type { Metadata } from "next";
import type { BlogPostDefinition } from "./types";

const siteUrl = "https://macify.app";

export function createBlogPostMetadata(post: BlogPostDefinition): Metadata {
  const socialImage = `${siteUrl}${post.image.path}`;
  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.description;
  return {
    title,
    description,
    authors: [{ name: "Macify Editorial", url: `${siteUrl}/editorial-policy` }],
    creator: "Macify Editorial",
    publisher: "Macify",
    alternates: { canonical: post.path },
    openGraph: {
      type: "article",
      siteName: "Macify",
      title,
      description: post.seo?.socialDescription ?? description,
      url: post.path,
      images: [{ url: socialImage, width: 1200, height: 630, alt: post.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.seo?.twitterDescription ?? post.seo?.socialDescription ?? description,
      images: [socialImage],
    },
  };
}

export function createBlogPostSchema(post: BlogPostDefinition, itemNames: readonly string[] = []) {
  const canonicalUrl = `${siteUrl}${post.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: post.title,
        description: post.description,
        image: `${siteUrl}${post.image.path}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
        author: { "@type": "Organization", name: "Macify Editorial", url: `${siteUrl}/editorial-policy` },
        publisher: { "@type": "Organization", name: "Macify", url: siteUrl },
        about: post.structuredData?.about ? { "@type": "Thing", name: post.structuredData.about } : undefined,
        mainEntity: itemNames.length > 0 ? { "@id": `${canonicalUrl}#app-list` } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mac apps", item: siteUrl },
          { "@type": "ListItem", position: 2, name: post.structuredData?.breadcrumb?.name ?? "Blog", item: `${siteUrl}${post.structuredData?.breadcrumb?.path ?? "/blog"}` },
          { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
        ],
      },
      ...(itemNames.length > 0 ? [{
        "@type": "ItemList",
        "@id": `${canonicalUrl}#app-list`,
        name: post.title,
        description: post.description,
        numberOfItems: itemNames.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: itemNames.map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          url: `${siteUrl}/apps/${post.appSlugs?.[index] ?? ""}`,
        })),
      }] : []),
    ],
  };
}
