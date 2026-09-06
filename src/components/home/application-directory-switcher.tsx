"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { DirectoryAppGrid, type DirectoryApp } from "@/components/home/application-directory";

type DirectoryView = "hot" | "trending" | "latest";

export function ApplicationDirectorySwitcher({
  initialView,
  views,
}: {
  initialView: DirectoryView;
  views: Record<DirectoryView, DirectoryApp[]>;
}) {
  const [activeView, setActiveView] = useState<DirectoryView>(initialView);
  const pendingScrollPosition = useRef<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const position = pendingScrollPosition.current;
    if (!position) return;
    pendingScrollPosition.current = null;
    window.scrollTo({ ...position, behavior: "instant" });
  }, [activeView]);

  function selectView(view: DirectoryView) {
    if (view === activeView) return;
    pendingScrollPosition.current = { left: window.scrollX, top: window.scrollY };
    setActiveView(view);
    const url = new URL(window.location.href);
    if (view === "hot") url.searchParams.delete("view");
    else url.searchParams.set("view", view);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <section className="home-section application-directory" id="all-apps" aria-labelledby="all-apps-title">
      <div className="directory-heading">
        <h2 id="all-apps-title">Apps worth trying.</h2>
        <div aria-label="Application ranking" className="directory-view-tabs" role="group">
          {(["hot", "trending", "latest"] as const).map((view) => (
            <button
              aria-pressed={activeView === view}
              key={view}
              onClick={() => selectView(view)}
              type="button"
            >
              {view[0].toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div aria-live="polite" aria-atomic="false">
        <DirectoryAppGrid applications={views[activeView]} />
      </div>
    </section>
  );
}
