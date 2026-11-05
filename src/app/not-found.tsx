import Link from "next/link";
import { PublicShell } from "@/components/site/public-site";

export default function NotFound() {
  return (
    <PublicShell>
      <main className="not-found-page" id="main-content">
        <h1>404</h1>
        <p>Sorry, this page has gone missing.<br />Please return to the main page.</p>
        <Link data-ui-button="" data-variant="primary" data-size="md" className="site-action site-action--primary" href="/">Go home</Link>
      </main>
    </PublicShell>
  );
}
