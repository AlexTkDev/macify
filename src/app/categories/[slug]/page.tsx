import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { MacifyLogo } from "@/components/macify-logo";
import { getPublishedCategoryBySlug } from "@/lib/apps-data";
import { formatPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";
const getCategory = cache(getPublishedCategoryBySlug);

function mediaUrl(storageKey: string) {
  return `/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} apps for macOS`,
    description: category.description ?? `Browse useful ${category.name.toLowerCase()} applications for macOS.`,
    alternates: { canonical: `/categories/${category.slug}` },
    robots: category.applications.length ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <div className="site-shell">
      <header className="site-header">
        <MacifyLogo />
        <nav className="primary-nav" aria-label="Primary navigation"><Link className="nav-link" href="/">Discover</Link><Link className="nav-link nav-link-active" href="/categories">Categories</Link></nav>
        <div className="header-actions"><Link className="command-button" href="/?search=1"><Search size={16} /><span>Search apps</span></Link></div>
      </header>
      <main className="category-directory category-detail-page">
        <Link className="back-link" href="/categories"><ArrowLeft size={14} /> All categories</Link>
        <header><p className="app-kicker">macOS applications</p><h1>{category.name}</h1><span>{category.description}</span></header>
        {category.applications.length ? (
          <div className="category-app-grid">
            {category.applications.map((app) => (
              <Link href={`/apps/${app.slug}`} key={app.id}>
                {app.icon ? <Image alt={app.icon.altText ?? `${app.name} icon`} height={58} src={mediaUrl(app.icon.storageKey)} unoptimized width={58} /> : <span className="category-app-fallback" aria-hidden="true">{app.name.slice(0, 2).toUpperCase()}</span>}
                <span><strong>{app.name}</strong><small>{app.tagline}</small><em>{formatPricing(app)}</em></span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="public-catalog-empty"><span aria-hidden="true">M</span><h3>No published picks in this category yet.</h3><p>Applications appear here only after every editorial check passes.</p></div>
        )}
      </main>
    </div>
  );
}
