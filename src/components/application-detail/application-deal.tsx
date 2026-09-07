import { ArrowUpRight, Ticket } from "lucide-react";
import type { PublishedApplication } from "@/components/application-detail/types";
import { DealCodeButton } from "@/components/deal-code-button";

export function ApplicationDeal({ deal }: { deal: PublishedApplication["deal"] }) {
  if (!deal) return null;
  const endDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(deal.endsAt);

  return (
    <aside className="application-deal" aria-label={`${deal.discountPercent}% off offer`}>
      <span className="application-deal-icon" aria-hidden="true"><Ticket size={23} /></span>
      <div className="application-deal-copy">
        <strong>Save {deal.discountPercent}%</strong>
        <span>
          Offer scheduled through {endDate}.
        </span>
        {deal.code && <DealCodeButton code={deal.code} />}
      </div>
      <a href={deal.url} rel="noopener noreferrer" target="_blank">
        Visit site <ArrowUpRight aria-hidden="true" size={17} />
      </a>
    </aside>
  );
}
