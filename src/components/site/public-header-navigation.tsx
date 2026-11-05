"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MacifyLogo } from "@/components/site/macify-logo";

export function PublicHeaderNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="public-menu" ref={menuRef}>
      <div className="public-menu-content">
        <div className="public-community-links">
          <MacifyLogo compact />
        </div>
        <button className="public-menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="public-primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span /><span />
        </button>
        {menuOpen && <button className="public-menu-backdrop" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
        <nav id="public-primary-navigation" className="public-navigation" data-open={menuOpen} aria-label="Primary navigation">
          <div className="public-mobile-menu-heading">
            <MacifyLogo />
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X aria-hidden="true" /></button>
          </div>
          <Link data-ui-button="" data-variant="ghost" data-size="sm" className="public-home-link" href="/" onClick={() => setMenuOpen(false)} aria-current={pathname === "/" ? "page" : undefined}>
            <span className="public-navigation-label">Home</span>
          </Link>
          <Link data-ui-button="" data-variant="ghost" data-size="sm" className="public-deals-link" href="/deals" onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith("/deals") ? "page" : undefined}>
            <span className="public-navigation-label">Black Friday</span>
          </Link>
          <Link data-ui-button="" data-variant="ghost" data-size="sm" className="public-categories-link" href="/categories" onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith("/categories") ? "page" : undefined}>
            <span className="public-navigation-label">Categories</span>
          </Link>
          <a data-ui-button="" data-variant="ghost" data-size="sm" className="public-surprise-link" href="/surprise" onClick={() => setMenuOpen(false)} aria-current={pathname === "/surprise" ? "page" : undefined}>
            <span className="public-navigation-label">Surprise me</span>
          </a>
          <Link data-ui-button="" data-variant="primary" data-size="sm"
            className="public-submit-link"
            href="/submit"
            onClick={() => setMenuOpen(false)}
            aria-current={pathname === "/submit" ? "page" : undefined}
          >
            <span className="public-navigation-label">Submit app</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
