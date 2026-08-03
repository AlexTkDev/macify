import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "@/components/public-app-card";
import type { ApplicationMedia, PublishedApplication } from "@/components/application-detail/types";
import { formatPricing } from "@/lib/pricing";

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
        <div className="application-facts" aria-label="Application details">
          <span className="application-price">{formatPricing(application)}</span>
          {application.tags.slice(0, 4).map((tag) => <span key={tag.id}>{tag.name}</span>)}
          {application.sourceType === "open_source" && <span className="application-source">Open source</span>}
        </div>
        <a aria-label={`Visit ${application.name}'s official website`} className="application-website" href={application.websiteUrl} rel="noreferrer" target="_blank">
          Official website
          <ArrowUpRight aria-hidden="true" size={19} strokeWidth={1.8} />
        </a>
      </div>
    </header>
  );
}
