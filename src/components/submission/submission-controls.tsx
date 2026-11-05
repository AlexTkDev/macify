"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  Clipboard,
  Plus,
} from "lucide-react";
import {
  createSubmissionPrompt,
  submissionTemplateUrl,
  submissionTools,
} from "@/lib/shared/submission";

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function AgentSetup() {
  const [copyResult, setCopyResult] = useState<{
    prompt: string;
    state: "copied" | "manual";
  } | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prompt = createSubmissionPrompt("other");
  const copyState = copyResult?.prompt === prompt ? copyResult.state : "idle";

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  useEffect(() => {
    if (copyState === "manual") {
      fallbackRef.current?.focus();
      fallbackRef.current?.select();
    }
  }, [copyState]);

  async function copyInstructions() {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyResult({ prompt, state: "copied" });
      timerRef.current = setTimeout(() => setCopyResult(null), 3500);
    } catch {
      setCopyResult({ prompt, state: "manual" });
    }
  }

  return (
    <div className="submit-agent-panel">
      <div
        className="submit-agent-marks"
        role="img"
        aria-label="Works with Claude Code, Cursor, ChatGPT, and other agents"
      >
        {submissionTools.map((item) => (
          <span className="submit-agent-mark" key={item.id} aria-hidden="true">
            {item.id === "other" ? (
              <Bot size={34} strokeWidth={1.8} />
            ) : (
              <Image
                unoptimized
                src={`/submission/agents/${item.id}.svg`}
                alt=""
                width={34}
                height={34}
              />
            )}
          </span>
        ))}
      </div>
      <button data-ui-button="" data-variant="primary" data-size="lg"
        className="submit-copy-button"
        type="button"
        onClick={copyInstructions}
      >
        {copyState === "copied" ? (
          <Check size={17} aria-hidden="true" />
        ) : (
          <Clipboard size={17} aria-hidden="true" />
        )}
        {copyState === "copied" ? "Instructions copied" : "Copy instructions"}
      </button>
      <p className="submit-tool-hint">
        Paste into your agent. It will ask for your app’s website and whether
        you also have a deal to submit.
      </p>
      <span role="status" aria-live="polite" className="sr-only">
        {copyState === "copied"
          ? "Instructions copied to clipboard."
          : copyState === "manual"
            ? "Select and copy the instructions below."
            : ""}
      </span>
      {copyState === "manual" && (
        <div className="submit-copy-fallback">
          <label htmlFor="submission-copy-fallback">
            Copy the selected instructions with ⌘C or Ctrl+C.
          </label>
          <textarea
            ref={fallbackRef}
            id="submission-copy-fallback"
            readOnly
            value={prompt}
            rows={9}
          />
        </div>
      )}
      <details className="submit-full-prompt">
        <summary>
          Read the full instructions{" "}
          <ChevronDown size={15} aria-hidden="true" />
        </summary>
        <pre>{prompt}</pre>
      </details>
      <div className="submit-agent-resources">
        <a href="/submit/instructions" target="_blank" rel="noreferrer">
          Agent-readable guide <ArrowUpRight size={14} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <ExternalLink href={submissionTemplateUrl}>App template</ExternalLink>
      </div>
    </div>
  );
}

export function ReviewAndQuestions() {
  return (
    <section
      className="submit-questions"
      aria-labelledby="submit-questions-title"
    >
      <div>
        <h2 id="submit-questions-title">Before you hit send.</h2>
        <p>A little clarity on what happens next.</p>
      </div>
      <div className="submit-faq-list">
        <details open>
          <summary>
            What happens after I submit?
            <Plus size={18} aria-hidden="true" />
          </summary>
          <p>
            Expect an initial review in 12–48 hours. We may ask for corrections
            or stronger evidence. The site owner makes the final decision and
            may accept, edit, defer, or decline a submission. Publication is not
            guaranteed.
          </p>
        </details>
        <details>
          <summary>
            Do I need to be the developer?
            <Plus size={18} aria-hidden="true" />
          </summary>
          <p>
            No. You can submit an app you built or recommend one you use. Use
            official sources and accurate details either way.
          </p>
        </details>
        <details>
          <summary>
            Does submitting with an agent change the review?
            <Plus size={18} aria-hidden="true" />
          </summary>
          <p>
            No. An agent helps prepare the same application file you would
            submit yourself. The eligibility requirements and editorial review
            are the same. GitHub access is needed to open a pull request;
            without it, your agent can give you the file to submit manually.
          </p>
        </details>
        <details>
          <summary>
            Can I get a featured placement?
            <Plus size={18} aria-hidden="true" />
          </summary>
          <p>We’re still working out how featuring should work on Macify.</p>
        </details>
      </div>
    </section>
  );
}
