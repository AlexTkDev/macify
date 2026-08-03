import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileWarning } from "lucide-react";
import { notFound } from "next/navigation";
import { DashboardNotice } from "@/components/dashboard-notice";
import { DashboardShell } from "@/components/dashboard-shell";
import { getImportJobData } from "@/lib/dashboard-data";
import { commitImportJob } from "@/app/dashboard/manage/import-commit";

export const dynamic = "force-dynamic";

export default async function ImportReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { job, rows } = await getImportJobData(id);
  if (!job) notFound();
  return (
    <DashboardShell active="imports">
      <nav className="dashboard-breadcrumbs"><Link href="/dashboard/imports"><ArrowLeft size={14} /> Imports</Link><span>/</span><span>{job.fileName}</span></nav>
      <header className="editor-header editor-header-row"><div><p>{job.status} import</p><h1>{job.fileName}</h1><span>{job.totalRows} rows checked, {job.validRows} valid, {job.invalidRows} invalid, {job.duplicateRows} duplicate.</span></div>{job.status === "validated" && job.validRows > 0 && <form action={commitImportJob}><input name="id" type="hidden" value={job.id} /><button className="button-primary" type="submit"><CheckCircle2 size={15} /> Import valid drafts</button></form>}</header>
      <DashboardNotice error={query.error} success={query.success} />
      {job.invalidRows > 0 && <div className="import-warning"><FileWarning size={18} /><div><strong>Invalid rows will not be imported.</strong><span>Correct the source file and upload it as a new job if those rows are needed.</span></div></div>}
      <section className="dashboard-panel"><div className="data-table-wrap"><table className="data-table import-review-table"><thead><tr><th>Row</th><th>Status</th><th>Name</th><th>Slug</th><th>Website</th><th>Validation</th></tr></thead><tbody>{rows.map((row) => { const source = row.sourceData as Record<string, unknown>; const errors = Array.isArray(row.errors) ? row.errors : []; return <tr key={row.id}><td>{row.rowNumber}</td><td><span className={row.status === "valid" || row.status === "imported" ? "published-badge" : "draft-badge"}>{row.status}</span></td><td>{String(source.name ?? "")}</td><td>{String(source.slug ?? "")}</td><td>{String(source.websiteUrl ?? source.website_url ?? "")}</td><td className="validation-cell">{errors.length ? errors.join(" ") : "Ready"}</td></tr>; })}</tbody></table></div></section>
    </DashboardShell>
  );
}
