import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { notFound } from "next/navigation";
import { MacifyLogo } from "@/components/macify-logo";
import { demoApplications, demoCategories } from "@/lib/demo-apps";

export const dynamic = "force-dynamic";

export default function DemoDirectoryPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="site-shell demo-shell">
      <header className="site-header"><MacifyLogo /><nav className="primary-nav"><Link className="nav-link" href="/">Directory</Link><span className="nav-link nav-link-active">Demo data</span></nav><div className="header-actions"><Link className="text-action" href="/dashboard">Dashboard</Link></div></header>
      <main className="demo-directory">
        <header className="demo-header"><span><FlaskConical size={16} /> Local fixture</span><h1>Test the directory with twelve fictional apps.</h1><p>This content lives only in source code. It never touches D1 or R2 and is unavailable in production.</p></header>
        <nav className="category-rail demo-category-rail" aria-label="Demo categories">{demoCategories.map((category) => <a href={`#${category.toLowerCase()}`} key={category}>{category}</a>)}</nav>
        {demoCategories.map((category) => <section className="demo-category-section" id={category.toLowerCase()} key={category}><div className="section-heading"><div><h2>{category}</h2><p>{demoApplications.filter((app) => app.category === category).length} fictional applications</p></div></div><div className="demo-app-grid">{demoApplications.filter((app) => app.category === category).map((app, index) => <Link href={`/demo/apps/${app.slug}`} key={app.slug}><span className={`app-icon app-icon-small app-icon-${["amber", "blue", "purple", "green", "red", "graphite"][index % 6]}`} aria-hidden="true">{app.name.slice(0, 2).toUpperCase()}</span><span><strong>{app.name}</strong><small>{app.tagline}</small><em>{app.pricing}</em></span><ArrowUpRight size={16} /></Link>)}</div></section>)}
      </main>
      <footer className="site-footer"><MacifyLogo /><p>Development-only catalog fixtures.</p><nav><Link href="/dashboard">Dashboard</Link></nav></footer>
    </div>
  );
}
