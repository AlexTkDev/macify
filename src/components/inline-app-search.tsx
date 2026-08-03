"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, Search, X } from "lucide-react";

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  iconStorageKey: string | null;
  iconAltText: string | null;
};

function iconUrl(storageKey: string) {
  return `/media/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export function InlineAppSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await fetch(`/api/apps/search?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json() as { results: SearchResult[] };
        setResults(data.results);
        setOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
        setResults([]);
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!results[0]) return;
    setOpen(false);
    router.push(`/apps/${results[0].slug}`);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function updateQuery(value: string) {
    setQuery(value);
    setOpen(true);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setFailed(false);
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div className="inline-app-search" ref={rootRef}>
      <form className="header-search-field" onSubmit={submit} role="search">
        <Search aria-hidden="true" size={15} />
        <label className="sr-only" htmlFor="header-search-input">Search Mac applications</label>
        <input
          autoComplete="off"
          id="header-search-input"
          onChange={(event) => updateQuery(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search Mac apps"
          ref={inputRef}
          type="search"
          value={query}
        />
        {loading ? <LoaderCircle aria-label="Searching" className="search-spinner" size={15} /> : query ? (
          <button aria-label="Clear search" className="search-clear" onClick={clear} type="button"><X size={14} /></button>
        ) : null}
        <button className="sr-only" type="submit">Open first result</button>
      </form>

      {showPanel && (
        <div className="inline-search-panel" role="region" aria-live="polite" aria-label="Search results">
          {failed ? <p className="inline-search-message">Search is temporarily unavailable. Please try again.</p> : loading && results.length === 0 ? (
            <p className="inline-search-message">Looking through the directory…</p>
          ) : results.length === 0 ? (
            <p className="inline-search-message">No applications found for “{query.trim()}”.</p>
          ) : (
            <>
              <div className="inline-search-summary"><span>Best matches</span><small>{results.length} found</small></div>
              <div className="inline-search-results">
                {results.map((app) => (
                  <Link href={`/apps/${app.slug}`} key={app.id} onClick={() => setOpen(false)}>
                    {app.iconStorageKey ? (
                      <Image alt={app.iconAltText ?? `${app.name} icon`} height={42} src={iconUrl(app.iconStorageKey)} unoptimized width={42} />
                    ) : <span className="inline-search-icon-fallback" aria-hidden="true">{app.name.slice(0, 2).toUpperCase()}</span>}
                    <span className="inline-search-copy"><small>{app.category}</small><strong>{app.name}</strong><span>{app.tagline}</span></span>
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
