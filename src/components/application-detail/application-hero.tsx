import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/components/public-app-card";
import type { ApplicationMedia, PublishedApplication } from "@/components/application-detail/types";
import { pricingLabels } from "@/lib/pricing";

export function ApplicationHero({ application, icon }: { application: PublishedApplication; icon?: ApplicationMedia }) {
  const displayName = /[.!?]$/.test(application.name) ? application.name : `${application.name}.`;

  return (
    <header className="application-hero">
      <div className="application-identity-copy">
        <h1>
          <span className="application-title-line">
            <span className="application-title-intro">
              <span>Meet</span>
              <span className="application-title-icon">
                {icon ? <Image alt="" className="application-icon" height={112} priority src={mediaUrl(icon.storageKey)} unoptimized width={112} /> : <span className="application-icon application-icon-fallback"><span>{application.name.slice(0, 2).toUpperCase()}</span></span>}
              </span>
            </span>
            <span className="application-title-name">{displayName}</span>
          </span>
          <span className="application-title-tagline">{application.tagline}</span>
        </h1>
        {application.tags.length > 0 && (
          <div className="application-tags" aria-label="Application tags">
            {application.tags.map((tag) => (
              <Link className="application-tag" href={`/tags/${tag.slug}`} key={tag.id}>
                {tag.name}
              </Link>
            ))}
          </div>
        )}
        <div className="application-facts" aria-label="Application details">
          <span className="application-pricing-model">{pricingLabels[application.pricingType]}</span>
          {application.pricingDetails && (
            <span className="application-price">{application.pricingDetails}</span>
          )}
          {application.sourceType === "open_source" && <span className="application-source">Open source</span>}
        </div>
      </div>
    </header>
  );
}
