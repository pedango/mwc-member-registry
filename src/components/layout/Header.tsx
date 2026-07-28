"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";

export function Header({
  userName,
  onMenuClick,
}: {
  userName?: string | null;
  onMenuClick?: () => void;
}) {
  const name = userName ?? "Admin";

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-mwc-border bg-white px-4 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-touch min-w-touch lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* The sidebar carries the branding on desktop. */}
        <p className="truncate text-sm font-semibold text-mwc-blue lg:hidden">
          MWC Admin
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={name} size="sm" />
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="truncate text-sm font-medium text-foreground">
              {name}
            </p>
            <p className="type-caption">Administrator</p>
          </div>
        </div>
        <span className="h-6 w-px bg-mwc-border" aria-hidden="true" />
        <Button
          variant="ghost"
          size="sm"
          className="min-h-touch text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
