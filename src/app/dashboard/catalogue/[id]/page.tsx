import Image from "next/image";
import Link from "next/link";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";
import { decideCatalogueRevision } from "@/app/dashboard/catalogue/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDatabase } from "@/db/client";
import { apps, catalogueRevisions } from "@/db/schema";

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

  return (
    <DashboardShell active="catalogue">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard/catalogue">Contributions</Link><ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{revision.appSlug}</span>
      </nav>
      <header className="editor-header editor-header-row">
        <div><p>{revision.changeType} · {revision.status}</p><h1>{revision.appSlug}</h1><span>Review the exact merged revision before it reaches the public directory.</span></div>
        <a className="button-secondary" href={sourceUrl} rel="noreferrer" target="_blank">View on GitHub <ExternalLink size={15} /></a>
      </header>

      {revision.errors.length > 0 && <div className="form-error" role="alert">{revision.errors.join(" ")}</div>}
      <section className="dashboard-panel catalogue-review-panel">
        <div className="catalogue-review-summary">
          <div><span>Commit</span><strong>{revision.sourceCommitSha}</strong></div>
          <div><span>Source</span><strong>{revision.sourcePath}</strong></div>
          <div><span>Current record</span><strong>{current ? `${current.name} (${current.status})` : "New application"}</strong></div>
        </div>
        {revision.preparedMedia.length > 0 && (
          <div className="catalogue-review-media">
            {revision.preparedMedia.map((asset) => (
              <figure key={asset.id}>
                <Image alt={asset.altText} height={asset.height ?? 360} src={`/dashboard/media/${asset.storageKey.split("/").map(encodeURIComponent).join("/")}`} unoptimized width={asset.width ?? 640} />
                <figcaption>{asset.role.replace("_", " ")} · {asset.sourceUrl}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="catalogue-json-review">
          <h2>Merged manifest</h2>
          {revision.manifest ? <pre>{JSON.stringify(revision.manifest, null, 2)}</pre> : <p>This revision requests that the live application be archived.</p>}
        </div>
        {revision.status === "pending" && (
          <form action={decideCatalogueRevision} className="catalogue-review-decision">
            <input name="revisionId" type="hidden" value={revision.id} />
            <button className="button-secondary" name="intent" type="submit" value="reject">Reject revision</button>
            <button className="button-primary" name="intent" type="submit" value="publish">Publish revision</button>
          </form>
        )}
      </section>
    </DashboardShell>
  );
}
