import Link from "next/link";
import { PublicAppIcon } from "@/components/public-app-card";
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
                <PublicAppIcon
                  app={{
                    name: application.name,
                    icon: icon ? { storageKey: icon.storageKey, altText: icon.altText } : null,
                  }}
                  decorative
                  loading="eager"
                  size={96}
                  sizes="(max-width: 38rem) 48px, 72px"
                />
              </span>
            </span>
            <span className="application-title-name">{displayName}</span>
          </span>
          <span className="application-title-tagline">{application.tagline}</span>
        </h1>
        {application.categories.length > 0 && (
          <div className="application-categories" aria-label="Application categories">
            {application.categories.map((category) => (
              <Link className="application-category" href={`/categories/${category.slug}`} key={category.id} prefetch={false}>
                {category.name}
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
