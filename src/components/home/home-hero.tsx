import Image from "next/image";
import Link from "next/link";
import { PublicAppIcon, mediaUrl, type PublicAppSummary } from "@/components/public-app-card";

type HomeApp = PublicAppSummary & {
  preview: { storageKey: string; altText: string | null; width: number | null; height: number | null } | null;
};

const headlineSlugs = ["swish", "mimestream", "things-3"];

export function HomeHero({ applications }: { applications: HomeApp[] }) {
  const featured = applications.find((app) => app.slug === "droppy" && app.preview)
    ?? applications.find((app) => app.preview)
    ?? applications[0];
  const headlineApps = headlineSlugs
    .map((slug) => applications.find((app) => app.slug === slug && app.icon))
    .filter((app): app is HomeApp => Boolean(app));
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <h1 id="home-title">
          <span className="sr-only">Mac apps worth making room for.</span>
          <span className="home-title-art" aria-hidden="true">
            <span className="home-title-line"><span>Mac</span>{headlineApps[0] && <span className="home-title-icon"><PublicAppIcon app={headlineApps[0]} size={96} /></span>}<span>apps</span></span>
            <span className="home-title-line"><span>worth</span>{headlineApps[1] && <span className="home-title-icon home-title-icon-orange"><PublicAppIcon app={headlineApps[1]} size={96} /></span>}<span>making</span></span>
            <span className="home-title-line">{headlineApps[2] && <span className="home-title-icon home-title-icon-yellow"><PublicAppIcon app={headlineApps[2]} size={96} /></span>}<span>room for.</span></span>
          </span>
        </h1>
        <p className="home-hero-intro">
          A curated list of the{" "}
          <span className="home-hero-intro-emphasis">
            most useful macOS applications.
            <svg aria-hidden="true" className="home-hero-intro-squiggle" focusable="false" preserveAspectRatio="none" viewBox="0 0 242 20">
              <path d="M1 10c8-8 16-8 24 0s16 6 24 0 16-7 24 0 16 8 24 0 16-6 24 0 16 7 24 0 16-8 24 0 16 6 24 0 16-7 24 0 16 8 24 0" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        </p>
      </div>

      {featured && (
        <Link className="home-feature-stage" href={`/apps/${featured.slug}`} aria-label={`View ${featured.name}`}>
          <div className="home-feature-caption">
            <PublicAppIcon app={featured} size={76} />
            <span><strong>{featured.name}</strong><p>{featured.tagline}</p></span>
          </div>
          <div className="home-feature-image">
            {featured.preview ? (
              <Image
                alt={featured.preview.altText ?? `${featured.name} preview`}
                height={featured.preview.height ?? 900}
                priority
                sizes="(max-width: 900px) 100vw, 52vw"
                src={mediaUrl(featured.preview.storageKey)}
                unoptimized
                width={featured.preview.width ?? 1600}
              />
            ) : <span>{featured.name}</span>}
          </div>
        </Link>
      )}
    </section>
  );
}
