"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { AgentSetup, ReviewAndQuestions } from "./submission-controls";
import {
  submissionGitHubUrl,
  submissionRepository,
} from "@/lib/shared/submission";

export function SubmissionPage() {
  return (
    <main className="submission-page" id="main-content">
      <header className="submission-welcome">
        <h1>
          <span className="sr-only">Your next Mac users are looking here.</span>
          <span aria-hidden="true" className="submission-title-art">
            <span>
              Your next{" "}
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 -1 22 26"
                fill="currentColor"
                className="submission-headline-icon"
              >
                <path d="M17.05 12.536c-.03-3.02 2.463-4.47 2.575-4.54-1.404-2.052-3.59-2.333-4.365-2.365-1.858-.188-3.626 1.093-4.57 1.093-.944 0-2.4-1.067-3.945-1.037-2.03.03-3.9 1.18-4.945 3-2.108 3.653-.54 9.058 1.51 12.02 1.005 1.45 2.203 3.08 3.773 3.02 1.515-.06 2.09-.98 3.923-.98 1.83 0 2.352.98 3.955.95 1.635-.03 2.67-1.475 3.67-2.93 1.155-1.68 1.632-3.31 1.66-3.395-.036-.014-3.185-1.223-3.216-4.836zM14.02 3.61c.834-1.012 1.397-2.415 1.243-3.813-1.203.05-2.66.8-3.522 1.808-.775.895-1.454 2.325-1.27 3.696 1.34.104 2.71-.68 3.55-1.692z" />
              </svg>{" "}
              users
            </span>
            <span>are looking here.</span>
          </span>
        </h1>
        <p className="submission-home-note">
          Your app could be{" "}
          <span>
            someone’s new favorite.
            <svg
              aria-hidden="true"
              viewBox="0 0 242 20"
              preserveAspectRatio="none"
            >
              <path d="M1 10c8-8 16-8 24 0s16 6 24 0 16-7 24 0 16 8 24 0 16-6 24 0 16 7 24 0 16-8 24 0 16 6 24 0 16-7 24 0 16 8 24 0" />
            </svg>
          </span>
        </p>
        <p className="submission-welcome-copy">
          Built a useful Mac app, or found one you love?
          <br />
          Help the next person discover it on Macify.
        </p>
        <div className="submission-welcome-actions">
          <a data-ui-button="" data-variant="primary" data-size="lg"
            className="submission-action submission-action--dark"
            href={submissionGitHubUrl}
            target="_blank"
            rel="noreferrer"
          >
            Submit via GitHub <ArrowUpRight size={18} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a data-ui-button="" data-variant="outline" data-size="lg"
            className="submission-action submission-action--outline"
            href="#agent-setup"
          >
            Submit with your agent <ArrowDown size={17} aria-hidden="true" />
          </a>
        </div>
        <p className="submission-review-note">Initial review in 12–48 hours.</p>
      </header>

      <section
        className="submission-agent-block"
        id="agent-setup"
        aria-labelledby="submission-agent-title"
      >
        <div className="submission-agent-copy">
          <h2 id="submission-agent-title">
            Submit with
            <br /> your agent.
          </h2>
          <p>
            Your agent can prepare a Macify listing from your app’s website.
          </p>
          <p className="submission-agent-caption">
            You approve it before it submits.
          </p>
        </div>
        <div className="submission-agent-form">
          <AgentSetup />
        </div>
      </section>
      <div className="submission-manual-note">
        <span>Prefer to prepare the listing yourself?</span>
        <a
          href={`${submissionRepository}/blob/main/CONTRIBUTING.md`}
          target="_blank"
          rel="noreferrer"
        >
          Read the submission guide{" "}
          <ArrowUpRight size={15} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      <ReviewAndQuestions />
      <section className="submission-goodbye">
        <div
          className="submission-goodbye-icons"
          aria-label="Discover Mac apps"
        >
          {[
            {
              name: "Dayflow",
              slug: "dayflow",
              src: "/submission/dayflow.png",
            },
            { name: "Droppy", slug: "droppy", src: "/submission/droppy.webp" },
            {
              name: "OpenUsage",
              slug: "openusage",
              src: "/app-icons/openusage.png",
            },
          ].map((app) => (
            <Link
              key={app.slug}
              href={`/apps/${app.slug}`}
              aria-label={`Explore ${app.name}`}
            >
              <Image unoptimized src={app.src} alt="" width={72} height={72} />
            </Link>
          ))}
        </div>
        <h2>
          A good app deserves
          <br />
          to be discovered.
        </h2>
        <p>Bring something useful to the Macify directory.</p>
        <a data-ui-button="" data-variant="primary" data-size="lg"
          className="submission-action submission-action--dark"
          href="#agent-setup"
        >
          Submit your app <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}
