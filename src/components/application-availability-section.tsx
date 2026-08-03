import { FieldError } from "@/components/form-field-error";
import type { EditableApplication, FieldErrors } from "@/components/application-form-types";

type PricingType = "free" | "freemium" | "paid";

export function ApplicationAvailabilitySection({ application, errors, pricingType, setPricingType }: {
  application?: EditableApplication;
  errors?: FieldErrors;
  pricingType: PricingType;
  setPricingType: (value: PricingType) => void;
}) {
  return (
    <section className="form-section" aria-labelledby="availability-heading">
      <div className="form-section-copy">
        <h2 id="availability-heading">Availability</h2>
        <span>Access tier, billing method, source status, and supporting links.</span>
      </div>
      <div className="form-fields">
        <label className="field">
          <span>Pricing model</span>
          <select name="pricingType" onChange={(event) => setPricingType(event.target.value as PricingType)} value={pricingType}>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
          </select>
          <FieldError errors={errors?.pricingType} />
        </label>
        {pricingType === "free" ? <input name="billingType" type="hidden" value="" /> : (
          <label className="field">
            <span>Billing method</span>
            <select defaultValue={application?.billingType ?? ""} name="billingType" required>
              <option disabled value="">Choose billing method</option>
              <option value="one_time">One-time payment</option>
              <option value="subscription">Subscription</option>
            </select>
            <FieldError errors={errors?.billingType} />
          </label>
        )}
        <label className="field field-wide">
          <span>Pricing details <small>Optional</small></span>
          <input defaultValue={application?.pricingDetails ?? ""} name="pricingDetails" placeholder="$29 once, or free for personal use" />
          <FieldError errors={errors?.pricingDetails} />
        </label>
        <label className="choice-field field-wide">
          <input defaultChecked={application?.sourceType === "open_source"} name="sourceType" type="checkbox" value="open_source" />
          <span><strong>Open source</strong><small>Show an Open source label on the public application page. Closed-source applications show no source label.</small></span>
        </label>
        <label className="field field-wide">
          <span>YouTube demo <small>Optional</small></span>
          <input defaultValue={application?.youtubeUrl ?? ""} name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=…" type="url" />
          <small className="field-hint">Macify links to YouTube instead of loading a third-party player automatically.</small>
          <FieldError errors={errors?.youtubeUrl} />
        </label>
      </div>
    </section>
  );
}
