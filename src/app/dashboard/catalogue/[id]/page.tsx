import Image from "next/image";
import Link from "next/link";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, GitBranch } from "lucide-react";
import { decideCatalogueRevision } from "@/app/dashboard/catalogue/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { MarkdownContent } from "@/components/markdown-content";
import { getDatabase } from "@/db/client";
import { apps, catalogueRevisions } from "@/db/schema";
import { catalogueManifestSchema } from "@/lib/catalogue-manifest";
import { publishActionLabels, revisionChangeLabels, revisionStatusLabels } from "@/lib/catalogue-revision-labels";
import { formatPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function CatalogueRevisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = await getDatabase();
  const rows = await database.select().from(catalogueRevisions).where(eq(catalogueRevisions.id, id)).limit(1);
  const revision = rows[0];
  if (!revision) notFound();
  const currentRows = revision.appId
    ? await database.select().from(apps).where(and(eq(apps.id, revision.appId), isNull(apps.deletedAt))).limit(1)
    : [];
  const current = currentRows[0] ?? null;
  const sourceUrl = `https://github.com/${revision.sourceRepository}/blob/${revision.sourceCommitSha}/${revision.sourcePath}`;
  const editUrl = `https://github.com/${revision.sourceRepository}/edit/main/${revision.sourcePath}`;
  const manifestResult = catalogueManifestSchema.safeParse(revision.manifest);
  const manifest = manifestResult.success ? manifestResult.data : null;
  const isNew = !current;
  const pricingChanged = !current || !manifest
    || current.pricingType !== manifest.pricingType
      || current.billingType !== manifest.billingType
      || current.pricingDetails !== manifest.pricingDetails;

  return (
    <DashboardShell active="catalogue">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard/catalogue">Review queue</Link><ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{revision.appSlug}</span>
      </nav>
      <header className="editor-header editor-header-row">
        <div><p>{revisionChangeLabels[revision.changeType]} · {revisionStatusLabels[revision.status]}</p><h1>{manifest?.name ?? revision.appSlug}</h1><span>This is the exact GitHub revision waiting for your publication decision.</span></div>
        <div className="editor-header-actions">
          {manifest && <a className="button-secondary" href={editUrl} rel="noreferrer" target="_blank">Edit app information <GitBranch size={15} /></a>}
          <a className="button-secondary" href={sourceUrl} rel="noreferrer" target="_blank">View source commit <ExternalLink size={15} /></a>
        </div>
      </header>

      {revision.errors.length > 0 && <div className="form-error" role="alert">{revision.errors.join(" ")}</div>}
      <aside className="catalogue-source-notice">
        <GitBranch aria-hidden="true" size={18} />
        <div><strong>Changes are made in GitHub.</strong><span>This dashboard publishes or rejects the merged revision. Editing the JSON creates a new revision and keeps both systems synchronized.</span></div>
      </aside>
      <section className="dashboard-panel catalogue-review-panel">
        <div className="catalogue-review-summary">
          <div><span>Update</span><strong>{revisionChangeLabels[revision.changeType]}</strong></div>
          <div><span>GitHub commit</span><strong>{revision.sourceCommitSha.slice(0, 12)}</strong></div>
          <div><span>Currently public</span><strong>{current ? `${current.name} (${current.status === "published" ? "Published" : "Not public"})` : "Not published yet"}</strong></div>
        </div>
        {revision.preparedMedia.length > 0 && (
          <section className="catalogue-review-section">
            <div className="catalogue-review-heading"><div><h2>Prepared media</h2><p>These files have been validated and stored for publication.</p></div><strong className="catalogue-review-count">{revision.preparedMedia.length} files</strong></div>
            <div className="catalogue-review-media">
              {revision.preparedMedia.map((asset) => (
                <figure key={asset.id}>
                  <Image alt={asset.altText} height={asset.height ?? 360} src={`/dashboard/media/${asset.storageKey.split("/").map(encodeURIComponent).join("/")}`} unoptimized width={asset.width ?? 640} />
                  <figcaption>{asset.role.replace("_", " ")} · {asset.sourceUrl}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        {manifest ? (
          <>
            <section className="catalogue-review-section">
              <div className="catalogue-review-heading"><div><h2>Proposed app information</h2><p>Values marked as changed differ from the currently published application.</p></div></div>
              <dl className="catalogue-review-facts">
                <div><dt>Name{(!current || current.name !== manifest.name) && <span>{isNew ? "New" : "Changed"}</span>}</dt><dd>{manifest.name}</dd></div>
                <div><dt>Website{(!current || current.websiteUrl !== manifest.websiteUrl) && <span>{isNew ? "New" : "Changed"}</span>}</dt><dd><a href={manifest.websiteUrl} rel="noreferrer" target="_blank">{manifest.websiteUrl}</a></dd></div>
                <div><dt>Tagline{(!current || current.tagline !== manifest.tagline) && <span>{isNew ? "New" : "Changed"}</span>}</dt><dd>{manifest.tagline}</dd></div>
                <div><dt>Pricing{pricingChanged && <span>{isNew ? "New" : "Changed"}</span>}</dt><dd>{formatPricing(manifest)}</dd></div>
                <div><dt>Source{(!current || current.sourceType !== manifest.sourceType) && <span>{isNew ? "New" : "Changed"}</span>}</dt><dd>{manifest.sourceType === "open_source" ? "Open source" : "Closed source"}</dd></div>
                <div><dt>Categories</dt><dd>{manifest.categories.join(", ")}</dd></div>
                <div><dt>Related applications</dt><dd>{manifest.relatedAppSlugs.length ? manifest.relatedAppSlugs.join(", ") : "None"}</dd></div>
              </dl>
            </section>
            <section className="catalogue-review-section catalogue-review-description">
              <div className="catalogue-review-heading"><div><h2>Proposed description</h2><p>Read this as it will appear on the application page.</p></div>{(!current || current.description !== manifest.description) && <strong className="catalogue-review-change">{isNew ? "New" : "Changed"}</strong>}</div>
              <div className="catalogue-review-copy"><MarkdownContent>{manifest.description}</MarkdownContent></div>
            </section>
            <details className="catalogue-json-review">
              <summary>View merged JSON</summary>
              <pre>{JSON.stringify(revision.manifest, null, 2)}</pre>
            </details>
          </>
        ) : revision.changeType === "archive" ? (
          <div className="catalogue-archive-request"><h2>Archive this application</h2><p>Publishing this revision removes the application from the public directory. Its database record remains archived.</p></div>
        ) : (
          <div className="catalogue-archive-request"><h2>App information unavailable</h2><p>This revision does not contain a valid app manifest. Review the synchronization error and correct the JSON in GitHub.</p></div>
        )}
        {revision.status === "pending" && (
          <form action={decideCatalogueRevision} className="catalogue-review-decision">
            <input name="revisionId" type="hidden" value={revision.id} />
            <button className="button-secondary" name="intent" type="submit" value="reject">Reject update</button>
            <button className="button-primary" name="intent" type="submit" value="publish">{publishActionLabels[revision.changeType]}</button>
          </form>
        )}
      </section>
    </DashboardShell>
  );
}
