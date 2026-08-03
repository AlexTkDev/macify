import type { ReactNode } from "react";
import Link from "next/link";
import {
  AppWindow,
  ArrowUpRight,
  FileUp,
  FolderKanban,
  Image as ImageIcon,
  Tags,
} from "lucide-react";
import { MacifyLogo } from "@/components/macify-logo";
import { cn } from "@/lib/utils";

const navigation = [
  { id: "applications", label: "Applications", icon: AppWindow, href: "/dashboard" },
  { id: "categories", label: "Categories", icon: FolderKanban, href: "/dashboard/categories" },
  { id: "tags", label: "Tags", icon: Tags, href: "/dashboard/tags" },
  { id: "media", label: "Media", icon: ImageIcon, href: "/dashboard/media" },
  { id: "imports", label: "Imports", icon: FileUp, href: "/dashboard/imports" },
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
      <header className="dashboard-topbar">
        <div className="dashboard-brand"><MacifyLogo /><span>Editorial desk</span></div>
        <Link className="dashboard-site-link" href="/">View directory <ArrowUpRight size={14} /></Link>
      </header>
      <nav className="dashboard-navigation" aria-label="Dashboard navigation">
        {navigation.map(({ id, label, icon: Icon, href }) => (
          <Link aria-current={active === id ? "page" : undefined} className={cn("dashboard-nav-link", active === id && "dashboard-nav-active")} href={href} key={id}>
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>
      <main className="dashboard-main" id="main-content">{children}</main>
    </div>
  );
}
