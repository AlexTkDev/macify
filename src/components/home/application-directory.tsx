import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Shuffle } from "lucide-react";
import { mediaUrl, PublicAppIcon, type PublicAppSummary } from "@/components/public-app-card";

const REVEAL_TONES = ["blue", "orange", "yellow", "mint", "lilac"] as const;

export type DirectoryApp = PublicAppSummary & {
  preview: { storageKey: string; altText: string | null; width: number | null; height: number | null } | null;
};

function revealTone(id: string) {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return REVEAL_TONES[hash % REVEAL_TONES.length];
}

export function DirectoryAppGrid({ applications }: { applications: DirectoryApp[] }) {
  return (
    <div className="directory-app-grid">
      {applications.map((app) => (
        <Link className="directory-app-row" data-reveal-tone={revealTone(app.id)} href={`/apps/${app.slug}`} key={app.id} prefetch={false}>
          <span className="directory-app-art">
            <span className="directory-app-image">
              {app.preview ? (
                <Image
                  alt={app.preview.altText ?? `${app.name} preview`}
                  height={app.preview.height ?? 630}
                  sizes="(max-width: 608px) calc(100vw - 32px), (max-width: 832px) 46vw, (max-width: 1088px) 30vw, 22vw"
                  src={mediaUrl(app.preview.storageKey)}
                  unoptimized
                  width={app.preview.width ?? 1200}
                />
              ) : <span className="directory-app-image-fallback" aria-hidden="true">{app.name}</span>}
              <span className="directory-app-reveal" aria-hidden="true">
                <span className="directory-app-reveal-icon"><PublicAppIcon app={app} size={76} /></span>
                <span className="directory-app-reveal-action">View app <ArrowUpRight size={17} strokeWidth={2.2} /></span>
              </span>
            </span>
          </span>
          <span className="directory-app-copy">
            <strong>{app.name}</strong>
            <span>{app.tagline}</span>
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
          className="surprise-button"
          href="/surprise"
        >
          Surprise me
          <Shuffle aria-hidden="true" size={17} />
        </a>
      </div>

      <DirectoryAppGrid applications={applications} />
    </section>
  );
}
