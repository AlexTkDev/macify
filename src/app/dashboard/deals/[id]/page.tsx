import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { DealForm } from "@/components/deal-form";
import { getDealEditorData } from "@/lib/deals-data";

export const dynamic = "force-dynamic";

export default async function EditDealPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const deal = await getDealEditorData(id);
  if (!deal) notFound();
  return (
    <DashboardShell active="deals">
      <nav className="dashboard-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/deals">Deals</Link><ChevronRight size={14} /><span aria-current="page">{deal.appName}</span></nav>
      <header className="editor-header"><div><p>Edit deal</p><h1>{deal.discountPercent}% off {deal.appName}</h1><span>Update the commercial record without changing the application’s GitHub listing.</span></div></header>
      {query.error && <div className="form-error" role="alert">Check the discount, HTTPS URL, and UTC date range.</div>}
      <section className="dashboard-panel deal-editor-panel">
        <div className="deal-editor-intro"><h2>Offer details</h2><p>Times are stored in UTC so the promotion opens and closes consistently for every visitor.</p></div>
        <DealForm deal={deal} />
      </section>
    </DashboardShell>
  );
}
