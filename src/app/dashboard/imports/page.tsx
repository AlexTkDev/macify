import Link from "next/link";
import { ArrowRight, Download, FileJson, FileSpreadsheet, Upload } from "lucide-react";
import { DashboardNotice } from "@/components/dashboard-notice";
import { DashboardShell } from "@/components/dashboard-shell";
import { getImportJobsData } from "@/lib/dashboard-data";
import { uploadImportFile } from "../manage-actions";

export const dynamic = "force-dynamic";

export default async function ImportsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [jobs, query] = await Promise.all([getImportJobsData(), searchParams]);
  return (
    <DashboardShell active="imports">
      <header className="dashboard-header"><div><p>Bulk data operations</p><h1>Imports and exports</h1></div><div className="dashboard-actions"><Link className="button-secondary" href="/dashboard/imports/export?format=json"><FileJson size={15} /> Export JSON</Link><Link className="button-secondary" href="/dashboard/imports/export?format=csv"><Download size={15} /> Export CSV</Link></div></header>
      <DashboardNotice error={query.error} success={query.success} />
      <section className="import-layout">
        <form action={uploadImportFile} className="import-dropzone">
          <Upload size={24} />
          <div><h2>Upload application data</h2><p>CSV or JSON, up to 250 rows and 5 MB. Rows are validated before anything is added.</p></div>
          <input accept=".csv,.json,text/csv,application/json" name="file" required type="file" />
          <button className="button-primary" type="submit">Validate file</button>
        </form>
        <aside className="import-guidance">
          <h2>Required columns</h2>
          <p><code>name</code>, <code>slug</code>, <code>websiteUrl</code>, <code>tagline</code>, <code>description</code>, <code>pricingType</code>, and <code>category</code>. Use <code>free</code>, <code>freemium</code>, or <code>paid</code> for pricing. Freemium and paid rows also require <code>billingType</code> as <code>one_time</code> or <code>subscription</code>.</p>
          <h2>Optional media columns</h2>
          <p><code>iconUrl</code>, <code>iconAltText</code>, <code>previewImageUrl</code>, <code>previewImageAltText</code>, and <code>screenshotUrls</code>. Separate multiple screenshot URLs with <code>|</code> or <code>;</code>.</p>
          <p>Category accepts an existing category name or slug. Tags use commas. <code>relatedAppSlugs</code> accepts comma-separated slugs. Images are securely downloaded into R2 only when the validated import is committed. Imported applications remain drafts.</p>
        </aside>
      </section>
      <section className="dashboard-panel" aria-labelledby="import-history-heading">
        <div className="panel-toolbar"><div><h2 id="import-history-heading">Import history</h2><p>Source files and row-level results remain recorded for review.</p></div></div>
        {jobs.length === 0 ? <div className="dashboard-empty"><FileSpreadsheet size={30} /><h3>No import jobs</h3><p>Upload a CSV or JSON file to begin.</p></div> : (
          <div className="data-table-wrap"><table className="data-table"><thead><tr><th>File</th><th>Status</th><th>Rows</th><th>Valid</th><th>Invalid</th><th>Duplicates</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id}><td><strong>{job.fileName}</strong><small className="table-subline">{job.format.toUpperCase()}</small></td><td><span className={job.status === "completed" ? "published-badge" : "draft-badge"}>{job.status}</span></td><td>{job.totalRows}</td><td>{job.validRows}</td><td>{job.invalidRows}</td><td>{job.duplicateRows}</td><td><Link className="icon-button" href={`/dashboard/imports/${job.id}`} aria-label={`Review ${job.fileName}`}><ArrowRight size={15} /></Link></td></tr>)}</tbody></table></div>
        )}
      </section>
    </DashboardShell>
  );
}
