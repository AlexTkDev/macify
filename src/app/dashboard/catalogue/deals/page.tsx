import Image from "next/image";
import Link from "next/link";
import { desc, like, sql } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, Percent, PlusCircle, RefreshCcw, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { catalogueRevisions } from "@/db/schema";
import { dealManifestSchema } from "@/lib/deal-manifest";
import { dealRevisionChangeLabels } from "@/lib/deal-revision-labels";
import { revisionStatusLabels } from "@/lib/catalogue-revision-labels";
import { getCatalogueQueueApplications } from "@/lib/catalogue-review-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type View = "pending" | "history" | "failed";

const errorMessages: Record<string, string> = {
  invalid: "That deal review request was invalid.",
  "not-pending": "That deal revision has already been reviewed.",
  "stale-revision": "A newer revision exists for this deal. Review the newest revision instead.",
  "missing-app": "Publish the linked application before publishing this deal.",
  "app-not-published": "The linked application must be public before its deal can be published.",
  "invalid-manifest": "The stored deal manifest is invalid. Correct it in GitHub and synchronize a new revision.",
};

export default async function DealReviewQueuePage({ searchParams }: {
  searchParams: Promise<{ view?: string; published?: string; rejected?: string; error?: string }>;
}) {
  const query = await searchParams;
  const view: View = query.view === "history" || query.view === "failed" ? query.view : "pending";
  const database = await getDatabase();
  const [recentRevisions, countRows] = await Promise.all([
    database.select().from(catalogueRevisions).where(like(catalogueRevisions.sourcePath, "catalog/deals/%"))
      .orderBy(desc(catalogueRevisions.createdAt)).limit(200),
    database.select({
      pending: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' then 1 else 0 end), 0)`,
      create: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' and ${catalogueRevisions.changeType} = 'create' then 1 else 0 end), 0)`,
      update: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' and ${catalogueRevisions.changeType} = 'update' then 1 else 0 end), 0)`,
      archive: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'pending' and ${catalogueRevisions.changeType} = 'archive' then 1 else 0 end), 0)`,
      failed: sql<number>`coalesce(sum(case when ${catalogueRevisions.status} = 'failed' then 1 else 0 end), 0)`,
    }).from(catalogueRevisions).where(like(catalogueRevisions.sourcePath, "catalog/deals/%")),
  ]);
  const revisions = recentRevisions.filter((revision) => view === "pending" ? revision.status === "pending"
    : view === "failed" ? revision.status === "failed"
      : revision.status === "published" || revision.status === "rejected").slice(0, 100);
  const applications = await getCatalogueQueueApplications(revisions.flatMap(({ appId }) => appId ? [appId] : []));
  const counts = countRows[0] ?? { pending: 0, create: 0, update: 0, archive: 0, failed: 0 };

  return (
    <DashboardShell active="catalogue">
      <header className="editor-header"><div><p>GitHub updates</p><h1>Deal review queue</h1><span>Deal definitions come from GitHub. This dashboard only publishes or rejects synchronized revisions.</span></div></header>
      <nav className="catalogue-kind-tabs" aria-label="Catalogue review type">
        <Link href="/dashboard/catalogue">Applications</Link>
        <Link aria-current="page" className="active" href="/dashboard/catalogue/deals">Deals</Link>
      </nav>
      <section className="catalogue-queue-stats" aria-label="Deal review status">
        <div><Percent size={18} /><span>Awaiting review</span><strong>{counts.pending}</strong></div>
        <div><PlusCircle size={18} /><span>New deals</span><strong>{counts.create}</strong></div>
        <div><RefreshCcw size={18} /><span>Deal updates</span><strong>{counts.update}</strong></div>
        <div><Trash2 size={18} /><span>Deal removals</span><strong>{counts.archive}</strong></div>
      </section>
      {query.published === "1" && <div className="success-banner" role="status"><CheckCircle2 size={17} /> Deal revision published.</div>}
      {query.rejected === "1" && <div className="success-banner" role="status"><CheckCircle2 size={17} /> Deal revision rejected. The published deal was not changed.</div>}
      {query.error && <div className="form-error" role="alert">{errorMessages[query.error] ?? "The deal revision could not be reviewed."}</div>}
      <section className="dashboard-panel catalogue-queue-panel" aria-labelledby="deal-revisions-heading">
        <div className="catalogue-queue-toolbar">
          <div><h2 id="deal-revisions-heading">{view === "pending" ? "Awaiting a decision" : view === "history" ? "Reviewed deal revisions" : "Synchronization failures"}</h2><p>{view === "pending" ? "Nothing here changes the published deal until you approve it." : "Deal revision history remains available for audit."}</p></div>
          <nav className="catalogue-view-tabs" aria-label="Deal queue views">
            <Link className={cn(view === "pending" && "active")} href="/dashboard/catalogue/deals">Pending <span>{counts.pending}</span></Link>
            <Link className={cn(view === "history" && "active")} href="/dashboard/catalogue/deals?view=history">History</Link>
            <Link className={cn(view === "failed" && "active")} href="/dashboard/catalogue/deals?view=failed">Failed <span>{counts.failed}</span></Link>
          </nav>
        </div>
        {revisions.length === 0 ? <div className="catalogue-queue-empty"><CheckCircle2 size={24} /><strong>{view === "pending" ? "No deals await review" : "No deal revisions in this view"}</strong><span>Add or update a JSON file in catalog/deals to create a revision.</span></div> : (
          <div className="catalogue-revision-list">
            {revisions.map((revision) => {
              const result = dealManifestSchema.safeParse(revision.manifest);
              const manifest = result.success ? result.data : null;
              const application = revision.appId ? applications.get(revision.appId) : null;
              const icon = application?.media.find(({ role }) => role === "icon");
              return <article className="catalogue-revision" key={revision.id}>
                <div className="catalogue-revision-identity">
                  <div className="catalogue-revision-icon">{icon ? <Image alt={`${application?.name ?? revision.appSlug} icon`} height={48} src={mediaUrl(icon.storageKey)} unoptimized width={48} /> : <span aria-hidden="true">%</span>}</div>
                  <div><div className="catalogue-revision-meta"><span>{dealRevisionChangeLabels[revision.changeType]}</span><span data-status={revision.status}>{revisionStatusLabels[revision.status]}</span></div><h3>{application?.name ?? revision.appSlug}</h3><p>{manifest ? `${manifest.discountPercent}% off · ${formatWindow(manifest.startsAt, manifest.endsAt)}` : "Remove the published deal."}</p><small>{revision.createdAt.toLocaleString()} · commit {revision.sourceCommitSha.slice(0, 8)}</small></div>
                </div>
                <Link className={revision.status === "pending" ? "button-primary" : "button-secondary"} href={`/dashboard/catalogue/deals/${revision.id}`}>{revision.status === "pending" ? "Review deal" : "View revision"}</Link>
              </article>;
            })}
          </div>
        )}
      </section>
      {counts.failed > 0 && view !== "failed" && <aside className="catalogue-source-notice"><AlertTriangle size={18} /><div><strong>{counts.failed} deal synchronization failure{counts.failed === 1 ? "" : "s"}</strong><span>Open the Failed view to inspect revisions that could not be prepared.</span></div></aside>}
    </DashboardShell>
  );
}

function mediaUrl(storageKey: string) { return `/dashboard/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`; }
function formatWindow(startsAt: string, endsAt: string) {
  const format = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });
  return `${format.format(new Date(startsAt))} to ${format.format(new Date(endsAt))}`;
}
