import type { ReactNode } from "react";
import Link from "next/link";
import {
  AppWindow,
  ArrowUpRight,
  Image as ImageIcon,
  GitPullRequest,
  LogOut,
  TicketPercent,
} from "lucide-react";
import { logoutAdmin } from "@/app/dashboard/logout-action";
import { MacifyLogo } from "@/components/macify-logo";
import { cn } from "@/lib/utils";

const navigation = [
  { id: "applications", label: "Applications", description: "Published app listings", icon: AppWindow, href: "/dashboard", tone: "blue" },
  { id: "catalogue", label: "App queue", description: "Review application updates", icon: GitPullRequest, href: "/dashboard/catalogue", tone: "mint" },
  { id: "deals", label: "Deal queue", description: "Review deal updates", icon: TicketPercent, href: "/dashboard/deals", tone: "orange" },
  { id: "media", label: "Media", description: "Inspect synchronized artwork", icon: ImageIcon, href: "/dashboard/media", tone: "lilac" },
] as const;

export function DashboardShell({
  active,
  children,
}: {
  active: (typeof navigation)[number]["id"];
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-rail">
        <div className="dashboard-brand">
          <MacifyLogo href="/dashboard" />
          <span>Publishing</span>
        </div>
        <div className="dashboard-rail-label">Workspace</div>
        <nav className="dashboard-navigation" aria-label="Dashboard navigation">
          {navigation.map(({ id, label, description, icon: Icon, href, tone }) => (
            <Link aria-current={active === id ? "page" : undefined} className={cn("dashboard-nav-link", active === id && "dashboard-nav-active")} data-tone={tone} href={href} key={id}>
              <span className="dashboard-nav-icon"><Icon aria-hidden="true" size={17} strokeWidth={1.8} /></span>
              <span className="dashboard-nav-copy"><strong>{label}</strong><small>{description}</small></span>
            </Link>
          ))}
        </nav>
        <div className="dashboard-rail-footer">
          <span className="dashboard-environment"><i aria-hidden="true" /> Admin workspace</span>
          <Link className="dashboard-site-link" href="/">Open Macify <ArrowUpRight aria-hidden="true" size={15} /></Link>
          <form action={logoutAdmin}><button className="dashboard-site-link dashboard-logout" type="submit">Sign out <LogOut aria-hidden="true" size={15} /></button></form>
        </div>
      </aside>
      <section className="dashboard-workspace">
        <main className="dashboard-main" id="main-content">{children}</main>
      </section>
    </div>
  );
}
