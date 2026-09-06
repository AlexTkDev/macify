import Image from "next/image";
import Link from "next/link";
import { Shuffle } from "lucide-react";
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

export function ApplicationDirectory({ applications }: { applications: DirectoryApp[] }) {
  return (
    <section className="home-section application-directory" id="all-apps" aria-labelledby="all-apps-title">
      <div className="directory-heading">
        <h2 id="all-apps-title">Apps worth trying.</h2>
        <a
          aria-label="Open a random application"
          className="surprise-button"
          href="/surprise"
        >
          <span className="surprise-button-label">Surprise me</span>
          <Shuffle aria-hidden="true" size={17} />
        </a>
      </div>

      <DirectoryAppGrid applications={applications} />
    </section>
  );
}
