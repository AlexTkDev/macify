import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
