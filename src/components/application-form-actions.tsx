"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

function SaveButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button className="button-primary" disabled={pending} type="submit">
      <Save size={16} /> {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save draft"}
    </button>
  );
}

export function ApplicationFormActions({ mode }: { mode: "create" | "edit" }) {
  return (
    <div className="form-footer">
      <p>{mode === "edit" ? "Saving does not publish the record." : "The application and selected media will be saved together as a draft."}</p>
      <div>
        <Link className="button-secondary" href="/dashboard"><ArrowLeft size={16} /> Cancel</Link>
        <SaveButton mode={mode} />
      </div>
    </div>
  );
}
