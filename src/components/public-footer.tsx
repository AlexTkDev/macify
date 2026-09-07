"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MacifyLogo } from "@/components/macify-logo";

const contributionGuideUrl = "https://github.com/Beingpax/macify/blob/main/CONTRIBUTING.md";
const footerNames = [
  "Ribbon",
  "Playbill",
  "Dock",
  "Split",
  "Index",
  "Postcard",
  "Stickers",
  "Marquee",
  "Shelf",
  "Nightcap",
] as const;

function FooterNavigation() {
  return (
    <div className="footer-lab-links">
      <nav aria-label="Explore Macify">
        <p>Explore</p>
        <Link href="/">Home</Link>
        <Link href="/#all-apps">Browse apps</Link>
        <Link href="/deals">Deals</Link>
        <Link href="/categories">Categories</Link>
        <a href="/surprise">Surprise me</a>
      </nav>
      <nav aria-label="About Macify">
        <p>Macify</p>
        <Link href="/editorial-policy">Editorial policy</Link>
        <Link href="/privacy">Privacy</Link>
        <a href={contributionGuideUrl} target="_blank" rel="noreferrer">Submit an app</a>
      </nav>
    </div>
  );
}

export function PublicFooter() {
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    const fromUrl = Number(new URLSearchParams(window.location.search).get("footer"));
    const fromStorage = Number(window.localStorage.getItem("macify-footer-variant"));
    const nextVariant = [fromUrl, fromStorage].find((value) => value >= 1 && value <= 10);
    if (nextVariant) queueMicrotask(() => setVariant(nextVariant));
  }, []);

  function chooseVariant(nextVariant: number) {
    setVariant(nextVariant);
    window.localStorage.setItem("macify-footer-variant", String(nextVariant));
    const url = new URL(window.location.href);
    url.searchParams.set("footer", String(nextVariant));
    window.history.replaceState(null, "", url);
  }

  return (
    <section className="footer-lab" aria-label="Footer design variations">
      <div className="footer-lab-switcher">
        <div className="footer-lab-switcher-copy">
          <span>Footer study</span>
          <strong>{String(variant).padStart(2, "0")} · {footerNames[variant - 1]}</strong>
        </div>
        <div className="footer-lab-options" role="group" aria-label="Choose a footer design">
          {footerNames.map((name, index) => {
            const value = index + 1;
            return (
              <button
                aria-label={`Show footer ${value}: ${name}`}
                aria-pressed={variant === value}
                className={variant === value ? "is-active" : undefined}
                key={name}
                onClick={() => chooseVariant(value)}
                type="button"
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      <footer className="public-footer" data-footer-variant={variant}>
        <div className="footer-lab-decoration" aria-hidden="true">
          <span>M</span><span>⌘</span><span>★</span>
        </div>
        <div className="public-footer-panel">
          <div className="public-footer-main">
            <div className="public-footer-identity">
              <MacifyLogo />
              <p>Useful Mac applications, selected carefully and explained clearly.</p>
              <a className="footer-lab-submit" href={contributionGuideUrl} target="_blank" rel="noreferrer">
                Suggest a great Mac app <span aria-hidden="true">↗</span>
              </a>
            </div>
            <FooterNavigation />
          </div>
          <p className="public-footer-affiliate">
            Macify may earn a commission from qualifying purchases made through affiliate links on this website. <Link href="/privacy#affiliate-links">Learn about affiliate links</Link>.
          </p>
          <div className="public-footer-bottom">
            <p>© 2026 Macify. Independent, carefully maintained, and made for Mac users.</p>
            <p>Product names and artwork belong to their respective owners.</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
