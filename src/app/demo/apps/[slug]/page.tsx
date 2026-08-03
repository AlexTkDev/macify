import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Code2, Laptop, WalletCards } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MacifyLogo } from "@/components/macify-logo";
import { demoApplications, getDemoApplication, getDemoRelatedApplications } from "@/lib/demo-apps";

export const dynamic = "force-dynamic";

export default async function DemoApplicationPage({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { slug } = await params;
  const application = getDemoApplication(slug);
  if (!application) notFound();
  const related = getDemoRelatedApplications(application.slug);
  return <div className="site-shell app-detail-shell"><header className="site-header"><MacifyLogo /><nav className="primary-nav"><Link className="nav-link" href="/">Directory</Link><Link className="nav-link nav-link-active" href="/demo">Demo data</Link></nav><div className="header-actions"><Link className="text-action" href="/dashboard">Dashboard</Link></div></header><main className="app-detail"><nav className="app-detail-breadcrumbs"><Link href="/demo"><ArrowLeft size={14} /> Demo directory</Link><span>/</span><span>{application.category}</span></nav><section className="app-detail-hero"><div className="app-detail-identity"><span className="app-detail-icon app-detail-icon-fallback" aria-hidden="true">{application.name.slice(0, 2).toUpperCase()}</span><div><p className="app-kicker">{application.category} · Local fixture</p><h1>{application.name}</h1><p className="app-detail-tagline">{application.tagline}</p><div className="app-detail-tags">{application.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div></section><div className="app-detail-grid"><article className="app-detail-content"><section><p className="app-detail-section-label">Overview</p><h2>What {application.name} does</h2><p className="app-detail-summary">{application.summary}</p><div className="app-detail-prose markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{application.description}</ReactMarkdown></div></section></article><aside className="app-detail-sidebar"><dl className="app-detail-facts"><div><dt><WalletCards size={15} /> Pricing</dt><dd>{application.pricing}</dd></div><div><dt><Code2 size={15} /> Source</dt><dd>{application.source}</dd></div><div><dt><Laptop size={15} /> Compatibility</dt><dd>{application.minimumMacos}</dd></div></dl></aside></div><section className="related-apps"><div className="section-heading"><div><h2>Related applications</h2><p>Mutual fixture relationships for testing navigation.</p></div></div><div className="related-app-grid">{related.map((app) => <Link href={`/demo/apps/${app.slug}`} key={app.slug}><span className="related-app-mark">{app.name.slice(0, 2).toUpperCase()}</span><span><strong>{app.name}</strong><small>{app.tagline}</small></span><ArrowUpRight size={16} /></Link>)}</div></section></main><footer className="site-footer"><MacifyLogo /><p>{demoApplications.length} development-only applications.</p><nav><Link href="/demo">Demo directory</Link></nav></footer></div>;
}
