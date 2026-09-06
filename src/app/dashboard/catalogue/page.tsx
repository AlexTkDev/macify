import Link from "next/link";
import { desc } from "drizzle-orm";
import { GitBranch } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { catalogueRevisions } from "@/db/schema";
import { revisionChangeLabels, revisionStatusLabels } from "@/lib/catalogue-revision-labels";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "That review request was invalid.",
  "not-pending": "That revision has already been reviewed.",
  "missing-app": "The application linked to this archive request no longer exists.",
  "invalid-manifest": "The stored manifest is invalid and cannot be published.",
  "missing-related-app": "Publish the related applications first, or remove those relationships in GitHub.",
  "missing-media": "The revision is missing its required icon or preview image.",
  "stale-revision": "A newer pending revision exists for this application. Review the newest revision instead.",
};

export default async function CatalogueReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; rejected?: string; error?: string }>;
}) {
  const query = await searchParams;
  const database = await getDatabase();
  const revisions = await database.select().from(catalogueRevisions)
    .orderBy(desc(catalogueRevisions.createdAt)).limit(100);

  return (
    <DashboardShell active="catalogue">
      <header className="editor-header">
        <div>
          <p>GitHub updates</p>
          <h1>Publication queue</h1>
          <span>Review merged app information before it reaches the public directory.</span>
        </div>
      </header>

      <aside className="catalogue-source-notice">
        <GitBranch aria-hidden="true" size={18} />
        <div><strong>GitHub is the source of app information.</strong><span>Use this queue to publish or reject updates. Make corrections in the JSON manifest, then merge a new GitHub revision.</span></div>
      </aside>

      {query.published === "1" && <div className="success-banner" role="status">✓ Revision published.</div>}
      {query.rejected === "1" && <div className="success-banner" role="status">✓ Revision rejected.</div>}
      {query.error && <div className="form-error" role="alert">{errorMessages[query.error] ?? "The revision could not be reviewed."}</div>}

      <section className="dashboard-panel catalogue-queue-panel" aria-labelledby="revisions-heading">
        <div className="media-editor-heading">
          <div><h2 id="revisions-heading">App updates</h2><span>Newest merged GitHub revisions appear first.</span></div>
          <strong>{revisions.filter(({ status }) => status === "pending").length} awaiting publication</strong>
        </div>
        {revisions.length === 0 ? (
          <p className="catalogue-queue-empty">No GitHub updates have reached the publication queue yet.</p>
        ) : (
          <div className="catalogue-revision-list">
            {revisions.map((revision) => (
              <article className="catalogue-revision" key={revision.id}>
                <div>
                  <div className="catalogue-revision-meta">
                    <span>{revisionChangeLabels[revision.changeType]}</span><span data-status={revision.status}>{revisionStatusLabels[revision.status]}</span>
                  </div>
                  <h3>{revision.appSlug}</h3>
                  <p>GitHub commit {revision.sourceCommitSha.slice(0, 8)} · {revision.sourcePath}</p>
                  <small>{revision.createdAt.toLocaleString()}</small>
                </div>
                <div className="catalogue-revision-actions">
                  {revision.appId && <Link className="button-secondary" href={`/dashboard/apps/${revision.appId}/edit`}>Current app</Link>}
                  <Link className={revision.status === "pending" ? "button-primary" : "button-secondary"} href={`/dashboard/catalogue/${revision.id}`}>{revision.status === "pending" ? "Review update" : "View revision"}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
