import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  ExternalLink,
  Search,
  Video,
  WalletCards,
} from "lucide-react";
import { MacifyLogo } from "@/components/macify-logo";
import { getPublishedApplicationBySlug } from "@/lib/apps-data";
import { formatPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const getApplication = cache(getPublishedApplicationBySlug);

function mediaUrl(storageKey: string) {
  return `/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const application = await getApplication(slug);
  if (!application) return {};

  const canonical = `/apps/${application.slug}`;
  const title = application.seoTitle ?? application.name;
  const description = application.seoDescription ?? application.tagline;
  const images = [{ url: `${canonical}/opengraph-image`, alt: `${application.name} on Macify` }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Macify",
      title,
      description,
      url: canonical,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const application = await getApplication(slug);
  if (!application) notFound();

  const icon = application.media.find(({ role }) => role === "icon");
  const previewImage = application.media.find(({ role }) => role === "preview_image");
  const screenshots = application.media.filter(({ role }) => role === "screenshot");
  const free = application.pricingType !== "paid";
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: application.name,
    description: application.tagline,
    url: `https://macify.app/apps/${application.slug}`,
    applicationCategory: application.category?.name,
    operatingSystem: "macOS",
    image: previewImage ? `https://macify.app${mediaUrl(previewImage.storageKey)}` : undefined,
    downloadUrl: application.websiteUrl,
    isAccessibleForFree: free,
    offers: free ? { "@type": "Offer", price: "0", priceCurrency: "USD" } : undefined,
  };

  return (
    <div className="site-shell app-detail-shell">
      <header className="site-header">
        <MacifyLogo />
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link className="nav-link nav-link-active" href="/">Discover</Link>
          <Link className="nav-link" href="/#categories">Categories</Link>
          <Link className="nav-link" href="/#collections">Collections</Link>
        </nav>
        <div className="header-actions">
          <Link className="command-button" href="/?search=1">
            <Search size={16} /><span>Search apps</span>
          </Link>
        </div>
      </header>

      <main className="app-detail">
        <nav className="app-detail-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/"><ArrowLeft size={14} /> Directory</Link>
          <span>/</span>
          <span>{application.category?.name ?? "Applications"}</span>
        </nav>

        <section className="app-detail-hero">
          <div className="app-detail-identity">
            {icon ? (
              <Image
                alt={icon.altText ?? `${application.name} icon`}
                className="app-detail-icon"
                height={144}
                priority
                src={mediaUrl(icon.storageKey)}
                unoptimized
                width={144}
              />
            ) : (
              <span className="app-detail-icon app-detail-icon-fallback" aria-hidden="true">
                {application.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <p className="app-kicker">{application.category?.name ?? "macOS application"}</p>
              <h1>{application.name}</h1>
              <p className="app-detail-tagline">{application.tagline}</p>
              {application.tags.length > 0 && (
                <div className="app-detail-tags" aria-label="Tags">
                  {application.tags.map((tag) => <span key={tag.id}>{tag.name}</span>)}
                </div>
              )}
            </div>
          </div>
          <a className="button-primary app-detail-visit" href={application.websiteUrl} rel="noreferrer" target="_blank">
            Visit official website <ExternalLink size={16} />
          </a>
        </section>

        <div className="app-detail-grid">
          <article className="app-detail-content">
            {previewImage && (
              <Image
                alt={previewImage.altText ?? `${application.name} preview`}
                className="app-detail-cover"
                height={630}
                priority
                sizes="(max-width: 900px) 100vw, 760px"
                src={mediaUrl(previewImage.storageKey)}
                unoptimized
                width={1200}
              />
            )}
            <section aria-labelledby="overview-heading">
              <p className="app-detail-section-label">Overview</p>
              <h2 id="overview-heading">What {application.name} does</h2>
              <div className="app-detail-prose markdown-content">
                <ReactMarkdown
                  components={{
                    a: ({ children, ...props }) => <a {...props} rel="nofollow noopener noreferrer" target="_blank">{children}</a>,
                  }}
                  remarkPlugins={[remarkGfm]}
                  skipHtml
                >
                  {application.description}
                </ReactMarkdown>
              </div>
            </section>

            {screenshots.length > 0 && (
              <section aria-labelledby="screenshots-heading">
                <p className="app-detail-section-label">Interface</p>
                <h2 id="screenshots-heading">Screenshots</h2>
                <div className="screenshot-gallery">
                  {screenshots.map((asset) => (
                    <Image
                      alt={asset.altText ?? `${application.name} screenshot`}
                      height={720}
                      key={asset.id}
                      sizes="(max-width: 900px) 100vw, 760px"
                      src={mediaUrl(asset.storageKey)}
                      unoptimized
                      width={1280}
                    />
                  ))}
                </div>
              </section>
            )}

          </article>

          <aside className="app-detail-sidebar" aria-label="Application facts">
            <dl className="app-detail-facts">
              <div><dt><WalletCards size={15} /> Pricing</dt><dd>{formatPricing(application)}</dd></div>
              {application.sourceType === "open_source" && <div><dt><Code2 size={15} /> Source</dt><dd>Open source</dd></div>}
            </dl>
            {application.youtubeUrl && (
              <a className="source-link" href={application.youtubeUrl} rel="noreferrer" target="_blank">
                <span><Video size={15} /> Watch video on YouTube</span><ArrowUpRight size={15} />
              </a>
            )}
          </aside>
        </div>

        {application.related.length > 0 && (
          <section className="related-apps" aria-labelledby="related-heading">
            <div className="section-heading">
              <div><h2 id="related-heading">Related applications</h2><p>More tools that solve similar problems or complement this workflow.</p></div>
            </div>
            <div className="related-app-grid">
              {application.related.map((related) => (
                <Link href={`/apps/${related.slug}`} key={related.id}>
                  <span className="related-app-mark" aria-hidden="true">{related.name.slice(0, 2).toUpperCase()}</span>
                  <span><strong>{related.name}</strong><small>{related.tagline}</small></span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <MacifyLogo />
        <p>Independent recommendations for people who use Macs.</p>
        <nav aria-label="Footer navigation"><Link href="/">Directory</Link><Link href="/editorial-policy">Editorial policy</Link></nav>
      </footer>

      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
    </div>
  );
}
