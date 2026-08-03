import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "@/components/public-app-card";
import type { ApplicationMedia, PublishedApplication } from "@/components/application-detail/types";
import { formatPricing } from "@/lib/pricing";

export function ApplicationHero({ application, icon }: { application: PublishedApplication; icon?: ApplicationMedia }) {
  return (
    <header className="application-hero">
      <div className="application-identity-icon">
        {icon ? <Image alt={icon.altText ?? `${application.name} icon`} className="application-icon" height={168} priority src={mediaUrl(icon.storageKey)} unoptimized width={168} /> : <span className="application-icon application-icon-fallback">{application.name.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="application-identity-copy">
        <h1>{application.name}</h1>
        <p className="application-tagline">{application.tagline}</p>
        <p className="application-price">{formatPricing(application)}</p>
        {(application.tags.length > 0 || application.sourceType === "open_source") && (
          <div className="application-tags" aria-label="Application tags">
            {application.tags.slice(0, 4).map((tag) => <span key={tag.id}>{tag.name}</span>)}
            {application.sourceType === "open_source" && <span>Open source</span>}
          </div>
        )}
        <a aria-label={`Visit ${application.name}'s official website`} className="application-website" href={application.websiteUrl} rel="noreferrer" target="_blank">
          Official website
          <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      </div>
      <div className="application-play-shapes" aria-hidden="true">
        <span className="application-shape-dot" />
        <span className="application-shape-paper" />
        <span className="application-shape-note" />
      </div>
    </header>
  );
}
