"use client";

import { useActionState, useState } from "react";
import type { ApplicationFormState } from "@/app/dashboard/actions/action-types";
import { createApplication } from "@/app/dashboard/actions/create-application";
import { updateApplication } from "@/app/dashboard/actions/update-application";
import { ApplicationAvailabilitySection } from "@/components/application-availability-section";
import { ApplicationClassificationSection } from "@/components/application-classification-section";
import { ApplicationFormActions } from "@/components/application-form-actions";
import type { CategoryOption, EditableApplication, RelatedApplicationOption } from "@/components/application-form-types";
import { ApplicationIdentitySection } from "@/components/application-identity-section";
import { ApplicationMediaSection } from "@/components/application-media-section";
import { ApplicationRelationshipsSection } from "@/components/application-relationships-section";

const initialState: ApplicationFormState = {};

export function ApplicationForm({
  application,
  categories,
  relatedApplications,
  tags,
  mode = "create",
}: {
  application?: EditableApplication;
  categories: CategoryOption[];
  relatedApplications: RelatedApplicationOption[];
  tags: string[];
  mode?: "create" | "edit";
}) {
  const formAction = mode === "edit" ? updateApplication : createApplication;
  const [state, action] = useActionState(formAction, initialState);
  const [name, setName] = useState(application?.name ?? "");
  const [slug, setSlug] = useState(application?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [pricingType, setPricingType] = useState<"free" | "freemium" | "paid">(application?.pricingType ?? "free");

  return (
    <form action={action} className="editor-form">
      {application && <input name="appId" type="hidden" value={application.id} />}
      {state.message && (
        <div className="form-alert" role="alert">
          <span aria-hidden="true">!</span>
          <div><strong>{mode === "edit" ? "Changes not saved" : "Application not saved"}</strong><p>{state.message}</p></div>
        </div>
      )}
      <ApplicationIdentitySection
        application={application}
        errors={state.errors}
        name={name}
        setName={setName}
        setSlug={setSlug}
        setSlugEdited={setSlugEdited}
        slug={slug}
        slugEdited={slugEdited}
      />
      {mode === "create" && <ApplicationMediaSection errors={state.errors} />}
      <ApplicationClassificationSection application={application} categories={categories} errors={state.errors} tags={tags} />
      <ApplicationAvailabilitySection application={application} errors={state.errors} pricingType={pricingType} setPricingType={setPricingType} />
      <ApplicationRelationshipsSection application={application} errors={state.errors} relatedApplications={relatedApplications} />
      <ApplicationFormActions mode={mode} />
    </form>
  );
}
