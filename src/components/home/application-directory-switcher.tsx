"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import type { MouseEvent } from "react";
import { DirectoryAppGrid, type DirectoryApp } from "@/components/home/application-directory";

type DirectoryView = "hot" | "trending" | "latest";

const directoryViews: Array<{ label: string; view: DirectoryView }> = [
  { label: "Hot", view: "hot" },
  { label: "Trending", view: "trending" },
  { label: "Latest", view: "latest" },
];

function DirectoryViewIcon({ view }: { view: DirectoryView }) {
  if (view === "hot") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path className="directory-flame-outer" d="M12.75 1.65c.42 2.65-.83 4.24-2.1 5.85C9.4 9.08 8.12 10.7 8.12 13c0 .68.13 1.33.38 1.92.35-1.42 1.18-2.52 2.38-3.34.3-.2.71-.04.8.3.35 1.28 1.02 2.25 2.02 2.93.72-1.07 1.06-2.36.95-3.85 1.84 1.45 3.1 3.65 3.1 6.04A5.75 5.75 0 0 1 12 22.75 7.75 7.75 0 0 1 4.25 15c0-4.76 2.82-8.8 7.72-13.7.27-.27.72-.03.78.35Z" />
        <path className="directory-flame-inner" d="M12.05 14.02c.2.94.69 1.7 1.48 2.27.55-.49.97-1.13 1.22-1.91.52.7.82 1.57.82 2.5A3.56 3.56 0 0 1 12 20.44a3.56 3.56 0 0 1-3.57-3.56c0-1.5.79-2.78 2.47-4.16.34-.28.85-.06.91.38.04.31.12.62.24.92Z" />
      </svg>
    );
  }

  if (view === "trending") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path className="directory-trend-arrow" d="M19.25 3.5H14v2.75h2.07l-4.92 4.92-3.6-3.6-4.92 4.92 1.94 1.94 2.98-2.98 3.6 3.6 6.1-6.1V11h2.75V4.25a.75.75 0 0 0-.75-.75Z" />
        <path className="directory-trend-bar directory-trend-bar-low" d="M3 17h3v4H3z" />
        <path className="directory-trend-bar directory-trend-bar-mid" d="M8 16h3v5H8z" />
        <path className="directory-trend-bar directory-trend-bar-high" d="M13 14h3v7h-3z" />
        <path className="directory-trend-bar directory-trend-bar-peak" d="M18 13h3v8h-3z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm1.15 4.25h-2.3v6.18l4.47 2.58 1.15-1.99-3.32-1.91V6.5Z" clipRule="evenodd" />
    </svg>
  );
}

