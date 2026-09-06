import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DealForm } from "@/components/deal-form";
import { getDealsDashboardData } from "@/lib/deals-data";

export const dynamic = "force-dynamic";

export default async function NewDealPage({ searchParams }: {
  searchParams: Promise<{ error?: string; app?: string }>;
}) {
  const query = await searchParams;
  const { availableApps } = await getDealsDashboardData();
  return (
    <DashboardShell active="deals">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/deals">Deals</Link><ChevronRight size={14} /><span aria-current="page">New deal</span></nav>
      <header className="editor-header"><div><p>Commercial catalogue</p><h1>Add a deal</h1><span>Create one verified offer for a published application.</span></div></header>
      {query.error && <div className="form-error" role="alert">Check the application, discount, HTTPS URL, and UTC date range.</div>}
      <section className="dashboard-panel deal-editor-panel">
        <div className="deal-editor-intro"><h2>Offer details</h2><p>This record is managed only in the dashboard. It is not read from or written to an application’s GitHub manifest.</p></div>
        {availableApps.length > 0 ? <DealForm applications={availableApps} selectedAppId={query.app} /> : <div className="dashboard-empty"><h3>No eligible applications</h3><p>Every published application already has a deal, or there are no published applications yet.</p><Link className="button-secondary" href="/dashboard/deals">Return to deals</Link></div>}
      </section>
    </DashboardShell>
  );
}
