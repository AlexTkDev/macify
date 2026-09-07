import Image from "next/image";
import Link from "next/link";
import { desc, like, sql } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, GitBranch, PlusCircle, RefreshCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { catalogueRevisions } from "@/db/schema";
import { catalogueManifestSchema } from "@/lib/catalogue-manifest";
import type { CatalogueManifest } from "@/lib/catalogue-manifest";
import { revisionChangeLabels, revisionStatusLabels } from "@/lib/catalogue-revision-labels";
import { getCatalogueQueueApplications } from "@/lib/catalogue-review-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "That review request was invalid.",
  "not-pending": "That revision has already been reviewed.",
  "missing-app": "The application linked to this archive request no longer exists.",
  "invalid-manifest": "The stored manifest is invalid and cannot be published.",
  "missing-related-app": "Publish the related applications first, or remove those relationships in GitHub.",
  "missing-media": "The revision is missing its required icon or preview image.",
  "stale-revision": "A newer revision exists for this application. Review the newest revision instead.",
};

type View = "pending" | "history" | "failed";

export default async function CatalogueReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; rejected?: string; error?: string; view?: string }>;
}) {
  const query = await searchParams;
  const view: View = query.view === "history" || query.view === "failed" ? query.view : "pending";
  const database = await getDatabase();
  const [recentRevisions, countRows] = await Promise.all([
    database.select().from(catalogueRevisions).where(like(catalogueRevisions.sourcePath, "catalog/apps/%"))
      .orderBy(desc(catalogueRevisions.createdAt)).limit(200),
    database.select({
      pending: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' then 1 else 0 end), 0)`,
      create: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' and ${catalogueRevisions.changeType} = 'create' then 1 else 0 end), 0)`,
      update: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' and ${catalogueRevisions.changeType} = 'update' then 1 else 0 end), 0)`,
      failed: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'failed' then 1 else 0 end), 0)`,
    }).from(catalogueRevisions).where(like(catalogueRevisions.sourcePath, "catalog/apps/%")),
  ]);
  const revisions = recentRevisions.filter((revision) => (
    view === "pending" ? revision.status === "pending"
      : view === "failed" ? revision.status === "failed"
        : revision.status === "published" || revision.status === "rejected"
  )).slice(0, 100);
  const applications = await getCatalogueQueueApplications(
    revisions.flatMap(({ appId }) => appId ? [appId] : []),
  );
  const counts = countRows[0] ?? { pending: 0, create: 0, update: 0, failed: 0 };

  return (
    <DashboardShell active="catalogue">
      <header className="editor-header editor-header-row">
        <div>
          <p>GitHub updates</p>
          <h1>Review queue</h1>
          <span>See exactly what changed before any merged application update reaches the public directory.</span>
        </div>
      </header>

      <nav className="catalogue-kind-tabs" aria-label="Catalogue review type">
        <Link aria-current="page" className="active" href="/dashboard/catalogue">Applications</Link>
        <Link href="/dashboard/catalogue/deals">Deals</Link>
      </nav>

      <section className="catalogue-queue-stats" aria-label="Review queue status">
        <div><GitBranch size={18} /><span>Awaiting review</span><strong>{counts.pending}</strong></div>
        <div><PlusCircle size={18} /><span>New applications</span><strong>{counts.create}</strong></div>
        <div><RefreshCcw size={18} /><span>Application updates</span><strong>{counts.update}</strong></div>
        <div><AlertTriangle size={18} /><span>Sync failures</span><strong>{counts.failed}</strong></div>
      </section>

      {query.published === "1" && <div className="success-banner" role="status"><CheckCircle2 size={17} /> Revision published.</div>}
      {query.rejected === "1" && <div className="success-banner" role="status"><CheckCircle2 size={17} /> Revision rejected. The public listing was not changed.</div>}
      {query.error && <div className="form-error" role="alert">{errorMessages[query.error] ?? "The revision could not be reviewed."}</div>}

      <section className="dashboard-panel catalogue-queue-panel" aria-labelledby="revisions-heading">
        <div className="catalogue-queue-toolbar">
          <div>
            <h2 id="revisions-heading">{viewLabel(view)}</h2>
            <p>{viewDescription(view)}</p>
          </div>
          <nav className="catalogue-view-tabs" aria-label="Review queue views">
            <Link className={cn(view === "pending" && "active")} href="/dashboard/catalogue">Pending <span>{counts.pending}</span></Link>
            <Link className={cn(view === "history" && "active")} href="/dashboard/catalogue?view=history">History</Link>
            <Link className={cn(view === "failed" && "active")} href="/dashboard/catalogue?view=failed">Failed <span>{counts.failed}</span></Link>
          </nav>
        </div>
        {revisions.length === 0 ? (
          <div className="catalogue-queue-empty">
            <CheckCircle2 aria-hidden="true" size={24} />
            <strong>{view === "pending" ? "Everything is reviewed" : "No revisions in this view"}</strong>
            <span>{view === "pending" ? "New merged GitHub changes will appear here automatically." : "Choose another queue view to continue."}</span>
          </div>
        ) : (
          <div className="catalogue-revision-list">
            {revisions.map((revision) => {
              const manifestResult = catalogueManifestSchema.safeParse(revision.manifest);
              const manifest = manifestResult.success ? manifestResult.data : null;
              const current = revision.appId ? applications.get(revision.appId) : null;
              const icon = revision.preparedMedia.find(({ role }) => role === "icon")
                ?? current?.media.find(({ role }) => role === "icon");
              const summary = revision.status === "pending"
                ? summarizeRevision(manifest, current ?? null, revision.preparedMedia)
                : `${revisionChangeLabels[revision.changeType]} revision ${revisionStatusLabels[revision.status].toLowerCase()}.`;
              return (
                <article className="catalogue-revision" key={revision.id}>
                  <div className="catalogue-revision-identity">
                    <div className="catalogue-revision-icon">
                      {icon ? <Image alt={manifest?.name ? `${manifest.name} icon` : "Application icon"} height={48} src={mediaUrl(icon.storageKey)} unoptimized width={48} />
                        : <span aria-hidden="true">{(manifest?.name ?? revision.appSlug).slice(0, 1).toUpperCase()}</span>}
                    </div>
                    <div>
                      <div className="catalogue-revision-meta">
                        <span>{revisionChangeLabels[revision.changeType]}</span>
                        <span data-status={revision.status}>{revisionStatusLabels[revision.status]}</span>
                      </div>
                      <h3>{manifest?.name ?? revision.appSlug}</h3>
                      <p>{summary}</p>
                      <small>{revision.createdAt.toLocaleString()} · commit {revision.sourceCommitSha.slice(0, 8)}</small>
                    </div>
                  </div>
                  <div className="catalogue-revision-actions">
                    {revision.appId && <Link className="button-secondary" href={`/dashboard/apps/${revision.appId}`}>Current listing</Link>}
                    <Link className={revision.status === "pending" ? "button-primary" : "button-secondary"} href={`/dashboard/catalogue/${revision.id}`}>
                      {revision.status === "pending" ? "Review changes" : "View revision"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}

function summarizeRevision(
  manifest: CatalogueManifest | null,
  current: {
    name: string;
    slug: string;
    websiteUrl: string;
    tagline: string;
    description: string;
    pricingType: string;
    billingType: string | null;
    pricingDetails: string | null;
    sourceType: string;
    youtubeUrl: string | null;
    media: Array<{ role: string; checksum: string }>;
  } | null,
  proposedMedia: Array<{ role: string; checksum: string }>,
) {
  if (!manifest) return "Application removal or a revision without a valid manifest.";
  if (!current) return `New application with ${proposedMedia.length} prepared media ${proposedMedia.length === 1 ? "asset" : "assets"}.`;
  const changed = [
    current.name !== manifest.name,
    current.slug !== manifest.slug,
    current.websiteUrl !== manifest.websiteUrl,
    current.tagline !== manifest.tagline,
    current.description !== manifest.description,
    current.pricingType !== manifest.pricingType || current.billingType !== manifest.billingType || current.pricingDetails !== manifest.pricingDetails,
    current.sourceType !== manifest.sourceType,
    current.youtubeUrl !== manifest.youtubeUrl,
  ].filter(Boolean).length;
  const currentMediaKeys = current.media.map((asset) => `${asset.role}:${asset.checksum}`).sort();
  const proposedMediaKeys = proposedMedia.map((asset) => `${asset.role}:${asset.checksum}`).sort();
  const mediaChanged = currentMediaKeys.length !== proposedMediaKeys.length
    || currentMediaKeys.some((key, index) => key !== proposedMediaKeys[index]);
  const parts = [changed ? `${changed} listing ${changed === 1 ? "field" : "fields"}` : null, mediaChanged ? "media" : null]
    .filter(Boolean);
  return parts.length ? `${parts.join(" and ")} changed.` : "Taxonomy or relationship changes ready for review.";
}

function viewLabel(view: View) {
  return view === "pending" ? "Awaiting a decision" : view === "history" ? "Reviewed revisions" : "Synchronization failures";
}

function viewDescription(view: View) {
  return view === "pending"
    ? "Newest proposed changes appear first. Nothing here is public until you publish it."
    : view === "history"
      ? "Previously published and rejected revisions remain available for audit."
      : "These revisions could not be prepared for review and need a corrected GitHub manifest.";
}

function mediaUrl(storageKey: string) {
  return `/dashboard/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}
