import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-site";
import { getPublishedCategories } from "@/lib/category-directory-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mac app categories",
  description: "Browse Macify's curated Mac applications by category.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getPublishedCategories();
  return <PublicShell>
    <main className="category-page" id="main-content">
      <header className="category-page-header">
        <h1><span className="category-page-mark" aria-hidden="true" /><span className="category-page-title">Categories<span className="category-page-period">.</span></span></h1>
        <p>Explore apps by what they help you do.</p>
      </header>
      <div className="category-index-grid">
        {categories.map((category) => <Link href={`/categories/${category.slug}`} key={category.id}>
          <strong>{category.name}</strong><span>{category.applicationCount} {category.applicationCount === 1 ? "app" : "apps"}</span>
        </Link>)}
      </div>
    </main>
  </PublicShell>;
}
