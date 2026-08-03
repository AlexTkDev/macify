import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "@/components/public-app-card";
import type { ApplicationMedia, PublishedApplication } from "@/components/application-detail/types";

export function ApplicationHero({
  application,
  icon,
  preview,
}: {
  application: PublishedApplication;
  icon?: ApplicationMedia;
  preview?: ApplicationMedia;
}) {
  return (
    <section className="application-hero">
      <div className="application-hero-copy">
        <div className="application-title-row">
          {icon ? <Image alt={icon.altText ?? `${application.name} icon`} className="application-icon" height={112} priority src={mediaUrl(icon.storageKey)} unoptimized width={112} /> : <span className="application-icon application-icon-fallback">{application.name.slice(0, 2).toUpperCase()}</span>}
          <div><p className="eyebrow">macOS application</p><h1>{application.name}</h1></div>
        </div>
        <p className="application-tagline">{application.tagline}</p>
        {application.tags.length > 0 && <div className="application-tags" aria-label="Application tags">{application.tags.slice(0, 4).map((tag) => <span key={tag.id}>{tag.name}</span>)}</div>}
        <a className="primary-button application-website" href={application.websiteUrl} rel="noreferrer" target="_blank">Visit official website <ArrowUpRight size={15} /></a>
      </div>
      <div className="application-preview">
        {preview ? <Image alt={preview.altText ?? `${application.name} preview`} fill priority sizes="(max-width: 900px) 100vw, 52vw" src={mediaUrl(preview.storageKey)} unoptimized /> : <span>{application.name}</span>}
      </div>
    </section>
  );
}
