"use client";

import Link from "next/link";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { PublicAppIcon, type PublicAppSummary } from "@/components/public-app-card";

const PICK_COUNT = 30;

function randomPicks(applications: PublicAppSummary[]) {
  const pool = [...applications];
  const randomValues = new Uint32Array(pool.length);
  crypto.getRandomValues(randomValues);
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = randomValues[index] % (index + 1);
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, PICK_COUNT);
}

export function ApplicationDirectory({ applications }: { applications: PublicAppSummary[] }) {
  const [visibleApplications, setVisibleApplications] = useState(() => applications.slice(0, PICK_COUNT));
  const [revision, setRevision] = useState(0);

  function surpriseMe() {
    setVisibleApplications(randomPicks(applications));
    setRevision((current) => current + 1);
  }

  return (
    <section className="home-section application-directory" id="all-apps" aria-labelledby="all-apps-title">
      <div className="directory-heading">
        <h2 id="all-apps-title">Apps worth trying.</h2>
        <button aria-label="Show 30 different applications" className="surprise-button" onClick={surpriseMe} type="button">
          Surprise me
          <Shuffle aria-hidden="true" size={17} />
        </button>
      </div>

      <div className="directory-app-grid" key={revision}>
        {visibleApplications.map((app) => (
          <Link className="directory-app-row" href={`/apps/${app.slug}`} key={app.id}>
            <PublicAppIcon app={app} size={76} />
            <span className="directory-app-copy">
              <strong>{app.name}</strong>
              <span>{app.tagline}</span>
            </span>
          </Link>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">{revision > 0 ? `Showing new application selection ${revision}.` : ""}</span>
    </section>
  );
}
