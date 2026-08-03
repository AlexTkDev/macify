import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/public-site";

export default function NotFound() {
  return (
    <PublicShell>
      <main className="not-found-page" id="main-content">
        <p className="not-found-code">404</p>
        <p className="eyebrow">Page not found</p>
        <h1>This app has left the Dock.</h1>
        <p>The address may have changed, or the page may no longer be part of Macify.</p>
        <div><Link className="primary-button" href="/"><ArrowLeft size={15} /> Return home</Link></div>
      </main>
    </PublicShell>
  );
}
