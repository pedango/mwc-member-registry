"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useHeaderHeading } from "@/components/layout/header-context";

export function Header({
  userName,
  onMenuClick,
}: {
  userName?: string | null;
  onMenuClick?: () => void;
}) {
  const name = userName ?? "Admin";
  const heading = useHeaderHeading();

  return (
    <header className="z-30 flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/90 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md sm:min-h-16 sm:gap-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-touch min-w-touch lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {heading ? (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-tight text-primary xs:text-base sm:text-lg">
              {heading.title}
            </h1>
            {heading.description ? (
              <p className="mt-0.5 hidden truncate type-caption sm:block">
                {heading.description}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="truncate text-sm font-semibold text-primary lg:hidden">
            MWC Admin
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <ThemeToggle className="min-h-touch min-w-touch text-muted-foreground hover:text-foreground" />
        <span className="h-6 w-px bg-border" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={name} size="sm" />
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="truncate text-sm font-medium text-foreground">
              {name}
            </p>
            <p className="type-caption">Administrator</p>
          </div>
        </div>
        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
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
