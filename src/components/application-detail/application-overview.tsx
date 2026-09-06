import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { mediaUrl } from "@/components/public-app-card";
import type { ApplicationMedia, PublishedApplication } from "@/components/application-detail/types";

type EditorialSection = { title: string; body: string };

function normalize(value: string) {
  return value.replace(/[.!?]+$/, "").trim().toLowerCase();
}

function descriptionParts(description: string, tagline: string, applicationName: string) {
  const chunks = description.trim().split(/(?=^##\s+)/m).filter(Boolean);
  let lead = "";
  const sections: EditorialSection[] = [];

  for (const chunk of chunks) {
    const heading = chunk.match(/^##\s+(.+)$/m)?.[1]?.trim();
    const body = heading ? chunk.replace(/^##\s+.+\n*/m, "").trim() : chunk.trim();

    if (!heading) {
      if (!lead) lead = body;
      continue;
    }

    const title = normalize(heading);
    if (title === normalize(tagline)) {
      if (!lead) lead = body;
      continue;
    }

    if (title === "what it does" || title === `what ${normalize(applicationName)} does`) {
      if (!lead) lead = body;
      continue;
    }

    sections.push({ title: heading, body });
  }

  if (!lead && sections.length > 0) lead = sections.shift()?.body ?? "";
  return { lead, sections };
}

function EditorialImage({ application, media, priority = false }: { application: PublishedApplication; media: ApplicationMedia; priority?: boolean }) {
  return (
    <Image
      alt={media.altText ?? `${application.name} application preview`}
      fetchPriority={priority ? "high" : "low"}
      height={media.height ?? 900}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      quality={78}
      sizes="(max-width: 900px) 100vw, 76rem"
      src={mediaUrl(media.storageKey)}
      width={media.width ?? 1600}
    />
  );
}

export function ApplicationOverview({
  application,
  preview,
  screenshots,
}: {
  application: PublishedApplication;
  preview?: ApplicationMedia;
  screenshots: ApplicationMedia[];
}) {
  const description = descriptionParts(application.description, application.tagline, application.name);
  return (
    <div className="application-overview">
      {preview && <figure className="application-preview"><EditorialImage application={application} media={preview} priority /></figure>}
      <div className="application-body">
        <article className="application-story">
          {description.lead && <div className="application-story-lead"><MarkdownContent>{description.lead}</MarkdownContent></div>}
          {description.sections.length > 0 && (
            <div className="application-story-sections">
              {description.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  <MarkdownContent>{section.body}</MarkdownContent>
                </section>
              ))}
            </div>
          )}
          <a className="application-website" href={application.websiteUrl} rel="noreferrer" target="_blank">
            Visit website
            <ArrowUpRight aria-hidden="true" size={19} strokeWidth={1.8} />
          </a>
        </article>
        {application.youtubeUrl && <aside className="application-demo"><a href={application.youtubeUrl} rel="noreferrer" target="_blank"><span><Play size={15} /> Watch the demo</span><ArrowUpRight size={14} /></a></aside>}
      </div>
      {screenshots.length > 0 && (
        <div className="application-screenshots" aria-label={`${application.name} screenshots`}>
          {screenshots.map((screenshot) => <figure key={screenshot.id}><EditorialImage application={application} media={screenshot} /></figure>)}
        </div>
      )}
    </div>
  );
}
