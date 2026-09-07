"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function GitHubStarCount() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStars() {
      try {
        const response = await fetch("https://api.github.com/repos/Beingpax/macify", {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
          credentials: "omit",
        });
        if (!response.ok) return;
        const data: { stargazers_count?: unknown } = await response.json();
        if (!controller.signal.aborted && typeof data.stargazers_count === "number"
          && Number.isSafeInteger(data.stargazers_count) && data.stargazers_count >= 0) {
          setStars(data.stargazers_count);
        }
      } catch {
        // The repository link remains available when GitHub cannot be reached.
      }
    }

    void loadStars();
    return () => controller.abort();
  }, []);

  return (
    <a
      className="public-brand-pill public-github-link"
      href="https://github.com/Beingpax/macify"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={stars === null
        ? "Macify on GitHub (opens in a new tab)"
        : `${stars.toLocaleString()} stars on GitHub (opens in a new tab)`}
    >
      <span className="live-visitor-count">
        <Star size={15} aria-hidden="true" />
        <strong>{stars === null ? "–" : stars.toLocaleString()}</strong>
      </span>
    </a>
  );
}
