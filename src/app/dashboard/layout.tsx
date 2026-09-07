import "@/styles/dashboard-shell.css";
import "@/styles/dashboard-content.css";
import "@/styles/dashboard-media.css";
import "@/styles/dashboard-responsive.css";
import "@/styles/dashboard-variations.css";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <DashboardShell>{children}</DashboardShell>;
}
