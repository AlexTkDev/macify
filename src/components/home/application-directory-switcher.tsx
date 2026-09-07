import Link from "next/link";
import { DirectoryAppGrid, type DirectoryApp } from "@/components/home/application-directory";

type DirectoryView = "hot" | "trending" | "latest";

export function ApplicationDirectorySwitcher({
  initialView,
  applications,
  loading = false,
}: {
  initialView: DirectoryView;
  applications: DirectoryApp[];
  loading?: boolean;
}) {
  return (
    <section className="home-section application-directory" id="all-apps" aria-labelledby="all-apps-title">
      <div className="directory-heading">
        <h2 id="all-apps-title">Apps worth trying.</h2>
        <nav aria-label="Application ranking" className="directory-view-tabs">
          {(["hot", "trending", "latest"] as const).map((view) => (
            <Link
              aria-current={initialView === view ? "page" : undefined}
              href={view === "hot" ? "/" : `/?view=${view}`}
              key={view}
              prefetch={false}
              replace
              scroll={false}
            >
              {view[0].toUpperCase() + view.slice(1)}
            </Link>
          ))}
        </nav>
      </div>
      <div aria-live="polite" aria-atomic="false">
        {loading ? (
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
        ) : <DirectoryAppGrid applications={applications} />}
      </div>
    </section>
  );
}
