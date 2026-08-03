"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UploadCloud } from "lucide-react";
import {
  type MediaUploadState,
  uploadApplicationMedia,
} from "@/app/dashboard/actions";

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
      <label className="file-field">
        <span>Upload a local file</span>
        <input accept={accept} name="file" type="file" />
      </label>
      <div className="media-source-divider"><span>or fetch from URL</span></div>
      <label className="field media-url-field">
        <span>Public image URL</span>
        <input inputMode="url" name="mediaUrl" placeholder="https://example.com/image.png" type="url" />
        <small className="field-hint">Macify downloads a copy into R2. HTTPS only.</small>
      </label>
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
