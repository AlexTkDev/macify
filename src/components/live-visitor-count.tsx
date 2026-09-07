"use client";

import { useEffect, useState } from "react";

const realtimeVisitorsUrl = "/api/realtime-visitors";
const refreshIntervalMs = 60_000;

type RealtimeVisitorsResponse = {
  count: number;
};

export function LiveVisitorCount() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let pending = false;
    const controller = new AbortController();

    async function refreshVisitorCount() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const response = await fetch(realtimeVisitorsUrl, { credentials: "same-origin", signal: controller.signal });
        if (!response.ok) return;

        const data = await response.json() as RealtimeVisitorsResponse;
        if (active && Number.isFinite(data.count) && data.count >= 0) {
          setVisitorCount(data.count);
        }
      } catch {
        // Keep the previous value when DataFast is temporarily unavailable.
      } finally {
        pending = false;
      }
    }

    void refreshVisitorCount();
    const interval = window.setInterval(refreshVisitorCount, refreshIntervalMs);

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return (
    <span className="live-visitor-count" aria-label={visitorCount === null ? "Loading people online now" : `${visitorCount.toLocaleString()} people online now`} aria-live="polite">
      <span className="live-visitor-status" aria-hidden="true" />
      <strong>{visitorCount === null ? "–" : visitorCount.toLocaleString()}</strong>
      <span>online</span>
    </span>
  );
}
