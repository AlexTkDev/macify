import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DealCodeButton } from "@/components/deals/deal-code-button";
import { PublicAppIcon } from "@/components/site/public-app-card";
import type { getActiveDeals } from "@/lib/deals/deals-data";

type ActiveDeal = Awaited<ReturnType<typeof getActiveDeals>>[number];

export function DealCards({ deals }: { deals: ActiveDeal[] }) {
  return (
    <>
      {deals.map((deal) => (
          <article className="deal-card" key={deal.id}>
            <div className="deal-card-app">
              <PublicAppIcon app={deal} decorative size={60} />
              <div>
                <Link href={`/apps/${deal.slug}`} prefetch={false}>{deal.name}</Link>
                <span className="deal-card-pricing">{deal.pricingDetails}</span>
              </div>
            </div>
            <p className="deal-card-description">{deal.tagline}</p>
            <div className="deal-card-offer">
              <strong><span>{deal.discountPercent}% off</span></strong>
            </div>
            <div className="deal-card-actions">
              {deal.isUpcoming ? <Link data-ui-button="" data-variant="primary" data-size="md" className="deal-card-action site-action site-action--primary" href={`/apps/${deal.slug}`} prefetch={false}>
                View deal <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
              </Link> : <>
              {deal.code && <DealCodeButton appSlug={deal.slug} code={deal.code} />}
              <a data-ui-button="" data-variant="primary" data-size="md" aria-label={`Visit ${deal.name} site (opens in a new tab)`} className="deal-card-action site-action site-action--primary" href={deal.url} rel="noopener noreferrer" target="_blank">
                Visit site <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
              </a>
              </>}
            </div>
          </article>
        ))}
    </>
  );
}
