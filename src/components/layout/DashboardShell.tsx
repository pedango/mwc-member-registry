"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeaderHeadingProvider } from "@/components/layout/header-context";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <HeaderHeadingProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header userName={userName} onMenuClick={() => setOpen(true)} />
            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 py-4 pb-[max(2rem,env(safe-area-inset-bottom))] xs:px-4 sm:px-5 md:px-6 md:py-5 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
            <div className="page-shell space-y-4 md:space-y-5">{children}</div>
          </main>
        </div>
      </div>
    </HeaderHeadingProvider>
  );
}
