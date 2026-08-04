import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DirectoryAppGrid } from "@/components/home/application-directory";
import { PublicShell } from "@/components/public-site";
import { getPublishedTagBySlug } from "@/lib/tag-directory-data";

export const dynamic = "force-dynamic";
const getTag = cache(getPublishedTagBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tag = await getTag((await params).slug);
  if (!tag) return {};
  const title = `${tag.name} apps for Mac`;
  const description = `Explore ${tag.applications.length} carefully selected Mac ${tag.name.toLowerCase()} ${tag.applications.length === 1 ? "app" : "apps"}.`;
  const canonical = `/tags/${tag.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", siteName: "Macify", title, description, url: canonical },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const tag = await getTag((await params).slug);
  if (!tag) notFound();
  const count = tag.applications.length;

  return (
    <PublicShell>
      <main className="tag-page" id="main-content">
        <header className="tag-page-header">
          <h1><span className="tag-page-mark" aria-hidden="true" />{tag.name}<span className="tag-page-period">.</span></h1>
          <p>{count} {count === 1 ? "app" : "apps"}</p>
        </header>
        {count > 0 ? <DirectoryAppGrid applications={tag.applications} /> : (
          <div className="tag-page-empty"><p>No published apps use this tag yet.</p></div>
        )}
      </main>
    </PublicShell>
  );
}
