import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { MacifyLogo } from "@/components/macify-logo";
import { getCategoryDirectoryData } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "macOS app categories",
  description: "Browse Macify's carefully organized directory of useful macOS applications by category.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategoryDirectoryData();

  return (
    <div className="site-shell">
      <header className="site-header">
        <MacifyLogo />
        <nav className="primary-nav" aria-label="Primary navigation"><Link className="nav-link" href="/">Discover</Link><Link className="nav-link nav-link-active" href="/categories">Categories</Link></nav>
        <div className="header-actions"><Link className="command-button" href="/?search=1"><Search size={16} /><span>Search apps</span></Link></div>
      </header>
      <main className="category-directory">
        <Link className="back-link" href="/"><ArrowLeft size={14} /> Directory</Link>
        <header><p className="app-kicker">Browse Macify</p><h1>Application categories</h1><span>Explore useful macOS software by the job it helps you accomplish.</span></header>
        <div className="category-directory-grid">
          {categories.map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.id}>
              <span><strong>{category.name}</strong><small>{category.description}</small></span>
              <span>{category.publishedCount} {category.publishedCount === 1 ? "app" : "apps"} <ArrowUpRight size={15} /></span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
