"use client";

import { useEffect, useState } from "react";

const realtimeVisitorsUrl = "https://datafa.st/api/widgets/6a7998cb222be2211b1b87b6/realtime-visitors";
const refreshIntervalMs = 60_000;

type RealtimeVisitorsResponse = {
  count: number;
};

export function LiveVisitorCount() {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function refreshVisitorCount() {
      try {
        const response = await fetch(realtimeVisitorsUrl, { cache: "no-store" });
        if (!response.ok) return;

        const data = await response.json() as RealtimeVisitorsResponse;
        if (active && Number.isFinite(data.count) && data.count >= 0) {
          setVisitorCount(data.count);
        }
      } catch {
        // Keep the previous value when DataFast is temporarily unavailable.
      }
    }

    void refreshVisitorCount();
    const interval = window.setInterval(refreshVisitorCount, refreshIntervalMs);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <span className="live-visitor-count" aria-label={`${visitorCount.toLocaleString()} people online now`} aria-live="polite">
      <span className="live-visitor-status" aria-hidden="true" />
      <strong>{visitorCount.toLocaleString()}</strong>
      <span>online</span>
    </span>
  );
}
