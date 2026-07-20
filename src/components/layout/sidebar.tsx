"use client";

import { useState } from "react";
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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:hidden">
        <p className="truncate font-medium">{profileName}</p>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 -translate-x-full flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Profil</p>
            <p className="truncate font-medium">{profileName}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
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
                onClick={closeMobile}
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
            onClick={closeMobile}
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
            onClick={closeMobile}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Changer de profil
          </Link>
        </div>
      </aside>
    </>
  );
}
