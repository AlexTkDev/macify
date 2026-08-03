import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicAppIcon, mediaUrl, type PublicAppSummary } from "@/components/public-app-card";

type HomeApp = PublicAppSummary & {
  preview: { storageKey: string; altText: string | null } | null;
};

export function HomeHero({ applications }: { applications: HomeApp[] }) {
  const featured = applications.find((app) => app.preview) ?? applications[0];
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="eyebrow">Independent macOS directory</p>
        <h1 id="home-title">Mac apps worth making room for.</h1>
        <p className="home-hero-intro">A focused directory of useful, thoughtfully made software. Clear descriptions, honest pricing, and no filler.</p>
        <div className="home-hero-links">
          <Link href="#all-apps">See every application</Link>
        </div>
      </div>

      {featured && (
        <Link className="home-feature-stage" href={`/apps/${featured.slug}`} aria-label={`View ${featured.name}`}>
          <div className="home-feature-image">
            {featured.preview ? (
              <Image
                alt={featured.preview.altText ?? `${featured.name} preview`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 52vw"
                src={mediaUrl(featured.preview.storageKey)}
                unoptimized
              />
            ) : <span>{featured.name}</span>}
          </div>
          <div className="home-feature-caption">
            <PublicAppIcon app={featured} size={66} />
            <span><small>Featured this week</small><strong>{featured.name}</strong><p>{featured.tagline}</p></span>
            <ArrowRight size={18} />
          </div>
          <div className="home-feature-stack" aria-hidden="true">
            {applications.slice(1, 5).map((app) => <PublicAppIcon app={app} key={app.id} size={50} />)}
          </div>
        </Link>
      )}
    </section>
  );
}
