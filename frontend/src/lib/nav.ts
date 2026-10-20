import { LayoutDashboard, NotebookPen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

/**
 * Navigation registry — the single place to add or remove sidebar entries.
 * AppSidebar renders from this list.
 */
export const appNav: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Notes", href: "/notes", icon: NotebookPen },
];

export const resourceNav: NavItem[] = [
  {
    title: "Loco docs",
    href: "https://loco.rs/docs",
    icon: NotebookPen,
    external: true,
  },
];
