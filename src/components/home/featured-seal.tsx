"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { SealCheckIcon } from "@phosphor-icons/react";

export function FeaturedSeal({ appName }: { appName: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <span className="featured-seal" ref={root}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button type="button" className="featured-seal-trigger"
        aria-label={`${appName} is featured. About featured applications`}
        aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}>
        <SealCheckIcon aria-hidden="true" className="featured-seal-mark" size={21} weight="fill" />
      </button>
      {open && <span className="featured-seal-panel" id={id}>
        <span className="featured-seal-content">
          <span className="featured-seal-description">This app is featured on Macify.</span>
          <Link href="/get-featured">Feature my app now</Link>
        </span>
      </span>}
    </span>
  );
}
