import Link from "next/link";
import {
  Database,
  FileUp,
  FlaskConical,
  Pencil,
  Plus,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getApplicationsDashboardData } from "@/lib/apps-data";
import { formatPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ applications, stats, media }, params] = await Promise.all([
    getApplicationsDashboardData(),
    searchParams,
  ]);

  return (
    <DashboardShell active="applications">
      <header className="dashboard-header">
        <div>
          <p>Content workspace</p>
          <h1>Applications</h1>
        </div>
        <div className="dashboard-actions">
          {process.env.NODE_ENV !== "production" && <Link className="button-secondary" href="/demo"><FlaskConical size={16} /> View demo data</Link>}
          <Link className="button-secondary" href="/dashboard/imports">
            <FileUp size={16} /> Import file
          </Link>
          <Link className="button-primary" href="/dashboard/apps/new">
            <Plus size={16} /> Add application
          </Link>
        </div>
      </header>

      {params.created === "1" && (
        <div className="success-banner" role="status">
          <span aria-hidden="true">✓</span>
          Application saved as a draft in local D1.
        </div>
      )}

      <section className="status-strip" aria-label="Directory status">
        <div><span>Published</span><strong>{stats.published}</strong><small>Visible in the public directory</small></div>
        <div><span>Drafts</span><strong>{stats.drafts}</strong><small>Waiting for editorial review</small></div>
        <div><span>Media</span><strong>{formatBytes(Number(media.bytes))}</strong><small>{media.count} files recorded for R2</small></div>
        <div><span>Database</span><strong className="status-ready"><Database size={15} /> Ready</strong><small>{stats.total} application records in local D1</small></div>
      </section>

      <section className="dashboard-panel" aria-labelledby="recent-apps">
        <div className="panel-toolbar">
          <div>
            <h2 id="recent-apps">Recent applications</h2>
            <p>Review application details before publishing them.</p>
          </div>
          <div className="table-filters" aria-label="Application filters">
            <button className="filter-active" type="button">All</button>
            <button disabled type="button">Draft</button>
            <button disabled type="button">Published</button>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-app-mark" aria-hidden="true">+</span>
            <h3>No applications yet</h3>
            <p>Add the first Mac application to verify the local editing workflow.</p>
            <Link className="button-primary" href="/dashboard/apps/new">
              <Plus size={16} /> Add application
            </Link>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Application</th>
                  <th scope="col">Pricing</th>
                  <th scope="col">Source</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="table-app">
                        <span className="app-icon app-icon-table app-icon-graphite" aria-hidden="true">
                          {app.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span><strong>{app.name}</strong><small>/{app.slug}</small></span>
                      </div>
                    </td>
                    <td>{formatPricing(app)}</td>
                    <td>{app.sourceType === "open_source" ? "Open source" : <span className="table-muted">Not displayed</span>}</td>
                    <td>
                      <span className={cn(app.status === "published" ? "published-badge" : "draft-badge")}>
                        {app.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <Link className="icon-button" href={`/dashboard/apps/${app.id}/edit`} aria-label={`Edit ${app.name}`}>
                        <Pencil size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
