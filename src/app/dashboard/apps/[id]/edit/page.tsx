import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { removeApplicationDeal, saveApplicationDeal, setFeaturedApplication } from "@/app/dashboard/editorial-actions";
import { getApplicationEditorData } from "@/lib/apps-data";

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
  searchParams: Promise<{ featured?: string; dealSaved?: string; dealRemoved?: string; dealError?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const database = await getDatabase();
  const [{ application, media }, dealRows] = await Promise.all([
    getApplicationEditorData(id),
    database.select().from(deals).where(eq(deals.appId, id)).limit(1),
  ]);
  if (!application) notFound();
  const deal = dealRows[0];

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
          <span>Manage dashboard-only placement and deals. Catalogue content is reviewed through GitHub revisions.</span>
        </div>
        <div className="editor-header-actions">
          <a className="button-secondary" href={application.websiteUrl} rel="noreferrer" target="_blank">
            Visit website <ExternalLink size={15} />
          </a>
        </div>
      </header>
      {query.featured === "1" && <div className="success-banner" role="status">✓ Featured placement updated.</div>}
      {query.dealSaved === "1" && <div className="success-banner" role="status">✓ Deal saved.</div>}
      {query.dealRemoved === "1" && <div className="success-banner" role="status">✓ Deal removed.</div>}
      {query.dealError === "1" && <div className="form-error" role="alert">Check the discount, HTTPS URL, and date range.</div>}

      <section className="dashboard-panel editorial-controls" aria-labelledby="editorial-controls-heading">
        <div className="media-editor-heading">
          <div><h2 id="editorial-controls-heading">Editorial placement</h2><span>These settings live only in D1 and cannot be changed by GitHub contributions.</span></div>
        </div>
        <div className="editorial-control-grid">
          <form action={setFeaturedApplication} className="editorial-control-card">
            <input name="appId" type="hidden" value={application.id} />
            <h3>Featured application</h3>
            <p>Give this application a distinct featured treatment in the public directory.</p>
            <button className={application.isFeatured ? "button-secondary" : "button-primary"} name="featured" type="submit" value={application.isFeatured ? "false" : "true"}>
              {application.isFeatured ? "Remove featured status" : "Feature application"}
            </button>
          </form>
          <form action={saveApplicationDeal} className="editorial-control-card editorial-deal-form">
            <input name="appId" type="hidden" value={application.id} />
            <h3>Deal</h3>
            <label>Discount percentage<input defaultValue={deal?.discountPercent ?? ""} max="100" min="1" name="discountPercent" required type="number" /></label>
            <label>Code <span>(optional)</span><input defaultValue={deal?.code ?? ""} maxLength={80} name="code" /></label>
            <label>Deal URL<input defaultValue={deal?.url ?? ""} name="url" required type="url" /></label>
            <div className="editorial-date-grid">
              <label>Starts<input defaultValue={toDateTimeInput(deal?.startsAt)} name="startsAt" required type="datetime-local" /></label>
              <label>Ends<input defaultValue={toDateTimeInput(deal?.endsAt)} name="endsAt" required type="datetime-local" /></label>
            </div>
            <div className="catalogue-revision-actions">
              <button className="button-primary" type="submit">Save deal</button>
            </div>
          </form>
          {deal && <form action={removeApplicationDeal}><input name="appId" type="hidden" value={application.id} /><button className="button-secondary" type="submit">Remove current deal</button></form>}
        </div>
      </section>

      <section className="media-editor" aria-labelledby="media-heading">
        <div className="media-editor-heading">
          <div>
            <h2 id="media-heading">Media library</h2>
            <span>Read-only R2 assets synchronized from the application’s GitHub manifest.</span>
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
      </section>
    </DashboardShell>
  );
}

function toDateTimeInput(value: Date | null | undefined) {
  if (!value) return "";
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
