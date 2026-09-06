import { FieldError } from "@/components/form-field-error";
import { CategoryInput } from "@/components/category-input";
import type { EditableApplication, FieldErrors } from "@/components/application-form-types";

export function ApplicationClassificationSection({ application, errors, categories }: {
  application?: EditableApplication;
  errors?: FieldErrors;
  categories: string[];
}) {
  return (
    <section className="form-section" aria-labelledby="classification-heading">
      <div className="form-section-copy">
        <h2 id="classification-heading">Classification</h2>
        <span>Choose up to 12 focused categories that describe what the application helps people do.</span>
      </div>
      <div className="form-fields">
        <div className="field field-wide">
          <span>Categories <small>Required, up to 12</small></span>
          <CategoryInput initialValue={application?.categoriesText ?? ""} options={categories} />
          <FieldError errors={errors?.categoriesText} />
        </div>
      </div>
    </section>
  );
}
