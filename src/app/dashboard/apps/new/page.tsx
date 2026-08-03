import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { getEditorialOptions } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export default async function NewApplicationPage() {
  const { categories, relatedApplications } = await getEditorialOptions();
  return (
    <DashboardShell active="applications">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard">Applications</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">New application</span>
      </nav>
      <header className="editor-header">
        <div>
          <p>Directory record</p>
          <h1>Add application</h1>
          <span>Create the editorial record, choose related applications, then add media immediately after saving.</span>
        </div>
      </header>
      <ApplicationForm categories={categories} relatedApplications={relatedApplications} />
    </DashboardShell>
  );
}
