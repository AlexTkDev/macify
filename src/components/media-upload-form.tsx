"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UploadCloud } from "lucide-react";
import type { MediaUploadState } from "@/app/dashboard/actions/action-types";
import { uploadApplicationMedia } from "@/app/dashboard/actions/upload-media";
import { ImageSourcePicker } from "@/components/image-source-picker";

const initialState: MediaUploadState = {};

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button-secondary media-upload-button" disabled={pending} type="submit">
      <UploadCloud size={15} /> {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

export function MediaUploadForm({
  accept,
  appId,
  description,
  label,
  role,
}: {
  accept: string;
  appId: string;
  description: string;
  label: string;
  role: "icon" | "preview_image" | "screenshot";
}) {
  const [state, action] = useActionState(uploadApplicationMedia, initialState);

  return (
    <form action={action} className="media-upload-card">
      <input name="appId" type="hidden" value={appId} />
      <input name="role" type="hidden" value={role} />
      <div>
        <h3>{label}</h3>
        <p>{description}</p>
      </div>
      <ImageSourcePicker
        accept={accept}
        fileLabel={`Choose ${label.toLowerCase()}`}
        fileName="file"
        previewAlt={`${label} preview`}
        previewShape={role === "icon" ? "icon" : "landscape"}
        urlLabel={`${label} URL`}
        urlName="mediaUrl"
        urlPlaceholder="https://example.com/image.png"
      />
      <label className="field media-alt-field">
        <span>Alt text</span>
        <input name="altText" placeholder="Describe what the media shows" />
      </label>
      <div className="media-upload-footer">
        <span className={state.success ? "upload-message upload-success" : "upload-message"} role="status">
          {state.message ?? "Choose one source · up to 10 MB"}
        </span>
        <UploadButton />
      </div>
    </form>
  );
}
