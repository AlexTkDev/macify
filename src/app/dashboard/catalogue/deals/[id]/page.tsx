import Link from "next/link";
import { and, desc, eq, isNull, lt } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, GitBranch, Percent } from "lucide-react";
import { decideDealRevision } from "@/app/dashboard/catalogue/deals/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { apps, catalogueRevisions, deals } from "@/db/schema";
import { revisionStatusLabels } from "@/lib/catalogue-revision-labels";
import { dealManifestSchema, type DealManifest } from "@/lib/deal-manifest";
import { dealPublishActionLabels, dealRevisionChangeLabels } from "@/lib/deal-revision-labels";

export const dynamic = "force-dynamic";

type DealSnapshot = Pick<DealManifest, "appSlug" | "discountPercent" | "code" | "url" | "startsAt" | "endsAt">;

export default async function DealRevisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = await getDatabase();
  const revisionRows = await database.select().from(catalogueRevisions)
    .where(eq(catalogueRevisions.id, id)).limit(1);
  const revision = revisionRows[0];
  if (!revision || !revision.sourcePath.startsWith("catalog/deals/")) notFound();

  const applicationRows = await database.select({
    id: apps.id,
    name: apps.name,
    slug: apps.slug,
    status: apps.status,
  }).from(apps).where(and(eq(apps.slug, revision.appSlug), isNull(apps.deletedAt))).limit(1);
  const application = applicationRows[0] ?? null;
  const currentDealRows = application
    ? await database.select().from(deals).where(eq(deals.appId, application.id)).limit(1)
    : [];
  const currentDeal = currentDealRows[0] ?? null;
  const manifestResult = dealManifestSchema.safeParse(revision.manifest);
  const manifest = manifestResult.success ? manifestResult.data : null;
  const comparison = revision.status === "pending" || revision.status === "failed"
    ? currentDeal && application ? snapshotFromDeal(currentDeal, application.slug) : null
    : await getHistoricalBaseline(database, revision.sourcePath, revision.createdAt);
  const fields = getDealFields(comparison, manifest);
  const changedCount = fields.filter(({ changed }) => changed).length;
  const sourceUrl = `https://github.com/${revision.sourceRepository}/blob/${revision.sourceCommitSha}/${revision.sourcePath}`;
  const editUrl = `https://github.com/${revision.sourceRepository}/edit/main/${revision.sourcePath}`;

  return (
    <DashboardShell active="catalogue">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard/catalogue/deals">Deal review queue</Link><ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page">{revision.appSlug}</span>
      </nav>
      <header className="editor-header editor-header-row">
        <div>
          <p>{dealRevisionChangeLabels[revision.changeType]} · {revisionStatusLabels[revision.status]}</p>
          <h1>{application?.name ?? revision.appSlug}</h1>
          <span>Review the offer defined in GitHub. The dashboard can publish or reject it, but cannot edit its content.</span>
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
              <div><span>Revision</span><strong>{dealRevisionChangeLabels[revision.changeType]}</strong><small>{revisionStatusLabels[revision.status]}</small></div>
              <div><span>Fields</span><strong>{manifest ? changedCount : "—"}</strong><small>{manifest ? "changed in this revision" : "manifest unavailable"}</small></div>
              <div><span>Offer state</span><strong>{manifest ? dealState(manifest.startsAt, manifest.endsAt) : "Removal"}</strong><small>{manifest ? formatWindow(manifest.startsAt, manifest.endsAt) : "Removes the published offer"}</small></div>
              <div><span>Application</span><strong>{application ? publicStateLabel(application.status) : "Missing"}</strong><small>{application?.name ?? revision.appSlug}</small></div>
            </div>

            {manifest ? (
              <section className="catalogue-review-section" aria-labelledby="deal-changes-heading">
                <div className="catalogue-review-heading">
                  <div><p className="section-kicker">Offer comparison</p><h2 id="deal-changes-heading">What changes when this is published</h2><p>Values from the current published deal are shown beside the exact proposal synchronized from GitHub.</p></div>
                  <span className="catalogue-review-count">{changedCount} changed</span>
                </div>
                <div className="catalogue-field-diff">
                  <div className="catalogue-field-diff-head"><span>Field</span><span>Published</span><span>Proposed</span></div>
                  {fields.map((field) => (
                    <div className="catalogue-field-diff-row" data-changed={field.changed} key={field.label}>
                      <div className="catalogue-field-name"><strong>{field.label}</strong><span>{field.changed ? "Changed" : "Unchanged"}</span></div>
                      <div className="catalogue-field-value" data-state={field.changed && comparison ? "removed" : undefined}>{field.before || <span className="catalogue-empty-value">Not set</span>}</div>
                      <div className="catalogue-field-value" data-state={field.changed ? "added" : undefined}>{field.after || <span className="catalogue-empty-value">Not set</span>}</div>
                    </div>
                  ))}
                </div>
                <details className="catalogue-json-review">
                  <summary>View deal JSON</summary>
                  <pre>{JSON.stringify(revision.manifest, null, 2)}</pre>
                </details>
              </section>
            ) : revision.changeType === "archive" ? (
              <div className="catalogue-archive-request"><h2>Remove this deal</h2><p>Publishing this revision deletes the deal from D1. The application itself remains published and unchanged.</p></div>
            ) : (
              <div className="catalogue-archive-request"><h2>Deal information unavailable</h2><p>Correct the deal manifest in GitHub and synchronize a new revision.</p></div>
            )}
          </section>
        </div>

        <aside className="catalogue-review-sidebar" aria-label="Review decision">
          <section className="dashboard-panel catalogue-decision-panel">
            <p className="section-kicker">Decision</p>
            <h2>{revision.status === "pending" ? "Ready for review" : `Revision ${revisionStatusLabels[revision.status].toLowerCase()}`}</h2>
            <p>{revision.status === "pending"
              ? "Publishing materializes this GitHub proposal in D1. Rejecting leaves the current published deal unchanged."
              : `This revision was reviewed${revision.reviewedAt ? ` on ${revision.reviewedAt.toLocaleString()}` : ""}.`}</p>
            {revision.status === "pending" && (
              <form action={decideDealRevision} className="catalogue-review-decision">
                <input name="revisionId" type="hidden" value={revision.id} />
                <button className="button-primary" name="intent" type="submit" value="publish"><Percent size={15} /> {dealPublishActionLabels[revision.changeType]}</button>
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
            <div><strong>Deal content stays in GitHub.</strong><span>Change the manifest there. Use this dashboard only for review decisions.</span></div>
          </aside>
        </aside>
      </div>
    </DashboardShell>
  );
}

function snapshotFromDeal(deal: typeof deals.$inferSelect, appSlug: string): DealSnapshot {
  return {
    appSlug,
    discountPercent: deal.discountPercent,
    code: deal.code,
    url: deal.url,
    startsAt: deal.startsAt.toISOString(),
    endsAt: deal.endsAt.toISOString(),
  };
}

function getDealFields(before: DealSnapshot | null, after: DealManifest | null) {
  const raw = [
    { label: "Application", before: before?.appSlug ?? "", after: after?.appSlug ?? "" },
    { label: "Discount", before: before ? `${before.discountPercent}%` : "", after: after ? `${after.discountPercent}%` : "" },
    { label: "Code", before: before?.code ?? "", after: after?.code ?? "" },
    { label: "Destination", before: before?.url ?? "", after: after?.url ?? "" },
    { label: "Starts", before: before ? formatDateTime(before.startsAt) : "", after: after ? formatDateTime(after.startsAt) : "" },
    { label: "Ends", before: before ? formatDateTime(before.endsAt) : "", after: after ? formatDateTime(after.endsAt) : "" },
  ];
  return raw.map((field) => ({ ...field, changed: field.before !== field.after }));
}

async function getHistoricalBaseline(
  database: Awaited<ReturnType<typeof getDatabase>>,
  sourcePath: string,
  createdAt: Date,
) {
  const candidates = await database.select().from(catalogueRevisions).where(and(
    eq(catalogueRevisions.sourcePath, sourcePath),
    eq(catalogueRevisions.status, "published"),
    lt(catalogueRevisions.createdAt, createdAt),
  )).orderBy(desc(catalogueRevisions.createdAt)).limit(10);
  for (const candidate of candidates) {
    const parsed = dealManifestSchema.safeParse(candidate.manifest);
    if (parsed.success) return parsed.data;
  }
  return null;
}

function publicStateLabel(status: "draft" | "published" | "archived") {
  return status === "published" ? "Published" : status === "archived" ? "Unpublished" : "Draft";
}

function dealState(startsAt: string, endsAt: string) {
  const now = Date.now();
  if (now < Date.parse(startsAt)) return "Scheduled";
  if (now > Date.parse(endsAt)) return "Expired";
  return "Active";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
}

function formatWindow(startsAt: string, endsAt: string) {
  return `${formatDateTime(startsAt)} – ${formatDateTime(endsAt)} UTC`;
}
