import type { ReactNode } from "react";
import Link from "next/link";
import {
  AppWindow,
  ArrowUpRight,
  FileUp,
  Image as ImageIcon,
  LogOut,
  Shapes,
} from "lucide-react";
import { logoutAdmin } from "@/app/dashboard/logout-action";
import { MacifyLogo } from "@/components/macify-logo";
import { cn } from "@/lib/utils";

const navigation = [
  { id: "applications", label: "Applications", description: "Curate the directory", icon: AppWindow, href: "/dashboard", tone: "blue" },
  { id: "categories", label: "Categories", description: "Tune discovery", icon: Shapes, href: "/dashboard/categories", tone: "yellow" },
  { id: "media", label: "Media", description: "Manage artwork", icon: ImageIcon, href: "/dashboard/media", tone: "mint" },
  { id: "imports", label: "Imports", description: "Move data", icon: FileUp, href: "/dashboard/imports", tone: "lilac" },
] as const;

export function DashboardShell({
  active,
  children,
}: {
  active: (typeof navigation)[number]["id"];
  children: ReactNode;
}) {
  const current = navigation.find(({ id }) => id === active) ?? navigation[0];
  const CurrentIcon = current.icon;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-rail">
        <div className="dashboard-brand">
          <MacifyLogo href="/dashboard" />
          <span>Editorial</span>
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
          <span className="dashboard-environment"><i aria-hidden="true" /> Local workspace</span>
          <Link className="dashboard-site-link" href="/">Open Macify <ArrowUpRight aria-hidden="true" size={15} /></Link>
          <form action={logoutAdmin}><button className="dashboard-site-link dashboard-logout" type="submit">Sign out <LogOut aria-hidden="true" size={15} /></button></form>
        </div>
      </aside>
      <section className="dashboard-workspace">
        <header className="dashboard-workspace-bar">
          <div className="dashboard-current-section">
            <span className="dashboard-current-icon" data-tone={current.tone}><CurrentIcon aria-hidden="true" size={16} strokeWidth={1.8} /></span>
            <span><small>Macify dashboard</small><strong>{current.label}</strong></span>
          </div>
          <Link className="dashboard-site-link dashboard-site-link-mobile" href="/">Open Macify <ArrowUpRight aria-hidden="true" size={15} /></Link>
        </header>
        <main className="dashboard-main" id="main-content">{children}</main>
      </section>
    </div>
  );
}
