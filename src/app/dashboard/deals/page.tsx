import Link from "next/link";
import { ArrowUpRight, CalendarClock, CheckCircle2, Percent, Plus, TimerOff } from "lucide-react";
import { removeApplicationDeal } from "@/app/dashboard/editorial-actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDealsDashboardData } from "@/lib/deals-data";

export const dynamic = "force-dynamic";

export default async function DealsPage({ searchParams }: {
  searchParams: Promise<{ saved?: string; removed?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { deals, availableApps, stats, referenceTime } = await getDealsDashboardData();
  return (
    <DashboardShell active="deals">
      <header className="editor-header editor-header-row">
        <div>
          <p>Commercial catalogue</p>
          <h1>Deals</h1>
          <span>Manage every time-bounded offer in one place. Deals stay separate from GitHub listing revisions and homepage placement.</span>
        </div>
        {availableApps.length > 0 && <Link className="button-primary" href="/dashboard/deals/new"><Plus size={16} /> Add deal</Link>}
      </header>

      <section className="catalogue-queue-stats deal-stats" aria-label="Deal catalogue status">
        <div><Percent size={18} /><span>All deals</span><strong>{stats.total}</strong></div>
        <div><CheckCircle2 size={18} /><span>Active now</span><strong>{stats.active}</strong></div>
        <div><CalendarClock size={18} /><span>Scheduled</span><strong>{stats.scheduled}</strong></div>
        <div><TimerOff size={18} /><span>Expired</span><strong>{stats.expired}</strong></div>
      </section>

      {query.saved === "1" && <div className="success-banner" role="status"><CheckCircle2 size={17} /> Deal saved.</div>}
      {query.removed === "1" && <div className="success-banner" role="status"><CheckCircle2 size={17} /> Deal removed.</div>}
      {query.error && <div className="form-error" role="alert">The deal request was invalid.</div>}

      <section className="dashboard-panel deals-catalogue" aria-labelledby="deals-heading">
        <div className="panel-toolbar">
          <div><h2 id="deals-heading">Deal catalogue</h2><p>Discount, code, destination, and availability are reviewed as one commercial record.</p></div>
        </div>
        {deals.length === 0 ? (
          <div className="dashboard-empty">
            <Percent aria-hidden="true" size={28} />
            <h3>No deals in the catalogue</h3>
            <p>Add an offer when a published application has a verified promotion.</p>
            {availableApps.length > 0 && <Link className="button-primary" href="/dashboard/deals/new">Add first deal</Link>}
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table deals-table">
              <thead><tr><th scope="col">Application</th><th scope="col">Offer</th><th scope="col">Availability</th><th scope="col">Destination</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {deals.map((deal) => {
                  const state = dealState(deal.startsAt, deal.endsAt, referenceTime);
                  return (
                    <tr key={deal.id}>
                      <td><Link className="deal-app-link" href={`/dashboard/apps/${deal.appId}`}><strong>{deal.appName}</strong><small>/{deal.appSlug}</small></Link></td>
                      <td><div className="deal-offer"><strong>{deal.discountPercent}% off</strong><span>{deal.code ? `Code ${deal.code}` : "No code required"}</span></div></td>
                      <td><div className="deal-window"><span className="deal-state" data-state={state}>{state}</span><small>{formatWindow(deal.startsAt, deal.endsAt)}</small></div></td>
                      <td><a className="deal-destination" href={deal.url} rel="noreferrer" target="_blank">Open offer <ArrowUpRight size={13} /></a></td>
                      <td><div className="deal-row-actions"><Link className="button-secondary" href={`/dashboard/deals/${deal.id}`}>Edit</Link><form action={removeApplicationDeal}><input name="appId" type="hidden" value={deal.appId} /><button className="button-secondary button-danger" type="submit">Remove</button></form></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}

function dealState(startsAt: Date, endsAt: Date, now: number) {
  return startsAt.getTime() > now ? "Scheduled" : endsAt.getTime() <= now ? "Expired" : "Active";
}

function formatWindow(startsAt: Date, endsAt: Date) {
  const format = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  return `${format.format(startsAt)} to ${format.format(endsAt)} UTC`;
}
