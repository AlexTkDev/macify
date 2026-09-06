import Link from "next/link";
import { Code2, DollarSign, Gem, Gift, MousePointer2, RefreshCw, TicketCheck, type LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { PublicAppIcon } from "@/components/public-app-card";
import type { ApplicationMedia, PublishedApplication } from "@/components/application-detail/types";
import { pricingLabels } from "@/lib/pricing";

function ApplicationFact({
  children,
  className,
  icon: Icon,
  tone,
  ...props
}: ComponentPropsWithoutRef<"span"> & {
  icon: LucideIcon;
  tone: "blue" | "green" | "orange" | "violet" | "yellow";
}) {
  return (
    <span className={`application-fact application-fact-${tone}${className ? ` ${className}` : ""}`} {...props}>
      <span className="application-fact-icon" aria-hidden="true"><Icon size={17} strokeWidth={2.2} /></span>
      <span>{children}</span>
    </span>
  );
}

export function ApplicationHero({
  application,
  icon,
  visitors,
}: {
  application: PublishedApplication;
  icon?: ApplicationMedia;
  visitors?: number | null;
}) {
  const displayName = /[.!?]$/.test(application.name) ? application.name : `${application.name}.`;
  const pricingIcon = application.pricingType === "paid" ? DollarSign : application.pricingType === "free" ? Gift : Gem;
  const billingIcon = application.billingType === "subscription" ? RefreshCw : TicketCheck;
  const formattedVisitors = visitors === undefined || visitors === null
    ? null
    : new Intl.NumberFormat("en-US", visitors >= 10_000
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { maximumFractionDigits: 0 }).format(visitors);

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
          <ApplicationFact icon={pricingIcon} tone={application.pricingType === "paid" ? "orange" : application.pricingType === "free" ? "green" : "blue"}>
            <strong>{pricingLabels[application.pricingType]}</strong>
          </ApplicationFact>
          {application.pricingDetails && (
            <ApplicationFact className="application-price" icon={billingIcon} tone="green">{application.pricingDetails}</ApplicationFact>
          )}
          {application.sourceType === "open_source" && <ApplicationFact className="application-source" icon={Code2} tone="blue">Open source</ApplicationFact>}
          {formattedVisitors && (
            <ApplicationFact
              aria-label={`${visitors?.toLocaleString("en-US")} unique visitors`}
              className="application-visitors"
              icon={MousePointer2}
              title={`${visitors?.toLocaleString("en-US")} unique visitors`}
              tone="violet"
            >
              <strong>{formattedVisitors}</strong> visits
            </ApplicationFact>
          )}
        </div>
      </div>
    </header>
  );
}
