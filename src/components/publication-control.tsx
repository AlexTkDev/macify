"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import {
  setApplicationPublicationState,
  type PublicationState,
} from "@/app/dashboard/actions";

const initialState: PublicationState = {};

function PublicationButton({ published }: { published: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={published ? "button-secondary" : "button-primary"}
      disabled={pending}
      name="intent"
      type="submit"
      value={published ? "draft" : "publish"}
    >
      {published ? <EyeOff size={15} /> : <Eye size={15} />}
      {pending ? "Updating…" : published ? "Return to draft" : "Publish application"}
    </button>
  );
}

export function PublicationControl({
  appId,
  slug,
  status,
}: {
  appId: string;
  slug: string;
  status: "draft" | "published" | "archived";
}) {
  const [state, action] = useActionState(setApplicationPublicationState, initialState);
  const published = status === "published";

  return (
    <div className="publication-control">
      {published && (
        <Link className="button-secondary" href={`/apps/${slug}`} target="_blank">
          View public page <ArrowUpRight size={15} />
        </Link>
      )}
      <form action={action}>
        <input name="appId" type="hidden" value={appId} />
        <PublicationButton published={published} />
      </form>
      {state.message && <p role="alert">{state.message}</p>}
    </div>
  );
}
