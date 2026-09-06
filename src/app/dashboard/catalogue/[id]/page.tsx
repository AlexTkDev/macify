import Link from "next/link";
import { and, desc, eq, lt } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ExternalLink,
  FileText,
  GitBranch,
  Image as ImageIcon,
  ListChecks,
} from "lucide-react";
import { decideCatalogueRevision } from "@/app/dashboard/catalogue/actions";
import { CatalogueChangeReview } from "@/components/catalogue-change-review";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { catalogueRevisions } from "@/db/schema";
import { getChangedManifestFields } from "@/lib/catalogue-diff";
import { catalogueManifestSchema } from "@/lib/catalogue-manifest";
import { publishActionLabels, revisionChangeLabels, revisionStatusLabels } from "@/lib/catalogue-revision-labels";
import { getCatalogueReviewSnapshot } from "@/lib/catalogue-review-data";

export const dynamic = "force-dynamic";

export default async function CatalogueRevisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = await getDatabase();
  const rows = await database.select().from(catalogueRevisions).where(eq(catalogueRevisions.id, id)).limit(1);
  const revision = rows[0];
  if (!revision) notFound();
  const current = await getCatalogueReviewSnapshot(revision.appId);
  const comparison = revision.status === "pending" || revision.status === "failed"
    ? current
    : await getHistoricalBaseline(database, revision.appSlug, revision.createdAt, current);
  const sourceUrl = `https://github.com/${revision.sourceRepository}/blob/${revision.sourceCommitSha}/${revision.sourcePath}`;
  const editUrl = `https://github.com/${revision.sourceRepository}/edit/main/${revision.sourcePath}`;
  const manifestResult = catalogueManifestSchema.safeParse(revision.manifest);
  const manifest = manifestResult.success ? manifestResult.data : null;
  const changedFields = manifest ? getChangedManifestFields(comparison, manifest) : new Set();
  const changedMedia = manifest
    ? countMediaChanges(comparison?.media ?? [], revision.preparedMedia)
    : revision.preparedMedia.length;

  return (
    <DashboardShell active="catalogue">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard/catalogue">Review queue</Link><ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{revision.appSlug}</span>
      </nav>
      <header className="editor-header editor-header-row">
        <div>
          <p>{revisionChangeLabels[revision.changeType]} · {revisionStatusLabels[revision.status]}</p>
          <h1>{manifest?.name ?? revision.appSlug}</h1>
          <span>Review every proposed change, then publish or reject this exact GitHub revision.</span>
        </div>
        <div className="editor-header-actions">
          {manifest && <a className="button-secondary" href={editUrl} rel="noreferrer" target="_blank">Edit manifest <GitBranch size={15} /></a>}
          <a className="button-secondary" href={sourceUrl} rel="noreferrer" target="_blank">Source commit <ExternalLink size={15} /></a>
        </div>
      </header>

      {revision.errors.length > 0 && <div className="form-error" role="alert">{revision.errors.join(" ")}</div>}

      <div className="catalogue-review-layout">
        <div className="catalogue-review-main">
          <section className="dashboard-panel catalogue-review-panel">
            <div className="catalogue-review-summary">
              <div><span>Revision</span><strong>{revisionChangeLabels[revision.changeType]}</strong><small>{revisionStatusLabels[revision.status]}</small></div>
              <div><span>Listing fields</span><strong>{manifest ? changedFields.size : "—"}</strong><small>{manifest ? "changed in this revision" : "manifest unavailable"}</small></div>
              <div><span>Media</span><strong>{changedMedia}</strong><small>asset changes detected</small></div>
              <div><span>Public state</span><strong>{current ? publicStateLabel(current.status) : "Not created"}</strong><small>{current?.isFeatured ? "Featured on the homepage" : "Not featured"}</small></div>
            </div>

            {manifest ? (
              <>
                <nav className="catalogue-review-jump" aria-label="Revision sections">
                  <a href="#listing-changes"><ListChecks size={15} /> Listing</a>
                  <a href="#description-changes"><FileText size={15} /> Description</a>
                  <a href="#media-changes"><ImageIcon size={15} /> Media</a>
                </nav>
                <CatalogueChangeReview current={comparison} manifest={manifest} preparedMedia={revision.preparedMedia} />
                <details className="catalogue-json-review">
                  <summary>View merged JSON</summary>
                  <pre>{JSON.stringify(revision.manifest, null, 2)}</pre>
                </details>
              </>
            ) : revision.changeType === "archive" ? (
              <div className="catalogue-archive-request"><h2>Remove this application from the directory</h2><p>Publishing this revision archives the application. Its record remains in the dashboard and can be republished later.</p></div>
            ) : (
              <div className="catalogue-archive-request"><h2>App information unavailable</h2><p>This revision does not contain a valid app manifest. Correct the JSON in GitHub and synchronize a new revision.</p></div>
            )}
          </section>
        </div>

        <aside className="catalogue-review-sidebar" aria-label="Review decision">
          <section className="dashboard-panel catalogue-decision-panel">
            <p className="section-kicker">Decision</p>
            <h2>{revision.status === "pending" ? "Ready for review" : `Revision ${revisionStatusLabels[revision.status].toLowerCase()}`}</h2>
            <p>{revision.status === "pending"
              ? "Publishing replaces the current public listing with the proposed values and prepared media. Rejecting keeps the current listing unchanged."
              : `This revision was reviewed${revision.reviewedAt ? ` on ${revision.reviewedAt.toLocaleString()}` : ""}.`}</p>
            {revision.status === "pending" && (
              <form action={decideCatalogueRevision} className="catalogue-review-decision">
                <input name="revisionId" type="hidden" value={revision.id} />
                <button className="button-primary" name="intent" type="submit" value="publish">{publishActionLabels[revision.changeType]}</button>
                <button className="button-secondary button-danger" name="intent" type="submit" value="reject">Reject revision</button>
              </form>
            )}
          </section>
          <section className="dashboard-panel catalogue-revision-context">
            <h2>Revision context</h2>
            <dl>
              <div><dt>Commit</dt><dd>{revision.sourceCommitSha.slice(0, 12)}</dd></div>
              <div><dt>Received</dt><dd>{revision.createdAt.toLocaleString()}</dd></div>
              <div><dt>Source</dt><dd>{revision.sourcePath}</dd></div>
            </dl>
          </section>
          <aside className="catalogue-source-notice">
            <GitBranch aria-hidden="true" size={18} />
            <div><strong>Listing copy stays in GitHub.</strong><span>Publish and reject here. Edit content in the manifest, then merge a new revision.</span></div>
          </aside>
        </aside>
      </div>
    </DashboardShell>
  );
}

