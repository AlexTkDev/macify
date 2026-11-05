"use client";

import { useBlackFridaySubscription } from "@/components/black-friday/subscription-state";
import { SignupForm } from "@/components/black-friday/signup-form";
import { ArrowUpRight, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const appearanceDelay = 7_000;

export function BlackFridaySheet({ icons }: { icons: { slug: string; name: string; storageKey: string }[] }) {
  const pathname = usePathname();
  const subscribed = useBlackFridaySubscription();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shownThisVisit = useRef(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    const showSuccess = () => {
      if (dialogRef.current?.open) setJustSignedUp(true);
    };
    window.addEventListener("macify:black-friday-subscription", showSuccess);
    return () => window.removeEventListener("macify:black-friday-subscription", showSuccess);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      dialogRef.current?.close();
      return;
    }
    if (subscribed || shownThisVisit.current) return;

    // Count time actually spent on the home page, rather than opening in a hidden tab.
    let timer: number | undefined;
    let remaining = appearanceDelay;
    let startedAt = 0;
    function schedule() {
      if (shownThisVisit.current) return;
      if (timer !== undefined) {
        window.clearTimeout(timer);
        remaining = Math.max(0, remaining - (Date.now() - startedAt));
        timer = undefined;
      }
      if (document.hidden) return;
      startedAt = Date.now();
      timer = window.setTimeout(() => {
        timer = undefined;
        shownThisVisit.current = true;
        dialogRef.current?.showModal();
      }, remaining);
    }
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [pathname, subscribed]);

  function dismiss() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="black-friday-sheet"
      aria-labelledby="black-friday-sheet-title"
      aria-describedby="black-friday-sheet-description"
      onCancel={(event) => { event.preventDefault(); dismiss(); }}
      onClick={(event) => { if (event.target === event.currentTarget) dismiss(); }}
    >
      <div className="black-friday-sheet-surface">
        <button data-ui-button="" data-variant="ghost" data-size="sm" data-icon-only="true" className="black-friday-sheet-close" type="button" onClick={dismiss} aria-label="Dismiss Black Friday sheet" autoFocus><X size={19} aria-hidden="true" /></button>
        <div className="black-friday-sheet-apps" aria-hidden="true">
          {icons.map((icon, index) => (
            <Image loading="eager" sizes="(max-width: 760px) 40px, 88px" key={icon.slug} className={`black-friday-sheet-app black-friday-sheet-app-${["one", "two", "three", "four", "five", "six"][index]}`} src={`/media/${icon.storageKey}`} alt="" width={index >= 4 ? 56 : index === 1 ? 76 : index === 2 ? 68 : 88} height={index >= 4 ? 56 : index === 1 ? 76 : index === 2 ? 68 : 88} />
          ))}
        </div>
        <div className="black-friday-sheet-content">
          <span className="black-friday-season">{subscribed ? <Check size={16} aria-hidden="true" /> : null} Black Friday <span>2026</span></span>
          <h2 id="black-friday-sheet-title">{subscribed ? "You’re on the list!" : <>Good apps.<br /><span>Better prices.</span></>}</h2>
          <p id="black-friday-sheet-description">{subscribed ? "Your Black Friday deal roundup is coming around November 25. We’ll see you in your inbox." : "Get a handpicked roundup of Black Friday offers on useful Mac apps, delivered to your inbox."}</p>
          {justSignedUp && <p className="black-friday-sheet-success" role="status">You’re subscribed. Watch your inbox for the roundup.</p>}
          {!subscribed && <SignupForm compact />}
        </div>
        <div className="black-friday-sheet-footer">
          <button data-ui-button="" data-variant="ghost" data-size="sm" type="button" onClick={dismiss}>{subscribed ? "Keep exploring" : "Not now"}</button>
          <Link data-ui-button="" data-variant="secondary" data-size="md" className="site-action site-action--secondary black-friday-sheet-explore" href="/deals" onClick={dismiss}>Explore deals <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </dialog>
  );
}
