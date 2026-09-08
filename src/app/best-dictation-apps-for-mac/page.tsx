import type { Metadata } from "next";
import { DictationGuide } from "@/components/best-apps/dictation-comparison";
import { PublicShell } from "@/components/public-site";
import { getPublishedDictationApps } from "@/lib/best-dictation-apps";

export const dynamic = "force-dynamic";
const canonical = "/best-dictation-apps-for-mac";
const canonicalUrl = `https://macify.app${canonical}`;
const socialImage = `${canonicalUrl}/opengraph-image`;

export const metadata: Metadata = {
  title: "Best Dictation Apps for Mac in 2026",
  description: "Compare the best dictation apps for Mac by pricing, offline support, languages, file transcription, custom vocabulary, and everyday fit.",
  authors: [{ name: "Macify Editorial", url: "https://macify.app/editorial-policy" }],
  creator: "Macify Editorial",
  publisher: "Macify",
  alternates: { canonical },
  openGraph: {
    type: "article",
    siteName: "Macify",
    title: "Best Dictation Apps for Mac in 2026",
    description: "Six Mac dictation apps compared with clear feature checks and practical editorial guidance.",
    url: canonical,
    images: [{ url: socialImage, width: 1200, height: 630, alt: "Best dictation apps for Mac, compared by Macify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Dictation Apps for Mac in 2026",
    description: "Six Mac dictation apps compared by the differences that matter.",
    images: [socialImage],
  },
};

export default async function BestDictationAppsPage() {
  const apps = await getPublishedDictationApps();
  const reviewedAt = "September 8, 2026";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: "Best Dictation Apps for Mac in 2026",
        description: metadata.description,
        image: socialImage,
        datePublished: "2026-09-08",
        dateModified: "2026-09-08",
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
        author: { "@type": "Organization", name: "Macify Editorial", url: "https://macify.app/editorial-policy" },
        publisher: { "@type": "Organization", name: "Macify", url: "https://macify.app" },
        about: { "@type": "Thing", name: "Mac dictation software" },
        mainEntity: { "@id": `${canonicalUrl}#app-list` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mac apps", item: "https://macify.app" },
          { "@type": "ListItem", position: 2, name: "Dictation", item: "https://macify.app/categories/dictation" },
          { "@type": "ListItem", position: 3, name: "Best dictation apps for Mac", item: canonicalUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#app-list`,
        name: "Best Dictation Apps for Mac",
        description: metadata.description,
        numberOfItems: apps.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: apps.map((app, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: app.name,
          url: `https://macify.app/apps/${app.slug}`,
        })),
      },
    ],
  };

  return (
    <PublicShell>
      <main className="best-apps-page" id="main-content">
        {apps.length > 0 ? <DictationGuide apps={apps as Parameters<typeof DictationGuide>[0]["apps"]} reviewedAt={reviewedAt} /> : (
          <section className="best-apps-empty"><h2>Comparison unavailable.</h2><p>The dictation apps have not been published to this catalogue yet.</p></section>
        )}
      </main>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} type="application/ld+json" />
    </PublicShell>
  );
}
