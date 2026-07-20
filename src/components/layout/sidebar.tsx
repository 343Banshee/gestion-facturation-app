"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  Landmark,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "clients", label: "Clients", icon: Users },
  { href: "catalogue", label: "Catalogue", icon: Package },
  { href: "devis", label: "Devis", icon: FileText },
  { href: "factures", label: "Factures", icon: Receipt },
  { href: "urssaf", label: "URSSAF", icon: Landmark },
];

export function Sidebar({
  profileSlug,
  profileName,
}: {
  profileSlug: string;
  profileName: string;
}) {
  const pathname = usePathname();
  const base = `/p/${profileSlug}`;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Profil</p>
        <p className="truncate font-medium">{profileName}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const href = `${base}/${item.href}`;
          const active = pathname.startsWith(href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t px-3 py-3">
        <Link
          href={`${base}/parametres`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith(`${base}/parametres`)
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Changer de profil
        </Link>
      </div>
    </aside>
  );
}
