import Link from "next/link";
import { PublicAppIcon } from "@/components/public-app-card";
import type { PublishedApplication } from "@/components/application-detail/types";

export function RelatedApplications({ applications }: { applications: PublishedApplication["related"] }) {
  if (!applications.length) return null;
  return (
    <section className="related-applications" aria-labelledby="related-applications-title">
      <div className="related-applications-heading"><h2 id="related-applications-title">Related apps.</h2></div>
      <div className="related-application-shelf">{applications.map((app) => (
        <Link href={`/apps/${app.slug}`} key={app.id}>
          <PublicAppIcon app={app} size={76} />
          <strong>{app.name}</strong>
        </Link>
      ))}</div>
    </section>
  );
}
