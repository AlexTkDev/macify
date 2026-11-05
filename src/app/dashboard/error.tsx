"use client";

import Link from "next/link";

export default function DashboardError({ error, retry }: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <section className="dashboard-panel" role="alert">
    <h1>The dashboard could not complete this request</h1>
    <p>Reload the current state before repeating a publishing or review action. Some changes may already have been saved.</p>
    {error.digest && <p>Error reference: {error.digest}</p>}
    <button data-ui-button="" data-variant="primary" data-size="md" className="button-primary" onClick={() => retry()} type="button">Reload dashboard</button>
    <Link data-ui-button="" data-variant="secondary" data-size="md" className="button-secondary" href="/dashboard">Back to dashboard</Link>
  </section>;
}
