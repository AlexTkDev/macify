import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Command, Search } from "lucide-react";
import { MacifyLogo } from "@/components/macify-logo";
import { getHomepageDirectoryData } from "@/lib/apps-data";
import { formatPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const tones = ["amber", "blue", "purple", "green", "red", "graphite"] as const;

function mediaUrl(storageKey: string) {
  return `/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

function AppIcon({
  app,
  index,
  small = false,
}: {
  app: { name: string; icon: { storageKey: string; altText: string | null } | null };
  index: number;
  small?: boolean;
}) {
  const className = small ? "app-icon app-icon-small" : "app-icon";
  return app.icon ? (
    <Image
      alt={app.icon.altText ?? `${app.name} icon`}
      className={`${className} app-icon-image`}
      height={small ? 52 : 108}
      src={mediaUrl(app.icon.storageKey)}
      unoptimized
      width={small ? 52 : 108}
    />
  ) : (
    <span className={`${className} app-icon-${tones[index % tones.length]}`} aria-hidden="true">
      {app.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default async function Home() {
  const { applications, categories } = await getHomepageDirectoryData();
  const [featured, ...listedApps] = applications;

  return (
    <div className="site-shell">
      <header className="site-header">
        <MacifyLogo />
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link className="nav-link nav-link-active" href="/">Discover</Link>
          <Link className="nav-link" href="#categories">Categories</Link>
          <Link className="nav-link" href="#collections">Collections</Link>
        </nav>
        <div className="header-actions">
          <button className="command-button" type="button" aria-label="Open search">
            <Search size={16} />
            <span>Search</span>
            <kbd><Command size={11} /> K</kbd>
          </button>
          <Link className="text-action" href="/dashboard">Dashboard</Link>
        </div>
      </header>

      <main>
        <section className="discovery-hero">
          <div className="hero-copy">
            <h1>Find the Mac app that earns its place.</h1>
            <p>Useful macOS applications, carefully selected and clearly explained.</p>
          </div>
          <form className="hero-search" role="search">
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="app-search">Search Mac applications</label>
            <input id="app-search" name="q" placeholder="Search by app, task, or feature" />
            <button type="submit">Search apps</button>
          </form>
          <div className="category-rail" id="categories" aria-label="Browse categories">
            {categories.map((category) => (
              <Link href={`/categories/${category.slug}`} key={category.id}>{category.name}</Link>
            ))}
            <Link className="category-all" href="/categories">All categories <ChevronRight size={14} /></Link>
          </div>
        </section>

        <section className="catalog-section" aria-labelledby="editor-picks">
          <div className="section-heading">
            <div>
              <h2 id="editor-picks">Editor picks</h2>
              <p>Applications we keep installed and recommend without hesitation.</p>
            </div>
            <Link href="/collections/editor-picks">View collection <ArrowUpRight size={15} /></Link>
          </div>

          {featured ? (
            <div className="app-shelf">
              <article className="featured-app">
                <AppIcon app={featured} index={0} />
                <div className="featured-copy">
                  <div className="app-kicker">Latest published pick</div>
                  <h3>{featured.name}</h3>
                  <p>{featured.tagline}</p>
                  <dl className="app-facts">
                    <div><dt>Category</dt><dd>{featured.category}</dd></div>
                    <div><dt>Pricing</dt><dd>{formatPricing(featured)}</dd></div>
                    <div><dt>Platform</dt><dd>macOS</dd></div>
                  </dl>
                  <Link className="primary-action" href={`/apps/${featured.slug}`}>View {featured.name} <ArrowUpRight size={16} /></Link>
                </div>
              </article>

              <div className="app-index" role="list" aria-label="Recommended applications">
                {listedApps.map((app, index) => (
                  <Link className="app-row" href={`/apps/${app.slug}`} key={app.slug} role="listitem">
                    <AppIcon app={app} index={index + 1} small />
                    <span className="app-row-copy">
                      <strong>{app.name}</strong>
                      <span>{app.tagline}</span>
                    </span>
                    <span className="app-row-meta">
                      <span>{app.category}</span>
                      <span>{formatPricing(app)}</span>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="public-catalog-empty">
              <span aria-hidden="true">M</span>
              <h3>The first Macify picks are being prepared.</h3>
              <p>Only applications that pass the editorial and media checks appear here.</p>
              <Link className="button-secondary" href="/dashboard">Open editorial dashboard</Link>
            </div>
          )}
        </section>

        <section className="collection-band" id="collections" aria-labelledby="collection-title">
          <div>
            <p className="collection-label">Macify collection</p>
            <h2 id="collection-title">A calmer menu bar</h2>
            <p>Six small utilities for hiding clutter, finding controls, and keeping the top edge of your screen useful.</p>
          </div>
          <Link className="secondary-action" href="/collections/calm-menu-bar">Open collection <ArrowUpRight size={16} /></Link>
        </section>
      </main>

      <footer className="site-footer">
        <MacifyLogo />
        <p>Independent recommendations for people who use Macs.</p>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
