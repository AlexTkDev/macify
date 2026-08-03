import Link from "next/link";
import { ArrowUpRight, Code2, Play, ReceiptText } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import type { PublishedApplication } from "@/components/application-detail/types";
import { formatPricing } from "@/lib/pricing";

export function ApplicationOverview({ application }: { application: PublishedApplication }) {
  return (
    <div className="application-body">
      <article className="application-description">
        <p className="eyebrow">About the application</p>
        <MarkdownContent>{application.description}</MarkdownContent>
      </article>
      <aside className="application-facts" aria-label="Application details">
        <section>
          <div className="application-fact-label"><ReceiptText size={15} /> Pricing</div>
          <strong>{formatPricing(application)}</strong>
        </section>
        {application.sourceType === "open_source" && <section><div className="application-fact-label"><Code2 size={15} /> Source</div><strong>Open source</strong></section>}
        {application.youtubeUrl && <a href={application.youtubeUrl} rel="noreferrer" target="_blank"><span><Play size={15} /> Watch the demo</span><ArrowUpRight size={14} /></a>}
        <Link href="/editorial-policy"><span>How Macify reviews listings</span><ArrowUpRight size={14} /></Link>
      </aside>
    </div>
  );
}
