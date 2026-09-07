import Link from "next/link";

const contributionGuideUrl = "https://github.com/Beingpax/macify/blob/main/CONTRIBUTING.md";
const githubUrl = "https://github.com/Beingpax/macify";
const primaryLinks = [["Browse apps", "/#all-apps"], ["Deals", "/deals"], ["Categories", "/categories"], ["Surprise me", "/surprise"]] as const;
const secondaryLinks = [["Home", "/"], ["Editorial policy", "/editorial-policy"], ["Privacy", "/privacy"]] as const;

export function PublicFooter() {
  return (
    <section className="footer-transition-study footer-transition-horizon">
      <div className="footer-transition-word" aria-hidden="true"><span>Macify.app</span><span>Macify.app</span><span>Macify.app</span></div>
      <footer className="public-footer curious-footer">
        <div className="curious-footer-shell">
          <div className="curious-footer-content">
            <div className="curious-footer-heading"><p>Made for</p><h2>curious<br />Mac people.</h2></div>
            <div className="curious-footer-links">
              <nav aria-label="Explore Macify"><span>Explore</span>{primaryLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
              <nav aria-label="About Macify"><span>Macify</span>{secondaryLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}<a href={contributionGuideUrl} target="_blank" rel="noreferrer">Submit an app</a></nav>
            </div>
            <a className="curious-footer-surprise application-website" href="/surprise">Find a random app</a>
          </div>
          <div className="curious-footer-bottom"><p>© 2026 Macify</p><p>Independent and made for Mac users.</p><Link href="/privacy#affiliate-links">Affiliate disclosure</Link><a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a><p>Product names and artwork belong to their respective owners.</p></div>
        </div>
      </footer>
    </section>
  );
}
