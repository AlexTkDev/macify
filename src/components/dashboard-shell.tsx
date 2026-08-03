import type { ReactNode } from "react";
import Link from "next/link";
import {
  AppWindow,
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
      <aside className="dashboard-sidebar">
        <MacifyLogo />
        <nav aria-label="Dashboard navigation">
          {navigation.map(({ id, label, icon: Icon, href }) => (
            <Link
              aria-current={active === id ? "page" : undefined}
              className={cn("dashboard-nav-link", active === id && "dashboard-nav-active")}
              href={href}
              key={id}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link className="dashboard-nav-link" href="/">
            <AppWindow size={17} /> View directory
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
