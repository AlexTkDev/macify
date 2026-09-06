import Link from "next/link";
import { desc } from "drizzle-orm";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { catalogueRevisions } from "@/db/schema";

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
        <p>GitHub catalogue</p>
        <h1>Contribution review</h1>
        <span>Every merged manifest waits here. Publishing applies the exact reviewed revision to D1.</span>
      </header>

      {query.published === "1" && <div className="success-banner" role="status">✓ Revision published.</div>}
      {query.rejected === "1" && <div className="success-banner" role="status">✓ Revision rejected.</div>}
      {query.error && <div className="form-error" role="alert">{errorMessages[query.error] ?? "The revision could not be reviewed."}</div>}

      <section className="dashboard-panel" aria-labelledby="revisions-heading">
        <div className="media-editor-heading">
          <div><h2 id="revisions-heading">Revisions</h2><span>Newest GitHub changes appear first.</span></div>
          <strong>{revisions.filter(({ status }) => status === "pending").length} pending</strong>
        </div>
        {revisions.length === 0 ? (
          <p>No catalogue revisions have arrived yet.</p>
        ) : (
          <div className="catalogue-revision-list">
            {revisions.map((revision) => (
              <article className="catalogue-revision" key={revision.id}>
                <div>
                  <div className="catalogue-revision-meta">
                    <span>{revision.changeType}</span><span>{revision.status}</span>
                  </div>
                  <h3>{revision.appSlug}</h3>
                  <p>{revision.sourcePath} · commit {revision.sourceCommitSha.slice(0, 8)}</p>
                  <small>{revision.createdAt.toLocaleString()}</small>
                </div>
                <div className="catalogue-revision-actions">
                  {revision.appId && <Link className="button-secondary" href={`/dashboard/apps/${revision.appId}/edit`}>Current app</Link>}
                  <Link className={revision.status === "pending" ? "button-primary" : "button-secondary"} href={`/dashboard/catalogue/${revision.id}`}>Review</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
