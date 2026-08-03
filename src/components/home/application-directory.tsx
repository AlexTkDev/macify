"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Shuffle } from "lucide-react";
import { PublicAppIcon, type PublicAppSummary } from "@/components/public-app-card";
import { formatPricing } from "@/lib/pricing";

const batchSize = 30;

function randomIndex(maximum: number) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % maximum;
}

function sampleApplications(applications: PublicAppSummary[]) {
  const pool = [...applications];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1);
    [pool[index], pool[target]] = [pool[target], pool[index]];
  }
  return pool.slice(0, Math.min(batchSize, pool.length));
}

export function ApplicationDirectory({ applications }: { applications: PublicAppSummary[] }) {
  const [visible, setVisible] = useState(() => applications.slice(0, batchSize));
  const [batch, setBatch] = useState(1);

  function showNewApplications() {
    setVisible((current) => {
      const currentIds = new Set(current.map((app) => app.id));
      const unseen = applications.filter((app) => !currentIds.has(app.id));
      return sampleApplications(unseen.length >= batchSize ? unseen : applications);
    });
    setBatch((value) => value + 1);
  }

  return (
    <section className="home-section application-directory" id="all-apps" aria-labelledby="all-apps-title">
      <div className="directory-heading">
        <h2 id="all-apps-title">Apps worth trying.</h2>
        <div className="directory-heading-actions">
          <button className="button-secondary directory-shuffle" disabled={applications.length <= batchSize} onClick={showNewApplications} type="button">
            <Shuffle aria-hidden="true" size={15} /> Surprise me
          </button>
          <span className="sr-only" aria-live="polite">Application selection refreshed.</span>
        </div>
      </div>

      <div className="directory-app-grid" key={batch}>
        {visible.map((app, index) => (
          <Link className="directory-app-row" href={`/apps/${app.slug}`} key={app.id}>
            <span className="directory-app-number">{String(index + 1).padStart(2, "0")}</span>
            <PublicAppIcon app={app} size={50} />
            <span className="directory-app-copy">
              <small>{app.category ?? "Mac application"}</small>
              <strong>{app.name}</strong>
              <span>{app.tagline}</span>
            </span>
            <span className="directory-app-meta">
              <small>{formatPricing(app)}</small>
              <ArrowUpRight aria-hidden="true" size={15} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
