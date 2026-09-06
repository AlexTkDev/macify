import Image from "next/image";
import Link from "next/link";
import { mediaUrl, PublicAppIcon, type PublicAppSummary } from "@/components/public-app-card";

export type DirectoryApp = PublicAppSummary & {
  preview: { storageKey: string; altText: string | null; width: number | null; height: number | null } | null;
};

export function DirectoryAppGrid({ applications }: { applications: DirectoryApp[] }) {
  return (
    <div className="directory-app-grid">
      {applications.map((app) => (
        <Link className="directory-app-row" href={`/apps/${app.slug}`} key={app.id} prefetch={false}>
          <span className="directory-app-preview">
            {app.preview ? (
              <Image
                alt={app.preview.altText ?? `${app.name} preview`}
                fetchPriority="low"
                height={app.preview.height ?? 630}
                loading="lazy"
                quality={78}
                sizes="(max-width: 608px) calc(100vw - 32px), (max-width: 832px) 46vw, 30vw"
                src={mediaUrl(app.preview.storageKey)}
                width={app.preview.width ?? 1200}
              />
            ) : (
              <span className="directory-app-preview-fallback">
                <PublicAppIcon app={app} decorative size={96} />
              </span>
            )}
          </span>
          <span className="directory-app-identity">
            <span className="directory-app-identity-icon">
              <PublicAppIcon app={app} decorative size={60} />
            </span>
            <span className="directory-app-copy">
              <strong>{app.name}</strong>
              <span>{app.tagline}</span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function ApplicationDirectory({
  applications,
  heading = "Apps worth trying.",
  id = "all-apps",
  activeView,
}: {
  applications: DirectoryApp[];
  heading?: string;
  id?: string;
  activeView?: "hot" | "trending" | "latest";
}) {
  const titleId = `${id}-title`;
  return (
    <section className="home-section application-directory" id={id} aria-labelledby={titleId}>
      <div className="directory-heading">
        <h2 id={titleId}>{heading}</h2>
        {activeView && <nav aria-label="Application ranking" className="directory-view-tabs">
          {(["hot", "trending", "latest"] as const).map((view) => (
            <Link aria-current={activeView === view ? "page" : undefined} href={`/?view=${view}#${id}`} key={view} scroll>
              {view[0].toUpperCase() + view.slice(1)}
            </Link>
          ))}
        </nav>}
      </div>

      <DirectoryAppGrid applications={applications} />
    </section>
  );
}
