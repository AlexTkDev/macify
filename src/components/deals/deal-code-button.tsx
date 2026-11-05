"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackDataFastGoal } from "@/lib/analytics/datafast-client";

export function DealCodeButton({
  code,
  appSlug,
  showCopyLabel = false,
}: {
  code: string;
  appSlug: string;
  showCopyLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    trackDataFastGoal("deal_code_copied", { app_slug: appSlug });
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button data-ui-button="" data-variant="outline" data-size="md" data-layout="coupon"
      aria-label={copied ? `${code} copied` : `Copy deal code ${code}`}
      className="deal-code-button site-action"
      data-copied={copied}
      onClick={copyCode}
      type="button"
    >
      <span className="deal-code-value">
        <code>{code}</code>
        <span className="deal-code-copy-label">
          <Copy aria-hidden="true" size={15} />
          {showCopyLabel && "Copy"}
        </span>
      </span>
      <span className="deal-code-confirmation" aria-hidden={!copied}>
        <Check aria-hidden="true" size={15} /> Copied
      </span>
    </button>
  );
}
