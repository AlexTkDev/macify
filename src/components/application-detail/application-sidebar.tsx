import Link from "next/link";
import { ArrowUpRight, ChevronDown, Play, TicketPercent } from "lucide-react";
import { DealCodeButton } from "@/components/deals/deal-code-button";
import { pricingLabels } from "@/lib/shared/pricing";
import type { PublishedApplication } from "./types";

export type SidebarApplication = Pick<
  PublishedApplication,
  | "name"
  | "slug"
  | "websiteUrl"
  | "pricingType"
  | "billingType"
  | "pricingDetails"
  | "sourceType"
  | "categories"
  | "youtubeUrl"
  | "publishedAt"
>;

export function ApplicationSidebar({
  application,
  deal,
}: {
  application: SidebarApplication;
  deal?: PublishedApplication["deal"] | null;
}) {
  // Cached listing records can outlive an offer, so check its dates at render time.
  const now = new Date();
  const availableDeal =
    deal && (deal.endsAt === null || new Date(deal.endsAt) >= now)
      ? deal
      : null;
  const isUpcoming = availableDeal ? new Date(availableDeal.startsAt) > now : false;
  const formatDealDate = (value: Date | string) => new Date(value).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: "Asia/Kathmandu", timeZoneName: "short",
  });
  return (
    <aside
      className="application-sidebar"
      aria-label={`${application.name} details and links`}
    >
      {availableDeal && (
        <section
          className="application-deal"
          aria-labelledby="application-deal-title"
        >
          <div className="application-deal-heading">
            <TicketPercent size={18} aria-hidden="true" />
            <h2 id="application-deal-title">{isUpcoming ? "Upcoming deal" : "The Macify offer"}</h2>
          </div>
          <div className="application-deal-summary">
            <strong className="application-deal-discount">
              {availableDeal.discountPercent}% <span>off</span>
            </strong>
          </div>
          <div className="application-deal-redeem">
            {availableDeal.code ? (
              <>
                <p className="application-deal-instruction">
                  {isUpcoming ? "Save this code for when the offer starts" : "Copy this code for checkout"}
                </p>
                <DealCodeButton
                  code={availableDeal.code}
                  appSlug={application.slug}
                  showCopyLabel
                />
              </>
            ) : (
              <p className="application-deal-instruction">
                View the offer on the developer’s website.
              </p>
            )}
            <a data-ui-button="" data-variant="primary" data-size="lg"
              className="application-sidebar-action"
              href={availableDeal.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {isUpcoming ? "View offer" : "Purchase now"} <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <details className="application-deal-terms" open={isUpcoming}>
            <summary>
              Offer details <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <p>
              {isUpcoming ? "Starts" : "Started"}{" "}
              <time dateTime={new Date(availableDeal.startsAt).toISOString()}>{formatDealDate(availableDeal.startsAt)}</time>.
              <br />
              {availableDeal.endsAt === null ? "No scheduled end date." : <>
                Ends <time dateTime={new Date(availableDeal.endsAt).toISOString()}>{formatDealDate(availableDeal.endsAt)}</time>.
              </>}
              <br />
              {isUpcoming ? "The discount becomes available when the offer starts." : "Confirm the discount and terms before paying."}
            </p>
          </details>
          <Link className="application-deal-browse" href="/deals">
            Browse other deals <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </section>
      )}
      <section
        className="application-details"
        aria-labelledby="application-details-title"
      >
        <h2 id="application-details-title">App details</h2>
        <dl>
          <div>
            <dt>Pricing</dt>
            <dd>{pricingLabels[application.pricingType]}</dd>
          </div>
          {application.pricingDetails && (
            <div>
              <dt>Price</dt>
              <dd>{application.pricingDetails}</dd>
            </div>
          )}
          {application.billingType && (
            <div>
              <dt>Payment</dt>
              <dd>
                {application.billingType === "subscription"
                  ? "Subscription"
                  : "One-time purchase"}
              </dd>
            </div>
          )}
          <div>
            <dt>Source</dt>
            <dd>
              {application.sourceType === "open_source"
                ? "Open source"
                : "Closed source"}
            </dd>
          </div>
          {application.publishedAt && (
            <div>
              <dt>Listed</dt>
              <dd>
                <time
                  dateTime={new Date(application.publishedAt).toISOString()}
                >
                  {new Date(application.publishedAt).toLocaleDateString(
                    "en-US",
                    {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    },
                  )}
                </time>
              </dd>
            </div>
          )}
        </dl>
        <a data-ui-button="" data-variant="primary" data-size="lg"
          className="application-sidebar-action"
          href={application.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit website <ArrowUpRight size={17} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {application.youtubeUrl && (
          <a
            className="application-sidebar-text-link"
            href={application.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Play size={15} aria-hidden="true" /> Watch the demo{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </section>
      {application.categories.length > 0 && (
        <nav
          className="application-detail-categories"
          aria-label={`${application.name} categories`}
        >
          {application.categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
}
