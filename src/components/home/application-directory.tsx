import Image from "next/image";
import { FeaturedSeal } from "@/components/home/featured-seal";
import Link from "next/link";
import { mediaUrl, PublicAppIcon, type PublicAppSummary } from "@/components/public-app-card";

export type DirectoryApp = PublicAppSummary & {
  preview: { storageKey: string; altText: string | null; width: number | null; height: number | null } | null;
};

export function DirectoryAppGrid({ applications }: { applications: DirectoryApp[] }) {
  return (
    <div className="directory-app-grid">
      {applications.map((app) => (
        <article className="directory-app-row" key={app.id}>
          <span className="directory-app-preview">
            {app.preview ? (
              <Image
                alt={app.preview.altText ?? `${app.name} preview`}
                fetchPriority="low"
                height={app.preview.height ?? 630}
                loading="lazy"
                quality={78}
                sizes="(max-width: 38rem) calc(100vw - 2rem), (max-width: 52rem) calc((100vw - clamp(4rem, 6.4vw, 6rem) - 2.25rem) / 2), (max-width: 68rem) calc((100vw - clamp(4rem, 6.4vw, 6rem) - 4.5rem) / 3), min(calc((100vw - clamp(4rem, 6.4vw, 6rem) - 6rem) / 3), 23.34rem)"
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
              <span className="directory-app-name">
                <Link className="directory-app-link" href={`/apps/${app.slug}`} prefetch={false}><strong>{app.name}</strong></Link>
                {app.isFeatured && <FeaturedSeal appName={app.name} />}
              </span>
              <span>{app.tagline}</span>
            </span>
          </span>
        </article>
      ))}
    </div>
  );
}
