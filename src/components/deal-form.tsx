import { saveApplicationDeal } from "@/app/dashboard/editorial-actions";

type ApplicationOption = { id: string; name: string; slug: string };

type DealValue = {
  id: string;
  appId: string;
  appName: string;
  appSlug: string;
  discountPercent: number;
  code: string | null;
  url: string;
  startsAt: Date;
  endsAt: Date;
};

export function DealForm({ applications, deal, selectedAppId }: {
  applications?: ApplicationOption[];
  deal?: DealValue;
  selectedAppId?: string;
}) {
  return (
    <form action={saveApplicationDeal} className="deal-editor-form">
      {deal ? (
        <>
          <input name="appId" type="hidden" value={deal.appId} />
          <input name="dealId" type="hidden" value={deal.id} />
          <div className="deal-editor-app">
            <span>Application</span>
            <strong>{deal.appName}</strong>
            <small>/{deal.appSlug}</small>
          </div>
        </>
      ) : (
        <label className="deal-field deal-field-wide">
          <span>Application</span>
          <select defaultValue={selectedAppId ?? ""} name="appId" required>
            <option disabled value="">Choose a published application</option>
            {(applications ?? []).map((application) => (
              <option key={application.id} value={application.id}>{application.name} (/{application.slug})</option>
            ))}
          </select>
          <small>Only published applications without an existing deal are available.</small>
        </label>
      )}
      <div className="deal-editor-grid">
        <label className="deal-field">
          <span>Discount percentage</span>
          <div className="deal-percent-input"><input defaultValue={deal?.discountPercent ?? ""} max="100" min="1" name="discountPercent" required type="number" /><b>%</b></div>
        </label>
        <label className="deal-field">
          <span>Promotion code <small>Optional</small></span>
          <input defaultValue={deal?.code ?? ""} maxLength={80} name="code" placeholder="MACIFY20" />
        </label>
        <label className="deal-field deal-field-wide">
          <span>Deal destination</span>
          <input defaultValue={deal?.url ?? ""} name="url" placeholder="https://example.com/deal" required type="url" />
          <small>Use the exact HTTPS page where the offer can be redeemed.</small>
        </label>
        <label className="deal-field">
          <span>Starts <small>UTC</small></span>
          <input defaultValue={toUtcInput(deal?.startsAt)} name="startsAt" required type="datetime-local" />
        </label>
        <label className="deal-field">
          <span>Ends <small>UTC</small></span>
          <input defaultValue={toUtcInput(deal?.endsAt)} name="endsAt" required type="datetime-local" />
        </label>
      </div>
      <div className="deal-editor-actions">
        <button className="button-primary" type="submit">{deal ? "Save deal changes" : "Add deal to catalogue"}</button>
      </div>
    </form>
  );
}

function toUtcInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 16) : "";
}