export function ApplicationDirectorySwitcher({
  initialView,
  applications,
  loading = false,
}: {
  initialView: DirectoryView;
  applications: DirectoryApp[];
  loading?: boolean;
}) {
  const router = useRouter();
  const [selectedView, setSelectedView] = useOptimistic(initialView);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [search, setSearch] = useState<{
    query: string;
    page: number;
    applications: DirectoryApp[];
    total: number;
    pageSize: number;
    failed: boolean;
  } | null>(null);
  const term = query.trim();
  const searching = Boolean(term);
  const waiting = searching && (!search || search.query !== term || search.page !== page);
  const failed = !waiting && searching && search?.failed;
  const visibleApplications = searching ? search?.applications ?? [] : applications;

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    setQuery("");
    setPage(1);
    setSearch(null);
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/apps/search?q=${encodeURIComponent(term)}&page=${page}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json() as { applications: DirectoryApp[]; total: number; pageSize: number };
        if (!controller.signal.aborted) setSearch({ ...data, query: term, page, failed: false });
      } catch {
        if (!controller.signal.aborted) setSearch({ query: term, page, applications: [], total: 0, pageSize: 24, failed: true });
      }
    }, 180);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [term, page, retry]);

  function clearSearch() {
    setQuery("");
    setPage(1);
    setSearch(null);
    inputRef.current?.focus();
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    sectionRef.current?.scrollIntoView({ block: "start" });
  }

  useEffect(() => {
    if (loading) return;
    const timeout = window.setTimeout(() => {
      for (const { view } of directoryViews) {
        if (view !== initialView) router.prefetch(view === "hot" ? "/" : `/?view=${view}`);
      }
    }, 1_000);
    return () => window.clearTimeout(timeout);
  }, [initialView, loading, router]);

  function selectView(event: MouseEvent<HTMLAnchorElement>, view: DirectoryView) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (view === selectedView && !isPending) return;
    startTransition(() => {
      setSelectedView(view);
      router.replace(view === "hot" ? "/" : `/?view=${view}`, { scroll: false });
    });
  }

  return (
    <section className="home-section application-directory" id="all-apps" aria-labelledby="all-apps-title" ref={sectionRef}>
      <div className="directory-heading" data-search-open={searchOpen ? "true" : undefined}>
        <h2 id="all-apps-title">Apps worth trying.</h2>
        <div className="directory-controls">
          {!searching && <nav aria-label="Application ranking" className="directory-view-tabs">
            {directoryViews.map(({ label, view }) => {
              const isActive = selectedView === view;

              return (
                <Link data-ui-button="" data-variant="ghost" data-size="compact"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${label} applications${isActive ? ", selected" : ""}`}
                  data-view={view}
                  href={view === "hot" ? "/" : `/?view=${view}`}
                  key={view}
                  onClick={(event) => selectView(event, view)}
                  prefetch
                >
                  <span aria-hidden="true" className="directory-view-icon">
                    <DirectoryViewIcon view={view} />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>}
          <form className="directory-search" data-open={searchOpen ? "true" : undefined} role="search" aria-label="Search the app directory" onSubmit={(event) => event.preventDefault()}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !term) setSearchOpen(false); }}>
            <label className="sr-only" htmlFor="directory-search-input">Search Mac apps</label>
            <input
              hidden={!searchOpen}
              id="directory-search-input"
              type="search"
              autoComplete="off"
              maxLength={80}
              placeholder="Search Mac apps"
              aria-controls="directory-results"
              ref={inputRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeSearch(); } }}
            />
            <button data-ui-button="" data-variant="ghost" data-size="compact" data-icon-only="true" type="button" ref={searchButtonRef} aria-label={searchOpen ? "Close search" : "Search Mac apps"} aria-expanded={searchOpen} aria-controls="directory-search-input" onClick={() => { if (searchOpen) closeSearch(); else setSearchOpen(true); }}>
              {searchOpen ? <X size={16} aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
            </button>
          </form>
        </div>
      </div>
      <div id="directory-results" aria-busy={loading || isPending || waiting} data-pending={isPending ? "true" : undefined}>
        <p className={searching && (waiting || (!failed && visibleApplications.length > 0)) ? "directory-search-status" : "sr-only"} role="status">
          {searching ? waiting ? "Searching the app directory…" : failed ? "Search is temporarily unavailable." : visibleApplications.length === 0 ? `No matches for “${term}”.` : `${search?.total ?? 0} ${(search?.total ?? 0) === 1 ? "app" : "apps"} found for “${term}”.` : ""}
        </p>
        {isPending && <p className="sr-only" role="status">Updating applications…</p>}
        {loading || waiting ? (
          <div aria-busy="true">
            <p className="sr-only" role="status">Loading applications…</p>
            <div className="directory-app-grid" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index}>
                  <span className="directory-app-preview directory-loading-preview" />
                  <span className="directory-loading-identity" />
                </div>
              ))}
            </div>
          </div>
        ) : failed ? (
          <button data-ui-button="" data-variant="secondary" data-size="md" className="button-secondary" type="button" onClick={() => { setSearch(null); setRetry((value) => value + 1); }}>Try search again</button>
        ) : searching && visibleApplications.length === 0 ? (
          <div className="directory-search-empty">
            <span className="directory-search-empty-icon" aria-hidden="true"><Search size={26} /></span>
            <h3>No matches for <span>“{term}”</span></h3>
            <p>Try a shorter name or search by what you need, like screenshots, notes, or window management.</p>
            <div className="directory-search-suggestions" aria-label="Suggested searches">
              {["Screenshots", "Notes", "Window management"].map((suggestion) => <button data-ui-button="" data-variant="outline" data-size="sm" type="button" key={suggestion} onClick={() => { setQuery(suggestion); setPage(1); inputRef.current?.focus(); }}>{suggestion}</button>)}
            </div>
            <button data-ui-button="" data-variant="secondary" data-size="md" className="button-secondary" type="button" onClick={clearSearch}>Clear search and browse apps</button>
          </div>
        ) : <DirectoryAppGrid applications={visibleApplications} />}
        {searching && !waiting && !failed && search && search.total > search.pageSize && (
          <nav className="directory-search-pagination" aria-label="Search result pages">
            <button data-ui-button="" data-variant="secondary" data-size="md" className="button-secondary" type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button>
            <span>Page {page} of {Math.ceil(search.total / search.pageSize)}</span>
            <button data-ui-button="" data-variant="secondary" data-size="md" className="button-secondary" type="button" disabled={page * search.pageSize >= search.total} onClick={() => changePage(page + 1)}>Next</button>
          </nav>
        )}
      </div>
    </section>
  );
}
