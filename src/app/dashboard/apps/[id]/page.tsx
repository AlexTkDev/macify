import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, SlidersHorizontal } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { MarkdownContent } from "@/components/markdown-content";
import { getApplicationEditorData } from "@/lib/apps-data";
import { formatPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function mediaUrl(storageKey: string) {
  return `/dashboard/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { application, media } = await getApplicationEditorData(id);
  if (!application) notFound();

  const icon = media.find((asset) => asset.role === "icon");
  const preview = media.find((asset) => asset.role === "preview_image");
  const categories = application.categoriesText.split(",").map((category) => category.trim()).filter(Boolean);

  return (
    <DashboardShell active="applications">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard"><ArrowLeft size={14} /> Applications</Link>
        <span aria-current="page">{application.name}</span>
      </nav>

      <header className="dashboard-detail-header">
        <div className="dashboard-detail-identity">
          {icon ? (
            <Image alt={icon.altText ?? `${application.name} icon`} className="dashboard-detail-icon" height={84} src={mediaUrl(icon.storageKey)} unoptimized width={84} />
          ) : (
            <span className="dashboard-detail-icon dashboard-detail-icon-fallback" aria-hidden="true">{application.name.slice(0, 2).toUpperCase()}</span>
          )}
          <div>
            <div className="dashboard-detail-status">
              <span className={cn(application.status === "published" ? "published-badge" : "draft-badge")}>
                {application.status === "published" ? "Published" : application.status === "archived" ? "Archived" : "Not public"}
              </span>
              <span>/{application.slug}</span>
            </div>
            <h1>{application.name}</h1>
            <p>{application.tagline}</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <a className="button-secondary" href={application.websiteUrl} rel="noreferrer" target="_blank">Website <ExternalLink size={15} /></a>
          <Link className="button-primary" href={`/dashboard/apps/${application.id}/edit`}><SlidersHorizontal size={15} /> Publication and placement</Link>
        </div>
      </header>

      <div className="dashboard-detail-layout">
        <article className="dashboard-detail-content">
          {preview && (
            <div className="dashboard-detail-preview">
              <Image alt={preview.altText ?? `${application.name} preview`} fill sizes="(max-width: 900px) 100vw, 70vw" src={mediaUrl(preview.storageKey)} unoptimized />
            </div>
          )}
          <section aria-labelledby="description-heading">
            <h2 id="description-heading">About {application.name}</h2>
            <MarkdownContent>{application.description}</MarkdownContent>
          </section>
        </article>

        <aside className="dashboard-detail-sidebar" aria-label="Application details">
          <section className="dashboard-detail-facts">
            <h2>Application information</h2>
            <dl>
              <div><dt>Pricing</dt><dd>{formatPricing(application)}</dd></div>
              {application.billingType && <div><dt>Billing</dt><dd>{application.billingType === "one_time" ? "One-time payment" : "Subscription"}</dd></div>}
              <div><dt>Source</dt><dd>{application.sourceType === "open_source" ? "Open source" : "Closed source"}</dd></div>
            </dl>
          </section>

          {categories.length > 0 && (
            <section className="dashboard-detail-facts dashboard-detail-group">
              <h2>Categories</h2>
              <div className="dashboard-detail-categories">{categories.map((category) => <span key={category}>{category}</span>)}</div>
            </section>
          )}

        </aside>
      </div>
    </DashboardShell>
  );
}
