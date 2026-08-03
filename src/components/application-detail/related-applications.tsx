import { PublicAppCard } from "@/components/public-app-card";
import type { PublishedApplication } from "@/components/application-detail/types";

export function RelatedApplications({ applications }: { applications: PublishedApplication["related"] }) {
  if (!applications.length) return null;
  return (
    <section className="related-applications" aria-labelledby="related-applications-title">
      <div className="section-intro"><div><p className="eyebrow">Keep exploring</p><h2 id="related-applications-title">Related applications</h2></div><p>Tools that solve a similar problem or fit naturally into the same workflow.</p></div>
      <div className="app-list-grid">{applications.map((app, index) => <PublicAppCard app={app} index={index} key={app.id} />)}</div>
    </section>
  );
}
