import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { DashboardNotice } from "@/components/dashboard-notice";
import { DashboardShell } from "@/components/dashboard-shell";
import { getMediaManagementData } from "@/lib/dashboard-data";
import { deleteMediaAsset } from "../manage-actions";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = { icon: "Icon", preview_image: "Main preview", screenshot: "Screenshot" };
const mediaUrl = (key: string) => `/dashboard/media/${key.split("/").map(encodeURIComponent).join("/")}`;
const bytes = (value: number) => value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ records, totals }, query] = await Promise.all([getMediaManagementData(), searchParams]);
  return (
    <DashboardShell active="media">
      <header className="dashboard-header"><div><p>R2 asset inventory</p><h1>Media</h1></div><div className="dashboard-actions"><span className="storage-summary">{totals.count} files · {bytes(Number(totals.bytes))}</span></div></header>
      <DashboardNotice error={query.error} success={query.success} />
      <section className="dashboard-panel media-management-panel" aria-labelledby="media-list-heading">
        <div className="panel-toolbar"><div><h2 id="media-list-heading">Stored application media</h2><p>Every item is referenced in D1 and served through Macify’s controlled R2 route.</p></div></div>
        {records.length === 0 ? <div className="dashboard-empty"><h3>No media stored</h3><p>Upload media from an application’s edit page.</p></div> : (
          <div className="media-management-grid">
            {records.map((asset) => (
              <article className="media-management-item" key={asset.id}>
                <div className={asset.role === "icon" ? "media-management-preview media-management-icon" : "media-management-preview"}>
                  <Image alt={asset.altText || `${asset.appName ?? "Application"} ${labels[asset.role] ?? "media"}`} fill sizes="(max-width: 720px) 100vw, 280px" src={mediaUrl(asset.storageKey)} unoptimized />
                </div>
                <div className="media-management-copy">
                  <span>{labels[asset.role] ?? asset.role}</span><strong>{asset.appName ?? "Orphaned asset"}</strong><small>{asset.mimeType} · {bytes(asset.byteSize)}</small>
                  <div>
                    <span className="media-management-links">{asset.appId && <Link href={`/dashboard/apps/${asset.appId}/edit`}><ExternalLink size={13} /> Edit app</Link>}{asset.sourceUrl && <a href={asset.sourceUrl} rel="noreferrer" target="_blank">Source URL</a>}</span>
                    <details className="delete-control"><summary aria-label="Delete media"><Trash2 size={14} /></summary><form action={deleteMediaAsset}><input name="id" type="hidden" value={asset.id} /><span>Delete from R2 and D1?</span><button type="submit">Confirm delete</button></form></details>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