function countMediaChanges(
  current: Array<{ role: string; checksum: string; sourceUrl: string | null; altText: string | null }>,
  proposed: Array<{ role: string; checksum: string; sourceUrl: string; altText: string }>,
) {
  const roles = ["icon", "preview_image", "screenshot"];
  return roles.reduce((count, role) => {
    const before = current.filter((asset) => asset.role === role);
    const after = proposed.filter((asset) => asset.role === role);
    const changed = Array.from({ length: Math.max(before.length, after.length) }, (_, index) => {
      const oldAsset = before[index];
      const newAsset = after[index];
      return !oldAsset || !newAsset || oldAsset.checksum !== newAsset.checksum
        || oldAsset.sourceUrl !== newAsset.sourceUrl || oldAsset.altText !== newAsset.altText;
    }).filter(Boolean).length;
    return count + changed;
  }, 0);
}

function publicStateLabel(status: "draft" | "published" | "archived") {
  return status === "published" ? "Published" : status === "archived" ? "Unpublished" : "Draft";
}

async function getHistoricalBaseline(
  database: Awaited<ReturnType<typeof getDatabase>>,
  appSlug: string,
  createdAt: Date,
  current: Awaited<ReturnType<typeof getCatalogueReviewSnapshot>>,
) {
  const candidates = await database.select().from(catalogueRevisions).where(and(
    eq(catalogueRevisions.appSlug, appSlug),
    eq(catalogueRevisions.status, "published"),
    lt(catalogueRevisions.createdAt, createdAt),
  )).orderBy(desc(catalogueRevisions.createdAt)).limit(10);
  for (const candidate of candidates) {
    const result = catalogueManifestSchema.safeParse(candidate.manifest);
    if (!result.success) continue;
    return {
      id: candidate.appId ?? current?.id ?? "historical",
      ...result.data,
      categories: result.data.categories,
      relatedAppSlugs: result.data.relatedAppSlugs,
      status: current?.status ?? "archived" as const,
      isFeatured: current?.isFeatured ?? false,
      media: candidate.preparedMedia,
    };
  }
  return null;
}
