import { cn } from "@/lib/utils";

export function DashboardNotice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const message = error || success;
  if (!message) return null;
  return (
    <div className={cn(error ? ["dashboard-notice", "dashboard-notice-error"] : "success-banner")} role={error ? "alert" : "status"}>
      <span aria-hidden="true">{error ? "!" : "✓"}</span>
      {message}
    </div>
  );
}
