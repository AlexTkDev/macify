import { TicketPercent } from "lucide-react";
import { SignupForm } from "@/components/black-friday/signup-form";

export function DealSignupCard() {
  return (
    <article className="deal-card deal-card--coming">
      <div className="deal-card-app">
        <span aria-hidden="true" className="deal-card-coming-icon"><TicketPercent size={30} /></span>
        <div>
          <h3>More deals are coming soon.</h3>
          <span>New offers will appear here soon</span>
        </div>
      </div>
      <p className="deal-card-description">We’re working with Mac app developers on more discounts for Macify readers.</p>
      <SignupForm variant="card" />
    </article>
  );
}
