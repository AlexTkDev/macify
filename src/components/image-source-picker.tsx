"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Image as ImageIcon, Link2 } from "lucide-react";

type PreviewState = "idle" | "loading" | "ready" | "error" | "local";

export function ImageSourcePicker({
  accept,
  fileLabel,
  fileName,
  previewAlt,
  previewShape = "landscape",
  urlLabel,
  urlName,
  urlPlaceholder,
}: {
  accept: string;
  fileLabel: string;
  fileName: string;
  previewAlt: string;
  previewShape?: "icon" | "landscape";
  urlLabel: string;
  urlName: string;
  urlPlaceholder: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<PreviewState>("idle");

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function chooseFile(file: File | undefined) {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      setState("idle");
      return;
    }
    setUrl("");
    setPreviewUrl(URL.createObjectURL(file));
    setState("local");
  }

  function previewRemoteUrl() {
    const value = url.trim();
    if (!value) {
      setPreviewUrl(null);
      setState("idle");
      return;
    }
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") throw new Error("HTTPS required");
      if (fileInput.current) fileInput.current.value = "";
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setUrl(parsed.toString());
      setState("loading");
      setPreviewUrl(parsed.toString());
    } catch {
      setPreviewUrl(null);
      setState("error");
    }
  }

  const status = state === "ready" ? "URL selected. It will be copied into R2 when you save."
    : state === "local" ? "Local file selected."
      : state === "loading" ? "Loading preview…"
        : state === "error" ? "The HTTPS image could not be previewed."
          : "Choose one source.";

  return (
    <div className="image-source-picker" data-selected={state === "ready" || state === "local" ? "true" : "false"}>
      <label className="file-field">
        <span><ImageIcon size={14} /> {fileLabel}</span>
        <input accept={accept} name={fileName} onChange={(event) => chooseFile(event.target.files?.[0])} ref={fileInput} type="file" />
      </label>
      <div className="media-source-divider"><span>or</span></div>
      <label className="field media-url-field">
        <span><Link2 size={13} /> {urlLabel}</span>
        <input
          inputMode="url"
          name={urlName}
          onBlur={previewRemoteUrl}
          onChange={(event) => {
            setUrl(event.target.value);
            if (state === "ready" || state === "error") {
              setPreviewUrl(null);
              setState("idle");
            }
          }}
          placeholder={urlPlaceholder}
          type="url"
          value={url}
        />
        <small className="field-hint">Paste a direct HTTPS image URL, then click outside this field.</small>
      </label>
      {previewUrl && (
        <div className={`image-source-preview image-source-preview--${previewShape}`}>
          {/* A dynamic blob or third-party URL cannot use Next Image safely before upload. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={previewAlt}
            onError={() => setState("error")}
            onLoad={() => setState((current) => current === "loading" ? "ready" : current)}
            src={previewUrl}
          />
        </div>
      )}
      <span className={state === "error" ? "image-source-status image-source-error" : "image-source-status"} aria-live="polite">
        {(state === "ready" || state === "local") && <CheckCircle2 size={13} />} {status}
      </span>
    </div>
  );
}
