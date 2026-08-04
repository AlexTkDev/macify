import { FieldError } from "@/components/form-field-error";
import { TagInput } from "@/components/tag-input";
import type { EditableApplication, FieldErrors } from "@/components/application-form-types";

export function ApplicationClassificationSection({ application, errors, tags }: {
  application?: EditableApplication;
  errors?: FieldErrors;
  tags: string[];
}) {
  return (
    <section className="form-section" aria-labelledby="classification-heading">
      <div className="form-section-copy">
        <h2 id="classification-heading">Classification</h2>
        <span>Choose up to three focused tags that describe what the application helps people do.</span>
      </div>
      <div className="form-fields">
        <div className="field field-wide">
          <span>Tags <small>Required, up to 3</small></span>
          <TagInput initialValue={application?.tagsText ?? ""} options={tags} />
          <FieldError errors={errors?.tagsText} />
        </div>
      </div>
    </section>
  );
}
