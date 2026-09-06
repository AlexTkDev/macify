import Image from "next/image";
import Link from "next/link";
import {
  Database,
  GitPullRequest,
  SlidersHorizontal,
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

export default async function DashboardPage() {
  const { applications, stats, media, pendingRevisions } = await getApplicationsDashboardData();

  return (
    <DashboardShell active="applications">
      <header className="dashboard-header">
        <div>
          <p>Content workspace</p>
          <h1>Applications</h1>
        </div>
        <div className="dashboard-actions">
          <Link className="button-primary" href="/dashboard/catalogue">
            <GitPullRequest size={16} /> Review contributions
          </Link>
        </div>
      </header>

      <section className="status-strip" aria-label="Directory status">
        <div><span>Published</span><strong>{stats.published}</strong><small>Visible in the public directory</small></div>
        <div><span>Pending reviews</span><strong>{pendingRevisions}</strong><small>Merged GitHub revisions awaiting a decision</small></div>
        <div><span>Media</span><strong>{formatBytes(Number(media.bytes))}</strong><small>{media.count} files recorded for R2</small></div>
        <div><span>Database</span><strong className="status-ready"><Database size={15} /> Ready</strong><small>{stats.total} application records in local D1</small></div>
      </section>

      <section className="dashboard-panel" aria-labelledby="recent-apps">
        <div className="panel-toolbar">
          <div>
            <h2 id="recent-apps">Recent applications</h2>
            <p>Published catalogue records. Content changes come from reviewed GitHub revisions.</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-app-mark" aria-hidden="true">0</span>
            <h3>No applications yet</h3>
            <p>Merge a valid catalogue manifest and publish it from Contributions.</p>
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
                      <Link className="table-app table-app-link" href={`/dashboard/apps/${app.id}`}>
                        {app.iconStorageKey ? (
                          <Image
                            alt={app.iconAltText ?? `${app.name} icon`}
                            className="app-icon-table"
                            height={40}
                            src={`/dashboard/media/${app.iconStorageKey.split("/").map(encodeURIComponent).join("/")}`}
                            unoptimized
                            width={40}
                          />
                        ) : (
                          <span className="app-icon app-icon-table app-icon-graphite" aria-hidden="true">{app.name.slice(0, 1).toUpperCase()}</span>
                        )}
                        <span><strong>{app.name}</strong><small>/{app.slug}</small></span>
                      </Link>
                    </td>
                    <td>{formatPricing(app)}</td>
                    <td>{app.sourceType === "open_source" ? "Open source" : <span className="table-muted">Not displayed</span>}</td>
                    <td>
                      <span className={cn(app.status === "published" ? "published-badge" : "draft-badge")}>
                        {app.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <Link className="icon-button" href={`/dashboard/apps/${app.id}/edit`} aria-label={`Open editorial settings for ${app.name}`}>
                        <SlidersHorizontal size={15} />
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
