import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { MediaUploadForm } from "@/components/media-upload-form";
import { PublicationControl } from "@/components/publication-control";
import { getApplicationEditorData, getEditorialOptions } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  icon: "Application icon",
  preview_image: "Main preview image",
  screenshot: "Screenshot",
};

function mediaUrl(storageKey: string) {
  return `/dashboard/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function EditApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; published?: string; draft?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [{ application, media }, options] = await Promise.all([
    getApplicationEditorData(id),
    getEditorialOptions(id),
  ]);
  if (!application) notFound();

  return (
    <DashboardShell active="applications">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard">Applications</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{application.name}</span>
      </nav>

      <header className="editor-header editor-header-row">
        <div>
          <p>{application.status} record</p>
          <h1>{application.name}</h1>
          <span>Update editorial details and keep media referenced through R2 storage keys.</span>
        </div>
        <div className="editor-header-actions">
          <a className="button-secondary" href={application.websiteUrl} rel="noreferrer" target="_blank">
            Visit website <ExternalLink size={15} />
          </a>
          <PublicationControl appId={application.id} slug={application.slug} status={application.status} />
        </div>
      </header>

      {query.saved === "1" && (
        <div className="success-banner" role="status">
          <span aria-hidden="true">✓</span>
          Changes saved in local D1.
        </div>
      )}
      {query.created === "1" && (
        <div className="success-banner" role="status"><span aria-hidden="true">✓</span>Draft created. Add its required media below.</div>
      )}
      {query.published === "1" && (
        <div className="success-banner" role="status"><span aria-hidden="true">✓</span>Application published.</div>
      )}
      {query.draft === "1" && (
        <div className="success-banner" role="status"><span aria-hidden="true">✓</span>Application returned to draft.</div>
      )}

      <ApplicationForm
        application={application}
        mode="edit"
        relatedApplications={options.relatedApplications}
        categories={options.categories}
      />

      <section className="media-editor" aria-labelledby="media-heading">
        <div className="media-editor-heading">
          <div>
            <h2 id="media-heading">Media library</h2>
            <span>Files are private R2 objects served through Macify’s controlled media route.</span>
          </div>
          <strong>{media.length} stored</strong>
        </div>

        {media.length > 0 && (
          <div className="media-library">
            {media.map((asset) => (
              <article className="media-asset" key={asset.id}>
                <div className={asset.role === "icon" ? "media-preview media-preview-icon" : "media-preview"}>
                  <Image
                    alt={asset.altText || `${application.name} ${roleLabels[asset.role] ?? "media"}`}
                    height={asset.role === "icon" ? 160 : 360}
                    src={mediaUrl(asset.storageKey)}
                    unoptimized
                    width={asset.role === "icon" ? 160 : 640}
                  />
                </div>
                <div className="media-asset-meta">
                  <strong>{roleLabels[asset.role] ?? asset.role}</strong>
                  <span>{asset.mimeType} · {formatBytes(asset.byteSize)}</span>
                  {asset.altText && <p>{asset.altText}</p>}
                  {asset.sourceUrl && <a className="media-origin-link" href={asset.sourceUrl} rel="noreferrer" target="_blank">View original source <ExternalLink size={12} /></a>}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="media-upload-grid">
          <MediaUploadForm
            accept="image/png,image/jpeg,image/webp,image/avif"
            appId={application.id}
            description="Square artwork used in lists and application headers."
            label="Application icon"
            role="icon"
          />
          <MediaUploadForm
            accept="image/png,image/jpeg,image/webp,image/avif"
            appId={application.id}
            description="Wide editorial image displayed as the main visual on the public application page."
            label="Main preview image"
            role="preview_image"
          />
          <MediaUploadForm
            accept="image/png,image/jpeg,image/webp,image/avif"
            appId={application.id}
            description="Product interface or workflow screenshot. Multiple allowed."
            label="Screenshot"
            role="screenshot"
          />
        </div>
      </section>
    </DashboardShell>
  );
}
