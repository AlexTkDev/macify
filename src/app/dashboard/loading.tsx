export default function DashboardLoading() {
  return (
    <section className="dashboard-loading" aria-busy="true" aria-label="Loading dashboard section">
      <p role="status">Loading workspace…</p>
      <div className="dashboard-loading-heading" aria-hidden="true" />
      <div className="dashboard-loading-stats" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="dashboard-loading-rows" aria-hidden="true">
        <span /><span /><span />
      </div>
    </section>
  );
}
