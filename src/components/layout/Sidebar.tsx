"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  LayoutDashboard,
  ScrollText,
  Users,
  UserSquare2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

const navGroups = [
  {
    label: null,
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Manage",
    items: [
      { href: "/members", label: "Members", icon: Users },
      { href: "/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/assemblies", label: "Assemblies", icon: Building2 },
      { href: "/bulk", label: "Bulk Import", icon: FileSpreadsheet },
      { href: "/admin", label: "Admins", icon: UserSquare2 },
      { href: "/logs", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-sidebar-overlay/40 transition-ui lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(16.5rem,calc(100vw-2.5rem))] shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 3xl:w-72",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-3">
          <Link
            href="/"
            className="flex min-h-touch min-w-0 items-center gap-2.5 rounded-lg focus-visible:ring-offset-sidebar"
            onClick={onClose}
            aria-label="MWC Member Registry System — Dashboard"
          >
            <Logo
              variant="on-dark"
              alt=""
              className="h-7 w-auto max-w-[72px] shrink-0"
            />
            <span className="min-w-0 text-[11px] font-semibold leading-tight tracking-wide text-white">
              MWC Member Registry System
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label ?? "primary"}
              className={cn(groupIndex > 0 && "mt-8")}
            >
              {group.label ? (
                <p className="mb-2 px-3 text-caption font-semibold uppercase tracking-wider text-white/45">
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-touch items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-ui",
                        active
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-gold-bright"
                          aria-hidden="true"
                        />
                      ) : null}
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4 type-caption text-white/55">
          <span className="font-bold text-white/80">Mamprobi Worship Center</span>
          <br />
          <span className="italic">A Citadel of Divine Glory</span>
        </div>
      </aside>
    </>
  );
}
